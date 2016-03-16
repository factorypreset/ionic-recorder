// Copyright (C) 2015, 2016 Tracktunes Inc

import {Page, NavController, Platform, Modal} from 'ionic-angular';
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
    private checkedNodes = [];

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

    cannotClickUp() {
        return this.folderItemsKeys().length < 2 ||
            this.checkedNodes.length !== 1;
    }

    cannotClickDown() {
        return this.folderItemsKeys().length < 2 ||
            this.checkedNodes.length !== 1;
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
                    (checkedNodes: number[]) => {
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
            this.checkedNodes.length);
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
                console.log('found ' + Object.keys(this.folderItems).length +
                    ' items');

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
        return this.checkedNodes.indexOf(node[DB_KEY_PATH]) !== -1;
    }

    onClickCheckbox(node: TreeNode) {
        console.log('onClickCheckbox()');
        let nodeKey: number = node[DB_KEY_PATH],
            i: number = this.checkedNodes.indexOf(nodeKey);
        if (i === -1) {
            // node is not checked
            // add to list of checked nodes
            this.checkedNodes.push(nodeKey);
        }
        else {
            // node is checked
            // remove from list of checked nodes
            this.checkedNodes.splice(i, 1);
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

    onClickItem(node: TreeNode) {
        console.log('onClickItem(' + node.name + ') ' + node[DB_KEY_PATH]);
        if (this.localDB.isFolderNode(node)) {
            this.switchFolder(node[DB_KEY_PATH], true);
        }
    }

    goToParent() {
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey, true);
        }
    }

    onClickAdd() {
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

}
