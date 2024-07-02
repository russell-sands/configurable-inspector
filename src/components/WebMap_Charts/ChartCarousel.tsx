import "@esri/calcite-components/dist/components/calcite-tabs";
import "@esri/calcite-components/dist/components/calcite-tab-nav";
import "@esri/calcite-components/dist/components/calcite-tab-title";
import "@esri/calcite-components/dist/components/calcite-tab";
import {
  CalciteTabs,
  CalciteTabNav,
  CalciteTabTitle,
  CalciteTab,
} from "@esri/calcite-components-react";

import { AnalysisLayer } from "../../utils/getAnalysisLayerInfo";
import { Location } from "../../App";
import { createResultLayers } from "./createResultLayers";
import { ComparisonCharts } from "./ComparisonCharts";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

interface ChartCarouselProps {
  locations: Location[];
  chartLayers: AnalysisLayer[];
}
export const ChartCarousel = ({
  locations,
  chartLayers,
}: ChartCarouselProps) => {
  const compareLayers = createResultLayers(locations, chartLayers);

  // Get the titles of all charts
  const chartTitles: string[] = [];
  chartLayers.forEach((chartLayer) => {
    chartLayer.layer.charts.forEach((chart) =>
      chartTitles.push(chart.title.content.text)
    );
  });

  // Get the info you need for each comparison chart
  const compareSettings: {
    title: string;
    chartIndex: number;
    source: FeatureLayer;
    compare: FeatureLayer;
  }[] = [];

  chartLayers.forEach((chartLayer, layerIndex) => {
    chartLayer.layer.charts.forEach((chart, chartIndex) =>
      compareSettings.push({
        title: chart.title.content.text,
        chartIndex: chartIndex,
        source: chartLayer.layer,
        compare: compareLayers[layerIndex],
      })
    );
  });

  return (
    <CalciteTabs
      position="top"
      //   layout="center"
      className="comparsion--chart--container"
    >
      <CalciteTabNav slot="title-group">
        {compareSettings.map((setting) => {
          return (
            <CalciteTabTitle key={setting.title}>
              {setting.title}
            </CalciteTabTitle>
          );
        })}
      </CalciteTabNav>
      {compareSettings.map((setting) => {
        return (
          <CalciteTab key={setting.title}>
            <ComparisonCharts
              sourceLayer={setting.source}
              chartId={setting.chartIndex}
              compareLayer={setting.compare}
            />
          </CalciteTab>
        );
      })}
    </CalciteTabs>
  );
};
