import {Injectable} from 'angular2/core';


const DB_NAME = 'ionic-recorder-db';
const DB_VERSION = 1;
const DB_STORE_NAME = 'blobs';
const STORE_KEY_PATH = 'id';

@Injectable()
export class IndexedDB {
    private db: IDBDatabase;
    private openRequest: IDBOpenDBRequest;

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
        this.openRequest = indexedDB.open(DB_NAME, DB_VERSION);
        console.dir(this.openRequest);
        this.openRequest.onsuccess = (event: Event) => {
            this.db = this.openRequest.result;
            console.log('openDb:onsuccess DONE');
        }

        this.openRequest.onerror = (event: Event) => {
            console.error('Could not open database');
        }

        // NOTE: this function will only fire once the first time you create
        // the database
        this.openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            console.log('openDb:onupgradeended START');
            this.db = this.openRequest.result;
            let store: IDBObjectStore = this.db.createObjectStore(
                DB_STORE_NAME,
                { keyPath: STORE_KEY_PATH, autoIncrement: true });
            // index to search recordings by title
            store.createIndex('title', 'title', { unique: true });
            // index to search recordings by date
            store.createIndex('date', 'date', { unique: false });
            console.log('openDb:onupgradeended DONE');
        }
    }

    addBlob(blob: Blob, title: string) {
        let transaction: IDBTransaction = this.db.transaction(
            DB_STORE_NAME, 'readwrite'),
        store: IDBObjectStore = transaction.objectStore(DB_STORE_NAME);
        try {
            let addRequest: IDBRequest = store.add({
                blob: blob,
                title: title,
                date: Date()
            });
        }
        catch (error) {
            throw Error('Could not add blob to DB');
        }
    }
}
