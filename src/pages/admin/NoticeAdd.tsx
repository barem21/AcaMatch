import styled from "@emotion/styled";
import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import { message } from "antd";
import axios from "axios";
import jwtAxios from "../../apis/jwt";

const InputWrapper = styled.div`
  width: 100%;
  .ant-input {
    height: 40px;
    border-radius: 4px;
  }
  .ant-form-item {
    width: 100%;
  }
`;
const NoticeAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const { userId } = useRecoilValue(userInfo);

  const state = searchParams.get("state");

  const onFinished = async (values: any) => {
    try {
      const postData = {
        userId: userId,
        boardName: values.title,
        boardComment: values.content,
      };

      console.log("Request Data:", postData); // 요청 데이터 확인

      // FormData로 변환하여 전송
      const formData = new FormData();
      formData.append("userId", (userId ?? -1).toString());
      formData.append("boardName", values.title);
      formData.append("boardComment", values.content);

      const response = await jwtAxios.post("/api/board", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Content-Type 변경
        },
      });

      console.log("Response:", response.data); // 응답 데이터 확인

      if (response.data.resultMessage) {
        message.success("공지사항이 등록되었습니다.");
        navigate("/admin/notice-content");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data); // 에러 상세 정보 확인
      message.error("공지사항 등록에 실패했습니다.");
    }
  };

  // const onChange = () => {
  //   form.submit();
  // };

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      state: state ? parseInt(state) : "all",
      search: "",
      showCnt: 40,
    });
  }, []);
  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          공지사항 등록
          <p>
            공지 및 콘텐츠 관리 {">"} 공지사항 관리 {">"} 공지사항 등록
          </p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between p-2 border-b">
              <div className="flex items-center gap-1 w-full">
                <label className="min-w-[100px] text-sm">제목</label>
                <Form.Item
                  name="title"
                  className="w-full m-0"
                  rules={[{ required: true, message: "제목을 입력해주세요" }]}
                >
                  <Input
                    placeholder="제목을 입력해주세요"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex justify-between p-2 border-b">
              <div className="flex items-center gap-1 w-full">
                <label className="min-w-[100px] text-sm">내용</label>
                <Form.Item
                  name="content"
                  className="w-full m-0"
                  rules={[{ required: true, message: "내용을 입력해주세요" }]}
                >
                  <Input.TextArea
                    rows={20}
                    placeholder="내용을 입력해주세요"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex justify-end p-3 gap-3 border-b">
              <button
                type="button"
                className="btn-admin-cancel"
                onClick={() => navigate(-1)}
              >
                취소하기
              </button>
              <Button htmlType="submit" className="btn-admin-ok">
                등록하기
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NoticeAdd;
