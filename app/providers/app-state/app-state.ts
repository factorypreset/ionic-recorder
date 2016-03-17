// Copyright (C) 2015, 2016 Tracktunes Inc

import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Rx';
import {LocalDB, TreeNode, DataNode, DB_NO_KEY, DB_KEY_PATH, MAX_DB_INIT_TIME}
from '../local-db/local-db';

interface State {
    lastSelectedTab: number;
    lastViewedFolderKey: number;
    rootFolderKey: number;
    unfiledFolderKey: number;
    checkedNodes: { [id: string]: boolean };
}

// make sure APP_STATE_ITEM_NAME will never be entered by a user
export const STATE_NODE_NAME: string =
    'Kwj7t9X2PTsPwLquD9qvZqaApMP8LGRjPFENUHnvrpmUE25rkrYHhzf9KBEradAU';

export const ROOT_FOLDER_NAME: string = 'root';
export const UNFILED_FOLDER_NAME: string = 'Unfiled';

const DEFAULT_STATE: State = {
    lastSelectedTab: 0,
    lastViewedFolderKey: DB_NO_KEY,
    rootFolderKey: DB_NO_KEY,
    unfiledFolderKey: DB_NO_KEY,
    checkedNodes: {}
};


@Injectable()
export class AppState {
    // 'instance' is used to implement this class as a Singleton
    private static instance: AppState = null;
    private localDB: LocalDB = LocalDB.Instance;

    // treeNode contains the node in the tree where we store the
    // data of default state, treeNode.dataKey points to dataNode
    private treeNode: TreeNode = null;

    // dataNode contains the default state
    private dataNode: DataNode = null;

    private state: State = null;

    constructor() {
        console.log('constructor():AppState');

        // Create root folder   
        this.localDB.readOrCreateFolderNode(ROOT_FOLDER_NAME, DB_NO_KEY)
            .subscribe(
            (rootFolderNode: TreeNode) => {
                let rootNodeKey: number = rootFolderNode[DB_KEY_PATH];
                DEFAULT_STATE['rootFolderKey'] = rootNodeKey;
                // Create Unfiled folder as child of root using root's key
                this.localDB.readOrCreateFolderNode(
                    UNFILED_FOLDER_NAME, rootNodeKey)
                    .subscribe(
                    (unfiledFolderNode: TreeNode) => {
                        DEFAULT_STATE['unfiledFolderKey'] =
                            unfiledFolderNode[DB_KEY_PATH];
                        // create default state data node after it's
                        // been updated with the correct keys for
                        // both root and unfiled folders
                        this.localDB.readOrCreateDataNode(
                            STATE_NODE_NAME, DB_NO_KEY, DEFAULT_STATE)
                            .subscribe(
                            (result: any) => {
                                this.treeNode = result.treeNode;
                                this.dataNode = result.dataNode;

                            },
                            (error: any) => {
                                throw new Error(error);
                            }
                            ); // readOrCreateDataNode().subscribe(
                    },
                    (error: any) => {
                        throw new Error(error);
                    }
                    ); // readOrCreateFolderNode().su ...
            },
            (error: any) => {
                throw new Error(error);
            }
            ); // readOrCreateFolderNode().su ...
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new AppState();
        }
        return this.instance;
    }

    getLastViewedFolderKey() {
        let source: Observable<number> = Observable.create((observer) => {
            this.getProperty('lastViewedFolderKey').subscribe(
                (lastViewedFolderKey: number) => {
                    if (lastViewedFolderKey === DB_NO_KEY) {
                        console.log('lastViewedFolder not yet set');
                        // we have not yet set the lastViewedFolderKey
                        // here we set it to the default, which is root folder
                        this.getProperty('rootFolderKey').subscribe(
                            (rootFolderKey: number) => {
                                this.updateProperty(
                                    'lastViewedFolder',
                                    rootFolderKey)
                                    .subscribe(
                                    () => {
                                        console.log('updated to: ' +
                                            rootFolderKey);
                                        observer.next(rootFolderKey);
                                        observer.complete();
                                    },
                                    (error: any) => {
                                        observer.error(error);
                                    }
                                    ); // updateProperty.subscribe(
                            },
                            (error: any) => {
                                observer.error(error);
                            }
                        ); // getProperty().subscribe(
                    }
                    else {
                        observer.next(lastViewedFolderKey);
                        observer.complete();
                    }
                },
                (error: any) => {
                    observer.error(error);
                }
            ); // getProperty().subscribe(
        });
        return source;
    }
    // this creates the following folders in a newly initialized app:
    // 1) root folder '/'
    // 2) unfiled folder 'Unfiled', under root
    // 3) favorites folder 'Favorites', under root
    // 4) recent folder 'Recent',under root
    private createInitialFolderStructure() {

    }

    waitForAppState() {
        let source: Observable<boolean> = Observable.create((observer) => {
            let repeat = () => {
                if (this.treeNode && this.dataNode) {
                    observer.next(true);
                    observer.complete();
                }
                else {
                    console.warn('... no STATE yet ...');
                    setTimeout(repeat, MAX_DB_INIT_TIME / 10);
                }
            };
            repeat();
        });
        return source;
    }

    // returns an Observable<any> of the value
    getProperty(propertyName) {
        let source: Observable<any> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
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
                (error: any) => {
                    observer.error(error);
                }
            ); // waitForDB().subscribe(
        });
        return source;
    }

    // NOTE: we don't need the waitForDB() observable here because
    // it happens inside updateNodeData()
    updateProperty(propertyName: string, propertyValue: any) {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
                () => {
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
                },
                (error) => {
                    alert('error waiting for app state: ' + error);
                }
            ); // waitForAppState().subscribe(
        });
        return source;
    }
}
