import "@esri/calcite-components/dist/components/calcite-card-group";
import { CalciteCardGroup } from "@esri/calcite-components-react";

import { Location } from "../../App";
import { LocationCard } from "./LocationCard";
import { SelectedLocationElement } from "../../shared/types";

import "./locationList.css";

interface LocationListProps {
  locations: Location[];
  setSelectedElement: (
    selectedElement: SelectedLocationElement | undefined
  ) => void;
}

export const LocationList = ({
  locations,
  setSelectedElement,
}: LocationListProps) => {
  return (
    <div className="list--locations--container">
      <CalciteCardGroup label="Location List" className="list--locations">
        {locations.map((location, index) => (
          <LocationCard
            key={`${location.id}-${index}`}
            location={location}
            setSelectedElement={setSelectedElement}
          />
        ))}
      </CalciteCardGroup>
    </div>
  );
};
