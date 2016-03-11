import {Injectable} from "angular2/core";
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
/*        
        setTimeout(() => {
            this.localDB.readOrCreateDataNodeInParentByName(
                STATE_NODE_NAME, DB_NO_KEY, DEFAULT_STATE).subscribe(
                (result: any) => {
                    console.log(result);
                    this.treeNode = result.treeNode;
                    this.dataNode = result.dataNode;
                },
                (rcError: any) => {
                    throw new Error(rcError);
                }
                ); // readOrCreateDataNodeInParentByName().subscribe(
        }, MAX_DB_INIT_TIME);
*/
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new AppState();
        }
        return this.instance;
    }

    // returns an Observable<TreeNode> of this.treeNode as it is in the db
    // by name STATE_NODE_NAME under parent DB_NO_KEY (root folder)
    readOrCreateDefaultState() {
        console.log("readOrCreateDefaultState() ...");
        this.localDB.readNodeByNameInParent(
            STATE_NODE_NAME, DB_NO_KEY).subscribe(
            (readTreeNode: TreeNode) => {
                this.treeNode = readTreeNode;
                if (this.treeNode) {
                    console.log("state already in DB ...");
                    // found a node in parent by name 'name'
                    this.localDB.readNodeData(this.treeNode).subscribe(
                        (dataNode: DataNode) => {
                            // assume this always returns non null data
                            this.dataNode = dataNode;
                            console.log("state obtained ... " +
                                "lastCreatedTab: " +
                                this.getProperty("lastSelectedTab") + " - " +
                                "lastViewedFolderKey: " +
                                this.getProperty("lastViewedFolderKey"));
                            console.dir(this.treeNode);
                            console.dir(this.dataNode);
                            console.dir(readTreeNode);
                        },
                        (readDataError: any) => {
                            throw new Error(readDataError);
                        } // readNodeData().subscribe(
                    );
                } // if (node) {
                else {
                    console.log("state not in DB, creating it ...");
                    // found no node in parent by name 'name', create it
                    this.localDB.createDataNodeInParent(
                        STATE_NODE_NAME, DB_NO_KEY, DEFAULT_STATE).subscribe(
                        (createdTreeNode: TreeNode) => {
                            this.treeNode = createdTreeNode;
                            this.dataNode =
                                this.localDB.makeDataNode(DEFAULT_STATE);
                            this.dataNode[DB_KEY_PATH] = createdTreeNode.dataKey;
                            console.log("state created ... " +
                                "lastCreatedTab: " +
                                this.getProperty("lastSelectedTab") + " - " +
                                "lastViewedFolderKey: " +
                                this.getProperty("lastViewedFolderKey"));
                            console.dir(this.treeNode);
                            console.dir(this.dataNode);
                            console.dir(readTreeNode);
                        },
                        (createError: any) => {
                            console.log("create error " + createError);
                            throw new Error(createError);
                        }
                        ); // .createDataNodeInParent().subscribe(
                } // else {
            },
            (readNodeError: any) => {
                throw new Error(readNodeError);
            }
            ); // readNodeByNameInParent().subscribe(
    }
    getTreeNode() {
        return this.treeNode;
    }
    getDataNode() {
        return this.dataNode;
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
        console.log("update(" + propertyName + ", " + propertyValue + ") ...");
        console.dir(this.getTreeNode());
        console.dir(this.getDataNode());
        console.log("update(" + propertyName + ", " + propertyValue + ") ...");
        if (!this.dataNode) {
            console.log("state has no data node in update");
            // we expected to have read the state at least once
            // before calling update, which sets this.dataNode
            throw Error("state has no data node in update");
        }
        if (!this.dataNode[DB_KEY_PATH]) {
            console.log("state has no key path in update");
            // we expected to have read the state at least once
            // before calling update, which tags on the property
            // DB_KEY_PATH onto the this.state's State object
            throw Error("state has no key path in update");
        }
        if (!this.treeNode) {
            console.log("state has no tree node in update");
            // we expected to have read the state at least once
            // before calling update, which sets this.treeNode
            throw Error("state has no tree node in update");
        }
        let treeNode: TreeNode = this.getTreeNode();
        let dataNode: DataNode = this.getDataNode();
        if (this.getProperty(propertyName) !== propertyValue) {
            console.log("property update ...");
            console.dir(treeNode);
            console.dir(dataNode);
            // only not update if propertyValue is different
            // update in memory:
            this.dataNode.data[propertyName] = propertyValue;
            // update in DB:
            this.localDB.updateNodeData(this.getTreeNode(), this.getDataNode().data)
                .subscribe(
                (success: boolean) => { console.log("update success"); },
                (error: any) => {
                    console.log("update error: " + error);
                    throw new Error(error);
                }
                ); // updateNodeData().subscribe(
        }
    }
}
