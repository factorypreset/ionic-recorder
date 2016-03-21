// Copyright (C) 2015, 2016 Tracktunes Inc

import {Page, NavParams, ViewController} from 'ionic-angular';
import {Control, FormBuilder, ControlGroup, Validators} from 'angular2/common';
import {TreeNode} from '../../providers/local-db/local-db';


interface ValidationResult {
    [key: string]: boolean;
}

@Page({
    templateUrl: 'build/pages/add-folder/add-folder.html'
})
export class AddFolderPage {
    private nameControl: Control;
    private parentPath: string;
    private form: ControlGroup;

    /**
     * The Add-Folder modal
     * @param {NavParams} contains data passed from the caller (under
     * navParams.data.parentItems).
     * @param {viewController} used to dismiss this modal with data to
     * return to the caller.
     * @param {FormBuilder} used to build the form of this modal.
     */
    constructor(
        private navParams: NavParams,
        private viewController: ViewController,
        private formBuilder: FormBuilder
    ) {
        // passed in a string with the parent path in it
        this.parentPath = navParams.data.parentPath;

        let hasSlash = (control: Control): ValidationResult => {
            console.log('HS validator control.value: ' + control.value);
            if (control.value !== '' && control.value.indexOf('/') !== -1) {
                return { hasSlash: true };
            }
            return null;
        };

        let alreadyExists = (control: Control): ValidationResult => {
            if (control.value === '') {
                // alert('did not expect control.value to be empty');
                return null;
            }

            if (!(this.navParams &&
                this.navParams.data &&
                this.navParams.data.parentItems &&
                Object.keys(this.navParams.data.parentItems).length)) {
                // nav params have not been sent yet or they are empty
                return null;
            }
            // for non empty control.value (which carries the string
            // that was added on the input line), check that it isn't
            // already in this.navParams.data.parentItems, but we have
            // to search it by name
            let newName: string = control.value,
                parentItems: { [id: string]: TreeNode } =
                    this.navParams.data.parentItems,
                parentKeys: string[] = Object.keys(parentItems),
                key: number;
            for (key = 0; key < parentKeys.length; key++) {
                let parentKey: string = parentKeys[key];
                if (newName === parentItems[parentKey].name) {
                    return { alreadyExists: true };
                }
            }
            return null;
        };

        this.nameControl = new Control(
            '',
            Validators.compose([
                Validators.required,
                alreadyExists,
                hasSlash
            ]));

        this.form = formBuilder.group({
            nameControl: this.nameControl
        });
    }

    onClickCancel() {
        console.log('onClickCancel()');
        this.viewController.dismiss('');
    }

    onClickAdd() {
        console.log('onClickAdd()');
        let result: string = this.form.value.nameControl;
        // trim the result before returning it
        result = result.replace(/^\s+|\s+$/g, '');
        this.viewController.dismiss(result);
    }

}
