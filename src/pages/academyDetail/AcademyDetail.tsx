import styled from "@emotion/styled";
import { message, Radio, Select, Spin } from "antd";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { Cookies } from "react-cookie";
import { FaFacebookF, FaLink, FaShare, FaXTwitter } from "react-icons/fa6";
import { GoStar, GoStarFill } from "react-icons/go";
import { SiNaver } from "react-icons/si";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import LikeButton from "../../components/button/LikeButton";
import MainButton from "../../components/button/MainButton";
import CustomModal from "../../components/modal/Modal";
import AcademyCalendar from "./AcademyCalendar";
import BookList from "./BookList";
import ClassList from "./ClassList";
import KakaoMap from "./KakaoMap";
import ReviewSection from "./ReviewSection";
import { AcademyData, Class, Review } from "./types";
import { AiTwotoneAlert } from "react-icons/ai";
import { SlArrowDown } from "react-icons/sl";

declare global {
  interface Window {
    kakao: any;
  }
}
// const usedRandomNumbers = new Set<number>();
const CustomScrollbar = styled.div`
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 7px; /* 세로 스크롤바의 너비 */
  }

  &::-webkit-scrollbar-track {
    /* background: #f1f1f1;  */
    background: none;
    border-radius: 10px; /* 스크롤바 트랙의 둥근 모서리 */
  }

  &::-webkit-scrollbar-thumb {
    background: #eee; /* 스크롤바 핸들의 색 */
    border-radius: 10px; /* 핸들의 둥근 모서리 */
    /* border: 3px solid #888; */
  }
`;

const CalendarWrap = styled.div`
  .css-v9iays .fc .fc-daygrid-day {
    height: auto !important;
  }
  .css-v9iays .fc .fc-daygrid-day-frame {
    min-height: 90px !important;
  }
`;

// Tailwind 스타일 상수
const styles = {
  container: "flex w-full",
  content: {
    wrapper: "flex flex-col gap-[12px] mt-[32px] relative max-[640px]:w-full",
    imageContainer: "flex items-center justify-center px-[16px] py-[12px]",
    image:
      "w-[928px] h-[320px] bg-gray-500 rounded-[12px] max-[640px]:w-full max-[640px]:h-[240px]",
    mainContent:
      "w-[940px] flex flex-col gap-[12px] mx-auto max-[640px]:w-full max-[640px]:items-center",
  },
  header: {
    wrapper:
      "flex h-[72px] px-[16px] py-[16px] max-[640px]:h-auto max-[640px]:justify-center",
    title: "font-bold text-3xl text-brand-default text-start",
  },
  tab: {
    container:
      "flex flex-row justify-between items-end h-[63px] sticky top-[64px] bg-white z-[10]",
    item: "cursor-pointer flex justify-center items-center w-[416px] min-w-[288px] h-[40px] border-b-2 max-[640px]:w-full max-[640px]:!min-w-10",
    activeTab: "border-brand-BTBlue",
    inactiveTab: "border-[#F0F0F0]",
    text: "text-[16px] leading-[40px] text-center",
    activeText: "font-bold text-brand-BTBlue",
    inactiveText: "text-[#666666]",
  },
  academy: {
    title:
      "h-[58px] flex justify-center items-center text-[24px] font-bold max-[640px]:w-full",
    description:
      "h-[36px] flex justify-center items-center text-[14px] text-[#507A95] max-[640px]:h-auto",
    content: "flex flex-col justify-center items-center text-[14px]",
    textContent: "text-[14px]items-center px-[16px] py-[12px] mb-[50px]",
  },
  stats: {
    container:
      "flex justify-center items-center p-5 gap-[130px] w-[960px] h-[94px] mb-[50px] border border-[#EEEEEE] rounded-[10px] max-[640px]:w-[96%] max-[640px]:gap-5 max-[640px]:flex-col max-[640px]:h-auto",
    rating: "flex items-center h-[50px] text-[32px] font-bold",
    ratingWrapper: "flex items-center gap-[10px]",
    statsWrapper:
      "flex flex-col items-center justify-between max-[640px]:flex-row max-[640px]:gap-8",
    statItem:
      "w-[200px] flex items-center justify-between max-[640px]:w-auto max-[640px]:gap-3",
    statLabel: "font-bold",
    statValue: "flex items-center text-[14px] text-[#507A95]",
  },
  section: {
    title: "text-[24px] font-bold flex items-center h-[70px]",
    map: "w-full h-[450px] mb-[100px] max-[640px]:h-auto max-[640px]:mb-0",
  },
};

