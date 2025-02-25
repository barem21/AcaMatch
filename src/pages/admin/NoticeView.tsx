import styled from "@emotion/styled";
import { Button, Form } from "antd";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
const NoticeView = () => {
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
          공지사항 보기
          <p>공지 및 콘텐츠 관리 {">"} 공지사항 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className=" justify-between p-2 border-b">
              <div className="flex items-center gap-1">
                <label className="min-w-[100px] text-sm">제목</label>
                <InputWrapper>
                  <Form.Item name="title" className="m-0 text-[#666]">
                    제목입니다.
                  </Form.Item>
                </InputWrapper>
              </div>
            </div>
            <div className=" flex p-2 pl-3 border-b h-[600px] text-[#666]">
              내용입니다
            </div>
            <div className="flex justify-end p-3 gap-3 border-b">
              <button
                type="button"
                className="btn-admin-cancel"
                onClick={() => navigate(-1)}
              >
                삭제하기
              </button>

              <Form.Item className="mb-0">
                <Button
                  htmlType="submit"
                  className="btn-admin-ok"
                  //   disabled={isSubmitting}
                >
                  수정하기
                </Button>
              </Form.Item>
              <button
                type="button"
                className="h-[30px] px-[10px] bg-[#ececec] rounded-[4px] text-[#242424] text-[12px]"
                onClick={() => navigate(-1)}
              >
                목록으로
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NoticeView;
