import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Observable";

export const DB_NAME: string = "ionic-recorder-db";
export const DB_VERSION: number = 1;
export const DB_TREE_STORE_NAME = "blobTree";
export const DB_DATA_STORE_NAME: string = "dataTable";
export const DB_KEY_PATH: string = "id";
export const DB_NO_KEY: number = 0;

const STORE_EXISTS_ERROR_CODE: number = 0;

interface DataNode {
    data: any;
    id?: number;
}

interface TreeNode {
    name: string;
    parentKey: number;
    dataKey: number;
    date: number;
    id?: number;
}

const makeDataNode = function(item: any): DataNode {
    if (typeof item === "object") {
        if (item.data) {
            return item;
        }
        else {
            return { data: item };
        }
    }
    else {
        return { data: item };
    }
};

const makeTreeNode = function(name: string,
    parentKey: number, dataKey: number): TreeNode {
    return {
        name: name, parentKey:
        parentKey,
        dataKey: dataKey,
        date: Date.now()
    };
};

const isFolder = function(node: TreeNode) {
    return node.dataKey === DB_NO_KEY;
};

const verifyKey = function(key: number): boolean {
    return key && !isNaN(key) && (key === Math.floor(key));
};

const copyObject = function(objFrom: Object, objTo: Object): Object {
    console.log("copyObject(" + objFrom + "," + objTo + ")");
    for (let i in objFrom) {
        if (objFrom.hasOwnProperty(i)) {
            // console.log("copyObject: copying " + i);
            objTo[i] = objFrom[i];
        }
    }
    return objTo;
};

@Injectable()
export class LocalDB {
    // Singleton pattern implementation
    private static instance: LocalDB = null;
    private dbObservable: Observable<IDBDatabase> = null;
    private db: IDBDatabase = null;

