import {LocalDB, DB_NO_KEY} from "./local-db";
import {Observable} from "rxjs/Rx";

const MAX_DB_INIT_TIME = 200;
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
                        expect(key).toBeGreaterThan(0);
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