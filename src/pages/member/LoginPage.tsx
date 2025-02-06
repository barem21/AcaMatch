import { Checkbox, Form, Input, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import userInfo from "../../atoms/userInfo";
import MainButton from "../../components/button/MainButton";
import { SecondaryButton } from "../../components/modal/Modal";
import { removeCookie, setCookie, getCookie } from "../../utils/cookie";

function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const setUserInfo = useSetRecoilState(userInfo);

  const onFinish = async (values: any) => {
    try {
      const { remember, ...loginData } = values; // remember 값을 분리

      const response = await axios.post("/api/user/sign-in", loginData);
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

      navigate("/");
      setUserInfo({
        name,
        roleId: String(roleId),
        userId: String(userId),
      });
    } catch (error) {
      console.error(error);
      removeCookie("accessToken");
      message.error("아이디와 비밀번호가 일치하지않습니다.");
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

            <div className="flex flex-col mb-[16px]">
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
                  placeholder="이메일을 입력해주세요"
                  style={{ width: "480px", height: "56px" }}
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
                  style={{ width: "480px", height: "56px" }}
                />
              </Form.Item>

              {/* 아이디 기억하기 */}
              <div className="flex items-center justify-between mt-[8px]">
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

            <div className="flex flex-col items-center gap-[8px]">
              {/* 회원가입 버튼 */}
              <SecondaryButton
                onClick={() => navigate("/signup")}
                className={`px-4 py-2 w-[480px] h-[40px]`}
              >
                회원가입
              </SecondaryButton>

              {/* SNS 로그인 * /}
              <SecondaryButton
                onClick={() => navigate("/")}
                className={`px-4 py-2 w-[480px] h-[40px]`}
              >
                Log in with kakao
              </SecondaryButton>

              {/ * Google 로그인 * /}
              <SecondaryButton
                onClick={() => navigate("/")}
                className={`px-4 py-2 w-[480px] h-[40px]`}
              >
                Log in with Google
              </SecondaryButton>
              */}

              {/* 로그인 버튼 */}
              <MainButton
                type="primary"
                htmlType="submit"
                onClick={() => {}}
                className={`px-4 py-2 w-[480px] h-[40px]`}
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
