import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import { AnySupportedRenderer, SymbolType } from "../CommonTypes";

export interface AnalysisLayer {
  title: string; // consider removing this and using layer.title instead?
  layer: FeatureLayer;
  id: number; // Using drawing order
  symbolType: SymbolType;
  requiredFields: string[];
  isExpressionBased: boolean;
}

export const getAnalysisLayerInfo = (
  layer: FeatureLayer,
  index: number
): AnalysisLayer => {
  let symbolType: SymbolType = "unknown";
  const requiredFields: string[] = [];
  // Get a list of the fields we will need
  const featureRenderer = layer.renderer as AnySupportedRenderer;

  // Need to know if expression based. If it is, we'll end up requesting all fields rather than
  // trying to determine what fields to use
  const isExpressionBased = featureRenderer?.valueExpression ? true : false;
  const hasCharts = layer?.charts && layer.charts.length > 0;

  // If the renderer is not based on an expression, determine what fields we need to request
  if (!isExpressionBased && !hasCharts) {
    // Get the renderer field
    if (featureRenderer.field) requiredFields.push(featureRenderer.field);
    if (layer.renderer.type === "class-breaks") {
      // class-breaks renderers may be normalized - get the normalization field if it is there
      const r = featureRenderer as ClassBreaksRenderer;
      // If the data are field-normalized, add the normalization field the required fields
      if (r.normalizationType === "field")
        requiredFields.push(r.normalizationField);
    } else if (layer.renderer.type === "unique-value") {
      // A unique value renderer could have up to three fields - get those as well
      const r = featureRenderer as UniqueValueRenderer;
      if (r.field2) requiredFields.push(r.field2);
      if (r.field3) requiredFields.push(r.field3);
    }
  }

  // Set the symbol type - prevents having to reinspect this later
  // Get the renderer field
  if (layer.renderer.type === "class-breaks") {
    // class-breaks renderers may be normalized - get the normalization field if it is there
    const r = featureRenderer as ClassBreaksRenderer;
    // Determine if classe breaks are defined or not and then set Symbol Type
    if (r.classBreakInfos[0]?.label) symbolType = "class-breaks-classified";
    else symbolType = "class-breaks-unclassed";
    // If the data are field-normalized, add the normalization field the required fields
  } else if (layer.renderer.type === "unique-value") {
    // Set the symbol type to unique-value
    symbolType = "unique-values";
  }

  return {
    title: layer.title,
    layer: layer,
    id: index,
    symbolType: symbolType,
    requiredFields: requiredFields,
    isExpressionBased: isExpressionBased,
  };
};
