import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";

export type AnySupportedRenderer = UniqueValueRenderer | ClassBreaksRenderer;

export interface IndexedString {
  [index: string]: string;
}

export interface IndexedNumber {
  [index: string]: number;
}

export type SymbolType =
  | "unknown"
  | "unique-values"
  | "class-breaks-unclassed"
  | "class-breaks-classified";

// Data eleme fror recharts is either the name of a
// wedge / bar (string "Texas") or a variable for a
// value (number)

// Chart data is a list of indexed strings or numbers
export type BinnedDataElement = {
  name: string;
  value: number;
};

export type ChartProperties = {
  data: IndexedString;
  style: IndexedString;
};

export type ElementDefinition = {
  label: string;
  fill: string;
  order: number;
  value: number;
};

export interface ChartProps {
  chartDefinition: ElementDefinition[];
}
