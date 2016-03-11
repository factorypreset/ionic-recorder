import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Rx";
import {copyFromObject} from "../utils/utils";

// non-exported module globals

const DB_VERSION: number = 1;
const DB_TREE_STORE_NAME = "blobTree";
const DB_DATA_STORE_NAME: string = "dataTable";
const STORE_EXISTS_ERROR_CODE: number = 0;

// module exports

// use MAX_DB_INIT_TIME in setTimeout() calls after
// initializing DB.  This value is the longest we allow
// the DB to initialize.  If DB does not initialize 
// under this time (in msec) then some error will occur
export const MAX_DB_INIT_TIME = 600;
export const DB_NAME: string = "ionic-recorder-db";
export const DB_NO_KEY: number = 0;
export const DB_KEY_PATH: string = "id";

// NB: DB_KEY_PATH must be an optional field in both these interfaces

export interface DataNode {
    data: any;
    id?: number;
}

export interface TreeNode {
    name: string;
    parentKey: number;
    dataKey: number;
    timestamp: number;
    id?: number;
}

@Injectable()
export class LocalDB {
    // 'instance' is used as part of Singleton pattern implementation
    private static instance: LocalDB = null;
    private dbObservable: Observable<IDBDatabase> = null;
    private db: IDBDatabase = null;

