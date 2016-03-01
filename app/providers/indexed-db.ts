import {Injectable} from 'angular2/core';


const DB_NAME = 'ionic-recorder-db';
const DB_VERSION = 1;
const DB_STORE_NAME = 'blobs';
const STORE_KEY_PATH = 'id';

// needed to cast at onSliderChange() below to avoid type warnings
interface IDBEventTarget extends EventTarget {
    result: number;
}

interface IDBEvent extends Event {
    target: IDBEventTarget;
}

export class BlobData {
    title: string;
    duration: number;
    timestamp: number;
    blob: Blob;
}


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
            // create an object store to hold saved recording blobs
            let store: IDBObjectStore = this.db.createObjectStore(
                DB_STORE_NAME,
                { keyPath: STORE_KEY_PATH, autoIncrement: true });
            // index to search recordings by title
            // store.createIndex('title', 'title', { unique: true });
            // index to search recordings by date
            // store.createIndex('date', 'date', { unique: false });
            console.log('openDb:onupgradeended DONE');
        }
    }

    addBlobData(blob: Blob, title: string, durationMsec: number, date: number,
        successCallback: Function) {
        let transaction: IDBTransaction = this.db.transaction(
            DB_STORE_NAME, 'readwrite'),
            store: IDBObjectStore = transaction.objectStore(DB_STORE_NAME);
        try {
            let addRequest: IDBRequest = store.add({
                blob: blob,
                title: title,
                durationMsec: durationMsec,
                date: date
            });
            addRequest.onsuccess = function(event: IDBEvent) {
                console.log('Success adding to DB, key=' + event.target.result);
                successCallback(event.target.result);
            }
            addRequest.onerror = function() {
                console.log('Error writing blob data to DB');
            }
        }
        catch (error) {
            throw Error('Could not add blob to DB');
        }
    }

    getBlobData(key: number, successCallback: Function) {
        let request: IDBRequest = this.db.transaction(DB_STORE_NAME,
            'readonly').objectStore(DB_STORE_NAME).get(key);
        request.onsuccess = (event: IDBEvent) => {
            let result: Object = event.target.result;
            if (result) {
                successCallback(result);
            }
        }
    }
}
