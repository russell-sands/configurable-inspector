import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import PieChartRenderer from "@arcgis/core/renderers/PieChartRenderer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import Point from "@arcgis/core/geometry/Point";
// import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
// import Graphic from "@arcgis/core/Graphic";

export type SelectedLocationElement = {
  zoomToLocation: Point;
  displayLayer: string;
};

export type AnySupportedRenderer =
  | UniqueValueRenderer
  | ClassBreaksRenderer
  | PieChartRenderer
  | SimpleRenderer;

// export type FieldInfo = {
//   name: string;
//   label: string;
// };

// export interface AnalysisLayer {
//   title: string; // consider removing this and using layer.title instead?
//   layer: FeatureLayer;
//   id: number; // Using drawing order
//   symbolType: SymbolType;
//   requiredFields: FieldInfo[];
//   normalizationField: FieldInfo | null;
//   isExpressionBased: boolean;
//   graphicToValue: (graphic: Graphic) => string | number;
// }

export interface IndexedString {
  [index: string]: string;
}

export interface IndexedNumber {
  [index: string]: number;
}

export type FeatureLayerRenderer =
  | UniqueValueRenderer
  | ClassBreaksRenderer
  | PieChartRenderer
  | SimpleRenderer;

// Properties of a chart - data and styles
export type ChartProperties = {
  data: IndexedString;
  style: IndexedString;
};

// Supported Symbol Types
export type SymbolType =
  | "unknown"
  | "simple"
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
