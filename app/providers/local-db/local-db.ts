import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Observable";


export const DB_NAME: string = "ionic-recorder-db";
export const DB_VERSION: number = 1;
export const DB_TREE_STORE_NAME = "blobTree";
export const DB_DATA_STORE_NAME: string = "dataTable";
export const DB_KEY_PATH: string = "id";
export const DB_NO_KEY: number = 0;

const STORE_EXISTS_ERROR_CODE: number = 0;


@Injectable()
export class LocalDB {
    // Singleton pattern implementation
    private static instance: LocalDB = null;

    private db: IDBDatabase = null;

    constructor() {
        console.log("constructor():IndexedDB");
        if (!indexedDB) {
            throw new Error("Browser does not support indexedDB");
        }

        this.openDB().subscribe(
            (db: IDBDatabase) => {
                console.log("... and the DB is: " + db);
                this.db = db;
            },
            (error) => {
                console.log("... could not get DB in AppState constructor!");
            },
            () => {
                console.log("... done getting DB " + this.db);
            }
        );
    }

    static get Instance() {
        if (!this.instance) {
            this.instance = new LocalDB();
        }
        return this.instance;
    }

    getDB() {
        if (!this.db) {
            throw new Error("DB not available!");
        }
        return this.db;
    }

    openDB() {
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            console.log("IndexedDB:openDB() db:" + DB_NAME +
                ", version:" + DB_VERSION);
            let openRequest: IDBOpenDBRequest = indexedDB.open(
                DB_NAME, DB_VERSION);

            openRequest.onsuccess = (event: Event) => {
                console.log("Success calling indexedDB.open(): " +
                    openRequest.result);
                // we got a db in openRequest.result - only 1 db, so quit
                observer.next(openRequest.result);
                observer.complete();
            };

            openRequest.onerror = (event: IDBErrorEvent) => {
                observer.error("Cannot open DB");
            };

            openRequest.onblocked = (event: IDBErrorEvent) => {
                observer.error("DB blocked");
            };

            // This function is called when the database doesn"t exist
            openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                console.log("openDB:onupgradeended START");
                try {
                    let treeStore: IDBObjectStore =
                        openRequest.result.createObjectStore(
                            DB_TREE_STORE_NAME,
                            { keyPath: DB_KEY_PATH, autoIncrement: true }
                        );

                    // index on name and parentKey
                    treeStore.createIndex("name", "name", { unique: false });
                    treeStore.createIndex(
                        "parentKey", "parentKey", { unique: false });

                    // create internal data-table store
                    openRequest.result.createObjectStore(
                        DB_DATA_STORE_NAME,
                        { keyPath: DB_KEY_PATH, autoIncrement: true }
                    );
                }
                catch (error) {
                    let ex: DOMException = error;
                    if (ex.code !== STORE_EXISTS_ERROR_CODE) {
                        // ignore 'store already exists' error
                        observer.error("Cannot create store");
                    }
                }
                console.log("openDB:onupgradeended DONE");
            }; // openRequest.onupgradeneeded = ...            
        }); // let obs: Observable<IDBDatabase> = 

        return source;
    }

    getStore(name: string, mode: string) {
        return this.getDB().transaction(DB_TREE_STORE_NAME, mode)
            .objectStore(DB_TREE_STORE_NAME);
    }

    getTreeStore(mode: string) {
        return this.getStore(DB_TREE_STORE_NAME, mode);
    }

    getDataStore(mode: string) {
        return this.getStore(DB_DATA_STORE_NAME, mode);
    }

    clearObjectStores() {
        let clearTreeStoreRequest: IDBRequest =
            this.getTreeStore("readwrite").clear();

        clearTreeStoreRequest.onsuccess = function(event: Event) {
            console.log("tree Store cleared");
        };

        clearTreeStoreRequest.onerror = (event: IDBErrorEvent) => {
            throw new Error("Tree store.clear() failed");
        };

        let clearDataStoreRequest: IDBRequest =
            this.getDataStore("readwrite").clear();

        clearDataStoreRequest.onsuccess = function(event: Event) {
            console.log("data Store cleared");
        };

        clearDataStoreRequest.onerror = (event: IDBErrorEvent) => {
            throw new Error("data store.clear() failed");
        };
    };

    getItemByKey(
        key: number,
        callback: (data: any) => void) {

        let getRequest: IDBRequest =
            this.getTreeStore("readonly").get(key);

        getRequest.onsuccess = (event: IDBEvent) => {
            console.log("got item " + getRequest.result + " with key " + key);
            callback && callback(getRequest.result);
        };

        getRequest.onerror = (event: IDBErrorEvent) => {
            throw new Error("Failed to get item by key ");
        };
    }

    /*
    parentItemsObservable(parentKey: number) {
        
    }
    getItemInParentByName(
        name: string,
        parentKey: number,
        callback: (data: any) => void) {

        this.getItemByKey(parentKey, (data: any) => {
            if (data === undefined) {
                // parent not found
            }
            
        });
    }
    */
    // if parent already has an item by that name, throw error
    // otherwise create a new item in the parent
    // - if it's a folder, do not add it to the data table, only add to tree
    // - if it's not a folder, add it to the data table first and
    //   then add it to the tree, in the tree only store its index
    smartAddItemToParent() {

    }
}

