import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-list";
import "@esri/calcite-components/dist/components/calcite-list-item";
import "@esri/calcite-components/dist/components/calcite-block";
import { CalciteCard } from "@esri/calcite-components-react";

import { UniqueValuesChart } from "./UniqueValuesChart";
import { ElementDefinition, SymbolType } from "../../shared/types";
import { ClassifiedValuesChart } from "./ClassifiedValuesChart";
import { HistogramChart } from "./HistogramChart";

import "./layerCard.css";

interface LocationCardProps {
  title: string;
  symbolType: SymbolType;
  definition: ElementDefinition[];
}

export const LayerCard = ({
  title,
  symbolType,
  definition,
}: LocationCardProps) => {
  let chartTitle = title;
  if (symbolType === "unique-values") chartTitle += " (Count of locations)";
  if (symbolType === "class-breaks-classified")
    chartTitle += " (Count of locations)";
  if (symbolType === "class-breaks-unclassed")
    chartTitle += " Histogram (distribution per-location)";
  if (symbolType === "pie-chart") chartTitle += " (Sum of value per location)";
  return (
    <CalciteCard label={chartTitle} className="calcite--card--layer">
      <span slot="heading">{chartTitle}</span>
      <div className="chart--container">
        {(() => {
          if (symbolType === "unique-values") {
            return <UniqueValuesChart chartDefinition={definition} />;
          } else if (symbolType === "class-breaks-classified") {
            return <ClassifiedValuesChart chartDefinition={definition} />;
          } else if (symbolType === "class-breaks-unclassed") {
            return <HistogramChart chartDefinition={definition} />;
          } else if (symbolType === "pie-chart") {
            return <UniqueValuesChart chartDefinition={definition} />;
          } else {
            console.log(title);
            return <></>;
          }
        })()}
      </div>
    </CalciteCard>
  );
};
