import {App, IonicApp, Platform} from 'ionic-angular';
import {Type, enableProdMode} from 'angular2/core';
import {TabsPage} from './pages/tabs/tabs';
import {WebAudio} from './providers/web-audio';
import {LocalDB} from './providers/local-db';

// enableProdMode();

@App({
    templateUrl: 'build/app.html',
    providers: [WebAudio, LocalDB],
    config: {
        backButtonText: ''
    }
})
class MyApp {
    private rootPage: Type = TabsPage;

    constructor(private app: IonicApp, private platform: Platform) {
        console.log('constructor():MyApp');
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // The platform is now ready. Note: if this callback fails
            // to fire, follow the Troubleshooting guide for a number
            // of possible solutions:
            //
            // Okay, so the platform is ready and our plugins are
            // available.  Here you can do any higher level native
            // things you might need.
            //
            // First, let's hide the keyboard accessory bar (only
            // works natively) since that's a better default:
            //
            // Keyboard.setAccessoryBarVisible(false);
            //
            // For example, we might change the StatusBar color. This
            // one below is good for dark backgrounds and light text:
            // StatusBar.setStyle(StatusBar.LIGHT_CONTENT)
            // console.log('App:this.platform.ready!');
        });
    }
}
