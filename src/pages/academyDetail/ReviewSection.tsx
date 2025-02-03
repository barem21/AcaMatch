import { Pagination } from "antd";
import { useEffect, useState } from "react";
import ReviewModal from "../../components/modal/ReviewModal";
import { AcademyClass, Review } from "./types"; // types.ts에서 Review 타입을 임포트

interface ReviewSectionProps {
  star: number;
  reviewCount: number;
  renderStars: (rating: number) => JSX.Element;
  academyId: number;
  reviews: Review[];
  classes: AcademyClass[];
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
  reviews: initialReviews, // 초기 리뷰 데이터
}: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalVisible, setIsModalVisible] = useState(false);

  // const fetchReviews = async (page: number) => {
  //   try {
  //     const response = await jwtApiRequest.get<ReviewResponse>(
  //       `/api/review/academy?acaId=${academyId}&page=${page}&size=${pageSize}`,
  //     );

  //     setReviews(response.data.resultData);
  //   } catch (error) {
  //     console.error("리뷰 데이터를 불러오는데 실패했습니다:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (currentPage > 1) {
  //     fetchReviews(currentPage);
  //   }
  // }, [currentPage, academyId]);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString();
  // };

  const getProfileImage = (writerPic: string) => {
    return writerPic === "default_user.jpg" ? "/aca_image_1.png" : writerPic;
  };

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
      </div>
      <div className={styles.reviews.container}>
        {reviews.map((review, index) => (
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
              <div>
                <div className={styles.reviews.text}>User {review.userId}</div>
                <div className={styles.reviews.text}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className={styles.reviews.rating}>
              {renderStars(review.star)}
              <span className="ml-2 text-[14px]">{review.star.toFixed(1)}</span>
            </div>
            <div className={styles.reviews.content}>{review.comment}</div>
          </div>
        ))}
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
          joinClassId={classes.classId}
          // rating={3} // 선택적으로 전달
          onClose={() => setIsModalVisible(false)}
        />
      )}
    </div>
  );
};

export default ReviewSection;
