import {Injectable} from "angular2/core";
import {LocalDB, DB_NO_KEY} from "../local-db/local-db";


// make sure APP_STATE_ITEM_NAME will never be entered by a user
const APP_STATE_ITEM_NAME: string =
    "Kwj7t9X2PTsPwLquD9qvZqaApMP8LGRjPFENUHnvrpmUE25rkrYHhzf9KBEradAU";


@Injectable()
export class AppState {
    db: LocalDB;
    dbName: string = "ionic-recorder-db";
    dbVersion: number = 1;
    dbStoreName = "blobTree";
    unfiledFolderName: string = "Unfiled";
    lastViewedPage: string = "record";
    lastViewedFolderKey: number;
    tabs: Object[] = [
        { index: 0, name: "Record" },
        { index: 1, name: "Library" }
    ];

    constructor() {
        this.db = new LocalDB(
            this.dbName,
            this.dbVersion,
            this.dbStoreName);
        this.lastViewedFolderKey = DB_NO_KEY;
    }

    save() {
        // very brute force ...
        this.db.smartUpdate(
            APP_STATE_ITEM_NAME, {
                dbName: this.dbName,
                dbVersion: this.dbVersion,
                dbStoreName: this.dbStoreName,
                unfiledFolderName: this.unfiledFolderName,
                lastViewedPage: this.lastViewedPage,
                lastViewedFolderKey: this.lastViewedFolderKey
            });
    }
}
