import {Page, Platform} from 'ionic-framework/ionic';
import {LibraryPage} from '../library/library';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {IndexedDB} from '../../providers/indexed-db';

// the volume monitor frequency, in Hz
const VOLUME_MONITOR_FREQUENCY_HZ = 40;

// derived constants, do not touch!
const VOLUME_MONITOR_TIMEOUT_MSEC = 1000.0/VOLUME_MONITOR_FREQUENCY_HZ;

// needed to cast at onSliderChange() below to avoid type warnings
interface RangeInputEventTarget extends EventTarget {
    value: number;
}


// save data into a local file
function saveBlob(blob: Blob, fileName: string) {
    let url: string = window.URL.createObjectURL(blob);
    let anchorElement: HTMLAnchorElement = document.createElement('a');
    anchorElement.style.display = 'none';
    anchorElement.href = url;
    anchorElement.setAttribute('download', fileName);
    document.body.appendChild(anchorElement);
    anchorElement.click();
    setTimeout(() => {
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(url);
    }, 100);
    this.blobs = [];
    console.log('saveBlob(): finished!');
}


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
    private audioContext: AudioContext;
    private audioGainNode: AudioGainNode;
    private mediaRecorder: MediaRecorder;
    private blobs: Array<Blob>;
    private source: MediaElementAudioSourceNode;
    private analyser: AnalyserNode;

    private monitorRate: number;
    private currentVolume: number;
    private maxVolume: number;
    private nSamplesAnalysed: number;
    private nMaxPeaks: number;

    private sliderValue: number;
    // private notYetStarted: boolean;
    private recordingTime: string;
    private recordButtonIcon: string;
    private stopButtonIcon: string;
    private stopButtonDisabled: boolean;
    private gain: number;
    private dB: string;

    // timer related
    private date: Date;
    private monitorStartTime: number;
    private monitorTotalTime: number;
    
    constructor(private platform: Platform, private indexedDB: IndexedDB) {
        console.log('constructor():RecordPage');
        this.gain = 100;
        this.dB = '0.00 dB';
        this.sliderValue = 100;
        // this.notYetStarted = true;
        this.recordingTime = "00:00:00:00";
        this.recordButtonIcon = 'mic';

        this.initAudio();
        
        this.monitorStartTime = new Date().getTime();
        this.monitorTotalTime = 0;
    }

    initAudio() {
        this.audioContext = new AudioContext();
        if (!this.audioContext) {
            throw Error('AudioContext not available!');
        }
        this.audioGainNode = this.audioContext.createGain();
        this.blobs = [];
        this.currentVolume = 0;
        this.maxVolume = 0;
        this.nSamplesAnalysed = 0;
        this.nMaxPeaks = 0;

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            throw Error('mediaDevices.getUserMedia not available!');
        }
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                this.initMediaRecorder(stream);
                this.monitorStream(stream);
            })
            .catch((error) => {
                throw Error('getUserMedia error!');
            });
    }

    initMediaRecorder(stream: MediaStream) {
        try {
            console.log('new MediaRecorder(stream) - options: n/a');
            this.mediaRecorder = new MediaRecorder(stream);
            console.dir(this.mediaRecorder);
            console.log('initMedia(): SUCCESS! mediaRecorder == ' + this.mediaRecorder);
        }
        catch (error) {
            throw Error('MediaRecorder not available!');
        }

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            console.log('ondataavailable()');
            this.blobs.push(event.data);
        }
        
        this.mediaRecorder.onstop = (event: Event) => {
            console.log('onStop()');
            if (this.blobs.length !== 1) {
                throw Error('More than 1 blobs!');
            }
            let blob: Blob = this.blobs[0];
            console.log('size: ' + blob.size);
            console.log('type: ' + blob.type);
            console.log('timestamp: ' + event.timeStamp);
            console.dir(this.blobs);
            console.dir(event);
            // saveBlob(this.blobs[0], 'woohoo.ogg');
            this.blobs = [];
        }
    }

    monitorStream(stream: MediaStream) {
        this.source = this.audioContext.createMediaStreamSource(stream);

        // this next line repeats microphone input to speaker output
        // this.audioGainNode.connect(this.audioContext.destination);

        let analyser: AnalyserNode = this.audioContext.createAnalyser();
        analyser.fftSize = 2048;
        let bufferLength: number = analyser.frequencyBinCount;
        let dataArray: Uint8Array = new Uint8Array(bufferLength);

        // this.source.connect(analyser);
        this.source.connect(this.audioGainNode);
        this.audioGainNode.connect(analyser);

        let repeat:Function = () => {
            this.monitorTotalTime += VOLUME_MONITOR_TIMEOUT_MSEC;
            analyser.getByteTimeDomainData(dataArray);
            let bufferMax: number = 0;
            for (let i: number = 0; i < bufferLength; i++) {
                let absValue: number = Math.abs(dataArray[i] - 128.0);
                if (absValue === this.maxVolume && this.maxVolume > 1) {
                    this.nMaxPeaks += 1;
                }
                else if (absValue > bufferMax) {
                    bufferMax = absValue;
                }
                this.nSamplesAnalysed += 1;
            }
            if (bufferMax > this.maxVolume) {
                this.nMaxPeaks = 1;
                this.maxVolume = bufferMax;
            }
            this.currentVolume = bufferMax;
            let deltaTime: number = new Date().getTime() - 
                this.monitorStartTime - this.monitorTotalTime;
            setTimeout(repeat, VOLUME_MONITOR_TIMEOUT_MSEC-deltaTime);            
        };
        setTimeout(repeat, VOLUME_MONITOR_TIMEOUT_MSEC);
    }

    onSliderDrag(event: Event) {
        // Fixes slider not dragging in Firefox, as described in wiki
        event.stopPropagation();
    }

    onSliderChange(event: Event) {
        this.gain = (<RangeInputEventTarget>event.target).value;
        let factor: number = this.gain / 100.0;
        if (factor === 0) {
            this.dB = 'Muted'
        }
        else {
            this.dB = num2str(ratio2dB(factor), 2) + ' dB';
        }
        this.audioGainNode.gain.value = factor;
    }

    onClickStartPauseButton() {
        console.log('PRE: toggleRecord():mediaRecorder.state = ' +
                    this.mediaRecorder.state);
        if (this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            this.recordButtonIcon = 'mic';
        }
        else {
            if (this.mediaRecorder.state === 'inactive') {
                this.mediaRecorder.start();
            }
            else {
                this.mediaRecorder.resume();
            }
            this.recordButtonIcon = 'pause';
        }
        console.log('POST: toggleRecord():mediaRecorder.state = ' +
                    this.mediaRecorder.state);
    }

    onClickStopButton() {
        console.log('PRE: stopRecord():mediaRecorder.state = ' +
                    this.mediaRecorder.state);
        this.mediaRecorder.stop();
        this.recordButtonIcon = 'mic';
        console.log('POST: stopRecord():mediaRecorder.state = ' +
                    this.mediaRecorder.state);
    }
}
