// Copyright (C) 2015, 2016 Tracktunes Inc

import {Page, NavController, Platform, Modal, Alert} from 'ionic-angular';
import {LocalDB, TreeNode, ParentChild, DB_NO_KEY, DB_KEY_PATH}
from '../../providers/local-db/local-db';
import {AppState, ROOT_FOLDER_NAME} from '../../providers/app-state/app-state';
import {AddFolderPage} from '../add-folder/add-folder';
import {prependArray} from '../../providers/utils/utils';


@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    private folderPath: string = '';
    private folderNode: TreeNode = null;
    private folderItems: { [id: string]: TreeNode; } = {};
    private checkedNodes: { [id: string]: boolean; } = {};

    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;

    private totalSelectedCounter: number = 0;

    constructor(
        private navController: NavController,
        private platform: Platform) {
        console.log('constructor():LibraryPage');
    }

    // onPageWillEnter
    // Ionic Life Cycle Hooks:
    // https://webcake.co/page-lifecycle-hooks-in-ionic-2/
    ngOnInit() {
        console.warn('on page will enter --------------------');
        // switch folders, via AppState
        this.appState.getLastViewedFolderKey().subscribe(
            (lastViewedFolderKey: number) => {
                console.log('lib page entered, to: ' + lastViewedFolderKey);
                // this is it!  here's where we enter the last viewed folder
                this.switchFolder(lastViewedFolderKey, false);
                this.appState.getProperty('checkedNodes').subscribe(
                    (checkedNodes: { [id: string]: boolean }) => {
                        this.checkedNodes = checkedNodes;
                        if (!checkedNodes) {
                            alert('no checked nodes! ' + checkedNodes);
                        }
                    },
                    (error: any) => {
                        alert('in getProperty: ' + error);
                    }
                ); // getProperty().subscribe(
            },
            (error: any) => {
                alert('in getProperty: ' + error);
            }
        ); // getProperty().subscbribe(
    }

    onClickUpButton() {

    }

    onClickDownButton() {

    }

    askAndDo(
        question: string,
        yesButtonText: string,
        yesAction: () => void,
        noButtonText?: string,
        noAction?: () => void) {
        let alert = Alert.create();
        alert.setTitle(question);
        alert.addButton('Cancel');
        if (noButtonText && noAction) {
            alert.addButton({
                text: noButtonText,
                handler: data => {
                    noAction();
                }
            });
        }
        alert.addButton({
            text: yesButtonText,
            handler: data => {
                yesAction();
            }
        });
        this.navController.present(alert).then();
    }

    unselectItemsNotInThisFolder() {
        console.log('unselectItemsNotInThisFolder()');
    }

    onClickMoveButton() {

    }

    nCheckedNodes() {
        return Object.keys(this.checkedNodes).length;
    }

    checkedNodesInThisFolder() {
        let key: string, i: number, nodeKeys: string[] = [],
            keys = Object.keys(this.checkedNodes);
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (this.folderItems[key]) {
                nodeKeys.push(key);
            }
        }
        return nodeKeys;
    }

    deleteNodes(nodeKeys: string[]) {
        let len = nodeKeys.length;
        if (!len) {
            alert('wow no way!');
        }
        this.askAndDo(
            'Permanently delete ' + len + ' selected items?',
            'Ok', () => {
                console.log('deleting ' + len + ' selected items ...');
            });
    }

    onClickTrashButton() {
        let folderName: string = this.folderPath.replace(/.*\//, ''),
            nCheckedNodes = this.nCheckedNodes(),
            checkedNodesInThisFolder: string[] =
                this.checkedNodesInThisFolder(),
            nCheckedNodesInThisFolder = checkedNodesInThisFolder.length,
            nCheckedNodesNotInThisFolder = nCheckedNodes -
                nCheckedNodesInThisFolder;
        console.log('nchec ' + nCheckedNodes + ', in ' +
            nCheckedNodesInThisFolder);
        if (nCheckedNodesNotInThisFolder) {
            if (nCheckedNodesInThisFolder) {
                this.askAndDo([
                    'You have checked items in folders outside this one. ',
                    'Do you want to delete all checked items ',
                    'or only the ones here at ' +
                    folderName, '?'].join(''),
                    'Delete in ' + folderName,
                    () => {
                        console.log('yes action');
                        this.deleteNodes(checkedNodesInThisFolder);
                    },
                    'Delete all',
                    () => {
                        console.log('no action');
                        this.deleteNodes(Object.keys(this.checkedNodes));
                    }
                );
            }
            else {
                // nothing checked in this folder, but stuff checked outside
                this.deleteNodes(Object.keys(this.checkedNodes));
            }
        }
        else {
            // all checked nodes are in this folder
            this.deleteNodes(checkedNodesInThisFolder);
        }
    }

    onClickSharebutton() {

    }

    upButtonDisabled() {
        return false;
    }

    downButtonDisabled() {
        return false;
    }

    moveButtonDisabled() {
        return false;
    }

    trashButtonDisabled() {
        return false;
    }

    // switch to folder whose key is 'key'
    // if updateState is true, update the app state
    // property 'lastViewedFolderKey'
    switchFolder(key: number, updateState: boolean) {
        if (!this.localDB.validateKey(key)) {
            alert('switchFolder -- invalid key!');
            return;
        }
        if (this.folderNode && this.folderNode[DB_KEY_PATH] === key) {
            // we're already in that folder
            alert('why switch twice in a row to the same folder?');
            return;
        }
        console.log('switchFolder(' + key + ', ' + updateState + ')');

        // for non-root folders, we set this.folderNode here
        this.localDB.readNode(key).subscribe(
            (folderNode: TreeNode) => {
                if (folderNode[DB_KEY_PATH] !== key) {
                    alert('in readNode: key mismatch');
                }
                // we read all child nodes of the folder we're switching to in order
                // to fill up this.folderItems
                let newFolderItems: { [id: string]: TreeNode } = {};
                this.localDB.readChildNodes(key).subscribe(
                    (childNodes: TreeNode[]) => {
                        this.folderItems = {};
                        // we found all children of the node we're traversing to (key)
                        for (let i in childNodes) {
                            let childNode: TreeNode = childNodes[i],
                                childKey: number = childNode[DB_KEY_PATH];
                            newFolderItems[childKey.toString()] = childNode;
                        } // for

                        this.folderNode = folderNode;
                        this.folderItems = newFolderItems;

                        console.log('found ' + this.folderNode.childOrder.length +
                            ' items');
                    },
                    (error: any) => {
                        alert('in readChildNodes: ' + error);
                    }
                ); // readChildNodes().subscribe(
            },
            (error: any) => {
                alert('in readNode: ' + error);
            }
        );

        // get the path, in parallel
        this.localDB.getNodePath(key).subscribe(
            (path: string) => {
                console.log('path === ' + path);
                path = path.substr(
                    1 + ROOT_FOLDER_NAME.length
                );
                if (path === '') {
                    this.folderPath = '/';
                }
                else {
                    this.folderPath = path;
                }
                console.log('FOLDER PATH: ' + this.folderPath);
            },
            (error: any) => {
                alert('in getNodePath: ' + error);
            }
        ); // getNodePath().subscribe(

        // update last viewed folder state in DB
        if (updateState) {
            this.appState.updateProperty('lastViewedFolderKey', key)
                .subscribe(
                () => { },
                (error: any) => {
                    alert('in updateProperty: ' + error);
                }
                ); // updateProperty().subscribe
        }
    }

    isChecked(node: TreeNode) {
        return this.checkedNodes[node[DB_KEY_PATH].toString()];
    }

    onClickTotalSelected() {
        console.log('onClickTotalSelected(), counter: ' +
            this.totalSelectedCounter);
        this.totalSelectedCounter++;
    }

    onClickCheckbox(node: TreeNode) {
        console.log('onClickCheckbox()');
        // reset the counter for flipping through selected nodes
        this.totalSelectedCounter = 0;

        let nodeKey: number = node[DB_KEY_PATH],
            isChecked: boolean = this.checkedNodes[nodeKey.toString()];

        if (isChecked) {
            // uncheck it
            delete this.checkedNodes[nodeKey.toString()];
        }
        else {
            // uot checked, check it
            this.checkedNodes[nodeKey.toString()] = true;
        }

        // update state with new list of checked nodes
        this.appState.updateProperty('checkedNodes',
            this.checkedNodes).subscribe(
            () => { },
            (error: any) => {
                alert('in updateProperty: ' + error);
            }
            ); // updateProperty().subscribe
    }

    onClickListItem(node: TreeNode) {
        console.log('onClickItem(' + node.name + ') ' + node[DB_KEY_PATH]);
        if (this.localDB.isFolderNode(node)) {
            this.switchFolder(node[DB_KEY_PATH], true);
        }
    }

    onClickParentButton() {
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey, true);
        }
    }

    itemIconName(key: string) {
        if (!this.folderItems || !this.folderItems[key]) {
            return '';
        }
        // console.log('itemIconName ' + key);
        if (this.localDB.isDataNode(this.folderItems[key])) {
            return 'document';
        }
        else {
            return 'folder';
        }
    }

    onClickAddButton() {
        // note we consider the current folder (this.folderNode) the parent
        let addFolderModal = Modal.create(AddFolderPage, {
            parentPath: this.folderPath,
            parentItems: this.folderItems
        });

        this.navController.present(addFolderModal);

        addFolderModal.onDismiss(folderName => {
            if (folderName) {
                // data is new folder's name returned from addFolderModal
                console.log('got folderName back: ' + folderName);
                // create a node for added folder childNode
                this.localDB.createFolderNode(folderName,
                    this.folderNode[DB_KEY_PATH]).subscribe(
                    (parentChild: ParentChild) => {
                        let childNode = parentChild.child,
                            parentNode = parentChild.parent,
                            childNodeKey: number = childNode[DB_KEY_PATH];
                        console.log('childNode: ' + childNode + ', parentNode: ' + parentNode);
                        // update folder items dictionary of this page
                        this.folderItems[childNodeKey.toString()] = childNode;
                        this.folderNode = parentNode;
                    },
                    (error: any) => {
                        alert('in createFolderNode: ' + error);
                    }
                    ); // createFolderNode().subscribe(
            }
            else {
                console.log('you canceled the add-folder');
                // assume cancel
                return;
            }
        });
    }

    onClickInfoButton() {
    }

    selectAllOrNoneInFolder(all: boolean) {
        // go through all folderItems
        // for each one, ask if it's in checkedNodes
        // for this to work, we need to make checkedNodes a dictionary
        let changed: boolean = false,
            i: number,
            key: string,
            folderItemsKeys: string[] = Object.keys(this.folderItems),
            itemNode: TreeNode,
            itemKey: number;
        for (i = 0; i < folderItemsKeys.length; i++) {
            key = folderItemsKeys[i];
            itemNode = this.folderItems[key];
            itemKey = itemNode[DB_KEY_PATH];

            let isChecked: boolean = this.checkedNodes[itemKey.toString()];

            if (all && !isChecked) {
                changed = true;
                // not checked, check it
                this.checkedNodes[itemKey.toString()] = true;
            }
            if (!all && isChecked) {
                changed = true;
                // checked, uncheck it
                delete this.checkedNodes[itemKey.toString()];
            }
        }
        if (changed) {
            // update state with new list of checked nodes
            this.appState.updateProperty('checkedNodes',
                this.checkedNodes).subscribe(
                () => { },
                (error: any) => {
                    alert('in updateProperty: ' + error);
                }
                ); // updateProperty().subscribe
        }
    }

    selectAllInFolder() {
        this.selectAllOrNoneInFolder(true);
    }

    selectNoneInFolder() {
        this.selectAllOrNoneInFolder(false);
    }

    onClickSelectButton() {
        let folderName: string = this.folderPath.replace(/.*\//, ''),
            alert = Alert.create();
        if (folderName === '') {
            folderName = '/';
        }
        alert.setTitle('Select in<br>' + folderName);
        alert.addInput({
            type: 'radio',
            label: 'All',
            value: 'all'
        });
        alert.addInput({
            type: 'radio',
            label: 'None',
            value: 'none'
        });
        alert.addButton('Cancel');
        alert.addButton({
            text: 'OK',
            handler: (selection: string) => {
                console.log('handler called with data: ' + selection);
                if (selection === 'all') {
                    this.selectAllInFolder();
                }
                else if (selection === 'none') {
                    this.selectNoneInFolder();
                }
            }
        });

        this.navController.present(alert).then();
    }
}
