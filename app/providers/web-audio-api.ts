import {Injectable} from 'angular2/core';


@Injectable()
export class WebAudioAPI {
    private audioContext: AudioContext;
    private stream: MediaStream;
    private mediaRecorder: MediaRecorder;
    private chunks: Array<Float32Array>;
    private source: MediaElementAudioSourceNode;
    private analyser: AnalyserNode;
    monitorRate: number;
    currentVolume: number;
    maxVolume: number;
    onChangeCallback: () => void;
    
    constructor() {
        console.log('constructor():WebAudioApi');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.chunks = [];
        this.currentVolume = 0;
        this.maxVolume = 0;
        this.monitorRate = 60;
        if (navigator.mediaDevices.getUserMedia) {
            this.newerAudioInit();
        }
        else if (!navigator.getUserMedia) {
            this.olderAudioInit();
        }
    }

    newerAudioInit() {
        // console.log('getUserMedia == mediaDevices.getUserMedia()');
        // newer Firefox - we know it has MediaRecorder
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                this.stream = stream;
                this.mediaRecorder = new MediaRecorder(stream);
                this.monitorStream(stream);
                console.log('mediaDevices.getUserMedia(): SUCCESS! mediaRecorder == ' + this.mediaRecorder);
            })
            .catch(function(error) {
                console.log('mediaDevices.getUserMedia(): ERROR: ' + error);
            });
    }

    olderAudioInit() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true },
                function(stream) {
                    this.stream = stream;
                    try {
                        this.mediaRecorder = new MediaRecorder(stream);
                        this.monitorStream(stream);
                        console.log('getUserMedia(): SUCCESS! mediaRecorder == ' + this.mediaRecorder);
                    }
                    catch (error) {
                        console.log('ERROR: Cannot instantiate a MediaRecorder object: ' + error.message);
                    }
                },
                function(error) {
                    console.log('ERROR: getUserMedia(): ' + JSON.stringify(error));
                });
        }
        else {
            console.log('ERROR: getUserMedia not supported in this browser.');
        }
    }

    monitorStream(stream: MediaStream) {
        // console.log('monitorStream');
        this.source = this.audioContext.createMediaStreamSource(stream);
        let analyser: AnalyserNode = this.audioContext.createAnalyser();
        analyser.fftSize = 2048;
        let bufferLength: number = analyser.frequencyBinCount;
        let dataArray: Uint8Array = new Uint8Array(bufferLength);
        this.source.connect(analyser);
        setInterval(() => {
            analyser.getByteTimeDomainData(dataArray);
            let bufferMax = 0;
            for (let i: number = 0; i < bufferLength; i++) {
                let absValue: number = Math.abs(dataArray[i] - 128.0);
                if (absValue > bufferMax) {
                    bufferMax = absValue;
                }
            }
            if (bufferMax > this.maxVolume) {
                this.maxVolume = bufferMax;
            }
            this.currentVolume = bufferMax;
            
            this.onChangeCallback && this.onChangeCallback();
        }, 1000.0/(1.0*this.monitorRate));
    }

    startRecording() {
        console.log('WebAudioAPI:startRecording()');
        if (!this.mediaRecorder) {
            console.log('ERROR: startRecording(): no this.mediaRecorder');
            return;
        }

        // set up MediaRecorder callbacks
        let chunks: Array<Float32Array> = this.chunks;
        this.mediaRecorder.ondataavailable = function(event) {
            chunks.push(event.data);
            console.log('data available: # of chunks: ' + chunks.length);
        }

        this.mediaRecorder.onstop = function(event) {
            console.log('data available after MediaRecorder.stop() called. chunks.length = ' + chunks.length);
        };

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