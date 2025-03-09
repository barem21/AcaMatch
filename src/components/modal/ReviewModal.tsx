import { PlusOutlined } from "@ant-design/icons";
import { Form, message, Radio, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { useEffect, useState } from "react";
import { GoStar, GoStarFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import MainButton from "../button/MainButton";
import { SecondaryButton } from "./Modal";
import { AcademyClass } from "../../pages/academyDetail/types";

interface ReviewModalProps {
  onClose: () => void;
  joinClassId: number[];
  academyId: number;
  existingReview?: any;
  classId?: number;
  classes?: AcademyClass[];
}

type ReviewType = "general" | "media";

function ReviewModal({
  onClose,
  joinClassId,
  academyId,
  existingReview,
  classId,
  classes = [],
}: ReviewModalProps) {
  const [form] = Form.useForm();
  const [rating, setRating] = useState(existingReview?.reviewStar || 1);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewType, setReviewType] = useState<ReviewType>(
    existingReview?.reviewPics?.length ? "media" : "general",
  );
  const [user] = useRecoilState(userInfo);
  const selectedClassId =
    Form.useWatch("classId", form) ||
    existingReview?.classId ||
    classId ||
    joinClassId[0];

  const navigate = useNavigate();

  useEffect(() => {
    console.log(existingReview.joinClassId);
    if (existingReview) {
      form.setFieldsValue({
        comment: existingReview.reviewComment,
        classId: existingReview.joinClassId,
        reviewType: existingReview.reviewPics?.length ? "media" : "general",
      });

      setRating(existingReview.reviewStar);

      setFileList([]);
    }
  }, [existingReview, form]);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    // console.log(rating);
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("이미지 파일만 업로드할 수 있습니다!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("이미지는 5MB보다 작아야 합니다!");
      return false;
    }
    return true;
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSubmit = async (values: { comment: string }) => {
    if (isSubmitting) return;

    if (reviewType === "media" && fileList.length === 0) {
      message.error("이미지 리뷰는 최소 1장의 이미지가 필요합니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      const reviewData = {
        userId: user.userId,
        certification: 1,
        classId: form.getFieldValue("classId"),
        comment: values.comment.trim(),
        star: rating,
      };

      formData.append(
        "review",
        new Blob([JSON.stringify(reviewData)], {
          type: "application/json",
        }),
      );

      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append("files", file.originFileObj, file.originFileObj.name);
        }
      });

      const endpoint = existingReview
        ? `/api/image-review/update/${existingReview.reviewId}`
        : "/api/image-review/create";

      await jwtAxios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      message.success(
        existingReview ? "리뷰가 수정되었습니다." : "리뷰가 등록되었습니다.",
      );
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Server Error:", error.response.data);
          message.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else if (error.request) {
          console.error("Network Error:", error.request);
          message.error("네트워크 연결을 확인해주세요.");
        }
      } else {
        console.error("Error:", error);
        message.error("오류가 발생했습니다.");
      }
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
          initialValues={{
            classId: existingReview?.classId || classId || joinClassId[0],
            comment: existingReview?.reviewComment || "",
            reviewType: existingReview?.reviewPics?.length
              ? "media"
              : "general",
          }}
        >
          {/* Header */}
          <div className="flex items-center w-full mb-6">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-[32px] font-bold text-[#0E161B] font-lexend leading-none">
                리뷰 & 후기 작성하기
              </h2>
              <div className="flex items-center self-center">
                {renderStars()}
              </div>
            </div>
          </div>

          {/* Review Type Selection */}
          <Form.Item label="리뷰 유형" className="mb-6">
            <Radio.Group
              value={reviewType}
              onChange={e => setReviewType(e.target.value)}
              className="flex gap-8"
            >
              <Radio value="general" className="text-base">
                <span className="ml-2">리뷰</span>
              </Radio>
              <Radio value="media" className="text-base">
                <span className="ml-2">후기</span>
              </Radio>
            </Radio.Group>
          </Form.Item>

          {/* Class Selection */}
          <Form.Item
            label="수강 중인 클래스"
            name="classId"
            className="mb-6"
            rules={[{ required: true, message: "클래스를 선택해주세요" }]}
          >
            <Radio.Group>
              {(classes || [])
                .filter(cls => joinClassId.includes(cls.classId))
                .map(cls => (
                  <Radio
                    key={cls.classId}
                    value={cls.classId}
                    className="block mb-2"
                  >
                    {cls.className} {cls.classId}
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>

          {/* Image Upload (only for media review) */}
          {reviewType === "media" && (
            <Form.Item
              label="이미지 첨부 (1~5장)"
              className="mb-6"
              extra="이미지는 최대 5장까지 첨부 가능합니다."
              rules={[
                { required: true, message: "최소 1장의 이미지가 필요합니다." },
              ]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                multiple
              >
                {fileList.length >= 5 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          )}

          {/* Text Area */}
          <Form.Item name="comment" className="mb-6">
            <textarea
              placeholder="내용을 작성해 주세요"
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
              disabled={isSubmitting}
            >
              <span className="font-bold text-sm text-[#F8FAFB]">
                {existingReview ? "수정" : "등록"}
              </span>
            </MainButton>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ReviewModal;
