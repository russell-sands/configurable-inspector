import Graphic from "@arcgis/core/Graphic";
import { Location } from "../App";
import { AnalysisLayer } from "./getAnalysisLayerInfo";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Point from "@arcgis/core/geometry/Point";
import { SymbolType } from "../shared/types";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import Renderer from "@arcgis/core/renderers/Renderer";

type AttributeInfo = {
  name: string;
  value: string;
  label: string;
  order: number;
};

export type LocationResult = {
  sourceLayer: string;
  graphic: Graphic | undefined;
  attributes: AttributeInfo[];
};

const makeQuery = async (
  locationPoint: Point,
  requiredFields: string[],
  featureLayer: FeatureLayer
): Promise<Graphic> => {
  // Create a query against each layer
  const query = featureLayer.createQuery();
  query.geometry = locationPoint;
  query.spatialRelationship = "intersects";
  if (requiredFields.length > 0) {
    query.outFields = requiredFields;
  }
  query.returnGeometry = false;

  // Execute the query and wait for result
  const queryResult = await featureLayer.queryFeatures(query);
  return queryResult.features[0];
};

const getAttributeName = (
  renderer: UniqueValueRenderer | ClassBreaksRenderer
): string => {
  const result =
    renderer?.valueExpressionTitle ||
    renderer.legendOptions?.title ||
    renderer.field;
  return result;
};

/* Functions for getting attribute information from different renderers */

// Unique Values Renderer - very similar to Class Breask renderers when
// no class breaks have been defined
const applyUniqueValueRenderer = async (
  renderer: UniqueValueRenderer,
  graphic: Graphic
): Promise<AttributeInfo> => {
  const renderInfo = await renderer.getUniqueValueInfo(graphic);

  // Get the value. Making an assumption here data with no label. Because
  // the renderer is "unique values", show the value at this location in
  // the label
  const value = renderInfo?.label ? renderInfo.label : `Other`;
  const label = renderInfo?.label
    ? renderInfo.label
    : `Undefined (${graphic.attributes[renderer.field]})`;

  // Use both the result & label:
  // - At the location level, show the "unique value" that
  //   a feature has, ven though it is outside of the renderer's
  //   definition
  // - In the layer level charts, lump them all together
  return {
    name: getAttributeName(renderer),
    value: value,
    order: 0,
    label: label,
  };
};

const applyClassBreaksClassifiedRenderer = async (
  renderer: ClassBreaksRenderer,
  graphic: Graphic
): Promise<AttributeInfo> => {
  const renderInfo = await renderer.getClassBreakInfo(graphic);
  // For class breaks legends values that are classified,
  // we always want the labels
  const value = renderInfo?.label
    ? renderInfo.label
    : `Other (${graphic.attributes[renderer.field]})`;
  return {
    name: getAttributeName(renderer),
    value: value,
    order: 0,
    label: value,
  };
};

const applyClassBreaksUnclassedRenderer = async (
  renderer: ClassBreaksRenderer,
  graphic: Graphic
): Promise<AttributeInfo> => {
  // Get the value of the field
  let value = graphic.attributes[renderer.field];

  // If the value is normalized by a field, normalize the value
  // by the renderer's normalizationField
  if (renderer.normalizationField === "field") {
    value /= graphic.attributes[renderer.normalizationField];
  }

  // Retur the attribute information
  return {
    name: getAttributeName(renderer),
    value: new Intl.NumberFormat("en-US").format(value),
    order: 0,
    label: new Intl.NumberFormat("en-US").format(value),
  };
};

// For unique value and class break renderers, use the renderer
// to figure out what the value and label should be
const applyRenderer = async (
  sourceLayer: string,
  symbolType: SymbolType,
  graphic: Graphic,
  renderer: Renderer
): Promise<LocationResult> => {
  // Initialize the output
  const layerResults: LocationResult = {
    sourceLayer: sourceLayer,
    graphic: graphic,
    attributes: [],
  };

  // Depending on the render settings, use the renderer to get the value and
  // label to use.
  if (symbolType === "unique-values") {
    layerResults.attributes.push(
      await applyUniqueValueRenderer(renderer as UniqueValueRenderer, graphic)
    );
  } else if (symbolType === "class-breaks-classified") {
    layerResults.attributes.push(
      await applyClassBreaksClassifiedRenderer(
        renderer as ClassBreaksRenderer,
        graphic
      )
    );
  } else if (symbolType === "class-breaks-unclassed") {
    layerResults.attributes.push(
      await applyClassBreaksUnclassedRenderer(
        renderer as ClassBreaksRenderer,
        graphic
      )
    );
  }
  return layerResults;
};

// For pie chart renderers, everything necessary is in the analysisLayer info
// and the graphic.
const inspectPieChart = (
  analysisLayer: AnalysisLayer,
  graphic: Graphic
): LocationResult => {
  // Get the total value
  let attributeSum = 0;
  analysisLayer.requiredFields.forEach(
    (requiredField) => (attributeSum += graphic.attributes[requiredField])
  );

  // Get the attribute array
  const attributes = analysisLayer.requiredFields.map((field, index) => {
    return {
      name: field,
      value: new Intl.NumberFormat("en-US").format(graphic.attributes[field]),
      order: index,
      label: `${graphic.attributes[field]} (${new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(graphic.attributes[field] / attributeSum)})`,
    };
  });

  return {
    sourceLayer: analysisLayer.title,
    graphic: graphic,
    attributes: attributes,
  };
};

export const inspectLocation = async (
  location: Location,
  analysisLayers: AnalysisLayer[]
): Promise<LocationResult[]> => {
  const resultsPromises = analysisLayers.map(async (analysisLayer) => {
    const graphic = await makeQuery(
      location.point,
      analysisLayer.requiredFields,
      analysisLayer.layer
    );
    if (location.label === "The Gap No. 39, Saskatchewan") {
      console.log(graphic);
    }
    if (graphic) {
      // For non-pie chart types, use the renderer
      if (!(analysisLayer.symbolType === "pie-chart")) {
        return await applyRenderer(
          analysisLayer.title,
          analysisLayer.symbolType,
          graphic,
          analysisLayer.layer.renderer
        );
      } else if (analysisLayer.symbolType === "pie-chart") {
        return inspectPieChart(analysisLayer, graphic);
      }
    } else {
      if (analysisLayer.layer.type === "feature") {
        return {
          sourceLayer: analysisLayer.title,
          graphic: undefined,
          attributes: [
            {
              name: getAttributeName(
                analysisLayer.layer.renderer as
                  | UniqueValueRenderer
                  | ClassBreaksRenderer
              ),
              value: "No data",
              label: "No data",
              order: 0,
            },
          ],
        };
      } else {
        console.log("No data recieved for non-feature layer type layer");
        return {
          sourceLayer: analysisLayer.title,
          graphic: undefined,
          attributes: [],
        };
      }
    }
  });
  const results = await Promise.all(resultsPromises);
  return results;
};
