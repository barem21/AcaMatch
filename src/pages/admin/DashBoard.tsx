import { ResponsiveLine } from "@nivo/line";
import { Button, Dropdown, Menu } from "antd";
import { useState } from "react";
import { DownOutlined } from "@ant-design/icons";

const COLORS = {
  학원수: "#F28C6A",
  회원수: "#6FCF97",
  결제내역: "#6AA7F9",
} as const;

// 데이터 타입 정의
type DataKey = keyof typeof COLORS; // "학원수" | "회원수" | "결제내역"
type MonthKey = "이번 달" | "지난 달";

interface DataPoint {
  x: string;
  y: number;
}

interface ChartData {
  id: DataKey;
  color: string;
  data: DataPoint[];
}

// 데이터 생성 함수 (이번 달, 지난 달 구분 추가)
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

// 이번 달 & 지난 달 데이터 생성
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

function DashBoard() {
  const [selectedData, setSelectedData] = useState<ChartData[]>(thisMonthData);
  const [selectedItem, setSelectedItem] = useState<string>("전체"); // 카테고리 선택
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>("이번 달"); // 이번 달/지난 달 선택

  // 카테고리 필터링
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

  // 이번 달 / 지난 달 필터링
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

  // 카테고리 선택 드롭다운
  const categoryMenu = (
    <Menu onClick={handleCategoryClick}>
      <Menu.Item key="전체">전체</Menu.Item>
      <Menu.Item key="학원수">학원수</Menu.Item>
      <Menu.Item key="회원수">회원수</Menu.Item>
      <Menu.Item key="결제내역">결제내역</Menu.Item>
    </Menu>
  );

  // 이번 달 / 지난 달 선택 드롭다운
  const monthMenu = (
    <Menu onClick={handleMonthClick}>
      <Menu.Item key="이번 달">이번 달</Menu.Item>
      <Menu.Item key="지난 달">지난 달</Menu.Item>
    </Menu>
  );

  return (
    <div className=" m-[10px] gap-5 w-full h-[430px] justify-center align-top">
      <div className="w-3/4">
        <h1 className="title-admin-font">
          주요 통계 및 요약
          <div className="flex">
            <p>결제 및 지출 관리 {"/"} </p> <p> &nbsp;대시보드</p>
          </div>
        </h1>

        <div className="board-wrap ">
          <div className="flex justify-between w-full p-3 border-b items-center ">
            {/* 카테고리 필터 */}
            <Dropdown overlay={categoryMenu} trigger={["click"]}>
              <Button type="text" className="flex justify-between w-[120px]">
                {selectedItem} <DownOutlined />
              </Button>
            </Dropdown>

            {/* 이번 달 / 지난 달 필터 */}
            <Dropdown overlay={monthMenu} trigger={["click"]}>
              <Button
                type="text"
                className="flex justify-between w-[120px]  "
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
              enablePoints={true}
              pointSize={8}
              pointBorderWidth={2}
              pointBorderColor={{ from: "color" }}
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
      <div className="w-full"></div>
    </div>
  );
}

export default DashBoard;
