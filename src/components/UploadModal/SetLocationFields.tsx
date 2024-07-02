import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-select";
import "@esri/calcite-components/dist/components/calcite-option";
import "@esri/calcite-components/dist/components/calcite-switch";
import {
  CalciteLabel,
  CalciteSelect,
  CalciteOption,
  CalciteSwitch,
} from "@esri/calcite-components-react";
import { useEffect, useRef, useState } from "react";
import { CalciteSelectCustomEvent } from "@esri/calcite-components";

import { LocationSettings, LocationType } from "./UploadLoactions";

export interface SetLocationFieldsProps {
  firstRow: string[];
  hasHeaders: boolean;
  setHasHeaders: (state: boolean) => void;
  locationSettings: LocationSettings;
  updateLocationField: (
    field: string,
    fieldName: string,
    fieldIndex: number
  ) => void;
  updateLocationType: (toType: LocationType) => void;
}

export const SetLocationFields = (props: SetLocationFieldsProps) => {
  const [fields, setFields] = useState<string[]>([]);
  const [longitudeFields, setLongitudeFields] = useState<string[]>([]);
  const [latitudeFields, setLatitudeFields] = useState<string[]>([]);

  const selectAddressRef = useRef<HTMLCalciteSelectElement | null>(null);
  const selectLatitudeRef = useRef<HTMLCalciteSelectElement | null>(null);
  const selectLongitudeRef = useRef<HTMLCalciteSelectElement | null>(null);

  // Initialize the field name arrays used to create options
  const initFieldArrays = (newFields: string[]) => {
    if (newFields) {
      // All fields (used for single field address inputs)
      setFields([...newFields]);
      // Latitude and Longitude fields - can't be the same field
      setLongitudeFields(newFields.splice(0, 1).concat(newFields.slice(1)));
      setLatitudeFields(newFields.slice(0));
    }
  };

  // Reset the field names and the location Field indices if either the data
  // (first row) or the header setting have changed.
  useEffect(() => {
    let fieldNames: string[];
    if (props.firstRow) {
      if (props.hasHeaders) {
        fieldNames = [...props.firstRow];
      } else {
        fieldNames = [...props.firstRow].map((_, index): string => {
          return `Field_${index}`;
        });
      }
      initFieldArrays(fieldNames);
    }
  }, [props.firstRow, props.hasHeaders]);

  // Create an array of calcite options from an array of strings
  const calciteOptionsFromArray = (
    valuePrefix: string,
    optionArray: string[],
    includeBlank: boolean = true
  ) => {
    let options = [...optionArray];
    if (includeBlank) options = [""].concat(options);
    return options.map((option) => (
      <CalciteOption key={option} value={`${valuePrefix}--${option}`}>
        {option}
      </CalciteOption>
    ));
  };

  // The value property of each option includes a label for the select it is a child of
  // and the value of the field
  const getLabelAndValue = (selected: string) => {
    const [label, value] = selected.split("--");
    return { label, value };
  };

  // Handle togling on the header switch
  const handleHeaderToggle = () => props.setHasHeaders(!props.hasHeaders);

  // Handle changes to the location type dropdown
  const handleLocationTypeChange = (event: CalciteSelectCustomEvent<void>) => {
    const { value } = getLabelAndValue(event.target.value);
    props.updateLocationType(value);
  };

  // Make it so that latitude & longitude can't be set to the same values
  const updateLatLonOptions = (changedInput: string, newFields: string[]) => {
    if (changedInput === "latitude") setLongitudeFields(newFields);
    else if (changedInput === "longitude") setLatitudeFields(newFields);
  };

  // Handle changes on the latitude or longitude selects so that the selected value doesn't
  // show up in the other select's options.
  const handleLocationFieldUpdate = (event: CalciteSelectCustomEvent<void>) => {
    // Update the location field settings
    const { label, value } = getLabelAndValue(event.target.value);
    props.updateLocationField(label, value, fields.indexOf(value));

    // Get a new array of fields
    const newFields = [...fields].filter((field) => field !== value);

    // If the location type is lat and lon, update the paired option lists
    if (props.locationSettings.locationType === "Latitude and Longitude") {
      updateLatLonOptions(label, newFields);
    }
  };

  return (
    <>
      <CalciteLabel layout="inline">
        <CalciteSwitch
          checked={props.hasHeaders ? true : undefined}
          onCalciteSwitchChange={handleHeaderToggle}
          label="Data has headers"
        />{" "}
        Data has Headers
      </CalciteLabel>
      <CalciteLabel layout="inline">
        Location Type
        <CalciteSelect
          label="Select location type"
          onCalciteSelectChange={handleLocationTypeChange}
        >
          {calciteOptionsFromArray(
            "locationType",
            props.locationSettings.allowedLocationTypes,
            false // false = no "blank" "" option in list
          )}
        </CalciteSelect>
      </CalciteLabel>

      {/* Inputs for the address fields are either hidden or visible
          depending on their type. Also need to check the fields variable
          before generating options, as it could be empty. */}
      <CalciteLabel
        layout="inline"
        hidden={
          props.locationSettings.locationType === "Single Address Field"
            ? undefined
            : true
        }
      >
        {" "}
        Select the Address Field
        <CalciteSelect
          ref={selectAddressRef}
          label="Select Address Field"
          onCalciteSelectChange={handleLocationFieldUpdate}
        >
          {fields ? calciteOptionsFromArray("address", fields) : ""}
        </CalciteSelect>
      </CalciteLabel>
      <CalciteLabel
        layout="inline"
        hidden={
          props.locationSettings.locationType === "Latitude and Longitude"
            ? undefined
            : true
        }
      >
        {" "}
        Select the Longitude Field
        <CalciteSelect
          ref={selectLongitudeRef}
          label="Select Longitude Field"
          onCalciteSelectChange={handleLocationFieldUpdate}
        >
          {fields ? calciteOptionsFromArray("longitude", longitudeFields) : ""}
        </CalciteSelect>
      </CalciteLabel>
      <CalciteLabel
        layout="inline"
        hidden={
          props.locationSettings.locationType === "Latitude and Longitude"
            ? undefined
            : true
        }
      >
        {" "}
        Select the Latitude Field
        <CalciteSelect
          ref={selectLatitudeRef}
          label="Select Latitude Field"
          onCalciteSelectChange={handleLocationFieldUpdate}
        >
          {latitudeFields
            ? calciteOptionsFromArray("latitude", latitudeFields)
            : ""}
        </CalciteSelect>
      </CalciteLabel>
    </>
  );
};
