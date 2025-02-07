import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import SideBar from "../../components/SideBar";
import CustomModal from "../../components/modal/Modal";
import userInfo from "../../atoms/userInfo";
import { getCookie } from "../../utils/cookie";
import { message, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import jwtAxios from "../../apis/jwt";
import { Cookies } from "react-cookie";

function MyPage() {
  const cookies = new Cookies();
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [mypageAcademyList, setMypageAcademyList] = useState([]); //내 학원 내역
  const [isModalVisible, setIsModalVisible] = useState(false);
  const currentUserInfo = useRecoilValue(userInfo);
  const accessToken = getCookie("accessToken");
  const navigate = useNavigate();

  const titleName = "마이페이지";
  let menuItems = [];
  let mypageUrl = "";
  switch (currentUserInfo.roleId) {
    case 3: //학원 관계자
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "학원정보 관리", isActive: true, link: "/mypage" },
        { label: "리뷰 목록", isActive: false, link: "/mypage/academy/review" },
        { label: "좋아요 목록", isActive: false, link: "/mypage/academy/like" },
      ];
      mypageUrl = "/mypage/academy";
      break;
    case 2: //학부모
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "자녀 관리", isActive: false, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: true, link: "/mypage" },
        { label: "자녀 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      mypageUrl = "/mypage";
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: true, link: "/mypage" },
        { label: "보호자 정보", isActive: false, link: "/mypage/parent" },
        { label: "나의 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      mypageUrl = "/mypage";
      break;
  }

  const myAcademyList = async page => {
    try {
      //나의 수강목록 호출
      const res = await jwtAxios.get(
        `/api/joinClass?userId=${currentUserInfo.userId}&page=${page}`,
      );

      if (res.data.resultData?.length > 0) {
        console.log(res.data.resultData);
        setMypageAcademyList(res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
    //console.log(page);
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    navigate(mypageUrl); //학원 관계자는 마이페이지 메인 리다이렉션
  }, []);

  useEffect(() => {
    myAcademyList(1);
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full">
        <h1 className="title-font">나의 학원정보</h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            <div className="flex items-center justify-center w-60">등록일</div>
            <div className="flex items-center justify-center w-40">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              취소하기
            </div>
          </div>

          {mypageAcademyList?.length === 0 && (
            <div className="text-center p-4 border-b">
              등록한 학원이 없습니다.
            </div>
          )}

          {mypageAcademyList.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/academy/detail?id=${item.acaId}`)}
                >
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.acaPic
                          ? `http://112.222.157.156:5223/pic/academy/${item.acaId}/${item.acaPic}`
                          : "aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.acaName}</h4>
                    {item.classList.length > 0 ? (
                      <div className="flex text-gray-400 text-sm">
                        {" "}
                        [수업명 :&nbsp;
                        {item.classList.map((classItem, index) => (
                          <p key={index} className="text-sm">
                            {classItem.className}
                            {item.classList.length !== index + 1 ? ", " : ""}
                          </p>
                        ))}
                        ]
                      </div>
                    ) : (
                      ""
                    )}
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
                  취소하기
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={mypageAcademyList?.length}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={resultTitle}
          content={resultMessage}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소"}
          button2Text={"확인"}
          modalWidth={400}
        />
      </div>
    </div>
  );
}

export default MyPage;
