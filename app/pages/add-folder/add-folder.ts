import {Page, NavParams, ViewController} from "ionic-angular";
import {Control, FormBuilder, ControlGroup, Validators} from "angular2/common";

interface ValidationResult {
    [key: string]: boolean;
}

class FolderNameValidator {
    static hasSlash(control: Control): ValidationResult {
        console.log("validator control.value: " + control.value);
        if (control.value != "" && control.value.indexOf("/") !== -1) {
            return { "hasSlash": true };
        }
        return null;
    }

    static folderNameTaken(): ValidationResult {
        return null;
    }
}

@Page({
    templateUrl: "build/pages/add-folder/add-folder.html"
})
export class AddFolderPage {
    // private folderName: string = "";
    private nameControl = new Control(
        "",
        Validators.compose([
            Validators.required,
            FolderNameValidator.hasSlash
        ]));
    // private folderName: string = "";
    private parentPath: string;
    private form: ControlGroup;
    constructor(
        private navParams: NavParams,
        private viewController: ViewController,
        private formBuilder: FormBuilder
    ) {
        // passed in a string with the parent path in it
        this.parentPath = navParams.data;

        this.form = formBuilder.group({
            nameControl: this.nameControl
        });
    }

    onClickCancel() {
        console.log("onClickCancel()");
        this.viewController.dismiss("");
    }

    onClickAdd(addFolderForm) {
        console.log("onClickDone()");
        console.log("form valid: " + JSON.stringify(this.form.value));
        this.viewController.dismiss(this.form.value.nameControl);
    }

}