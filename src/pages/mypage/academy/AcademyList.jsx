import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import SideBar from "../../../components/SideBar";
import { message, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import { Cookies } from "react-cookie";
import jwtAxios from "../../../apis/jwt";
import CustomModal from "../../../components/modal/Modal";

function AcademyList() {
  const cookies = new Cookies();
  const currentUserInfo = useRecoilValue(userInfo);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [academyId, setAcademyId] = useState("");
  const [myAcademyList, setMyAcademyList] = useState([]);
  const navigate = useNavigate();

  const titleName = "마이페이지";
  const menuItems = [
    { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
    { label: "학원정보 관리", isActive: true, link: "/mypage/academy" },
    /*
    {
      label: "학원학생 관리",
      isActive: false,
      link: "/mypage/academy/student",
    },
    */
    {
      label: "학원리뷰 목록",
      isActive: false,
      link: "/mypage/academy/review",
    },
    { label: "좋아요 목록", isActive: false, link: "/mypage/academy/like" },
  ];

  //학원 목록
  const academyList = async () => {
    try {
      const res = await axios.get(
        `/api/academy/getAcademyListByUserId?signedUserId=${currentUserInfo.userId}`,
      );
      setMyAcademyList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //학원삭제 팝업
  const handleAcademyDelete = acaId => {
    setAcademyId(acaId);
    setIsModalVisible(true);
  };

  //학원 삭제
  const DeleteAcademy = async academyId => {
    //alert(academyId);
    try {
      //alert("학원 삭제" + acaId + currentUserInfo.userId);
      const res = await jwtAxios.delete(
        `/api/academy?acaId=${academyId}&userId=${currentUserInfo.userId}`,
      );
      //console.log(res.data.resultData);

      if (res.data.resultData === 1) {
        message.success("등록된 학원을 삭제하였습니다.");
        academyList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  //학원삭제 확인
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    DeleteAcademy(academyId);
    setIsModalVisible(false);
  };

  useEffect(() => {
    academyList();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full">
        <h1 className="title-font flex justify-between align-middle">
          학원정보 관리
          <button
            className="flex items-center gap-1 mr-5 text-sm font-normal"
            onClick={() => navigate("/mypage/academy/add")}
          >
            학원 신규등록
            <FaPlusCircle />
          </button>
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-3/4">
              학원명1
            </div>
            <div className="flex items-center justify-center w-40">등록일</div>
            <div className="flex items-center justify-center w-40">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              강좌목록
            </div>
            <div className="flex items-center justify-center w-40">
              수정하기
            </div>
            <div className="flex items-center justify-center w-40">
              삭제하기
            </div>
          </div>

          {myAcademyList?.length === 0 && (
            <div className="p-4 text-center border-b">
              등록된 학원이 없습니다.
            </div>
          )}
          {myAcademyList === null && (
            <div className="p-4 text-center border-b">
              등록된 학원이 없습니다.
            </div>
          )}

          {myAcademyList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b"
            >
              <div className="flex justify-start items-center w-3/4">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/academy/detail?id=${item.acaId}`)}
                >
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.acaPic && item.acaPic !== "default_user.jpg"
                          ? `http://112.222.157.156:5223/pic/academy/${item.acaId}/${item.acaPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  {item?.acaName}
                </div>
              </div>
              <div className="flex items-center justify-center text-center w-40">
                {item.createdAt.substr(0, 10)}
              </div>
              <div className="flex items-center justify-center w-40">
                등록완료
              </div>
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() =>
                    navigate(`/mypage/academy/class?acaId=${item.acaId}`)
                  }
                >
                  강좌목록
                </button>
              </div>
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() =>
                    navigate(`/mypage/academy/edit?acaId=${item.acaId}`)
                  }
                >
                  수정하기
                </button>
              </div>

              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  //onClick={e => DeleteAcademy(item.acaId)}
                  onClick={e => handleAcademyDelete(item.acaId)}
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
            total={myAcademyList?.length}
            showSizeChanger={false}
          />
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"학원 삭제하기"}
        content={"선택하신 학원을 삭제하시겠습니까?"}
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text={"취소하기"}
        button2Text={"삭제하기"}
        modalWidth={400}
      />
    </div>
  );
}

export default AcademyList;
