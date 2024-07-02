import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartProps } from "../../CommonTypes";

export const ClassifiedValuesChart = ({ chartDefinition }: ChartProps) => {
  return (
    <ResponsiveContainer>
      <BarChart data={chartDefinition}>
        <XAxis dataKey="label" />
        <YAxis dataKey="value" />
        <Tooltip />
        <Bar dataKey={"value"} />;
      </BarChart>
    </ResponsiveContainer>
  );
};
