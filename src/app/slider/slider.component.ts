import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewChild
} from "@angular/core";
import { MatSliderChange, MatSlider } from "@angular/material/slider";

export interface ISliderMarker {
  index: number;
  value: number;
  color: string;
  background: string;
  label?: string | number;
  hideLabel?: boolean;
}
@Component({
  selector: "app-slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.scss"]
})
export class SliderComponent {
  @Output() onChange = new EventEmitter<number>();
  // markers to show above slider
  @Input() markers: ISliderMarker[] = [];
  @Input() options: Partial<MatSlider>;
  @ViewChild("slider", { static: true }) slider: MatSlider;
  sliderOptions: Partial<MatSlider>;
  sliderValue: number;

  ngOnInit(): void {
    this.sliderInit();
  }

  sliderInit() {
    this.sliderOptions = { ...SLIDER_DEFAULTS, ...this.options };
    this.markers = this.markers.map(m => {
      m.label = this.sliderOptions.displayWith(m.value);
      return m;
    });
    // initialise slider on max value
    this.sliderValue = this.markers[this.markers.length - 1].value;
  }

  onSliderChange(e: MatSliderChange) {
    this.sliderValue = e.value;
    this.onChange.next(e.value);
  }

  onSliderThumbMoved(e: MatSliderChange) {
    // additional method can be called for more fine-grained changes
  }
}

const SLIDER_DEFAULTS: Partial<MatSlider> = {
  max: 76,
  min: 0,
  value: 0,
  step: 1,
  thumbLabel: true,
  // TODO - fix why default blocks cost display
  displayWith: v => `$${v}`
};
