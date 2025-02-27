import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Form, Image, Input, message, Upload } from "antd";
import axios from "axios";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useSearchParams } from "react-router-dom";

const AcademyInfo = styled.div`
  .ant-form-item-label {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .ant-form-item-label label {
    min-width: 130px !important;
    color: #676d9c;
    font-size: 13px;
  }
  .ant-form-item-required::before {
    content: "" !important;
    margin-inline-end: 0px !important;
  }
  .ant-form-item-required::after {
    content: "*" !important;
    font-size: 1.25rem;
    color: #ff3300;
  }
  .ant-form-item-label label::after {
    content: "";
  }

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
    .ant-form-item-label label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 130px !important;
    }
    .ant-form-item-label label span {
      height: 24px;
      margin-left: 5px;
      color: #ff3300;
      font-size: 1.25rem;
    }
    input {
      height: 32px;
    }
    textarea {
      padding: 15px 12px;
    }

    .input,
    .ant-input-password {
      border-radius: 12px;
    }

    span.readonly {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0px 11px;
      border-radius: 12px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 0.9rem;
    }
  }
  .ant-checkbox-wrapper {
    margin-right: 25px;
  }
  .ant-input-affix-wrapper,
  .ant-picker {
    padding: 0px 11px;
  }
  .ant-input-status-error {
    border: 1px solid #3b77d8 !important;
  }
  .ant-form-item-explain-error {
    padding-left: 12px;
    color: #3b77d8;
    font-size: 0.85rem;
  }
  .ant-upload-list-item {
    border: 1px solid #3b77d8 !important;
  }
`;

function AcademyTextbookAdd(): JSX.Element {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  // const [fileList, setFileList] = useState([]);
  const [searchParams] = useSearchParams();
  const acaId: number = parseInt(searchParams.get("acaId") || "", 0);
  const classId: number = parseInt(searchParams.get("classId") || "", 0);

  //첨부파일 처리
  const handleChange = (info: any) => {
    form.setFieldValue("file", info.file.originFileObj);
  };

  const onFinished = async (values: any) => {
    console.log(values);
    try {
      const formData = new FormData(); // pic이 있는 경우에만 추가
      if (values.file) {
        formData.append("file", values.file);
      }
      const reqData = {
        bookName: values.bookName,
        bookPrice: parseInt(values.bookPrice),
        bookComment: values.bookComment,
        manager: values.manager,
        classId: classId,
        bookAmount: parseInt(values.bookAmount),
      };

      //JSON 형태로 데이터를 만들어 formData에 추가
      formData.append(
        "req",
        new Blob([JSON.stringify(reqData)], { type: "application/json" }),
      );

      const header = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await axios.post(`/api/book`, formData, header);
      if (res.data.resultData === 1) {
        message.success("교재 등록이 완료되었습니다.");
        navigate(`../academy/textBook?acaId=${acaId}&classId=${classId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AcademyInfo className="w-full">
      <div className="flex gap-5 w-full justify-center pb-10">
        <div className="w-full">
          <h1 className="title-admin-font">
            교재 관리
            <p>학원 관리 &gt; 학원 강의목록 &gt; 교재 관리</p>
          </h1>

          <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
            <Form form={form} onFinish={values => onFinished(values)}>
              <Form.Item
                name="manager"
                label="담당자 이름"
                rules={[
                  { required: true, message: "담당자 이름을 입력해 주세요." },
                ]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="담당자 이름을 입력해 주세요."
                />
              </Form.Item>

              <Form.Item
                name="bookName"
                label="교재 이름"
                rules={[
                  { required: true, message: "교재 이름을 입력해 주세요." },
                ]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="교재 이름을 입력해 주세요."
                />
              </Form.Item>

              <Form.Item
                name="bookAmount"
                label="수량"
                rules={[{ required: true, message: "수량을 입력해 주세요." }]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="수량을 입력해 주세요."
                />
              </Form.Item>

              <Form.Item
                name="bookPrice"
                label="가격"
                rules={[{ required: true, message: "가격을 입력해 주세요." }]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="가격을 입력해 주세요."
                />
              </Form.Item>

              <Form.Item name="file" label="교재 이미지">
                <div>
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    onChange={handleChange}
                    showUploadList={{ showPreviewIcon: false }}
                  >
                    <button
                      style={{ border: 0, background: "none" }}
                      type="button"
                    >
                      <PlusOutlined />
                    </button>
                  </Upload>

                  <Image
                    wrapperStyle={{ display: "none" }}
                    preview={{
                      visible: previewOpen,
                      onVisibleChange: visible => setPreviewOpen(visible),
                      afterOpenChange: visible =>
                        !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                  />
                </div>
              </Form.Item>

              <Form.Item
                name="bookComment"
                label="교재 소개글"
                className="h-44"
                rules={[
                  { required: true, message: "교재 소개글을 입력해 주세요." },
                ]}
              >
                <ReactQuill
                  placeholder="교재 소개글을 작성해 주세요."
                  className="h-32"
                />
              </Form.Item>

              <div className="flex justify-end pt-3 border-t gap-3">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => navigate(-1)}
                >
                  취소하기
                </button>

                <Form.Item className="mb-0">
                  <Button htmlType="submit" className="btn-admin-ok">
                    등록하기
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </AcademyInfo>
  );
}

export default AcademyTextbookAdd;
