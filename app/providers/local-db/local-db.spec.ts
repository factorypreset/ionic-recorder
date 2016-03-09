import {LocalDB, DB_NAME, DB_NO_KEY, makeTreeNode} from "./local-db";
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
        createdItemKey: number,
        createdItemDataKey: number;

    beforeEach((done: Function) => {
        localDB = LocalDB.Instance;
        localDB.getDB().subscribe(
            (database: IDBDatabase) => {
                db = database;
                done();
            },
            (error) => {
                fail(error);
            }
        );
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

        it("cannot read a data store item with an invalid key (0)", (done) => {
            setTimeout(() => {
                localDB.readDataStoreItem(0).subscribe(
                    (data: any) => {
                        fail("expected an error");
                    },
                    (error) => {
                        if (error === "invalid key") {
                            done();
                        }
                        else {
                            fail(error);
                        }
                    },
                    () => {
                        fail("expected an error");
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot read a data store item with invalid key (1.1)", (done) => {
            setTimeout(() => {
                localDB.readDataStoreItem(1.1).subscribe(
                    (data: any) => {
                        fail("expected an error");
                    },
                    (error) => {
                        if (error === "invalid key") {
                            done();
                        }
                        else {
                            fail(error);
                        }
                    },
                    () => {
                        fail("expected an error");
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot read a data store item invalid key (-1)", (done) => {
            setTimeout(() => {
                localDB.readDataStoreItem(-1).subscribe(
                    (data: any) => {
                        fail("expected an error");
                    },
                    (error) => {
                        if (error === "invalid key") {
                            done();
                        }
                        else {
                            fail(error);
                        }
                    },
                    () => {
                        fail("expected an error");
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot read existing data store item (valid key)", (done) => {
            setTimeout(() => {
                localDB.readDataStoreItem(1).subscribe(
                    (data: any) => {
                        expect(data).toBe(undefined);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("clears both stores successfuly", (done) => {
            setTimeout(() => {
                localDB.clearBothStores().subscribe(
                    (cleared: number) => {
                        expect(cleared).toBe(2);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create an item in the data store", (done) => {
            setTimeout(() => {
                localDB.createDataStoreItem(RANDOM_WORD_1).subscribe(
                    (key: number) => {
                        // expect key to be 1 due to deleting db on each run
                        createdItemKey = key;
                        expect(key).toBe(1);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can read the added item from the data store", (done) => {
            setTimeout(() => {
                localDB.readDataStoreItem(createdItemKey).subscribe(
                    (data: any) => {
                        expect(data.data).toBe(RANDOM_WORD_1);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can update an item in the data store", (done) => {
            setTimeout(() => {
                localDB.updateDataStoreItem(createdItemKey, RANDOM_WORD_2).subscribe(
                    (success: boolean) => {
                        expect(success).toBe(true);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can read the updated item from the data store", (done) => {
            setTimeout(() => {
                localDB.readDataStoreItem(createdItemKey).subscribe(
                    (data: any) => {
                        expect(data.data).toBe(RANDOM_WORD_2);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can delete the added item from the data store", (done) => {
            setTimeout(() => {
                localDB.deleteDataStoreItem(createdItemKey).subscribe(
                    (success: boolean) => {
                        expect(success).toBe(true);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot read the deleted item from the data store", (done) => {
            setTimeout(() => {
                localDB.readDataStoreItem(createdItemKey).subscribe(
                    (data: any) => {
                        expect(data).toBe(undefined);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        // HIGH-LEVEL CRUD FUNCTION TESTS

        it("cannot read an item with an invalid key (0)", (done) => {
            setTimeout(() => {
                localDB.readItem(0).subscribe(
                    (data: any) => {
                        fail("expected an error");
                    },
                    (error) => {
                        if (error === "invalid key") {
                            done();
                        }
                        else {
                            fail(error);
                        }
                    },
                    () => {
                        fail("expected an error");
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot read existing item (valid key)", (done) => {
            setTimeout(() => {
                localDB.readItem(1).subscribe(
                    (data: any) => {
                        expect(data).toBe(undefined);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create a folder", (done) => {
            setTimeout(() => {
                localDB.createItem(RANDOM_WORD_1, DB_NO_KEY).subscribe(
                    (key: number) => {
                        // expect key to be 1 due to deleting db on each run
                        createdItemKey = key;
                        expect(key).toBe(1);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot create the same folder again", (done) => {
            setTimeout(() => {
                localDB.createItem(RANDOM_WORD_1, DB_NO_KEY).subscribe(
                    (key: number) => {
                        fail("expected an error");
                    },
                    (error: any) => {
                        if (error === "unique violation") {
                            done();
                        }
                        else {
                            fail(error);
                        }
                    },
                    () => {
                        fail("expected an error");
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can update the folder item name", (done) => {
            setTimeout(() => {
                localDB.updateItem(
                    createdItemKey,
                    makeTreeNode(RANDOM_WORD_2, DB_NO_KEY, DB_NO_KEY)
                ).subscribe(
                    (success: boolean) => {
                        expect(success).toBe(true);
                        done();
                    },
                    (error) => {
                        fail(error);
                    });
            }, MAX_DB_INIT_TIME);
        });

        it("can read the updated folder name", (done) => {
            setTimeout(() => {
                localDB.readItem(createdItemKey).subscribe(
                    (data: any) => {
                        expect(data.name).toBe(RANDOM_WORD_2);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can delete the folder just created", (done) => {
            setTimeout(() => {
                localDB.deleteItem(createdItemKey).subscribe(
                    (success: boolean) => {
                        expect(success).toBe(true);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("cannot delete again the folder just deleted", (done) => {
            setTimeout(() => {
                localDB.deleteItem(createdItemKey).subscribe(
                    (success: boolean) => {
                        fail("expected an error");
                    },
                    (error: any) => {
                        if (error === "item does not exist") {
                            done();
                        }
                        else {
                            fail(error);
                        }
                    },
                    () => {
                        fail("expected an error");
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can create an item", (done) => {
            setTimeout(() => {
                localDB.createItem(RANDOM_WORD_1, DB_NO_KEY, { a: 1 }).subscribe(
                    (key: number) => {
                        // expect key to be 1 due to deleting db on each run
                        createdItemKey = key;
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can read the added item from the data store", (done) => {
            setTimeout(() => {
                localDB.readItem(createdItemKey).subscribe(
                    (treeNode: any) => {
                        expect(treeNode).toBeDefined();
                        expect(treeNode.id).toBe(createdItemKey);
                        expect(treeNode.dataKey).not.toBe(null);
                        localDB.readDataStoreItem(treeNode.dataKey).subscribe(
                            (dataItem: any) => {
                                createdItemDataKey = dataItem.id;
                                expect(dataItem.data).toEqual({ a: 1 });
                                done();
                            },
                            (error) => {
                                fail(error);
                            }
                        );
                    },
                    (error) => {
                        fail(error);
                    }
                );
            }, MAX_DB_INIT_TIME);
        });

        it("can update the item just created", (done) => {
            setTimeout(() => {
                localDB.updateItem(createdItemKey, {a: 2}).subscribe(
                    (success: boolean) => {
                        expect(success).toBe(true);
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