import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Rx";


const STORE_EXISTS_ERROR_CODE: number = 0;
export const DB_DATA_TABLE_STORE_NAME: string = "dataTable";
export const DB_KEY_PATH: string = "id";
export const DB_NO_KEY: number = 0;


@Injectable()
export class LocalDB {
    // private db: IDBDatabase = null;
    private dbObservable: Observable<IDBDatabase>;

    constructor(
        private dbName: string,
        private dbVersion: number,
        private dbStoreName: string,
        done?: Function
    ) {
        console.log("constructor():IndexedDB");
        if (!indexedDB) {
            throw Error("Browser does not support indexedDB");
        }

        this.dbObservable = this.openDb();
    }

    getDbObservable() {
        return this.dbObservable;
    }

    openDb() {
        let obs: Observable<IDBDatabase> = Observable.create((observer) => {
            console.log("IndexedDB:openDb() db:" + this.dbName +
                ", version:" + this.dbVersion);
            let openRequest: IDBOpenDBRequest = indexedDB.open(
                this.dbName, this.dbVersion);

            openRequest.onsuccess = (event: Event) => {
                console.log("openDb:onsuccess() db:" + openRequest.result);
                observer.onNext(openRequest.result);
            };

            openRequest.onerror = (event: IDBErrorEvent) => {
                console.log("openDb:onerror()");
                throw Error("Error in indexedDB.open(), errorCode: " +
                    event.target.errorCode);
            };

            openRequest.onblocked = (event: IDBErrorEvent) => {
                console.log("openDb:onblocked()");
                throw Error("Error in indexedDB.open(), errorCode: " +
                    event.target.errorCode);
            };

            // This function is called when the database doesn"t exist
            openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                console.log("openDb:onupgradeended START");
                try {
                    let treeStore: IDBObjectStore = openRequest.result.createObjectStore(
                        this.dbStoreName,
                        { keyPath: DB_KEY_PATH, autoIncrement: true });

                    // index on name and parentKey
                    treeStore.createIndex("name", "name", { unique: false });
                    treeStore.createIndex(
                        "parentKey", "parentKey", { unique: false });

                    // create internal data-table store
                    openRequest.result.createObjectStore(DB_DATA_TABLE_STORE_NAME,
                        { keyPath: DB_KEY_PATH, autoIncrement: true });
                }
                catch (error) {
                    let ex: DOMException = error;
                    if (ex.code !== STORE_EXISTS_ERROR_CODE) {
                        // we ignore the error that says store already exists,
                        // just throw any other error
                        throw Error("Error(" + ex.code + "): " + ex.message);
                    }
                }
                observer.onNext(openRequest.result);

                console.log("openDb:onupgradeended DONE");
            }; // openRequest.onupgradeneeded = ...            
        }); // let obs: Observable<IDBDatabase> = 

