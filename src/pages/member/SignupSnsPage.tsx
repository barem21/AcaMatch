import {
  Checkbox,
  CheckboxChangeEvent,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomInput from "../../components/CustomInput ";
import { SecondaryButton } from "../../components/modal/Modal";
import { FadeLoader } from "react-spinners";
import styled from "@emotion/styled";
import MainButton from "../../components/button/MainButton";
import { setCookie } from "../../utils/cookie";

interface FormValues {
  birth: dayjs.Dayjs;
  email: string;
  upw: string;
  confirmPassword: string;
  name: string;
  nickName: string;
  phone: string;
  userRole: string;
}

function SignupSnsPage() {
  const [searchParams, _setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [form] = Form.useForm();

  const [nickNameCheck, setNickNameCheck] = useState<number>(0);
  // const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSnsLoading, setIsSnsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(
    searchParams.get("email") ? searchParams.get("email") : "",
  );
  const [userId, setUserId] = useState<number>(
    Number(searchParams.get("user_id")) || 0,
  );

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [modalMessage, setModalMessage] = useState(""); // 메시지 상태 추가

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

  const plainOptions: { label: string; value: string }[] = [
    // 타입을 명시
    { label: "[필수] 이용 약관에 동의합니다.", value: "required-1" },
    {
      label: "[필수] 개인정보 수집 및 이용에 동의합니다.",
      value: "required-2",
    },
  ];

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    const userIdFromQuery = searchParams.get("user_id");
    const needMoreData = searchParams.get("need_more_data");
    const accessToken = searchParams.get("access_token");
    console.log("Email from query:", emailFromQuery);

    if (needMoreData === "false" && accessToken) {
      // 액세스 토큰을 쿠키에 저장
      setCookie("accessToken", accessToken, {
        path: "/",
        // secure: true,
        // sameSite: "strict",
        // expires: new Date(new Date().getTime() + 60 * 60 * 1000) // 1시간 후 만료 (필요에 따라 조정)
      });

      // 메인 페이지로 이동
      navigate("/");
      return;
    }

    if (emailFromQuery) {
      // 즉시 form 초기화
      form.setFieldsValue({
        email: emailFromQuery,
      });
      setEmail(emailFromQuery);
    }
    if (userIdFromQuery) {
      setUserId(Number(userIdFromQuery));
    }

    setIsSnsLoading(false);
  }, [navigate, searchParams]); // 의존성 배열을 비워서 컴포넌트 마운트 시에만 실행

  // const handleChangePassword = () => {
  //   // 기본 비밀번호 입력값 알아내고
  //   // const pw = form.getFieldValue("password");
  //   // 비교 비밀번호 입력값 알아내고, 비교한다.
  //   const pwConfirm = form.getFieldValue("passwordConfirm");
  //   if (pwConfirm) {
  //     // 비교 비밀 번호 있으면 비교하겠다.
  //     // setMatch(pw === pwConfirm);
  //   }
  // };

  const checkAll = plainOptions.length === checkedList.length;
  const indeterminate: boolean =
    checkedList.length > 0 && checkedList.length < plainOptions.length;
  // const onChange = (list: string[]) => {
  //   setCheckedList(list);
  // };
  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const newCheckedList = e.target.checked
      ? plainOptions.map(option => option.value)
      : [];
    setCheckedList(newCheckedList);
  };

  // const handleButton1Click = () => {
  //   console.log("중복확인");
  // };

  const onCheckboxChange = (list: string[]) => {
    setCheckedList(list);
  };

  const onFinish = async (values: FormValues) => {
    if (!checkAll) {
      message.error("전체 약관에 동의해주세요.");
      return;
    }

    const formattedBirthday = values.birth.format("YYYY-MM-DD");

    // API 요청 데이터 형식에 맞게 가공
    const requestData = {
      userId: userId,
      userRole: values.userRole,
      name: values.name,
      phone: values.phone,
      birth: formattedBirthday,
      nickName: values.nickName,
      upw: "Qwer@1234",
    };

    try {
      // API 호출
      const response = await axios.post(
        "/api/user/simple-login-user-data",
        requestData,
      );

      if (response.data.resultData) {
        console.log(response.data.resultData);
        message.success("회원가입이 완료되었습니다.");
        const accessToken = searchParams.get("access_token");
        if (accessToken) {
          setCookie("accessToken", accessToken, {
            path: "/",
          });
        }
        navigate("/");
      } else {
        message.error(response.data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      message.error("회원가입 처리 중 오류가 발생했습니다.");
    }

    try {
      setIsLoading(true);
      await axios.post("/api/user/sign-up", {
        ...values,
        birthday: formattedBirthday,
        signUpType: 0,
      });
      //console.log("Form values:", res);
      setIsLoading(false);
      navigate("/signup/end");
    } catch (error) {
      console.error(error);
    }
  };
  // 이메일 중복 체크 함수
  // 닉네임 중복 체크 함수
  const checkNickName = async () => {
    const nickName = form.getFieldValue("nickName");
    setModalMessage("");

    if (!nickName) {
      message.error("닉네임을 입력해주세요.");
      setModalMessage("닉네임을 입력해주세요.");
      setIsModalVisible(true);
      return;
    }
    if (nickName.length < 3) {
      message.error("닉네임은 최소 3글자 이상 입력해주세요.");
      setModalMessage("닉네임은 최소 3글자 이상 입력해주세요.");
      setIsModalVisible(true);
      return;
    }
    try {
      const res = await axios.get(
        `/api/user/check-duplicate/nick-name?text=${nickName}`,
      );
      console.log("닉네임 중복 체크 응답:", res.data); // 응답 데이터 확인

      if (res.data.resultData === 1) {
        console.log("사용 가능한 닉네임입니다"); // 조건 확인
        message.success("사용 가능한 닉네임입니다.");
        setModalMessage("사용 가능한 닉네임입니다");
        setNickNameCheck(2);
      } else {
        console.log("이미 사용중인 닉네임입니다"); // 조건 확인
        message.error("이미 사용중인 닉네임입니다.");
        setModalMessage("이미 사용중인 닉네임입니다.");
        setNickNameCheck(1);
      }

      console.log("닉네임 체크 상태:", nickNameCheck); // 상태 변경 확인
    } catch (error) {
      console.error("에러 발생:", error);
      // message.error("닉네임 중복 확인 중 오류가 발생했습니다.");
      message.error("이미 사용중인 닉네임입니다.");
      setModalMessage("이미 사용중인 닉네임입니다.");
    }
    setIsModalVisible(true);
  };

  if (isSnsLoading) {
    return <p>로딩 중...</p>; // 로딩 중일 때 표시할 UI
  }

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite">
        <div className="w-[1280px] flex items-center justify-between mx-auto  ">
          <img
            src="/logo2.png"
            className="w-[160px] cursor-pointer mr-[full]"
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
      </header>
      <div className="flex-col-start p-20 pt-[0] gap-10 w-[1280px] mx-auto">
        <div className="flex flex-col w-[960px] max-w-[960px] mx-auto">
          {/* 헤더 */}
          <div className="flex flex-col items-center p-5 w-full">
            <h1 className="w-full text-center font-lexend font-bold text-[22px] leading-7 text-brand-default">
              회원가입
            </h1>
          </div>

          {/* 메인 폼 */}
          <Form
            form={form}
            onFinish={values => onFinish(values)}
            className="flex flex-col justify-center mx-auto"
            initialValues={{
              email: searchParams.get("email") || "",
              password: "",
              confirmPassword: "",
              name: "",
              birthday: "",
              nickname: "",
              phoneNumber: "",
              signUpType: "0", // 초기값 설정 (예: 1)
            }}
          >
            <Form.Item name="signUpType" className="mb-0 h-[0]"></Form.Item>
            {/* 회원 타입 선택 */}
            <div className="flex gap-[12px] h-[80px] items-center">
              <label className="flex text-[16px] w-[120px] h-[56px] font-[500]">
                회원타입 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="userRole"
                rules={[
                  { required: true, message: "회원타입을 선택해주세요." },
                ]}
              >
                <div className="flex items-center w-full h-[56px]">
                  <Radio.Group
                    className="flex gap-[4px]"
                    options={[
                      { value: "STUDENT", label: "학생" },
                      { value: "PARENT", label: "학부모" },
                      { value: "ACADEMY", label: "학원 관계자" },
                      { value: "TEACHER", label: "교사" },
                    ]}
                  />
                </div>
              </Form.Item>
            </div>

            {/* 입력 필드들 */}
            {/* 이메일 필드 */}
            <div className="flex gap-[12px] h-[80px]">
              <label className="flex text-[16px] w-[120px] h-[56px] items-center font-[500]">
                이메일 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item name="email" className="mb-0" initialValue={email}>
                <Input
                  disabled // 이메일 필드 비활성화
                  value={email || ""}
                  className="w-[448px] h-[56px] bg-gray-100" // 비활성화된 상태를 시각적으로 표시
                  style={{
                    cursor: "not-allowed", // 커서 스타일 변경
                    color: "#666", // 텍스트 색상을 회색으로
                  }}
                />
              </Form.Item>
            </div>
            {/* <div className="flex gap-[12px] h-[80px]">
              <label className="flex text-[16px] w-[120px] h-[56px] items-center font-[500]">
                비밀번호 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="upw"
                validateTrigger="onChange"
                className="mb-0"
                rules={[
                  {
                    required: true,
                    message: "비밀번호는 필수 입력 항목입니다.",
                  },
                  {
                    pattern:
                      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,16}$/,
                    message:
                      "8~16자, 대문자, 소문자, 숫자, 특수문자를 조합해야 합니다.",
                  },
                ]}
              >
                <Input.Password
                  maxLength={16}
                  placeholder=" 8 ~ 16 자 이내의 특수문자와 대소문자 1자 이상 입력해주세요"
                  onChange={() => {
                    handleChangePassword();
                    form.validateFields(["password"]);
                  }}
                  style={{
                    width: "448px",
                    height: "56px",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                />
              </Form.Item>
            </div> */}
            {/* <div className="flex gap-[12px] h-[80px]">
              <label className="flex text-[16px] w-[120px] h-[56px] items-center font-[500]">
                비밀번호 확인 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                className="mb-0"
                dependencies={["password"]}
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "비밀번호 확인은 필수 입력 항목입니다.",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("upw") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "비밀번호가 일치하지 않습니다. 다시 입력해주세요.",
                        ),
                      );
                    },
                  }),
                ]}
              >
                <div className="flex items-center w-full gap-[12px]">
                  <Input.Password
                    maxLength={16}
                    className="ant-form-item-control-input-content"
                    placeholder="비밀 번호를 입력해 주세요"
                    style={{
                      width: "448px",
                      height: "56px",
                      borderRadius: "12px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </Form.Item>
            </div> */}
            <div className="flex gap-[12px] h-[80px]">
              <label className="flex text-[16px] w-[120px] h-[56px] items-center font-[500]">
                이름 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="name"
                className="mb-0"
                rules={[{ required: true, message: "이름을 입력해주세요." }]}
              >
                <div className="flex items-center w-full gap-[12px]">
                  <CustomInput placeholder="이름을 입력해 주세요" />
                </div>
              </Form.Item>
            </div>
            {/* 생일 */}
            <div className="flex gap-[12px] h-[80px]">
              <label className="flex text-[16px] w-[120px] h-[56px] items-center font-[500]">
                생년월일 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="birth"
                rules={[
                  { required: true, message: "생년월일을 선택해 주세요!" },
                ]}
                style={{ width: "448px", height: "56px" }}
              >
                <DatePicker
                  format="YYYY-MM-DD" // 원하는 날짜 형식
                  placeholder="생년월일을 선택하세요"
                  style={{ width: "100%", height: "56px" }}
                  inputReadOnly={true} // 텍스트 입력을 막음
                />
              </Form.Item>
            </div>
            <div className="flex gap-[12px] h-[80px]">
              <label className="flex text-[16px] w-[120px] h-[56px] items-center font-[500]">
                닉네임 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="nickName"
                className="mb-0"
                rules={[
                  { required: true, message: "닉네임을 입력해주세요." },
                  { min: 3, message: "닉네임은 최소 3글자 이상 입력해주세요." },
                ]}
              >
                <div className="flex items-center w-full gap-[12px]">
                  <CustomInput
                    placeholder="한글자 이상의 닉네임을 입력해주세요"
                    width="351px"
                    onChange={() => setNickNameCheck(0)} // 입력값 변경시 체크 초기화
                  />
                </div>
              </Form.Item>
              <SecondaryButton
                onClick={() => {
                  checkNickName();
                }}
                className="w-[84px] h-[56px]"
              >
                중복확인
              </SecondaryButton>
            </div>
            <div className="flex gap-[12px] h-[80px]">
              <label className="flex text-[16px] w-[120px] h-[56px] items-center font-[500]">
                휴대폰번호 &nbsp;
                <label className="text-[#D9534F]">*</label>
              </label>
              <Form.Item
                name="phone"
                className="mb-0"
                rules={[
                  { required: true, message: "전화번호를 입력해주세요." },
                ]}
              >
                <div className="flex items-center w-full gap-[12px]">
                  <CustomInput placeholder="' - ' 을 포함한 번호를 입력해 주세요" />
                </div>
              </Form.Item>
            </div>

            {/* 약관 동의 */}
            <div className="flex flex-col items-end mt-[4px]">
              <div className="flex flex-col border border-[#DBE0E5] rounded-xl w-[448px] ">
                <div className="border-b border-[#DBE0E5] p-2 pl-4">
                  <Form.Item
                    valuePropName="checked"
                    // className="h-[32px] flex"
                    className="h-[10px] flex"
                    // rules={[
                    //   { required: true, message: "전체 약관 동의를 해주세요." },
                    // ]} // 약관 동의 유효성 검사 추가
                  >
                    <Checkbox
                      indeterminate={indeterminate}
                      onChange={onCheckAllChange}
                      checked={checkAll}
                    >
                      약관 전체 동의
                    </Checkbox>
                  </Form.Item>
                </div>
                <div className="p-4">
                  <Checkbox.Group
                    options={plainOptions}
                    value={checkedList}
                    onChange={onCheckboxChange}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  />
                </div>
              </div>
              {/* 회원가입 버튼 */}
              <SecondaryButton
                htmlType="submit"
                className="w-[448px] h-10 rounded-xl font-bold text-sm text-brand-default mt-[8px]"
              >
                회원가입
              </SecondaryButton>
            </div>
          </Form>

          {isLoading && (
            <LoadingWrap>
              <FadeLoader color="#fff" width={10} height={30} margin={20} />
            </LoadingWrap>
          )}
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"중복 확인"}
        content={<p className="mt-[25px] mb-[15px]">{modalMessage}</p>}
        onButton2Click={() => setIsModalVisible(false)}
        button2Text={"확인"}
        modalWidth={400}
      />
    </>
  );
}

