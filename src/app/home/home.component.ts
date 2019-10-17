import { Component } from "@angular/core";
import { ISliderMarker } from "../slider/slider.component";
import DATA from "src/assets/data/gbCost";
import { IMapFeature } from "../map/map.component";
import { MatSlider } from "@angular/material/slider";
import { ActivatedRoute } from "@angular/router";

type IVisType = "price" | "time";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  activeVis: IVisType;
  data: IData[];
  sliderValue: number;
  markers = PRICE_MARKERS;
  mapFeatures: IMapFeature[] = [];
  sliderOptions: Partial<MatSlider>;
  constructor(route: ActivatedRoute) {
    //  TODO - add better route binding
    this.activeVis = route.snapshot.routeConfig.path as IVisType;
    console.log("active vis", this.activeVis);
    console.log("activeVis", this.activeVis);
    this.prepareData(this.activeVis);
    this.markers = this.activeVis === "price" ? PRICE_MARKERS : TIME_MARKERS;
    this.sliderOptions =
      this.activeVis === "price" ? PRICE_OPTIONS : TIME_OPTIONS;
  }

  // process raw data to calculate work time equivalent for time vis
  prepareData(type: IVisType) {
    this.data = DATA.map(d => {
      const gdpCost = d.Cost / d.GDP;
      const timeValue = gdpCost * ANNUAL_WORK_MINS;
      const processed: IData = {
        ...d,
        Time: timeValue,
        // set the main variable now to avoid lots of future if/switch statements
        activeValue: type === "price" ? d.Cost : timeValue
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
    // don't filter if at max
    const maxFilter = this.markers[this.markers.length - 1].value;
    if (value === maxFilter) {
      value = Infinity;
    }
    // filter on active variable (display value)
    return this.data.filter(d => d.activeValue < value);
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
    return data.Cost && data.Time
      ? `
    <div class="popup-title" >${data.Name}</div>
    <div class="popup-content" >
      <p>1GB data costs <span class="variable">$${data.Cost}</p>
      <p>The average income is $${
        data.GDP
      } per year, so this is comparable to <span class="variable">${simplifyTime(
          data.Time
        )}</span> of work</p>
    </div>
    `
      : `Data not available`;
  }
  _getTooltip(data: IData) {
    return this.activeVis === "price"
      ? `
      <div>${data.Name}</div>
      <div>$${data.Cost}</div>
    `
      : `
      <div>${data.Name}</div>
      <div>${simplifyTime(data.Time)}</div>
    `;
  }

  private _getFillColor(d: IData) {
    // iterate over list of available colours and return first
    // that is larger than supplied number (upper limit)
    if (d.activeValue) {
      const grouping = this.markers.find(el => el.value > d.activeValue);
      // provide fallback in case including data beyond current groups
      return grouping ? grouping.background : "#636363";
    }
    return "#fff";
  }
}

/**************************************************************************************
 *  Time display methods
 **************************************************************************************/
// convert time in minutes to nearest quantifier
const simplifyTime = (v: number) => {
  // minutes
  return v < 60
    ? `${Math.round(v)}m`
    : // hours
    v < 480
    ? `${Math.round(v / 60)}h`
    : // days
    v < 2400
    ? `${Math.round((v / 480) * 10) / 10}d`
    : // weeks
      `${Math.round((v / 2400) * 10) / 10}w`;
};
const formatPrice = (v: number) => {
  return "$" + v;
};

/**************************************************************************************
 *  Variables and Interfaces
 **************************************************************************************/

// Assumptions for time spent working
// 60 mins per hour, 40 hours per week, 50 weeks per year
const ANNUAL_WORK_MINS = 60 * 40 * 50;

const PRICE_OPTIONS: Partial<MatSlider> = {
  max: 76,
  min: 0,
  value: 0,
  step: 1,
  displayWith: (v: number) => {
    return formatPrice(v);
  }
};
// Color scale generator: https://observablehq.com/@shastabolicious/two-hue-sequential-color-scale
const PRICE_MARKERS: ISliderMarker[] = [
  {
    value: 1,
    background: "#bad2f5",
    color: "#616161"
  },
  {
    value: 5,
    background: "#74a8cc",
    color: "#fff"
  },
  {
    value: 10,
    background: "#40808c",
    color: "#fff"
  },
  {
    value: 20,
    background: "#245651",
    color: "#fff"
  },
  {
    value: 76,
    background: "#152e25",
    color: "#fff"
  }
];

const TIME_MARKERS: ISliderMarker[] = [
  {
    value: 10,
    background: "#dec7f6",
    color: "#616161"
    // hideLabel: true
  },
  {
    value: 60,
    background: "#bc93ce",
    color: "#fff"
  },
  {
    value: 480,
    background: "#966a86",
    color: "#fff"
  },
  {
    value: 960,
    background: "#65483e",
    color: "#fff"
  },
  {
    value: 2400,
    background: "#332717",
    color: "#fff"
  }
  // {
  //   value: 4350,
  //   background: "#0868ac",
  //   color: "#fff"
  // }
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
  activeValue: number;
  Cost?: number;
  GDP?: number;
  // time measured in minutes
  Time?: number;
  Name?: string;
}
