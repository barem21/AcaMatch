import { ResponsiveLine } from "@nivo/line";
import { COLORS, DataKey } from "./types";
import { useEffect, useState } from "react";

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
  // 차트 키를 상태로 관리하여 데이터 변경 시 차트를 강제로 다시 렌더링
  const [chartKey, setChartKey] = useState(`${selectedMonth}-${selectedItem}`);

  // 데이터가 변경될 때마다 차트 키를 업데이트
  useEffect(() => {
    setChartKey(`${selectedMonth}-${selectedItem}-${Date.now()}`);
  }, [selectedData, selectedMonth, selectedItem]);

  if (!selectedData || selectedData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  // 현재 날짜 정보 가져오기
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript는 0부터 시작하므로 +1
  const currentDay = now.getDate();

  // 선택된 월이 현재 월인지 확인
  const isCurrentMonth = parseInt(selectedMonth) === currentMonth;

  // 현재 월일 경우 오늘 날짜까지만 데이터 필터링
  const filteredData = selectedData.map(dataset => ({
    ...dataset,
    data: dataset.data.filter((point: any) => {
      const day = parseInt(point.x);
      return !isCurrentMonth || day <= currentDay;
    }),
  }));

  // 데이터의 최대값 계산
  const dataMax = Math.max(
    ...filteredData.flatMap(d => d.data.map((point: any) => point.y)),
  );

  // 최대값이 0이면 기본값 5 사용, 아니면 적절한 간격 계산
  const tickInterval = dataMax === 0 ? 1 : Math.ceil(dataMax / 5);

  // 최대 y값 계산 (데이터가 없으면 5, 있으면 데이터 최대값의 1.1배)
  const yMax = dataMax === 0 ? 5 : Math.ceil(dataMax * 1.1);

  return (
    <ResponsiveLine
      key={chartKey} // 데이터 변경 시 차트를 강제로 다시 렌더링하기 위한 키
      data={filteredData}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: yMax, // 계산된 최대값 사용
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
