import Point from "@arcgis/core/geometry/Point";

import { addressesToLocations } from "@arcgis/core/rest/locator";

import {
  LocationFields,
  LocationSettings,
} from "../components/UploadModal/UploadLoactions";

import { Location } from "../App";
import { LocationResult } from "./inspectLocations";

export interface QueryResult {
  title: string | undefined;
  subtitle: string | undefined;
  result: LocationResult | undefined;
}

// const defaultSymbol = new SimpleMarkerSymbol({
//   color: [226, 119, 40], // orange
//   outline: {
//     color: [255, 255, 255], // white
//     width: 1,
//   },
// });

const getIndex = (fieldInfo: LocationFields, field: string): number => {
  if (fieldInfo[field]) return fieldInfo[field]!.index;
  else return -1;
};

const parseAddresses = async (
  data: string[][],
  fieldInfo: LocationFields
): Promise<Location[]> => {
  // Create an array containing the geocode options for each input
  const addresses = data.map((row, index) => {
    return {
      OBJECTID: index,
      SingleLine: row[getIndex(fieldInfo, "address")],
    };
  });

  // Make a geocoding request and pass the array of inputs
  const response = await addressesToLocations(
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
    { addresses }
  );

  // Turn the response into an array of Locations
  const locations = response.map((r): Location => {
    return {
      id: r.address,
      label: r.address,
      point: r.location,
      results: [],
    };
  });
  return locations;
};

// Parse data input if the data are lat and lon
const parseLonLat = (
  data: string[][],
  fieldInfo: LocationFields
): Location[] => {
  // Default Symbol

  // Create points from the input data
  const locations = data.map((row, index): Location => {
    const point = new Point({
      latitude: Number(row[getIndex(fieldInfo, "latitude")]),
      longitude: Number(row[getIndex(fieldInfo, "longitude")]),
      spatialReference: { wkid: 4326 },
    });
    return {
      id: `Location ${index + 1}`,
      label: `Location ${index + 1}`,
      point: point,
      results: [],
    };
  });
  return locations;
};

export const parseLocations = async (
  data: string[][],
  dataHasHeaders: boolean,
  locationSettings: LocationSettings
): Promise<Location[]> => {
  // Create a copy of the stateful data input, then slice it at either 1 (first row onward) or
  // 0 (all rows) depending on if there are or are not any headers on the data.
  const useData = JSON.parse(JSON.stringify(data)).slice(
    dataHasHeaders ? 1 : 0
  );
  if (locationSettings.locationType === "Single Address Field")
    return parseAddresses(useData, locationSettings.fieldInfo);
  else if (locationSettings.locationType === "Latitude and Longitude")
    return parseLonLat(useData, locationSettings.fieldInfo);
  else return [];
};
