import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";
import { useEffect, useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../../apis/jwt";
import userInfo from "../../../atoms/userInfo";
import AcademyApprovalList from "./AcademyApprovalList";
import LineChart from "./LineChart";
import NoticeList from "./NoticeList";
import PieChart from "./PieChart";
import ReportedUserList from "./ReportedUserList";
import Stats from "./Stats";
import {
  BoardItem,
  CategoryKey,
  ChartData,
  COLORS,
  CostCountData,
  CostInfo,
  DataKey,
  MonthKey,
  SearchInfo,
  UserCountData,
  WeekKey,
} from "./types";

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
  // 결제내역 데이터는 API에서 가져올 예정
];

// const lastMonthData: ChartData[] = [
//   generateData("학원수", 40, 450, 30),
//   // 결제내역 데이터는 API에서 가져올 예정
// ];

// const academyApprovals = [
//   { date: "2024-02-15", name: "서울 학원", status: "대기중" },
//   { date: "2024-02-16", name: "부산 학원", status: "대기중" },
//   { date: "2024-02-17", name: "대구 학원", status: "대기중" },
// ];

interface ReportedUser {
  email: string;
  name: string;
  reportsType: string;
  processingStatus: number;
  reportCount: number;
}

const pieChartData: Record<
  CategoryKey,
  Record<WeekKey, { id: string; label: string; value: number; color: string }[]>
