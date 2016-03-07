import {TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS}
from "angular2/platform/testing/browser";
import {setBaseTestProviders} from "angular2/testing";
import {IonicApp, Platform} from "ionic-angular";
import {TracktunesApp} from "./app";
import {AppState} from "./providers/app-state/app-state";

// this needs doing _once_ for the entire test suite, hence it's here
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS,
    TEST_BROWSER_APPLICATION_PROVIDERS);

let tracktunesApp: TracktunesApp = null;

function getComponentStub(name: string): any {
    "use strict";

    let component: Object = {
        setRoot: function(): boolean { return true; },
        close: function(root: any): boolean { return true; },
    };
    return component;
}

export function main(): void {
    "use strict";

    describe("TracktunesApp", () => {

        beforeEach(() => {
            let ionicApp: IonicApp = new IonicApp(null, null, null);
            let platform: Platform = new Platform();
            let appState: AppState = new AppState();
            tracktunesApp = new TracktunesApp(ionicApp, platform, appState);
        });

        it("initialises with a root page", () => {
            expect(tracktunesApp["rootPage"]).not.toBe(null);
        });

        it("initialises with an app", () => {
            expect(tracktunesApp["app"]).not.toBe(null);
        });
    });
}
