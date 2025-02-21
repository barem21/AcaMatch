import { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import CustomModal from "../../components/modal/Modal";
import { getCookie } from "../../utils/cookie";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import jwtAxios from "../../apis/jwt";
import { message, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { FaHeartCircleMinus } from "react-icons/fa6";

const usedRandomNumbers = new Set();

// Generate random unique number
const getRandomUniqueNumber = () => {
  if (usedRandomNumbers.size === 10) {
    usedRandomNumbers.clear(); // 모든 숫자가 사용되면 초기화
  }

  let randomNum;
  do {
    randomNum = Math.floor(Math.random() * 10) + 1; // 1~10 사이의 랜덤 숫자
  } while (usedRandomNumbers.has(randomNum));

  usedRandomNumbers.add(randomNum);
  return randomNum;
};

function MyPageLike() {
  const cookies = new Cookies();
  const [likeList, setLikeList] = useState([]); // 좋아요 목록
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [academyIdToDelete, setAcademyIdToDelete] = useState(null); // 삭제할 학원 ID

  const currentUserInfo = useRecoilValue(userInfo);
  const accessToken = getCookie("accessToken");
  const navigate = useNavigate();
  const [totalLikesCount, setTotalLikesCount] = useState(0); // To track total items

  const titleName = "마이페이지";
  let menuItems = [];
  switch (currentUserInfo.roleId) {
    case 2:
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "자녀 관리", isActive: false, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: false, link: "/mypage" },
        { label: "자녀 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: true, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
    default:
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: false, link: "/mypage" },
        { label: "보호자 정보", isActive: false, link: "/mypage/parent" },
        { label: "나의 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: true, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
  }

  const fetchData = async page => {
    try {
      const res = await jwtAxios.get(
        `/api/like/user?userId=${currentUserInfo.userId}&page=${page}`,
      );
      console.log(res);

      if (res.data.resultData.length > 0) {
        setLikeList(res.data.resultData);
        setTotalLikesCount(res.data.totalCount); // Assuming API returns total count
      }
    } catch (error) {
      console.log(error);
    }
  };

  //좋아요 삭제하기
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = async () => {
    try {
      // 좋아요 삭제
      const res = await jwtAxios.delete(`/api/like`, {
        data: {
          acaId: likeAcaId,
          userId: currentUserInfo.userId,
        },
      });
      //console.log(res.data.reultMessage);
      fetchData(1); //리스트 다시 호출
    } catch (error) {
      console.log(error);
    }
    setIsModalVisible(false);
  };

  const handleLikeChange = academyId => {
    setLikeAcaId(academyId);
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchData(1); // Fetch data when the component mounts
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  const handleLikeClick = academyId => {
    // 학원 ID를 모달에 전달하여 삭제 여부를 확인
    setAcademyIdToDelete(academyId);
    setIsModalVisible(true);
  };

  const deleteLike = async () => {
    console.log(academyIdToDelete);

    try {
      // 좋아요 삭제 요청
      await jwtAxios.delete(
        `/api/like?userId=${currentUserInfo.userId}&acaId=${academyIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${cookies.get("accessToken")}`,
          },
          data: {
            userId: currentUserInfo.userId,
            acaId: academyIdToDelete,
          },
        },
      );

      // 삭제 후 상태 업데이트
      setLikeList(prevList =>
        prevList.filter(item => item.acaId !== academyIdToDelete),
      );
      setIsModalVisible(false); // 모달 닫기
      message.success("좋아요가 삭제되었습니다.");
    } catch (error) {
      console.log(error);
      message.error("좋아요 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full">
        <h1 className="title-font">나의 좋아요 목록</h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            <div className="flex items-center justify-center w-24">
              삭제하기
            </div>
          </div>

          {likeList.length === 0 && (
            <div className="text-center p-4 border-b">
              좋아요 내역이 없습니다.
            </div>
          )}

          {likeList.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b"
            >
              <div className="w-full flex justify-start items-center">
                <div
                  className="flex items-center gap-3"
                  onClick={() => navigate(`/academy/detail?id=${item.acaId}`)}
                >
                  <img
                    className="h-[60px] w-[60px] rounded-[20px]"
                    src={`http://112.222.157.156:5223/pic/academy/${item.acaId}/${item.acaPic}`}
                    onError={e => {
                      const target = e.target;
                      const randomNum = getRandomUniqueNumber();
                      target.src = `/default_academy${randomNum}.jpg`;
                    }}
                    alt=""
                  />
                  {item.acaName}
                </div>
              </div>
              <div className="flex items-center justify-center w-20">
                <button
                  onClick={() => handleLikeClick(item.acaId)}
                  className="px-2.5 py-0.5 border-0 rounded bg-gray-200 w-full flex justify-center items-center group"
                >
                  <FaHeartCircleMinus
                    className="text-[20px] focus:outline-none transition-transform duration-200 group-hover:scale-110"
                    color="#3b77d8"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={totalLikesCount}
            showSizeChanger={false}
            onChange={page => fetchData(page)}
          />
        </div>
        {isModalVisible && (
          <CustomModal
            visible={isModalVisible}
            title={"좋아요 삭제하기"}
            content={
              <div className="mt-[50px] mb-[25px]">
                선택하신 학원을 좋아요에서 삭제하시겠습니까?
              </div>
            }
            onButton1Click={() => setIsModalVisible(false)}
            onButton2Click={deleteLike} // 확인 버튼 클릭 시 삭제 실행
            button1Text={"취소"}
            button2Text={"확인"}
            modalWidth={400}
          />
        )}
      </div>
    </div>
  );
}

export default MyPageLike;
