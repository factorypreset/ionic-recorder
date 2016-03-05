import {Injectable} from 'angular2/core';


const STORE_EXISTS_ERROR_CODE: number = 0;
const DB_DATA_TABLE_STORE_NAME: string = 'dataTable';
const DB_NO_KEY: number = 0;

@Injectable()
export class LocalDB {
    private db: IDBDatabase;

    constructor(private dbName: string,
        private dbVersion: number,
        private dbStoreName: string,
        private storeKeyPath: string = 'id') {
        console.log('constructor():IndexedDB');
        if (!indexedDB) {
            throw Error('Browser does not support indexedDB');
        }
        this.openDb();
    }

    openDb() {
        console.log('IndexedDB:openDb() db:' + this.dbName +
            ', version:' + this.dbVersion);
        let openRequest: IDBOpenDBRequest = indexedDB.open(
            this.dbName, this.dbVersion);

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
            try {
                let treeStore: IDBObjectStore = this.db.createObjectStore(
                    this.dbStoreName,
                    { keyPath: this.storeKeyPath, autoIncrement: true });
                // index to search recordings by name
                treeStore.createIndex('name', 'name', { unique: false });

                // create data-table
                this.db.createObjectStore(DB_DATA_TABLE_STORE_NAME,
                    { keyPath: 'id', autoIncrement: true });
            }
            catch (error) {
                let ex: DOMException = error;
                if (ex.code !== STORE_EXISTS_ERROR_CODE) {
                    // we ignore the error that says store already exists,
                    // just throw any other error
                    throw Error('Error(' + ex.code + '): ' + ex.message);
                }
            }

            console.log('openDb:onupgradeended DONE');
        }
    }

    clearObjectStore() {
        console.log('clearObjectStore() db: ' + this.db);
        console.log(this.dbStoreName);
        console.log('clearObjectStore() db.transaction: ' +
            this.db.transaction(this.dbStoreName, 'readwrite'));

        try {
            let clearRequest: IDBRequest = this.db.transaction(
                this.dbStoreName, 'readwrite').objectStore(
                this.dbStoreName).clear();

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

    addItemToTree(name: string, parentKey: number, dataTableKey: number,
        data: any, callback?: (key: number) => void) {
        console.log('addItemToTree(' + name + ', ' + parentKey + ', ' +
            dataTableKey + ', ' + callback+')');
        let addRequest: IDBRequest = this.db.transaction(
            this.dbStoreName, 'readwrite').objectStore(this.dbStoreName)
            .add({
                name: name,
                parentKey: parentKey,
                dataTableKey: dataTableKey,
                date: Date.now()
            });

        addRequest.onsuccess = (event: IDBEvent) => {
            console.log('addItemToTree(): success, key = ' +
                addRequest.result);
            callback && callback(addRequest.result);
        };

        addRequest.onerror = (event: IDBEvent) => {
            // assume unique constraint violation in 'name' index
            console.dir(event);
            throw Error('addItemToTree() error');
        };
    }
    
    // Adds an item to the tree as a child of parent with key 'parentKey'
    // If 'data' is not supplied, then the added item is a folder (and can
    // be a parent to other items), otherwise it's a data node (a leaf node).
    addItem(name: string, parentKey: number, data?: any,
        callback?: (key: number) => void) {
        console.log('addItem(name:' + name + ', parentKey:' + parentKey + ')');
        if (data) {
            // first add the data to the data-table and get the auto-
            // incremented key for it in the data-table
            let dataTableAddRequest: IDBRequest = this.db.transaction(
                DB_DATA_TABLE_STORE_NAME, 'readwrite').objectStore(
                DB_DATA_TABLE_STORE_NAME).add({ data: data });

            dataTableAddRequest.onsuccess = (event: IDBEvent) => {
                console.log('dataTableAddRequest success, key: = ' +
                    dataTableAddRequest.result);
                let dataTableKey: number = dataTableAddRequest.result;
                this.addItemToTree(name, parentKey, dataTableKey, callback);
            };

            dataTableAddRequest.onerror = (event: IDBEvent) => {
                console.dir(event);
                throw Error('dataTableAddRequest error ' + event);
            };
        }
        else {
            // no data, this is a folder
            this.addItemToTree(name, parentKey, DB_NO_KEY, callback);
        }
    }

    getItemByKey(key: number, callback: (data: any) => void) {
        let getRequest: IDBRequest = this.db.transaction(
            this.dbStoreName, 'readonly').objectStore(this.dbStoreName)
            .get(key);

        getRequest.onsuccess = (event: IDBEvent) => {
            console.log('Success getting an item with key=' + key);
            callback(getRequest.result);
        }

        getRequest.onerror = (event: IDBErrorEvent) => {
            throw Error('Error in store.get(), errorCode: ' +
                event.target.errorCode);
        }
    }

    getItemByName(name: string, callback: (data: any) => void) {
        let getRequest: IDBRequest = this.db.transaction(
            this.dbStoreName, 'readonly').objectStore(this.dbStoreName)
            .index('name').get(name);

        getRequest.onsuccess = (event: IDBEvent) => {
            callback(event.target.result);
        }

        getRequest.onerror = (event: IDBErrorEvent) => {
            throw Error('Error in store.get(), errorCode: ' +
                event.target.errorCode);
        }
    }
}
