import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { MatSliderChange, MatSlider } from "@angular/material/slider";

@Component({
  selector: "app-slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.scss"]
})
export class SliderComponent implements OnInit {
  @Output() onChange = new EventEmitter<number>();
  // markers to show above slider
  markers = [1, 5, 10, 20, 75];
  sliderOptions: Partial<MatSlider> = {
    max: 75,
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
