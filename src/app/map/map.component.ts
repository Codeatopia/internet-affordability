import { Component, Input } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as L from "leaflet";
import * as topojson from "topojson-client";
import { Topology } from "topojson-specification";
import { Feature, Geometry } from "geojson";
import DATA from "src/assets/data/gbCost";

interface IFeatureWithData extends Feature<Geometry, any> {
  data: IMapData;
  properties: IGeoJsonProps;
}
interface IMapData {
  Cost?: number;
  GDP?: number;
  GDP_Class?: number;
  Name?: string;
}
interface IGeoJsonProps {
  ADMIN: string;
  ADM0_A3: string;
}
interface IColourBoundaries {
  [value: number]: string;
}

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent {
  @Input() colours: IColourBoundaries = { [Infinity]: "#fff" };
  @Input() mapData: any;
  data: { [key: string]: IMapData } = DATA;
  options = {
    layers: [],
    zoom: 2,
    center: L.latLng(0, 0)
  };
  map: L.Map;
  geoJson: L.GeoJSON;
  constructor(private http: HttpClient) {}

  _onMapReady(map: L.Map) {
    this.map = map;
    this.loadGeoJson();
  }

  async loadGeoJson() {
    const worldTopojson = (await this.http
      .get("assets/geojson/countries.topojson.json")
      .toPromise()) as Topology;
    const worldGeoJson: any = topojson.feature(
      worldTopojson,
      worldTopojson.objects.countries
    );
    // merge data with country geojson
    worldGeoJson.features.map((f: IFeatureWithData) => {
      f.data = { ...this.data[f.properties.ADM0_A3] };
    });
    this.geoJson = L.geoJSON(worldGeoJson, {
      onEachFeature: (feature, layer) => {
        const f = feature as IFeatureWithData;
        const data = f.data;
        layer.on({
          mouseover: e => this._onLayerHoverIn(e.target),
          mouseout: e => this._onLayerHoverOut(e.target),
          click: e => this._onLayerClick(e.target)
        });
        layer.bindPopup(
          `
        <div class="popup-title" >${data.Name}</div>
        <div class="popup-content" >
          <p>1GB data costs <span class="variable">$${data.Cost}</p>
          <p>This is comparable to <span class="variable">${this._calcWorkEquivalent(
            data.Cost,
            data.GDP
          )}</span> of work</p>
        </div>
        
        `,
          {
            className: "popup-container"
          }
        );
      },
      style: feature => this._setStyle(feature as IFeatureWithData)
    });
    this.geoJson.addTo(this.map);
  }

  private _onLayerClick(feature: L.GeoJSON) {
    console.log("feature", feature);
    feature.setStyle({
      // fillColor: "blue"
    });
    // const popup = L.popup().setLatLng(feature.)
    // this.map.openPopup()
  }
  private _onLayerHoverIn(feature: L.GeoJSON) {
    feature.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7
    });
  }
  private _onLayerHoverOut(feature: L.GeoJSON) {
    this.geoJson.resetStyle(feature);
  }
  private _setStyle(feature: IFeatureWithData) {
    return {
      ...GEOJSON_DEFAULTS,
      fillColor: this._getFillColor(feature.data.Cost)
    };
  }

  private _getFillColor(c: number) {
    // iterate over list of available colours and return first
    // that is larger than supplied number (upper limit)
    const upperBoundColour = Object.keys(this.colours).find(v => Number(v) > c);
    return upperBoundColour ? this.colours[Number(upperBoundColour)] : "#fff";
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

const GEOJSON_DEFAULTS: L.PathOptions = {
  fillOpacity: 1,
  color: "#b5b5b5",
  opacity: 1,
  weight: 2,
  className: "geo-path"
};
