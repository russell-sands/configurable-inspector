import { useState } from "react";

import "@esri/calcite-components/dist/components/calcite-panel";
import { CalcitePanel } from "@esri/calcite-components-react";

import { Location } from "../../App";
import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";
import { MapChartToggle } from "./MapChartToggle";
import { MapContainer } from "../WebMap_Map/MapContainer";
import { LayerList } from "../AgregatedResults/LayerList";
import { ChartCarousel } from "../WebMap_Charts/ChartCarousel";
import { SelectedLocationElement } from "../../shared/types";

interface MapChartUIProps {
  id: string;
  webmapId: string | null;
  locations: Location[];
  analysisLayers: AnalysisLayer[];
  selectedLocation: SelectedLocationElement | undefined;
  setAnalysisLayers: (analysisLayers: AnalysisLayer[]) => void;
}

export type ViewMode = "map" | "summary" | "charts";

const getHeading = (viewMode: string) => {
  if (viewMode === "map") return "Map Results";
  else if (viewMode === "summary") return "Layer Summary Charts";
  else if (viewMode === "charts") return "Comparison Charts";
  else return "Oops! Update getHeading() in MapChartUI.tsx";
};

export const MapChartUI = ({
  id,
  webmapId,
  locations,
  analysisLayers,
  selectedLocation,
  setAnalysisLayers,
}: MapChartUIProps) => {
  // View mode - toggle between showing the map and charts (if any)
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  let hasComparisonCharts: true | undefined = undefined;

  const chartLayers = analysisLayers.filter(
    (layer) => layer.layer?.charts && layer.layer.charts.length > 0
  );
  if (chartLayers.length) hasComparisonCharts = true;

  // Set the Heading based on the current view mode
  const heading = getHeading(viewMode);

  return (
    <CalcitePanel heading={heading} id={id}>
      <MapChartToggle
        hasComparisonCharts={hasComparisonCharts}
        viewMode={viewMode}
        setViewMode={setViewMode}
      ></MapChartToggle>
      <div
        className="arcgis--map"
        hidden={viewMode === "map" ? undefined : true}
      >
        <MapContainer
          webmapId={webmapId as string} // webmap will always be populated - undf is ruled out if we are here
          locations={locations}
          selectedLocation={selectedLocation}
          setAnalysisLayers={setAnalysisLayers}
        />
      </div>

      <div
        hidden={viewMode === "summary" ? undefined : true}
        style={{ height: "100%" }}
      >
        <LayerList analysisLayers={analysisLayers} locations={locations} />
      </div>
      {(() => {
        if (chartLayers.length > 0 && locations.length > 0) {
          console.log(viewMode === "charts" ? undefined : true);
          return (
            <div
              style={{
                height: "100%",
                display: viewMode === "charts" ? undefined : "none",
              }}
            >
              <ChartCarousel locations={locations} chartLayers={chartLayers} />
            </div>
          );
        }
      })()}
    </CalcitePanel>
  );
};
