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
    private folderItems: TreeNode[] = [];
    private checkedNodes = [];

    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;

    constructor(
        private navController: NavController,
        private platform: Platform) {
        console.log('constructor():LibraryPage');
    }

    onPageDidEnter() {
        this.appState.getProperty('lastViewedFolderKey').subscribe(
            (key: number) => {
                this.switchFolder(key, false);
                this.appState.getProperty('checkedNodes').subscribe(
                    (checkedNodes: number[]) => {
                        this.checkedNodes = checkedNodes;
                    },
                    (error2: any) => {
                        alert('error3 in get: ' + error2)
                    }
                );
            },
            (error1: any) => {
                alert('error1 in get: ' + error1);
            }
        );
    }

    switchFolder(key: number, updateState: boolean) {
        console.log('switchFolder(' + key + ', ' + updateState + ') -- ' +
            this.checkedNodes.length);
        this.localDB.readChildNodes(key).subscribe(
            (childNodes: TreeNode[]) => {
                // this.folderItems = childNodes;
                this.folderItems = [];
                for (let i in childNodes) {
                    let node: TreeNode = childNodes[i];
                    if ((key === DB_NO_KEY) && !this.localDB.isFolder(node)) {
                        // we're looking at the root folder and there
                        // we only show folders, we don't allow non-folder
                        // items to reside in the root folder
                        continue;
                    }
                    this.folderItems.push(childNodes[i]);
                }

                this.localDB.readNode(key).subscribe(
                    (node: TreeNode) => {
                        if (node[DB_KEY_PATH] !== key) {
                            console.log('ERROR: key mismatch');
                        }
                        this.folderNode = node;
                    },
                    (error: any) => {
                        console.log(error);
                    }
                );

                this.localDB.getNodePath(key).subscribe(
                    (path: string) => {
                        console.log('path === ' + path);
                        this.folderPath = path;
                    }
                );

                if (updateState) {
                    this.appState.updateProperty('lastViewedFolderKey', key)
                        .subscribe();
                }
            },
            (error: any) => {
                console.log('Error reading child nodes: ' + error);
            }
        ); // readChildNodes().subscribe(
    }

    onClickCheckbox(node: TreeNode) {
        console.log('onClickCheckbox()');
        let nodeKey: number = node[DB_KEY_PATH];
        if (node.checked) {
            // flip state
            node.checked = false;
            // remove from list of checked nodes
            let nodeKey = node[DB_KEY_PATH],
                i = this.checkedNodes.indexOf(nodeKey)
            if (i === -1) {
                alert('this cannot be!');
            }
            this.checkedNodes.splice(i, 1);
        }
        else {
            // flip state
            node.checked = true;
            // add to list of checked nodes
            this.checkedNodes.push(node[DB_KEY_PATH]);
        }

        // update state in DB
        this.localDB.updateNode(node).subscribe();
        this.appState.updateProperty('checkedNodes',
            this.checkedNodes).subscribe();
    }

    onClickItem(node: TreeNode) {
        console.log('onClickItem(' + node.name + ') ' + node[DB_KEY_PATH]);
        if (this.localDB.isFolder(node)) {
            this.switchFolder(node[DB_KEY_PATH], true);
        }
    }

    goToParent() {
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey, true);
        }
    }

    onClickAdd() {
        let parentKey: number =
            this.folderNode ? this.folderNode[DB_KEY_PATH] : DB_NO_KEY;
        let modal = Modal.create(AddFolderPage, {
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
                        this.folderItems = prependArray(
                            node,
                            this.folderItems
                        );
                    });
            }
            else {
                // assume cancel
                return;
            }
        });
    }

}
