import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";
import { ChartDataElements } from "./getChartData";

// interface ChartStyles {
//   [index: string]: IndexedString;
// }

export type StyleDefinition = {
  label: string;
  fill: string;
  order: number;
};

export type ChartStyles = {
  [index: string]: StyleDefinition[];
};

const handleUniqueValueRenderer = (
  chartLabels: string[],
  renderer: UniqueValueRenderer
): StyleDefinition[] => {
  //   const chartStyles: IndexedString = {};
  // Unique value renderers can be part of groups. For now, we're ignoring group labels
  // As part of this.
  const chartStyles: StyleDefinition[] = [];
  let order = 0;
  renderer.uniqueValueGroups.forEach((group) => {
    group.classes.forEach((valueClass) => {
      if (chartLabels.includes(valueClass.label)) {
        chartStyles.push({
          label: valueClass.label,
          fill: `rgba(${valueClass.symbol.color.r}, ${valueClass.symbol.color.g}, ${valueClass.symbol.color.b}, ${valueClass.symbol.color.a})`,
          order: order,
        });
        order += 1;
      }
    });
  });
  return chartStyles.sort((a, b) => a.order - b.order);
};

const handleClassifiedDataRenderer = (
  chartLabels: string[],
  renderer: ClassBreaksRenderer
): StyleDefinition[] => {
  //   const chartStyles: IndexedString = {};
  const chartStyles: StyleDefinition[] = [];
  let order = 0;
  renderer.classBreakInfos.forEach((cbInfo) => {
    if (chartLabels.includes(cbInfo.label)) {
      chartStyles.push({
        label: cbInfo.label,
        fill: `rgba(${cbInfo.symbol.color.r}, ${cbInfo.symbol.color.g}, ${cbInfo.symbol.color.b}, ${cbInfo.symbol.color.a})`,
        order: order,
      });
      order += 1;
    }
  });
  return chartStyles.sort((a, b) => a.order - b.order);
};

const handleUnclassedHistogram = (chartLabels: string[]): StyleDefinition[] => {
  return chartLabels.map((chartLabel, index) => {
    return { label: chartLabel, fill: "darkgray", order: index };
  });
};

export const getChartStyles = (
  chartDataElements: ChartDataElements,
  analysisLayers: AnalysisLayer[]
): ChartStyles => {
  const chartStyles: ChartStyles = {};
  analysisLayers.forEach((analysisLayer) => {
    // let chartStyle: StyleDefinition[] = [];
    const renderer = analysisLayer.layer.renderer;

    const chartLabels = chartDataElements[analysisLayer.title].map(
      (dataElement) => dataElement.name
    );
    if (analysisLayer.symbolType === "unique-values") {
      chartStyles[analysisLayer.title] = handleUniqueValueRenderer(
        chartLabels,
        renderer as UniqueValueRenderer
      );
    } else if (analysisLayer.symbolType === "class-breaks-classified") {
      chartStyles[analysisLayer.title] = handleClassifiedDataRenderer(
        chartLabels,
        renderer as ClassBreaksRenderer
      );
    } else if (analysisLayer.symbolType === "class-breaks-unclassed") {
      chartStyles[analysisLayer.title] = handleUnclassedHistogram(chartLabels);
    }
    const chartStyle = chartStyles[analysisLayer.title];
    chartStyle.unshift({
      label: "No data",
      fill: "rgb(0, 0, 0)",
      order: Infinity,
    });
    chartStyles[analysisLayer.title] = chartStyle;
  });
  return chartStyles;
};
