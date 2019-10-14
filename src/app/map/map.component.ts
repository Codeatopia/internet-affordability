import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as L from "leaflet";
import * as topojson from "topojson-client";
import { Topology } from "topojson-specification";
import { Feature, Geometry } from "geojson";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent {
  options = {
    layers: [
      // L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      //   maxZoom: 18,
      //   attribution: "..."
      // })
    ],
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
      .get("assets/geojson/world.topojson.json")
      .toPromise()) as Topology;
    console.log("topojson", worldTopojson);
    const worldGeoJson = topojson.feature(
      worldTopojson,
      worldTopojson.objects.countries
    );

    console.log("map", this.map);
    this.geoJson = L.geoJSON(worldGeoJson, {
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: e => this._onLayerHoverIn(e.target),
          mouseout: e => this._onLayerHoverOut(e.target),
          click: e => this._onLayerClick(e.target)
        });
      },
      style: feature => this._setStyle(feature)
    });
    this.geoJson.addTo(this.map);

    console.log("world geo", worldGeoJson);
  }

  private _onLayerClick(feature: L.GeoJSON) {
    feature.setStyle({
      fillColor: "blue"
    });
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
  private _setStyle(feature: Feature<Geometry>) {
    return {
      ...GEOJSON_DEFAULTS,
      fillColor: this._getFillColor(feature.properties.cost)
    };
  }

  private _getFillColor(c: number) {
    console.log("get fill", c);
    return c ? COLOURS[Math.floor(c / 10)] : "#fff";
  }
}

interface IFeatureProperties {
  cost: number;
  selected: boolean;
}

const GEOJSON_DEFAULTS: L.PathOptions = {
  fillOpacity: 1,
  color: "#b5b5b5",
  opacity: 1,
  weight: 2,
  className: "geo-path"
};

const COLOURS = ["#f0f9e8", "#bae4bc", "#7bccc4", "#43a2ca", "#0868ac"];
