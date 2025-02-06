import { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import { message, Pagination } from "antd";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import jwtAxios from "../../apis/jwt";
import { useNavigate } from "react-router-dom";

function MyPageRecord() {
  const [myAcademyArray, setMyAcademyArray] = useState([]);
  const currentUserInfo = useRecoilValue(userInfo);
  const navigate = useNavigate();

  const titleName = "마이페이지";
  let menuItems = [];
  switch (currentUserInfo.roleId) {
    case 3: //학원 관계자
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "학원정보 관리", isActive: true, link: "/mypage" },
        { label: "리뷰 목록", isActive: false, link: "/mypage/academy/review" },
        { label: "좋아요 목록", isActive: false, link: "/mypage/academy/like" },
      ];
      break;
    case 2: //학부모
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "자녀 관리", isActive: false, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: false, link: "/mypage" },
        { label: "자녀 성적확인", isActive: true, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: false, link: "/mypage" },
        { label: "보호자 정보", isActive: false, link: "/mypage/parent" },
        { label: "나의 성적확인", isActive: true, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
  }

  const myAcademyList = async () => {
    try {
      //나의 수강목록 호출
      const res = await jwtAxios.get(
        `/api/joinClass?userId=${currentUserInfo.userId}&page=1`,
      );
      //console.log(res.data.resultData);
      setMyAcademyArray(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
    //console.log(page);
    //axios 데이터 호출할 때 페이지당 갯수랑 페이지 번호 전달
  };

  useEffect(() => {
    myAcademyList();
  }, []);

  useEffect(() => {
    if (!currentUserInfo.userId) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full">
        <h1 className="title-font">나의 성적확인</h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            <div className="flex items-center justify-center w-60">
              테스트일
            </div>
            <div className="flex items-center justify-center w-40">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              성적확인
            </div>
          </div>

          {myAcademyArray === null && (
            <div className="text-center p-4 border-b">
              등록한 학원이 없습니다.
            </div>
          )}

          {myAcademyArray?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3">
                  <img
                    src={item.acaPic ? item.acaPic : "aca_image_1.png"}
                    alt=" /"
                  />
                  <div>
                    <h4>{item.acaName}</h4>
                    <p className="text-gray-400 text-sm">
                      [수업명 : {item.className}]
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center w-60">
                2025-01-01
              </div>
              <div className="flex items-center justify-center w-40">
                등록완료
              </div>
              <div className="flex items-center justify-center w-40">
                <span className="small_line_button bg-gray-200 opacity-50">
                  성적확인
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={myAcademyArray?.length}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

export default MyPageRecord;
