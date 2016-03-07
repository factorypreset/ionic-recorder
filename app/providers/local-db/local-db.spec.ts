import {LocalDB, DB_NO_KEY} from "./local-db";
import {Observable} from "rxjs/Rx";


export function main(): void {
    "use strict";

    let localDB: LocalDB = null,
        localDB2: LocalDB = null;

    beforeEach(() => {
        localDB = LocalDB.Instance;
    });

    describe("When localDB initialized", () => {
        it("localDB is not falsy", () => {
            expect(localDB).not.toBeFalsy();
        });

        it("indexedDB is available", () => {
            expect(localDB.getDb()).not.toBeFalsy();
        });

        it("both stores are available", () => {
                expect(localDB.getDataStore("readwrite")).not.toBeFalsy();
                expect(localDB.getTreeStore("readwrite")).not.toBeFalsy();
        });
    });

    describe("When two LocalDB instances are initialized", () => {
        it("should be equal (singleton test)", () => {
            localDB2 = LocalDB.Instance;
            expect(localDB2).toBe(localDB);
        });
    });
}
