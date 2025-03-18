import { message, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import "swiper/css";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import CustomModal from "../../components/modal/Modal";
import ReviewModal from "../../components/modal/ReviewModal";
import { Review } from "./types";
import { AiTwotoneAlert } from "react-icons/ai";

// ReportType 인터페이스 추가
interface ReportType {
  name: string;
  description: string;
}

interface ReviewSectionProps {
  star: number;
  reviewCount: number;
  renderStars: (rating: number) => JSX.Element;
  academyId: number;
  classes: any[];
  onReviewUpdate?: () => Promise<void>;
  roleId?: number;
}

interface ClassItem {
  classId: number;
  className: string;
}

// 선택된 이미지 정보를 위한 인터페이스 추가
interface SelectedImageInfo {
  reviewId: number;
  imageName: string;
  userId: number;
}

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
  onReviewUpdate,
  roleId,
}: ReviewSectionProps) => {
  // const pageSize = 10;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, _setUser] = useRecoilState(userInfo);
  const [_commonClasses, setCommonClasses] = useState<number[]>([]);

  // editReview 상태 주석 해제 및 수정
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

  // 일반 리뷰와 이미지 리뷰를 위한 상태 분리
  const [generalReviews, setGeneralReviews] = useState<Review[]>([]);
  const [mediaReviews, setMediaReviews] = useState<Review[]>([]);

  // 리뷰 데이터 상태 추가
  const [totalReviewCount, setTotalReviewCount] = useState(reviewCount);
  const [generalReviewPage, setGeneralReviewPage] = useState(1);
  const [mediaReviewPage, setMediaReviewPage] = useState(1);
  const [totalMediaReviewCount, setTotalMediaReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 사용자의 수강 중인 클래스 목록을 위한 상태 추가
  const [_userClasses, setUserClasses] = useState<any[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<any>(null);

  // 일반 리뷰 데이터 가져오기
  const fetchGeneralReviews = async () => {
    if (!academyId) return;

    setLoading(true);
    try {
      const response = await jwtAxios.get(
        `/api/review/academy/noPic?acaId=${academyId}&page=${generalReviewPage}&size=10`,
      );
      console.log("리뷰 데이터", response);

      if (response.data.resultMessage === "리뷰가 조회되었습니다.") {
        setGeneralReviews(response.data.resultData);
        setTotalReviewCount(response.data.resultData[0]?.myReviewCount || 0);
      }
    } catch (error) {
      console.error("Error fetching general reviews:", error);
      message.error("리뷰를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이미지 리뷰 데이터 가져오기
  const fetchMediaReviews = async () => {
    if (!academyId) return;

    setLoading(true);
    try {
      const response = await jwtAxios.get(
        `/api/review/academy/pic?acaId=${academyId}&page=${mediaReviewPage}&size=10`,
      );

      setMediaReviews(response.data.resultData || []);
      setTotalMediaReviewCount(response.data.resultData[0]?.myReviewCount || 0);
      console.log("이미지 리뷰 데이터", response.data.resultData);
    } catch (error) {
      console.error("Error fetching media reviews:", error);
      message.error("후기를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneralReviews();
  }, [academyId, generalReviewPage]);

  useEffect(() => {
    fetchMediaReviews();
  }, [academyId, mediaReviewPage]);

  // 일반 리뷰 페이지 변경 핸들러
  const handleGeneralPageChange = (page: number) => {
    setGeneralReviewPage(page);
  };

  // 이미지 리뷰 페이지 변경 핸들러
  const handleMediaPageChange = (page: number) => {
    setMediaReviewPage(page);
  };

  const getData = async () => {
    try {
      const res = await jwtAxios.get(
        `/api/joinClass?studentId=${user.userId}&page=1&size=100`,
      );
      console.log(res);

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

    try {
      const res = await jwtAxios.delete("/api/review/user", {
        data: { acaId: academyId, userId: user.userId },
      });
      console.log(res);

      // 삭제 후 리뷰 목록 다시 가져오기
      await fetchGeneralReviews();
      await fetchMediaReviews();

      // 부모 컴포넌트에 업데이트 알림
      if (onReviewUpdate) {
        await onReviewUpdate();
      }
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
    }
    setIsDeleteModalVisible(false);
  };

  // const handleReviewUpdate = async () => {
  //   await fetchGeneralReviews();
  //   await fetchMediaReviews();

  //   if (onReviewUpdate) {
  //     await onReviewUpdate();
  //   }
  // };

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
          reviewId: reportedUserId,
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

  // 사용자의 수강 중인 클래스 목록 가져오기
  const fetchUserClasses = async () => {
    try {
      const response = await jwtAxios.get(
        `/api/joinClass?studentId=${user.userId}&page=1&size=100`,
      );

      if (response.data.resultMessage === "불러오기 성공") {
        // 현재 학원에 해당하는 클래스만 필터링
        const currentAcademy = response.data.resultData.find(
          (aca: any) => aca.acaId === academyId,
        );

        if (currentAcademy) {
          setSelectedAcademy(currentAcademy);
        }

        setUserClasses(response.data.resultData);
      }
    } catch (error) {
      console.error("Error fetching user classes:", error);
    }
  };

  useEffect(() => {
    if (user.userId) {
      fetchUserClasses();
    }
  }, [user.userId, academyId]);

  // 리뷰 모달 표시 핸들러
  const handleShowReviewModal = () => {
    if (!selectedAcademy || selectedAcademy.classList.length === 0) {
      message.warning("수강 중인 클래스가 없습니다.");
      return;
    }

    setIsModalVisible(true);
  };

  // 리뷰 이미지 처리 함수
  const getReviewImages = (reviewPic: string) => {
    return reviewPic ? reviewPic.split(",") : [];
  };

  // 모달 닫기 핸들러 수정
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditReview(null);
  };

  // 리뷰 작성 완료 후 처리
  const handleReviewSubmitted = async () => {
    setIsModalVisible(false);
    // 리뷰 작성이 완료된 경우에만 데이터를 다시 불러옴
    await fetchGeneralReviews();
    await fetchMediaReviews();
  };

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

      <div className="flex justify-between items-center ">
        <div className="flex gap-4"></div>
        {isClassIn && roleId !== 3 && (
          <button
            className="small_line_button bg-[#3B77D8]"
            style={{ color: "#fff" }}
            onClick={handleShowReviewModal}
          >
            후기 & 리뷰등록
          </button>
        )}
      </div>

      {/* 후기 섹션 */}
      <div>
        <h3 className="text-xl font-bold mb-4">후기</h3>
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : mediaReviews.length > 0 ? (
          mediaReviews.map(review => (
            <div
              key={review.reviewId}
              className="flex flex-col mb-[24px] p-[16px] border rounded-[8px]"
            >
              <div className="flex items-start gap-2">
                <img
                  src={`http://112.222.157.157:5233/pic/user/${review.userId}/${review.writerPic}`}
                  alt={review.writerName}
                  className={styles.reviews.avatar}
                />
                <div className="w-full">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{review.writerName}</span>
                      <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {review.className}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {review.userId !== Number(user.userId) && (
                        <AiTwotoneAlert
                          size={20}
                          onClick={() => {
                            setReportedUserId(review.userId);
                            setIsReportModalOpen(true);
                          }}
                          className="cursor-pointer text-[#507A95]"
                        />
                      )}
                      {review.userId === Number(user.userId) && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={styles.reviews.rating}>
                {renderStars(review.star)}
                <span className="ml-2 text-[14px]">
                  {review.star.toFixed(0)}
                </span>
              </div>
              <div className={styles.reviews.content}>{review.comment}</div>
              {review.reviewPic && (
                <div className="mt-4 w-full">
                  <Swiper
                    modules={[FreeMode]}
                    slidesPerView="auto"
                    spaceBetween={8}
                    freeMode={true}
                    grabCursor={true}
                    className="w-full"
                  >
                    {getReviewImages(review.reviewPic).map((pic, i) => (
                      <SwiperSlide
                        key={i}
                        style={{ width: "120px", height: "120px" }}
                      >
                        <img
                          src={`http://112.222.157.157:5233/pic/review/${review.reviewId}/${pic}`}
                          alt={`Review image ${i + 1}`}
                          className="w-full h-full object-cover rounded cursor-pointer"
                          onClick={() =>
                            setSelectedImage({
                              reviewId: review.reviewId,
                              imageName: pic,
                              userId: review.userId,
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

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-4">
          <Pagination
            current={mediaReviewPage}
            total={totalMediaReviewCount}
            pageSize={10}
            onChange={handleMediaPageChange}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* 일반 리뷰 섹션 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">리뷰</h3>
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : generalReviews.length > 0 ? (
          generalReviews.map(review => (
            <div
              key={review.reviewId}
              className="flex flex-col mb-[24px] p-[16px] border rounded-[8px]"
            >
              <div className="flex items-start gap-2">
                <img
                  src={`http://112.222.157.157:5233/pic/user/${review.userId}/${review.writerPic}`}
                  alt={review.writerName}
                  className={styles.reviews.avatar}
                />
                <div className="w-full">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{review.writerName}</span>
                      <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {review.className}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {review.userId !== Number(user.userId) && (
                        <AiTwotoneAlert
                          size={20}
                          onClick={() => {
                            setReportedUserId(review.userId);
                            setIsReportModalOpen(true);
                          }}
                          className="cursor-pointer text-[#507A95]"
                        />
                      )}
                      {review.userId === Number(user.userId) && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={styles.reviews.rating}>
                {renderStars(review.star)}
                <span className="ml-2 text-[14px]">
                  {review.star.toFixed(0)}
                </span>
              </div>
              <div className={styles.reviews.content}>{review.comment}</div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center text-[14px] text-gray-500 border rounded-[8px] h-[142px]">
            <span>등록된 리뷰가 없습니다.</span>
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-4">
          <Pagination
            current={generalReviewPage}
            total={totalReviewCount}
            pageSize={10}
            onChange={handleGeneralPageChange}
            showSizeChanger={false}
          />
        </div>
      </div>

      {isModalVisible && selectedAcademy && (
        <ReviewModal
          onClose={handleModalClose}
          academyId={academyId}
          userClasses={selectedAcademy.classList}
          onSubmitSuccess={handleReviewSubmitted}
          existingReview={editReview}
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
              src={`http://112.222.157.157:5233/pic/reviews/${selectedImage.userId}/${selectedImage.imageName}`}
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