> = {
  "최근 검색": {
    이번주: [], // Will be populated from API
    지난주: [], // Will be populated from API
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

interface AcademyCountData {
  registerDate: string;
  totalAcademyCount: number;
}

function DashBoard() {
  const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate();
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
  const [statsInfo, setStatsInfo] = useState<CostInfo>({
    costCount: 0,
    sumFee: 0,
    saleRate: 0,
  });

  const [academyApprovals, setAcademyApprovals] = useState<
    { date: string; name: string; status: string }[]
  >([]);

  const [reportedUsers, setReportedUsers] = useState<ReportedUser[]>([]);

  const statsData = [
    {
      id: 1,
      value: statsInfo?.sumFee ? `₩${statsInfo.sumFee.toLocaleString()}` : "₩0",
      label: "이번주 판매금액",
    },
    {
      id: 2,
      value:
        statsInfo?.costCount !== undefined ? `${statsInfo.costCount}건` : "0건",
      label: "결제 완료건 수",
    },
    {
      id: 3,
      value:
        statsInfo?.saleRate !== undefined
          ? `${(statsInfo.saleRate * 100).toFixed(1)}%`
          : "0%",
      label: "판매율",
    },
  ];

  const fetchAcademyApprovals = async () => {
    try {
      const response = await jwtAxios.get(
        "/api/academy/GetAcademyInfoByAcaNameClassNameExamNameAcaAgree",
        {
          params: { acaAgree: 0 },
        },
      );

      const { resultData } = response.data;

      const formattedData = resultData.map((academy: any) => ({
        date: academy.createdAt.split(" ")[0], // 날짜만 가져오기
        name: academy.acaName,
        status: "대기중", // 기본적으로 승인 대기 상태
      }));

      setAcademyApprovals(formattedData);
    } catch (error) {
      console.error("Error fetching academy approvals:", error);
    }
  };
  useEffect(() => {
    fetchAcademyApprovals();
  }, []);

  useEffect(() => {
    setSearchParams({
      category: selectedItem,
      month: selectedMonth,
      pieCategory: selectedCategory,
      week: selectedTimeRange,
    });
  }, [selectedItem, selectedMonth, selectedCategory, selectedTimeRange]);

  // Add state for user registration data
  const [userRegistrationData, setUserRegistrationData] = useState<ChartData[]>(
    [],
  );

  // Add state for cost data
  const [costData, setCostData] = useState<ChartData[]>([]);

  // Add state for academy count data
  const [academyCountData, setAcademyCountData] = useState<ChartData[]>([]);

  // Add function to fetch user registration data
  const fetchUserRegistrationData = async (period: MonthKey) => {
    try {
      const apiPeriod = period === "이번 달" ? "이번달" : "지난달";
      const response = await jwtAxios.get(
        `/api/academy-manager/GetUserCount/${apiPeriod}`,
      );
      const { resultData } = response.data;

      // 현재 날짜 정보 가져오기
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();

      // 목표 월 계산 (이번 달 또는 지난 달)
      const targetMonth =
        period === "이번 달" ? currentMonth : currentMonth - 1;
      const targetYear = currentYear;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

      // 이번 달의 경우 현재 날짜까지만, 지난 달의 경우 월말까지 표시
      const maxDay = period === "이번 달" ? currentDay : daysInMonth;

      // maxDay까지의 날짜 배열 생성 (초기값 0으로 설정)
      const allDaysData = Array.from({ length: maxDay }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트
      if (resultData && Array.isArray(resultData)) {
        resultData.forEach((item: UserCountData) => {
          const day = parseInt(item.registerDate.split("-")[2]);
          if (day >= 1 && day <= maxDay) {
            allDaysData[day - 1].y = item.totalUserCount;
          }
        });
      }

      // 차트 데이터 형식으로 변환
      const chartData: ChartData = {
        id: "회원수",
        color: COLORS["회원수"],
        data: allDaysData,
      };

      setUserRegistrationData([chartData]);

      if (selectedItem === "회원수") {
        setSelectedData([chartData]);
      }
    } catch (error) {
      console.error("Error fetching user registration data:", error);
      const now = new Date();
      const maxDay = period === "이번 달" ? now.getDate() : 31;

      const emptyData: ChartData = {
        id: "회원수",
        color: COLORS["회원수"],
        data: Array.from({ length: maxDay }, (_, index) => ({
          x: (index + 1).toString().padStart(2, "0"),
          y: 0,
        })),
      };
      setUserRegistrationData([emptyData]);
      if (selectedItem === "회원수") {
        setSelectedData([emptyData]);
      }
    }
  };

  // Add function to fetch cost data
  const fetchCostData = async (period: MonthKey) => {
    try {
      const apiPeriod = period === "이번 달" ? "이번달" : "지난달";
      const response = await jwtAxios.get(
        `/api/academy-manager/GetAcademyCostCount/${apiPeriod}`,
      );
      const { resultData } = response.data;

      // 현재 날짜 정보 가져오기
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();

      // 목표 월 계산 (이번 달 또는 지난 달)
      const targetMonth =
        period === "이번 달" ? currentMonth : currentMonth - 1;
      const targetYear = currentYear;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

      // 이번 달의 경우 현재 날짜까지만, 지난 달의 경우 월말까지 표시
      const maxDay = period === "이번 달" ? currentDay : daysInMonth;

      // maxDay까지의 날짜 배열 생성 (초기값 0으로 설정)
      const allDaysData = Array.from({ length: maxDay }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트
      if (resultData && Array.isArray(resultData)) {
        resultData.forEach((item: CostCountData) => {
          const day = parseInt(item.registerDate.split("-")[2]);
          if (day >= 1 && day <= maxDay) {
            allDaysData[day - 1].y = item.academyCostCount;
          }
        });
      }

      // 차트 데이터 형식으로 변환
      const chartData: ChartData = {
        id: "결제내역",
        color: COLORS["결제내역"],
        data: allDaysData,
      };

      setCostData([chartData]);

      if (selectedItem === "결제내역") {
        setSelectedData([chartData]);
      }
    } catch (error) {
      console.error("Error fetching cost data:", error);
      const now = new Date();
      const maxDay = period === "이번 달" ? now.getDate() : 31;

      const emptyData: ChartData = {
        id: "결제내역",
        color: COLORS["결제내역"],
        data: Array.from({ length: maxDay }, (_, index) => ({
          x: (index + 1).toString().padStart(2, "0"),
          y: 0,
        })),
      };
      setCostData([emptyData]);
      if (selectedItem === "결제내역") {
        setSelectedData([emptyData]);
      }
    }
  };

  // 학원 수 데이터를 가져오는 함수
  const fetchAcademyCount = async (period: MonthKey) => {
    try {
      const apiPeriod = period === "이번 달" ? "이번달" : "지난달";
      const response = await jwtAxios.get(
        `/api/academy-manager/GetAcademyCount/${apiPeriod}`,
      );
      const { resultData } = response.data;

      // 현재 날짜 정보 가져오기
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();

      // 목표 월 계산 (이번 달 또는 지난 달)
      const targetMonth =
        period === "이번 달" ? currentMonth : currentMonth - 1;
      const targetYear = currentYear;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

      // 이번 달의 경우 현재 날짜까지만, 지난 달의 경우 월말까지 표시
      const maxDay = period === "이번 달" ? currentDay : daysInMonth;

      // maxDay까지의 날짜 배열 생성 (초기값 0으로 설정)
      const allDaysData = Array.from({ length: maxDay }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트
      if (resultData && Array.isArray(resultData)) {
        resultData.forEach((item: AcademyCountData) => {
          const day = parseInt(item.registerDate.split("-")[2]);
          if (day >= 1 && day <= maxDay) {
            allDaysData[day - 1].y = item.totalAcademyCount;
          }
        });
      }

      // 차트 데이터 형식으로 변환
      const chartData: ChartData = {
        id: "학원수",
        color: COLORS["학원수"],
        data: allDaysData,
      };

      // 상태 업데이트
      setAcademyCountData([chartData]);

      if (selectedItem === "학원수") {
        setSelectedData([chartData]);
      }
    } catch (error) {
      console.error("Error fetching academy count data:", error);

      // 에러 발생 시 빈 데이터로 초기화
      const now = new Date();
      const maxDay = period === "이번 달" ? now.getDate() : 31;

      const emptyData: ChartData = {
        id: "학원수",
        color: COLORS["학원수"],
        data: Array.from({ length: maxDay }, (_, index) => ({
          x: (index + 1).toString().padStart(2, "0"),
          y: 0,
        })),
      };

      // 에러 상태 업데이트
      setAcademyCountData([emptyData]);
      if (selectedItem === "학원수") {
        setSelectedData([emptyData]);
      }
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      // 학원수 데이터 로드
      await fetchAcademyCount(selectedMonth);

      // 회원수 데이터 로드
      await fetchUserRegistrationData(selectedMonth);

      // 결제내역 데이터 로드
      await fetchCostData(selectedMonth);
    };

    loadInitialData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 월 변경 시 모든 데이터 다시 로드
  useEffect(() => {
    const loadMonthlyData = async () => {
      if (selectedItem === "학원수") {
        await fetchAcademyCount(selectedMonth);
      } else if (selectedItem === "회원수") {
        await fetchUserRegistrationData(selectedMonth);
      } else if (selectedItem === "결제내역") {
        await fetchCostData(selectedMonth);
      }
    };

    loadMonthlyData();
  }, [selectedMonth]);

  // handleCategoryClick 수정
  const handleCategoryClick = async (e: { key: string }) => {
    const newItem = e.key as DataKey;
    setSelectedItem(newItem);

    // 카테고리 변경 시 해당 데이터 로드
    if (newItem === "학원수") {
      await fetchAcademyCount(selectedMonth);
      setSelectedData(academyCountData);
    } else if (newItem === "회원수") {
      await fetchUserRegistrationData(selectedMonth);
      setSelectedData(userRegistrationData);
    } else if (newItem === "결제내역") {
      await fetchCostData(selectedMonth);
      setSelectedData(costData);
    }
  };

  // handleMonthClick 수정
  const handleMonthClick = async (e: { key: string }) => {
    const monthKey = e.key as MonthKey;
    setSelectedMonth(monthKey);

    // 월 변경 시 현재 선택된 카테고리의 데이터 로드
    if (selectedItem === "학원수") {
      await fetchAcademyCount(monthKey);
      setSelectedData(academyCountData);
    } else if (selectedItem === "회원수") {
      await fetchUserRegistrationData(monthKey);
      setSelectedData(userRegistrationData);
    } else if (selectedItem === "결제내역") {
      await fetchCostData(monthKey);
      setSelectedData(costData);
    }
  };

  // 데이터 변경 시 selectedData 업데이트
  useEffect(() => {
    if (selectedItem === "학원수") {
      setSelectedData(academyCountData);
    } else if (selectedItem === "회원수") {
      setSelectedData(userRegistrationData);
    } else if (selectedItem === "결제내역") {
      setSelectedData(costData);
    }
  }, [selectedItem, academyCountData, userRegistrationData, costData]);

  // Add state for search data
  const [searchData, setSearchData] = useState<
    Record<
      WeekKey,
      { id: string; label: string; value: number; color: string }[]
    >
  >({
    이번주: [],
    지난주: [],
  });

  // Add function to fetch search info
  const fetchSearchInfo = async (period: WeekKey) => {
    try {
      const response = await jwtAxios.get(
        `/api/academy/GetSearchInfo/${period}`,
      );
      const { resultData } = response.data;

      // Transform API data to chart format
      const colors = ["#377dff", "#A8C5FF", "#FFAA00"]; // Keep existing colors
      const chartData = resultData.map((item: SearchInfo, index: number) => ({
        id: item.tagName,
        label: item.tagName,
        value: item.tagCount,
        color: colors[index % colors.length],
      }));

      setSearchData(prev => ({
        ...prev,
        [period]: chartData,
      }));
    } catch (error) {
      console.error(`Error fetching search info for ${period}:`, error);
    }
  };

  // Add useEffect to fetch search data
  useEffect(() => {
    fetchSearchInfo("이번주");
    fetchSearchInfo("지난주");
  }, []);

  // Update pieData calculation
  const pieData =
    selectedCategory === "최근 검색"
      ? searchData[selectedTimeRange]
      : pieChartData[selectedCategory][selectedTimeRange];

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

  // Add function to fetch cost info
  const fetchCostInfo = async () => {
    try {
      const response = await jwtAxios.get(
        "/api/academyCost/getAcademyCostInfoByMonth",
      );
      const { resultData } = response.data;
      setStatsInfo(resultData);
    } catch (error) {
      console.error("Error fetching cost info:", error);
    }
  };

  // Add useEffect to fetch cost info
  useEffect(() => {
    fetchCostInfo();
  }, []);

  // 신고된 유저 목록 가져오기
  const fetchReportedUsers = async () => {
    try {
      const response = await jwtAxios.get("/api/reports/getUserList");
      if (response.data && response.data.resultData) {
        setReportedUsers(response.data.resultData);
        console.log("Reported users:", response.data.resultData); // 데이터 확인용 로그
      }
    } catch (error) {
      console.error("Error fetching reported users:", error);
      setReportedUsers([]); // 에러 시 빈 배열로 초기화
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchReportedUsers();
  }, []);

  return (
    <div className="box-border w-full max-w-full justify-center align-top">
      <h1 className="w-full font-bold text-xl pb-3">
        주요 통계 및 요약
        <div className="flex">
          <p>결제 및 지출 관리 {"/"} </p> <p>&nbsp;대시보드</p>
        </div>
      </h1>
      <div className="flex w-full">
        <div className="flex flex-col w-[calc(100%-362px)] mr-3 gap-[12px]">
          <div className="w-full gap-0 border rounded-lg ">
            <div className="flex justify-between w-full p-3 border-b items-center">
              <Dropdown overlay={categoryMenu} trigger={["click"]}>
                <Button type="text" className="flex justify-between w-[120px]">
                  {selectedItem} <DownOutlined />
                </Button>
              </Dropdown>

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
              <LineChart
                selectedData={selectedData}
                selectedMonth={selectedMonth}
                selectedItem={selectedItem}
                maxValue={maxValue}
              />
            </div>
          </div>
          <Stats statsData={statsData} />
        </div>

        <div className="flex-col w-[350px]">
          <div className="w-full justify-center mx-auto gap-0 border rounded-lg h-[320px] mb-[12px]">
            <div className="flex justify-between w-full p-3 border-b items-center">
              <Dropdown overlay={categoryMenu2} trigger={["click"]}>
                <Button type="text" className="flex justify-between w-[150px]">
                  {selectedCategory} <DownOutlined />
                </Button>
              </Dropdown>
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
            <PieChart pieData={pieData} />

            <div className="mt-2 flex justify-center items-center p-[8px] bg-[#F1F5FA] min-w-[350px] text-gray-700 text-sm gap-[12px] font-semibold">
              <CiCalendarDate size={"20px"} style={{ strokeWidth: 1 }} />
              {timePeriods[selectedTimeRange]}
            </div>
          </div>
          <NoticeList notices={notices} />
        </div>
      </div>

      <div className="flex mt-[12px]">
        <AcademyApprovalList academyApprovals={academyApprovals} />
        <ReportedUserList reportedUsers={reportedUsers} />
      </div>
    </div>
  );
}

export default DashBoard;
