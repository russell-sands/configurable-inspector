import "@esri/calcite-components/dist/components/calcite-label";
import { CalciteLabel } from "@esri/calcite-components-react";

import { useRef } from "react";

export interface SelectFileProps {
  setFile: (file: File | undefined) => void;
}

export const SelectFile = (props: SelectFileProps) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const handleInputFileChange = async () => {
    if (fileRef.current?.files && fileRef.current?.files.length > 0) {
      props.setFile(fileRef.current?.files[0]);
    }
  };
  return (
    <CalciteLabel layout="inline">
      Select a CSV file to upload
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        multiple={false}
        onInput={handleInputFileChange}
      />
    </CalciteLabel>
  );
};
