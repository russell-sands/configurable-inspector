import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import PieChartRenderer from "@arcgis/core/renderers/PieChartRenderer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import Point from "@arcgis/core/geometry/Point";

export type SelectedLocationElement = {
  zoomToLocation: Point;
  displayLayer: string;
};

export type AnySupportedRenderer =
  | UniqueValueRenderer
  | ClassBreaksRenderer
  | PieChartRenderer;

export interface IndexedString {
  [index: string]: string;
}

export interface IndexedNumber {
  [index: string]: number;
}

// Properties of a chart - data and styles
export type ChartProperties = {
  data: IndexedString;
  style: IndexedString;
};

// Supported Symbol Types
export type SymbolType =
  | "unknown"
  | "unique-values"
  | "class-breaks-unclassed"
  | "class-breaks-classified"
  | "pie-chart";

// Recharts chart data is a list of indexed strings or numbers
export type BinnedDataElement = {
  name: string;
  value: number;
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
