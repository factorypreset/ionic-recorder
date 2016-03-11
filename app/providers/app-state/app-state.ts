import {Injectable} from "angular2/core";
import {LocalDB, TreeNode, DataNode, DB_NO_KEY, DB_KEY_PATH}
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
    private localDB: LocalDB = LocalDB.Instance;
    private treeNode: TreeNode = null;
    private dataNode: DataNode = null;

    constructor() {
        console.log("constructor():AppState");
        this.readOrCreateDefaultState();
        // this.update("lastSelectedTab", 1);
        // console.log("and the updated lastSelectedTab is: " +
        //     this.get("lastSelectedTab"));
    }

    readOrCreateDefaultState() {
        this.localDB.readNodeByNameInParent(
            STATE_NODE_NAME, DB_NO_KEY).subscribe(
            (readTreeNode: TreeNode) => {
                this.treeNode = readTreeNode;
                if (this.treeNode) {
                    console.log("state already in DB...");
                    // found a node in parent by name 'name'
                    this.localDB.readNodeData(this.treeNode).subscribe(
                        (dataNode: DataNode) => {
                            // assume this always returns non null data
                            this.dataNode = dataNode;
                        },
                        (readDataError: any) => {
                            throw new Error(readDataError);
                        } // readNodeData().subscribe(
                    );
                } // if (node) {
                else {
                    // found no node in parent by name 'name', create it
                    this.localDB.createDataNodeInParent(
                        STATE_NODE_NAME, DB_NO_KEY, DEFAULT_STATE).subscribe(
                        (createdTreeNode: TreeNode) => {
                            this.treeNode = createdTreeNode;
                        },
                        (createError: any) => {
                            throw new Error(createError);
                        }
                        ); // .createDataNodeInParent().subscribe(
                }
            },
            (readNodeError: any) => {
                throw new Error(readNodeError);
            }
            ); // readNodeByNameInParent().subscribe(
    }

    get(propertyName) {
        if (!this.dataNode || !this.dataNode.data) {
            throw new Error("app state not properly read");
        }
        let stateValue: any = this.dataNode.data[propertyName];
        if (!stateValue) {
            // you're trying to update a non-existing propertyName
            throw new Error("non existing state property");
        }
        return stateValue;
    }

    update(propertyName: string, propertyValue: any) {
        if (!this.dataNode) {
            // we expected to have read the state at least once
            // before calling update, which sets this.dataNode
            throw Error("state has no data node in update");
        }
        if (!this.dataNode[DB_KEY_PATH]) {
            // we expected to have read the state at least once
            // before calling update, which tags on the property
            // DB_KEY_PATH onto the this.state's State object
            throw Error("state has no key path in update");
        }
        if (!this.treeNode) {
            // we expected to have read the state at least once
            // before calling update, which sets this.treeNode
            throw Error("state has no tree node in update");
        }
        let stateValue: any = this.dataNode.data[propertyName];
        if (!stateValue) {
            // you're trying to update a non-existing propertyName
            throw new Error("non existing state property");
        }
        else if (stateValue !== propertyValue) {
            // only not update if propertyValue is different
            // update in memory:
            this.dataNode.data[propertyName] = propertyValue;
            // update in DB:
            this.localDB.updateNodeData(this.treeNode, this.dataNode.data)
                .subscribe(
                (success: boolean) => { },
                (error: any) => {
                    throw new Error(error);
                }
                ); // updateNodeData().subscribe(
        }
    }
}
