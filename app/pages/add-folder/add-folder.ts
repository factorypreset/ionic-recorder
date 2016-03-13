import {Page, NavParams, ViewController} from "ionic-angular";


@Page({
    templateUrl: "build/pages/add-folder/add-folder.html"
})
export class AddFolderPage {
    private folderName: string = "";
    private parentPath: string;

    constructor(private navParams: NavParams,
        private viewController: ViewController) {

        // passed in a string with the parent path in it
        this.parentPath = navParams.data;
    }

    onClickCancel() {
        console.log("onClickCancel()");
        this.viewController.dismiss("");
    }

    onClickDone(addFolderForm) {
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