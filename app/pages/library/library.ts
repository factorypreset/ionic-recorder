import {Page, NavController, Platform, Modal} from 'ionic-angular';
import {LocalDB, TreeNode, DB_NO_KEY, DB_KEY_PATH}
from '../../providers/local-db/local-db';
import {AppState, STATE_NODE_NAME} from '../../providers/app-state/app-state';
import {AddFolderPage} from '../add-folder/add-folder';
import {prependArray} from '../../providers/utils/utils';


// TODO: 
// 1) appState is all promises, including get
// 2) we don't call wait from anywhere except inside localdb
// 3) localdb is all promises that wait first
// 4) get & save the nTotalChecked with those new promises
// 5) display nTotalChecked somewhere ('3 checked items' right justified
//    in the library navbar)

@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    private folderPath: string = '';
    private folderNode: TreeNode = null;
    private folderItems: TreeNode[] = [];
    private nTotalCheckedNodes = 0;

    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;

    constructor(private nav: NavController, private platform: Platform) {
        console.log('constructor():LibraryPage');
    }

    onPageDidEnter() {
        this.appState.getProperty('lastViewedFolderKey').subscribe(
            (key: number) => {
                this.switchFolder(key, false);
                this.appState.getProperty('nTotalCheckedNodes').subscribe(
                    (n: number) => {
                        this.nTotalCheckedNodes = n;
                    }
                );
            }
        );
    }

    switchFolder(key: number, updateState: boolean) {
        console.log('switchFolder(' + key + ', ' + updateState + ') -- ' +
            this.nTotalCheckedNodes);
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

    onClickedItemCheckbox(node: TreeNode) {
        console.log('onClickedItemCheckbox()');
        let nodeKey: number = node[DB_KEY_PATH];
        if (node.checked) {
            // flip state
            node.checked = false;
            // keep track of total
            this.nTotalCheckedNodes--;
        }
        else {
            // flip state
            node.checked = true;
            // keep track of total
            this.nTotalCheckedNodes++;
        }

        // update state in DB
        this.localDB.updateNode(node).subscribe();
        this.appState.updateProperty('nTotalCheckedNodes',
            this.nTotalCheckedNodes).subscribe();
    }

    allCheckboxClicked() {
        console.log('allCheckboxClicked()');
    }

    itemClicked(node: TreeNode) {
        console.log('itemClicked(' + node.name + ') ' + node[DB_KEY_PATH]);
        if (this.localDB.isFolder(node)) {
            this.switchFolder(node[DB_KEY_PATH], true);
        }
    }

    goToParent() {
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey, true);
        }
    }

    onClickAddButton() {
        let parentKey: number =
            this.folderNode ? this.folderNode[DB_KEY_PATH] : DB_NO_KEY;
        let modal = Modal.create(AddFolderPage, {
            parentPath: this.folderPath,
            parentItems: this.folderItems
        });
        this.nav.present(modal);
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
