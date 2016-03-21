import {TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS}
from 'angular2/platform/testing/browser';
import {setBaseTestProviders} from 'angular2/testing';
import {IonicApp, Platform} from 'ionic-angular';
import {TracktunesApp} from './app';
import {DB_NAME} from './providers/local-db/local-db';

const MAX_APP_INIT_TIME = 60;


// this needs doing _once_ for the entire test suite, hence it's here
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS,
    TEST_BROWSER_APPLICATION_PROVIDERS);

function getComponentStub(name: string): any {
    'use strict';

    let component: Object = {
        setRoot: function(): boolean { return true; },
        close: function(root: any): boolean { return true; },
    };
    return component;
}

export function main(): void {
    'use strict';

    let ionicApp: IonicApp = new IonicApp(null, null, null),
        platform: Platform = new Platform(),
        tracktunesApp: TracktunesApp =
            new TracktunesApp(ionicApp, platform);

    describe('TracktunesApp', () => {

        beforeEach((done: Function) => {
            done();
        });

        it('initialises with a root page and an app', (done) => {
            setTimeout(() => {
                expect(tracktunesApp['rootPage']).not.toBeFalsy();
                expect(tracktunesApp['app']).not.toBeFalsy();
                done();
            }, MAX_APP_INIT_TIME);
        });

        it('initialises again with a root page and an app', (done) => {
            setTimeout(() => {
                expect(tracktunesApp['rootPage']).not.toBeFalsy();
                expect(tracktunesApp['app']).not.toBeFalsy();
                done();
            }, MAX_APP_INIT_TIME);
        });

    });
}
