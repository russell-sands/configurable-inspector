import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { FeatureLayerRenderer, SymbolType } from "../shared/types";

export interface AnalysisLayer {
  title: string; // consider removing this and using layer.title instead?
  layer: FeatureLayer;
  id: number; // Using drawing order
  symbolType: SymbolType;
  requiredFields: string[];
  isExpressionBased: boolean;
}

export const checkSymbolType = (renderer: FeatureLayerRenderer) => {
  if (renderer.type === "simple") {
    return "simple";
  } else if (renderer.type === "class-breaks") {
    // Class Breaks - Either unclassed or classed based on whether or
    // not there any classBreakinfos
    if (renderer.classBreakInfos[0]?.label) return "class-breaks-classified";
    else return "class-breaks-unclassed";
  } else if (renderer.type === "unique-value") {
    return "unique-values";
  } else if (renderer.type === "pie-chart") {
    return "pie-chart";
  } else {
    return "unknown";
  }
};

const checkIfExpressionBased = (renderer: FeatureLayerRenderer): boolean => {
  if (renderer.type === "class-breaks" || renderer.type === "unique-value") {
    return renderer.valueExpression ? true : false;
  } else {
    return false;
  }
};

export const getRequiredFields = (renderer: FeatureLayerRenderer): string[] => {
  const requiredFields = [];
  if (renderer.type === "pie-chart") {
    renderer.attributes.forEach((attribute) =>
      requiredFields.push(attribute.field)
    );
  } else if (renderer.type === "class-breaks") {
    // For class breaks, need to watch for normalization fields
    requiredFields.push(renderer.field);
    if (renderer.normalizationType == "field")
      requiredFields.push(renderer.normalizationField);
  } else if (renderer.type === "unique-value") {
    // For unique values, need to watch for multiple fields
    requiredFields.push(renderer.field);
    if (renderer.field2) requiredFields.push(renderer.field2);
    if (renderer.field3) requiredFields.push(renderer.field3);
  }
  return requiredFields;
};

export const getAnalysisLayerInfo = (
  layer: FeatureLayer,
  index: number
): AnalysisLayer => {
  // Check if the layer has charts
  const hasCharts = layer?.charts && layer.charts.length > 0;

  // Check if the renderer is expression based
  const isExpressionBased = checkIfExpressionBased(
    layer.renderer as FeatureLayerRenderer
  );

  // Get the required fields. When inspecting a location, an empty []
  // is equivilent to "all fields"
  const requiredFields: string[] =
    hasCharts || isExpressionBased
      ? []
      : getRequiredFields(layer.renderer as FeatureLayerRenderer);
  console.log(layer.title, requiredFields, isExpressionBased);

  return {
    title: layer.title,
    layer: layer,
    id: index,
    symbolType: checkSymbolType(layer.renderer as FeatureLayerRenderer),
    requiredFields: requiredFields,
    isExpressionBased: isExpressionBased,
  };
};
