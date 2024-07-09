import { Location } from "../../App";
import { ElementDefinition } from "../../shared/types";
import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";
import { getChartData } from "./getChartData";
import { getChartStyles } from "./getChartStyles";

export type ChartDefinitions = {
  [index: string]: ElementDefinition[];
};

export const getChartDefinitions = (
  locations: Location[],
  analysisLayers: AnalysisLayer[]
): ChartDefinitions => {
  const chartDefinitions: ChartDefinitions = {};
  // First, get the chart data and style data for all of the layers
  const chartData = getChartData(locations, analysisLayers);
  const styleData = getChartStyles(chartData, analysisLayers);

  // Then for each layer, using the sorted values (in style data) as a key,
  // zip up everything into one object
  analysisLayers.forEach((analysisLayer) => {
    const layerData = chartData[analysisLayer.title];
    const layerStyle = styleData[analysisLayer.title];

    chartDefinitions[analysisLayer.title] = layerStyle.map(
      (style): ElementDefinition => {
        let value!: number;
        const checkValue = layerData.filter(
          (element) => element.name === style.label
        )[0]?.value;
        // Since "No data" is always being added as a style option, it always
        // needs a value here
        if (checkValue !== null) value = checkValue;
        else if (style.label === "No data") value = 0;
        return {
          label: style.label,
          fill: style.fill,
          order: style.order,
          value: value,
        };
      }
    );
  });
  return chartDefinitions;
};
