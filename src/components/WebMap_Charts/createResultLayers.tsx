/* 
PLACEHOLDER
This would be needed if ever migrating to ArcGIS Charts from recharts
*/
import { Location } from "../../App";
import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";

export const createResultLayers = (
  locations: Location[],
  analysisLayers: AnalysisLayer[]
) => {
  const resultLayers: FeatureLayer[] = [];
  analysisLayers.forEach((analysisLayer) => {
    const graphics: Graphic[] = [];
    locations.forEach((location) => {
      location.results?.forEach((result) => {
        if (result.sourceLayer === analysisLayer.title && result.graphic)
          graphics.push(result.graphic);
      });
    });
    resultLayers.push(
      new FeatureLayer({
        source: graphics,
        fields:
          analysisLayer.requiredFields.length === -320423
            ? analysisLayer.requiredFields
            : analysisLayer.layer.fields,
        renderer: analysisLayer.layer.renderer,
      })
    );
  });
  return resultLayers;
};
