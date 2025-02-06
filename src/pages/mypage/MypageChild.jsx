import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import { Button, Form, message, Pagination } from "antd";
import jwtAxios from "../../apis/jwt";
import { useNavigate } from "react-router-dom";
import CustomModal from "../../components/modal/Modal";

function MypageChild() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [myypageChildList, setMypageChildList] = useState([]);
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
        { label: "자녀 관리", isActive: true, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: false, link: "/mypage" },
        { label: "자녀 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: true, link: "/mypage" },
        { label: "나의 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
  }

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  //내 자녀 목록 가져오기
  const myChildList = async () => {
    try {
      const res = await jwtAxios.get("/api/user/relationship/list/1");
      setMypageChildList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //자녀요청 승인
  const certificationRequest = async datas => {
    try {
      const res = await jwtAxios.get(`/api/user/relationship/${datas}`);
      if (res.data.resultData === 1) {
        setIsModalVisible(true);
        myChildList();
        //console.log(res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    myChildList();
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
        <h1 className="title-font">자녀 관리</h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              학생 정보
            </div>
            <div className="flex items-center justify-center w-60">요청일</div>
            <div className="flex items-center justify-center w-40">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              요청상태
            </div>
          </div>

          {myypageChildList?.length === 0 && (
            <div className="p-4 text-center border-b">
              등록된 자녀가 없습니다.
            </div>
          )}
          {myypageChildList === null && (
            <div className="p-4 text-center border-b">
              등록된 자녀가 없습니다.
            </div>
          )}

          {myypageChildList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center align-middle w-14 h-14 bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={
                        item.userPic
                          ? `http://112.222.157.156:5223/pic/user/${item.userId}/${item.userPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center w-60">
                {item.createdAt.substr(0, 10)}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.certification === 0 ? "승인대기" : "등록완료"}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.certification === 0 ? (
                  <button
                    type="button"
                    className="small_line_button"
                    onClick={e => certificationRequest(item.userId)}
                  >
                    요청승인
                  </button>
                ) : (
                  <span className="small_line_button bg-gray-200 opacity-50">
                    요청승인
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={myypageChildList?.length}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"보호자 등록요청 승인하기"}
          content={"보호자 등록요청 승인이 완료되었습니다."}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"창닫기"}
          button2Text={"확인완료"}
          modalWidth={400}
        />
      </div>
    </div>
  );
}

export default MypageChild;
