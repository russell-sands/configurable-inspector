import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { FeatureLayerRenderer, SymbolType } from "../shared/types";

export type FieldInfo = {
  name: string;
  label: string;
};

export interface AnalysisLayer {
  title: string; // consider removing this and using layer.title instead?
  layer: FeatureLayer;
  id: number; // Using drawing order
  symbolType: SymbolType;
  requiredFields: FieldInfo[];
  normalizationField: FieldInfo | null;
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

// If possible, get a limited set of fields
export const getRequiredFields = (renderer: FeatureLayerRenderer): string[] => {
  const requiredFields = [];
  if (renderer.type === "pie-chart") {
    renderer.attributes.forEach((attribute) =>
      requiredFields.push(attribute.field)
    );
  } else if (renderer.type === "class-breaks") {
    // For class breaks, need to watch for normalization fields
    requiredFields.push(renderer.field);
  } else if (renderer.type === "unique-value") {
    // For unique values, need to watch for multiple fields
    requiredFields.push(renderer.field);
    if (renderer.field2) requiredFields.push(renderer.field2);
    if (renderer.field3) requiredFields.push(renderer.field3);
  } else if (renderer.type === "simple") {
    // For simple renderers, take the first field so that we can make a
    // small query to the endpoint.
    requiredFields.push("OBJECTID");
  }
  return requiredFields;
};

// For renerers or charts that I haven't figured out yet, get all of the fields
const getAllFields = (layer: FeatureLayer): string[] => {
  return layer.fields.map((field) => field.name);
};

const getFieldLabel = (fieldName: string, layer: FeatureLayer) => {
  return layer.getField(fieldName).alias
    ? layer.getField(fieldName).alias
    : fieldName;
};

export const getAnalysisLayerInfo = (
  layer: FeatureLayer,
  index: number
): AnalysisLayer => {
  const renderer = layer.renderer as FeatureLayerRenderer;

  // Check if the layer has charts
  const hasCharts = layer?.charts && layer.charts.length > 0;

  // Check if the renderer is expression based
  const isExpressionBased = checkIfExpressionBased(renderer);

  let normalizationField: FieldInfo | null = null;
  if (renderer.type === "class-breaks" && renderer.normalizationField) {
    normalizationField = {
      name: renderer.normalizationField,
      label: getFieldLabel(renderer.normalizationField, layer),
    };
  }

  // Get the required fields. When inspecting a location, an empty []
  // is equivilent to "all fields"
  const requiredFieldNames: string[] =
    hasCharts || isExpressionBased
      ? getAllFields(layer)
      : getRequiredFields(renderer);

  const requiredFields = requiredFieldNames.map((fieldName) => {
    return {
      name: fieldName,
      label: getFieldLabel(fieldName, layer),
    };
  });
  return {
    title: layer.title,
    layer: layer,
    id: index,
    symbolType: checkSymbolType(renderer),
    requiredFields: requiredFields,
    normalizationField: normalizationField,
    isExpressionBased: isExpressionBased,
  };
};
