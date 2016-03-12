import {Page, Platform} from "ionic-angular";
import {LocalDB, TreeNode, DB_NO_KEY, DB_KEY_PATH}
from "../../providers/local-db/local-db";
import {AppState, STATE_NODE_NAME} from "../../providers/app-state/app-state";

@Page({
    templateUrl: "build/pages/library/library.html"
})
export class LibraryPage {
    private folderPath: string = "";

    private folderItems: TreeNode[] = [];

    private localDB: LocalDB;
    private appState: AppState;

    constructor(private platform: Platform) {
        console.log("constructor():LibraryPage");
        this.localDB = LocalDB.Instance;
        this.appState = AppState.Instance;
    }

    onPageDidEnter() {
        let key = this.appState.getProperty("lastViewedFolderKey");

        console.log("KEY === " + key);

        this.localDB.getNodePath(key).subscribe(
            (path: string) => {
                this.folderPath = path;
            }
        );

        this.switchFolder(key, false);
    }

    switchFolder(key: number, updateState: boolean) {
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
            },
            (error: any) => {
                console.log("Error reading child nodes: " + error);
            }
        ); // readChildNodes().subscribe(
    }

    itemCheckboxClicked() {
        console.log("itemCheckboxClicked()");
    }

    allCheckboxClicked() {
        console.log("allCheckboxClicked()");
    }

    itemClicked(node: TreeNode) {
        console.log("itemClicked(" + node.name + ") " + node[DB_KEY_PATH]);
        this.switchFolder(node[DB_KEY_PATH], true);
    }
}
