import {App, IonicApp, Platform} from "ionic-angular";
import {Type, enableProdMode} from "angular2/core";
import {TabsPage} from "./pages/tabs/tabs";
import {WebAudio} from "./providers/web-audio/web-audio";
import {LocalDB, MAX_DB_INIT_TIME} from "./providers/local-db/local-db";
import {AppState} from "./providers/app-state/app-state";

// enableProdMode();

@App({
    templateUrl: "build/app.html",
    providers: [WebAudio, LocalDB, AppState],
    config: {
        backButtonText: ""
    }
})
export class TracktunesApp {
    private rootPage: Type = TabsPage;
    // cause AppState and LocalDB singletons to be loaded as early as possible
    private appState: AppState = AppState.Instance;

    constructor(private app: IonicApp, private platform: Platform) {
        console.log("constructor():TracktunesApp");
    }
}