// LinkModal props 타입 정의
interface LinkModalProps {
  acaId: string | null;
}

const LinkModal: React.FC<LinkModalProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setIsLink(true);

    try {
      // 현재 브라우저의 URL을 가져옴
      const currentURL = window.location.href;

      // Clipboard API 사용
      await navigator.clipboard.writeText(currentURL);
      message.success("링크가 복사되었습니다!");
    } catch (error) {
      console.error("링크 복사 실패:", error);

      // Clipboard API 지원이 안되는 경우, input을 활용한 복사
      try {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        message.success("링크가 복사되었습니다!");
      } catch (fallbackError) {
        console.error("대체 복사 실패:", fallbackError);
        message.error("링크 복사에 실패했습니다. 수동으로 복사해주세요.");
      }
    }
  };

  const snsSendProc = (type: string) => {
    const shareTitle = "학원 상세정보 공유하기";
    const currentURL = window.location.href;
    let href = "";

    switch (type) {
      case "FB":
        href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}&t=${encodeURIComponent(shareTitle)}`;
        break;
      case "TW":
        href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentURL)}`;
        break;
      case "NB":
        href = `https://share.naver.com/web/shareView?url=${encodeURIComponent(currentURL)}&title=${encodeURIComponent(shareTitle)}`;
        break;
    }

    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative inline-block">
      {/* 모달을 여는 버튼 */}
      <button
        onClick={e => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <FaShare color="#507A95" />
      </button>

      {/* 모달 */}
      {isOpen && (
        <div className="absolute right-0 flex justify-center items-center z-1">
          <div
            ref={modalRef}
            onClick={handleModalClick}
            className="bg-white p-5 rounded-lg shadow-lg w-64"
          >
            <h2 className="text-lg font-semibold mb-3">공유하기</h2>
            <div className="flex justify-around gap-3">
              <button onClick={() => snsSendProc("FB")}>
                <FaFacebookF className="text-blue-600 text-3xl" />
              </button>
              <button onClick={() => snsSendProc("TW")}>
                <FaXTwitter className="text-blue-400 text-3xl" />
              </button>
              <button onClick={() => snsSendProc("NB")}>
                <SiNaver className="text-green-500 text-3xl" />
              </button>
              <button onClick={handleCopy}>
                <FaLink
                  className={`text-gray-600 text-3xl ${isLink ? "text-green-400" : ""}`}
                />
              </button>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-gray-200 py-2 rounded-md"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// interface AcademyClass {
//   classId: number;
//   className: string;
//   classStartDate: string;
//   classEndDate: string;
//   classPrice: number;
//   productId: number;
// }

// BoardItem 인터페이스 수정
interface BoardItem {
  boardId: number;
  acaId?: number;
  acaName?: string;
  userId?: number;
  boardName: string;
  boardComment?: string;
  createdAt: string;
  name: string;
  totalCount?: number;
}

// ReportType 인터페이스 추가
interface ReportType {
  name: string;
  description: string;
}

// 후기 데이터 타입 업데이트
interface Review {
  reviewId: number;
  classId: number;
  className: string;
  acaId: number;
  userId: number;
  writerName: string;
  writerPic: string;
  comment: string;
  star: number;
  createdAt: string;
  myReviewCount: number;
  banReview: number;
  reviewPic: string;
}

const AcademyDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // const { search } = useLocation();

  const acaId = searchParams.get("id");
  const size = 10;

  const [academyData, setAcademyData] = useState<AcademyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [_address, setAddress] = useState("");
  const [likeCount, setLikeCount] = useState<number>(0);

  const [isLiked, setIsLiked] = useState<boolean>(false);

  const [selectClass, setSelectClass] = useState<number>(0);

  const currentUserInfo = useRecoilValue(userInfo);

  const cookies = new Cookies();
  const navigate = useNavigate();

  //리뷰를 위한 쿼리스트링
  // const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const reviewTab = searchParams.get("review");

  const [items, setItems] = useState([
    { label: "상세 학원정보", isActive: false },
    { label: "수업정보", isActive: false },
    { label: "후기 & 리뷰", isActive: false },
  ]);

  // 초기 탭 설정을 위한 useEffect 추가
  useEffect(() => {
    const updatedItems = items.map((item, idx) => ({
      ...item,
      isActive: reviewTab ? idx === 2 : idx === 0,
    }));
    setItems(updatedItems);
  }, [searchParams]);

  const checkIsAuthenticated = () => {
    const accessToken = cookies.get("accessToken");
    return !!accessToken; // accessToken이 존재하면 true, 없으면 false
  };

  const { userId, roleId } = useRecoilValue(userInfo); // Recoil에서 userId 가져오기

  // 스크롤 참조 추가
  const scrollRef = useRef<HTMLDivElement>(null);

  // 리뷰 관련 상태 제거
  // const [reviews, setReviews] = useState<Review[]>([]);
  // const [totalReviewCount, setTotalReviewCount] = useState(0);
  // const [reviewPage, setReviewPage] = useState(1);

  // 기존 미디어/일반 리뷰 상태도 제거
  // const [generalPage, setGeneralPage] = useState(1);
  // const [generalReviews, setGeneralReviews] = useState<Review[]>([]);
  // const [totalGeneralReviewCount, setTotalGeneralReviewCount] = useState(0);

  // const [mediaPage, setMediaPage] = useState(1);
  // const [mediaReviews, setMediaReviews] = useState<Review[]>([]);
  // const [totalMediaReviewCount, setTotalMediaReviewCount] = useState(0);

  // 리뷰 데이터 가져오는 함수 제거
  // const fetchReviews = async () => { ... }

  // 리뷰 페이지 변경 핸들러 제거
  // const handleReviewPageChange = (page: number) => { ... }

  const fetchData = async () => {
    try {
      const url = userId
        ? `/api/academy/getAcademyDetailAllInfo?signedUserId=${userId}&acaId=${acaId}`
        : `/api/academy/getAcademyDetailAllInfo?acaId=${acaId}`;

      const response = await jwtAxios.get(url);

      console.log(response.data.resultData);

      if (response.data.resultData) {
        const data = response.data.resultData;
        setAcademyData(data);
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
        if (data.addressDto?.address) {
          setAddress(data.addressDto.address);
        }
      }
    } catch (error) {
      console.error("Failed to fetch academy data:", error);
      setError("학원 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [acaId, userId]);

  const handleTabClick = (index: number) => {
    const updatedItems = items.map((item, idx) => ({
      ...item,
      isActive: idx === index,
    }));
    setItems(updatedItems);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    newParams.set("size", "10");

    if (index === 2) {
      newParams.set("review", "2");
    } else {
      newParams.delete("review");
    }

    setSearchParams(newParams);

    // 탭 클릭 시 상단으로 스크롤
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
      <>
        {Array(fullStars)
          .fill(<GoStarFill className="text-[#242424]" />)
          .map((star, index) => (
            <span key={`filled-${index}`}>{star}</span>
          ))}
        {Array(emptyStars)
          .fill(<GoStar className="text-[#242424]" />)
          .map((star, index) => (
            <span key={`empty-${index}`}>{star}</span>
          ))}
      </>
    );
  };

  const handleButton1Click = () => setIsModalVisible(false);

  // 수강신청 및 결제 처리 함수
  const handleButton2Click = async () => {
    if (!checkIsAuthenticated()) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
      return;
    }

    if (!selectClass) {
      message.error("수강할 강좌를 선택해주세요.");
      return;
    }

    try {
      // 선택된 클래스 찾기
      const selectedClassInfo = academyData?.classes.find(
        c => c.classId === selectClass,
      );

      if (!selectedClassInfo) {
        message.error("선택된 강좌 정보를 찾을 수 없습니다.");
        return;
      }

      // 결제 준비 요청
      const response = await jwtAxios.post("/api/payment/ready", {
        products: [
          {
            productId: selectedClassInfo.productId,
            quantity: 1,
          },
        ],
        userId: userId,
        joinClassId: selectClass,
      });

      if (response.data.resultData.next_redirect_pc_url) {
        // tid를 localStorage에 저장
        localStorage.setItem("paymentTid", response.data.resultData.tid);

        // 결제 창 열기
        window.open(
          response.data.resultData.next_redirect_pc_url,
          "KakaoPayment",
          "width=800,height=800",
        );

        setIsModalVisible(false);
      } else {
        localStorage.removeItem("paymentTid");
        message.error("결제 페이지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      localStorage.removeItem("paymentTid");
      message.error("결제 처리 중 오류가 발생했습니다.");
    }
  };

  const handleClassSelect = (classId: number) => {
    setSelectClass(classId);
  };

  // 수강 가능한 클래스만 필터링
  const availableClasses =
    academyData?.classes?.filter(
      classItem => classItem.userCertification === 0,
    ) || [];

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>("");

  // 신고 유형 목록 불러오기
  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        const response = await jwtAxios.get("/api/reports/reportsTypes");
        setReportTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch report types:", error);
      }
    };

    fetchReportTypes();
  }, []);

  // 신고 처리 함수 수정
  const handleReport = async () => {
    if (!selectedReportType) {
      message.error("신고 유형을 선택해주세요.");
      return;
    }

    if (!userId) {
      // alert("로그인이 필요한 서비스입니다.");
      navigate("/log-in");
      return;
    }

    try {
      await jwtAxios.post(`/api/reports/postReports`, null, {
        params: {
          reporter: userId,
          acaId: acaId,
          reportsType: selectedReportType,
        },
      });

      message.success("신고가 접수되었습니다.");
      setIsReportModalOpen(false);
      setSelectedReportType("");
    } catch (error) {
      console.error("신고 처리 중 오류가 발생했습니다:", error);
      // alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  // 공지사항 상태 수정
  const [academyNotices, setAcademyNotices] = useState<BoardItem[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [openNotices, setOpenNotices] = useState<number[]>([]);
  const [noticeDetails, setNoticeDetails] = useState<Record<number, BoardItem>>(
    {},
  );
  const [loadingNoticeIds, setLoadingNoticeIds] = useState<number[]>([]);

  // 공지사항 토글 함수 수정
  const toggleNotice = async (notice: BoardItem) => {
    const boardId = notice.boardId;

    // 이미 열려있는 경우 닫기
    if (openNotices.includes(boardId)) {
      setOpenNotices(prev => prev.filter(id => id !== boardId));
      return;
    }

    // 아직 상세 내용을 불러오지 않은 경우
    if (!noticeDetails[boardId]?.boardComment) {
      setLoadingNoticeIds(prev => [...prev, boardId]);

      try {
        const response = await jwtAxios.get(`/api/board`, {
          params: { boardId },
        });

        const detailData = response.data.resultData;
        setNoticeDetails(prev => ({
          ...prev,
          [boardId]: detailData,
        }));
      } catch (error) {
        console.error("Error fetching notice detail:", error);
        message.error("공지사항 상세 내용을 불러오는데 실패했습니다.");
      } finally {
        setLoadingNoticeIds(prev => prev.filter(id => id !== boardId));
      }
    }

    // 열린 공지사항 목록에 추가
    setOpenNotices(prev => [...prev, boardId]);
  };

  // 학원 공지사항 불러오는 함수 (기존 함수 유지)
  const fetchAcademyNotices = async () => {
    if (!acaId) return;

    setNoticeLoading(true);
    try {
      const params = {
        acaId: acaId,
        page: 1,
        size: 5, // 최근 5개 공지사항만 표시
      };

      const response = await jwtAxios.get(`/api/board/list`, { params });
      const { resultData } = response.data;

      const filteredData = resultData?.filter(
        (item: BoardItem | null): item is BoardItem => item !== null,
      );

      setAcademyNotices(filteredData || []);
    } catch (error) {
      console.error("Error fetching academy notices:", error);
    } finally {
      setNoticeLoading(false);
    }
  };

  // 학원 정보 로드 시 공지사항도 함께 로드
  useEffect(() => {
    if (acaId) {
      fetchAcademyNotices();
    }
  }, [acaId]);

  // 학원 데이터 업데이트 함수
  const fetchAcademyData = async () => {
    try {
      const url = userId
        ? `/api/academy/getAcademyDetailAllInfo?signedUserId=${userId}&acaId=${acaId}`
        : `/api/academy/getAcademyDetailAllInfo?acaId=${acaId}`;

      const response = await jwtAxios.get(url);

      console.log(response.data.resultData);

      if (response.data.resultData) {
        const data = response.data.resultData;
        setAcademyData(data);
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
        if (data.addressDto?.address) {
          setAddress(data.addressDto.address);
        }
      }
    } catch (error) {
      console.error("Failed to fetch academy data:", error);
      setError("학원 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* 로딩 중... */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!academyData) {
    return (
      <div className="flex justify-center items-center h-screen">
        학원 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={styles.container}>
      <div className={styles.content.wrapper}>
        <div className={styles.header.wrapper}>
          <h1 className={styles.header.title}>{academyData.acaName}</h1>
        </div>

        <div className={styles.tab.container}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`${styles.tab.item} ${
                item.isActive ? styles.tab.activeTab : styles.tab.inactiveTab
              }`}
              onClick={() => handleTabClick(index)}
            >
              <span
                className={`${styles.tab.text} ${
                  item.isActive
                    ? styles.tab.activeText
                    : styles.tab.inactiveText
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {items[0].isActive && (
          <div>
            <div className={styles.content.imageContainer}>
              <div className={styles.content.image}>
                {academyData.acaPic && (
                  <img
                    src={`http://112.222.157.157:5233/pic/academy/${academyData.acaId}/${academyData.acaPic}`}
                    alt={academyData.acaName}
                    className="w-full h-full object-cover rounded-[12px]"
                    // onError={e => {
                    // const target = e.target as HTMLImageElement;
                    // const randomNum = getRandomUniqueNumber();
                    // target.src = `/default_academy${randomNum}.jpg`;
                    // console.log(`/default_academy${randomNum}.jpg`);
                    // }}
                  />
                )}
              </div>
            </div>

            <div className={styles.content.mainContent}>
              <h2 className={`${styles.academy.title} relative`}>
                {academyData.acaName}
                <div className="flex items-center gap-2 text-2xl absolute right-[16px] top-[25px]">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center gap-1 text-[#507A95]"
                  >
                    <AiTwotoneAlert
                      size={20}
                      onClick={() => setIsReportModalOpen(true)}
                      className="cursor-pointer mb-[2px]"
                    />
                  </button>
                  <LinkModal acaId={acaId} />
                </div>
              </h2>
              <div className={styles.academy.description}>
                {academyData.addressDto?.address}{" "}
                {academyData.addressDto?.detailAddress}
              </div>
              <div className={styles.academy.description}>
                {academyData.acaPhone}
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(academyData.comments),
                }}
                className="text-[14px] mb-[50px] max-[640px]:pl-5 max-[640px]:pr-5"
              >
                {/* {academyData.comments} */}
              </div>

              <div className={styles.stats.container}>
                <div className={styles.stats.ratingWrapper}>
                  <div className={styles.stats.rating}>
                    {academyData.star.toFixed(1)}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-[2px] text-[14px] mt-[12px]">
                      {renderStars(academyData.star)}
                    </div>
                    <div className="text-[14px]">
                      {academyData.reviewCount} reviews
                    </div>
                  </div>
                </div>

                <div className={styles.stats.statsWrapper}>
                  <div className={styles.stats.statItem}>
                    <div className={`${styles.stats.statLabel} w-20`}>
                      <LikeButton
                        academyId={academyData.acaId}
                        initialIsLiked={isLiked}
                        onLikeChange={setIsLiked}
                        setLikeCount={setLikeCount}
                      />
                    </div>
                    <span className={styles.stats.statValue}>
                      {likeCount}명
                    </span>
                  </div>
                  <div className={styles.stats.statItem}>
                    <span className={styles.stats.statLabel}>
                      강사 수 &nbsp;
                    </span>
                    <span className={styles.stats.statValue}>
                      {academyData.teacherNum}명
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-[12px]">
                  {roleId === 3 ? (
                    <div className="w-[119px] h-[40px] text-[14px]"></div>
                  ) : (
                    <MainButton
                      className="w-[119px] h-[40px] text-[14px]"
                      onClick={() => {
                        if (!checkIsAuthenticated()) {
                          navigate("/log-in");
                          message.error("로그인이 필요한 서비스입니다.");
                          return;
                        }
                        navigate(
                          `/support/inquiry/detail?acaId=${academyData.acaId}&userId=${currentUserInfo.userId}`,
                        );
                      }}
                    >
                      학원 문의하기
                    </MainButton>
                  )}
                  {roleId === 3 ? (
                    <div className="w-[119px] h-[40px] text-[14px]"></div>
                  ) : (
                    <MainButton
                      className="w-[119px] h-[40px] text-[14px]"
                      onClick={() => {
                        if (!checkIsAuthenticated()) {
                          navigate("/log-in");
                          message.error("로그인이 필요한 서비스입니다.");
                          return;
                        }
                        setIsModalVisible(true);
                      }}
                      type="primary"
                    >
                      학원 신청하기
                    </MainButton>
                  )}
                </div>
              </div>

              <div className={styles.section.title}>학원 일정</div>
              <div className="mb-[50px]">
                <CalendarWrap>
                  <AcademyCalendar academyData={academyData} />
                </CalendarWrap>
              </div>

              {/* 공지사항 섹션 */}
              <div className={styles.section.title}>공지사항</div>
              <div className="mb-[50px] w-[100%] max-[640px]:w-[90%]">
                {noticeLoading ? (
                  <div className="flex justify-center items-center h-[100px]">
                    <Spin />
                  </div>
                ) : academyNotices.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    {academyNotices.map(notice => (
                      <div
                        key={notice.boardId}
                        className="border-b last:border-b-0 cursor-pointer"
                        onClick={() => toggleNotice(notice)}
                      >
                        <div className="py-4 px-[16px]">
                          <div className="flex items-start gap-2">
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-4">
                                  <h3 className="text-base font-medium">
                                    {notice.boardName}
                                  </h3>
                                  <span className="text-sm text-gray-500">
                                    {notice.createdAt}
                                  </span>
                                </div>
                                {loadingNoticeIds.includes(notice.boardId) ? (
                                  <Spin size="small" />
                                ) : (
                                  <SlArrowDown
                                    className={`transition-transform duration-200 ${
                                      openNotices.includes(notice.boardId)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`transition-all duration-200 overflow-hidden bg-brand-BTWhite ${
                            openNotices.includes(notice.boardId)
                              ? "max-h-[500px]"
                              : "max-h-0"
                          }`}
                        >
                          <div className="py-4 px-[16px]">
                            <div className="flex items-center gap-2">
                              {noticeDetails[notice.boardId]?.boardComment ? (
                                <div
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      noticeDetails[notice.boardId]
                                        .boardComment || "",
                                  }}
                                />
                              ) : (
                                <div className="text-sm text-gray-500">
                                  내용을 불러오는 중...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-[100px] border rounded-lg">
                    등록된 공지사항이 없습니다.
                  </div>
                )}
              </div>

              {/* 책 목록 섹션 추가 */}
              <BookList books={academyData?.books || []} />

              <div className={styles.section.title}>찾아 오시는 길</div>
              <div className={styles.section.map}>
                {academyData?.addressDto?.address ? (
                  <KakaoMap address={academyData.addressDto?.address} />
                ) : (
                  <div className="w-full h-[450px] flex items-center justify-center border border-gray-300 rounded-lg">
                    주소가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {items[1].isActive && (
          <ClassList classes={academyData.classes as Class[]} />
        )}

        {items[2].isActive && (
          <ReviewSection
            star={academyData?.star || 0}
            reviewCount={academyData?.reviewCount || 0}
            renderStars={renderStars}
            academyId={Number(acaId)}
            classes={academyData?.classes || []}
            onReviewUpdate={async () => {
              // 리뷰 업데이트 후 학원 데이터 다시 가져오기
              await fetchAcademyData();
            }}
          />
        )}
      </div>

      <CustomModal
        visible={isModalVisible}
        title="수강신청"
        content={
          <>
            <div className="flex flex-col gap-2 max-h-[2000px]">
              <CustomScrollbar>
                {availableClasses.length > 0 ? (
                  availableClasses.map(classItem => (
                    <Radio
                      key={classItem.classId}
                      checked={selectClass === classItem.classId}
                      onChange={() => handleClassSelect(classItem.classId)}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center line-clamp-1">
                          <p className="text-[16px] font-[400] line-clamp-1">
                            {classItem.className}{" "}
                          </p>
                          <p className="text-[14px] line-clamp-1 ml-2">
                            ({classItem.classStartDate}~{classItem.classEndDate}
                            )
                          </p>
                        </div>
                        <p className="text-[14px] text-[#507A95]">
                          수강료: {classItem.classPrice.toLocaleString()}원
                        </p>
                      </div>
                    </Radio>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    신청 가능한 클래스가 없습니다.
                  </div>
                )}
              </CustomScrollbar>
              {availableClasses.length > 0 && (
                <p className="mt-[15px]">
                  선택한 강좌를 수강신청 하시겠습니까?
                </p>
              )}
            </div>
          </>
        }
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text="취소"
        button2Text={availableClasses.length > 0 ? "결제하기" : "확인"}
        modalWidth={400}
      />

      <CustomModal
        visible={isReportModalOpen}
        title="학원 신고하기"
        content={
          <div className="flex flex-col gap-4 h-[104px]">
            <p className="text-sm text-gray-600">신고 유형을 선택해주세요.</p>
            <Select
              value={selectedReportType}
              onChange={value => setSelectedReportType(value)}
              placeholder="신고 유형 선택"
              style={{ width: "100%" }}
            >
              {reportTypes.map(type => (
                <Select.Option key={type.name} value={type.name}>
                  {type.name} - {type.description}
                </Select.Option>
              ))}
            </Select>
            {!selectedReportType && (
              <p className="text-red-500 text-sm">신고 유형을 선택해주세요.</p>
            )}
          </div>
        }
        onButton1Click={() => {
          setIsReportModalOpen(false);
          setSelectedReportType("");
        }}
        onButton2Click={handleReport}
        button1Text="취소"
        button2Text="신고하기"
        modalWidth={400}
      />
    </div>
  );
};

export default AcademyDetail;
