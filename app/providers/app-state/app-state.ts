// Copyright (C) 2015, 2016 Tracktunes Inc

import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Rx';
import {LocalDB, TreeNode, DataNode, DB_NO_KEY, DB_KEY_PATH, MAX_DB_INIT_TIME}
from '../local-db/local-db';

interface State {
    lastSelectedTab: number;
    lastViewedFolderKey: number;
    unfiledFolderName: string;
    unfiledFolderKey: number;
    nTotalCheckedNodes: number;
}

// make sure APP_STATE_ITEM_NAME will never be entered by a user
export const STATE_NODE_NAME: string =
    'Kwj7t9X2PTsPwLquD9qvZqaApMP8LGRjPFENUHnvrpmUE25rkrYHhzf9KBEradAU';
const DEFAULT_STATE: State = {
    lastSelectedTab: 0,
    lastViewedFolderKey: DB_NO_KEY,
    unfiledFolderName: 'Unfiled',
    unfiledFolderKey: DB_NO_KEY,
    nTotalCheckedNodes: 0
};

@Injectable()
export class AppState {
    // 'instance' is used as part of Singleton pattern implementation
    private static instance: AppState = null;

    private localDB: LocalDB = LocalDB.Instance;
    private treeNode: TreeNode = null;
    private dataNode: DataNode = null;

    constructor() {
        console.log('constructor():AppState');

        this.localDB.waitForDB().subscribe(
            (db: IDBDatabase) => {
                this.localDB.readOrCreateDataNode(
                    STATE_NODE_NAME, DB_NO_KEY, DEFAULT_STATE).subscribe(
                    (result: any) => {
                        this.treeNode = result.treeNode;
                        this.dataNode = result.dataNode;
                        // Create Unfiled folder for the auto-save in record.ts
                        this.localDB.readOrCreateFolderNode(
                            DEFAULT_STATE.unfiledFolderName, DB_NO_KEY)
                            .subscribe(
                            (unfiledFolderNode: TreeNode) => {
                                this.updateProperty(
                                    'unfiledFolderKey',
                                    unfiledFolderNode[DB_KEY_PATH]
                                ).subscribe(
                                    (result: boolean) => {
                                    },
                                    (updateError: any) => {
                                        throw new Error(updateError);
                                    }
                                    ); // updateProperty().subscribe(
                            },
                            (rcFolderError: any) => {
                                throw new Error(rcFolderError);
                            }
                            ); // readOrCreateFolderNode().su ...
                    },
                    (rcDataError: any) => {
                        throw new Error(rcDataError);
                    }
                    ); // readOrCreateDataNode().subscribe(
            },
            (waitError: any) => {
                throw new Error(waitError);
            }
        ); // waitForDB().subscribe(
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new AppState();
        }
        return this.instance;
    }

    // returns an Observable<any> of the value
    getProperty(propertyName) {
        let source: Observable<any> = Observable.create((observer) => {
            this.localDB.waitForDB().subscribe(
                (db: IDBDatabase) => {
                    if (!this.dataNode || !this.dataNode.data) {
                        observer.error('app state not properly read');
                    }
                    if (!this.dataNode.data.hasOwnProperty(propertyName)) {
                        observer.error('no property by this name in dataNode');
                    }
                    observer.next(this.dataNode.data[propertyName]);
                    observer.complete();
                },
                (waitError: any) => {
                    observer.error(waitError);
                }
            ); // waitForDB().subscribe(
        });
        return source;
    }

    // NOTE: we don't need the waitForDB() observable here because
    // it happens inside updateNodeData()
    updateProperty(propertyName: string, propertyValue: any) {
        let source: Observable<boolean> = Observable.create((observer) => {
            if (!this.dataNode) {
                // we expected to have read the state at least once
                // before calling update, which sets this.dataNode
                observer.error('state has no data node in update');
            }
            else if (!this.dataNode[DB_KEY_PATH]) {
                // we expected to have read the state at least once
                // before calling update, which tags on the property
                // DB_KEY_PATH onto the this.state's State object
                observer.error('state has no key path in update');
            }
            else if (!this.treeNode) {
                // we expected to have read the state at least once
                // before calling update, which sets this.treeNode
                observer.error('state has no tree node in update');
            }
            else if (this.getProperty(propertyName) !== propertyValue) {
                // only not update if propertyValue is different
                // update in memory:
                this.dataNode.data[propertyName] = propertyValue;
                // update in DB:
                this.localDB.updateNodeData(this.treeNode, this.dataNode.data)
                    .subscribe(
                    (success: boolean) => {
                        observer.next(true);
                        observer.complete();
                    },
                    (error: any) => {
                        observer.error(error);
                    }
                    ); // updateNodeData().subscribe(
            }
            else {
                observer.next(false);
                observer.complete();
            }
        });
        return source;
    }
}
