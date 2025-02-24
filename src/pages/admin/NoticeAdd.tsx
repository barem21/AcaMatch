import styled from "@emotion/styled";
import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const InputWrapper = styled.div`
  width: 100%;
  .ant-input {
    width: 1208px;
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

  const state = searchParams.get("state");

  const onFinished = async (values: any) => {
    console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가
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
          공지사항 관리
          <p>공지 및 콘텐츠 관리 {">"} 공지사항 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between p-2 border-b">
              <div className="flex items-center gap-1">
                <label className="min-w-[100px] text-sm">제목</label>
                <InputWrapper>
                  <Form.Item name="title" className="m-0">
                    <Input />
                  </Form.Item>
                </InputWrapper>
              </div>
            </div>
            <div className=" flex p-2 pl-3 border-b">
              <div className="flex items-center h-[460px] my-auto">
                <label className=" w-[100px] text-sm">내용</label>
              </div>
              <div className="w-full">
                <Form.Item name="content" className="w-full m-0">
                  <Input.TextArea rows={20} style={{ width: "100%" }} />
                </Form.Item>
              </div>
            </div>
            <div className="flex justify-end pt-3 gap-3">
              <button
                type="button"
                className="btn-admin-cancel"
                onClick={() => navigate(-1)}
              >
                취소하기
              </button>

              <Form.Item className="mb-0">
                <Button
                  htmlType="submit"
                  className="btn-admin-ok"
                  //   disabled={isSubmitting}
                >
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

export default NoticeAdd;
