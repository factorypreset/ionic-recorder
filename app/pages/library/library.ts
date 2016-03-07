import {Page, Platform} from "ionic-angular";
import {AppState} from "../../providers/app-state";


@Page({
    templateUrl: "build/pages/library/library.html"
})
export class LibraryPage {
    private path: string = "/";
    private folderItems: Object[] = [];

    constructor(private platform: Platform, private appState: AppState) {
    }

    onPageDidEnter() {
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
    }
}
