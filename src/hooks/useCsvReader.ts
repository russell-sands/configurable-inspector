import { useEffect } from "react";

import { csvParseRows } from "d3";

export const useCsvReader = (
  file: File | undefined,
  setData: (data: string[][]) => void
) => {
  const fileReader = new FileReader();
  useEffect(() => {
    if (file) {
      fileReader.onload = () => {
        const textContent = fileReader.result as string;
        const csvData = csvParseRows(textContent);
        setData(csvData);
      };
      fileReader.readAsText(file);
    } else {
      setData([]);
    }
  }, [file]);
};
