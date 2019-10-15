import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  sliderValue: number;
  dataGroupings = {
    1: "#f0f9e8",
    5: "#bae4bc",
    10: "#7bccc4",
    20: "#43a2ca",
    76: "#0868ac"
  };
  sliderMarkers = Object.keys(this.dataGroupings).map(k => Number(k));
  constructor() {}

  sliderValueChanged(value: number) {
    this.sliderValue = value;
  }

  ngOnInit() {}
}
