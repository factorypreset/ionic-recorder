import {LocalDB, MAX_DB_INIT_TIME} from "../local-db/local-db";
import {AppState} from "./app-state";

const RANDOM_WORD_1: string =
    "1Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";
const RANDOM_WORD_2: string =
    "2Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";

export function main(): void {
    "use strict";

    let appState: AppState,
        localDB: LocalDB = LocalDB.Instance;

    beforeEach((done: Function) => {
        appState = AppState.Instance;
        localDB.getDB().subscribe(
            (database: IDBDatabase) => {
                console.log("got DB for tests!");
                done();
            },
            (error) => {
                fail(error);
            });
    });

    jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 2;

    describe("When appState initialized", () => {
        it("appState is not falsy", (done) => {
            setTimeout(() => {
                expect(appState).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });
/*
        it("can read lastSelectedTab to be 0", (done) => {
            setTimeout(() => {
                expect(appState.getProperty("lastSelectedTab")).toBe(0);
                done();
            }, MAX_DB_INIT_TIME);
        });

        it("can update lastSelectedTab to be 1", (done) => {
            setTimeout(() => {
                expect(appState.updateProperty("lastSelectedTab", 1)).not.toThrow();
                done();
            }, MAX_DB_INIT_TIME);
        });
  
                it("can read lastSelectedTab to be 1", (done) => {
                    setTimeout(() => {
                        expect(appState.getProperty("lastSelectedTab")).toBe(1);
                        done();
                    }, MAX_DB_INIT_TIME);
                });
        */
    });
}
