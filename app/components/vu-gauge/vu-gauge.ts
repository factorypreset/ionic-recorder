import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';


/**
 * @name VuGauge
 * @description
 * An LED lights display that light up to monitor a changing signal in
 * real-time.  This display is a width:100% horizontal rectangle
 * willed with small vertical rectangles that are the LEDs.  Thes LEDs
 * show up either dark state or lit up, depending on the input value.
 */
@Component({
    selector: 'vu-gauge',
    template: ['<svg fill="rgba(0,0,0,0)" width="100%"',
        '            [attr.height]="height">',
        '           <rect width="100%" [attr.height]="height" />',
        '           <rect *ngFor="#led of ledRects"',
        '                 [attr.width]="ledWidth"',
        '                 [attr.height]="height"',
        '                 [attr.x]="led.x"',
        '                 [attr.stroke-width]="led.strokeWidth"',
        '                 stroke="rgb(255, 255, 255)"',
        '                 [attr.fill]="led.fill" />',
        '      </svg>'].join('')
})
export class VuGauge implements OnChanges {
    @Input() private height: string;
    @Input() private nbars: number;
    @Input() private min: number;
    @Input() private max: number;
    @Input() private value: number;
    @Input() private rate: number;
    private ledWidth: string;
    private ledRects: { x: string, fill: string, strokeWidth: string }[];
    private hStep: number;
    private valueStep: number;
    private maxValue: number;
    private maxValueIndex: number;
    private totalTime: number;
    private startTime: number;

    constructor() {
        console.log('constructor():VuGauge');
        this.ledRects = [];
        this.maxValue = 0;
        this.maxValueIndex = 0;
    }

    ngOnInit() {
        let percentWidth: number = 100.0 / (2 * this.nbars - 1);
        this.ledWidth = percentWidth + '%';
        let xStep: number = 2.0 * percentWidth;
        this.hStep = 120.0 / (this.nbars - 1.0);
        for (let i: number = 0; i < this.nbars; i++) {
            this.ledRects.push({
                x: (i * xStep) + '%',
                fill: ['hsl(', 120.0 - i * this.hStep,
                    ', 100%, 15%)'].join(''),
                strokeWidth: "0"
            });
        }
        this.valueStep = (this.max - this.min) / (this.nbars - 1.0);
    }

    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
        if ((this.ledRects.length > 0) && (changeRecord['value'])) {
            let fill: string, i: number;
            for (i = 0; i < this.nbars; i++) {
                if (this.min + this.valueStep * i < this.value) {
                    fill = ['hsl(', 120.0 - i * this.hStep,
                        ', 100%, 50%)'].join('');
                }
                else {
                    fill = ['hsl(', 120.0 - i * this.hStep,
                        ', 100%, 15%)'].join('');
                }
                this.ledRects[i].fill = fill;
                this.ledRects[i].strokeWidth = '0';
            }
            if (this.value >= this.maxValue) {
                this.maxValue = this.value;
                this.maxValueIndex = Math.floor(
                    (this.value - this.min) / this.valueStep);
            }
            this.ledRects[this.maxValueIndex].strokeWidth = '1';
        }
    }
}