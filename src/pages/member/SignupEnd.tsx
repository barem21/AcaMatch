import { useNavigate } from "react-router-dom";
import MainButton from "../../components/button/MainButton";

function SignupEnd() {
  const navigate = useNavigate();

  const containerStyle = "flex flex-col items-start w-[960px] mx-auto";
  const frameStyle = "flex flex-col items-center w-full";

  return (
    <div>
      <header className="sticky top-0 z-50 flex items-center h-16 bg-white border-b border-brand-BTWhite">
        <div className="w-[1280px] flex items-center justify-between mx-auto">
          <img
            src="/logo2.png"
            className="w-[160px] cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
      </header>

      <main className={`${containerStyle} py-[50px] h-[713px]`}>
        {/* 이메일 이미지 섹션 */}
        <div className={`${frameStyle} p-3`}>
          <div className="w-full h-[218px] bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src="/mail.jpg"
              alt="mail"
              className="w-auto h-auto max-w-full object-contain"
            />
          </div>
        </div>

        {/* 제목 섹션 */}
        <div className={`${frameStyle} py-5 px-4`}>
          <h1 className="text-2xl font-bold text-[#242424]">
            이메일을 보내드렸습니다!
          </h1>
        </div>

        {/* 안내 텍스트 섹션 */}
        <div className={`${frameStyle} px-4 py-1`}>
          <p className="text-base text-[#242424]">
            이메일을 확인하시고, 안내에 따라 회원가입을 완료해 주세요.
          </p>
        </div>

        {/* 로그인 버튼 섹션 */}
        <div className={`${frameStyle} p-3`}>
          <MainButton
            className="w-[480px] h-12 bg-[#3B77D8] rounded-xl text-white font-bold"
            onClick={() => navigate("/login")}
          >
            로그인
          </MainButton>
        </div>

        {/* 스팸 폴더 안내 섹션 */}
        <div className={`${frameStyle} px-4 py-1`}>
          <p className="text-sm text-[#637887]">
            이메일을 받지 못하셨나요? 스팸 폴더를 확인해주세요
          </p>
        </div>
      </main>
    </div>
  );
}

export default SignupEnd;
