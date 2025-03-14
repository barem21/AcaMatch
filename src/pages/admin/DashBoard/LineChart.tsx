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
  // maxValue,
}: LineChartProps) => {
  if (!selectedData || selectedData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  // 데이터의 최대값 계산
  const dataMax = Math.max(
    ...selectedData.flatMap(d => d.data.map((point: any) => point.y)),
  );
  // 적절한 눈금 간격 계산 (예: 최대값을 5로 나누어 사용)
  const tickInterval = Math.ceil(dataMax / 5);

  return (
    <ResponsiveLine
      key={`${selectedMonth}-${selectedItem}`}
      data={selectedData}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }} // left margin 증가
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: Math.ceil(dataMax * 1.1), // 최대값보다 약간 더 높게 설정
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
        format: value => `${parseInt(value)}일`,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: -40,
        legendPosition: "middle",
        tickValues: Array.from({ length: 6 }, (_, i) =>
          Math.round(i * tickInterval),
        ),
        format: value => {
          const unit = {
            학원수: "개",
            회원수: "명",
            결제내역: "건",
          }[selectedItem];
          return `${value.toLocaleString()}${unit}`;
        },
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
