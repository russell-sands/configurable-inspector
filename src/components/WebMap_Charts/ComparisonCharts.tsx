import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

import { ArcGISChart } from "./ArcGISChart";

interface ComparisonChartProps {
  sourceLayer: FeatureLayer;
  compareLayer: FeatureLayer;
  chartId: number;
}

export const ComparisonCharts = ({
  sourceLayer,
  compareLayer,
  chartId,
}: ComparisonChartProps) => {
  return (
    <div id="comparison--chart--grid">
      <div id="comparison--chart--left">
        <ArcGISChart
          definitionLayer={sourceLayer}
          definitionId={chartId}
          dataLayer={sourceLayer}
        />
        <span className="comparison--chart--subtitle">Per map feature</span>
      </div>
      <div id="comparison--chart--right">
        <ArcGISChart
          definitionLayer={sourceLayer}
          definitionId={chartId}
          dataLayer={compareLayer}
        />
        <span className="comparison--chart--subtitle">Per location</span>
      </div>
    </div>
  );
};
