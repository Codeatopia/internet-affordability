import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { environment } from "../environments/environment";
import { HomeComponent } from "./home/home.component";
import { MapComponent } from "./map/map.component";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
  declarations: [AppComponent, HomeComponent, MapComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production
    }),
    LeafletModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
