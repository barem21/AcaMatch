import { useNavigate } from "react-router-dom";
import MainButton from "../components/button/Mainbutton";

function NotFoundPage() {
  const navigate = useNavigate();

  const containerStyle = "flex flex-col items-start w-[960px] mx-auto";
  const frameStyle = "flex flex-col items-center w-full";
  return (
    <div className="w-[1280px] flex items-center justify-between mx-auto">
      <main
        className={`${containerStyle} py-[50px] h-[713px] flex items-center mx-auto`}
      >
        {/* 이메일 이미지 섹션 */}
        <div className={`${frameStyle} p-3`}>
          <div className="w-full h-[218px] bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src="/404_1.png"
              alt="mail"
              className="w-auto h-auto max-w-full object-contain"
            />
          </div>
        </div>

        {/* 제목 섹션 */}
        <div className={`${frameStyle} py-5 px-4`}>
          <h1 className="text-2xl font-bold text-[#242424]">
            잘못된 경로로 접근하셨습니다.
          </h1>
        </div>

        {/* 로그인 버튼 섹션 */}
        <div className={`${frameStyle} p-3`}>
          <MainButton
            className="w-[480px] h-12 bg-[#3B77D8] rounded-xl text-white font-bold"
            onClick={() => navigate("/")}
          >
            홈으로 돌아가기
          </MainButton>
        </div>

        {/* 스팸 폴더 안내 섹션 */}
        <div className={`${frameStyle} px-4 py-1`}>
          <p className="text-sm text-[#637887]">주소를 다시 확인해 주세요.</p>
        </div>
      </main>
    </div>
  );
}

export default NotFoundPage;
