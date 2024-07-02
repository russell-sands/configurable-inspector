import { LocationSettings } from "./UploadLoactions";

interface SettingsSummaryProps {
  settings: LocationSettings;
}

export const SettingsSummary = (props: SettingsSummaryProps) => {
  const settings = { ...props.settings };
  const locationSettingsContent: JSX.Element[] = [];

  if (settings.locationType == "Single Address Field") {
    locationSettingsContent.push(
      <li key={settings.fieldInfo?.address?.name}>
        Address: {settings.fieldInfo?.address?.name}
      </li>
    );
  } else if (settings.locationType == "Latitude and Longitude") {
    locationSettingsContent.push(
      <li key={settings.fieldInfo?.latitude?.name}>
        Longitude: {settings.fieldInfo?.latitude?.name}
      </li>
    );
    locationSettingsContent.push(
      <li key={settings.fieldInfo?.longitude?.name}>
        Longitude: {settings.fieldInfo?.longitude?.name}
      </li>
    );
  }
  if (settings.valid) {
    return (
      <div>
        <span>Location Type</span>
        <ul>
          <li>Location type: {settings.locationType}</li>
        </ul>
        <span>Location Settings</span>
        <ul>{locationSettingsContent}</ul>
      </div>
    );
  } else return <></>;
};