    constructor() {
        if (!indexedDB) {
            throw new Error("Browser does not support indexedDB");
        }

        console.log("constructor():LocalDB");

        this.dbObservable = this.openDB();
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new LocalDB();
        }
        return this.instance;
    }

    validateId(id: number): boolean {
        return (
            id &&
            !isNaN(id) &&
            id > 0 &&
            id === Math.floor(id)
        );
    }

    isFolder(node: TreeNode) {
        return node.dataKey === DB_NO_KEY;
    }

    makeDataNode(newData: any): DataNode {
        if (typeof newData === "object" && newData.data) {
            return newData;
        }
        else {
            return {
                data: newData
            };
        }
    }

    makeTreeNode(name: string, parentKey: number, dataKey: number): TreeNode {
        return {
            name: name,
            parentKey: parentKey,
            dataKey: dataKey,
            timestamp: Date.now(),
        };
    };

    // Returns an Observable<IDBDatabase> of the db, just like openDB() does,
    // but this time it's a smarter one that checks to see if we already
    // have a DB opened, so that we don"t call open() more than once
    getDB() {
        // subscribe to dbObservable, which opens the db, but only
        // do so if you don"t already have the db opened before
        // (this is an example of chaining one observable (the one
        // returned) with another)
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            if (this.db) {
                console.log("... already got DB: " + this.db);
                observer.next(this.db);
                observer.complete();
            }
            else {
                this.dbObservable.subscribe(
                    (db: IDBDatabase) => {
                        console.log("... and the DB is: " + db);
                        this.db = db;
                        observer.next(db);
                        observer.complete();
                    },
                    (error) => {
                        observer.error(error);
                    }
                ); // dbObservable.subscribe(
            }
        });
        return source;
    }

    // Returns an Observable<IDBDatabase> of the db
    openDB() {
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let openRequest: IDBOpenDBRequest = indexedDB.open(
                DB_NAME, DB_VERSION);

            openRequest.onsuccess = (event: Event) => {
                observer.next(openRequest.result);
                observer.complete();
            };

            openRequest.onerror = (event: IDBErrorEvent) => {
                observer.error("open DB");
            };

            openRequest.onblocked = (event: IDBErrorEvent) => {
                observer.error("DB blocked");
            };

            // This function is called when the database doesn"t exist
            openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                try {
                    let treeStore: IDBObjectStore =
                        openRequest.result.createObjectStore(
                            DB_TREE_STORE_NAME,
                            { keyPath: DB_KEY_PATH, autoIncrement: true }
                        );

                    // index on name, parentKey and timestamp
                    treeStore.createIndex(
                        "name", "name", { unique: false });
                    treeStore.createIndex(
                        "parentKey", "parentKey", { unique: false });
                    treeStore.createIndex(
                        "timestamp", "timestamp", { unique: true });

                    // create internal data-table store
                    openRequest.result.createObjectStore(
                        DB_DATA_STORE_NAME,
                        { keyPath: DB_KEY_PATH, autoIncrement: true }
                    );
                }
                catch (error) {
                    let ex: DOMException = error;
                    if (ex.code !== STORE_EXISTS_ERROR_CODE) {
                        // ignore "store already exists" error
                        observer.error("create store");
                    }
                }
                console.log("openDB:onupgradeended DONE");
            }; // openRequest.onupgradeneeded =
        });
        return source;
    }

    // Returns an Observable<IDBObjectStore> of a store
    getStore(storeName: string, mode: string) {
        let source: Observable<IDBObjectStore> =
            Observable.create((observer) => {
                this.getDB().subscribe(
                    (db: IDBDatabase) => {
                        observer.next(
                            db.transaction(
                                storeName,
                                mode
                            ).objectStore(storeName)
                        );
                        observer.complete();
                    },
                    (error) => {
                        observer.error(error);
                    }
                ); // getDB().subscribe(
            });
        return source;
    }

    // Returns an Observable<IDBObjectStore> of the data store
    getDataStore(mode: string) {
        return this.getStore(DB_DATA_STORE_NAME, mode);
    }

    // Returns an Observable<IDBObjectStore> of the tree store
    getTreeStore(mode: string) {
        return this.getStore(DB_TREE_STORE_NAME, mode);
    }
    // Returns an Observable<bool> of the success in clearing
    clearStore(storeName: string) {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.getStore(storeName, "readwrite").subscribe(
                (store: IDBObjectStore) => {
                    store.clear();
                    observer.next(true);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
            ); // getStore().subscribe(
        });
        return source;
    }

    /*
    * START: generic low-level CRUD methods
    */

    // Returns an Observable<any> of the added item
    createStoreItem(storeName: string, item: any) {
        let source: Observable<any> = Observable.create((observer) => {
            if (!item) {
                observer.error("add falsy item");
            }
            else if (item[DB_KEY_PATH]) {
                observer.error("cannot create item when it has an id");
            }
            else {
                this.getStore(storeName, "readwrite").subscribe(
                    (store: IDBObjectStore) => {
                        let addRequest: IDBRequest = store.add(item);
                        addRequest.onsuccess = (event: IDBEvent) => {
                            item[DB_KEY_PATH] = addRequest.result;
                            observer.next(item);
                            observer.complete();
                        };
                        addRequest.onerror = (event: IDBEvent) => {
                            observer.error("add request");
                        };
                    },
                    (error) => {
                        observer.error(error);
                    }
                ); // getStore().subscribe(
            }
        });
        return source;
    }

    // Returns an Observable<any> of data item
    readStoreItem(storeName: string, id: number) {
        let source: Observable<any> = Observable.create((observer) => {
            if (!this.validateId(id)) {
                observer.error("invalid id");
            }
            else {
                this.getStore(storeName, "readonly").subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(id);

                        getRequest.onsuccess = (event: IDBEvent) => {
                            observer.next(getRequest.result);
                            observer.complete();
                        };

                        getRequest.onerror = (event: IDBErrorEvent) => {
                            observer.error("get request");
                        };
                    },
                    (error) => {
                        observer.error(error);
                    }
                ); // getStore().subscribe(
            }
        });
        return source;
    }

    // Returns an Observable<boolean> of success in updating item
    updateStoreItem(storeName: string, id: number, newItem: any) {
        console.log("updateStoreItem");
        let source: Observable<boolean> = Observable.create((observer) => {
            if (!this.validateId(id)) {
                observer.error("invalid id");
            }
            else {
                this.getStore(storeName, "readwrite").subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(id);

                        console.log("get store request succeeded !!! " +
                            id + " - " + getRequest.onsuccess);
                        console.log("get store request succeeded !!! " +
                            id + " - " + getRequest.onerror);

                        getRequest.onsuccess = (event: IDBEvent) => {
                            console.log("get request on success called ... ");
                            if (!getRequest.result) {
                                // request success, but we got nothing. ERROR:
                                // we expect what we're updating to be there
                                observer.error("no result to update");
                            }
                            else {
                                let putRequest: IDBRequest = store.put(
                                    copyFromObject(
                                        newItem,
                                        getRequest.result
                                    ));

                                putRequest.onsuccess =
                                    (event: IDBErrorEvent) => {
                                        // the id of the updated item is in
                                        // putRequest.result, verify it
                                        if (putRequest.result !== id) {
                                            observer.error("put: bad id");
                                        }
                                        else {
                                            observer.next(true);
                                            observer.complete();
                                        }
                                    };

                                putRequest.onerror =
                                    (event: IDBErrorEvent) => {
                                        observer.error("put request");
                                    };
                            }
                        }; // getRequest.onsuccess =

                        getRequest.onerror = (event: IDBErrorEvent) => {
                            observer.error("get request");
                        };
                        console.log("get store request succeeded !!! " +
                            id + " - " + getRequest.onsuccess);
                        console.log("get store request succeeded !!! " +
                            id + " - " + getRequest.onerror);

                    },
                    (error) => {
                        observer.error(error);
                    }
                ); // getStore().subscribe(
            }
        });
        return source;
    }

    // Returns an Observable<boolean> of success in deleting item
    deleteStoreItem(storeName: string, id: number) {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.getStore(storeName, "readwrite").subscribe(
                (store: IDBObjectStore) => {
                    let deleteRequest: IDBRequest = store.delete(id);

                    deleteRequest.onsuccess = (event: IDBEvent) => {
                        observer.next(true);
                        observer.complete();
                    };

                    deleteRequest.onerror = (event: IDBErrorEvent) => {
                        observer.error("delete request");
                    };
                },
                (error) => {
                    observer.error(error);
                }
            ); // getStore().subscribe(
        });
        return source;
    }

    /*
     * END: generic low-level CRUD methods
     */

    /*
     * START: TreeStore- / DataStore- specific methods
     */

    // Returns observable<DataNode> of data store item created, it has id
    // set on it to the new key assigned to it by the databse
    createDataStoreItem(data: any) {
        let source: Observable<DataNode> = Observable.create((observer) => {
            this.createStoreItem(DB_DATA_STORE_NAME,
                this.makeDataNode(data)).subscribe(
                (dataNode: DataNode) => {
                    observer.next(dataNode);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
                ); // this.createStoreItem().subscribe(
        });
        return source;
    }

    // Returns observable<TreeNode> of tree node created, it has id
    // set on it to the new key assigned to it by the databse
    createTreeStoreItem(name: string, parentKey: number, dataKey: number) {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.createStoreItem(DB_TREE_STORE_NAME,
                this.makeTreeNode(name, parentKey, dataKey)).subscribe(
                (treeNode: TreeNode) => {
                    observer.next(treeNode);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
                ); // this.createStoreItem().subscribe(
        });
        return source;
    }

    // Returns an Observable<boolean> of success in deleting item
    deleteDataStoreItem(id: number) {
        return this.deleteStoreItem(DB_DATA_STORE_NAME, id);
    }

    // Returns an Observable<boolean> of success in deleting item
    deleteTreeStoreItem(id: number) {
        return this.deleteStoreItem(DB_TREE_STORE_NAME, id);
    }

    /*
     * END: TreeStore- / DataStore- specific methods
     */

    ///////////////////////////////////////////////////////////////////////////
    // HIGH LEVEL API - these are the only functions you should be using
    //     TreeNode functions
    // We only have nodes, you can think of them as art of a tree (if you
    // pay attention to the parentKey field) or a flat data table that is
    // kept lightweight by not storing data in it, instead storing pointers
    // to the hefty data that resides in a separate table.  If you want to
    // use this as a flat structure, use parentKey of DB_NO_KEY. Names of all
    // items in this flat structure must be unique.  If you want to use this
    // as a tree, use parentKey to designate parent node, names must be
    // unique only among siblings of the same parent.
    ///////////////////////////////////////////////////////////////////////////

    // Returns an observble<TreeNode> of id of created tree node
    createNode(name: string, parentKey: number, data?: any) {
        if (data) {
            return this.createDataNodeInParent(name, parentKey, data);
        }
        else {
            return this.createFolderNodeInParent(name, parentKey);
        }
    }

    // Returns an Observable<TreeNode> of the id of this folder item
    // verifies name is unique among siblings in parent
    createFolderNodeInParent(name: string, parentKey: number) {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.readNodeByNameInParent(name, parentKey).subscribe(
                (nodeInParent: TreeNode) => {
                    if (nodeInParent) {
                        observer.error("unique name violation");
                    }
                    else {
                        this.createTreeStoreItem(name, parentKey, DB_NO_KEY)
                            .subscribe(
                            (treeNode: TreeNode) => {
                                observer.next(treeNode);
                                observer.complete();
                            },
                            (createError) => {
                                observer.error(createError);
                            }
                            ); // createTreeStoreItem().subscribe(
                    }
                },
                (readError) => {
                    observer.error(readError);
                }
            ); // readNodeByNameInParent().subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode> of the id of this data item
    // verifies name is unique among siblings in parent
    createDataNodeInParent(name: string, parentKey: number, data: any) {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            // non falsy data supplied, store it in the data table first
            this.readNodeByNameInParent(name, parentKey).subscribe(
                (nodeInParent: TreeNode) => {
                    if (nodeInParent) {
                        observer.error("unique name violation");
                    }
                    else {
                        this.createDataStoreItem(data).subscribe(
                            (dataNode: DataNode) => {
                                this.createTreeStoreItem(
                                    name,
                                    parentKey,
                                    dataNode[DB_KEY_PATH]).subscribe(
                                    (treeNode: TreeNode) => {
                                        observer.next(treeNode);
                                        observer.complete();
                                    },
                                    (createTreeItemError) => {
                                        observer.error(createTreeItemError);
                                    }
                                    ); // createTreeStoreItem().subscribe(
                            },
                            (createDataItemError) => {
                                observer.error(createDataItemError);
                            }
                        ); // createDataStoreItem().subscribe(
                    } // if (nodeInParent) { ... else { 
                },
                (readError) => {
                    observer.error(readError);
                }
            ); // readNodeByNameInParent().subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode> of the read tree node, no data returned
    // If a node with id 'id' is not in the tree, null TreeNode object is returned
    readNode(id: number) {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.readStoreItem(DB_TREE_STORE_NAME, id).subscribe(
                (treeNode: TreeNode) => {
                    if (!treeNode) {
                        observer.error("node does not exist");
                    }
                    treeNode[DB_KEY_PATH] = id;
                    observer.next(treeNode);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
            ); // this.readStoreItem().subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode[]> of all nodes obtained by name
    // regardless of where they are in the tree - this is a way to use
    // the tree as a key/value pair, by the way: just put the key in
    // name and the value goes in the data object of the node.  If nodes
    // by name 'name' exist under any parent, returns []
    readNodesByName(name: string) {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let nodes: TreeNode[] = [];
            this.getTreeStore("readonly").subscribe(
                (store: IDBObjectStore) => {
                    let index: IDBIndex = store.index("name"),
                        keyRange: IDBKeyRange = IDBKeyRange.only(name),
                        cursorRequest: IDBRequest = index.openCursor(keyRange);

                    cursorRequest.onsuccess = (event: IDBEvent) => {
                        let cursor: IDBCursorWithValue = cursorRequest.result;
                        if (cursor) {
                            // console.log("got item by name = " + name);
                            nodes.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            observer.next(nodes);
                            observer.complete();
                        }
                    };
                    cursorRequest.onerror = (event: IDBErrorEvent) => {
                        observer.error("cursor");
                    };
                },
                (error) => {
                    observer.error(error);
                }
            ); // getTreeStore().subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode> of node read by name 'name'
    // in parent folder whose id is 'parentKey'.  If such a node does
    // not exist the TreeNode object returned is null.
    readNodeByNameInParent(name: string, parentKey: number) {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.readNodesByName(name).subscribe(
                (nodes: TreeNode[]) => {
                    let nodeFound: TreeNode = null,
                        nFound: number = 0;
                    for (let i in nodes) {
                        if (nodes[i].parentKey === parentKey) {
                            nodeFound = nodes[i];
                            nFound++;
                            if (nFound > 1) {
                                break;
                            }
                        }
                    }
                    if (nFound > 1) {
                        observer.error("unique name violation");
                    }
                    else {
                        observer.next(nodeFound);
                        observer.complete();
                    }
                },
                (error) => {
                    observer.error(error);
                }
            ); // readNodesByName().subscribe(
        });
        return source;
    }

    // Returns an Observable<DataNode> of data store item 'data' field value
    readNodeData(treeNode: TreeNode) {
        let source: Observable<DataNode> = Observable.create((observer) => {
            this.readStoreItem(DB_DATA_STORE_NAME, treeNode.dataKey).subscribe(
                (dataNode: DataNode) => {
                    // assume data is an object and tag data store id onto it
                    if (dataNode[DB_KEY_PATH] !== treeNode.dataKey) {
                        observer.error("data store id mismatch");
                    }
                    else {
                        observer.next(dataNode);
                        observer.complete();
                    }
                },
                (error) => {
                    observer.error(error);
                }
            ); // this.readStoreItem().subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode[]> of all child nodes of parentNode
    readChildNodes(parentNode: TreeNode) {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let childNodes: TreeNode[] = [];
            this.getTreeStore("readonly").subscribe(
                (store: IDBObjectStore) => {
                    let index: IDBIndex = store.index("parentKey"),
                        idRange: IDBKeyRange =
                            IDBKeyRange.only(parentNode[DB_KEY_PATH]),
                        cursorRequest: IDBRequest = index.openCursor(idRange);

                    cursorRequest.onsuccess = (event: IDBEvent) => {
                        let cursor: IDBCursorWithValue = cursorRequest.result;
                        if (cursor) {
                            childNodes.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            observer.next(childNodes);
                            observer.complete();
                        }
                    };
                    cursorRequest.onerror = (event: IDBErrorEvent) => {
                        observer.error("cursor");
                    };
                },
                (error) => {
                    observer.error(error);
                }
            ); // getTreeStore().subscribe(
        });
        return source;
    }

    readOrCreateDataNodeInParentByName(
        name: string, parentKey: number, data: any) {
        let source: Observable<DataNode> =
            Observable.create((observer) => {
                this.readNodeByNameInParent(name, parentKey).subscribe(
                    (readTreeNode: TreeNode) => {
                        if (readTreeNode) {
                            console.log("data node already in DB ...");
                            // found a node in parent by name 'name'
                            this.readNodeData(readTreeNode).subscribe(
                                (dataNode: DataNode) => {
                                    // assume this always returns non null data
                                    observer.next(dataNode);
                                    observer.complete();
                                },
                                (readDataError: any) => {
                                    observer.error(readDataError);
                                } // readNodeData().subscribe(
                            );
                        } // if (node) {
                        else {
                            console.log("data node not in DB, creating it ...");
                            // no node in parent by name 'name', create it
                            this.createDataNodeInParent(
                                name, parentKey, data).subscribe(
                                (createdTreeNode: TreeNode) => {
                                    let dataNode: DataNode =
                                        this.makeDataNode(data);
                                    dataNode[DB_KEY_PATH] =
                                        createdTreeNode.dataKey;
                                    observer.next(dataNode);
                                    observer.complete();
                                },
                                (createError: any) => {
                                    observer.error(createError);
                                }
                                ); // .createDataNodeInParent().subscribe(
                        } // else {
                    },
                    (readNodeError: any) => {
                        observer.error(readNodeError);
                    }
                ); // readNodeByNameInParent().subscribe(
            });
        return source;
    }

    // Returns an Observable<boolean> of success in updating tree store item
    // Input is a tree node that has been updated already with new
    // field values, it must have the id property set to the right
    // id of the node in the tree store to update
    updateNode(treeNode: TreeNode) {
        return this.updateStoreItem(DB_TREE_STORE_NAME,
            treeNode[DB_KEY_PATH], treeNode);
    }

    // Returns an Observable<boolean> of success in updating data store item
    // only updates the data that treeNode points to, not the
    // treeNode itself
    updateNodeData(treeNode: TreeNode, newData: any) {
        console.log("updateNodeData: START " + newData);
        return this.updateStoreItem(
            DB_DATA_STORE_NAME,
            treeNode.dataKey,
            this.makeDataNode(newData)
        );
    }

    // Returns an Observable<boolean> of success in deleting items
    deleteDataNode(treeNode: TreeNode) {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.deleteDataStoreItem(treeNode.dataKey).subscribe(
                (success1: boolean) => {
                    this.deleteTreeStoreItem(treeNode[DB_KEY_PATH]).subscribe(
                        (success2: boolean) => {
                            observer.next(success1 && success2);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    ); // deleteTreeStoreItem().subscribe(
                },
                (error) => {
                    observer.error(error);
                }
            ); // deleteDataStoreItem().subscribe(
        });
        return source;
    }

    // Returns an Observable<boolean> of success in deleting treeNode
    // Recursively deletes tree node all the way down the tree
    // (in depth-first order)
    deleteFolderNode(treeNode: TreeNode) {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.deleteTreeStoreItem(treeNode[DB_KEY_PATH]).subscribe(
                (success: boolean) => {
                    this.readChildNodes(treeNode).subscribe(
                        (childNodes: TreeNode[]) => {
                            if (childNodes.length === 0) {
                                // observer is done if there are no children
                                observer.next(true);
                                observer.complete();
                            }
                            else {
                                // there are children, observer is done after
                                // we've deleted them all
                                Observable.fromArray(childNodes).subscribe(
                                    (childNode: TreeNode) => {
                                        this.deleteNode(childNode).subscribe(
                                            (success: boolean) => { },
                                            (childError) => {
                                                observer.error(childError);
                                            }
                                        ); // deleteNode().subscribe(
                                    },
                                    (arraySourceError) => {
                                        observer.error(arraySourceError);
                                    },
                                    () => {
                                        observer.next(true);
                                        observer.complete();
                                    }
                                ); // fromArray.subscribe(
                            }
                        },
                        (readChildNodesError) => {
                            observer.error(readChildNodesError);
                        }
                    ); // readChildNodes().subscribe(
                },
                (deleteSelfError) => {
                    observer.error(deleteSelfError);
                }
            ); // deleteTreeStoreItem().subscribe(
        });
        return source;
    }

    // Returns an Observable<boolean> of success in deleting treeNode
    deleteNode(treeNode: TreeNode) {
        if (this.isFolder(treeNode)) {
            return this.deleteFolderNode(treeNode);
        }
        else {
            return this.deleteDataNode(treeNode);
        }
    }
}
