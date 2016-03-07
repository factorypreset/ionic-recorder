import {LocalDB, DB_DATA_TABLE_STORE_NAME, DB_NO_KEY} from "./local-db";


const MAX_DB_INIT_TIME: number = 100;
const DB_NAME: string = "test-db";
const DB_VERSION: number = 1;
const DB_STORE_NAME: string = "test-store";


export function main(): void {
    "use strict";

    describe("LocalDB", () => {
        let localDB: LocalDB = null;

        beforeEach((done: Function) => {
            setTimeout(() => {
                localDB = new LocalDB(DB_NAME, DB_VERSION, DB_STORE_NAME, done);
            }, MAX_DB_INIT_TIME);
        });

        afterEach((done: Function) => {
            done();
        });

        it("initializes with a db", (done) => {
            // setTimeout(() => {
            expect(localDB.getDb()).not.toBeFalsy();
            done();
            // }, MAX_DB_INIT_TIME);
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
            let sentData: any = { a: 1, b: 2 },
                gotKey: number = DB_NO_KEY,
                gotData: any = null;
            setTimeout(() => {
                expect(
                    localDB.addItem("", DB_NO_KEY, undefined, (key: number) => {
                        throw Error();
                        gotKey = key;
                        localDB.getItemByKey(key, (data: any) => {
                            gotData = data;
                        });
                    })
                ).not.toThrow();
                expect(gotKey).toEqual(DB_NO_KEY);
                expect(gotData).toEqual(sentData);
            }, MAX_DB_INIT_TIME);
        });
    });
}
