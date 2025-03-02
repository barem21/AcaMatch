import { Form, Button, Input, message, Upload, DatePicker, Radio } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import jwtAxios from "../../apis/jwt";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const PopupAdd = () => {
  const [form] = Form.useForm();
  const [registrationType, setRegistrationType] = useState("image");
  const [fileList, setFileList] = useState<any[]>([]);
  const navigate = useNavigate();

  const initialValues = {
    registrationType: "image",
    startDate: dayjs(),
    endDate: dayjs(),
  };

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

      if (values.registrationType === "image") {
        // 이미지 첨부 방식
        const popupData = {
          p: {
            title: values.title,
            startDate: values.startDate.format("YYYY-MM-DD"),
            endDate: values.endDate.format("YYYY-MM-DD"),
            popUpShow: 0,
            popUpType: 0,
          },
        };

        formData.append(
          "p",
          new Blob([JSON.stringify(popupData.p)], { type: "application/json" }),
        );

        if (values.popupImage) {
          formData.append("pic", values.popupImage);
        }
      } else {
        // 직접 입력 방식
        const popupData = {
          p: {
            title: values.title,
            comment: values.content,
            startDate: values.startDate.format("YYYY-MM-DD"),
            endDate: values.endDate.format("YYYY-MM-DD"),
            popUpShow: 0,
            popUpType: 0,
          },
        };

        formData.append(
          "p",
          new Blob([JSON.stringify(popupData.p)], { type: "application/json" }),
        );
      }

      const response = await jwtAxios.post("/api/popUp", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.resultData) {
        message.success("팝업이 등록되었습니다.");
        navigate(-1);
      }
    } catch (error) {
      console.error("등록 실패:", error);
      message.error("팝업 등록에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full mb-20">
        <h1 className="title-admin-font">
          팝업창 관리
          <p>공지 및 콘텐츠 관리 &gt; 팝업창 관리</p>
        </h1>

        <div className="w-full p-3 px-6 border rounded-md">
          <Form
            form={form}
            initialValues={initialValues}
            onFinish={values => onFinished(values)}
            className="[&_.ant-form-item-label]:flex [&_.ant-form-item-label]:justify-start
                     [&_.ant-form-item-label_label]:min-w-[130px] [&_.ant-form-item-label_label]:text-[#676d9c] [&_.ant-form-item-label_label]:text-[13px]
                     [&_.ant-form-item-required::before]:hidden [&_.ant-form-item-required::after]:hidden
                     [&_.ant-form-item-label_label::after]:content-['']"
          >
            <Form.Item
              name="title"
              label="제목"
              rules={[{ required: true, message: "제목을 입력해 주세요." }]}
              className="[&_.ant-form-item-control-input-content_.input-wrap]:flex 
                         [&_.ant-form-item-control-input-content_.input-wrap]:justify-start 
                         [&_.ant-form-item-control-input-content_.input-wrap]:gap-[15px] 
                         [&_.ant-form-item-control-input-content_.input-wrap]:items-center p-3 pl-0 pt-0 border-b"
            >
              <Input
                className="h-[32px] rounded-[4px] input-admin-basic"
                placeholder="제목을 입력해 주세요."
              />
            </Form.Item>

            <div className="flex gap-[12px] border-b">
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
              name="registrationType"
              label="등록방식"
              rules={[{ required: true, message: "등록방식을 선택해 주세요." }]}
              className="p-3 pl-0 pr-0 border-b"
            >
              <Radio.Group
                onChange={e => setRegistrationType(e.target.value)}
                className=" [&_.ant-radio-wrapper]:text-[#676d9c] [&_.ant-radio-wrapper]:mr-5
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
                rules={[{ required: true, message: "이미지를 첨부해 주세요." }]}
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
                  customRequest={({ file, onSuccess }) => {
                    setTimeout(() => {
                      onSuccess?.("ok");
                    }, 0);
                  }}
                  className="[&_.ant-upload-list-item]:border [&_.ant-upload-list-item]:border-[#3b77d8]"
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
              >
                <Input.TextArea
                  className="p-[15px] input-admin-basic"
                  rows={6}
                  placeholder="팝업 내용을 입력해 주세요."
                />
              </Form.Item>
            )}

            <div className="flex justify-end pt-3 border-t gap-3">
              <button
                type="button"
                className="btn-admin-cancel"
                onClick={() => navigate(-1)}
              >
                취소하기
              </button>
              <Form.Item>
                <Button htmlType="submit" className="btn-admin-ok">
                  등록하기
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default PopupAdd;
