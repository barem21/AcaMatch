import { Pagination } from "antd";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import "swiper/css";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import CustomModal from "../../components/modal/Modal";
import ReviewModal from "../../components/modal/ReviewModal";
import { Class, Review } from "./types";
import { AiTwotoneAlert } from "react-icons/ai";
import { message } from "antd";
import { Select } from "antd";

interface ReviewSectionProps {
  star: number;
  reviewCount: number;
  renderStars: (star: number) => JSX.Element | JSX.Element[];
  academyId: number;
  classes: Class[];
  generalReviews: Review[];
  mediaReviews: Review[];
  generalReviewCount: number;
  mediaReviewCount: number;
  onReviewUpdate: () => Promise<void>;
  onMediaPageChange: (page: number) => void;
  onGeneralPageChange: (page: number) => void;
  mediaPage: number;
  generalPage: number;
}

interface ClassItem {
  classId: number;
  className: string;
}

// 선택된 이미지 정보를 위한 인터페이스 추가
interface SelectedImageInfo {
  reviewId: number;
  imageName: string;
}

// // 리뷰 타입을 확장하여 타입 구분을 추가
// interface ReviewWithType extends Review {
//   type: "media" | "general";
// }

const styles = {
  stats: {
    container:
      "flex justify-center items-center p-4 gap-[130px] w-[928px] h-[94px] mb-[50px] border border-[#EEEEEE] rounded-[10px] max-[640px]:w-full",
    rating: "flex items-center h-[50px] text-[32px] font-bold",
    ratingWrapper: "flex items-center gap-[10px]",
    statsWrapper: "flex flex-col items-center justify-between",
    statItem: "w-[200px] flex items-center justify-between",
    statLabel: "font-bold",
    statValue: "flex items-center text-[14px] text-[#507A95]",
  },
  reviews: {
    container: "flex flex-col py-[12px] w-[928px] max-[640px]:w-full",
    header:
      "flex flex-row gap-[12px] items-center w-[930px] max-[640px]:w-full",
    avatar: "w-[40px] h-[40px] rounded-[20px] object-cover",
    text: "text-[14px]",
    rating: "flex text-[16px] mt-[12px] gap-[2px] w-[930px] max-[640px]:w-full",
    content: "flex text-[14px] mt-[12px]",
  },
};

