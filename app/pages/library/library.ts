import {Page, Platform} from "ionic-angular";
import {LocalDB, TreeNode} from "../../providers/local-db/local-db";
import {AppState} from "../../providers/app-state/app-state";

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
            this.appState.getProperty("lastViewedFolderKey")).subscribe(
            (childNodes: TreeNode[]) => {
                this.folderItems = childNodes;
            },
            (error: any) => {
                console.log("Error reading child nodes: " + error);
            }
            );
    }
}
