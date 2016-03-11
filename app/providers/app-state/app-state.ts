import {Injectable} from "angular2/core";
import {LocalDB, TreeNode, DB_NO_ID} from "../local-db/local-db";

interface State {
    lastSelectedTab: number;
    lastViewedFolderKey: number;
}


// make sure APP_STATE_ITEM_NAME will never be entered by a user
const STATE_NODE_NAME: string =
    "Kwj7t9X2PTsPwLquD9qvZqaApMP8LGRjPFENUHnvrpmUE25rkrYHhzf9KBEradAU";

const DEFAULT_STATE: State = {
    lastSelectedTab: 0,
    lastViewedFolderKey: DB_NO_ID
};


@Injectable()
export class AppState {
    private state: State;
    private localDB: LocalDB = LocalDB.Instance;
    private stateTreeNode: TreeNode;

    constructor() {
        console.log("constructor():AppState");
        this.dbReadOrAdd();
    }

    dbReadOrAdd() {
        /*
        this.localDB.nameNotInParent(STATE_NODE_NAME, DB_NO_ID).subscribe(
            (unique: boolean) => {
                if (unique) {
                    // name not in parent, add it
                    this.localDB.createNode(
                        STATE_NODE_NAME, DB_NO_ID, DEFAULT_STATE).subscribe(
                            (node: TreeNode) => {
                                this.stateTreeNode = node;
                            },
                            (error: any) => {
                                throw new Error(error);
                            }
                        ); // createNode().subscribe(
                }
                else {
                    // name in parent, read it
                    this.localDB.
                }
            },
            (error: any) => {
                throw new Error(error);
            }
        );
        */
    }

    save() {
        /*
        // very brute force ...
        this.localDB.smartUpdate(
            APP_STATE_ITEM_NAME, {
                dbName: this.localDBName,
                dbVersion: this.localDBVersion,
                dbStoreName: this.localDBStoreName,
                unfiledFolderName: this.unfiledFolderName,
                lastViewedPage: this.lastViewedPage,
                lastViewedFolderKey: this.lastViewedFolderKey
            });
        */
    }
}
