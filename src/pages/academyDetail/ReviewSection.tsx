import { Pagination } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import CustomModal from "../../components/modal/Modal";
import ReviewModal from "../../components/modal/ReviewModal";
import { AcademyClass, Review } from "./types"; // types.ts에서 Review 타입을 임포트

interface ReviewSectionProps {
  star: number;
  reviewCount: number;
  renderStars: (rating: number) => JSX.Element;
  academyId?: number;
  reviews: Review[];
  classes: AcademyClass[];
  onReviewUpdate?: () => void; // 리뷰 업데이트 함수 추가
}
interface ClassItem {
  classId: number;
  className: string;
}

const styles = {
  stats: {
    container:
      "flex justify-center items-center p-4 gap-[130px] w-[928px] h-[94px] mb-[50px] border border-[#EEEEEE] rounded-[10px]",
    rating: "flex items-center h-[50px] text-[32px] font-bold",
    ratingWrapper: "flex items-center gap-[10px]",
    statsWrapper: "flex flex-col items-center justify-between",
    statItem: "w-[200px] flex items-center justify-between",
    statLabel: "font-bold",
    statValue: "flex items-center text-[14px] text-[#507A95]",
  },
  reviews: {
    container: "flex flex-col py-[12px] w-[928px]",
    header: "flex flex-row gap-[12px] items-center w-[930px]",
    avatar: "w-[40px] h-[40px] rounded-[20px] object-cover",
    text: "text-[14px]",
    rating: "flex text-[16px] mt-[12px] gap-[2px] w-[930px]",
    content: "flex text-[14px] mt-[12px]",
  },
};

const ReviewSection = ({
  star,
  reviewCount,
  renderStars,
  academyId,
  classes,
  reviews: initialReviews,
  onReviewUpdate, // props로 받은 업데이트 함수
}: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, _setUser] = useRecoilState(userInfo);
  const [commonClasses, _setCommonClasses] = useState<number[]>([]);

  const [editReview, setEditReview] = useState<Review | null>(null);

  const [isClassIn, setIsClassIn] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  // const [isModaldele]

  const handlePageChange = (page: number) => {
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set("page", String(page)); // 기존 쿼리스트링 유지하면서 page 값 변경
      return newParams;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setReviews(initialReviews);
    console.log(reviewCount);
  }, [initialReviews]);
  useEffect(() => {
    getData();
  }, []);
  // useEffect(() => {
  //   getData();
  // }, [isModalVisible]);
  const getData = async () => {
    try {
      // 비동기적으로 데이터 요청
      const res = await jwtAxios.get(
        `/api/joinClass?studentId=${user.userId}&page=1&size=100`,
      );

      // API 응답에서 resultData를 가져옵니다.
      const resultData: { classList?: ClassItem[] }[] = res.data.resultData;

      // classes와 resultData의 classId를 비교하는 로직
      const isClassInRes = classes.some(classItem =>
        resultData.some(academy =>
          academy.classList?.some(
            classListItem => classListItem.classId === classItem.classId,
          ),
        ),
      );
      setIsClassIn(isClassInRes);
      console.log("resultData: ", resultData);
      console.log("Classes: ", classes);
      console.log("결과: ", isClassInRes); // true 또는 false가 출력됨

      // const commonClasses: number[] = [];

      if (isClassInRes) {
        classes.forEach(classItem => {
          resultData.forEach((academy: any) => {
            academy.classList?.forEach((classListItem: ClassItem) => {
              if (classListItem.classId === classItem.classId) {
                // 일치하는 classId를 commonClasses 배열에 추가
                commonClasses.push(classItem.classId);
              }
            });
          });
        });
      }
      console.log(commonClasses);
    } catch (error) {
      console.log("오류 발생:", error);
    }
  };

  const handleDeleteReview = async () => {
    if (deleteReviewId === null) return;
    console.log(academyId, user.userId);

    try {
      const res = await jwtAxios.delete("/api/review/user", {
        data: { acaId: academyId, userId: user.userId },
      });
      console.log(res);

      setReviews(reviews.filter(review => review.reviewId !== deleteReviewId));
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
    }
    setIsDeleteModalVisible(false);
  };

  const handleReviewUpdate = async () => {
    if (onReviewUpdate) {
      await onReviewUpdate(); // 부모 컴포넌트의 업데이트 함수 호출
    }
  };

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString();
  // };

  // const getProfileImage = (writerPic: string) => {
  //   return writerPic === "default_user.jpg" ? "/aca_image_1.png" : writerPic;
  // };

  return (
    <div className="flex flex-col mx-auto p-[12px]">
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
        <h3 className="text-[18px] font-bold h-[47px]">Reviews</h3>
        {isClassIn && (
          <button
            className="small_line_button bg-[#3B77D8]"
            style={{
              color: "#fff",
            }}
            onClick={e => {
              e.stopPropagation(); // 이벤트 전파 중지
              setIsModalVisible(true);
            }}
          >
            리뷰등록
          </button>
        )}
      </div>
      <div className={styles.reviews.container}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={index}
              className="flex flex-col mb-[24px] p-[16px] border rounded-[8px]"
            >
              <div className={styles.reviews.header}>
                <img
                  src="/aca_image_1.png" // 기본 이미지 사용
                  alt="User"
                  className={styles.reviews.avatar}
                />
                <div className="w-full">
                  <div className="flex">
                    <div
                      className={`${styles.reviews.text} w-[700px] flex items-center gap-2`}
                    >
                      {review.nickName}
                      <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {review.className}
                      </span>
                    </div>
                    <div>
                      {review.userId === Number(user.userId) && (
                        <div className="flex gap-2">
                          <button
                            className="small_line_button bg-[#3B77D8] text-[14px]"
                            style={{
                              color: "#fff",
                            }}
                            onClick={() => {
                              setIsModalVisible(true);
                              setEditReview(review);
                            }}
                          >
                            리뷰수정
                          </button>
                          <button
                            className="small_line_button bg-[#fff] text-[14px] text-[#242424]"
                            onClick={() => {
                              setDeleteReviewId(review.reviewId);
                              setIsDeleteModalVisible(true);
                            }}
                          >
                            리뷰삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.reviews.text}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
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
            <span className="">등록된 리뷰가 없습니다.</span>
          </div>
        )}
      </div>
      <div className="flex justify-center mb-[40px]">
        <Pagination
          current={currentPage}
          total={reviewCount}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
      {isModalVisible && (
        <ReviewModal
          joinClassId={commonClasses}
          academyId={Number(academyId)}
          existingReview={editReview}
          onClose={() => {
            setIsModalVisible(false);
            setEditReview(null);
            handleReviewUpdate(); // 리뷰 수정/등록 후 데이터 업데이트
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
    </div>
  );
};

export default ReviewSection;
