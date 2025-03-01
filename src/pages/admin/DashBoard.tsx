import { DownOutlined } from "@ant-design/icons";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { Button, Dropdown, Menu } from "antd";
import { useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import jwtAxios from "../../apis/jwt";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";

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

const academyApprovals = [
  { date: "2024-02-15", name: "서울 학원", status: "대기중" },
  { date: "2024-02-16", name: "부산 학원", status: "대기중" },
  { date: "2024-02-17", name: "대구 학원", status: "대기중" },
];

const reportedUsers = [
  { user: "user123", type: "욕설", count: 3, status: "미처리" },
  { user: "user456", type: "스팸", count: 5, status: "처리 완료" },
  { user: "user789", type: "부적절한 콘텐츠", count: 2, status: "미처리" },
];

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

// 이번 주와 지난 주의 날짜 범위를 동적으로 생성하는 함수
const getWeekRange = (weeksAgo: number = 0): string => {
  const now = new Date();
  const currentDay = now.getDay(); // 현재 요일 (0: 일요일, 1: 월요일, ... 6: 토요일)
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // 월요일까지의 차이 계산
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday - weeksAgo * 7); // 해당 주의 월요일

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // 해당 주의 일요일

  const formatDate = (date: Date) =>
    `${date.getFullYear()} ${String(date.getMonth() + 1).padStart(2, "0")} ${String(date.getDate()).padStart(2, "0")}`;

  return `${formatDate(monday)} ~ ${formatDate(sunday)}`;
};

const timePeriods: Record<WeekKey, string> = {
  이번주: getWeekRange(0),
  지난주: getWeekRange(1),
};

// BoardItem 인터페이스 추가
interface BoardItem {
  boardId: number;
  userId: number;
  boardName: string;
  createdAt: string;
  name: string;
  totalCount: number;
}

