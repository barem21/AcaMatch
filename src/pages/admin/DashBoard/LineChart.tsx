import { ResponsiveLine } from "@nivo/line";
import { COLORS, DataKey } from "./types";

interface LineChartProps {
  selectedData: any[];
  selectedMonth: string;
  selectedItem: string;
  maxValue: number;
}

const LineChart = ({
  selectedData,
  selectedMonth,
  selectedItem,
  maxValue,
}: LineChartProps) => {
  if (!selectedData || selectedData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveLine
      key={`${selectedMonth}-${selectedItem}`}
      data={selectedData}
      margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
        stacked: false,
      }}
      gridXValues={[]}
      theme={{
        grid: {
          line: {
            stroke: "#ccc",
            strokeWidth: 1,
            strokeDasharray: "2 2",
          },
        },
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: -40,
        legendPosition: "middle",
        tickValues: Array.from(
          { length: maxValue / 100 + 1 },
          (_, i) => i * 100,
        ),
      }}
      colors={({ id }) => COLORS[id as DataKey]}
      lineWidth={4}
      enablePoints={false}
      useMesh={true}
      legends={[
        {
          anchor: "top-left",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: -30,
          itemsSpacing: 10,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
        },
      ]}
      tooltip={({ point }) => (
        <div
          style={{
            background: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            border: `1px solid ${point.color}`,
            fontSize: "12px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {point.data.y instanceof Date
            ? point.data.y.toLocaleString()
            : String(point.data.y)}
        </div>
      )}
    />
  );
};

export default LineChart;
