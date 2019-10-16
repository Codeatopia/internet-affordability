// tslint:disable variable-name

import { Component, Input } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as L from "leaflet";
import * as topojson from "topojson-client";
import { Topology } from "topojson-specification";
import { GeoJsonObject } from "geojson";

export interface IMapFeature {
  ADM0_A3: string;
  background: string;
  popup?: HTMLElement | string;
  data: any;
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
  /**
   * @param colours - specify specific value:colorString pairs to use
   * for grouping features by a specific colour
   */
  @Input() colours: IColourBoundaries = { [Infinity]: "#fff" };
  @Input() set features(features: IMapFeature[]) {
    this._features = features;
    if (this.map) {
      this.loadFeatureMap();
    }
  }

  _features: IMapFeature[] = [];
  options = {
    layers: [],
    zoom: 2,
    center: L.latLng(0, 0)
  };
  map: L.Map;
  geoJsonData: GeoJsonObject;
  baseLayer: L.GeoJSON;
  featureLayer: L.GeoJSON;
  constructor(private http: HttpClient) {}

  async onMapReady(map: L.Map) {
    this.map = map;
    await this.loadGeoJsonData();
    this.loadBasemap();
    this.loadFeatureMap();
  }
  // load a simple basemap outline of all countries
  async loadBasemap() {
    this.baseLayer = L.geoJSON(this.geoJsonData, {
      style: GEOJSON_DEFAULTS
    });
    console.log("geojson", this.geoJsonData);
    this.baseLayer.addTo(this.map);
  }

  // load data as feature layer on map
  async loadFeatureMap() {
    if (this.featureLayer) {
      this.featureLayer.removeFrom(this.map);
    }
    console.log("loading feature map", this._features);
    // organise features by country code for quicker lookup
    const featuresJson: { [key: string]: IMapFeature } = {};
    this._features.forEach(f => (featuresJson[f.ADM0_A3] = f));
    this.featureLayer = L.geoJSON(this.geoJsonData, {
      filter: feature => {
        return featuresJson.hasOwnProperty(feature.properties.ADM0_A3);
      },
      onEachFeature: (feature, layer) => {
        // merge with feature data
        const data = featuresJson[feature.properties.ADM0_A3];
        if (data) {
          layer.on({
            mouseover: e => this._onLayerHoverIn(e.target),
            mouseout: e => this._onLayerHoverOut(e.target),
            click: e => this._onLayerClick(e.target)
          });
          if (data.popup) {
            layer.bindPopup(data.popup, {
              className: "popup-container"
            });
          }
        }
      },
      style: feature => this._setStyle(featuresJson[feature.properties.ADM0_A3])
    });
    this.featureLayer.addTo(this.map);
  }

  // convert local topojson to geojson and merge with data for use in features
  async loadGeoJsonData() {
    const worldTopojson = (await this.http
      .get("assets/geojson/countries.topojson.json")
      .toPromise()) as Topology;
    const worldGeoJson: any = topojson.feature(
      worldTopojson,
      worldTopojson.objects.countries
    );
    // merge data with country geojson
    // worldGeoJson.features.map((f: IFeatureWithData) => {
    //   f.data = { ...this.data[f.properties.ADM0_A3] };
    // });
    this.geoJsonData = worldGeoJson;
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
    this.featureLayer.resetStyle(feature);
  }
  private _setStyle(feature: IMapFeature) {
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
}

const GEOJSON_DEFAULTS: L.PathOptions = {
  fillOpacity: 1,
  color: "#b5b5b5",
  opacity: 1,
  weight: 2,
  className: "geo-path"
};
