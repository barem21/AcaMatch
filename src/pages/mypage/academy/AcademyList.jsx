import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import SideBar from "../../../components/SideBar";
import { message, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";

function AcademyList() {
  const currentUserInfo = useRecoilValue(userInfo);
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
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    academyList();
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
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            <div className="flex items-center justify-center w-60">등록일</div>
            <div className="flex items-center justify-center w-40">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              강좌목록
            </div>
            <div className="flex items-center justify-center w-40">
              수정하기
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
              <div className="flex justify-start items-center w-full">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/academy/detail?id=${item.acaId}`)}
                >
                  <img src="/aca_image_1.png" alt="" />
                  {item?.acaName}
                </div>
              </div>
              <div className="flex items-center justify-center text-center w-60">
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
    </div>
  );
}

export default AcademyList;
