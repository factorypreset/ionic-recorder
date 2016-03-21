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
    private folderNode: TreeNode = null;
    private folderItems: { [id: string]: TreeNode; } = {};
    private selectedNodes: { [id: string]: TreeNode; } = {};

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
        console.warn('ngOnInit() --------------------');
        // switch folders, via AppState
        this.appState.getLastViewedFolderKey().subscribe(
            (lastViewedFolderKey: number) => {
                console.log('lastViewedFolderKey: ' + lastViewedFolderKey);
                // this is it!  here's where we enter the last viewed folder
                this.switchFolder(lastViewedFolderKey, false);
                this.appState.getProperty('selectedNodes').subscribe(
                    (selectedNodes: { [id: string]: TreeNode }) => {
                        this.selectedNodes = selectedNodes;
                        if (!selectedNodes) {
                            alert('no selected nodes! ' + selectedNodes);
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

    getPath() {
        let path: string = this.folderNode.path +
            '/' + this.folderNode.name,
            rootPath: string = '/' + ROOT_FOLDER_NAME;
        if (path === rootPath) {
            return '/';
        }
        else {
            return path.slice(rootPath.length);
        }
    }

    parentButtonDisabled() {
        return !this.folderNode || this.folderNode.path === '';
    }

    onClickUpButton() {

    }

    onClickDownButton() {

    }

    alertAndDo(
        question: string,
        button1Text: string,
        action1: () => void,
        button2Text?: string,
        action2?: () => void) {

        let alert = Alert.create();

        alert.setTitle(question);

        if (!action2) {
            alert.addButton('Cancel');
        }

        alert.addButton({
            text: button1Text,
            handler: data => {
                action1();
            }
        });

        if (action2) {
            alert.addButton({
                text: button2Text,
                handler: data => {
                    action2();
                }
            });
            alert.addButton('Cancel');
        }

        this.navController.present(alert).then();
    }

    unselectItemsNotHere() {
        console.log('unselectItemsNotHere()');
    }

    onClickMoveButton() {

    }

    // we use this function in library.html
    nSelectedNodes() {
        return Object.keys(this.selectedNodes).length;
    }

    selectedNodesHere(): { [id: string]: TreeNode; } {
        let key: string,
            i: number,
            nodeHere: TreeNode,
            keyDict: { [id: string]: TreeNode; } = {},
            keys = Object.keys(this.selectedNodes);
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            nodeHere = this.folderItems[key];
            if (nodeHere) {
                keyDict[key] = nodeHere;
            }
        }
        return keyDict;
    }

    deleteNodes(keyDict: { [id: string]: TreeNode; }) {
        let nNodes = Object.keys(keyDict).length;
        if (!nNodes) {
            alert('wow no way!');
        }
        this.alertAndDo(
            'Permanently delete ' + nNodes + ' item' +
            (nNodes > 1 ? 's?' : '?'),
            'Ok', () => {
                console.log('deleting ' + nNodes + ' selected items ...');
                this.localDB.deleteNodes(keyDict).subscribe(
                    () => {
                        let i: number,
                            bSelectionChanged = false,
                            key: string,
                            keys: string[] = Object.keys(keyDict),
                            nNodes: number = keys.length;
                        for (i = 0; i < nNodes; i++) {
                            key = keys[i];
                            // remove from this.folderNode.childOrder
                            this.folderNode.childOrder =
                                this.folderNode.childOrder.filter(
                                    (childKey: number) => {
                                        return childKey.toString() !== key;
                                    });
                            // remove from this.folderItems
                            if (this.folderItems[key]) {
                                delete this.folderItems[key];
                            }
                            // remove from this.selectedNodes
                            if (this.selectedNodes[key]) {
                                delete this.selectedNodes[key];
                                // remember that we've changed selection
                                bSelectionChanged = true;
                            }
                        } // for
                        if (bSelectionChanged) {
                            this.appState.updateProperty('selectedNodes',
                                this.selectedNodes).subscribe(
                                () => {
                                    console.log('SUCCESS DELETING ALL');
                                }
                                );
                        }
                        else {
                            console.log('SUCCESS DELETING ALL');
                        }
                    }
                );
            });
    }

    onClickDeleteButton() {
        let folderName: string = this.folderNode.path.replace(/.*\//, '') || '/',
            nSelectedNodes = Object.keys(this.selectedNodes).length,
            selectedNodesHere: { [id: string]: TreeNode; } =
                this.selectedNodesHere(),
            nSelectedNodesHere = Object.keys(selectedNodesHere).length,
            nSelectedNodesNotHere = nSelectedNodes - nSelectedNodesHere;
        console.log('nchec ' + nSelectedNodes + ', in ' + nSelectedNodesHere);
        if (nSelectedNodesNotHere) {
            if (nSelectedNodesHere) {
                this.alertAndDo([
                    'You have ', nSelectedNodesNotHere,
                    ' selected item',
                    nSelectedNodesNotHere > 1 ? 's' : '',
                    ' outside this folder. Do you want to delete all ',
                    nSelectedNodes, ' selected item',
                    nSelectedNodes > 1 ? 's' : '',
                    ' or only the ', nSelectedNodesHere,
                    ' item', nSelectedNodesHere > 1 ? 's' : '',
                    ' here?'].join(''),
                    'Delete all (' + nSelectedNodes + ')',
                    () => {
                        console.log('no action');
                        this.deleteNodes(this.selectedNodes);
                    },
                    'Delete only here (' + nSelectedNodesHere + ')',
                    () => {
                        console.log('yes action');
                        this.deleteNodes(selectedNodesHere);
                    }
                );
            }
            else {
                // nothing selected in this folder, but stuff selected outside
                this.deleteNodes(this.selectedNodes);
            }
        }
        else {
            // all selected nodes are in this folder
            this.deleteNodes(selectedNodesHere);
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

    deleteButtonDisabled() {
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
                this.localDB.readChildNodes(folderNode).subscribe(
                    (childNodes: TreeNode[]) => {
                        this.folderItems = {};
                        // we found all children of the node we're traversing to (key)
                        for (let i in childNodes) {
                            let childNode: TreeNode = childNodes[i],
                                childKey: number = childNode[DB_KEY_PATH];
                            newFolderItems[childKey] = childNode;
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

    isSelected(node: TreeNode) {
        return this.selectedNodes[node[DB_KEY_PATH]];
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
            isSelected: TreeNode = this.selectedNodes[nodeKey];

        if (isSelected) {
            // uncheck it
            delete this.selectedNodes[nodeKey];
        }
        else {
            // not selected, check it
            this.selectedNodes[nodeKey] = node;
        }

        // update state with new list of selected nodes
        this.appState.updateProperty('selectedNodes',
            this.selectedNodes).subscribe(
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
            parentPath: this.folderNode.path,
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
                        console.log('childNode: ' + childNode +
                            ', parentNode: ' + parentNode);
                        // update folder items dictionary of this page
                        this.folderItems[childNodeKey] = childNode;
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
        // for each one, ask if it's in selectedNodes
        // for this to work, we need to make selectedNodes a dictionary
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

            let isSelected: TreeNode = this.selectedNodes[itemKey];

            if (all && !isSelected) {
                changed = true;
                // not selected, check it
                this.selectedNodes[itemKey] = itemNode;
            }
            if (!all && isSelected) {
                changed = true;
                // selected, uncheck it
                delete this.selectedNodes[itemKey];
            }
        }
        if (changed) {
            // update state with new list of selected nodes
            this.appState.updateProperty('selectedNodes',
                this.selectedNodes).subscribe(
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
        let folderName: string = this.folderNode.path.replace(/.*\//, '') || '/';
        this.alertAndDo(
            'Select which in<br> ' + folderName,
            'All',
            () => {
                this.selectAllInFolder();
            },
            'None',
            () => {
                this.selectNoneInFolder();
            });
    }
}