function DashBoard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<DataKey>(
    (searchParams.get("category") as DataKey) || "학원수",
  );
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(
    (searchParams.get("month") as MonthKey) || "이번 달",
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(
    (searchParams.get("pieCategory") as CategoryKey) || "최근 검색",
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState<WeekKey>(
    (searchParams.get("week") as WeekKey) || "이번주",
  );
  const [selectedData, setSelectedData] = useState<ChartData[]>(thisMonthData);
  const [notices, setNotices] = useState<BoardItem[]>([]);
  const maxValue =
    Math.ceil(
      Math.max(...selectedData.flatMap(d => d.data.map(point => point.y))) /
        100,
    ) * 100;
  const { userId } = useRecoilValue(userInfo);

  const statsData = [
    { id: 1, value: "₩1,200,000", label: "이번주 판매금액" },
    { id: 2, value: "85건", label: "결제 완료건 수" },
    { id: 3, value: "72%", label: "판매율" },
  ];

  useEffect(() => {
    setSearchParams({
      category: selectedItem,
      month: selectedMonth,
      pieCategory: selectedCategory,
      week: selectedTimeRange,
    });
  }, [selectedItem, selectedMonth, selectedCategory, selectedTimeRange]);

  const handleCategoryClick = (e: { key: string }) => {
    setSelectedItem(e.key as DataKey);
    const dataSource =
      selectedMonth === "이번 달" ? thisMonthData : lastMonthData;
    setSelectedData(dataSource.filter(d => d.id === (e.key as DataKey)));
  };

  const pieData = pieChartData[selectedCategory]?.[selectedTimeRange] || [];

  const handleMonthClick = (e: { key: string }) => {
    const monthKey = e.key as MonthKey;
    setSelectedMonth(monthKey);
    const dataSource = monthKey === "이번 달" ? thisMonthData : lastMonthData;
    setSelectedData(dataSource.filter(d => d.id === (selectedItem as DataKey)));
  };
  // ResponsivePie용 카테고리 선택 이벤트
  const handleCategoryClick2 = (e: { key: string }) => {
    console.log("선택된 카테고리:", e.key);
    if (pieChartData[e.key as CategoryKey]) {
      setSelectedCategory(e.key as CategoryKey);
    } else {
      console.warn(`잘못된 카테고리 선택: ${e.key}`);
    }
  };

  const categoryMenu = (
    <Menu onClick={handleCategoryClick}>
      <Menu.Item key="학원수">학원수</Menu.Item>
      <Menu.Item key="회원수">회원수</Menu.Item>
      <Menu.Item key="결제내역">결제내역</Menu.Item>
    </Menu>
  );

  const categoryMenu2 = (
    <Menu onClick={handleCategoryClick2}>
      <Menu.Item key="최근 검색">최근검색</Menu.Item>
      <Menu.Item key="방문 통계">방문통계</Menu.Item>
    </Menu>
  );

  const monthMenu = (
    <Menu onClick={handleMonthClick}>
      <Menu.Item key="이번 달">이번 달</Menu.Item>
      <Menu.Item key="지난 달">지난 달</Menu.Item>
    </Menu>
  );

  const handleTimeRangeClick = (e: { key: string }) => {
    setSelectedTimeRange(e.key as WeekKey);
  };

  const timeRangeMenu = (
    <Menu onClick={handleTimeRangeClick}>
      <Menu.Item key="이번주">이번주</Menu.Item>
      <Menu.Item key="지난주">지난주</Menu.Item>
    </Menu>
  );

  // 공지사항 데이터를 가져오는 함수
  const fetchNotices = async () => {
    if (!userId) return;
    try {
      const response = await jwtAxios.get(`/api/board/list`, {
        params: {
          userId: userId,
          page: 1,
          size: 3,
        },
      });
      console.log(response.data);

      const { resultData } = response.data;
      const filteredData = resultData
        .filter((item: BoardItem | null): item is BoardItem => item !== null)
        .slice(0, 3); // 최대 3개로 제한

      setNotices(filteredData);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [userId]);

  useEffect(() => {
    console.log("선택된 카테고리:", selectedCategory);
    console.log("선택된 시간 범위:", selectedTimeRange);
    console.log("차트 데이터:", pieData);

    setSelectedData(selectedData.filter(data => data.id === "학원수"));
  }, []);

  return (
    <div className="box-border m-[5px] mt-0 gap-5 w-full max-w-full h-[430px] justify-center align-top">
      <h1 className="w-full font-bold text-xl pb-3">
        주요 통계 및 요약
        <div className="flex">
          <p>결제 및 지출 관리 {"/"} </p> <p>&nbsp;대시보드</p>
        </div>
      </h1>
      <div className="flex gap-[12px] w-full">
        <div className="flex flex-col w-[calc(100%-412px)] gap-[12px]">
          <div className="w-full gap-0 border rounded-lg ">
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

            <div style={{ height: "300px" }}>
              <ResponsiveLine
                key={`${selectedMonth}-${selectedItem}`}
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
            </div>
          </div>
          <ul className="flex gap-[12px]">
            {statsData?.map(item => (
              <li
                key={item.id}
                className="flex flex-col w-full h-[80px] rounded-lg justify-center items-center border border-[#E3EBF6]"
              >
                <span className="text-[18px] font-semibold">{item.value}</span>
                {item.label && (
                  <span className="text-[#A4ABC5] text-[13px]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-col w-[calc(100%-1193px)] max-w-[394px] 2xl:max-w-[402px]">
          <div className="w-full mx-auto gap-0 border rounded-lg h-[320px] mb-[12px]">
            {/* <div className="w-[394px] mx-auto gap-0 border rounded-lg h-[320px] mb-[12px]"> */}
            <div className="flex justify-between w-full p-3 border-b items-center">
              {/* 카테고리 선택 드롭다운 */}
              <Dropdown overlay={categoryMenu2} trigger={["click"]}>
                <Button type="text" className="flex justify-between w-[150px]">
                  {selectedCategory} <DownOutlined />
                </Button>
              </Dropdown>
              {/* 주 선택 드롭다운 */}
              <Dropdown overlay={timeRangeMenu} trigger={["click"]}>
                <Button
                  type="text"
                  size="small"
                  style={{ fontSize: "10px", padding: "2px 8px" }}
                  className="flex justify-between w-[120px]"
                >
                  {selectedTimeRange} <DownOutlined />
                </Button>
              </Dropdown>
            </div>

            <div style={{ height: "200px" }}>
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

            <div className="mt-2 flex justify-center items-center p-[8px] bg-[#F1F5FA] text-gray-700 text-sm gap-[12px] font-semibold">
              <CiCalendarDate size={"20px"} style={{ strokeWidth: 1 }} />
              {timePeriods[selectedTimeRange]}
            </div>
          </div>
          <div className="border rounded-lg h-[120px]">
            <div>
              <ul className="flex mx-auto w-[350px] h-[30px] bg-[#F1F5FA]">
                <li className="flex justify-center items-center w-[200px]">
                  공지사항
                </li>
                <li className="flex justify-center items-center w-[200px]">
                  일시
                </li>
              </ul>
              {notices.map((notice, index) => (
                <ul key={index} className="flex mx-auto w-[350px] h-[30px]">
                  <li className="flex justify-center items-center w-[200px]">
                    <span
                      className="truncate max-w-[180px]"
                      title={notice.boardName}
                    >
                      {notice.boardName}
                    </span>
                  </li>
                  <li className="flex justify-center items-center w-[200px]">
                    {notice.createdAt}
                  </li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-[12px] gap-[12px] ">
        <div className="w-full border border-b-[0] rounded-[4px]">
          <span className="flex p-4 items-center w-full h-[47px] text-[#303E67] border-b">
            학원 승인 대기
          </span>
          <ul className="flex mx-auto w-full h-[30px] bg-[#F1F5FA] ">
            <li className="flex justify-center items-center w-full text-[#303E67]">
              날짜
            </li>
            <li className="flex justify-center items-center w-full text-[#303E67]">
              학원 명
            </li>
            <li className="flex justify-center items-center w-full text-[#303E67]">
              요청상태
            </li>
          </ul>

          {academyApprovals.map((item, index) => (
            <ul key={index} className="flex mx-auto w-full h-[30px] border-b">
              <li className="flex justify-center items-center w-1/3 text-[#242424]">
                {item.date}
              </li>
              <li className="flex justify-center items-center w-1/3 text-[#242424]">
                {item.name}
              </li>

              <li className="flex justify-center items-center w-1/3 text-[#242424]">
                <p className="w-full max-w-[80px] pb-[1px] rounded-md bg-[#90b1c4] text-white text-[12px] text-center">
                  {item.status}
                </p>
              </li>
            </ul>
          ))}
        </div>
        <div className="w-full border border-b-[0] rounded-[4px]">
          <span className="flex p-4 items-center w-full h-[47px] border-b">
            신고된 유저 목록
          </span>
          <ul className="flex mx-auto w-full h-[30px] bg-[#F1F5FA]">
            <li className="flex justify-center items-center w-full text-[#303E67]">
              유저정보
            </li>
            <li className="flex justify-center items-center w-full text-[#303E67]">
              신고 유형
            </li>
            <li className="flex justify-center items-center w-full text-[#303E67]">
              신고 횟수
            </li>
            <li className="flex justify-center items-center w-full text-[#303E67]">
              처리상태
            </li>
          </ul>
          {reportedUsers.map((user, index) => (
            <ul key={index} className="flex mx-auto w-full h-[30px] border-b">
              <li className="flex justify-center items-center w-1/4 text-[#242424]">
                {user.user}
              </li>
              <li className="flex justify-center items-center w-1/4 text-[#242424]">
                {user.type}
              </li>
              <li className="flex justify-center items-center w-1/4 text-[#242424]">
                {user.count}
              </li>
              <li className="flex justify-center items-center w-1/4 text-[#242424]">
                {user.status}
              </li>
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
