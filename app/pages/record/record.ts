import {Page, Platform} from 'ionic-framework/ionic';
import {LibraryPage} from '../library/library';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {IndexedDB} from '../../providers/indexed-db';


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
    audioGainNode: AudioGainNode;
    mediaRecorder: MediaRecorder;
    private blobs: Array<Blob>;
    private source: MediaElementAudioSourceNode;
    private analyser: AnalyserNode;

    monitorRate: number;
    currentVolume: number;
    maxVolume: number;
    nSamplesAnalysed: number;
    nMaxPeaks: number;

    private sliderValue: number;
    // private notYetStarted: boolean;
    private recordingTime: string;
    private recordButtonIcon: string;
    private stopButtonIcon: string;
    private stopButtonDisabled: boolean;
    private gain: number;
    private dB: string;

    constructor(private platform: Platform,
        private indexedDB: IndexedDB) {
        console.log('constructor():RecordPage');
        this.gain = 100;
        this.dB = '0.00 dB';
        this.sliderValue = 100;
        // this.notYetStarted = true;
        this.recordingTime = "00:00:00:00";
        this.recordButtonIcon = 'mic';

        this.initAudio();
    }

    initAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioGainNode = this.audioContext.createGain();
        this.blobs = [];
        this.currentVolume = 0;
        this.maxVolume = 0;
        this.monitorRate = 40;
        this.nSamplesAnalysed = 0;
        this.nMaxPeaks = 0;

        if (navigator.mediaDevices) {
            let errorMessage: string;
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream: MediaStream) => {
                    // this.stream = stream;
                    this.initMediaRecorder(stream);
                    this.monitorStream(stream);
                })
                .catch((error) => {
                    errorMessage = 'Error: ' + error;
                    if (error.message) {
                        errorMessage += ', message: ' + error.message;
                    }
                    if (error.name) {
                        errorMessage += ', name: ' + error.name;
                    }
                    alert(errorMessage);
                });
        }
        else {
            console.log('MD err 0 - unsupported in this browser');
            alert('MD err 0 - unsupported in this browser');
        }
    }

    initMediaRecorder(stream: MediaStream) {
        try {
            console.log('new MediaRecorder(stream) - options: n/a');
            this.mediaRecorder = new MediaRecorder(stream);
            console.log('initMedia(): SUCCESS! mediaRecorder == ' + this.mediaRecorder);
        }
        catch (error) {
            console.log('ERROR: Cannot instantiate a MediaRecorder object: ' + error.message);
            alert('MD err 2 ' + error.message);
        }

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            console.log('ondataavailable()');
            console.dir(event);
            this.blobs.push(event.data);
            console.log('mediaRecorder.ondataavailable(): blobs.length = ' + this.blobs.length);
        }

        this.mediaRecorder.onstop = (event: Event) => {
            console.log('onStop() - # of blobs: ' + this.blobs.length +
                ', dir(this.blob) ...');
            console.dir(this.blobs);
            console.log('onStop() event: ...');
            console.dir(event);
            saveBlob(this.blobs[0], 'woohoo.ogg');
        };
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

        setInterval(() => {
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
        }, 1000.0 / (1.0 * this.monitorRate));
    }

    onSliderDrag(event: Event) {
        // Fixes slider not dragging in Firefox, as described in:
        // https://forum.ionicframework.com/t/ ...
        // ... range-input-input-type-range-slider-not-dragging-in-firefox/43186
        event.stopPropagation();
    }

    onSliderChange(event: Event) {
        this.gain = event.target.value;
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
        // TODO: save blob to DB
    }
}
