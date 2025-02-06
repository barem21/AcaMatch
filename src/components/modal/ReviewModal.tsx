import { Form, message } from "antd";
import { useState } from "react";
import { GoStar, GoStarFill } from "react-icons/go";
import { useRecoilState } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import MainButton from "../button/MainButton";
import { SecondaryButton } from "./Modal";

interface ReviewModalProps {
  onClose: () => void;
  joinClassId: number[];
}

interface ReviewFormValues {
  comment: string;
}

function ReviewModal({ onClose, joinClassId }: ReviewModalProps) {
  const [form] = Form.useForm();
  const [rating, setRating] = useState(1);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [user, _setUser] = useRecoilState(userInfo);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    // console.log(rating);
  };
  // useEffect(() => {
  //   console.log(rating); // rating 값이 변경된 후 출력됨
  // }, [rating]); // rating이 변경될 때마다 호출

  // useEffect(() => {
  //   try {
  //     const res = jwtAxios.post("/api/review/user");

  //   } catch (error) {}
  // }, []);

  const handleSubmit = async (values: ReviewFormValues) => {
    if (rating === 0) {
      message.error("별점을 선택해주세요.");
      return;
    }
    if (!values.comment || values.comment.trim().length === 0) {
      message.error("리뷰 내용을 입력해주세요.");
      return;
    }

    console.log(joinClassId, values.comment.trim(), rating);
    try {
      setIsSubmitting(true);

      const res = await jwtAxios.post("/api/review/user", {
        classId: joinClassId[0],
        comment: values.comment.trim(),
        star: rating,
        userId: user.userId,
      });

      console.log(joinClassId[0]);
      console.log(user.userId);

      console.log(res);
      message.success("리뷰가 등록되었습니다.");
      onClose();
    } catch (error) {
      console.error("리뷰 등록 실패:", error);

      if (error instanceof Error) {
        const axiosError = error as any; // `AxiosError` 타입으로 캐스팅
        if (axiosError.response && axiosError.response.status === 409) {
          message.error("이미 등록된 리뷰입니다.");
        } else if (axiosError.response && axiosError.response.request) {
          message.error("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        message.error("알 수 없는 오류가 발생했습니다.");
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div
        className="flex gap-0.5 mt-2"
        onMouseLeave={() => {
          setHoveredRating(0);
        }}
      >
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <span
              key={index}
              className="w-[18px] h-[18px] flex items-center justify-center cursor-pointer"
              onClick={() => handleStarClick(index + 1)}
              //   onMouseEnter={() => setHoveredRating(index + 1)}
            >
              {index < (hoveredRating || rating) ? (
                <GoStarFill className="text-[#0E161B]" />
              ) : (
                <GoStar className="text-[#0E161B]" />
              )}
            </span>
          ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="flex flex-col items-center w-[500px] bg-white rounded-xl p-6 gap-6">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="w-full"
        >
          {/* Header */}
          <div className="flex items-center w-full mb-6">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-[32px] font-bold text-[#0E161B] font-lexend leading-none">
                리뷰 작성하기
              </h2>
              <div className="flex items-center self-center">
                {renderStars()}
              </div>
            </div>
          </div>

          {/* Text Area */}
          <Form.Item name="comment">
            <textarea
              placeholder="리뷰를 작성해 주세요"
              className="w-[450px] h-[224px] p-4 bg-white border border-[#DBE0E6] rounded-xl resize-none text-base text-[#637887] focus:outline-none"
            />
          </Form.Item>

          {/* Buttons */}
          <div className="flex justify-center items-center gap-[12px] w-full">
            <SecondaryButton
              onClick={onClose}
              className="flex justify-center items-center w-full h-10 bg-[#E8EEF3] rounded-xl"
            >
              <span className="font-bold text-sm text-[#0E161B]">취소</span>
            </SecondaryButton>
            <MainButton
              type="primary"
              htmlType="submit"
              className="flex justify-center items-center w-full h-10 bg-[#3B77D8] rounded-xl"
            >
              <span className="font-bold text-sm text-[#F8FAFB]">등록</span>
            </MainButton>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ReviewModal;
