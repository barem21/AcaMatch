import { message, Pagination } from "antd";
import { useEffect, useState } from "react";
import { GoStar, GoStarFill } from "react-icons/go";
import SideBar from "../../../components/SideBar";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
//import { useSearchParams } from "react-router-dom";
import axios from "axios";
import jwtAxios from "../../../apis/jwt";
import CustomModal from "../../../components/modal/Modal";
import { useNavigate } from "react-router-dom";

function AcademyReview() {
  const [academyReviewList, setAcademyReviewList] = useState([]); //학원리뷰 목록
  const [resultMessage, setResultMessage] = useState("");
  const [reviewId, setReviewId] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const currentUserInfo = useRecoilValue(userInfo);
  const navigate = useNavigate();
  //const acaId = searchParams.get("acaId");

  const titleName = "마이페이지";
  let menuItems = [];
  switch (currentUserInfo.roleId) {
    case 3: //학원 관계자
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "학원정보 관리", isActive: false, link: "/mypage" },
        /*
        {
          label: "학원학생 관리",
          isActive: false,
          link: "/mypage/academy/student",
        },
        */
        {
          label: "학원리뷰 목록",
          isActive: true,
          link: "/mypage/academy/review",
        },
        { label: "좋아요 목록", isActive: false, link: "/mypage/academy/like" },
      ];
      break;
    case 2: //학부모
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "학원정보 관리", isActive: false, link: "/mypage" },
        { label: "나의 리뷰 목록", isActive: true, link: "/mypage/review" },
        { label: "학생 관리", isActive: false, link: "/mypage/child" },
      ];
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: false, link: "/mypage" },
        { label: "나의 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: true, link: "/mypage/review" },
      ];
  }

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = async () => {
    try {
      alert(`리뷰삭제${reviewId}`);
      const res = await axios.delete(
        `/api/review/academy?acaId=${acaId}&joinClassId=${classId}&userId=${currentUserInfo.userId}`,
      );
      console.log(res.data.resultData);
      setIsModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  //학원리뷰 전체목록 가져오기
  const getTagList = async () => {
    try {
      const res = await jwtAxios.get(
        `/api/review/my-academy?userId=${currentUserInfo.userId}&page=1&size=30`,
      );
      setAcademyReviewList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //리뷰 삭제하기
  const deleteReviewCheck = (acaId, classId) => {
    setResultMessage(
      `리뷰(${acaId})를 삭제하시면 복구할 수 없습니다. 해당 리뷰를 삭제하시겠습니까?`,
    );
    setIsModalVisible(true);
  };

  useEffect(() => {
    getTagList();
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
        <h1 className="title-font">학원리뷰 목록</h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 pl-6 pr-6 border-b">
            <div className="flex items-center justify-center w-full">
              리뷰 내용
            </div>
            <div className="flex items-center justify-center w-40">
              삭제하기
            </div>
          </div>

          {academyReviewList?.length === 0 && (
            <div className="p-4 text-center border-b">
              등록된 학원리뷰가 없습니다.
            </div>
          )}

          {academyReviewList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-6 border-b"
            >
              <div className="w-full">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center w-10 h-10 border rounded-full overflow-hidden">
                    <img
                      src={
                        item.writerPic
                          ? `http://112.222.157.156:5223/pic/user/${item.userId}/${item.writerPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.writerName}</div>
                    <div className="text-sm text-gray-500">
                      {item.createdAt.substr(0, 10)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 mb-3">
                  {Array.from({ length: 5 }, (_, index) =>
                    index < item.star ? <GoStarFill /> : <GoStar />,
                  )}
                </div>
                <div className="text-lg font-bold">
                  {item.className ? item.className : "학원 정보가 없습니다."}
                </div>
                <div className="text-sm text-gray-500">{item.comment}</div>
              </div>
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() => deleteReviewCheck(item.acaId, item.classId)}
                >
                  삭제하기
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={academyReviewList?.length}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"리뷰 삭제하기"}
          content={<div className="addOk">{resultMessage}</div>}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소하기"}
          button2Text={"삭제하기"}
          modalWidth={400}
        />
      </div>
    </div>
  );
}

export default AcademyReview;
