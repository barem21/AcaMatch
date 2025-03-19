import styled from "@emotion/styled";
import { Form, Input, message } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";
import MainButton from "../../components/button/PrimaryButton";

function ForgotPw() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const LoadingWrap = styled.div`
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  `;

  const onFinish = async (values: any) => {
    try {
      setIsLoading(true);
      await axios.post("/api/user/temp-pw", values);
      //console.log(res);
      setIsLoading(false);
      navigate("/signup/end");
    } catch (error) {
      console.log(error);
      message.error("존재하지 않는 이메일입니다.");
    }
  };

  return (
    <div>
      <header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite">
        <div className="w-[1280px] flex items-center justify-between mx-auto">
          <img
            src="/logo2.png"
            className="w-[160px] cursor-pointer mr-[full]"
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
      </header>
      <div className="flex justify-center items-center">
        <Form
          form={form}
          onFinish={onFinish}
          className="flex flex-col items-center"
        >
          <h1 className="title-font">비밀번호 재설정</h1>
          <div className="flex flex-col gap-2">
            <p className="text-[16px] ">
              비밀번호 재설정을 위해 이메일을 입력해주세요.
            </p>
            <Form.Item
              className="m-0"
              name="email"
              rules={[
                { required: true, message: "이메일을 입력해주세요." },
                { type: "email", message: "유효한 이메일을 입력해주세요." },
              ]}
            >
              <Input className="w-[480px] h-[56px]" placeholder="이메일" />
            </Form.Item>

            <MainButton
              type="primary"
              htmlType="submit"
              onClick={() => {}}
              className={`px-4 py-2 w-[480px] h-[40px]`}
            >
              비밀번호 변경
            </MainButton>
          </div>
        </Form>

        {isLoading && (
          <LoadingWrap>
            <FadeLoader color="#fff" width={10} height={30} margin={20} />
          </LoadingWrap>
        )}
      </div>
    </div>
  );
}

export default ForgotPw;