export default SignupSnsPage;

interface CustomModalProps {
  visible: boolean;
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  onButton1Click?: () => void;
  onButton2Click?: () => void;
  button1Text?: string;
  button2Text?: string;
  modalWidth?: number;
  modalHeight?: number;
  btWidth?: number; // 버튼 너비
  btHeight?: number; // 버튼 높이
  gap?: string; // gap 값
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  content,
  onButton2Click,
  button2Text = "취소하기",
  modalWidth = 400,
  modalHeight,
}) => {
  if (!visible) return null; // visible이 false일 경우 렌더링하지 않음

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 modal-popup-wrap"
      style={{
        width: "100%", // 부모 div가 전체 화면을 차지하게
        height: "100vh", // 화면 전체 높이를 차지하게
      }}
    >
      <div
        className={`bg-white rounded-3xl p-6 transition-all ease-out duration-300
          ${visible ? "opacity-100 animate-fade-in animate-scale-up" : "opacity-0"}`}
        style={{
          width: `${modalWidth}px`, // 동적 width 적용
          height: modalHeight ? `${modalHeight}px` : "auto", // 동적 height 적용
        }}
      >
        <h2 className="text-2xl font-bold text-left mb-[30px]">{title}</h2>
        <p className="text-base text-left mb-5">{content}</p>
        <div className="flex justify-end space-x-[10px]">
          <MainButton
            type="primary"
            onClick={onButton2Click}
            className={`px-4 py-2 w-[100%] h-[100%]`}
          >
            {button2Text}
          </MainButton>
        </div>
      </div>
    </div>
  );
};
