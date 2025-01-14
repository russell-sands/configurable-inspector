import * as d3 from "d3";

import { Location } from "../../App";
import { BinnedDataElement, IndexedNumber } from "../../shared/types";
import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";

export type LayerResults = {
  [index: string]: IndexedNumber;
};

export type ChartDataElements = {
  [index: string]: BinnedDataElement[];
};

const hasKey = (obj: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const handleUniqueAndClassed = (
  locations: Location[],
  layerTitle: string
): IndexedNumber => {
  const layerResult: IndexedNumber = {};
  // For each location
  locations.forEach((location) => {
    // If that location has results
    if (location?.results) {
      // For each result (layer) in the results
      location.results.forEach((result) => {
        if (result.sourceLayer === layerTitle)
          result.attributes.forEach((attribute) => {
            if (hasKey(layerResult, attribute.value as string)) {
              const updatedValue = layerResult[attribute.value] + 1;
              layerResult[attribute.value] = updatedValue;
            } else {
              // If there is no summary value for the category yet, set it to 1
              layerResult[attribute.value] = 1;
            }
          });
      });
    }
  });
  return layerResult;
};

const handleUnclased = (
  locations: Location[],
  layerTitle: string
): BinnedDataElement[] => {
  const unclassedResults: number[] = [];
  locations.forEach((location) =>
    location.results?.forEach((result) => {
      if (result.sourceLayer === layerTitle) {
        // US FORMATTED NUMBERS ONLY
        unclassedResults.push(Number(result.attributes[0].value));
      }
    })
  );
  const bins = d3.bin();
  bins.thresholds(d3.thresholdScott);
  // Get the binned data for the layer results
  return bins(unclassedResults).map((bin) => {
    return { name: `${bin.x0}-${bin.x1}`, value: bin.length };
  });
};

const handlePies = (
  locations: Location[],
  layerTitle: string
): IndexedNumber => {
  const layerResult: IndexedNumber = {};
  locations.forEach((location) => {
    location.results.forEach((result) => {
      if (result.sourceLayer === layerTitle) {
        result.attributes.forEach((attribute) => {
          if (hasKey(layerResult, attribute.name)) {
            const updatedValue =
              layerResult[attribute.name] + Number(attribute.value);
            layerResult[attribute.name] = updatedValue;
          } else {
            // If there is no summary value for the category yet, set it to 1
            layerResult[attribute.name] = Number(attribute.value);
          }
        });
      }
    });
  });
  return layerResult;
};

const handleSimple = (
  locations: Location[],
  layerTitle: string
): BinnedDataElement[] => {
  // First, get the layer level results by flattening out all of the location
  // level results to be <"Inside boundary" | "Outside boundary">[]
  const layerResults = locations
    .map(
      (location) =>
        location.results.filter(
          (result) => result.sourceLayer === layerTitle
        )[0].attributes
    )
    .flat();

  // Get the aggregated results by filtering on each of the two possible
  // values and then checking the length of the filtered result.
  const aggregatedResults = [
    {
      name: "Inside boundary",
      value: layerResults.filter(
        (attribute) => attribute.valueLabel === "Inside boundary"
      ).length,
    },
    {
      name: "Outside boundary",
      value: layerResults.filter(
        (attribute) => attribute.valueLabel === "Outside boundary"
      ).length,
    },
  ];

  // Return the aggregated results
  return aggregatedResults;
};

export const getChartData = (
  locations: Location[],
  analysisLayers: AnalysisLayer[]
): ChartDataElements => {
  const chartDataElements: ChartDataElements = {};
  analysisLayers.forEach((analysisLayer) => {
    if (
      analysisLayer.symbolType === "unique-values" ||
      analysisLayer.symbolType === "class-breaks-classified"
    ) {
      const layerResult = handleUniqueAndClassed(
        locations,
        analysisLayer.title
      );
      chartDataElements[analysisLayer.title] = Object.keys(layerResult).map(
        (key) => {
          return { name: key, value: layerResult[key] };
        }
      );
    } else if (analysisLayer.symbolType === "class-breaks-unclassed") {
      chartDataElements[analysisLayer.title] = handleUnclased(
        locations,
        analysisLayer.title
      );
    } else if (analysisLayer.symbolType === "pie-chart") {
      const layerResult = handlePies(locations, analysisLayer.title);
      chartDataElements[analysisLayer.title] = Object.keys(layerResult).map(
        (key) => {
          return { name: key, value: layerResult[key] };
        }
      );
    } else if (analysisLayer.symbolType === "simple") {
      const chartElements = handleSimple(locations, analysisLayer.title);
      chartDataElements[analysisLayer.title] = chartElements;
    } else {
      console.log(analysisLayer);
    }
  });
  return chartDataElements;
};
