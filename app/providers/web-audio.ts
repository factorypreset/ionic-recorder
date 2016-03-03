import {Injectable} from 'angular2/core';


@Injectable()
export class WebAudio {
    private audioContext: AudioContext;
    private audioGainNode: AudioGainNode;
    private mediaRecorder: MediaRecorder;
    private analyserNode: AnalyserNode;
    private analyserBuffer: Uint8Array;
    private analyserBufferLength: number;
    private sourceNode: MediaElementAudioSourceNode;
    private blobs: Blob[];
    onStop: (blob: Blob) => void;

    constructor() {
        console.log('constructor():WebAudio');
        this.blobs = [];
        this.initAudio();
    }

    initAudio() {
        this.audioContext = new AudioContext();
        if (!this.audioContext) {
            throw Error('AudioContext not available!');
        }
        this.audioGainNode = this.audioContext.createGain();
        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            throw Error('mediaDevices.getUserMedia not available!');
        }
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                this.initMediaRecorder(stream);
                this.connectNodes(stream);
            })
            .catch((error) => {
                throw Error('in getUserMedia()');
            });
    }

    initMediaRecorder(stream: MediaStream) {
        if (!MediaRecorder) {
            throw Error('MediaRecorder not available!');
        }
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            console.log('ondataavailable()');
            this.blobs.push(event.data);
        }

        this.mediaRecorder.onstop = (event: Event) => {
            console.log('mediaRecorder.onStop()');
            if (this.blobs.length !== 1) {
                throw Error('More than 1 blobs!');
            }
            if (!this.onStop) {
                throw Error('WebAudio:onStop() not set!');
            }
            this.onStop(this.blobs[0]);
            this.blobs = [];
        }
    }

    connectNodes(stream: MediaStream) {
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);
        // this next line repeats microphone input to speaker output
        // this.audioGainNode.connect(this.audioContext.destination);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserBufferLength = this.analyserNode.frequencyBinCount;
        this.analyserBuffer = new Uint8Array(this.analyserBufferLength);
        // this.sourceNode.connect(analyser);
        this.sourceNode.connect(this.audioGainNode);
        this.audioGainNode.connect(this.analyserNode);
    }

    getBufferMaxVolume() {
        if (!this.analyserNode) {
            return 0;
        }

        let i: number, bufferMax: number = 0, absValue: number;
        this.analyserNode.getByteTimeDomainData(this.analyserBuffer);
        for (i = 0; i < this.analyserBufferLength; i++) {
            absValue = Math.abs(this.analyserBuffer[i] - 128.0);
            if (absValue > bufferMax) {
                bufferMax = absValue;
            }
        }
        return bufferMax;
    }

    setGainFactor(factor: number) {
        this.audioGainNode.gain.value = factor;
    }

    isRecording() {
        return this.mediaRecorder &&
            (this.mediaRecorder.state === 'recording');
    }

    isInactive() {
        return !this.mediaRecorder ||
            this.mediaRecorder.state === 'inactive';
    }

    startRecording() {
        this.mediaRecorder.start();
    }

    pauseRecording() {
        this.mediaRecorder.pause();
    }

    resumeRecording() {
        this.mediaRecorder.resume();
    }

    stopRecording() {
        this.mediaRecorder.stop();
    }
}