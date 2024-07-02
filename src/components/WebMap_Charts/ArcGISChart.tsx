import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

import {
  ArcgisChartsBarChart,
  ArcgisChartsBoxPlot,
  ArcgisChartsHistogram,
  ArcgisChartsLineChart,
  ArcgisChartsPieChart,
  ArcgisChartsScatterPlot,
} from "@arcgis/charts-components-react";

type ArcGISChart = typeof ArcgisChartsBarChart | typeof ArcgisChartsScatterPlot;

interface ArcGISChartProps {
  definitionLayer: FeatureLayer;
  definitionId: number;
  dataLayer: FeatureLayer;
}

export const ArcGISChart = ({
  definitionLayer,
  definitionId,
  dataLayer,
}: ArcGISChartProps) => {
  // console.log(definitionLayer.title, definitionLayer.charts[definitionId]);
  // console.log(dataLayer);
  const seriesType = definitionLayer.charts[definitionId].series[0].type;
  switch (seriesType) {
    case "barSeries":
      return (
        <ArcgisChartsBarChart
          config={definitionLayer.charts[definitionId]}
          layer={dataLayer}
          className="comparison--chart--arcgis"
        ></ArcgisChartsBarChart>
      );
    case "scatterSeries":
      return (
        <ArcgisChartsScatterPlot
          config={definitionLayer.charts[definitionId]}
          layer={dataLayer}
          className="comparison--chart--arcgis"
        />
      );
    case "histogramSeries":
      return (
        <ArcgisChartsHistogram
          config={definitionLayer.charts[definitionId]}
          layer={dataLayer}
          className="comparison--chart--arcgis"
        ></ArcgisChartsHistogram>
      );
    case "pieSeries":
      return (
        <ArcgisChartsPieChart
          config={definitionLayer.charts[definitionId]}
          layer={dataLayer}
          className="comparison--chart--arcgis"
        ></ArcgisChartsPieChart>
      );
    case "boxPlotSeries":
      return (
        <ArcgisChartsBoxPlot
          config={definitionLayer.charts[definitionId]}
          layer={dataLayer}
          className="comparison--chart--arcgis"
        ></ArcgisChartsBoxPlot>
      );
    case "lineSeries":
      return (
        <ArcgisChartsLineChart
          config={definitionLayer.charts[definitionId]}
          layer={dataLayer}
          className="comparison--chart--arcgis"
        ></ArcgisChartsLineChart>
      );

    default:
      return <span>Unsupported chart type {seriesType}</span>;
  }
};