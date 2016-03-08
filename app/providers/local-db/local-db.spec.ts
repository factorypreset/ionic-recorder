import {LocalDB, DB_NO_KEY} from "./local-db";
import {Observable} from "rxjs/Rx";

const MAX_DB_INIT_TIME = 100;
const RANDOM_WORD: string =
    "aWh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";

export function main(): void {
    "use strict";

    let localDB: LocalDB = null,
        localDB2: LocalDB = null,
        db: IDBDatabase = null;

    beforeEach((done: Function) => {
        localDB = LocalDB.Instance;
        localDB.getDB().subscribe(
            (database: IDBDatabase) => {
                db = database;
            },
            (error) => {
                fail(error);
            },
            () => {
                done();
            }
        );
    });

    describe("When localDB initialized", () => {
        it("entire database can be deleted", (done) => {
            setTimeout(() => {
                let result: boolean = false;
                localDB.deleteDB().subscribe(
                    (success: boolean) => {
                        result = success;
                    },
                    (error) => {
                        fail(error);
                    },
                    () => {
                        expect(result).toBe(true);
                        done();
                    }
                );
            });
        }, MAX_DB_INIT_TIME);
    });

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
                let cachedCleared: number = 0;
                localDB.clearDB().subscribe(
                    (cleared: number) => {
                        cachedCleared = cleared;
                    },
                    (error) => {
                        fail();
                    },
                    () => {
                        expect(cachedCleared).toBe(2);
                        done();
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can add an item to the data store", (done) => {
            setTimeout(() => {
                let cachedKey: number = 0;
                localDB.addDataItem(RANDOM_WORD).subscribe(
                    (key: number) => {
                        cachedKey = key;
                    },
                    (error) => {
                        fail();
                    },
                    () => {
                        expect(cachedKey).toBe(2);
                        done();
                    }
                );
            }, MAX_DB_INIT_TIME);
        });
    });
}