import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-icon";
import { CalciteCard, CalciteIcon } from "@esri/calcite-components-react";

import "./locationCard.css";

import { Location } from "../../App";
import { SelectedLocationElement } from "../../shared/types";

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
  /*FIX LAYER TOGGLE -> Enable toggle off*/

  const updatePointOnly = () => {
    setSelectedElement({
      zoomToLocation: location.point,
      displayLayer: "--no-update",
    });
  };

  const updatePointAndLayer = (layerTitle: string) => {
    setSelectedElement({
      zoomToLocation: location.point,
      displayLayer: layerTitle,
    });
  };

  return (
    <CalciteCard
      label={location.label}
      key={location.id}
      className="location--card"
    >
      <div slot="heading" className="card--title" onClick={updatePointOnly}>
        <CalciteIcon
          icon="pin-tear-f"
          text-label="Location"
          scale="s"
        ></CalciteIcon>
        {location.label}
      </div>
      {location.results.map((result) => {
        return (
          <div
            key={`${location.id}-${result.sourceLayer}`}
            onClick={() => {
              updatePointAndLayer(result.sourceLayer);
            }}
            className="location--results--container"
          >
            <div className="location--result--layer--title">
              {" "}
              <CalciteIcon
                icon="layer-polygon"
                text-label="Polygon layer"
                scale="s"
                className="location--results--layer--icon"
              ></CalciteIcon>
              <span className="location--results--layer--name">
                {result.sourceLayer}
              </span>
            </div>
            <div className="location--card--results">
              {result.attributes
                .sort((attribute) => attribute.order - attribute.order)
                .map((attribute) => {
                  return (
                    <>
                      <div
                        key={`${location.id}-${result.sourceLayer}-${attribute.name}-name`}
                        onClick={() => {
                          updatePointAndLayer(result.sourceLayer);
                        }}
                        className="location--card--result--label"
                      >
                        {attribute.nameLabel}
                      </div>
                      <div
                        key={`${location.id}-${result.sourceLayer}-${attribute.name}-value`}
                        onClick={() => {
                          updatePointAndLayer(result.sourceLayer);
                        }}
                        className="location--card--result--value"
                      >
                        {attribute.valueLabel}
                      </div>
                    </>
                  );
                })}
            </div>
          </div>
        );
      })}
    </CalciteCard>
  );
};
