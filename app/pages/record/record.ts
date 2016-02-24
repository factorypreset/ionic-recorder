import {Page, Modal, Alert, NavController, Platform} from 'ionic-framework/ionic';
import {LibraryPage} from '../library/library';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {WebAudioAPI} from '../../providers/web-audio-api';


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

    constructor(private webAudioAPI: WebAudioAPI, private platform: Platform) {
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
        // https://forum.ionicframework.com/t/range-input-input-type-range-slider-not-dragging-in-firefox/43186
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
        this.webAudioAPI.setGain(factor);
    }

    isRecording() {
        return this.recordButtonIcon === 'pause';
    }

    toggleRecord() {
        console.log('PRE: toggleRecord():mediaRecorder.state = ' + this.webAudioAPI.mediaRecorder.state);
        if (this.isRecording()) {
            this.pauseRecord();
        }
        else {
            this.startRecord();
        }
        console.log('POST: toggleRecord():mediaRecorder.state = ' + this.webAudioAPI.mediaRecorder.state);
    }

    pauseRecord() {
        this.webAudioAPI.pauseRecording();
        this.recordButtonIcon = 'mic';
    }

    stopRecord() {
        console.log('PRE: stopRecord():mediaRecorder.state = ' + this.webAudioAPI.mediaRecorder.state);
        this.webAudioAPI.stopRecording();
        this.notYetStarted = true;
        this.recordButtonIcon = 'mic';
        console.log('POST: stopRecord():mediaRecorder.state = ' + this.webAudioAPI.mediaRecorder.state);
    }

    startRecord() {
        if (this.notYetStarted) {
            this.webAudioAPI.startRecording();
            this.notYetStarted = false;
        }
        else {
            this.webAudioAPI.resumeRecording();
        }
        this.recordButtonIcon = 'pause';
    }
}
