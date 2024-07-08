import "@esri/calcite-components/dist/components/calcite-card";
import { CalciteCard } from "@esri/calcite-components-react";

import "./locationCard.css";

import { Location } from "../../App";
import { SelectedLocationElement } from "../../shared/types";
import { MouseEvent } from "react";

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
  const setSelectedFromResultContainer = (resultContainer: Element | null) => {
    if (resultContainer) {
      const children = [];
      for (let i = 0; i < resultContainer.children.length; i++) {
        children.push(resultContainer.children[i]);
      }
      const layerLabelElement = children.filter(
        (child) => child.className === "location--results--layer--name"
      )[0];
      setSelectedElement({
        zoomToLocation: location.point,
        displayLayer: layerLabelElement.innerHTML,
      });
    }
  };

  const handleClick = (event: MouseEvent) => {
    const clickedElement = event.target as Element;
    console.log(clickedElement.className);
    if (clickedElement.className === "location--results--layer--name") {
      // If the user clics on the layer name, then the inner HTML of the
      // target is the layer title
      setSelectedElement({
        zoomToLocation: location.point,
        displayLayer: clickedElement.innerHTML,
      });
    } else if (clickedElement.className === "location--card--results") {
      // If the user clicked on the result list container (shouldn't be possible...)
      // then use the immediate parent element (the location--results--container)
      const resultsContainer = clickedElement.parentElement;
      setSelectedFromResultContainer(resultsContainer);
    } else if (
      clickedElement.className === "location--card--result--label" ||
      clickedElement.className === "location--card--result--value"
    ) {
      // If the user clicked on the result label or the result value, then
      // the result container is the parent's parent.
      const resultsContainer = clickedElement.parentElement!.parentElement;
      setSelectedFromResultContainer(resultsContainer);
    } else if (clickedElement.className === "location--results--container") {
      // If the user clicked on the result container directly, then
      // use it to set the selected result.
      setSelectedFromResultContainer(clickedElement);
    } else {
      console.log(`why no ${clickedElement.className}`);
    }
  };
  return (
    <CalciteCard
      label={location.label}
      key={location.id}
      className="location--card"
    >
      <div slot="heading" className="card--title">
        {location.label}
      </div>
      {location.results.map((result) => {
        return (
          <div
            key={`${location.id}-${result.sourceLayer}`}
            onClick={handleClick}
            className="location--results--container"
          >
            <span className="location--results--layer--name">
              {result.sourceLayer}
            </span>
            <div className="location--card--results">
              {result.attributes
                .sort((attribute) => attribute.order - attribute.order)
                .map((attribute) => {
                  return (
                    <>
                      <div
                        key={`${location.id}-${result.sourceLayer}-${attribute.name}-name`}
                        className="location--card--result--label"
                      >
                        {attribute.nameLabel}
                      </div>
                      <div
                        key={`${location.id}-${result.sourceLayer}-${attribute.name}-value`}
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
