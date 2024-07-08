import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Point from "@arcgis/core/geometry/Point";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";

import { FeatureLayerRenderer } from "../shared/types";
import { Location } from "../App";
import { AnalysisLayer, FieldInfo } from "./getAnalysisLayerInfo";

import { evaluateVisualizationArcade } from "./evaluateArcade";

type AttributeInfo = {
  name: string;
  nameLabel: string;
  value: string;
  valueLabel: string;
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

const findFieldLabel = (field: string, fieldInfos: FieldInfo[]) => {
  return fieldInfos.filter((fieldInfo) => fieldInfo.name === field)[0].label;
};

const getAttributeName = (
  renderer: UniqueValueRenderer | ClassBreaksRenderer
): string => {
  if (renderer?.valueExpressionTitle) return renderer.valueExpressionTitle;
  else if (renderer.legendOptions?.title) return renderer.legendOptions.title;
  else return renderer.field;
};

/* Functions for getting attribute information from different renderers */

// Unique Values Renderer - very similar to Class Breask renderers when
// no class breaks have been defined
const applyUniqueValueRenderer = async (
  renderer: UniqueValueRenderer,
  graphic: Graphic,
  fields: FieldInfo[]
): Promise<AttributeInfo> => {
  const renderInfo = await renderer.getUniqueValueInfo(graphic);

  // Get the value. Making an assumption here data with no label. Because
  // the renderer is "unique values", show the value at this location in
  // the label
  const value = renderInfo?.label ? renderInfo.label : `Other`;
  const label = renderInfo?.label
    ? renderInfo.label
    : `Undefined (${graphic.attributes[renderer.field]})`;

  // Attribute name and label are based eitehr on the attribute expression
  // or the
  const attributeName = renderer.valueExpressionTitle
    ? renderer.valueExpressionTitle
    : getAttributeName(renderer);
  const attributeLabel = renderer.valueExpressionTitle
    ? renderer.valueExpressionTitle
    : findFieldLabel(attributeName, fields);

  return {
    name: attributeLabel,
    nameLabel: attributeLabel,
    value: value,
    valueLabel: label,
    order: 0,
  };
};

const applyClassBreaksClassifiedRenderer = async (
  renderer: ClassBreaksRenderer,
  graphic: Graphic,
  fields: FieldInfo[]
): Promise<AttributeInfo> => {
  const renderInfo = await renderer.getClassBreakInfo(graphic);
  // For class breaks legends values that are classified,
  // we always want the labels
  const value = renderInfo?.label
    ? renderInfo.label
    : `Other (${graphic.attributes[renderer.field]})`;

  // Attribute name and label are based eitehr on the attribute expression
  // or the
  const attributeName = renderer.valueExpressionTitle
    ? renderer.valueExpressionTitle
    : getAttributeName(renderer);
  const attributeLabel = renderer.valueExpressionTitle
    ? renderer.valueExpressionTitle
    : findFieldLabel(attributeName, fields);

  return {
    name: attributeName,
    nameLabel: attributeLabel,
    value: value,
    valueLabel: value,
    order: 0,
  };
};

const applyClassBreaksUnclassedRenderer = async (
  renderer: ClassBreaksRenderer,
  graphic: Graphic,
  fields: FieldInfo[],
  normalizationFieldInfo: FieldInfo | null
): Promise<AttributeInfo> => {
  // Get the value of the field - Here we will keep track of the source
  // name as well because we need to properly keep the name and label
  // clear in the case that the value is normalized
  let value = renderer.valueExpressionTitle
    ? await evaluateVisualizationArcade(renderer.valueExpression, graphic)
    : graphic.attributes[renderer.field];
  const attributeNameSrc = renderer.valueExpressionTitle
    ? renderer.valueExpressionTitle
    : getAttributeName(renderer);
  let attributeName = attributeNameSrc;
  let attributeLabel = renderer.valueExpressionTitle
    ? renderer.valueExpressionTitle
    : findFieldLabel(attributeName, fields);

  // If the value is normalized by a field, normalize the value
  // by the renderer's normalizationField
  if (renderer.normalizationType === "field") {
    if (normalizationFieldInfo) {
      value /= graphic.attributes[normalizationFieldInfo.name];
      attributeName = `${attributeNameSrc} / ${normalizationFieldInfo.label}`;
      attributeLabel = `${findFieldLabel(attributeNameSrc, fields)} / ${
        normalizationFieldInfo.label
      }`;
    }
  }

  // Return the attribute information
  return {
    name: attributeName,
    nameLabel: attributeLabel,
    value: value,
    valueLabel: new Intl.NumberFormat("en-US").format(value),
    order: 0,
  };
};

// For unique value and class break renderers, use the renderer
// to figure out what the value and label should be
const applyRenderer = async (
  analysisLayer: AnalysisLayer,
  graphic: Graphic
): Promise<LocationResult> => {
  // Initialize the output
  const layerResults: LocationResult = {
    sourceLayer: analysisLayer.title,
    graphic: graphic,
    attributes: [],
  };

  const renderer = analysisLayer.layer.renderer as FeatureLayerRenderer;

  // Depending on the render settings, use the renderer to get the value and
  // label to use.
  if (analysisLayer.symbolType === "unique-values") {
    layerResults.attributes.push(
      await applyUniqueValueRenderer(
        renderer as UniqueValueRenderer,
        graphic,
        analysisLayer.requiredFields
      )
    );
  } else if (analysisLayer.symbolType === "class-breaks-classified") {
    layerResults.attributes.push(
      await applyClassBreaksClassifiedRenderer(
        renderer as ClassBreaksRenderer,
        graphic,
        analysisLayer.requiredFields
      )
    );
  } else if (analysisLayer.symbolType === "class-breaks-unclassed") {
    layerResults.attributes.push(
      await applyClassBreaksUnclassedRenderer(
        renderer as ClassBreaksRenderer,
        graphic,
        analysisLayer.requiredFields,
        analysisLayer.normalizationField
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
    (requiredField) => (attributeSum += graphic.attributes[requiredField.name])
  );

  // Get the attribute array - for a pie, show the value & add % of total
  const attributes = analysisLayer.requiredFields.map((field, index) => {
    return {
      name: field.name,
      nameLabel: findFieldLabel(field.name, analysisLayer.requiredFields),
      value: graphic.attributes[field.name],
      valueLabel: `${graphic.attributes[field.name]} (${new Intl.NumberFormat(
        "en-US",
        {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(graphic.attributes[field.name] / attributeSum)})`,
      order: index,
    };
  });

  return {
    sourceLayer: analysisLayer.title,
    graphic: graphic,
    attributes: attributes,
  };
};

const simpleSymbolResult = (
  title: string,
  graphic: Graphic | undefined,
  where: "Inside" | "Outside"
) => {
  return {
    sourceLayer: title,
    graphic: graphic,
    attributes: [
      {
        name: "Spatial relationship",
        nameLabel: "Spatial Relationship",
        value: where as string,
        valueLabel: (where as string) + " boundary",
        order: 0,
      },
    ],
  };
};

// Note - If Raster support ever added, this will need to get reworked. Assumes
//        AnalysisLayers are FeatureLayers
export const inspectLocation = async (
  location: Location,
  analysisLayers: AnalysisLayer[]
): Promise<LocationResult[]> => {
  // For each layer in analysis layers
  const resultsPromises = analysisLayers.map(
    async (analysisLayer): Promise<LocationResult> => {
      // Construct and apply a query at the location's Point for the AnalysisLayer's
      // required fields and recieve the result as a Graphic
      const queryFields = analysisLayer.requiredFields.map(
        (field) => field.name
      );
      if (analysisLayer.normalizationField)
        queryFields.push(analysisLayer.normalizationField.name);
      const graphic = await makeQuery(
        location.point,
        queryFields,
        analysisLayer.layer
      );

      // If nothing came back, use a generic "No data". No graphic means that the
      // query returned no results. In this case, that there is no overlap
      if (!graphic) {
        let value: string;
        let name: string;
        if (analysisLayer.symbolType === "simple") {
          return simpleSymbolResult(analysisLayer.title, undefined, "Outside");
        } else {
          value = "No data";
          name = "No data";
        }
        // const value = analysisLayer.symbolType === "simple" ? "No" : "No data";
        return {
          sourceLayer: analysisLayer.title,
          graphic: undefined,
          attributes: [
            {
              name: name,
              nameLabel: name,
              value: value,
              valueLabel: value,
              order: 0,
            },
          ],
        };
      } else {
        // If a graphic came back, use the renderer for non-pie legends and
        // use the graphic otherwise.
        if (
          !(
            analysisLayer.symbolType === "pie-chart" ||
            analysisLayer.symbolType === "simple"
          )
        ) {
          return await applyRenderer(analysisLayer, graphic);
        } else if (analysisLayer.symbolType === "pie-chart") {
          return inspectPieChart(analysisLayer, graphic);
        } else if (analysisLayer.symbolType === "simple") {
          return simpleSymbolResult(analysisLayer.title, graphic, "Inside");
        } else {
          console.log(
            `unsupported layer or renderer for ${analysisLayer.title}`
          );
          return {
            sourceLayer: analysisLayer.title,
            graphic: undefined,
            attributes: [],
          };
        }
      }
    }
  );
  const results = await Promise.all(resultsPromises);
  return results;
};
