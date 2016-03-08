import {LocalDB, DB_NO_KEY} from "./local-db";
import {Observable} from "rxjs/Rx";


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
                throw new Error("woops!");
            },
            () => {
                done();
            }
        );
    });

    describe("When localDB initialized", () => {
        it("localDB is not falsy", () => {
            expect(localDB).not.toBeFalsy();
        });

        it("indexedDB is available", () => {
            expect(localDB.getDB()).not.toBeFalsy();
        });
    });

    describe("When two LocalDB instances are initialized", () => {
        it("should be equal (singleton test)", () => {
            localDB2 = LocalDB.Instance;
            expect(localDB2).toBe(localDB);
        });
    });

    describe("When DB is available", () => {
        it("db is not falsy", () => {
            expect(db).not.toBeFalsy();
        });

        it("clears both stores, twice in a row without erring", () => {
            let storesArray: IDBObjectStore[] = [];
            localDB.clearObjectStores().subscribe(
                (stores: IDBObjectStore[]) => {
                    storesArray = stores;
                    expect(stores.length).toBe(2);
                },
                (error) => {
                    fail();
                },
                () => {
                    expect(storesArray.length).toBe(2);
                }
            );
        });
    });
}