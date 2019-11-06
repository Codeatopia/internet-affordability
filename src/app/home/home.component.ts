import { Component } from "@angular/core";
import { ISliderMarker } from "../slider/slider.component";
import DATA from "src/assets/data/gbCost";
import { IMapFeature } from "../map/map.component";
import { MatSlider } from "@angular/material/slider";

type IVisType = "cost" | "time";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  activeVis: IVisType = "time";
  data: IData[];
  sliderValue: { [key in IVisType]: number } = {
    cost: Infinity,
    time: Infinity
  };
  markers = MARKERS;
  mapFeatures: IMapFeature[] = [];
  sliderOptions = SLIDER_OPTIONS;
  heading: any;
  constructor() {
    this.init(this.activeVis);
  }

  get activeMarkers() {
    return this.markers[this.activeVis];
  }
  init(vis: IVisType) {
    this.activeVis = vis;
    this.prepareData(vis);
    this.heading = HEADINGS[vis];
    this.sliderValueChanged(this.sliderValue[vis], vis);
  }

  toggleVis() {
    const nextVis = this.activeVis === "cost" ? "time" : "cost";
    this.init(nextVis);
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
        activeValue: type === "cost" ? d.Cost : timeValue
      };
      return processed;
    });
  }
  sliderValueChanged(value: number, vis: IVisType) {
    // ignore duplicate fire on init
    if (vis === this.activeVis) {
      this.sliderValue[vis] = value;
      const filteredFeatures = this.filterData(value);
      this.addMapFeatures(filteredFeatures);
    }
  }

  filterData(value: number) {
    // don't filter if at max
    const maxFilter = [...this.activeMarkers].pop().value;
    if (value >= maxFilter) {
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
        tooltip: this._getTooltip(d),
        data: d
      };
      return feature;
    });
  }

  _getTooltip(data: IData) {
    const time = simplifyTime(data.Time);
    return data.Cost && data.Time
      ? `
      <div class="popup-container">
        <div class="popup-title" >${data.Name}</div>
        <div class="popup-content" >
          <div><span class="popup-text-variable">$${data.Cost}</span> <span class="popup-text-variable">${time} work</span></div>
          <p style="margin-top:1em; font-size:x-small">Based on average income of $${data.GDP}</p>
        </div>
      </div>

    `
      : `Data not available`;
  }

  private _getFillColor(d: IData) {
    // iterate over list of available colours and return first
    // that is larger than supplied number (upper limit)
    if (d.activeValue) {
      const grouping = this.activeMarkers.find(el => el.value > d.activeValue);
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
const formatCost = (v: number) => {
  return "$" + v;
};

/**************************************************************************************
 *  Variables and Interfaces
 **************************************************************************************/

// Assumptions for time spent working
// 60 mins per hour, 40 hours per week, 50 weeks per year
const ANNUAL_WORK_MINS = 60 * 40 * 50;

// Color scale generator: https://observablehq.com/@shastabolicious/two-hue-sequential-color-scale
const COST_MARKERS: ISliderMarker[] = [
  {
    index: 0,
    value: 1,
    background: "#bad2f5",
    color: "#616161"
  },
  {
    index: 1,
    value: 5,
    background: "#74a8cc",
    color: "#fff"
  },
  {
    index: 2,
    value: 10,
    background: "#40808c",
    color: "#fff"
  },
  {
    index: 3,
    value: 20,
    background: "#245651",
    color: "#fff"
  },
  {
    index: 4,
    value: 76,
    background: "#152e25",
    color: "#fff"
  }
];

const TIME_MARKERS: ISliderMarker[] = [
  {
    index: 0,
    value: 10,
    background: "#dec7f6",
    color: "#616161"
    // hideLabel: true
  },
  {
    index: 1,
    value: 60,
    background: "#bc93ce",
    color: "#fff"
  },
  {
    index: 2,
    value: 480,
    background: "#966a86",
    color: "#fff"
  },
  { index: 3, value: 960, background: "#65483e", color: "#fff" },
  { index: 4, value: 2400, background: "#332717", color: "#fff" }
  // {
  //   value: 4350,
  //   background: "#0868ac",
  //   color: "#fff"
  // }
];
const COST_OPTIONS: Partial<MatSlider> = {
  max: 76,
  min: 0,
  value: 0,
  step: 1,
  displayWith: (v: number) => {
    return formatCost(v);
  }
};
const TIME_OPTIONS: Partial<MatSlider> = {
  max: TIME_MARKERS[TIME_MARKERS.length - 1].value,
  min: 0,
  value: 0,
  step: 10,
  displayWith: (v: number) => {
    return simplifyTime(v);
  }
};
const SLIDER_OPTIONS: { [key in IVisType]: Partial<MatSlider> } = {
  cost: COST_OPTIONS,
  time: TIME_OPTIONS
};
const MARKERS: { [key in IVisType]: ISliderMarker[] } = {
  cost: COST_MARKERS,
  time: TIME_MARKERS
};
const HEADINGS = {
  cost: {
    titleVar: "Cost",
    subtitle: "Cost of 1GB bundle around the world"
  },
  time: {
    titleVar: "Affordability",
    subtitle: "Time-equivalent of 1GB bundle around the world"
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
