import {Injectable} from 'angular2/core';


// save data into a local file
let saveBlob = function(blob: Blob, fileName: string) {
    let url: string = window.URL.createObjectURL(blob);
    let anchorElement: HTMLAnchorElement = document.createElement('a');
    anchorElement.style.display = 'none';
    anchorElement.href = url;
    anchorElement.setAttribute('download', fileName);
    document.body.appendChild(anchorElement);
    anchorElement.click();
    setTimeout(function() {
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(url);
    }, 100);
    this.chunks = [];
    console.log('saveBlob(): finished!');
}

// Inject class WebAudioAPI into app to use as singleton,
// via @App({providers: [WebAudioAPI]}
@Injectable()
export class WebAudioAPI {
    private audioContext: AudioContext;
    private audioGainNode: AudioGainNode;
    private mediaRecorder: MediaRecorder;
    private chunks: Array<Blob>;
    private source: MediaElementAudioSourceNode;
    private analyser: AnalyserNode;

    monitorRate: number;
    currentVolume: number;
    maxVolume: number;
    nSamplesAnalysed: number;
    nMaxPeaks: number;

    constructor() {
        console.log('constructor():WebAudioApi');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioGainNode = this.audioContext.createGain();
        this.chunks = [];
        this.currentVolume = 0;
        this.maxVolume = 0;
        this.monitorRate = 40;
        this.nSamplesAnalysed = 0;
        this.nMaxPeaks = 0;

        if (navigator.mediaDevices) {
            console.log('newer audio init');
            this.newerAudioInit();
        }
        else {
            console.log('older audio init');
            this.olderAudioInit();
        }
    }

    newerAudioInit() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                // this.stream = stream;
                this.initMediaRecorder(stream);
                this.monitorStream(stream);
            })
            .catch(function(error) {
                console.log('mediaDevices.getUserMedia(): ERROR: ' + error);
                alert('MD err 1 ' + error);
            });
    }

    olderAudioInit() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true },
                function(stream) {
                    this.initMediaRecorder(stream);
                    this.monitorStream(stream);
                },
                function(error) {
                    console.log('ERROR: getUserMedia(): ' + JSON.stringify(error));
                    alert('MD err 3 ' + error.message);
                });
        }
        else {
            console.log('ERROR: getUserMedia not supported in this browser.');
            alert('MD err 4');
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

        let chunks: Array<Blob> = this.chunks;

        this.mediaRecorder.ondataavailable = function(event) {
            console.dir(event);
            chunks.push(event.data);
            console.log('mediaRecorder.ondataavailable(): chunks.length = ' + this.chunks.length);
        }

        this.mediaRecorder.onstop = function(event) {
            saveBlob(chunks[0], 'woohoo.ogg');
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

    setGain(gain: number) {
        // console.log('setting gain to : '+gain);
        this.audioGainNode.gain.value = gain;
    }

    startRecording() {
        console.log('WebAudioAPI:startRecording()');
        if (!this.mediaRecorder) {
            console.log('ERROR: startRecording(): no this.mediaRecorder');
            return;
        }
        this.mediaRecorder.start();
        console.log('mediaRecorder started, state: ' + this.mediaRecorder.state);
    }

    pauseRecording() {
        console.log('WebAudioAPI:pauseRecording()');
        if (!this.mediaRecorder) {
            console.log('ERROR: pauseRecording(): no this.mediaRecorder');
            return;
        }
        this.mediaRecorder.pause();
    }

    resumeRecording() {
        console.log('WebAudioAPI:resumeRecording()');
        if (!this.mediaRecorder) {
            console.log('ERROR: resumeRecording(): no this.mediaRecorder');
            return;
        }
        this.mediaRecorder.resume();
    }

    stopRecording() {
        console.log('WebAudioAPI:stopRecording()');
        if (!this.mediaRecorder) {
            console.log('ERROR: stopRecording(): no this.mediaRecorder');
            return;
        }

        this.mediaRecorder.stop();
    }
}
