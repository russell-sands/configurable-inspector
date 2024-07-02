import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-list";
import "@esri/calcite-components/dist/components/calcite-list-item";
import {
  CalciteCard,
  CalciteList,
  CalciteListItem,
} from "@esri/calcite-components-react";

import { Location } from "../../App";
import { SelectedLocationElement } from "../../shared/types";
import { CalciteListItemCustomEvent } from "@esri/calcite-components";

interface LocationCardProps {
  location: Location;
  setSelectedElement: (
    selectedElement: SelectedLocationElement | undefined
  ) => void;
}
export const LocationCard = ({
  location,
  setSelectedElement,
}: LocationCardProps) => {
  const handleListCallback = (event: CalciteListItemCustomEvent<void>) => {
    setSelectedElement({
      zoomToLocation: location.point,
      displayLayer: event.target.label, // TODO - Make this work
    });
    console.log(event);
  };
  const handleBlur = () => {
    setSelectedElement(undefined);
  };
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
              onCalciteListItemSelect={handleListCallback}
              onBlur={handleBlur}
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
