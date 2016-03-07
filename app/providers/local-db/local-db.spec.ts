import {LocalDB} from "./local-db";

const MAX_DB_INIT_TIME: number = 100;

let localDB: LocalDB = null,
    dbName: string = "test-db",
    dbVersion: number = 1,
    dbStoreName = "test-store",
    db: IDBDatabase = null,
    transaction: IDBTransaction = null;

export function main(): void {
    "use strict";

    describe("LocalDB", () => {

        beforeEach(() => {
            localDB = new LocalDB(dbName, dbVersion, dbStoreName);
        });

        it("initializes with a db", () => {
            db = localDB.getDb();
            setTimeout(() => {
                expect(db).toBeDefined();
            }, MAX_DB_INIT_TIME);
        });

        it("initializes with constructor data table store (readonly) transaction", () => {
            setTimeout(() => {
                expect(db.transaction(dbStoreName, "readonly")
                    .objectStore(dbStoreName)).not.toBe(null);
            }, MAX_DB_INIT_TIME);
        });

        it("initializes with constructor data table store (readwrite) transaction", () => {
            setTimeout(() => {
                expect(db.transaction(dbStoreName, "readwrite")
                    .objectStore(dbStoreName)).not.toBe(null);
            }, MAX_DB_INIT_TIME);
        });
    });
}
