import {LocalDB, DB_DATA_TABLE_STORE_NAME, DB_NO_KEY} from "./local-db";


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

        it("has store: " + DB_STORE_NAME, () => {
            setTimeout(() => {
                expect(localDB.getObjectStore("readwrite")).not.toBeFalsy();
            }, MAX_DB_INIT_TIME);
        });

        it("has store: " + DB_DATA_TABLE_STORE_NAME, () => {
            setTimeout(() => {
                expect(localDB.getDb().transaction(DB_DATA_TABLE_STORE_NAME, "readwrite")
                    .objectStore(DB_STORE_NAME)).not.toBeFalsy();
            }, MAX_DB_INIT_TIME);
        });

        it("clears when empty", () => {
            setTimeout(() => {
                expect(localDB.clearObjectStore()).not.toThrow();
            }, MAX_DB_INIT_TIME);
        });

        it("addItem('', " + DB_NO_KEY + ") twice", () => {
            setTimeout(() => {
                expect(localDB.addItem("", DB_NO_KEY)).not.toThrow();
                expect(localDB.addItem("", DB_NO_KEY)).not.toThrow();
            }, MAX_DB_INIT_TIME);
        });

        it("clears when not empty", () => {
            setTimeout(() => {
                expect(localDB.clearObjectStore()).not.toThrow();
            }, MAX_DB_INIT_TIME);
        });

        it("addItem()->getItemByKey() loop", () => {
            let key: number = DB_NO_KEY,
                data: any = null;
            setTimeout(() => {
                expect(
                    localDB.addItem("", DB_NO_KEY, undefined, (key: number) => {
                        key = key;
                        localDB.getItemByKey(key, (data: any) => {
                            data = data;
                        });
                    })
                ).not.toThrow();
                expect(key).toEqual(1);
                expect(data).toEqual(undefined);
            }, MAX_DB_INIT_TIME);
        });
    });
}
