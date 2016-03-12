import {Page, Platform} from "ionic-angular";
import {LocalDB, TreeNode, DB_NO_KEY} from "../../providers/local-db/local-db";
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
        this.localDB.getNodePath(
            this.appState.getProperty("lastViewedFolderKey")
        ).subscribe(
            (path: string) => {
                this.folderPath = path;
            }
            );

        this.localDB.readChildNodes(
            this.appState.getProperty("lastViewedFolderKey")
        ).subscribe(
            (childNodes: TreeNode[]) => {
                // this.folderItems = childNodes;
                this.folderItems = [];
                for (let i in childNodes) {
                    let node: TreeNode = childNodes[i];
                    if ((this.appState.getProperty("lastViewedFolderKey") ===
                        DB_NO_KEY) &&
                        !this.localDB.isFolder(node)) {
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
            );
    }
}
