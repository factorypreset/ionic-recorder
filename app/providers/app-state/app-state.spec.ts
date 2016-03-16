// Copyright (C) 2015, 2016 Tracktunes Inc

import {MAX_DB_INIT_TIME} from '../local-db/local-db';
import {AppState} from './app-state';


export function main(): void {
    'use strict';

    let appState: AppState = null;

    beforeEach((done: Function) => {
        appState = AppState.Instance;
        done();
    });

    jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 2;

    describe('When appState initialized', () => {
        it('appState is not falsy', (done) => {
            setTimeout(() => {
                expect(appState).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });
    });

    describe('When appState initialized again', () => {
        it('appState is not falsy', (done) => {
            setTimeout(() => {
                expect(appState).not.toBeFalsy();
                done();
            }, MAX_DB_INIT_TIME);
        });

        // reason we expect lastSelectedTab to be 0 is that in
        // test mode we never select a tab so it remains on 0
        it('can read lastSelectedTab to be 0', (done) => {
            setTimeout(() => {
                appState.getProperty('lastSelectedTab').subscribe(
                    (tabIndex: number) => {
                        expect(tabIndex).toBe(0);
                        done();
                    },
                    (error: any) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it('can update lastSelectedTab to be 1', (done) => {
            setTimeout(() => {
                appState.updateProperty('lastSelectedTab', 1).subscribe(
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

        it('update again lastSelectedTab to be 1 does nothing', (done) => {
            setTimeout(() => {
                appState.updateProperty('lastSelectedTab', 1).subscribe(
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

        it('can read lastSelectedTab to be 1', (done) => {
            setTimeout(() => {
                appState.getProperty('lastSelectedTab').subscribe(
                    (tabIndex: number) => {
                        expect(tabIndex).toBe(1);
                        done();
                    },
                    (error: any) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

    });
}
