import {LocalDB} from "./local-db";


const MAX_DB_INIT_TIME: number = 100;
const DB_NAME: string = "test-db";
const DB_VERSION: number = 1;
const DB_STORE_NAME: string = "test-store";


let localDB: LocalDB = null;


export function main(): void {
    "use strict";

    describe("LocalDB", () => {

        beforeEach(() => {
            localDB = new LocalDB(DB_NAME, DB_VERSION, DB_STORE_NAME);
        });

        it("initializes with a db", () => {
            setTimeout(() => {
                expect(localDB.getDb()).not.toBeFalsy();
            }, MAX_DB_INIT_TIME);
        });

        it("initializes with constructor data table store (readonly) transaction", () => {
            setTimeout(() => {
                expect(localDB.getDb().transaction(DB_STORE_NAME, "readonly")
                    .objectStore(DB_STORE_NAME)).not.toBeFalsy();
            }, MAX_DB_INIT_TIME);
        });

        it("initializes with constructor data table store (readwrite) transaction", () => {
            setTimeout(() => {
                expect(localDB.getDb().transaction(DB_STORE_NAME, "readwrite")
                    .objectStore(DB_STORE_NAME)).not.toBeFalsy();
            }, MAX_DB_INIT_TIME);
        });

        it("getObjectStore(readonly)", () => {
            setTimeout(() => {
                expect(localDB.getObjectStore("readonly")).not.toBeFalsy();
            }, MAX_DB_INIT_TIME);
        });

        it("getObjectStore(readwrite)", () => {
            setTimeout(() => {
                expect(localDB.getObjectStore("readwrite")).not.toBeFalsy();
            }, MAX_DB_INIT_TIME);
        });

    });
}
