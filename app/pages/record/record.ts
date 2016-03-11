import {Page, Platform} from "ionic-angular";
import {LibraryPage} from "../library/library";
import {VuGauge} from "../../components/vu-gauge/vu-gauge";
import {AppState} from "../../providers/app-state/app-state";
import {WebAudio} from "../../providers/web-audio/web-audio";
import {LocalDB, DB_NO_KEY} from "../../providers/local-db/local-db";
import {num2str, msec2time} from "../../providers/utils/utils";

// the volume monitor frequency, in Hz
const MONITOR_FREQUENCY_HZ: number = 40;
const START_RESUME_ICON: string = "mic";
const PAUSE_ICON: string = "pause";
// derived constants, please do not touch the constants below:
const MONITOR_TIMEOUT_MSEC: number = 1000.0 / MONITOR_FREQUENCY_HZ;
// the max amount of time we expect the db to finish initialization
const OPEN_DB_MAX_TIMEOUT: number = 50;


@Page({
    templateUrl: "build/pages/record/record.html",
    directives: [VuGauge]
})
export class RecordPage {
    private currentVolume: number;
    private maxVolume: number;
    private peaksAtMax: number;

    private sliderValue: number;
    private recordingTime: string;
    private recordButtonIcon: string;
    private gain: number;
    private dB: string;

    // time related
    private monitorStartTime: number;
    private monitorTotalTime: number;
    private recordStartTime: number;
    private lastPauseTime: number;
    private totalPauseTime: number;
    private recordingDuration: number;

    private localDB: LocalDB;
    private appState: AppState;

    constructor(private platform: Platform, private webAudio: WebAudio) {

        this.localDB = LocalDB.Instance;
        this.appState = AppState.Instance;

        console.log("constructor():RecordPage");
        this.gain = 100;
        this.dB = "0.00 dB";
        this.sliderValue = 100;
        this.maxVolume = 0;
        this.peaksAtMax = 1;
        this.recordingTime = msec2time(0);
        this.recordButtonIcon = START_RESUME_ICON;

        // function that gets called with a newly created blob when
        // we hit the stop button - saves blob to local db
        webAudio.onStop = (blob: Blob) => {
            let now: Date = new Date(),
                name: string = now.toLocaleDateString() + " " +
                    now.toLocaleTimeString(),
                itemCount: number = 0;
            /*
            this.appState.db.getItemsByName(
                this.appState.unfiledFolderName,
                (item: any) => {
                    if (item) {
                        console.log("Unfiled folder already exists");
                        itemCount += 1;
                        if (itemCount > 1) {
                            throw Error("More > 1 Unfiled folders in /");
                        }
                        console.log("unfiled exists, key = " +
                            item.id);
                        // unfiled folder already exists
                        let parentKey: number = item[DB_KEY_PATH];
                        this.appState.db.addItem(
                            name,
                            parentKey,
                            blob,
                            (itemKey: number) => {
                                console.log("adding item " + itemKey +
                                    " to folder " + parentKey);
                            });
                    }
                    else {
                        // unfiled folder does not yet exist
                        console.log("no Unfiled folder, creating it");
                        this.appState.db.addItem(
                            this.appState.unfiledFolderName,
                            DB_NO_KEY,
                            null,
                            (folderKey: number) => {
                                this.appState.db.addItem(
                                    name,
                                    folderKey,
                                    blob,
                                    (itemKey: number) => {
                                        console.log("adding item " + itemKey +
                                            " to folder " + folderKey);
                                    });
                            });
                    }
                });
            */
        }; // webAudio.onStop = (blob: Blob) => { ...

        // start volume monitoring infinite loop
        this.monitorVolume();
    }

    monitorVolume() {
        console.log("monitorVolume()");
        this.totalPauseTime = this.monitorTotalTime = this.lastPauseTime = 0;
        this.monitorStartTime = Date.now();

        let timeNow: number, timeoutError: number, bufferMax: number,
            repeat: Function = () => {
                this.monitorTotalTime += MONITOR_TIMEOUT_MSEC;
                bufferMax = this.webAudio.getBufferMaxVolume();

                if (bufferMax === this.maxVolume) {
                    this.peaksAtMax += 1;
                }
                else if (bufferMax > this.maxVolume) {
                    this.peaksAtMax = 1;
                    this.maxVolume = bufferMax;
                }
                this.currentVolume = bufferMax;
                timeNow = Date.now();
                timeoutError = timeNow - this.monitorStartTime -
                    this.monitorTotalTime;
                if (this.webAudio.isRecording()) {
                    this.recordingDuration = timeNow - this.recordStartTime -
                        this.totalPauseTime;
                    this.recordingTime = msec2time(this.recordingDuration);
                }
                setTimeout(repeat, MONITOR_TIMEOUT_MSEC - timeoutError);
            };
        setTimeout(repeat, MONITOR_TIMEOUT_MSEC);
    }

    onSliderDrag(event: Event) {
        // Fixes slider not dragging in Firefox, as described in wiki
        event.stopPropagation();
    }

    onSliderChange(event: Event) {
        this.gain = (<RangeInputEventTarget>event.target).value;
        let factor: number = this.gain / 100.0;
        if (factor === 0) {
            this.dB = "Muted";
        }
        else {
            // convert factor (a number in [0, 1]) to decibels
            this.dB = num2str(10.0 * Math.log10(factor), 2) + " dB";
        }
        this.webAudio.setGainFactor(factor);
    }

    onClickStartPauseButton() {
        this.currentVolume += Math.abs(Math.random() * 10);
        if (this.webAudio.isRecording()) {
            this.webAudio.pauseRecording();
            this.lastPauseTime = Date.now();
            this.recordButtonIcon = START_RESUME_ICON;
        }
        else {
            if (this.webAudio.isInactive()) {
                this.webAudio.startRecording();
                this.recordStartTime = Date.now();
            }
            else {
                this.webAudio.resumeRecording();
                this.totalPauseTime += Date.now() - this.lastPauseTime;
            }
            this.recordButtonIcon = PAUSE_ICON;
        }
    }

    onClickStopButton() {
        this.webAudio.stopRecording();
        this.totalPauseTime = 0;
        this.recordingTime = msec2time(0);
        this.recordButtonIcon = START_RESUME_ICON;
    }
}
