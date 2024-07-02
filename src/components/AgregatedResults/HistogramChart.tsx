import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartProps } from "../../shared/types";

export const HistogramChart = ({ chartDefinition }: ChartProps) => {
  return (
    <ResponsiveContainer>
      <BarChart data={chartDefinition} barCategoryGap={1}>
        <XAxis dataKey="label" />
        <YAxis dataKey="value" />
        <Tooltip />
        <Bar dataKey={"value"} />;
      </BarChart>
    </ResponsiveContainer>
  );
};
