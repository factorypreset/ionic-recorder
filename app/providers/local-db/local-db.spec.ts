import {LocalDB, DB_NAME} from "./local-db";
import {Observable} from "rxjs/Rx";

const MAX_DB_INIT_TIME = 200;
const RANDOM_WORD: string =
    "aWh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";

let request: IDBOpenDBRequest = indexedDB.deleteDatabase(DB_NAME);

request.onsuccess = function() {
    console.log("deleteDatabase: SUCCESS");
};

request.onerror = function() {
    console.log("deleteDatabase: ERROR");
};

request.onblocked = function() {
    console.log("deleteDatabase: BLOCKED");
};


export function main(): void {
    "use strict";

    let localDB: LocalDB = null,
        localDB2: LocalDB = null,
        db: IDBDatabase = null,
        addItemKey: number;

    beforeEach((done: Function) => {
        localDB = LocalDB.Instance;
        localDB.getDB().subscribe(
            (database: IDBDatabase) => {
                db = database;
                done();
            },
            (error) => {
                fail(error);
            }
        );
    });

    jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 100;
    describe("When localDB initialized", () => {
        it("localDB is not falsy", (done) => {
            setTimeout(() => {
                expect(localDB).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });

        it("indexedDB is available", (done) => {
            setTimeout(() => {
                expect(localDB.getDB()).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });
    });

    describe("When two LocalDB instances are initialized", () => {
        it("should be equal (singleton test)", (done) => {
            setTimeout(() => {
                localDB2 = LocalDB.Instance;
                expect(localDB2).toBe(localDB);
                done();
            }, MAX_DB_INIT_TIME);
        });
    });

    describe("When DB is available", () => {
        it("db is not falsy", (done) => {
            setTimeout(() => {
                expect(db).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });

        it("clears both stores, twice in a row without erring", (done) => {
            setTimeout(() => {
                localDB.clearDB().subscribe(
                    (cleared: number) => {
                        expect(cleared).toBe(2);
                        done();
                    },
                    (error) => {
                        fail();
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can add an item to the data store", (done) => {
            setTimeout(() => {
                localDB.addDataItem(RANDOM_WORD).subscribe(
                    (key: number) => {
                        // expect key to be 1 due to deleting db on each run
                        addItemKey = key;
                        expect(key).toBe(1);
                        done();
                    },
                    (error) => {
                        fail();
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can get the added item from the data store", (done) => {
            setTimeout(() => {
                localDB.getDataItem(addItemKey).subscribe(
                    (data: any) => {
                        expect(data).toBe(RANDOM_WORD);
                        done();
                    },
                    (error) => {
                        fail();
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can delete the added item from the data store", (done) => {
            setTimeout(() => {
                localDB.deleteDataItem(addItemKey).subscribe(
                    (data: any) => {
                        expect(data).toBe(true);
                        done();
                    },
                    (error) => {
                        fail();
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot get the deleted item from the data store", (done) => {
            setTimeout(() => {
                localDB.getDataItem(addItemKey).subscribe(
                    (data: any) => {
                        expect(data).toBe(undefined);
                        done();
                    },
                    (error) => {
                        fail();
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

    });
}