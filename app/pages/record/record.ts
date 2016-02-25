import {Page, Platform} from 'ionic-framework/ionic';
import {LibraryPage} from '../library/library';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {WebAudioAPI} from '../../providers/web-audio-api';
import {IndexedDB} from '../../providers/indexed-db';


function num2str(num: number, nDecimals: number) {
    let floorNum: number = Math.floor(num),
        frac: number = num - floorNum,
        pow10: number = Math.pow(10, nDecimals),
        wholeFrac: number = Math.round(frac * pow10),
        fracLen: number = wholeFrac.toString().length,
        leadingZeros: string = Array(nDecimals - fracLen + 1).join('0');
    return floorNum.toString() + '.' + leadingZeros + wholeFrac.toString();
}

function ratio2dB(ratio: number) {
    return 10.0 * Math.log10(ratio);
}


@Page({
    templateUrl: 'build/pages/record/record.html',
    directives: [VuGauge]
})
export class RecordPage {
    private sliderValue: number;
    private notYetStarted: boolean;
    private recordingTime: string;
    private recordButtonIcon: string;
    private stopButtonIcon: string;
    private stopButtonDisabled: boolean;
    private gain: number;
    private dB: string;

    constructor(private platform: Platform,
                private webAudioAPI: WebAudioAPI,
                private indexedDB: IndexedDB) {
        console.log('constructor():RecordPage');
        this.gain = 100;
        this.dB = '0.00 dB';
        this.sliderValue = 100;
        this.notYetStarted = true;
        this.recordingTime = "00:00:00:00";
        this.recordButtonIcon = 'mic';
    }

    onSliderDrag($event) {
        // Fixes slider not dragging in Firefox, as described in:
        // https://forum.ionicframework.com/t/ ...
        // ... range-input-input-type-range-slider-not-dragging-in-firefox/43186
        $event.stopPropagation();
    }

    onSliderChange($event) {
        this.gain = $event.target.value;
        let factor: number = this.gain / 100.0;
        if (factor === 0) {
            this.dB = 'Muted'
        }
        else {
            this.dB = num2str(ratio2dB(factor), 2) + ' dB';
        }
       // this.webAudioAPI.setGain(factor);
       this.webAudioAPI.audioGainNode.gain.value = factor;
    }

    isRecording() {
        return this.recordButtonIcon === 'pause';
    }

    toggleRecord() {
        console.log('PRE: toggleRecord():mediaRecorder.state = ' +
                    this.webAudioAPI.mediaRecorder.state);
        if (this.isRecording()) {
            this.pauseRecord();
        }
        else {
            this.startRecord();
        }
        console.log('POST: toggleRecord():mediaRecorder.state = ' +
                    this.webAudioAPI.mediaRecorder.state);
    }

    pauseRecord() {
        // this.webAudioAPI.pauseRecording();
        this.webAudioAPI.mediaRecorder.pause();
        this.recordButtonIcon = 'mic';
    }

    stopRecord() {
        console.log('PRE: stopRecord():mediaRecorder.state = ' +
                    this.webAudioAPI.mediaRecorder.state);
        // this.webAudioAPI.stopRecording();
        this.webAudioAPI.mediaRecorder.stop();
        this.notYetStarted = true;
        this.recordButtonIcon = 'mic';
        console.log('POST: stopRecord():mediaRecorder.state = ' +
                    this.webAudioAPI.mediaRecorder.state);

        // save the recording immediately to the database, with some
        // automatic title, or just untitled.  we'll need to figure
        // out the recording's duration - if it's 0, don't save
        // anything. reset things so that we can start again right
        // away
    }

    startRecord() {
        if (this.notYetStarted) {
            // this.webAudioAPI.startRecording();
            this.webAudioAPI.mediaRecorder.start();
            this.notYetStarted = false;
        }
        else {
            // this.webAudioAPI.resumeRecording();
            this.webAudioAPI.mediaRecorder.resume();
        }
        this.recordButtonIcon = 'pause';
    }
}
