import "@esri/calcite-components/dist/components/calcite-chip";
import "@esri/calcite-components/dist/components/calcite-chip-group";
import { CalciteChipGroup, CalciteChip } from "@esri/calcite-components-react";
import { CalciteChipGroupCustomEvent } from "@esri/calcite-components";
import { ViewMode } from "./MapChartUI";

import "./mapChartToggle.css";

interface MapChartToggleProps {
  hasComparisonCharts: true | undefined;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}
export const MapChartToggle = ({
  hasComparisonCharts,
  viewMode,
  setViewMode,
}: MapChartToggleProps) => {
  const handleSelectionChange = (event: CalciteChipGroupCustomEvent<void>) => {
    setViewMode(event.target.selectedItems[0].value);
  };
  return (
    <CalciteChipGroup
      className="toggle--charts"
      label="map=-chart-toggle"
      selectionMode="single-persist"
      slot="header-actions-end"
      onCalciteChipGroupSelect={handleSelectionChange}
    >
      <CalciteChip
        icon="map"
        value="map"
        className="chip--map"
        selected={viewMode === "map" ? true : undefined}
      >
        Map
      </CalciteChip>
      <CalciteChip
        icon="graph-pie-slice"
        value="summary"
        className="chip--summary"
        selected={viewMode === "summary" ? true : undefined}
      >
        Summary Charts
      </CalciteChip>
      <CalciteChip
        hidden={hasComparisonCharts ? undefined : true}
        icon="graph-moving-average"
        value="charts"
        className="chip--charts"
        selected={viewMode === "charts" ? true : undefined}
      >
        Comparison Charts
      </CalciteChip>
    </CalciteChipGroup>
  );
};
