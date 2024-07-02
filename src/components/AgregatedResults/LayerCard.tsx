import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-list";
import "@esri/calcite-components/dist/components/calcite-list-item";
import "@esri/calcite-components/dist/components/calcite-block";
import { CalciteCard } from "@esri/calcite-components-react";

import { UniqueValuesChart } from "./UniqueValuesChart";
import { ElementDefinition, SymbolType } from "../../CommonTypes";
import { ClassifiedValuesChart } from "./ClassifiedValuesChart";
import { HistogramChart } from "./HistogramChart";

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
  return (
    <CalciteCard label={title} className="calcite--card--layer">
      <span slot="heading">{title}</span>
      <div className="chart--container">
        {(() => {
          if (symbolType === "unique-values") {
            return <UniqueValuesChart chartDefinition={definition} />;
          } else if (symbolType === "class-breaks-classified") {
            return <ClassifiedValuesChart chartDefinition={definition} />;
          } else if (symbolType === "class-breaks-unclassed") {
            return <HistogramChart chartDefinition={definition} />;
          } else {
            console.log(title);
            return <></>;
          }
        })()}
      </div>
    </CalciteCard>
  );
};
