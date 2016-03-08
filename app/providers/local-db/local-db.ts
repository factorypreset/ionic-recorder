import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Observable";


export const DB_NAME: string = "ionic-recorder-db";
export const DB_VERSION: number = 1;
export const DB_TREE_STORE_NAME = "blobTree";
export const DB_DATA_STORE_NAME: string = "dataTable";
export const DB_KEY_PATH: string = "id";
export const DB_NO_KEY: number = 0;

const STORE_EXISTS_ERROR_CODE: number = 0;


interface DBItem {
    id: number;

}

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

    // returns an Observable<IDBDatabase>, just like openDB() does,
    // but this time it's a smarter one that checks to see if we already
    // have a DB opened, so that we don"t call open() more than once
    getDB() {
        // subscribe to dbObservable, which opens the db, but only
        // do so if you don"t already have the db opened before
        // (this is an example of chaining one observable (the one
        // returned) with another)
        let obs: Observable<IDBDatabase> = Observable.create((observer) => {
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
                        observer.error("could not get DB");
                    },
                    () => {
                        console.log("done getting DB " + this.db);
                        observer.complete();
                    }
                );
            }
        });
        return obs;
    }

    // returns an Observable<IDBDatabase>
    openDB() {
        let obs: Observable<IDBDatabase> = Observable.create((observer) => {
            // console.log("IndexedDB:openDB() db:" + DB_NAME +
            //     ", version:" + DB_VERSION);
            let openRequest: IDBOpenDBRequest = indexedDB.open(
                DB_NAME, DB_VERSION);

            openRequest.onsuccess = (event: Event) => {
                // console.log("indexedDB.open().onsuccess(): " +
                //     openRequest.result);
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
                // console.log("openDB:onupgradeended START");
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
                        // ignore "store already exists" error
                        observer.error("Cannot create store");
                    }
                }
                // console.log("openDB:onupgradeended DONE");
            }; // openRequest.onupgradeneeded = ...
        }); // let obs: Observable<IDBDatabase> =

        return obs;
    }

    // returns an Observable<IDBObjectStore
    getStore(name: string, mode: string) {
        // subscribe to dbObservable, which opens the db, but only
        // do so if you don"t already have the db opened before
        // (this is an example of chaining one observable (the one
        // returned) with another)
        let obs: Observable<IDBObjectStore> = Observable.create((observer) => {
            this.getDB().subscribe(
                (db: IDBDatabase) => {
                    observer.next(
                        db.transaction(
                            DB_TREE_STORE_NAME,
                            mode
                        ).objectStore(DB_TREE_STORE_NAME)
                    );
                    observer.complete();
                },
                (error) => {
                    observer.error("could not get DB");
                },
                () => {
                    console.log("done getting DB " + this.db);
                    observer.complete();
                }
            );
        });

        return obs;
    }

    // returns an Observable<IDBObjectStore>
    getTreeStore(mode: string) {
        return this.getStore(DB_TREE_STORE_NAME, mode);
    }

    // returns an Observable<IDBObjectStore>
    getDataStore(mode: string) {
        return this.getStore(DB_DATA_STORE_NAME, mode);
    }

    // returns an Observable<IDBObjectStore>
    clearObjectStore(storeName: string) {
        // subscribe to dbObservable, which opens the db, but only
        // do so if you don"t already have the db opened before
        // (this is an example of chaining one observable (the one
        // returned) with another)
        let obs: Observable<IDBObjectStore> = Observable.create((observer) => {
            this.getStore(storeName, "readwrite").subscribe(
                (store: IDBObjectStore) => {
                    store.clear();
                    observer.next(store);
                    observer.complete();
                },
                (error) => {
                    observer.error("could not clear store");
                },
                () => {
                    console.log("done getting DB " + this.db);
                    observer.complete();
                }
            );
        });
        return obs;
    }

    // returns an Observable<IDBObjectStore[]>, clears both stores
    clearObjectStores() {
        // subscribe to dbObservable, which opens the db, but only
        // do so if you don"t already have the db opened before
        // (this is an example of chaining one observable (the one
        // returned with two other observables)
        let obs: Observable<IDBObjectStore[]> = Observable.create((observer) => {
            let objectStores: IDBObjectStore[] = [];
            this.clearObjectStore(DB_DATA_STORE_NAME).subscribe(
                (store: IDBObjectStore) => {
                    objectStores.push(store);
                    this.clearObjectStore(DB_TREE_STORE_NAME).subscribe(
                        (store: IDBObjectStore) => {
                            objectStores.push(store);
                            observer.next(objectStores);
                            observer.complete();
                        },
                        (error2) => {
                            observer.error("could not clear tree store 1/2");
                        },
                        () => {
                            console.log("COMPLETED NESTED OBSERVER");
                            observer.complete();
                        }
                    );
                },
                (error) => {
                    observer.error("could not clear data store 2/2");
                },
                () => {
                    console.log("COMPLETED PARENT OBSERVER");
                    observer.complete();
                }
            );
        });
        return obs;
    }
}

