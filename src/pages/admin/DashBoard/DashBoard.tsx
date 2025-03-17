import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  SearchInfo,
  WeekKey,
} from "./types";

// const generateData = (
//   id: DataKey,
//   min: number,
//   max: number,
//   days: number,
// ): ChartData => ({
//   id,
//   color: COLORS[id],
//   data: Array.from({ length: days }, (_, i) => ({
//     x: (i + 1).toString().padStart(2, "0"),
//     y: Math.floor(Math.random() * (max - min + 1)) + min,
//   })),
// });

const thisMonthData: ChartData[] = [
  // generateData("학원수", 50, 500, 31),
  // 결제내역 데이터는 API에서 가져올 예정
];

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

// 타입 정의 수정
interface DateSelection {
  year: number;
  month: number;
}

function DashBoard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<DataKey>(
    (searchParams.get("category") as DataKey) || "학원수",
  );
  const [selectedDate, setSelectedDate] = useState<DateSelection>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  });
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(
    (searchParams.get("pieCategory") as CategoryKey) || "최근 검색",
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState<WeekKey>("이번주");
  const [selectedData, setSelectedData] = useState<ChartData[]>(thisMonthData);
  const [notices, setNotices] = useState<BoardItem[]>([]);
  const maxValue =
    Math.ceil(
      Math.max(...selectedData.flatMap(d => d.data.map(point => point.y))) /
        100,
    ) * 100;
  const { userId, roleId } = useRecoilValue(userInfo);
  const [statsInfo, setStatsInfo] = useState<CostInfo>({
    costCount: 0,
    sumFee: 0,
    saleRate: 0,
  });

  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [academyApprovals, setAcademyApprovals] = useState<any[]>([]);

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

  const fetchApprovalData = async () => {
    try {
      if (roleId === 3) {
        // 학원 관리자용 API
        const response = await jwtAxios.get(
          `/api/academy-manager/GetUserInfoList/${userId}`,
        );
        setApprovalData(response.data.resultData);
      }
    } catch (error) {
      console.error("Error fetching approval data:", error);
      setApprovalData([]);
    }
  };

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
    if (roleId === 3) {
      fetchApprovalData();
    } else {
      fetchAcademyApprovals();
    }
  }, [roleId, userId]);

  useEffect(() => {
    setSearchParams({
      category: selectedItem,
      month: selectedDate.month.toString(),
      pieCategory: selectedCategory,
      week: selectedTimeRange,
    });
  }, [selectedItem, selectedDate.month, selectedCategory, selectedTimeRange]);

  const [userRegistrationData, setUserRegistrationData] = useState<ChartData[]>(
    [],
  );
  const [costData, setCostData] = useState<ChartData[]>([]);
  const [academyCountData, setAcademyCountData] = useState<ChartData[]>([]);

  // 년/월 선택 핸들러
  const handleYearMonthChange = (date: DateSelection) => {
    setSelectedDate(date);
  };

  // fetchUserRegistrationData 수정
  const fetchUserRegistrationData = async (date: DateSelection) => {
    try {
      const response = await jwtAxios.get(`/api/academy-manager/GetUserCount`, {
        params: {
          year: date.year,
          month: date.month,
        },
      });
      const { resultData } = response.data;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(date.year, date.month, 0).getDate();

      // 날짜 배열 생성 (초기값 0으로 설정)
      const allDaysData = Array.from({ length: daysInMonth }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트 (누적 계산)
      if (resultData && Array.isArray(resultData)) {
        let accumulatedCount = 0;

        // 날짜별 데이터를 객체로 변환하여 빠른 접근
        const dateMap = new Map(
          resultData.map(item => [
            parseInt(item.registerDate.split("-")[2]),
            item.totalUserCount,
          ]),
        );

        // 각 날짜에 대해 누적값 계산
        for (let day = 1; day <= daysInMonth; day++) {
          const dayCount = dateMap.get(day) || 0;
          accumulatedCount += dayCount;
          allDaysData[day - 1].y = accumulatedCount;
        }
      }

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
      // 에러 시 빈 데이터 설정
      const emptyData: ChartData = {
        id: "회원수",
        color: COLORS["회원수"],
        data: Array.from(
          { length: new Date(date.year, date.month, 0).getDate() },
          (_, index) => ({
            x: (index + 1).toString().padStart(2, "0"),
            y: 0,
          }),
        ),
      };
      setUserRegistrationData([emptyData]);
      if (selectedItem === "회원수") {
        setSelectedData([emptyData]);
      }
    }
  };

  // Add function to fetch cost data
  const fetchCostData = async (date: DateSelection) => {
    try {
      const response = await jwtAxios.get(
        `/api/academy-manager/GetAcademyCostCount`,
        {
          params: {
            year: date.year,
            month: date.month,
          },
        },
      );
      const { resultData } = response.data;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(date.year, date.month, 0).getDate();

      // 날짜 배열 생성
      const allDaysData = Array.from({ length: daysInMonth }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트
      if (resultData && Array.isArray(resultData)) {
        resultData.forEach((item: CostCountData) => {
          const day = parseInt(item.registerDate.split("-")[2]);
          if (day >= 1 && day <= daysInMonth) {
            allDaysData[day - 1].y = item.academyCostCount;
          }
        });
      }

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
      const maxDay = date.month === now.getMonth() + 1 ? now.getDate() : 31;

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
  const fetchAcademyCount = async (date: DateSelection) => {
    try {
      const response = await jwtAxios.get(
        `/api/academy-manager/GetAcademyCount`,
        {
          params: {
            year: date.year,
            month: date.month,
          },
        },
      );
      const { resultData } = response.data;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(date.year, date.month, 0).getDate();

      // 날짜 배열 생성
      const allDaysData = Array.from({ length: daysInMonth }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트
      if (resultData && Array.isArray(resultData)) {
        resultData.forEach((item: AcademyCountData) => {
          const day = parseInt(item.registerDate.split("-")[2]);
          if (day >= 1 && day <= daysInMonth) {
            allDaysData[day - 1].y = item.totalAcademyCount;
          }
        });
      }

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
      const maxDay = date.month === now.getMonth() + 1 ? now.getDate() : 31;

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
      await fetchAcademyCount(selectedDate);

      // 회원수 데이터 로드
      await fetchUserRegistrationData(selectedDate);

      // 결제내역 데이터 로드
      await fetchCostData(selectedDate);
    };

    loadInitialData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // useEffect 수정
  useEffect(() => {
    const loadMonthlyData = async () => {
      if (selectedItem === "학원수") {
        await fetchAcademyCount(selectedDate);
      } else if (selectedItem === "회원수") {
        await fetchUserRegistrationData(selectedDate);
      } else if (selectedItem === "결제내역") {
        await fetchCostData(selectedDate);
      }
    };

    loadMonthlyData();
  }, [selectedDate, selectedItem]);

  // 핸들러 함수들
  const handleTimeRangeClick = useCallback((e: { key: string }) => {
    setSelectedTimeRange(e.key as WeekKey);
  }, []);

  const handleCategoryClick = useCallback((e: { key: string }) => {
    if (e.key === "학원수" || e.key === "회원수" || e.key === "결제내역") {
      setSelectedItem(e.key as DataKey);
    }
  }, []);

  const handleCategoryClick2 = useCallback((e: { key: string }) => {
    if (pieChartData[e.key as CategoryKey]) {
      setSelectedCategory(e.key as CategoryKey);
    }
  }, []);

  // 메뉴 컴포넌트들을 useMemo로 메모이제이션
  const categoryMenu = useMemo(
    () => (
      <Menu onClick={handleCategoryClick}>
        <Menu.Item key="학원수">학원수</Menu.Item>
        <Menu.Item key="회원수">회원수</Menu.Item>
        <Menu.Item key="결제내역">결제내역</Menu.Item>
      </Menu>
    ),
    [handleCategoryClick],
  );

  const categoryMenu2 = useMemo(
    () => (
      <Menu onClick={handleCategoryClick2}>
        <Menu.Item key="최근 검색">최근검색</Menu.Item>
        <Menu.Item key="방문 통계">방문통계</Menu.Item>
      </Menu>
    ),
    [handleCategoryClick2],
  );

  const timeRangeMenu = useMemo(
    () => (
      <Menu onClick={handleTimeRangeClick}>
        <Menu.Item key="이번주">이번주</Menu.Item>
        <Menu.Item key="지난주">지난주</Menu.Item>
      </Menu>
    ),
    [handleTimeRangeClick],
  );

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

  // 공지사항 데이터를 가져오는 함수
  const fetchNotices = async () => {
    if (!userId) return;
    try {
      const response = await jwtAxios.get(`/api/board/list`, {
        params: {
          // userId: userId,
          userId: 1,
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
          <div className="w-full gap-0 border rounded-lg">
            <div className="flex justify-between w-full p-3 border-b items-center">
              <Dropdown overlay={categoryMenu} trigger={["click"]}>
                <Button type="text" className="flex justify-between w-[120px]">
                  {selectedItem} <DownOutlined />
                </Button>
              </Dropdown>
              <div className="flex gap-2">
                <Dropdown
                  overlay={
                    <Menu
                      onClick={e =>
                        handleYearMonthChange({
                          ...selectedDate,
                          year: Number(e.key),
                        })
                      }
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - i,
                      ).map(year => (
                        <Menu.Item key={year}>{year}년</Menu.Item>
                      ))}
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    size="small"
                    className="flex justify-between w-[100px]"
                  >
                    {selectedDate.year}년 <DownOutlined />
                  </Button>
                </Dropdown>
                <Dropdown
                  overlay={
                    <Menu
                      onClick={e =>
                        handleYearMonthChange({
                          ...selectedDate,
                          month: Number(e.key),
                        })
                      }
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        month => (
                          <Menu.Item key={month}>{month}월</Menu.Item>
                        ),
                      )}
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    size="small"
                    className="flex justify-between w-[80px]"
                  >
                    {selectedDate.month}월 <DownOutlined />
                  </Button>
                </Dropdown>
              </div>
            </div>

            <div style={{ height: "300px" }}>
              <LineChart
                selectedData={selectedData}
                selectedMonth={selectedDate.month.toString()}
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
        <AcademyApprovalList
          data={roleId === 3 ? approvalData : academyApprovals}
          roleId={roleId as number}
        />
        <ReportedUserList reportedUsers={reportedUsers} />
      </div>
    </div>
  );
}

export default DashBoard;
