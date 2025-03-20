import styled from "@emotion/styled";
import { message, Radio, Select } from "antd";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { Cookies } from "react-cookie";
import { AiTwotoneAlert } from "react-icons/ai";
import { GoStar, GoStarFill } from "react-icons/go";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import LikeButton from "../../components/button/LikeButton";
import MainButton from "../../components/button/PrimaryButton";
import CustomModal from "../../components/modal/Modal";
import AcademyCalendar from "./AcademyCalendar";
import BookList from "./BookList";
import ClassList from "./ClassList";
import KakaoMap from "./KakaoMap";
import LinkModal from "./LinkModal";
import NoticeSection from "./NoticeSection";
import ReviewSection from "./ReviewSection";
import { AcademyData, Class } from "./types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
    wrapper:
      "flex flex-col gap-[12px] mt-[32px] relative max-[768px]:w-full max-[640px]:w-full",
    imageContainer: "flex items-center justify-center px-[16px] py-[12px]",
    image:
      "w-[928px] h-[320px] bg-gray-500 rounded-[12px] max-[768px]:w-full max-[768px]:h-[240px] max-[640px]:w-full max-[640px]:h-[240px]",
    mainContent:
      "w-[940px] flex flex-col gap-[12px] mx-auto max-[768px]:w-full max-[768px]:items-center max-[640px]:w-full max-[640px]:items-center",
  },
  header: {
    wrapper:
      "flex h-[72px] px-[16px] py-[16px] max-[768px]:h-auto max-[768px]:justify-center max-[640px]:h-auto max-[640px]:justify-center",
    title: "mx-auto text-[32px] font-bold text-brand-default text-start",
  },
  tab: {
    container:
      "flex flex-row justify-between items-end h-[63px] sticky top-[64px] bg-white z-[10]",
    item: "cursor-pointer flex justify-center items-center w-[416px] min-w-[288px] h-[40px] border-b-2 max-[768px]:w-full max-[768px]:!min-w-10 max-[640px]:w-full max-[640px]:!min-w-10",
    activeTab: "border-brand-BTBlue",
    inactiveTab: "border-[#F0F0F0]",
    text: "text-[16px] leading-[40px] text-center",
    activeText: "font-bold text-brand-BTBlue",
    inactiveText: "text-[#666666]",
  },
  academy: {
    title:
      " flex justify-center items-center text-[24px] font-bold max-[768px]:w-full max-[640px]:w-full",
    description:
      "h-[36px] flex justify-center items-center text-[14px] text-[#507A95] max-[768px]:h-auto max-[640px]:h-auto",
    content: "flex flex-col justify-center items-center text-[14px]",
    textContent: "text-[14px]items-center px-[16px] py-[12px] mb-[50px]",
  },
  stats: {
    container:
      "flex justify-center items-center p-5 gap-[130px] w-[960px] h-[94px] mb-[50px] border border-[#EEEEEE] rounded-[10px] max-[768px]:gap-5 max-[640px]:w-[96%] max-[640px]:gap-5 max-[640px]:flex-col max-[640px]:h-auto",
    rating: "flex items-center h-[50px] text-[32px] font-bold",
    ratingWrapper: "flex items-center gap-[10px]",
    statsWrapper:
      "flex flex-col items-center justify-between max-[768px]:flex-row max-[768px]:gap-8 max-[640px]:flex-row max-[640px]:gap-8",
    statItem:
      "w-[200px] flex items-center justify-between max-[768px]:w-auto max-[768px]:gap-3 max-[640px]:w-auto max-[640px]:gap-3",
    statLabel: "font-bold",
    statValue: "flex items-center text-[14px] text-[#507A95]",
  },
  section: {
    title: "text-[24px] font-bold flex items-center h-[70px]",
    map: "w-full h-[450px] mb-[100px] max-[768px]:h-auto max-[768px]:mb-0 max-[640px]:h-auto max-[640px]:mb-0",
  },
};

// ReportType 인터페이스 추가
interface ReportType {
  name: string;
  description: string;
}

const AcademyDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // const { search } = useLocation();

  const acaId = searchParams.get("id");

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

  const page = searchParams.get("page") || "1";

  const [items, setItems] = useState([
    { label: "상세 학원정보", isActive: false },
    { label: "수업정보", isActive: false },
    { label: "후기 & 리뷰", isActive: false },
  ]);

  // 초기 탭 설정을 위한 useEffect 추가
  useEffect(() => {
    const reviewParam = searchParams.get("review");
    let activeTabIndex = 0; // 기본값은 첫 번째 탭

    if (reviewParam === "2") {
      activeTabIndex = 2; // 리뷰 탭
    } else if (searchParams.has("classTab")) {
      activeTabIndex = 1; // 수업정보 탭
    }

    const updatedItems = items.map((item, idx) => ({
      ...item,
      isActive: idx === activeTabIndex,
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

  const fetchData = async () => {
    try {
      const url = userId
        ? `/api/academy/getAcademyDetailAllInfo?signedUserId=${userId}&acaId=${acaId}`
        : `/api/academy/getAcademyDetailAllInfo?acaId=${acaId}`;

      const response = await jwtAxios.get(url);

      // console.log(response.data.resultData);

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

    // 탭에 따라 URL 파라미터 설정
    if (index === 2) {
      newParams.set("review", "2");
      newParams.delete("classTab");
    } else if (index === 1) {
      newParams.set("classTab", "1");
      newParams.delete("review");
    } else {
      newParams.delete("review");
      newParams.delete("classTab");
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

  // acaPics 문자열을 배열로 변환하는 함수 수정
  const getImageUrls = (acaPics: string | undefined): string[] => {
    if (!acaPics) return [];
    return acaPics.split(",").map(pic => pic.trim());
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
    <div className={styles.container}>
      <div className={styles.content.wrapper}>
        <div className={styles.header.wrapper}>
          <h1 className={styles.header.title}>{academyData.acaName}</h1>
        </div>

        <div className={styles.content.imageContainer}>
          <div className={styles.content.image}>
            {academyData.acaPics && (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                loop={true}
                className="rounded-xl"
              >
                {(Array.isArray(academyData.acaPics)
                  ? academyData.acaPics
                  : getImageUrls(academyData.acaPics)
                ).map((pic, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={`http://112.222.157.157:5233/pic/academy/${academyData?.acaId}/${pic}`}
                      alt={`${academyData?.acaName} ${index + 1}`}
                      className="w-full h-[320px] bg-gray-300 rounded-xl object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
        <div className={styles.content.mainContent}>
          <h2
            className={`${styles.academy.title} relative max-[768px]:mt-[80px] max-[768px]:mr-[35px] `}
          >
            {/* {academyData.acaName} */}
            <div className="flex items-center gap-2 text-2xl absolute max-[768px]:relative max-[768px]:left-[300px] max-[768px]:top-[40px]">
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
            <div className={styles.academy.description}>
              {academyData.addressDto?.address}{" "}
              {academyData.addressDto?.detailAddress}
            </div>
          </h2>

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
                <div ref={scrollRef}></div>
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
                <span className={styles.stats.statValue}>{likeCount}명</span>
              </div>
              <div className={styles.stats.statItem}>
                <span className={styles.stats.statLabel}>강사 수 &nbsp;</span>
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
            <div className={styles.content.mainContent}>
              <div className={styles.section.title}>학원 일정</div>
              <div className="mb-[50px]">
                <CalendarWrap>
                  <AcademyCalendar academyData={academyData} />
                </CalendarWrap>
              </div>

              <NoticeSection acaId={acaId} />

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
              await fetchData();
            }}
            roleId={roleId as number}
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
              value={selectedReportType || undefined}
              onChange={value => setSelectedReportType(value)}
              placeholder="신고 유형 선택"
              style={{ width: "100%" }}
              allowClear
            >
              {reportTypes.map(type => (
                <Select.Option key={type.name} value={type.name}>
                  {type.name} - {type.description}
                </Select.Option>
              ))}
            </Select>
            {!selectedReportType ? (
              <p className="text-red-500 text-sm">신고 유형을 선택해주세요.</p>
            ) : (
              <p className="h-[20px]"></p>
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
