import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Rx";
import {LocalDB, TreeNode, DataNode, DB_NO_KEY, DB_KEY_PATH, MAX_DB_INIT_TIME}
from "../local-db/local-db";

interface State {
    lastSelectedTab: number;
    lastViewedFolderKey: number;
}


// make sure APP_STATE_ITEM_NAME will never be entered by a user
const STATE_NODE_NAME: string =
    "Kwj7t9X2PTsPwLquD9qvZqaApMP8LGRjPFENUHnvrpmUE25rkrYHhzf9KBEradAU";

const DEFAULT_STATE: State = {
    lastSelectedTab: 0,
    lastViewedFolderKey: DB_NO_KEY
};


@Injectable()
export class AppState {
    // 'instance' is used as part of Singleton pattern implementation
    private static instance: AppState = null;

    private localDB: LocalDB = null;
    private treeNode: TreeNode = null;
    private dataNode: DataNode = null;

    constructor() {
        console.log("constructor():AppState");
        this.localDB = LocalDB.Instance;

        //        setTimeout(() => {
        this.localDB.readOrCreateDataNodeInParentByName(
            STATE_NODE_NAME, DB_NO_KEY, DEFAULT_STATE).subscribe(
            (result: any) => {
                console.log(result);
                this.treeNode = result.treeNode;
                this.dataNode = result.dataNode;
                console.log("GOT EN BOTH " + result.treeNode + ", " + result.dataNode);
            },
            (rcError: any) => {
                throw new Error(rcError);
            }
            ); // readOrCreateDataNodeInParentByName().subscribe(
        //       }, MAX_DB_INIT_TIME);

    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new AppState();
        }
        return this.instance;
    }

    getProperty(propertyName) {
        if (!this.dataNode || !this.dataNode.data) {
            throw new Error("app state not properly read");
        }
        if (!this.dataNode.data.hasOwnProperty(propertyName)) {
            throw new Error("no property by this name in dataNode");
        }

        console.log("getProperty(" + propertyName + ") = " +
            this.dataNode.data[propertyName]);

        return this.dataNode.data[propertyName];
    }

    updateProperty(propertyName: string, propertyValue: any) {
        let source: Observable<boolean> = Observable.create((observer) => {
            console.log("update(" + propertyName + ", " + propertyValue + ") ...");
            console.log("update(" + propertyName + ", " + propertyValue + ") ...");
            if (!this.dataNode) {
                console.log("state has no data node in update");
                // we expected to have read the state at least once
                // before calling update, which sets this.dataNode
                observer.error("state has no data node in update");
            }
            else if (!this.dataNode[DB_KEY_PATH]) {
                console.log("state has no key path in update");
                // we expected to have read the state at least once
                // before calling update, which tags on the property
                // DB_KEY_PATH onto the this.state's State object
                observer.error("state has no key path in update");
            }
            else if (!this.treeNode) {
                console.log("state has no tree node in update");
                // we expected to have read the state at least once
                // before calling update, which sets this.treeNode
                observer.error("state has no tree node in update");
            }
            else if (this.getProperty(propertyName) !== propertyValue) {
                console.log("property update ...");
                console.log(this.treeNode.dataKey);
                console.log(this.dataNode.data);
                // only not update if propertyValue is different
                // update in memory:
                this.dataNode.data[propertyName] = propertyValue;
                // update in DB:
                this.localDB.updateNodeData(this.treeNode, this.dataNode.data)
                    .subscribe(
                    (success: boolean) => {
                        console.log("update success");
                        observer.next(true);
                        observer.complete();
                    },
                    (error: any) => {
                        console.log("update error: " + error);
                        observer.error(error);
                    }
                    ); // updateNodeData().subscribe(
            }
            else {
                observer.next(false);
                observer.complete();
            }
        });
        return source;
    }
}
