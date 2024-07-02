import { PieChart, Pie, Legend, ResponsiveContainer, Tooltip } from "recharts";

import { ChartProps } from "../../shared/types";

export const UniqueValuesChart = ({ chartDefinition }: ChartProps) => {
  const chartWidth = 500;
  const chartHeight = 180;
  const pieRadius = Math.floor(chartHeight / 2);
  const legendWidth = chartWidth - chartHeight - 50;
  const legendLayout = chartDefinition.length > 10 ? "horizontal" : "vertical";

  return (
    <ResponsiveContainer>
      <PieChart height={chartHeight} width={chartWidth}>
        <Legend
          layout={legendLayout}
          width={legendWidth}
          verticalAlign="middle"
          align="right"
        />
        <Tooltip />
        {/* For the data in a pie chart, it has to be {name: <label>, value: number}
            so we can just map that out here. */}
        <Pie
          startAngle={-270}
          data={chartDefinition.map((chartElement) => {
            return {
              name: chartElement.label,
              value: chartElement.value,
              fill: chartElement.fill,
            };
          })}
          labelLine={false}
          outerRadius={pieRadius}
          dataKey="value"
        ></Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};
