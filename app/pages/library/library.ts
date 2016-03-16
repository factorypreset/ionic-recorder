// Copyright (C) 2015, 2016 Tracktunes Inc

import {Page, NavController, Platform, Modal, Alert} from 'ionic-angular';
import {LocalDB, TreeNode, DB_NO_KEY, DB_KEY_PATH}
from '../../providers/local-db/local-db';
import {AppState} from '../../providers/app-state/app-state';
import {AddFolderPage} from '../add-folder/add-folder';
import {prependArray} from '../../providers/utils/utils';


@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    private folderPath: string = '';
    private folderNode: TreeNode = null;
    // folderItems is a (typed) dictionary
    private folderItems: { [id: string]: TreeNode; } = {};
    private checkedNodes: { [id: string]: boolean; } = {};

    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;

    constructor(
        private navController: NavController,
        private platform: Platform) {
        console.log('constructor():LibraryPage');
    }

    folderItemsKeys() {
        return Object.keys(this.folderItems);
    }

    folderIsEmpty() {
        return this.folderPath.length > 1 && !this.folderItemsKeys().length;
    }

    checkedNodesKeys() {
        return Object.keys(this.checkedNodes);
    }

    nCheckedNodes() {
        return this.checkedNodesKeys().length;
    }

    cannotClickUp() {
        return this.folderItemsKeys().length < 2 ||
            this.nCheckedNodes() !== 1;
    }

    cannotClickDown() {
        return this.folderItemsKeys().length < 2 ||
            this.nCheckedNodes() !== 1;
    }

    // onPageWillEnter
    // Ionic Life Cycle Hooks:
    // https://webcake.co/page-lifecycle-hooks-in-ionic-2/
    onPageWillEnter() {
        // switch folders, via AppState
        this.appState.getProperty('lastViewedFolderKey').subscribe(
            (key: number) => {
                console.log('lib page entered, to: ' + key);
                this.switchFolder(key, false);
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

    // switch to folder whose key is 'key'
    // if updateState is true, update the app state
    // property 'lastViewedFolderKey'
    switchFolder(key: number, updateState: boolean) {
        console.log('switchFolder(' + key + ', ' + updateState + ') -- ' +
            this.nCheckedNodes());
        // we read all child nodes of the folder we're switching to in order
        // to fill up this.folderItems
        this.localDB.readChildNodes(key).subscribe(
            (childNodes: TreeNode[]) => {
                this.folderItems = {};
                // we found all children of the node we're traversing to (key)
                for (let i in childNodes) {
                    let childNode: TreeNode = childNodes[i],
                        childKey: number = childNode[DB_KEY_PATH];
                    if ((key === DB_NO_KEY) &&
                        // root folder special case filter - only show folders
                        // because we may store non-folder items there (such as
                        // app state) that aren't for display
                        this.localDB.isDataNode(childNode)) {
                        continue;
                    }
                    this.folderItems[childKey.toString()] = childNode;
                }
                console.log('found ' + this.folderItemsKeys() + ' items');

                // for non-root folders, we set this.folderNode here
                if (key !== DB_NO_KEY) {
                    this.localDB.readNode(key).subscribe(
                        (node: TreeNode) => {
                            if (node[DB_KEY_PATH] !== key) {
                                alert('in readNode: key mismatch');
                            }
                            this.folderNode = node;
                        },
                        (error: any) => {
                            alert('in readNode: ' + error);
                        }
                    ); // readNode().subscribe(
                }

                // get the path
                this.localDB.getNodePath(key).subscribe(
                    (path: string) => {
                        console.log('path === ' + path);
                        this.folderPath = path;
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
            },
            (error: any) => {
                alert('in readChildNodes: ' + error);
            }
        ); // readChildNodes().subscribe(
    }

    isChecked(node: TreeNode) {
        return this.checkedNodes[node[DB_KEY_PATH].toString()];
    }

    onClickCheckbox(node: TreeNode) {
        console.log('onClickCheckbox()');
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

    onClickAddButton() {
        // note we consider the current folder (this.folderNode) the parent
        let parentKey: number =
            this.folderNode ? this.folderNode[DB_KEY_PATH] : DB_NO_KEY,
            modal = Modal.create(AddFolderPage, {
                parentPath: this.folderPath,
                parentItems: this.folderItems
            });

        this.navController.present(modal);

        modal.onDismiss(data => {
            if (data) {
                // data is new folder's name
                console.log('got data back: ' + data);
                this.localDB.createFolderNode(data, parentKey).subscribe(
                    (node: TreeNode) => {
                        let nodeKey: number = node[DB_KEY_PATH];

                        // update folder items dictionary
                        this.folderItems[nodeKey.toString()] = node;
                        /*
                        // we push newly created nodes to the front of
                        // the parent childOrder list
                        this.folderNode.childOrder = prependArray(
                            nodeKey, this.folderNode.childOrder);

                        // update the parent node w/new childOrder in db
                        // but there's no parent node for root in db
                        if (this.folderNode[DB_KEY_PATH] != DB_NO_KEY) {
                            this.localDB.updateNode(this.folderNode).subscribe(
                                () => { },
                                (error: any) => {
                                    alert('in updateNode: ' + error);
                                }
                            ); // updateNode().subscribe(
                        }
                        */
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

    getFolderName() {
        if (this.folderNode) {
            return this.folderNode.name;
        }
        else {
            return '/';
        }
    }

    selectAllOrNoneInFolder(all: boolean) {
        // go through all folderItems
        // for each one, ask if it's in checkedNodes
        // for this to work, we need to make checkedNodes a dictionary
        let folderItemsKeys = this.folderItemsKeys(), changed: boolean = false,
            i: number, key: string, itemNode: TreeNode, itemKey: number;
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
                delete this.checkedNodes[itemKey.toString()]
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
        let alert = Alert.create();
        alert.setTitle('Select in <br>\'' + this.getFolderName() + '\'');
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

    unselectItemsNotInThisFolder() {
    }

    askIfToUnselectItemsNotInThisFolder(message: string) {
        let alert = Alert.create();
        alert.setTitle(message);
        alert.addButton('Cancel');
        alert.addButton({
            text: 'Ok',
            handler: data => {
                this.unselectItemsNotInThisFolder()
                // go through checked nodes and if they are not in
                // folder items, uncheck them
            }
        });
    }

    onClickTrashButton() {

        let alert = Alert.create(),
            len: number = this.checkedNodesKeys().length;
        alert.setTitle([
            'Permanently delete ',
            len.toString(),
            ' item',
            len > 1 && 's' || '',
            ' and all ',
            len > 1 && 'their' || 'its',
            ' content / data?'
        ].join(''));
        alert.addButton('Cancel');
        alert.addButton({
            text: 'Delete',
            handler: data => {
                console.log('deleting checked nodes ...');
            }
        });

        this.navController.present(alert).then();
    }

}