        return obs;
    }

    /**
     * @param {string} mode either "readonly" or "readwrite"
     */
    getObjectStoreObservable(storeName: string, mode: string) {
        let obs: Observable<IDBObjectStore> = Observable.create((observer) => {
            console.log("getObjectStore:" + storeName);
            this.dbObservable.subscribe(
                (db: IDBDatabase) => {
                    observer.onNext(db.transaction(storeName, mode)
                        .objectStore(storeName));
                });
        });

        return obs;
    }

    clearObjectStore() {
        this.getObjectStoreObservable(this.dbStoreName, "readwrite").subscribe(
            (store: IDBObjectStore) => {
                let clearRequest: IDBRequest = store.clear();

                clearRequest.onsuccess = function(event: Event) {
                    console.log("IndexedDB Store cleared");
                };

                clearRequest.onerror = (event: IDBErrorEvent) => {
                    throw Error("Error in store.clear(), errorCode: " +
                        event.target.errorCode);
                };
            });
    }

    addItemToTree(
        name: string,
        parentKey: number,
        dataTableKey: number,
        data: any,
        callback?: (key: number) => void) {

        console.log("addItemToTree(" + name + ", " + parentKey + ", " +
            dataTableKey + ", " + callback + ")");

        let addRequest: IDBRequest = this.getObjectStore("readwrite").add({
            name: name,
            parentKey: parentKey,
            dataTableKey: dataTableKey,
            date: Date.now()
        });

        addRequest.onsuccess = (event: IDBEvent) => {
            console.log("addItemToTree(): success, key = " +
                addRequest.result);
            callback && callback(addRequest.result);
        };

        addRequest.onerror = (event: IDBEvent) => {
            // assume unique constraint violation in "name" index
            console.dir(event);
            throw Error("addItemToTree() error");
        };
    }

    // Adds an item to the tree as a child of parent with key "parentKey"
    // If "data" is not supplied, then the added item is a folder (and can
    // be a parent to other items), otherwise it"s a data node (a leaf node).
    addItem(
        name: string,
        parentKey: number,
        data?: any,
        callback?: (key: number) => void) {

        console.log("addItem(" + name + ", " + parentKey + ")");

        if (data) {
            // first add the data to the data-table and get the auto-
            // incremented key for it in the data-table
            let dataTableAddRequest: IDBRequest =
                this.getObjectStore("readwrite").add({ data: data });

            dataTableAddRequest.onsuccess = (event: IDBEvent) => {
                console.log("dataTableAddRequest success, key: = " +
                    dataTableAddRequest.result);
                let dataTableKey: number = dataTableAddRequest.result;
                this.addItemToTree(name, parentKey, dataTableKey, callback);
            };

            dataTableAddRequest.onerror = (event: IDBEvent) => {
                console.dir(event);
                throw Error("dataTableAddRequest error " + event);
            };
        }
        else {
            // no data, this is a folder
            this.addItemToTree(name, parentKey, DB_NO_KEY, callback);
        }
    }

    getItemByKey(
        key: number,
        callback: (data: any) => void) {
        let getRequest: IDBRequest =
            this.getObjectStore("readonly").get(key);

        getRequest.onsuccess = (event: IDBEvent) => {
            console.log("getItemByKey: success key = " + key);
            callback && callback(getRequest.result);
        };

        getRequest.onerror = (event: IDBErrorEvent) => {
            throw Error("getItemByKey Error, code = " +
                event.target.errorCode);
        };
    }

    getItemsByParentKey(
        parentKey: number,
        callback: (data: any) => void) {
        let store: IDBObjectStore = this.getObjectStore("readonly"),
            index: IDBIndex = store.index("parentKey"),
            keyRange: IDBKeyRange = IDBKeyRange.only(parentKey),
            cursorRequest: IDBRequest = index.openCursor(keyRange);

        cursorRequest.onsuccess = (event: IDBEvent) => {
            let cursor: IDBCursorWithValue = cursorRequest.result;
            console.log("getItemsByParentKey: SUCCESS parentKey: " +
                parentKey + ", cursor = " + cursor);
            // console.dir(event);
            if (cursor) {
                callback && callback(cursor.value);
                cursor.continue();
            }
        };

        cursorRequest.onerror = (event: IDBErrorEvent) => {
            throw Error("cursorItemByParentKey Error, code = " +
                event.target.errorCode);
        };
    }

    getItemsByName(
        name: string,
        callback: (data: any) => void) {
        let store: IDBObjectStore = this.getObjectStore("readonly"),
            index: IDBIndex = store.index("name"),
            keyRange: IDBKeyRange = IDBKeyRange.only(name),
            cursorRequest: IDBRequest = index.openCursor(keyRange);

        cursorRequest.onsuccess = (event: IDBEvent) => {
            console.log("getItemsByName: SUCCESS, name = " + name);
            console.dir(cursorRequest);
            let cursor: IDBCursorWithValue = cursorRequest.result;
            if (cursor) {
                callback && callback(cursor.value);
                cursor.continue();
            }
        };

        cursorRequest.onerror = (event: IDBErrorEvent) => {
            throw Error("getItemsByName ERROR, code = " +
                event.target.errorCode);
        };
    }

    smartUpdate(name: string, newData: any) {
        let store: IDBObjectStore = this.getObjectStore("readonly");
        let index: IDBIndex = store.index("name");
        let getRequest: IDBRequest = index.get(name);
        console.log("smartUpdate(" + name + ")");
        console.dir(store);
        getRequest.onsuccess = (event: IDBEvent) => {
            console.log("smartUpdate:getRequest SUCCESS, name = " +
                getRequest.result);
            // let data = getRequest.result;
            let putRequest: IDBRequest = store.put(newData);

            putRequest.onsuccess = (event: IDBEvent) => {
                console.log("smartUpdate:putRequest SUCCESS");
            };

            putRequest.onerror = (event: IDBErrorEvent) => {
                throw Error("smartUpdate:putRequest ERROR, code = " +
                    event.target.errorCode);
            };
        }; // getRequest.onsuccess = ...
    }

    iteratePath(key: number, callback?: (part: string) => void) {
        console.log("iteratePath on key = " + key);
        this.getItemByKey(key, (data: any) => {
            let parentKey: number = data.ParentKey;
            if (parentKey === DB_NO_KEY) {
                // we're at the top
                return "/";
            }
            else {
                this.iteratePath(parentKey, callback);
            }
        });
    }
}
