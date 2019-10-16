import { Component } from "@angular/core";
import { ISliderMarker } from "../slider/slider.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  sliderValue: number;
  dataGroupings = {
    1: "#f0f9e8",
    5: "#bae4bc",
    10: "#7bccc4",
    20: "#43a2ca",
    76: "#0868ac"
  };
  sliderMarkers = SLIDER_MARKERS;
  sliderColors = Object.values(this.dataGroupings);
  constructor() {}

  sliderValueChanged(value: number) {
    this.sliderValue = value;
  }
}

const SLIDER_MARKERS: ISliderMarker[] = [
  {
    value: 1,
    background: "#f0f9e8",
    color: "#616161"
  },
  {
    value: 5,
    background: "#bae4bc",
    color: "#fff"
  },
  {
    value: 10,
    background: "#7bccc4",
    color: "#fff"
  },
  {
    value: 20,
    background: "#43a2ca",
    color: "#fff"
  },
  {
    value: 76,
    background: "#0868ac",
    color: "#fff"
  }
];
