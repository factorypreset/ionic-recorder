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
            expect(localDB.getDB()).not.toBeFalsy();
        });

        it("both stores are available", () => {
            expect(localDB.getDataStore("readwrite")).not.toBeFalsy();
            expect(localDB.getTreeStore("readwrite")).not.toBeFalsy();
        });

        it("can clear stores twice in a row", () => {
            // we have to use bind() here, we cannot use
            //     expect(localDB.clearObjectStores()).not.toThrow();
            // (see: http://stackoverflow.com/questions/9500586)
            expect(localDB.clearObjectStores.bind(localDB)).not.toThrow();
            expect(localDB.clearObjectStores.bind(localDB)).not.toThrow();
        });

        // since we just cleared the db before, we know no items exist in it
        it("can try to retrieve an item with a non-existing key", () => {
            localDB.getItemByKey(1, (data: any) => {
                expect(data).toBe(undefined);
            });
        });
        
        it("cannot subscribe to parent observable w/no parent", () = {
            let parentItemsObservable: Observable<DBItem>;
        })
        /*
        it("can smart-add an item", () => {
            // expect(localDB.smartAdd.bind(localDB, )) 
        });
        */
    });

    describe("When two LocalDB instances are initialized", () => {
        it("should be equal (singleton test)", () => {
            localDB2 = LocalDB.Instance;
            expect(localDB2).toBe(localDB);
        });
    });
}
