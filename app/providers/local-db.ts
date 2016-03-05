import {Injectable} from 'angular2/core';


const DB_NAME = 'ionic-recorder-db';
const DB_VERSION = 2;
const DB_STORE_NAME = 'blobTree';
const STORE_KEY_PATH = 'id';
const UNFILED_FOLDER_NAME = 'Unfiled';


@Injectable()
export class LocalDB {
    private db: IDBDatabase;

    constructor() {
        console.log('constructor():IndexedDB');
        if (!indexedDB) {
            throw Error('Browser does not support indexedDB');
        }
        this.openDb();
    }

    openDb() {
        console.log('IndexedDB:openDb() db:' + DB_NAME +
            ', version:' + DB_VERSION);
        let openRequest: IDBOpenDBRequest = indexedDB.open(
            DB_NAME, DB_VERSION);

        openRequest.onsuccess = (event: Event) => {
            console.log('openDb:onsuccess() db:' + openRequest.result);
            this.db = openRequest.result;
            console.log('openDb:onsuccess() END');
        }

        openRequest.onerror = (event: IDBErrorEvent) => {
            console.log('openDb:onerror()');
            throw Error('Error in indexedDB.open(), errorCode: ' +
                event.target.errorCode);
        }

        openRequest.onblocked = (event: IDBErrorEvent) => {
            console.log('openDb:onblocked()');
            throw Error('Error in indexedDB.open(), errorCode: ' +
                event.target.errorCode);
        }

        // This function is called when the database doesn't exist
        openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            console.log('openDb:onupgradeended START');
            this.db = openRequest.result;
            let store: IDBObjectStore = this.db.createObjectStore(
                DB_STORE_NAME,
                { keyPath: STORE_KEY_PATH, autoIncrement: true });
            // index to search recordings by name
            // store.createIndex('name', 'name', { unique: true });
            // index to search recordings by date
            // store.createIndex('date', 'date', { unique: false });
            console.log('openDb:onupgradeended DONE');
        }
    }

    clearObjectStore() {
        console.log('clearObjectStore() db: ' + this.db);
        console.log(DB_STORE_NAME);
        console.log('clearObjectStore() db.transaction: ' +
            this.db.transaction(DB_STORE_NAME, 'readwrite'));
        
        //console.dir(this.db);
        try {
            let clearRequest: IDBRequest = this.db.transaction(
                DB_STORE_NAME, 'readwrite').objectStore(DB_STORE_NAME).clear();

            clearRequest.onsuccess = function(event: Event) {
                console.log('IndexedDB Store cleared');
            }

            clearRequest.onerror = (event: IDBErrorEvent) => {
                throw Error('Error in store.clear(), errorCode: ' +
                    event.target.errorCode);
            }
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    
    // Adds an item to the tree as a child of parent with key 'parentKey'
    // If 'blob' is not supplied, then the added item is a folder (and can
    // be a parent to other items), otherwise it's a blob (a leaf node). 
    addItem(name: string, parentKey: number, blob?: Blob,
        callback?: (key: number) => void) {
        console.log('addItem()');
        try {
            let addRequest: IDBRequest = this.db.transaction(DB_STORE_NAME,
                'readwrite').objectStore(DB_STORE_NAME).add({
                    name: name,
                    parentKey: parentKey,
                    blob: blob,
                    date: Date.now()
                });
            addRequest.onsuccess = (event: IDBEvent) => {
                console.log('addItem:onsuccess');
                console.log('Success adding item to DB, key=' +
                    addRequest.result);
                callback && callback(addRequest.result);
            }

            addRequest.onerror = (event: IDBErrorEvent) => {
                console.log('addItem:onerror');
                throw Error('Error in store.add(), errorCode: ' +
                    event.target.errorCode);
            }
        }
        catch (error) {
            throw Error(error.message);
        }
    }

    getItem(key: number, callback: (data: any) => void) {
        let getRequest: IDBRequest = this.db.transaction(DB_STORE_NAME,
            'readonly').objectStore(DB_STORE_NAME).get(key);

        getRequest.onsuccess = (event: IDBEvent) => {
            console.log('Success getting an item with key=' + key);
            callback(getRequest.result);
        }

        getRequest.onerror = (event: IDBErrorEvent) => {
            throw Error('Error in store.get(), errorCode: ' +
                event.target.errorCode);
        }
    }

}
