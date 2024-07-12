import Graphic from "@arcgis/core/Graphic";
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";

import { Location } from "../../App";
import * as defaultSymbol from "./defaultSymbol.json";

const symbol = new CIMSymbol({
  data: {
    type: "CIMSymbolReference",
    symbol: defaultSymbol as __esri.CIMPointSymbol,
  },
});

// Convert points into map graphics
export const pointsToGraphics = (locations: Location[]): Graphic[] => {
  return locations.map(
    (location) => new Graphic({ geometry: location.point, symbol: symbol })
  );
};
