import { message, Pagination } from "antd";
import { useEffect, useState } from "react";
import { GoStar, GoStarFill } from "react-icons/go";
import SideBar from "../../components/SideBar";
import { getCookie } from "../../utils/cookie";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import { jwtApiRequest } from "../../apis/jwt";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";

function MypageReview() {
  const navigate = useNavigate();
  const [reviewList, setReviewList] = useState([]);
  const currentUserInfo = useRecoilValue(userInfo);
  const accessToken = getCookie("accessToken");

  const cookies = new Cookies();

  const titleName = "마이페이지";
  let menuItems = [];
  switch (currentUserInfo.roleId) {
    case 3: //학원 관계자
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "학원정보 관리", isActive: false, link: "/mypage" },
        { label: "리뷰 목록", isActive: true, link: "/mypage/academy/review" },
        { label: "좋아요 목록", isActive: false, link: "/mypage/academy/like" },
      ];
      break;
    case 2: //학부모
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "자녀 관리", isActive: false, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: false, link: "/mypage" },
        { label: "자녀 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: true, link: "/mypage/review" },
      ];
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: false, link: "/mypage" },
        { label: "보호자 정보", isActive: false, link: "/mypage/parent" },
        { label: "나의 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: true, link: "/mypage/review" },
      ];
  }

  const fetchData = async page => {
    if (!cookies.get("accessToken")) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
      return;
    }
    try {
      const res = await jwtApiRequest.get(
        `/api/review/user?userId=${currentUserInfo.userId}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (res.data.resultData.length > 0) {
        //console.log(res.data.resultData);
        setReviewList(res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
    //console.log(page);
  };

  useEffect(() => {
    fetchData(1);
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
        <h1 className="title-font">나의 리뷰 목록</h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 pl-6 pr-6 border-b">
            <div className="flex items-center justify-center w-full">
              리뷰 내용
            </div>
            <div className="flex items-center justify-center w-40">
              수정하기
            </div>
            <div className="flex items-center justify-center w-40">
              삭제하기
            </div>
          </div>

          {reviewList.length === 0 && (
            <div className="text-center p-4 border-b">
              등록한 리뷰 내역이 없습니다.
            </div>
          )}

          {reviewList.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-6 border-b"
            >
              <div className="w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={
                        item.writerPic
                          ? `http://112.222.157.156:5223/pic/user/${item.userId}/${item.writerPic}`
                          : "/aca_image_1.png"
                      }
                      alt=" /"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.writerName}</div>
                    <div className="text-sm text-gray-500">
                      {item.createdAt}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 mb-3">
                  {Array.from({ length: 5 }, (_, index) =>
                    index < item.star ? <GoStarFill /> : <GoStar />,
                  )}
                </div>
                <div
                  className="text-lg font-bold"
                  onClick={() => navigate(`/academy/detail?id=${item.acaId}`)}
                >
                  {item.className}
                </div>
                <div className="text-sm text-gray-500">{item.comment}</div>
              </div>
              <div className="flex items-center justify-center w-40">
                <button className="small_line_button">수정하기</button>
              </div>
              <div className="flex items-center justify-center w-40">
                <button className="small_line_button">삭제하기</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={reviewList.length}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

export default MypageReview;
