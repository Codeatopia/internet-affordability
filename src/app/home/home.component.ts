import { Component } from "@angular/core";
import { ISliderMarker } from "../slider/slider.component";
import DATA from "src/assets/data/gbCost";
import { IMapFeature } from "../map/map.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  data: IData[] = DATA;
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
  mapFeatures: IMapFeature[] = [];
  constructor() {}

  sliderValueChanged(value: number) {
    this.sliderValue = value;
    const filteredFeatures = this.filterData("Cost", value);
    this.addMapFeatures(filteredFeatures);
  }

  filterData(field: keyof IData, value: number) {
    return this.data.filter(d => d[field] < value);
  }

  addMapFeatures(dataFeatures: any[]) {
    this.mapFeatures = dataFeatures.map(d => {
      const feature: IMapFeature = {
        ADM0_A3: d["Alpha-3"],
        background: "#f0f9e8",
        popup: this._getPopup(d),
        data: d
      };
      return feature;
    });
  }

  _getPopup(data: IData) {
    return `
    <div class="popup-title" >${data.Name}</div>
    <div class="popup-content" >
      <p>1GB data costs <span class="variable">$${data.Cost}</p>
      <p>This is comparable to <span class="variable">${this._calcWorkEquivalent(
        data.Cost,
        data.GDP
      )}</span> of work</p>
    </div>
    `;
  }

  /**************************************************************************************
   *  Specific affordability methods to be moved
   **************************************************************************************/
  private _calcWorkEquivalent(cost?: number, gdp?: number) {
    if (cost && gdp) {
      const workMins = Math.round((cost / gdp) * annualWorkMins);
      const workHours = Math.round((workMins / 60) * 10) / 10;
      const workDays = Math.round((workHours / 7) * 10) / 10;
      return workMins < 60
        ? `${workMins} minutes`
        : workHours < 7
        ? `${workHours} hours`
        : `${workDays} days`;
    }
    return "N/A";
  }
}

// rought estimate - 60 mins per hour, 40 hours per week, 50 weeks per year
const annualWorkMins = 60 * 40 * 50;

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

interface IData {
  Cost?: number;
  GDP?: number;
  GDP_Class?: number;
  Name?: string;
}
