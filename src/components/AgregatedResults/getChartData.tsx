import * as d3 from "d3";

import { Location } from "../../App";
import { BinnedDataElement, IndexedNumber } from "../../CommonTypes";
import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";

// export type BinnedData = {
//   [index: string]: number;
// };

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
        if (result.title === layerTitle)
          if (hasKey(layerResult, result.value)) {
            const updatedValue = layerResult[result.value] + 1;
            layerResult[result.value] = updatedValue;
          } else {
            // If there is no summary value for the category yet, set it to 1
            layerResult[result.value] = 1;
          }
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
      if (result.title === layerTitle) {
        // US FORMATTED NUMBERS ONLY
        unclassedResults.push(Number(result.value.replace(",", "")));
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
    } else {
      // RN its because you never actually implemented histograms
      console.log(analysisLayer);
    }
  });
  return chartDataElements;
};
