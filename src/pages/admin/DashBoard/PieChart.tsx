import { ResponsivePie } from "@nivo/pie";

interface PieChartProps {
  pieData: Array<{
    id: string;
    label: string;
    value: number;
    color: string;
  }>;
}

const PieChart = ({ pieData }: PieChartProps) => {
  if (!pieData || pieData.length === 0) {
    return (
      <div className="h-[200px] w-full mx-auto flex items-center justify-center text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div
      style={{
        height: "200px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ResponsivePie
        data={pieData}
        margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
        innerRadius={0.9}
        padAngle={2}
        cornerRadius={3}
        colors={({ data }) => data.color}
        enableArcLabels={false}
      />
    </div>
  );
};

export default PieChart;
