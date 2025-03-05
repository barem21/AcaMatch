import { Form, Button, Input, message, Upload, DatePicker, Radio } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import jwtAxios from "../../../apis/jwt";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import styled from "@emotion/styled";

interface PopupDetail {
  title: string;
  startDate: string;
  endDate: string;
  popUpShow: number;
  popUpType: number;
  popUpId: number;
  comment?: string;
  popUpPic?: string;
  sumCount: number;
}

// 팝업 데이터 인터페이스 정의
interface PopupFormData {
  popUpId: number;
  title: string;
  popUpShow: number;
  popUpType: number;
  startDate: string;
  endDate: string;
  comment?: string; // 선택적 필드로 추가
}

const StyledForm = styled(Form)`
  .ant-form-item-label {
    display: flex;
    justify-content: start;
  }

  .ant-form-item-label label {
    min-width: 130px;
    color: #676d9c;
    font-size: 13px;
  }

  .ant-form-item-required::before,
  .ant-form-item-required::after {
    display: none;
  }

  .ant-form-item-label label::after {
    content: "";
  }

  .ant-form-item {
    margin-bottom: 0;
    padding: 15px 0px;
    position: relative;
  }

  .ant-form-item-explain-error {
    padding-left: 12px;
    font-size: 12px;
    margin-top: 4px;
  }

  .ant-form-item-control {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .ant-form-item-control-input {
    margin-top: 0;
  }
`;

