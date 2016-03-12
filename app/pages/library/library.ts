import {Page, Platform} from "ionic-angular";
import {LocalDB} from "../../providers/local-db/local-db";
import {AppState} from "../../providers/app-state/app-state";

@Page({
    templateUrl: "build/pages/library/library.html"
})
export class LibraryPage {
    private path: string = "/";
    private folderItems: Object[] = [];

    private localDB: LocalDB;
    private appState: AppState;

    constructor(private platform: Platform) {
        console.log("constructor():LibraryPage");
        this.localDB = LocalDB.Instance;
        this.appState = AppState.Instance;
    }

    onPageDidEnter() {
        /*
        this.appState.db.getItemsByParentKey(
            this.appState.lastViewedFolderKey,
            (data: any) => {
                this.folderItems.push(data);
                if (this.folderItems.length === 1) {
                    // on first item, we set the path
                    let pathParts: string[] = [];
                    console.log("first item! start");
                    console.dir(data);
                    console.log("first item! end");
                    this.appState.db.iteratePath(
                        data.parentKey, (name: string) => {
                            pathParts.push(name);
                            this.path = pathParts.join("/");
                        });
                }
                console.dir(data);
            }
        );
        */
    }
}
