import {MAX_DB_INIT_TIME} from "../local-db/local-db";
import {AppState} from "./app-state";

const RANDOM_WORD_1: string =
    "1Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";
const RANDOM_WORD_2: string =
    "2Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";

export function main(): void {
    "use strict";

    let appState: AppState = null;

    beforeEach((done: Function) => {
        appState = AppState.Instance;
        done();
    });

    jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 2;

    describe("When appState initialized", () => {
        it("appState is not falsy", (done) => {
            setTimeout(() => {
                expect(appState).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });
    });

    describe("When appState initialized again", () => {
        it("appState is not falsy", (done) => {
            setTimeout(() => {
                expect(appState).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });

        it("can read lastSelectedTab to be 0", (done) => {
            setTimeout(() => {
                expect(appState.getProperty("lastSelectedTab")).toBe(0);
                done();
            }, MAX_DB_INIT_TIME);
        });

        it("can update lastSelectedTab to be 1", (done) => {
            setTimeout(() => {
                appState.updateProperty("lastSelectedTab", 1).subscribe(
                    (updated: boolean) => {
                        expect(updated).toBe(true);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("update again lastSelectedTab to be 1 does nothing", (done) => {
            setTimeout(() => {
                appState.updateProperty("lastSelectedTab", 1).subscribe(
                    (updated: boolean) => {
                        expect(updated).toBe(false);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can read lastSelectedTab to be 1", (done) => {
            setTimeout(() => {
                expect(appState.getProperty("lastSelectedTab")).toBe(1);
                done();
            }, MAX_DB_INIT_TIME);
        });

    });
}
