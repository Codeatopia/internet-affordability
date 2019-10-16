import { Component } from "@angular/core";
import { ISliderMarker } from "../slider/slider.component";
import DATA from "src/assets/data/gbCost";
import { IMapFeature } from "../map/map.component";
import { MatSlider } from "@angular/material/slider";

type IVisType = "price" | "time";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  showVis: IVisType = "time";
  data: IData[];
  sliderValue: number;
  markers = PRICE_MARKERS;
  mapFeatures: IMapFeature[] = [];
  sliderOptions: Partial<MatSlider>;
  constructor() {
    this.prepareData();
    this.markers = this.showVis === "price" ? PRICE_MARKERS : TIME_MARKERS;
    this.sliderOptions =
      this.showVis === "price" ? PRICE_OPTIONS : TIME_OPTIONS;
  }

  // process raw data to calculate work time equivalent for time vis
  /*  Assumptions
      av hours worked per day = 8
      av days worked per year = 250 (50 weeks work, 2 weeks holiday)
  */
  prepareData() {
    const annualDays = 250;
    const dailyHours = 8;
    this.data = DATA.map(d => {
      const gdpCost = d.Cost / d.GDP;
      const processed: IData = {
        ...d,
        Time: {
          days: gdpCost * annualDays,
          hours: gdpCost * annualDays * dailyHours,
          mins: gdpCost * annualDays * dailyHours * 60
        }
      };
      return processed;
    });
    console.log("processed", this.data);
  }
  sliderValueChanged(value: number) {
    this.sliderValue = value;
    const filteredFeatures = this.filterData(value);
    this.addMapFeatures(filteredFeatures);
  }

  filterData(value: number) {
    return this.showVis === "price"
      ? this.data.filter(d => d.Cost < value)
      : this.data.filter(d => d.Time.mins < value);
  }

  addMapFeatures(dataFeatures: IData[]) {
    this.mapFeatures = dataFeatures.map(d => {
      const feature: IMapFeature = {
        ADM0_A3: d["Alpha-3"],
        background: this._getFillColor(d),
        popup: this._getPopup(d),
        tooltip: this._getTooltip(d),
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
  _getTooltip(data: IData) {
    return this.showVis === "price"
      ? `
      <div>${data.Name}</div>
      <div>$${data.Cost}</div>
    `
      : `
      <div>${data.Name}</div>
      <div>${simplifyTime(data.Time.mins)}</div>
    `;
  }

  private _getFillColor(d: IData) {
    // iterate over list of available colours and return first
    // that is larger than supplied number (upper limit)
    if (this.showVis === "price" && d.Cost) {
      const grouping = this.markers.find(el => el.value > d.Cost);
      return grouping.background;
    }
    if (this.showVis === "time" && d.Time) {
      const grouping = this.markers.find(el => el.value > d.Time.mins);
      return grouping.background;
    }
    return "#fff";
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

const PRICE_OPTIONS: Partial<MatSlider> = {
  max: 76,
  min: 0,
  value: 0,
  step: 1,
  displayWith: (v: number) => `$${v}`
};

// convert time in minutes to nearest quantifier
function simplifyTime(v: number) {
  // minutes
  return v < 60
    ? `${Math.round(v)}m`
    : // hours
    v < 480
    ? `${Math.round(v / 60)}h`
    : // days
      `${Math.round((v / 480) * 10) / 10}d`;
}

const PRICE_MARKERS: ISliderMarker[] = [
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

const TIME_MARKERS: ISliderMarker[] = [
  {
    value: 10,
    background: "#f0f9e8",
    color: "#616161"
    // hideLabel: true
  },
  {
    value: 60,
    background: "#bae4bc",
    color: "#fff"
  },
  {
    value: 480,
    background: "#7bccc4",
    color: "#fff"
  },
  {
    value: 960,
    background: "#43a2ca",
    color: "#fff"
  },
  {
    value: 4350,
    background: "#0868ac",
    color: "#fff"
  }
];
const TIME_OPTIONS: Partial<MatSlider> = {
  max: TIME_MARKERS[TIME_MARKERS.length - 1].value,
  min: 0,
  value: 0,
  step: 10,
  displayWith: (v: number) => {
    return simplifyTime(v);
  }
};

interface IData {
  Cost?: number;
  GDP?: number;
  Time?: {
    mins: number;
    hours: number;
    days: number;
  };
  Name?: string;
}
