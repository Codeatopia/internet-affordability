import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { MatSliderChange, MatSlider } from "@angular/material/slider";

@Component({
  selector: "app-slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.scss"]
})
export class SliderComponent implements OnInit {
  @Output() onChange = new EventEmitter<number>();
  // markers to show above slider
  @Input() markers: number[] = [];
  sliderOptions: Partial<MatSlider> = {
    max: 76,
    min: 0,
    value: 0,
    step: 1,
    thumbLabel: false
  };

  constructor() {}

  ngOnInit() {}

  onSliderChange(e: MatSliderChange) {
    this.onChange.next(e.value);
  }
}