    constructor() {
        console.log("constructor():IndexedDB");
        if (!indexedDB) {
            throw new Error("Browser does not support indexedDB");
        }

        this.dbObservable = this.openDB();
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new LocalDB();
        }
        return this.instance;
    }

    // returns an Observable<IDBDatabase> of the db, just like openDB() does,
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
                        observer.complete(db);
                    },
                    (error) => {
                        observer.error("get DB");
                    }
                );
            }
        });
        return source;
    }

    // returns an Observable<IDBDatabase> of the db
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

                    // index on name, parentKey and date
                    treeStore.createIndex("name", "name", { unique: false });
                    treeStore.createIndex(
                        "parentKey", "parentKey", { unique: false });
                    treeStore.createIndex("date", "date", { unique: true });

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
            }; // openRequest.onupgradeneeded = ...
        }); // let source: Observable<IDBDatabase> =
        return source;
    }

    // returns an Observable<IDBObjectStore of a store
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
                        observer.error("get DB");
                    }
                );
            });
        return source;
    }

    // returns an Observable<IDBObjectStore> of the data store
    getDataStore(mode: string) {
        return this.getStore(DB_DATA_STORE_NAME, mode);
    }

    // returns an Observable<IDBObjectStore> of the tree store
    getTreeStore(mode: string) {
        return this.getStore(DB_TREE_STORE_NAME, mode);
    }

    // returns an Observable<IDBObjectStore> of the store that was cleared
    clearStore(storeName: string) {
        let source: Observable<IDBObjectStore> =
            Observable.create((observer) => {
                this.getStore(storeName, "readwrite").subscribe(
                    (store: IDBObjectStore) => {
                        store.clear();
                        observer.next(store);
                        observer.complete();
                    },
                    (error) => {
                        observer.error("clear store");
                    }
                );
            });
        return source;
    }

    // returns an Observable<number> (number of stores cleared)
    // clears both stores
    clearBothStores() {
        // (this is an example of chaining one observable (the one
        // returned with two other observables)
        let source: Observable<number> = Observable.create((observer) => {
            let nCleared: number = 0;
            this.clearStore(DB_DATA_STORE_NAME).subscribe(
                (store: IDBObjectStore) => {
                    nCleared += 1;
                    this.clearStore(DB_TREE_STORE_NAME).subscribe(
                        (store: IDBObjectStore) => {
                            nCleared += 1;
                            observer.next(nCleared);
                            observer.complete();
                        },
                        (error2) => {
                            observer.error("clear tree store");
                        }
                    );
                },
                (error) => {
                    observer.error("clear data store");
                }
            );
        });
        return source;
    }

    // returns an Observable<number> of the added item's key
    createStoreItem(storeName: string, item: any) {
        let source: Observable<number> = Observable.create((observer) => {
            if (!item) {
                observer.error("add falsy item");
            }
            else {
                this.getStore(storeName, "readwrite").subscribe(
                    (store: IDBObjectStore) => {
                        let addRequest: IDBRequest = store.add(item);
                        addRequest.onsuccess = (event: IDBEvent) => {
                            observer.next(addRequest.result);
                            observer.complete();
                        };
                        addRequest.onerror = (event: IDBEvent) => {
                            observer.error("add request");
                        };
                    },
                    (error) => {
                        observer.error("get store");
                    }
                );
            }
        });
        return source;
    }

    createDataStoreItem(item: any) {
        return this.createStoreItem(
            DB_DATA_STORE_NAME,
            makeDataNode(item)
        );
    }

    createTreeStoreItem(name: string, parentKey: number, dataKey: number) {
        return this.createStoreItem(
            DB_TREE_STORE_NAME,
            makeTreeNode(name, parentKey, dataKey)
        );
    }

    // returns an Observable<any> of data item
    readStoreItem(storeName: string, key: number) {
        let source: Observable<any> = Observable.create((observer) => {
            if (!verifyKey(key)) {
                observer.error("invalid key");
            }
            else {
                this.getStore(storeName, "readonly").subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(key);

                        getRequest.onsuccess = (event: IDBEvent) => {
                            observer.next(getRequest.result);
                            observer.complete();
                        };

                        getRequest.onerror = (event: IDBErrorEvent) => {
                            observer.error("get request");
                        };
                    },
                    (error) => {
                        observer.error("get store");
                    }
                );
            }
        });
        return source;
    }

    // returns an Observable<any> of data item
    readDataStoreItem(key: number) {
        return this.readStoreItem(DB_DATA_STORE_NAME, key);
    }

    // returns an Observable<any> of data item
    readTreeStoreItem(key: number) {
        return this.readStoreItem(DB_TREE_STORE_NAME, key);
    }

    // returns an Observable<TreeNode[]> of all nodes obtained by name
    readTreeStoreItemsByName(name: string) {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let nodes: TreeNode[] = [];
            this.getTreeStore("readonly").subscribe(
                (store: IDBObjectStore) => {
                    let index: IDBIndex = store.index("name"),
                        keyRange: IDBKeyRange = IDBKeyRange.only(name),
                        cursorRequest: IDBRequest = index.openCursor(keyRange);

                    cursorRequest.onsuccess = (event: IDBEvent) => {
                        console.log("getItemsByName: SUCCESS, name = " + name);
                        console.dir(cursorRequest);
                        let cursor: IDBCursorWithValue = cursorRequest.result;
                        if (cursor) {
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
                    observer.error("get tree store");
                }
            );
        });
        return source;
    }

    // returns an Observable<true> of success in updating item
    updateStoreItem(storeName: string, key: number, newItem: any) {
        let source: Observable<boolean> = Observable.create((observer) => {
            if (!verifyKey(key)) {
                observer.error("invalid key");
            }
            else {
                this.getStore(storeName, "readwrite").subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(key);

                        getRequest.onsuccess = (event: IDBEvent) => {
                            if (!getRequest.result) {
                                // request success, but we got nothing. ERROR:
                                // we expect what we're updating to be there
                                observer.error("no result to update");
                            }
                            else {
                                if (getRequest.result.id !== key) {
                                    observer.error("item with no id");
                                }
                                else {
                                    let dbItem = getRequest.result,
                                        updatedItem: Object = copyObject(
                                            newItem,
                                            dbItem
                                        ),
                                        putRequest: IDBRequest =
                                            store.put(updatedItem);

                                    putRequest.onsuccess =
                                        (event: IDBErrorEvent) => {
                                            observer.next(true);
                                            observer.complete();
                                        };

                                    putRequest.onerror =
                                        (event: IDBErrorEvent) => {
                                            observer.error(
                                                "put request");
                                        };
                                }
                            };

                            getRequest.onerror = (event: IDBErrorEvent) => {
                                observer.error("get request");
                            };
                        }; // getRequest.onsuccess = 
                    },
                    (error) => {
                        observer.error("get store");
                    }
                );
            }
        });
        return source;
    }

    // returns an Observable<boolean> of success in updating item
    updateDataStoreItem(key: number, newItem: any) {
        return this.updateStoreItem(
            DB_DATA_STORE_NAME,
            key,
            makeDataNode(newItem)
        );
    }

    // returns an Observable<boolean> of success in updating item
    updateTreeStoreItem(key: number, newItem: any) {
        return this.updateStoreItem(DB_TREE_STORE_NAME, key, newItem);
    }

    // returns an Observable<boolean> of success in deleting item
    deleteStoreItem(storeName: string, key: number) {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.getStore(storeName, "readwrite").subscribe(
                (store: IDBObjectStore) => {
                    let deleteRequest: IDBRequest = store.delete(key);

                    deleteRequest.onsuccess = (event: IDBEvent) => {
                        observer.next(true);
                        observer.complete();
                    };

                    deleteRequest.onerror = (event: IDBErrorEvent) => {
                        observer.error("delete request");
                    };
                },
                (error) => {
                    observer.error("get store");
                }
            );
        });
        return source;
    }

    // returns an Observable<boolean> of success in deleting item
    deleteDataStoreItem(key: number) {
        return this.deleteStoreItem(DB_DATA_STORE_NAME, key);
    }

    // returns an Observable<boolean> of success in deleting item
    deleteTreeStoreItem(key: number) {
        return this.deleteStoreItem(DB_TREE_STORE_NAME, key);
    }

    ///////////////////////////////////////////////////////////////////////////
    // HIGH LEVEL CRUD FUNCTIONS
    ///////////////////////////////////////////////////////////////////////////

    createItem(name: string, parentKey?: number, data?: any) {
        if (!parentKey) {
            // if no parent key was supplied, assume it's in root folder
            parentKey = DB_NO_KEY;
        }

        if (!data) {
            return this.createTreeStoreItem(name, parentKey, DB_NO_KEY);
        }

        let source: Observable<number> = Observable.create((observer) => {
            // non falsy data supplied, store it in the data table first
            this.createDataStoreItem(data).subscribe(
                (key: number) => {
                    this.createTreeStoreItem(name, parentKey, key).subscribe(
                        (treeKey: number) => {
                            observer.next(treeKey);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
                },
                (error) => {
                    observer.error(error);
                }
            );
        });
        return source;
    }

}
