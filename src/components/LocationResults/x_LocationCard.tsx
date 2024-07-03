import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-list";
import "@esri/calcite-components/dist/components/calcite-list-group";
import "@esri/calcite-components/dist/components/calcite-list-item";
import {
  CalciteCard,
  CalciteList,
  CalciteListGroup,
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
    <CalciteCard
      label={location.label}
      key={location.id}
      className="calcite--card--location"
    >
      <CalciteList>
        {location.results?.map((result) => {
          return (
            <CalciteListGroup
              label={result.sourceLayer}
              key={result.sourceLayer}
              // description={result.subtitle}
              onCalciteListItemSelect={handleListCallback}
              onBlur={handleBlur}
            >
              <span
                slot="actions-end"
                className="calcite--card--location--value"
              >
                Something
              </span>
            </CalciteListGroup>
          );
        })}
      </CalciteList>
    </CalciteCard>
  );
};
