import {Injectable} from 'angular2/core';


@Injectable()
export class IndexedDB {
    private audioContext: AudioContext;
    private audioGainNode: AudioGainNode;
    private mediaRecorder: MediaRecorder;
    private analyserNode: AnalyserNode;

    private blobs: Blob[];
    private source: MediaElementAudioSourceNode;

    constructor() {
        this.audioContext = new AudioContext();
        if (!this.audioContext) {
            throw Error('AudioContext not available!');
        }
        this.audioGainNode = this.audioContext.createGain();
        this.blobs = [];
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

    monitorStream(stream: MediaStream) {
        this.source = this.audioContext.createMediaStreamSource(stream);

        // this next line repeats microphone input to speaker output
        // this.audioGainNode.connect(this.audioContext.destination);

        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        let bufferLength: number = this.analyserNode.frequencyBinCount,
            dataArray: Uint8Array = new Uint8Array(bufferLength);

        // this.source.connect(analyser);
        this.source.connect(this.audioGainNode);
        this.audioGainNode.connect(analyser);

        this.totalPauseTime = this.monitorTotalTime = this.lastPauseTime = 0;
        this.monitorStartTime = Date.now();

        let repeat: Function = () => {
            this.monitorTotalTime += MONITOR_TIMEOUT_MSEC;
            analyser.getByteTimeDomainData(dataArray);
            let bufferMax: number = 0;
            for (let i: number = 0; i < bufferLength; i++) {
                let absValue: number = Math.abs(dataArray[i] - 127.0);
                if (absValue === this.maxVolume && this.maxVolume > 1) {
                    this.nMaxPeaks += 1;
                }
                else if (absValue > bufferMax) {
                    bufferMax = absValue;
                }
            }
            if (bufferMax > this.maxVolume) {
                this.nMaxPeaks = 1;
                this.maxVolume = bufferMax;
            }
            this.currentVolume = bufferMax;
            // console.log(this.currentVolume);
            let currentTime: number = Date.now(),
                timeoutError: number = currentTime -
                    this.monitorStartTime - this.monitorTotalTime;
            if (this.mediaRecorder.state === MEDIA_RECORDER_RECORDING_STATE) {
                this.duration = currentTime - this.recordStartTime -
                    this.totalPauseTime;
                this.recordingTime = msec2time(this.duration);
            }
            setTimeout(repeat, MONITOR_TIMEOUT_MSEC - timeoutError);
        };
        setTimeout(repeat, MONITOR_TIMEOUT_MSEC);
  */  }

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
                // convert factor (a number in [0, 1]) to decibels
                this.dB = num2str(10.0 * Math.log10(factor), 2) + ' dB';
            }
            this.audioGainNode.gain.value = factor;
        }

        onClickStartPauseButton() {
            this.currentVolume += Math.abs(Math.random() * 10);
            if (this.mediaRecorder.state === MEDIA_RECORDER_RECORDING_STATE) {
                this.mediaRecorder.pause();
                this.lastPauseTime = Date.now();
                this.recordButtonIcon = START_RESUME_ICON;
            }
            else {
                if (this.mediaRecorder.state === MEDIA_RECORDER_INACTIVE_STATE) {
                    this.mediaRecorder.start();
                    this.recordStartTime = Date.now();
                }
                else {
                    this.mediaRecorder.resume();
                    this.totalPauseTime += Date.now() - this.lastPauseTime;
                }
                this.recordButtonIcon = PAUSE_ICON;
            }
        }

        onClickStopButton() {
            this.mediaRecorder.stop();
            this.totalPauseTime = 0;
            this.recordingTime = msec2time(0);
            this.recordButtonIcon = START_RESUME_ICON;
        }
    }
