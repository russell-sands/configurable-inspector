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

  // Each Renderer has unique elements that we may need to process
  // I could reduce the repetition here but I think it is more clear
  // to have the repeats per type. Classified vs unclassified are very
  // similar but I think the separation helps / reflects more how they
  // are defined in the source materials (web map)

  if (symbolType === "unique-values") {
    const uniqueValueRenderer = renderer as UniqueValueRenderer;
    const renderInfo = await uniqueValueRenderer.getUniqueValueInfo(graphic);
    // If there is a label, use that as the result. Otherwise for a unique
    // value renderer assume that this is the "Other" category, and show the text
    // "Other" + the value
    if (graphic?.attributes) {
      const value = renderInfo?.label
        ? renderInfo.label
        : `Other (${graphic.attributes[uniqueValueRenderer.field]})`;
      console.log(value);
      layerResults.attributes.push({
        name: getAttributeName(uniqueValueRenderer),
        value: value,
        order: 0,
        label: value,
      });
    }
  } else if (symbolType === "class-breaks-classified") {
    const classBreaksRenderer = renderer as ClassBreaksRenderer;
    const renderInfo = await classBreaksRenderer.getClassBreakInfo(graphic);
    // For class breaks legends values that are classified,
    // we always want the labels
    const value = renderInfo?.label
      ? renderInfo.label
      : `Other (${graphic.attributes[classBreaksRenderer.field]})`;
    layerResults.attributes.push({
      name: getAttributeName(classBreaksRenderer),
      value: value,
      order: 0,
      label: value,
    });
  } else if (symbolType === "class-breaks-unclassed") {
    // Unclassed class-breaks are very similar initially...
    const classBreaksRenderer = renderer as ClassBreaksRenderer;
    // However we need to account for whether or not the data are normalized and
    // then adjust the value accordingly.

    // Using switch in case need to add other normaliztion types in the future
    const rawValue = graphic.attributes[classBreaksRenderer.field];
    switch (classBreaksRenderer.normalizationType) {
      case null:
        // If normalizationType is null, return the field result and ge the name
        // as usual
        layerResults.attributes.push({
          name: getAttributeName(classBreaksRenderer),
          value: new Intl.NumberFormat("en-US").format(rawValue),
          order: 0,
          label: new Intl.NumberFormat("en-US").format(rawValue),
        });
        break;
      case "field":
        // If normalization type is field, reflect that in the attribute name, then
        // return the normalized value.
        layerResults.attributes.push({
          name: `${classBreaksRenderer.field} / ${classBreaksRenderer.normalizationField}`,
          value: new Intl.NumberFormat("en-US").format(
            rawValue /
              graphic.attributes[classBreaksRenderer.normalizationField]
          ),
          order: 0,
          label: new Intl.NumberFormat("en-US").format(
            rawValue /
              graphic.attributes[classBreaksRenderer.normalizationField]
          ),
        });
        break;
    }
  }
  return layerResults;
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
        // TODO PULL THIS INTO FUNCTION
        // For Pie charts, all we need are the required fields and graphic.
        // For the label, return the % of the total
        let attributeSum = 0;
        analysisLayer.requiredFields.forEach(
          (field) => (attributeSum += graphic.attributes[field])
        );
        return {
          sourceLayer: analysisLayer.title,
          graphic: graphic,
          attributes: analysisLayer.requiredFields.map((field, index) => {
            return {
              name: field,
              value: new Intl.NumberFormat("en-US").format(
                graphic.attributes[field]
              ),
              order: index,
              label: `${graphic.attributes[field]} (${new Intl.NumberFormat(
                "en-US",
                {
                  style: "percent",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              ).format(graphic.attributes[field] / attributeSum)})`,
            };
          }),
        };
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
              value: "No Data",
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
  console.log(results);
  return results;
};
