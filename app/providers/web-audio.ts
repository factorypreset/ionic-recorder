import {Injectable} from 'angular2/core';


@Injectable()
export class WebAudio {
    private audioContext: AudioContext;
    private audioGainNode: AudioGainNode;
    private mediaRecorder: MediaRecorder;
    private analyserNode: AnalyserNode;
    private sourceNode: MediaElementAudioSourceNode;
    private blobs: Blob[];

    constructor() {
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
            let blob: Blob = this.blobs[0];
            this.blobs = [];
        }
    }

    connectNodes(stream: MediaStream) {
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);
        // this next line repeats microphone input to speaker output
        // this.audioGainNode.connect(this.audioContext.destination);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        // this.sourceNode.connect(analyser);
        this.sourceNode.connect(this.audioGainNode);
        this.audioGainNode.connect(this.analyserNode);
    }

    getMaxVolume() {
        let bufferLength: number = this.analyserNode.frequencyBinCount,
            dataArray: Uint8Array = new Uint8Array(bufferLength),
            i: number, bufferMax: number = 0, absValue: number;
        this.analyserNode.getByteTimeDomainData(dataArray);
        for (i = 0; i < bufferLength; i++) {
            absValue = Math.abs(dataArray[i] - 128.0);
            if (absValue > bufferMax) {
                bufferMax = absValue;
            }
        }
        return bufferMax;
    }
}