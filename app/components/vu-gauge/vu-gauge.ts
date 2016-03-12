import {Component, Input, OnChanges, SimpleChange} from "angular2/core";


/**
 * @name VuGauge
 * @description
 * An LED lights display. LEDs are displayed either dark (off) or lit up
 * (on), depending on where "value" is in the interval ["min", "max"].
 */
@Component({
    selector: "vu-gauge",
    template: [
        "<svg fill=\"rgba(0,0,0,0)\" width=\"100%\" [attr.height]=\"height\">",
        "    <rect *ngFor=\"#led of leds\"",
        "          [attr.width]=\"ledWidth\"",
        "          [attr.height]=\"height\"",
        "          [attr.x]=\"led.x\"",
        "          [attr.stroke-width]=\"led.strokeWidth\"",
        "          [attr.fill]=\"led.fill\"",
        "          stroke=\"#FFF\" />",
        "</svg>"
    ].join("")
})
export class VuGauge implements OnChanges {
    @Input() private height: string;
    @Input() private nbars: number;
    @Input() private min: number;
    @Input() private max: number;
    @Input() private value: number;
    @Input() private rate: number;
    private ledWidth: string;
    private leds: { x: string, fill: string, strokeWidth: string }[];
    private hStep: number;
    private valueStep: number;
    private maxValue: number;
    private maxValueIndex: number;

    constructor() {
        console.log("constructor():VuGauge");
        this.leds = [];
        this.maxValue = 0;
        this.maxValueIndex = 0;
    }

    fillColor(ledIndex: number, lightness: string) {
        return ["hsl(", 120.0 - ledIndex * this.hStep,
                ",100%,", lightness, ")"].join("");
    }

    ngOnInit() {
        let percentWidth: number = 100.0 / (2 * this.nbars - 1),
        xStep: number = 2.0 * percentWidth, i: number;
        this.ledWidth = percentWidth + "%";
        this.hStep = 120.0 / (this.nbars - 1.0);
        for (i = 0; i < this.nbars; i++) {
            this.leds.push({
                x: (i * xStep) + "%",
                fill: this.fillColor(i, "15%"),
                strokeWidth: "0"
            });
        }
        this.valueStep = (this.max - this.min) / (this.nbars - 1.0);
    }

    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
        if ((this.leds.length > 0) && (changeRecord["value"])) {
            let fill: string, i: number;
            for (i = 0; i < this.nbars; i++) {
                if (this.min + this.valueStep * i < this.value) {
                    fill = this.fillColor(i, "50%");
                }
                else {
                    fill = this.fillColor(i, "15%");
                }
                this.leds[i].fill = fill;
                this.leds[i].strokeWidth = "0";
            }
            if (this.value >= this.maxValue) {
                this.maxValue = this.value;
                this.maxValueIndex = Math.floor(
                    (this.value - this.min) / this.valueStep);
            }
            this.leds[this.maxValueIndex].strokeWidth = "1";
        }
    }
}
