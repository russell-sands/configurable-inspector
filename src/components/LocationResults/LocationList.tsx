import "@esri/calcite-components/dist/components/calcite-card-group";
import { CalciteCardGroup } from "@esri/calcite-components-react";

import { Location } from "../../App";
import { LocationCard } from "./LocationCard";

interface LocationListProps {
  locations: Location[];
}

export const LocationList = ({ locations }: LocationListProps) => {
  return (
    <CalciteCardGroup label="Location List" className="list--locations">
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </CalciteCardGroup>
  );
};
