import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-list";
import "@esri/calcite-components/dist/components/calcite-list-item";
import {
  CalciteCard,
  CalciteList,
  CalciteListItem,
} from "@esri/calcite-components-react";

import { Location } from "../../App";

interface LocationCardProps {
  location: Location;
}
export const LocationCard = ({ location }: LocationCardProps) => {
  return (
    <CalciteCard label={location.label} className="calcite--card--location">
      <span slot="heading">{location.label}</span>
      <CalciteList>
        {location.results?.map((result) => {
          return (
            <CalciteListItem
              label={result.title}
              key={result.title}
              description={result.subtitle}
            >
              <span
                slot="actions-end"
                className="calcite--card--location--value"
              >
                {result.value}
              </span>
            </CalciteListItem>
          );
        })}
      </CalciteList>
    </CalciteCard>
  );
};
