import { Form, Button, Input, message, Upload, DatePicker, Radio } from "antd";
import styled from "@emotion/styled";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import jwtAxios from "../../apis/jwt";
import { useNavigate } from "react-router-dom";

const FormWrapper = styled.div`
  .title-admin-font {
    // ... existing title styles if any ...
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item-label {
    display: flex;
    justify-content: flex-start;
  }
  .ant-form-item-label label {
    min-width: 130px !important;
    color: #676d9c;
    font-size: 13px;
  }
  .ant-form-item-required::before {
    display: none !important;
    content: "" !important;
    margin-inline-end: 0px !important;
  }
  .ant-form-item-required::after {
    display: none !important;
    content: "" !important;
  }
  .ant-form-item-label label::after {
    content: "";
  }
`;

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    .input-wrap {
      display: flex;
      justify-content: flex-start;
      gap: 15px;
      align-items: center;
    }
    .flex-start {
      align-items: flex-start;
    }
    label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 130px !important;
    }
    label span {
      height: 24px;
      margin-left: 5px;
    }
  }
`;

const StyledInput = styled(Input)`
  height: 32px;
  border-radius: 4px;
`;

const StyledTextArea = styled(Input.TextArea)`
  padding: 15px 12px;
`;

const StyledDatePicker = styled(DatePicker)`
  .ant-picker {
    padding: 0px 11px;
  }
`;

const StyledUpload = styled(Upload)`
  .ant-upload-list-item {
    border: 1px solid #3b77d8 !important;
  }
`;

const StyledRadioGroup = styled(Radio.Group)`
  .ant-radio-wrapper {
    font-size: 13px;
    color: #676d9c;
    margin-right: 20px;
  }

  .ant-radio-inner {
    border-color: #3b77d8;

    &:after {
      background-color: #3b77d8;
    }
  }

  .ant-radio-checked .ant-radio-inner {
    border-color: #3b77d8;
  }
`;

const PopupAdd = () => {
  const [form] = Form.useForm();
  const [registrationType, setRegistrationType] = useState("image"); // 'image' or 'direct'
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);

    if (info.file.status === "done" && info.file.originFileObj) {
      form.setFieldValue("popupImage", info.file.originFileObj);
    }
  };

  const onFinished = async (values: any) => {
    try {
      const formData = new FormData();

      const sendData = {
        title: values.title,
        startDate: values.startDate,
        endDate: values.endDate,
        registrationType: values.registrationType,
        content: values.content,
      };

      formData.append(
        "req",
        new Blob([JSON.stringify(sendData)], { type: "application/json" }),
      );

      if (values.popupImage) {
        formData.append("popupImage", values.popupImage);
      }

      const response = await jwtAxios.post("/api/popup", formData, {
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
    <FormWrapper className="flex gap-5 w-full justify-center align-top">
      <div className="w-full mb-20">
        <h1 className="title-admin-font">
          팝업창 관리
          <p>공지 및 콘텐츠 관리 &gt; 팝업창 관리</p>
        </h1>

        <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
          <StyledForm form={form} onFinish={values => onFinished(values)}>
            <StyledFormItem
              name="title"
              label="제목"
              rules={[{ required: true, message: "제목을 입력해 주세요." }]}
            >
              <StyledInput
                className="input-admin-basic"
                placeholder="제목을 입력해 주세요."
              />
            </StyledFormItem>

            <Form.Item
              name="startDate"
              label="시작일"
              rules={[{ required: true, message: "시작일을 선택해 주세요." }]}
            >
              <StyledDatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="종료일"
              rules={[{ required: true, message: "종료일을 선택해 주세요." }]}
            >
              <StyledDatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="registrationType"
              label="등록방식"
              rules={[{ required: true, message: "등록방식을 선택해 주세요." }]}
            >
              <Radio.Group onChange={e => setRegistrationType(e.target.value)}>
                <Radio value="image">이미지 첨부</Radio>
                <Radio value="direct">직접 입력</Radio>
              </Radio.Group>
            </Form.Item>

            {registrationType === "image" && (
              <StyledFormItem
                name="popupImage"
                label="팝업 이미지"
                rules={[{ required: true, message: "이미지를 첨부해 주세요." }]}
              >
                <StyledUpload
                  listType="picture-card"
                  maxCount={1}
                  showUploadList={{ showPreviewIcon: false }}
                  fileList={fileList}
                  onChange={handleChange}
                  customRequest={({ onSuccess }) => {
                    setTimeout(() => {
                      onSuccess?.("ok");
                    }, 0);
                  }}
                >
                  <button
                    style={{ border: 0, background: "none" }}
                    type="button"
                  >
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </button>
                </StyledUpload>
              </StyledFormItem>
            )}

            {registrationType === "direct" && (
              <StyledFormItem
                name="content"
                label="팝업 내용"
                rules={[{ required: true, message: "내용을 입력해 주세요." }]}
              >
                <StyledTextArea
                  className="input-admin-basic"
                  rows={6}
                  placeholder="팝업 내용을 입력해 주세요."
                />
              </StyledFormItem>
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
          </StyledForm>
        </div>
      </div>
    </FormWrapper>
  );
};

export default PopupAdd;
