import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewChild
} from "@angular/core";
import { MatSliderChange, MatSlider } from "@angular/material/slider";

export interface ISliderMarker {
  value: number;
  color: string;
  background: string;
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
  @ViewChild("slider", { static: true }) slider: MatSlider;
  sliderOptions: Partial<MatSlider> = {
    max: 76,
    min: 0,
    value: 0,
    step: 1,
    thumbLabel: true,
    displayWith: (v: number) => `$${v}`
  };

  onSliderChange(e: MatSliderChange) {
    // force blur to hide thumb
    setTimeout(() => {
      this.slider.blur();
    }, 200);
    this.onChange.next(e.value);
  }

  onSliderThumbMoved(e: MatSliderChange) {
    // additional method can be called for more fine-grained changes
  }
}
