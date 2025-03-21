import { Checkbox, Form, Input, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import userInfo from "../../atoms/userInfo";
import MainButton from "../../components/button/PrimaryButton";
import { SecondaryButton } from "../../components/modal/Modal";
import { removeCookie, setCookie, getCookie } from "../../utils/cookie";
import { useState } from "react";

function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const setUserInfo = useSetRecoilState(userInfo);
  const [msg, setMsg] = useState("");

  const handleOAuthLogin = (provider: "google" | "kakao" | "naver") => {
    // const redirectUrl = "http://acamatch.site:5233/fe/redirect"; // 이전 코드
    // const redirectUrl = "http://localhost:5173/fe/redirect";
    const redirectUrl = "http://acamatch.site:5233/fe/redirect";
    const backendUrl = "http://acamatch.site:5233";
    const authUrl = `${backendUrl}/oauth2/authorization/${provider}?redirect_uri=${redirectUrl}`;
    window.location.href = authUrl;
  };
  // http://acamatch.site:5233/oauth2/authorization/google?redirect_uri=http://localhost:5173/fe/redirect

  const onFinish = async (values: any) => {
    try {
      const { remember, ...loginData } = values; // remember 값을 분리

      const response = await axios.post("/api/user/sign-in", loginData);
      // console.log(response.data.resultData);

      const { name, roleId, userId } = response.data.resultData;

      setCookie("accessToken", response.data.resultData.accessToken, {
        path: "/",
      });

      // 아이디 기억하기가 체크되어 있으면 이메일 쿠키 저장
      if (remember) {
        setCookie("email", values.email, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        }); // 30일 유지
      } else {
        // 체크 해제되어 있으면 이메일 쿠키 삭제
        removeCookie("email");
      }
      // console.log(roleId);

      if (response.data.resultData.userRole === 0) {
        navigate("/admin");
      } else {
        navigate("/");
      }
      setUserInfo({
        name,
        roleId: String(roleId),
        userId: String(userId),
      });
    } catch (error: unknown) {
      console.error(error);
      removeCookie("accessToken");

      // error 객체를 AxiosError로 타입 체크
      if (axios.isAxiosError(error)) {
        // 400 Bad Request 에러 처리
        if (
          error.response?.status === 400 ||
          error.code === "ERR_BAD_REQUEST"
        ) {
          // 서버에서 보낸 에러 메시지가 있는 경우
          if (error.response?.data?.resultMessage) {
            message.error(error.response.data.resultMessage);
            setMsg(error.response.data.resultMessage);
          } else {
            // 서버에서 보낸 에러 메시지가 없는 경우
            message.error("로그인에 실패했습니다. 입력 정보를 확인해주세요.");
            setMsg("로그인에 실패했습니다. 입력 정보를 확인해주세요.");
          }
        } else if (
          error.response?.data?.resultMessage ===
          "아이디 또는 비밀번호가 일치하지 않습니다."
        ) {
          message.error("아이디 또는 비밀번호가 일치하지 않습니다.");
          setMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
        } else {
          // 기타 에러 처리
          message.error(
            "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          );
          setMsg("로그인 중 오류가 발생했습니다.");
        }
      } else {
        // Axios 에러가 아닌 경우
        message.error(
          "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
        setMsg("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div>
      <header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite">
        <div className="w-[1280px] flex items-center justify-between mx-auto max-[640px]:w-full max-[640px]:h-[64px] max-[640px]:px-4">
          <img
            src="/logo2.png"
            className="w-[160px] cursor-pointer mr-[full]"
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
      </header>
      <Form
        form={form}
        onFinish={onFinish}
        className="flex flex-col justify-center mx-auto"
        initialValues={{
          email: getCookie("email"),
          remember: Boolean(getCookie("email")), // 이메일 쿠키 존재하면 체크박스 체크
        }}
      >
        <main className="flex justify-center items-center">
          <div className="flex flex-col items-center px-5 py-6 w-full max-w-[960px]">
            {/* 로그인 Title */}
            <div className="flex flex-col items-center px-4 py-3 w-full h-[60px]">
              <p className="text-center text-text-dark text-2xl font-[600]">
                로그인
              </p>
            </div>

            <div className="flex flex-col mb-[16px] max-[640px]:w-full">
              {/* 이메일 필드 */}
              <label className="flex text-[16px] w-[120px] font-[500] mb-[8px]">
                이메일 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "이메일을 입력해주세요" },
                  {
                    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                    message: "올바른 이메일 형식이 아닙니다",
                  },
                ]}
              >
                <Input
                  maxLength={254}
                  placeholder="이메일을 입력해주세요"
                  style={{ height: "56px" }}
                  className="w-[480px] max-[640px]:w-full"
                />
              </Form.Item>

              {/* 비밀번호 */}
              <label className="flex text-[16px] w-[120px] font-[500] my-[8px]">
                비밀번호 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="upw"
                rules={[
                  {
                    required: true,
                    message: "비밀번호는 필수 입력 항목입니다.",
                  },
                  {
                    pattern:
                      /^(?=.*[A-Za-z])(?=.*\d|.*\W)|(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,16}$/,
                    message:
                      "8~16자, 대문자, 소문자, 숫자, 특수문자를 조합해야 합니다.",
                  },
                ]}
              >
                <Input.Password
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  style={{ height: "56px" }}
                  className="w-[480px] max-[640px]:w-full"
                />
              </Form.Item>

              <div className="flex h-[30px] items-center justify-center">
                <span className="text-[#D9534F]">{msg}</span>
              </div>

              {/* 아이디 기억하기 */}
              <div className="flex items-center justify-between mt-[0px]">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>
                    <span className="text-[14px] text-brand-default">
                      아이디 기억하기
                    </span>
                  </Checkbox>
                </Form.Item>
                <span
                  className="text-right text-text-gray text-sm mt-2 whitespace-nowrap cursor-pointer"
                  onClick={() => navigate("/forgotPw")}
                >
                  비밀번호를 잊으셨나요?
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-[8px] max-[640px]:w-full">
              {/* 회원가입 버튼 */}
              <SecondaryButton
                onClick={() => navigate("/signup")}
                className={`px-4 py-2 w-[480px] h-[40px] max-[640px]:w-full`}
              >
                회원가입
              </SecondaryButton>
              <SecondaryButton
                onClick={() => handleOAuthLogin("naver")}
                className="px-4 py-2 w-[480px] h-[40px] bg-[#03c75a] text-[#ffffff] max-[640px]:w-full"
              >
                <div className="flex items-center w-[140px] justify-between">
                  <img src="btnG_Naver2.png" className="w-[30px] h-[30px]" />
                  <span className="flex">네이버 로그인</span>
                </div>
              </SecondaryButton>

              <SecondaryButton
                onClick={() => handleOAuthLogin("google")}
                className="px-4 py-2 w-[480px] h-[40px] bg-[#e5e5e6] text-[#242424] max-[640px]:w-full"
              >
                <div className="flex items-center w-[140px] justify-between">
                  <img
                    src="/Google_G_logo.svg.png"
                    className="w-[20px] h-[20px] ml-[5px]"
                  />
                  <span className="flex">구글 로그인</span>
                </div>
              </SecondaryButton>

              <SecondaryButton
                onClick={() => handleOAuthLogin("kakao")}
                className="px-4 py-2 w-[480px] h-[40px] text-[#242424] bg-[#fbe400] max-[640px]:w-full"
              >
                <div className="flex items-center w-[140px] justify-between">
                  <img
                    src="/kakao-logo.png"
                    className="w-[20px] h-[20px] ml-[5px]"
                  />
                  <span className="flex">카카오 로그인</span>
                </div>
              </SecondaryButton>

              {/* <SecondaryButton
                onClick={() => navigate("/")}
                className={`px-4 py-2 w-[480px] h-[40px]`}
              >
                Log in with Google
              </SecondaryButton> */}

              {/* 로그인 버튼 */}
              <MainButton
                type="primary"
                htmlType="submit"
                onClick={() => {}}
                className={`px-4 py-2 w-[480px] h-[40px] max-[640px]:w-full`}
              >
                로그인
              </MainButton>
            </div>
          </div>
        </main>
      </Form>
    </div>
  );
}

export default LoginPage;
