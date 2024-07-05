import "@esri/calcite-components/dist/components/calcite-card-group";
import { CalciteCardGroup } from "@esri/calcite-components-react";

import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";
import { LayerCard } from "./LayerCard";
import { Location } from "../../App";
import { ChartDefinitions, getChartDefinitions } from "./getChartDefinitions";

import "./layerList.css";

// WOULD BE USED if using ArcGIS Charts
// import { createResultLayers } from "../utils/createResultLayers";

interface LocationListProps {
  analysisLayers: AnalysisLayer[];
  locations: Location[];
}

export const LayerList = ({ analysisLayers, locations }: LocationListProps) => {
  // TODO - NOT CURRENTLY DOING THIS - Creat a Feature Layer with the results
  // for each analysis layer. This would be useful if switching to ArcGIS Charts,
  // but that doesn't solve the actual hard problem of working with the renderer
  // const resultLayers = createResultLayers(locations, layers);

  let chartDefinitions: ChartDefinitions;
  if (locations.length > 0) {
    chartDefinitions = getChartDefinitions(locations, analysisLayers);
  } else {
    // This catches a VS error on not always reassigining chartDefinitions
    chartDefinitions = {};
  }

  return (
    <div className="list--layers--container">
      <CalciteCardGroup label="Layer List" className="list--layers">
        {(() => {
          if (locations.length > 0) {
            return analysisLayers.map((analysisLayer) => (
              <LayerCard
                key={analysisLayer.id}
                title={analysisLayer.title}
                definition={chartDefinitions[analysisLayer.title]}
                symbolType={analysisLayer.symbolType}
              />
            ));
          } else return <></>;
        })()}
      </CalciteCardGroup>
    </div>
  );
};