const ReviewSection = ({
  star,
  reviewCount,
  renderStars,
  academyId,
  classes,
  generalReviews,
  mediaReviews,
  generalReviewCount,
  mediaReviewCount,
  onReviewUpdate,
  onMediaPageChange,
  onGeneralPageChange,
  mediaPage,
  generalPage,
}: ReviewSectionProps) => {
  // const [_searchParams, setSearchParams] = useSearchParams();
  const pageSize = 10;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, _setUser] = useRecoilState(userInfo);
  const [commonClasses, setCommonClasses] = useState<number[]>([]);

  const [editReview, setEditReview] = useState<Review | null>(null);

  const [isClassIn, setIsClassIn] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo | null>(
    null,
  );

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [reportedUserId, setReportedUserId] = useState<number | null>(null);

  // // 통합된 리뷰 목록 생성
  // const combinedReviews: ReviewWithType[] = [
  //   ...mediaReviews.map(review => ({ ...review, type: "media" as const })),
  //   ...generalReviews.map(review => ({ ...review, type: "general" as const })),
  // ];

  // // 전체 리뷰 수
  // const totalReviewCount = mediaReviewCount + generalReviewCount;

  // 통합 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    const mediaCount = Math.min(
      pageSize,
      mediaReviewCount - (page - 1) * pageSize,
    );
    if (mediaCount > 0) {
      onMediaPageChange(page);
    }
    onGeneralPageChange(page);
  };

  const getData = async () => {
    try {
      const res = await jwtAxios.get(
        `/api/joinClass?studentId=${user.userId}&page=1&size=100`,
      );

      const resultData: { classList?: ClassItem[] }[] = res.data.resultData;
      const matchedClassIds: number[] = [];

      // 수강 중인 클래스와 학원의 클래스 ID 비교
      const isClassInRes = classes.some(classItem =>
        resultData.some(academy =>
          academy.classList?.some(
            classListItem => classListItem.classId === classItem.classId,
          ),
        ),
      );

      if (isClassInRes) {
        classes.forEach(classItem => {
          resultData.forEach(academy => {
            academy.classList?.forEach(classListItem => {
              if (classListItem.classId === classItem.classId) {
                matchedClassIds.push(classItem.classId);
              }
            });
          });
        });
      }

      setIsClassIn(isClassInRes);
      setCommonClasses(matchedClassIds);
    } catch (error) {
      console.log("오류 발생:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [classes, user.userId]);

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

  const handleDeleteReview = async () => {
    if (deleteReviewId === null) return;
    console.log(academyId, user.userId);

    try {
      const res = await jwtAxios.delete("/api/review/user", {
        data: { acaId: academyId, userId: user.userId },
      });
      console.log(res);
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
    }
    setIsDeleteModalVisible(false);
  };

  const handleReviewUpdate = async () => {
    if (onReviewUpdate) {
      await onReviewUpdate();
    }
  };

  const handleReport = async () => {
    if (!selectedReportType) {
      message.error("신고 유형을 선택해주세요.");
      return;
    }

    if (!user.userId) {
      message.error("로그인이 필요한 서비스입니다.");
      return;
    }

    try {
      await jwtAxios.post(`/api/reports/postReports`, null, {
        params: {
          reporter: user.userId,
          reportedUser: reportedUserId,
          reportsType: selectedReportType,
        },
      });

      message.success("신고가 접수되었습니다.");
      setIsReportModalOpen(false);
      setSelectedReportType("");
      setReportedUserId(null);
    } catch (error) {
      console.error("신고 처리 중 오류가 발생했습니다:", error);
      message.error("신고 처리 중 오류가 발생했습니다.");
    }
  };

  const renderReviewHeader = (review: Review) => (
    <div className={styles.reviews.header}>
      <img
        src="/aca_image_1.png"
        alt="User"
        className={styles.reviews.avatar}
      />
      <div className="w-full">
        <div className="flex justify-between">
          <div className={`${styles.reviews.text} flex items-center gap-2`}>
            {review.reviewUserNickName}
            <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {review.reviewClassName}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {review.reviewUserId !== Number(user.userId) && (
              <button
                onClick={() => {
                  setReportedUserId(review.reviewUserId);
                  setIsReportModalOpen(true);
                }}
                className="text-[#507A95] hover:text-[#3B77D8]"
              >
                <AiTwotoneAlert size={20} />
              </button>
            )}
            {review.reviewUserId === Number(user.userId) && (
              <div className="flex gap-2">
                <button
                  className="small_line_button bg-[#3B77D8] text-[14px]"
                  style={{ color: "#fff" }}
                  onClick={() => {
                    setIsModalVisible(true);
                    setEditReview(review);
                  }}
                >
                  후기수정
                </button>
                <button
                  className="small_line_button bg-[#fff] text-[14px] text-[#242424]"
                  onClick={() => {
                    setDeleteReviewId(review.reviewId);
                    setIsDeleteModalVisible(true);
                  }}
                >
                  후기삭제
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.reviews.text}>
          {new Date(review.reviewCreatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col mx-auto p-[12px] max-[640px]:w-full">
      <div className={styles.stats.container}>
        <div className={styles.stats.ratingWrapper}>
          <div className={styles.stats.rating}>{star.toFixed(1)}</div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-[2px] text-[14px] mt-[12px]">
              {renderStars(star)}
            </div>
            <div className="text-[14px]">{reviewCount} reviews</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4"></div>
        {isClassIn && (
          <button
            className="small_line_button bg-[#3B77D8]"
            style={{ color: "#fff" }}
            onClick={() => setIsModalVisible(true)}
          >
            후기 & 리뷰등록
          </button>
        )}
      </div>

      {/* 미디어 후기 섹션 */}
      <div className="mb-8">
        <h3 className="text-[18px] font-bold mb-4">
          후기 {mediaReviewCount} 개
        </h3>
        <div className={styles.reviews.container}>
          {mediaReviews?.length > 0 ? (
            mediaReviews.map((review, index) => (
              <div
                key={index}
                className="flex flex-col mb-[24px] p-[16px] border rounded-[8px]"
              >
                {renderReviewHeader(review)}
                <div className={styles.reviews.rating}>
                  {renderStars(review.reviewStar)}
                  <span className="ml-2 text-[14px]">
                    {review.reviewStar.toFixed(0)}
                  </span>
                </div>
                <div className={styles.reviews.content}>
                  {review.reviewComment}
                </div>
                {review.reviewPics && review.reviewPics.length > 0 && (
                  <div className="mt-4 w-full">
                    <Swiper
                      modules={[FreeMode]}
                      slidesPerView="auto"
                      spaceBetween={8}
                      freeMode={true}
                      grabCursor={true}
                      className="w-full"
                    >
                      {review.reviewPics.map((pic: string, i: number) => (
                        <SwiperSlide
                          key={i}
                          style={{ width: "120px", height: "120px" }}
                        >
                          <img
                            src={`http://112.222.157.157:5233/pic/reviews/${review.reviewId}/images/${pic}`}
                            alt={`Review image ${i + 1}`}
                            className="w-full h-full object-cover rounded cursor-pointer"
                            onClick={() =>
                              setSelectedImage({
                                reviewId: review.reviewId,
                                imageName: pic,
                              })
                            }
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center text-[14px] text-gray-500 border rounded-[8px] h-[142px]">
              <span>등록된 후기가 없습니다.</span>
            </div>
          )}
        </div>
        {mediaReviews?.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={mediaPage}
              total={mediaReviewCount}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* 일반 리뷰 섹션 */}
      <div>
        <h3 className="text-[18px] font-bold mb-4">
          리뷰 {generalReviewCount} 개
        </h3>
        <div className={styles.reviews.container}>
          {generalReviews?.length > 0 ? (
            generalReviews.map((review, index) => (
              <div
                key={index}
                className="flex flex-col mb-[24px] p-[16px] border rounded-[8px]"
              >
                {renderReviewHeader(review)}
                <div className={styles.reviews.rating}>
                  {renderStars(review.reviewStar)}
                  <span className="ml-2 text-[14px]">
                    {review.reviewStar.toFixed(0)}
                  </span>
                </div>
                <div className={styles.reviews.content}>
                  {review.reviewComment}
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center text-[14px] text-gray-500 border rounded-[8px] h-[142px]">
              <span>등록된 리뷰가 없습니다.</span>
            </div>
          )}
        </div>
        {generalReviews?.length > 0 && (
          <div className="flex justify-center mt-4 mb-[40px]">
            <Pagination
              current={generalPage}
              total={generalReviewCount}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {isModalVisible && (
        <ReviewModal
          joinClassId={commonClasses}
          academyId={Number(academyId)}
          existingReview={editReview}
          classId={editReview?.classId}
          classes={classes}
          onClose={() => {
            setIsModalVisible(false);
            setEditReview(null);
            handleReviewUpdate();
          }}
        />
      )}
      {isDeleteModalVisible && (
        <CustomModal
          visible={isDeleteModalVisible}
          title={"리뷰 삭제"}
          content={<p className="mt-[15px]">리뷰를 삭제하시겠습니까?</p>}
          onButton1Click={() => setIsDeleteModalVisible(false)}
          onButton2Click={handleDeleteReview}
          button1Text={"취소"}
          button2Text={"확인"}
          modalWidth={400}
        />
      )}

      {/* 이미지 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img
              src={`http://112.222.157.157:5233/pic/reviews/${selectedImage.reviewId}/images/${selectedImage.imageName}`}
              alt="Large preview"
              className="max-w-[800px] max-h-[800px] object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* 신고 모달 추가 */}
      <CustomModal
        visible={isReportModalOpen}
        title="사용자 신고하기"
        content={
          <div className="flex flex-col gap-4">
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
          setReportedUserId(null);
        }}
        onButton2Click={handleReport}
        button1Text="취소"
        button2Text="신고하기"
        modalWidth={400}
      />
    </div>
  );
};

export default ReviewSection;
