import { useRef, useState } from "react";

import "@esri/calcite-components/dist/components/calcite-modal";
import "@esri/calcite-components/dist/components/calcite-stepper";
import "@esri/calcite-components/dist/components/calcite-stepper-item";
import "@esri/calcite-components/dist/components/calcite-button";
import {
  CalciteModal,
  CalciteStepper,
  CalciteStepperItem,
  CalciteButton,
} from "@esri/calcite-components-react";

import { useCsvReader } from "../../hooks/useCsvReader";
import { SelectFile } from "./SelectFile";
import { SetLocationFields } from "./SetLocationFields";
import { parseLocations } from "../../utils/processData";
import { SettingsSummary } from "./SettingsSummary";
import { Location } from "../../App";

const LocationTypes = ["Single Address Field", "Latitude and Longitude"];
export type LocationType = (typeof LocationTypes)[number];

export interface FieldInfo {
  name: string;
  index: number;
}

export interface LocationFields {
  [index: string]: FieldInfo | undefined;
}

export interface LocationSettings {
  allowedLocationTypes: LocationType[];
  locationType: LocationType;
  fieldInfo: LocationFields;
  valid: boolean;
}

export interface UploadLocationsProps {
  updateLocations: (points: Location[]) => void;
  open: true | undefined;
}

export const UploadLocations = (props: UploadLocationsProps) => {
  const [file, setFile] = useState<File | undefined>();
  const [fileData, setFileData] = useState<string[][]>([]);
  const [fileHasHeaders, setFileHasHeaders] = useState<boolean>(true);
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    allowedLocationTypes: LocationTypes,
    locationType: LocationTypes[0],
    fieldInfo: {},
    valid: false,
  });

  const stepperRef = useRef<HTMLCalciteStepperElement | null>(null);

  useCsvReader(file, setFileData);

  const isLocationSettingValid = (settings: LocationSettings) => {
    let isValid = false;
    if (settings.locationType === "Single Address Field") {
      isValid = Boolean(settings.fieldInfo?.address?.name);
    } else if (settings.locationType === "Latitude and Longitude") {
      isValid =
        Boolean(settings.fieldInfo?.latitude?.name) &&
        Boolean(settings.fieldInfo?.longitude?.name);
    }
    return isValid;
  };

  // Function to update a specific location field's setting
  const updateLocationField = (
    field: string,
    fieldName: string,
    fieldIndex: number
  ) => {
    const newLocationSettings = { ...locationSettings };
    // Update the fieldInfo property
    if (field !== "") {
      newLocationSettings.fieldInfo[field] = {
        name: fieldName,
        index: fieldIndex,
      };
    } else {
      delete newLocationSettings.fieldInfo[field];
    }
    // Update the validity of the location settings
    newLocationSettings.valid = isLocationSettingValid(newLocationSettings);

    // console.log(newLocationSettings);
    setLocationSettings(newLocationSettings);
  };

  // Update the location type
  const updateLocationType = (toType: LocationType) => {
    const newLocationSettings = { ...locationSettings };
    newLocationSettings.locationType = toType;
    setLocationSettings(newLocationSettings);
  };

  // Handle next buttons
  const handleNext = () => {
    stepperRef.current?.nextStep();
  };

  // Handle back buttons
  const handleBack = () => {
    stepperRef.current?.prevStep();
  };

  const handleSubmit = async () => {
    const points = await parseLocations(
      fileData,
      fileHasHeaders,
      locationSettings
    );
    props.updateLocations(points);
    // props.submitCallback();
  };

  return (
    <CalciteModal open={props.open}>
      <span slot="header">Upload Locations</span>
      <CalciteStepper ref={stepperRef} slot="content">
        <CalciteStepperItem heading="Select File">
          <div>
            <SelectFile setFile={setFile} />
            <CalciteButton
              onClick={handleNext}
              disabled={file ? undefined : true}
            >
              Next
            </CalciteButton>
          </div>
        </CalciteStepperItem>
        <CalciteStepperItem
          heading="Location Fields"
          disabled={file ? undefined : true}
        >
          <form>
            <SetLocationFields
              firstRow={fileData[0]}
              hasHeaders={fileHasHeaders}
              setHasHeaders={setFileHasHeaders}
              locationSettings={locationSettings}
              updateLocationType={updateLocationType}
              updateLocationField={updateLocationField}
            />
            <CalciteButton appearance="outline-fill" onClick={handleBack}>
              Back
            </CalciteButton>
            &nbsp;&nbsp;&nbsp;
            <CalciteButton
              disabled={locationSettings.valid ? undefined : true}
              onClick={handleNext}
            >
              Next
            </CalciteButton>
          </form>
        </CalciteStepperItem>
        <CalciteStepperItem
          heading="Confirm"
          disabled={locationSettings.valid ? undefined : true}
        >
          {" "}
          <div>
            <SettingsSummary settings={locationSettings} />
            <CalciteButton appearance="outline-fill" onClick={handleBack}>
              Back
            </CalciteButton>
            &nbsp;&nbsp;&nbsp;
            <CalciteButton
              disabled={locationSettings.valid ? undefined : true}
              onClick={handleSubmit}
            >
              Submit
            </CalciteButton>
          </div>
        </CalciteStepperItem>
      </CalciteStepper>
    </CalciteModal>
  );
};
