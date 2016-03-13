import {Page, NavParams, ViewController} from "ionic-angular";
import {Control} from "angular2/common";

interface ValidationResult {
    [key: string]: boolean;
}

class FolderNameValidator {
    static hasSlash(control: Control) {
        if (control.value !== "" && control.value.indexOf("/") !== -1) {
            return { "hasSlash": true };
        }
        return null;
    }
}

@Page({
    templateUrl: "build/pages/add-folder/add-folder.html"
})
export class AddFolderPage {
    private folderName: string = "";
    private parentPath: string;

    private slashValidator: Function;

    constructor(private navParams: NavParams,
        private viewController: ViewController) {

        // passed in a string with the parent path in it
        this.parentPath = navParams.data;
    }

    onClickCancel() {
        console.log("onClickCancel()");
        this.viewController.dismiss("");
    }

    onClickAdd(addFolderForm) {
        console.log("onClickDone()");
        if (addFolderForm.valid) {
            console.log("form was valid: " + this.folderName);
            this.viewController.dismiss(this.folderName);
        }
        else {
            console.log("form not valid");
            this.viewController.dismiss("");
        }
    }

}