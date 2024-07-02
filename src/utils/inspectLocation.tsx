import Graphic from "@arcgis/core/Graphic";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import UniqueValueInfo from "@arcgis/core/renderers/support/UniqueValueInfo.js";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
import ClassBreakInfo from "@arcgis/core/renderers/support/ClassBreakInfo.js";
import Renderer from "@arcgis/core/renderers/Renderer";

import { AnalysisLayer } from "./getAnalysisLayerInfo";
import { Location } from "../App";
import PieChartRenderer from "@arcgis/core/renderers/PieChartRenderer";

interface UnclassedInfo {
  label: string;
}

type FeatureLayerRenderer = ClassBreaksRenderer | UniqueValueRenderer;

export type RenderResult = UniqueValueInfo | ClassBreakInfo | UnclassedInfo;

export interface DisplayInfo {
  title: string;
  subtitle: string | undefined;
  value: string;
  graphic: Graphic | undefined; // PLACEHOLDER in the case that migrate to ArcGIS Charts in the future
}

const createEmptyDisplayInfo = (): DisplayInfo => ({
  title: "",
  subtitle: undefined,
  value: "",
  graphic: undefined,
});

const getSubtitle = (renderer: Renderer): string => {
  let result = "";
  if (renderer.type === "unique-value" || renderer.type === "class-breaks") {
    const featureRenderer = renderer as FeatureLayerRenderer;
    result =
      featureRenderer?.valueExpressionTitle ||
      featureRenderer.legendOptions?.title ||
      featureRenderer.field;
  }
  return result;
};

const getValue = async (
  renderer: Renderer,
  graphic: Graphic
): Promise<string> => {
  let result = "";
  if (renderer.type === "unique-value") {
    const uniqueValueRenderer = renderer as UniqueValueRenderer;
    const renderInfo = await uniqueValueRenderer.getUniqueValueInfo(graphic);
    // If there is a label, use that as the result. Otherwise for a unique
    // value renderer assume that this is the "Other" category, and show the text
    // "Other" + the value
    result = renderInfo?.label
      ? renderInfo.label
      : `Other (${graphic.attributes[uniqueValueRenderer.field]})`;
  } else if (renderer.type === "class-breaks") {
    const classBreaksRenderer = renderer as ClassBreaksRenderer;
    const renderInfo = await classBreaksRenderer.getClassBreakInfo(graphic);

    // Need to do some checking on what comes back. Unclassed values also come through
    // as "class-breaks". Only distinction seems to be that unclassed values don't get
    // a label but classed values always do
    result = renderInfo?.label
      ? renderInfo.label
      : new Intl.NumberFormat("en-US").format(
          graphic.attributes[classBreaksRenderer.field]
        );
  } else if (renderer.type === "pie-chart") {
    const pieChartRenderer = renderer as PieChartRenderer;
    pieChartRenderer.attributes.map((attribute) => {
      result += graphic.attributes[attribute.field] + ",";
    });
  } else {
    console.log("unknown renderer", renderer);
  }
  return result;
};

// Inspect each location against the layers in the analysis.
export const inspectLocation = async (
  location: Location,
  analysisLayers: AnalysisLayer[]
): Promise<DisplayInfo[]> => {
  const results = analysisLayers.map(async (analysisLayer) => {
    // Create a query against each layer
    const query = analysisLayer.layer.createQuery();
    query.geometry = location.point;
    query.spatialRelationship = "intersects";
    if (analysisLayer.requiredFields.length > 0) {
      query.outFields = analysisLayer.requiredFields;
    }
    query.returnGeometry = false;

    // Execute the query and wait for result
    const queryResult = await analysisLayer.layer.queryFeatures(query);

    // console.log(analysisLayer.layer.title, analysisLayer.layer);

    // We will only take the first found result - TODO deal wtih stacked
    const result = createEmptyDisplayInfo();
    result.title = analysisLayer.layer.title;
    result.subtitle = getSubtitle(analysisLayer.layer.renderer);
    result.value =
      queryResult.features.length > 0
        ? await getValue(analysisLayer.layer.renderer, queryResult.features[0])
        : "No data";
    result.graphic = queryResult.features[0];
    return result;
  });
  const result = await Promise.all(results);
  return result;
};
