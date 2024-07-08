import { useState } from "react";

import "@esri/calcite-components/dist/calcite/calcite.css";
import "./App.css";

import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-navigation";
import "@esri/calcite-components/dist/components/calcite-navigation-logo";
import "@esri/calcite-components/dist/components/calcite-navigation-user";
import {
  CalciteShell,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteNavigationUser,
  CalcitePanel,
} from "@esri/calcite-components-react";

import { setAssetPath } from "@esri/calcite-components/dist/components";
setAssetPath("https://js.arcgis.com/calcite-components/2.8.1/assets");

import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";
import { defineCustomElements as defineChartsElements } from "@arcgis/charts-components/dist/loader";

// define custom elements in the browser, and load the assets from the CDN
defineChartsElements(window, {
  resourcesUrl: "https://js.arcgis.com/charts-components/4.30/t9n",
});
defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.8.5/assets",
});

import { application, analysis } from "./config.json";

import { usePortalNU } from "./hooks/usePortalNU";
import { UploadLocations } from "./components/UploadModal/UploadLoactions";

import Point from "@arcgis/core/geometry/Point";
import { LocationList } from "./components/LocationResults/LocationList.tsx";
import { AnalysisLayer } from "./utils/getAnalysisLayerInfo";
// import { Result } from "./utils/x_inspectLocation.tsx";
// import { LocationResult } from "./utils/inspectLocations.tsx";
import { MapChartUI } from "./components/WebMap_ResultUI/MapChartUI";
import { SelectedLocationElement } from "./shared/types";
import { LocationResult, inspectLocation } from "./utils/inspectLocations.tsx";

export interface Location {
  id: string | number;
  label: string;
  point: Point;
  // results: DisplayInfo[] | undefined;
  results: LocationResult[];
}

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [analysisLayers, setAnalysisLayers] = useState<AnalysisLayer[]>([]);
  const [modalOpen, setModalOpen] = useState<true | undefined>(true); // for boolean attribute on modal
  const [selectedElement, setSelectedElement] = useState<
    SelectedLocationElement | undefined
  >(undefined);

  const params = new URLSearchParams(window.location.search);
  const webmap = params.get("webmap")
    ? params.get("webmap")
    : analysis.webmapId;

  const appTitle = params.get("title")
    ? params.get("title")
    : application.heading;

  const appSubtitle = params.get("subtitle")
    ? params.get("subtitle")
    : application.description;

  const appIcon = params.get("icon") ? params.get("icon") : application.icon;

  const { credential, portalUser, error } = usePortalNU();

  const toggleModal = () => {
    setModalOpen(modalOpen ? undefined : true);
  };

  const submitCallback = (locations: Location[]) => {
    if (analysisLayers.length > 0 && locations.length > 0) {
      const results = locations.map(async (location) => {
        // const locationResults = await inspectLocation(location, analysisLayers);
        const locationResults = await inspectLocation(location, analysisLayers);
        // await Promise.all(locationResults);
        await Promise.all(locationResults);
        return { ...location, results: locationResults };
      });
      Promise.all(results).then((updatedLocations) => {
        setLocations(updatedLocations);
        toggleModal();
      });
    }
  };

  return (
    <>
      {!credential ? (
        ""
      ) : (
        <CalciteShell>
          <CalciteNavigation slot="header" id="nav">
            <CalciteNavigationLogo
              href=""
              icon={appIcon}
              slot="logo"
              heading={appTitle}
              description={appSubtitle}
            ></CalciteNavigationLogo>
            <CalciteNavigationUser
              slot="user"
              full-name={portalUser?.fullName}
              username={portalUser?.username}
            ></CalciteNavigationUser>
          </CalciteNavigation>
          <CalcitePanel>
            <div id="grid--container">
              <CalcitePanel heading="Locations" id="panel--locationinfos">
                <LocationList
                  locations={locations}
                  setSelectedElement={setSelectedElement}
                />
                <div slot="footer">
                  <em>Select a result to filter the map</em>
                </div>
              </CalcitePanel>
              <MapChartUI
                id="panel--map"
                webmapId={webmap}
                locations={locations}
                analysisLayers={analysisLayers}
                selectedLocation={selectedElement}
                setAnalysisLayers={setAnalysisLayers}
              />
            </div>
          </CalcitePanel>
          <UploadLocations updateLocations={submitCallback} open={modalOpen} />
        </CalciteShell>
      )}
    </>
  );
}

export default App;
