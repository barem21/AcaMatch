import { PlusOutlined } from "@ant-design/icons";
import { Form, message, Radio, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import { GoStar, GoStarFill } from "react-icons/go";
import { useRecoilState } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import { Review } from "../../pages/academyDetail/types";
import MainButton from "../button/PrimaryButton";
import { SecondaryButton } from "./Modal";

interface ReviewModalProps {
  onClose: () => void;
  academyId: number;
  existingReview?: Review;
  userClasses: any[];
  onSubmitSuccess?: () => void;
}

type ReviewType = "general" | "media";

function ReviewModal({
  onClose,
  // academyId,
  existingReview,
  userClasses = [],
  onSubmitSuccess,
}: ReviewModalProps) {
  const [form] = Form.useForm();
  const [rating, setRating] = useState(existingReview?.star || 1);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewType, setReviewType] = useState<ReviewType>(
    existingReview?.reviewPic ? "media" : "general",
  );
  const [user] = useRecoilState(userInfo);
  const [_deletedFiles, setDeletedFiles] = useState<string[]>([]);

  useEffect(() => {
    // if (existingReview?.reviewPic) {
    //   const existingFiles: UploadFile[] = existingReview.reviewPic
    //     .split(",")
    //     .map((pic: string) => ({
    //       uid: pic,
    //       name: pic,
    //       status: "done" as UploadFileStatus,
    //       url: `http://112.222.157.157:5233/pic/review/${existingReview.reviewId}/${pic}`,
    //     }));
    //   setFileList(existingFiles);
    // }
  }, [existingReview]);

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
    // const isLt5M = file.size / 1024 / 1024 < 5;
    // if (!isLt5M) {
    //   message.error("이미지는 5MB보다 작아야 합니다!");
    //   return false;
    // }
    return true;
  };

  const handleChange: UploadProps["onChange"] = ({
    fileList: newFileList,
    file,
  }) => {
    if (file.status === "removed" && existingReview) {
      const removedFileName = file.name;
      setDeletedFiles(prev => [...prev, removedFileName]);
    }
    setFileList(newFileList);
  };

  const handleSubmit = async (values: { comment: string }) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // JSON 데이터 생성
      const reqData = {
        p: {
          joinClassId: Number(form.getFieldValue("joinClassId")),
          userId: Number(user.userId),
          comment: values.comment.trim(),
          star: Number(rating),
          banReview: 0,
          reviewId: existingReview?.reviewId,
        },
        pics: fileList
          .filter(file => file.status === "done" && !file.originFileObj)
          .map(file => file.name),
      };

      console.log(reqData);

      // JSON 데이터를 Blob으로 변환하여 FormData에 추가
      formData.append(
        "p",
        new Blob([JSON.stringify(reqData.p)], { type: "application/json" }),
      );

      // 이미지 파일들 추가
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append("pics", file.originFileObj); // 'pics'로 파일 추가
        }
      });

      // 이미지 파일 이름들 추가 (이미지가 있을 경우에만)
      if (reqData.pics.length > 0) {
        formData.append(
          "pics",
          new Blob([JSON.stringify(reqData.pics)], {
            type: "application/json",
          }),
        );
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      // API 메서드 변경: POST -> PUT
      if (existingReview) {
        await jwtAxios.put("/api/review/updateReview", formData, config);
      } else {
        await jwtAxios.post("/api/review", formData, config);
      }

      message.success(
        existingReview ? "리뷰가 수정되었습니다." : "리뷰가 등록되었습니다.",
      );

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error(
        existingReview
          ? "리뷰 수정에 실패했습니다."
          : "리뷰 등록에 실패했습니다.",
      );
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
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[1000]">
      <div className="flex flex-col items-center w-[500px] max-[768px]:w-[90%] bg-white rounded-xl p-6 gap-6">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="w-full"
          initialValues={{
            joinClassId:
              existingReview?.joinClassId ||
              userClasses[0]?.joinClassId ||
              null,
            comment: existingReview?.comment || "",
            reviewType: existingReview?.reviewPic ? "media" : "general",
          }}
        >
          {/* Header */}
          <div className="flex items-center w-full mb-6">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-[32px] font-bold text-[#0E161B] font-lexend leading-none max-[768px]:text-[24px]">
                리뷰 & 후기 작성하기
              </h2>
              <div className="flex items-center self-center">
                {renderStars()}
              </div>
            </div>
          </div>

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

          {/* 수강 중인 클래스 선택 - joinClassId 사용 */}
          <Form.Item
            label="수강 중인 클래스"
            name="joinClassId"
            className="mb-6"
            rules={[{ required: true, message: "클래스를 선택해주세요" }]}
          >
            <Radio.Group>
              {userClasses.map(cls => (
                <Radio
                  key={cls.joinClassId}
                  value={cls.joinClassId}
                  className="block mb-2"
                >
                  {cls.className}
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
              className="w-[450px] max-[768px]:w-[100%] h-[224px] p-4 bg-white border border-[#DBE0E6] rounded-xl resize-none text-base text-[#637887] focus:outline-none"
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
