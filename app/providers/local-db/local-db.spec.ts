import {LocalDB, TreeNode, DB_NAME, DB_NO_ID, makeTreeNode} from "./local-db";
import {Observable} from "rxjs/Rx";

const MAX_DB_INIT_TIME = 200;
const RANDOM_WORD_1: string =
    "1Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";
const RANDOM_WORD_2: string =
    "2Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE";

let request: IDBOpenDBRequest = indexedDB.deleteDatabase(DB_NAME);

request.onsuccess = function() {
    console.log("deleteDatabase: SUCCESS");
};

request.onerror = function() {
    console.log("deleteDatabase: ERROR");
};

request.onblocked = function() {
    console.log("deleteDatabase: BLOCKED");
};


export function main(): void {
    "use strict";

    let localDB: LocalDB = null,
        localDB2: LocalDB = null,
        db: IDBDatabase = null,
        unfiledFolder: TreeNode,
        folder1: TreeNode,
        folder3: TreeNode,
        folder5: TreeNode,
        item2: TreeNode,
        item4: TreeNode,
        item6: TreeNode,
        item7: TreeNode;

    beforeEach((done: Function) => {
        localDB = LocalDB.Instance;
        localDB.getDB().subscribe(
            (database: IDBDatabase) => {
                db = database;
                done();
            },
            (error) => {
                fail(error);
            });
    });

    jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 2;

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

        it("can create unfiledFolder - child of root", (done) => {
            setTimeout(() => {
                localDB.createNode("Unfiled", DB_NO_ID).subscribe(
                    (treeNode: TreeNode) => {
                        unfiledFolder = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(DB_NO_ID);
                        expect(treeNode.idData).toBeFalsy();
                        expect(treeNode.name).toEqual("Unfiled");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot create unfiledFolder a second time in the same parent",
            (done) => {
                setTimeout(() => {
                    localDB.createNode("Unfiled", DB_NO_ID).subscribe(
                        (treeNode: TreeNode) => {
                            fail("expected an error");
                        },
                        (error) => {
                            expect(error).toEqual("unique violation");
                            done();
                        }
                    );
                }, MAX_DB_INIT_TIME);
            });

        it("can create folder1 - child of unfiledFolder", (done) => {
            setTimeout(() => {
                localDB.createNode("Folder 1", unfiledFolder.id).subscribe(
                    (treeNode: TreeNode) => {
                        folder1 = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(unfiledFolder.id);
                        expect(treeNode.idData).toBeFalsy();
                        expect(treeNode.name).toEqual("Folder 1");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create item2 - child of folder1", (done) => {
            setTimeout(() => {
                localDB.createNode("Item 2", folder1.id, "i2data").subscribe(
                    (treeNode: TreeNode) => {
                        item2 = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(folder1.id);
                        expect(localDB.validateId(treeNode.idData))
                            .toBe(true);
                        expect(treeNode.name).toEqual("Item 2");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create folder3 - child of folder1", (done) => {
            setTimeout(() => {
                localDB.createNode("Folder 3", folder1.id).subscribe(
                    (treeNode: TreeNode) => {
                        folder3 = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(folder1.id);
                        expect(treeNode.idData).toBeFalsy();
                        expect(treeNode.name).toEqual("Folder 3");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create item4 - child of folder3", (done) => {
            setTimeout(() => {
                localDB.createNode("Item 4", folder3.id, "i4data").subscribe(
                    (treeNode: TreeNode) => {
                        item4 = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(folder3.id);
                        expect(localDB.validateId(treeNode.idData))
                            .toBe(true);
                        expect(treeNode.name).toEqual("Item 4");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create folder5 - child of folder3", (done) => {
            setTimeout(() => {
                localDB.createNode("Folder 5", folder3.id).subscribe(
                    (treeNode: TreeNode) => {
                        folder5 = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(folder3.id);
                        expect(treeNode.idData).toBeFalsy();
                        expect(treeNode.name).toEqual("Folder 5");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create item6 - child of folder5", (done) => {
            setTimeout(() => {
                localDB.createNode("Item 6", folder5.id, "i6data").subscribe(
                    (treeNode: TreeNode) => {
                        item6 = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(folder5.id);
                        expect(localDB.validateId(treeNode.idData))
                            .toBe(true);
                        expect(treeNode.name).toEqual("Item 6");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create item7 - child of folder5", (done) => {
            setTimeout(() => {
                localDB.createNode("Item 7", folder5.id, "i7data").subscribe(
                    (treeNode: TreeNode) => {
                        item7 = treeNode;
                        expect(localDB.validateId(treeNode.id)).toBe(true);
                        expect(treeNode.idParent).toEqual(folder5.id);
                        expect(localDB.validateId(treeNode.idData))
                            .toBe(true);
                        expect(treeNode.name).toEqual("Item 7");
                        expect(treeNode.timestamp).not.toBeFalsy();
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create unfiledFolder a second time under a different parent",
            (done) => {
                setTimeout(() => {
                    localDB.createNode("Unfiled", folder5.id).subscribe(
                        (treeNode: TreeNode) => {
                            expect(localDB.validateId(treeNode.id)).toBe(true);
                            expect(treeNode.idParent).toEqual(folder5.id);
                            expect(treeNode.idData).toBeFalsy();
                            expect(treeNode.name).toEqual("Unfiled");
                            expect(treeNode.timestamp).not.toBeFalsy();
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                    );
                }, MAX_DB_INIT_TIME);
            });
    });
}