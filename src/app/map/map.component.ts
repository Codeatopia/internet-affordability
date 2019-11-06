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
  tooltip?: HTMLElement | string;
  data: any;
}

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent {
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
    this.baseLayer.addTo(this.map);
  }

  // load data as feature layer on map
  async loadFeatureMap() {
    if (this.featureLayer) {
      this.featureLayer.removeFrom(this.map);
    }
    // organise features by country code for quicker lookup
    const featuresJson: { [key: string]: IMapFeature } = {};
    this._features.forEach(f => (featuresJson[f.ADM0_A3] = f));
    this.featureLayer = L.geoJSON(this.geoJsonData, {
      filter: feature => {
        return featuresJson.hasOwnProperty(feature.properties.ADM0_A3);
      },
      onEachFeature: (feature, layer) => {
        // merge with feature data
        const f = featuresJson[feature.properties.ADM0_A3];
        if (f) {
          layer.on({
            mouseover: e => this._onLayerHoverIn(e.target),
            mouseout: e => this._onLayerHoverOut(e.target),
            click: e => this._onLayerClick(e.target)
          });

          if (f.popup) {
            layer.bindPopup(f.popup, {
              className: "popup-container"
            });
          }
          if (f.tooltip) {
            layer.bindTooltip(f.tooltip, {
              className: "map-tooltip"
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
    feature.setStyle({
      // fillColor: "blue"
    });
  }
  private _onLayerHoverIn(feature: L.GeoJSON) {
    feature.setStyle({
      // weight: 2,
      // color: "black",
      dashArray: "",
      fillOpacity: 0.7
    });
    feature.openPopup();
  }
  private _onLayerHoverOut(feature: L.GeoJSON) {
    this.featureLayer.resetStyle(feature);
    feature.closePopup();
  }
  private _setStyle(feature: IMapFeature) {
    return {
      ...GEOJSON_DEFAULTS,
      fillColor: feature.background
    };
  }
}

const GEOJSON_DEFAULTS: L.PathOptions = {
  fillOpacity: 1,
  color: "#b5b5b5",
  opacity: 1,
  weight: 2,
  className: "geo-path"
};