const PopupAdd = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [registrationType, setRegistrationType] = useState("image");
  const [fileList, setFileList] = useState<any[]>([]);
  const navigate = useNavigate();

  const popupId = searchParams.get("id");

  useEffect(() => {
    const fetchPopupDetail = async () => {
      if (!popupId) return;

      try {
        const response = await jwtAxios.get<{ resultData: PopupDetail[] }>(
          "/api/popUp/detail",
          {
            params: { popUpId: popupId },
          },
        );

        const popupDetail = response.data.resultData[0];

        if (popupDetail.popUpPic) {
          setRegistrationType("image");
          setFileList([
            {
              uid: "-1",
              name: popupDetail.popUpPic,
              status: "done",
              url: `http://112.222.157.157:5233/pic/popUp/${popupDetail.popUpId}/${popupDetail.popUpPic}`,
            },
          ]);
        } else {
          setRegistrationType("direct");
          setFileList([]);
        }

        form.setFieldsValue({
          title: popupDetail.title,
          startDate: dayjs(popupDetail.startDate),
          endDate: dayjs(popupDetail.endDate),
          registrationType: popupDetail.popUpPic ? "image" : "direct",
          content: popupDetail.comment || "",
          popUpShow: popupDetail.popUpShow,
          popUpType: popupDetail.popUpType,
        });
      } catch (error) {
        console.error("팝업 상세 정보 조회 실패:", error);
        message.error("팝업 정보를 불러오는데 실패했습니다.");
      }
    };

    // 초기값 설정
    form.setFieldsValue({
      registrationType: "image",
      startDate: dayjs(),
      endDate: dayjs(),
      popUpShow: 0,
      popUpType: 0, // 기본값은 일반회원
    });

    if (popupId) {
      fetchPopupDetail();
    }
  }, [popupId, form]);

  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);

    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);

    if (info.file.status === "done" && info.file.originFileObj) {
      form.setFieldValue("popupImage", info.file.originFileObj);
    }
  };

  const onFinished = async (values: any) => {
    try {
      const formData = new FormData();

      const popupData: { p: PopupFormData } = {
        p: {
          popUpId: popupId ? parseInt(popupId) : 0,
          title: values.title,
          popUpShow: values.popUpShow,
          popUpType: values.popUpType,
          startDate: values.startDate.format("YYYY-MM-DD"),
          endDate: values.endDate.format("YYYY-MM-DD"),
        },
      };

      // 직접 입력일 경우 comment 추가
      if (values.registrationType === "direct") {
        popupData.p.comment = values.content;
      }

      formData.append(
        "p",
        new Blob([JSON.stringify(popupData.p)], { type: "application/json" }),
      );

      // 이미지 등록 방식일 경우에만 pic 추가
      if (values.registrationType === "image" && values.popupImage) {
        formData.append("pic", values.popupImage);
      }

      if (popupId) {
        // FormData 내용 로그 출력
        for (const [key, value] of formData.entries()) {
          if (key === "p") {
            // Blob 타입의 데이터를 문자열로 변환하여 파싱
            const reader = new FileReader();
            reader.onload = () => {
              const text = reader.result as string;
              console.log("FormData p:", JSON.parse(text));
            };
            reader.readAsText(value as Blob);
          } else {
            // File 객체는 그대로 출력
            console.log("FormData:", key, value);
          }
        }

        await jwtAxios.put("/api/popUp", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        message.success("팝업이 수정되었습니다.");
      } else {
        await jwtAxios.post("/api/popUp", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("팝업이 등록되었습니다.");
      }

      navigate(-1);
    } catch (error) {
      console.error(popupId ? "수정 실패:" : "등록 실패:", error);
      message.error(
        popupId ? "팝업 수정에 실패했습니다." : "팝업 등록에 실패했습니다.",
      );
    }
  };

  return (
    <div className="flex gap-5 w-full justify-center pb-10">
      <div className="w-full">
        <h1 className="title-admin-font">
          {popupId ? "팝업 수정" : "팝업 등록"}
          <p>공지 및 콘텐츠 관리 &gt; {popupId ? "팝업 수정" : "팝업 등록"}</p>
        </h1>

        <div className="max-w-3xl p-1 pl-6 pr-6 border rounded-md">
          <StyledForm form={form} onFinish={values => onFinished(values)}>
            <Form.Item
              name="title"
              label="제목"
              rules={[{ required: true, message: "제목을 입력해 주세요." }]}
              className="[&_.ant-form-item-control-input-content_.input-wrap]:flex 
                       [&_.ant-form-item-control-input-content_.input-wrap]:justify-start 
                       [&_.ant-form-item-control-input-content_.input-wrap]:gap-[15px] 
                       [&_.ant-form-item-control-input-content_.input-wrap]:items-center pl-0 border-b"
            >
              <Input
                className="h-[32px] rounded-[4px] input-admin-basic"
                placeholder="제목을 입력해 주세요."
              />
            </Form.Item>

            <div className="flex gap-[12px] border-b py-3">
              <Form.Item
                name="startDate"
                label="시작일"
                rules={[{ required: true, message: "시작일을 선택해 주세요." }]}
              >
                <DatePicker className="w-full [&_.ant-picker]:p-0 [&_.ant-picker]:px-[11px]" />
              </Form.Item>

              <Form.Item
                name="endDate"
                label="종료일"
                rules={[{ required: true, message: "종료일을 선택해 주세요." }]}
              >
                <DatePicker className="w-full [&_.ant-picker]:p-0 [&_.ant-picker]:px-[11px]" />
              </Form.Item>
            </div>

            <Form.Item
              name="popUpType"
              label="팝업 대상"
              rules={[{ required: true }]}
              className="pl-0 pr-0 border-b"
            >
              <Radio.Group
                className="[&_.ant-radio-wrapper]:text-[#676d9c] [&_.ant-radio-wrapper]:mr-5
                         [&_.ant-radio-wrapper_span]:text-[13px]"
              >
                <Radio value={0} className="w-[100px]">
                  일반회원
                </Radio>
                <Radio value={1}>학원관계자</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="popUpShow"
              label="출력상태"
              rules={[{ required: true }]}
              className="pl-0 pr-0 border-b"
            >
              <Radio.Group
                className="[&_.ant-radio-wrapper]:text-[#676d9c] [&_.ant-radio-wrapper]:mr-5
                         [&_.ant-radio-wrapper_span]:text-[13px] "
              >
                <Radio value={1} className="w-[100px] ">
                  출력
                </Radio>
                <Radio value={0}>미출력</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="registrationType"
              label="등록방식"
              rules={[{ required: true }]}
              className="pl-0 pr-0 border-b"
            >
              <Radio.Group
                onChange={e => setRegistrationType(e.target.value)}
                className="[&_.ant-radio-wrapper]:text-[#676d9c] [&_.ant-radio-wrapper]:mr-5
             [&_.ant-radio-wrapper_span]:text-[13px]"
              >
                <Radio value="image" className="w-[100px]">
                  이미지 첨부
                </Radio>
                <Radio value="direct">직접 입력</Radio>
              </Radio.Group>
            </Form.Item>

            {registrationType === "image" && (
              <Form.Item
                name="popupImage"
                label="팝업 이미지"
                rules={[
                  {
                    required: !popupId || !fileList[0]?.url, // 신규 등록이거나 기존 이미지가 없을 때만 필수
                    message: "이미지를 업로드해 주세요.",
                  },
                ]}
                className="py-3"
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  fileList={fileList}
                  onChange={handleChange}
                  beforeUpload={file => {
                    const isImage = file.type.startsWith("image/");
                    if (!isImage) {
                      message.error("이미지 파일만 업로드 가능합니다!");
                      return false;
                    }
                    return true;
                  }}
                  customRequest={({ onSuccess }) => {
                    setTimeout(() => {
                      onSuccess?.("ok");
                    }, 0);
                  }}
                  className="[&_.ant-upload-list-item]:border [&_.ant-upload-list-item]:border-[#3b77d8] [&_.ant-form-item]:pb-[12px]"
                >
                  {fileList.length < 1 && (
                    <button type="button" className="border-0 bg-transparent">
                      <PlusOutlined />
                      <div className="mt-2">Upload</div>
                    </button>
                  )}
                </Upload>
              </Form.Item>
            )}

            {registrationType === "direct" && (
              <Form.Item
                name="content"
                label="팝업 내용"
                rules={[{ required: true, message: "내용을 입력해 주세요." }]}
                className="py-3"
              >
                <Input.TextArea
                  className="p-[15px] input-admin-basic w-full"
                  rows={6}
                  placeholder="팝업 내용을 입력해 주세요."
                />
              </Form.Item>
            )}

            <div className="flex justify-end border-t gap-3">
              <div className="flex items-center">
                <button
                  type="button"
                  className="btn-admin-cancel pt-[12px]"
                  onClick={() => navigate(-1)}
                >
                  취소하기
                </button>
              </div>
              <Form.Item className="flex items-center pt-[0] ">
                <Button
                  htmlType="submit"
                  className="btn-admin-ok [&_.ant-form-item]:p-0 "
                >
                  {popupId ? "수정하기" : "등록하기"}
                </Button>
              </Form.Item>
            </div>
          </StyledForm>
        </div>
      </div>
    </div>
  );
};

export default PopupAdd;
