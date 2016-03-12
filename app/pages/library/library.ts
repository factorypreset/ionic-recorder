import {Page, Platform} from "ionic-angular";
import {LocalDB, TreeNode} from "../../providers/local-db/local-db";
import {AppState} from "../../providers/app-state/app-state";

@Page({
    templateUrl: "build/pages/library/library.html"
})
export class LibraryPage {
    private path: string = "/";

    private folderItems: TreeNode[] = [];

    private localDB: LocalDB;
    private appState: AppState;

    constructor(private platform: Platform) {
        console.log("constructor():LibraryPage");
        this.localDB = LocalDB.Instance;
        this.appState = AppState.Instance;
    }

    onPageDidEnter() {
        this.localDB.readChildNodes(
            this.appState.getProperty("unfiledFolderKey")).subscribe(
              (childNodes: TreeNode[]) => {
                  console.dir(childNodes);
                  this.folderItems = childNodes;
              },
              (error: any) => {
                  console.log("Error reading child nodes: " + error);
              }
            );
    }
}
