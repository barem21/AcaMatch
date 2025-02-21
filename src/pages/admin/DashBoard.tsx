import { DownOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { Button, Dropdown, Menu } from "antd";
import { useState } from "react";

const StyledDropdown = styled.div`
  /* background-color: #000; */
  .ant-dropdown-menu-item {
    font-size: 12px !important;
    padding: 6px 12px;
  }
`;

const COLORS = {
  학원수: "#F28C6A",
  회원수: "#6FCF97",
  결제내역: "#6AA7F9",
} as const;

type DataKey = keyof typeof COLORS;
type MonthKey = "이번 달" | "지난 달";
type WeekKey = "이번주" | "지난주";
type CategoryKey = "최근 검색" | "방문 통계";

interface DataPoint {
  x: string;
  y: number;
}

interface ChartData {
  id: DataKey;
  color: string;
  data: DataPoint[];
}

const generateData = (
  id: DataKey,
  min: number,
  max: number,
  days: number,
): ChartData => ({
  id,
  color: COLORS[id],
  data: Array.from({ length: days }, (_, i) => ({
    x: (i + 1).toString().padStart(2, "0"),
    y: Math.floor(Math.random() * (max - min + 1)) + min,
  })),
});

const thisMonthData: ChartData[] = [
  generateData("학원수", 50, 500, 31),
  generateData("회원수", 30, 400, 31),
  generateData("결제내역", 10, 350, 31),
];

const lastMonthData: ChartData[] = [
  generateData("학원수", 40, 450, 30),
  generateData("회원수", 20, 350, 30),
  generateData("결제내역", 5, 300, 30),
];

const chartData: Record<
  WeekKey,
  { id: string; label: string; value: number; color: string }[]
> = {
  이번주: [
    { id: "완료", label: "완료", value: 60, color: "#377dff" },
    { id: "미완료", label: "미완료", value: 40, color: "#A8C5FF" },
  ],
  지난주: [
    { id: "완료", label: "완료", value: 70, color: "#377dff" },
    { id: "미완료", label: "미완료", value: 30, color: "#A8C5FF" },
  ],
};

const pieChartData: Record<
  CategoryKey,
  Record<WeekKey, { id: string; label: string; value: number; color: string }[]>
> = {
  "최근 검색": {
    이번주: [
      { id: "검색1", label: "검색1", value: 40, color: "#377dff" },
      { id: "검색2", label: "검색2", value: 30, color: "#A8C5FF" },
      { id: "검색3", label: "검색3", value: 30, color: "#FFAA00" },
    ],
    지난주: [
      { id: "검색1", label: "검색1", value: 50, color: "#377dff" },
      { id: "검색2", label: "검색2", value: 30, color: "#A8C5FF" },
      { id: "검색3", label: "검색3", value: 20, color: "#FFAA00" },
    ],
  },
  "방문 통계": {
    이번주: [
      { id: "회원", label: "회원 방문", value: 70, color: "#6FCF97" },
      { id: "비회원", label: "비회원 방문", value: 30, color: "#EB5757" },
    ],
    지난주: [
      { id: "회원", label: "회원 방문", value: 60, color: "#6FCF97" },
      { id: "비회원", label: "비회원 방문", value: 40, color: "#EB5757" },
    ],
  },
};

const timePeriods: Record<WeekKey, string> = {
  이번주: "2025 02 12 ~ 2025 02 19",
  지난주: "2025 02 05 ~ 2025 02 11",
};

function DashBoard() {
  const [selectedData, setSelectedData] = useState<ChartData[]>(thisMonthData);
  const [selectedItem, setSelectedItem] = useState<string>("전체");
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>("이번 달");
  const [selectedTimeRange, setSelectedTimeRange] = useState<WeekKey>("이번주");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryKey>("최근 검색");

  const handleCategoryClick = (e: { key: string }) => {
    setSelectedItem(e.key);
    const dataSource =
      selectedMonth === "이번 달" ? thisMonthData : lastMonthData;
    setSelectedData(
      e.key === "전체"
        ? dataSource
        : dataSource.filter(d => d.id === (e.key as DataKey)),
    );
  };

  const handleMonthClick = (e: { key: string }) => {
    const monthKey = e.key as MonthKey;
    setSelectedMonth(monthKey);
    const dataSource = monthKey === "이번 달" ? thisMonthData : lastMonthData;
    setSelectedData(
      selectedItem === "전체"
        ? dataSource
        : dataSource.filter(d => d.id === (selectedItem as DataKey)),
    );
  };

  const categoryMenu = (
    <Menu onClick={handleCategoryClick}>
      <Menu.Item key="전체">전체</Menu.Item>
      <Menu.Item key="학원수">학원수</Menu.Item>
      <Menu.Item key="회원수">회원수</Menu.Item>
      <Menu.Item key="결제내역">결제내역</Menu.Item>
    </Menu>
  );

  const monthMenu = (
    <Menu onClick={handleMonthClick}>
      <Menu.Item key="이번 달">이번 달</Menu.Item>
      <Menu.Item key="지난 달">지난 달</Menu.Item>
    </Menu>
  );

  return (
    <StyledDropdown className="m-[10px] gap-5 w-full h-[430px] justify-center align-top">
      <h1 className="w-full title-admin-font">
        주요 통계 및 요약
        <div className="flex">
          <p>결제 및 지출 관리 {"/"} </p> <p>&nbsp;대시보드</p>
        </div>
      </h1>
      <div className="flex">
        <div className="w-3/4">
          <div className="board-wrap">
            <div className="flex justify-between w-full p-3 border-b items-center">
              {/* <StyledDropdown> */}
              <Dropdown overlay={categoryMenu} trigger={["click"]}>
                <Button type="text" className="flex justify-between w-[120px]">
                  {selectedItem} <DownOutlined />
                </Button>
              </Dropdown>
              {/* </StyledDropdown> */}

              <Dropdown overlay={monthMenu} trigger={["click"]}>
                <Button
                  type="text"
                  className="flex justify-between w-[120px]"
                  size="small"
                >
                  {selectedMonth} <DownOutlined />
                </Button>
              </Dropdown>
            </div>

            <div style={{ height: "400px" }}>
              <ResponsiveLine
                data={selectedData}
                margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
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
                }}
                colors={({ id }) => COLORS[id as DataKey]} // 타입 단언 추가
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
                    {point.data.y}
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div className="w-1/4">
          <div className="flex justify-between w-full p-3 border-b items-center">
            {/* 카테고리 선택 드롭다운 */}
            <Dropdown overlay={categoryMenu} trigger={["click"]}>
              <Button type="text" className="flex justify-between w-[150px]">
                {selectedCategory} <DownOutlined />
              </Button>
            </Dropdown>

            {/* 주 선택 드롭다운 */}
            <Button
              type="text"
              size="small"
              style={{ fontSize: "10px", padding: "2px 8px" }}
              className="flex justify-between w-[120px]"
            >
              {selectedTimeRange} <DownOutlined />
            </Button>
          </div>

          <div style={{ height: "250px" }}>
            <ResponsivePie
              data={pieChartData[selectedCategory][selectedTimeRange] || []}
              margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
              innerRadius={0.9}
              padAngle={2}
              cornerRadius={3}
              colors={({ data }) => data.color}
              enableArcLabels={false}
              // enableArcLinkLabels={false}
            />
          </div>

          <div className="mt-2 flex justify-center items-center text-gray-700 text-sm">
            {timePeriods[selectedTimeRange]}
          </div>
        </div>
      </div>
    </StyledDropdown>
  );
}

export default DashBoard;
