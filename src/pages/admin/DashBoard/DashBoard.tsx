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
  // CostCountData,
  CostInfo,
  DataKey,
  SearchInfo,
  // WeekKey,
} from "./types";
import AttendanceList from "./AttendanceList";

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

// pieChartData 정의를 수정
const pieChartData: Record<
  CategoryKey,
  Record<WeekKey, { id: string; label: string; value: number; color: string }[]>
> = {
  "최근 태그": {
    이번주: [], // 문자열 키를 명시적으로 지정
    지난주: [], // 문자열 키를 명시적으로 지정
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

// WeekKey 타입도 명시적으로 정의
type WeekKey = "이번주" | "지난주";

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
  const { userId, roleId } = useRecoilValue(userInfo);

  // 선택 가능한 항목 배열을 상단으로 이동
  const selectableItems =
    roleId === 3 ? ["회원수", "결제내역"] : ["학원수", "회원수", "결제내역"];

  const [selectedItem, setSelectedItem] = useState<DataKey>(
    (searchParams.get("category") as DataKey) || "학원수",
  );

  // LineChart용 날짜 선택 상태
  const [selectedDate, setSelectedDate] = useState<DateSelection>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  });

  // PieChart용 날짜 선택 상태 추가
  const [selectedPieDate, setSelectedPieDate] = useState<DateSelection>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  });

  const [selectedCategory, _setSelectedCategory] =
    useState<CategoryKey>("최근 태그");
  const [selectedTimeRange, _setSelectedTimeRange] =
    useState<WeekKey>("이번주");
  const [selectedData, setSelectedData] = useState<ChartData[]>(thisMonthData);
  const [notices, setNotices] = useState<BoardItem[]>([]);
  const maxValue =
    Math.ceil(
      Math.max(...selectedData.flatMap(d => d.data.map(point => point.y))) /
        100,
    ) * 100;
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
      label: "이번달 판매금액",
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

  const [searchData, setSearchData] = useState<
    { id: string; label: string; value: number; color: string }[]
  >([]);

  const fetchApprovalData = async () => {
    try {
      if (roleId === 3) {
        // 학원 관리자용 API
        const response = await jwtAxios.get(
          `/api/academy-manager/GetUserInfoList?userId=${userId}&page=1&size=6`,
        );
        // console.log("ddd:", response.data.resultData);

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
      pieMonth: selectedPieDate.month.toString(),
      pieYear: selectedPieDate.year.toString(),
      pieCategory: selectedCategory,
      week: selectedTimeRange,
    });
  }, [
    selectedItem,
    selectedDate.month,
    selectedPieDate.year,
    selectedPieDate.month,
    selectedCategory,
    selectedTimeRange,
  ]);

  const [userRegistrationData, setUserRegistrationData] = useState<ChartData[]>(
    [],
  );
  const [costData, setCostData] = useState<ChartData[]>([]);
  const [academyCountData, setAcademyCountData] = useState<ChartData[]>([]);

  // 년/월 선택 핸들러 - LineChart용
  const handleYearMonthChange = (date: DateSelection) => {
    setSelectedDate(date);
  };

  // 년/월 선택 핸들러 - PieChart용
  const handlePieYearMonthChange = (date: DateSelection) => {
    setSelectedPieDate(date);
  };

  // fetchUserRegistrationData 수정
  const fetchUserRegistrationData = async (date: DateSelection) => {
    try {
      // roleId에 따라 다른 API 엔드포인트 사용
      const endpoint =
        roleId === 3
          ? `/api/academy-manager/GetUserCountByUserId`
          : `/api/academy-manager/GetUserCount`;
      // console.log(roleId);

      const params: any = {
        year: date.year,
        month: date.month,
      };

      // roleId가 3일 때 userId 파라미터 추가
      if (roleId === 3) {
        params.userId = userId;
      }

      const response = await jwtAxios.get(endpoint, { params });
      const { resultData } = response.data;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(date.year, date.month, 0).getDate();

      // 날짜 배열 생성 (초기값 0으로 설정)
      const allDaysData = Array.from({ length: daysInMonth }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트
      if (resultData && Array.isArray(resultData)) {
        // roleId에 따라 다른 데이터 구조 처리
        if (roleId === 3) {
          // 새 API 응답 구조 처리 (paymentDate, paymentCount)
          resultData.forEach(item => {
            const day = parseInt(item.paymentDate.split("-")[2]);
            if (day > 0 && day <= daysInMonth) {
              const index = day - 1;
              allDaysData[index].y = item.paymentCount;
            }
          });
        } else {
          // 새 API 응답 구조 처리 (registerDate, totalUserCount)
          resultData.forEach(item => {
            const day = parseInt(item.registerDate.split("-")[2]);
            if (day > 0 && day <= daysInMonth) {
              const index = day - 1;
              allDaysData[index].y = item.totalUserCount;
            }
          });
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

  const fetchPaymentData = async (date: DateSelection) => {
    try {
      // roleId에 따라 다른 API 엔드포인트 사용
      let endpoint;
      const params: any = {
        year: date.year,
        month: date.month,
      };

      if (roleId === 3) {
        endpoint = `/api/academy-manager/GetAcademyCostByUserId`;
        params.userId = userId;
      } else {
        // 새로운 엔드포인트 사용
        endpoint = `/api/academy-manager/GetAcademyCostCount`;
      }

      const response = await jwtAxios.get(endpoint, { params });
      const { resultData } = response.data;

      // 해당 월의 총 일수 계산
      const daysInMonth = new Date(date.year, date.month, 0).getDate();

      // 날짜 배열 생성 (초기값 0으로 설정)
      const allDaysData = Array.from({ length: daysInMonth }, (_, index) => ({
        x: (index + 1).toString().padStart(2, "0"),
        y: 0,
      }));

      // API 응답 데이터로 실제 값 업데이트
      if (resultData && Array.isArray(resultData)) {
        if (roleId === 3) {
          // 기존 로직 유지
          resultData.forEach(item => {
            const day = parseInt(item.paymentDate.split("-")[2]);
            if (day > 0 && day <= daysInMonth) {
              const index = day - 1;
              allDaysData[index].y = item.paymentCount;
            }
          });
        } else {
          // 새 API 응답 구조 처리 (GetAcademyCostCount 엔드포인트)
          resultData.forEach(item => {
            const day = parseInt(item.registerDate.split("-")[2]);
            if (day > 0 && day <= daysInMonth) {
              const index = day - 1;
              allDaysData[index].y = item.academyCostCount; // 응답 구조에 맞게 조정
            }
          });
        }
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
      console.error("Error fetching payment data:", error);
      // 에러 시 빈 데이터 설정
      const emptyData: ChartData = {
        id: "결제내역",
        color: COLORS["결제내역"],
        data: Array.from(
          { length: new Date(date.year, date.month, 0).getDate() },
          (_, index) => ({
            x: (index + 1).toString().padStart(2, "0"),
            y: 0,
          }),
        ),
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
      if (roleId !== 3) {
        await fetchAcademyCount(selectedDate);
      }

      // 회원수 데이터 로드
      await fetchUserRegistrationData(selectedDate);

      // 결제내역 데이터 로드
      await fetchPaymentData(selectedDate);

      // roleId에 따라 초기 선택 항목 설정
      if (roleId === 3) {
        setSelectedItem("회원수");
        setSelectedData(userRegistrationData);
      } else {
        // 기본 선택 항목에 따른 데이터 설정
        if (selectedItem === "학원수") {
          setSelectedData(academyCountData);
        } else if (selectedItem === "회원수") {
          setSelectedData(userRegistrationData);
        } else if (selectedItem === "결제내역") {
          setSelectedData(costData);
        }
      }
    };

    loadInitialData();
  }, [roleId]); // roleId가 변경될 때마다 실행

  // useEffect 수정
  useEffect(() => {
    const loadMonthlyData = async () => {
      if (selectedItem === "학원수") {
        await fetchAcademyCount(selectedDate);
      } else if (selectedItem === "회원수") {
        await fetchUserRegistrationData(selectedDate);
      } else if (selectedItem === "결제내역") {
        await fetchPaymentData(selectedDate);
      }
    };

    loadMonthlyData();
  }, [selectedDate, selectedItem]);

  const handleCategoryClick = useCallback((e: { key: string }) => {
    if (e.key === "학원수" || e.key === "회원수" || e.key === "결제내역") {
      setSelectedItem(e.key as DataKey);
    }
  }, []);

  // const handleCategoryClick2 = useCallback((e: { key: string }) => {
  //   if (pieChartData[e.key as CategoryKey]) {
  //     setSelectedCategory(e.key as CategoryKey);
  //   }
  // }, []);

  // 메뉴 컴포넌트들을 useMemo로 메모이제이션
  const categoryMenu = useMemo(
    () => (
      <Menu onClick={handleCategoryClick}>
        {selectableItems.map(item => (
          <Menu.Item key={item}>{item}</Menu.Item>
        ))}
      </Menu>
    ),
    [handleCategoryClick, selectableItems],
  );

  // const categoryMenu2 = useMemo(
  //   () => (
  //     <Menu onClick={handleCategoryClick2}>
  //       <Menu.Item key="최근 태그">최근 태그</Menu.Item>
  //       {/* <Menu.Item key="방문 통계">방문통계</Menu.Item> */}
  //     </Menu>
  //   ),
  //   [handleCategoryClick2],
  // );

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

  // 수정된 fetchSearchInfo 함수 - PieChart용 날짜 사용
  const fetchSearchInfo = async (date: DateSelection) => {
    try {
      const response = await jwtAxios.get(`/api/academy/GetSearchInfo`, {
        params: {
          year: date.year,
          month: date.month,
        },
      });
      const { resultData } = response.data;

      // 데이터 변환 및 정렬 (상위 3개만 선택)
      const colors = ["#377dff", "#A8C5FF", "#FFAA00"];
      const chartData = resultData
        .slice(0, 3) // 상위 3개만 선택
        .map((item: SearchInfo, index: number) => ({
          id: item.tagName,
          label: item.tagName,
          value: item.tagCount,
          color: colors[index % colors.length],
        }))
        .sort((a: SearchInfo, b: SearchInfo) => b.tagCount - a.tagCount); // 값이 큰 순서대로 정렬

      // console.log("Transformed Search Data:", chartData); // 데이터 확인용
      setSearchData(chartData);
    } catch (error) {
      console.error(`Error fetching search info:`, error);
      setSearchData([]);
    }
  };

  // pieData 계산 로직 수정
  const pieData = useMemo(() => {
    // console.log("Selected Category:", selectedCategory); // 디버깅용
    // console.log("Search Data:", searchData); // 디버깅용

    if (selectedCategory === "최근 태그") {
      return searchData.length > 0 ? searchData : [];
    }
    return pieChartData[selectedCategory]?.[selectedTimeRange] || [];
  }, [selectedCategory, selectedTimeRange, searchData]);

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
      // console.log(response.data);

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
    // console.log("선택된 카테고리:", selectedCategory);
    // console.log("선택된 시간 범위:", selectedTimeRange);
    // console.log("차트 데이터:", pieData);

    setSelectedData(selectedData.filter(data => data.id === "학원수"));
  }, []);

  const fetchCostInfo = async () => {
    try {
      // roleId에 따라 다른 API 엔드포인트 사용
      let endpoint;

      // console.log(roleId);

      if (roleId === 3) {
        // 학원 관리자용 API
        endpoint = `/api/academy-manager/GetAcademyCostInfoByUserId/${userId}`;
      } else {
        // 사이트 관리자용 API
        endpoint = "/api/academyCost/getAcademyCostInfoByMonth";
      }

      const response = await jwtAxios.get(endpoint);
      const { resultData } = response.data;
      setStatsInfo(resultData);
    } catch (error) {
      console.error("Error fetching cost info:", error);
    }
  };

  useEffect(() => {
    fetchCostInfo();
  }, [roleId]);

  // 신고된 유저 목록 가져오기
  const fetchReportedUsers = async () => {
    try {
      const response = await jwtAxios.get("/api/reports/getUserList");
      if (response.data && response.data.resultData) {
        setReportedUsers(response.data.resultData);
        // console.log("Reported users:", response.data.resultData); // 데이터 확인용 로그
      }
    } catch (error) {
      console.error("에러:", error);
      setReportedUsers([]); // 에러 시 빈 배열로 초기화
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchReportedUsers();
  }, []);

  // roleId가 3일 때 학원수에서 회원수로 변경하는 useEffect 수정
  useEffect(() => {
    if (roleId === 3 && selectedItem === "학원수") {
      setSelectedItem("회원수");
    }
  }, [roleId]);

  // useEffect 추가 - 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchSearchInfo(selectedPieDate);
  }, [selectedPieDate]); // selectedPieDate가 변경될 때마다 데이터 새로 로드

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
              {/* <Dropdown overlay={categoryMenu2} trigger={["click"]}> */}
              {/* <Button type="text" className="flex justify-between w-[120px]"> */}
              <p className="flex justify-center items-center text-[14px] h-[32px]">
                최근 태그
              </p>
              {/* {selectedCategory} <DownOutlined /> */}
              {/* </Button> */}
              {/* </Dropdown> */}
              <div className="flex gap-3">
                <Dropdown
                  overlay={
                    <Menu
                      onClick={e =>
                        handlePieYearMonthChange({
                          ...selectedPieDate,
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
                    style={{ fontSize: "10px", padding: "2px 8px" }}
                  >
                    {selectedPieDate.year}년 <DownOutlined />
                  </Button>
                </Dropdown>
                <Dropdown
                  overlay={
                    <Menu
                      onClick={e =>
                        handlePieYearMonthChange({
                          ...selectedPieDate,
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
                    style={{ fontSize: "10px", padding: "2px 8px" }}
                  >
                    {selectedPieDate.month}월 <DownOutlined />
                  </Button>
                </Dropdown>
              </div>
            </div>
            <PieChart pieData={pieData.length > 0 ? pieData : []} />

            <div className="mt-2 flex justify-center items-center p-[8px] bg-[#F1F5FA] min-w-[350px] text-gray-700 text-sm gap-[12px] font-semibold">
              <CiCalendarDate size={"20px"} style={{ strokeWidth: 1 }} />
              {`${selectedPieDate.year}년 ${selectedPieDate.month}월`}
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
        {roleId === 3 ? (
          <AttendanceList userId={userId as number} />
        ) : (
          <ReportedUserList reportedUsers={reportedUsers} />
        )}
      </div>
    </div>
  );
}

export default DashBoard;
