import {Injectable} from 'angular2/core';

// based on example at: 
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

const DB_NAME = 'ionic-recorder-db';
const DB_VERSION = 1;
const DB_STORE_NAME = 'blobs';

@Injectable()
export class IndexedDB {
    private db: IDBDatabase;
    private openRequest: IDBOpenDBRequest;

    constructor() {
        if (!window.indexedDB) {
            alert('Browser does not support a stable version of indexedDB');
        }
    }

    openDb() {
        let request: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION);

        this.openRequest.onsuccess = function(event) {
            this.db = this.openRequest.result;
            console.log('openDb:onsuccess DONE');
        }

        this.openRequest.onerror = function(event) {
            console.error('openDb:', this.openRequest.errorCode);
        }

        this.openRequest.onupgradeneeded = function(event: IDBVersionChangeEvent) {
            console.log('openDb:onupgradeended + oldVersion=' +
                event.oldVersion + ', newVersion=' + event.newVersion);
        }
    }
}
