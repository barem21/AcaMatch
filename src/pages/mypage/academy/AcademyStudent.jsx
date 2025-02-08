import { message, Pagination } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import SideBar from "../../../components/SideBar";
import { Cookies } from "react-cookie";

function AcademyStudent() {
  const cookies = new Cookies();
  const currentUserInfo = useRecoilValue(userInfo);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [studentList, setStudentList] = useState([]);
  const [academyInfo, setAcademyInfo] = useState("");

  const acaId = searchParams.get("acaId");
  const classId = searchParams.get("classId");

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

  const academyStudentList = async () => {
    try {
      const res = await axios.get(
        `/api/acaClass/acaClassUser?classId=${classId}&page=1`,
      );
      setStudentList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //학원정보 가져오기
  const academyGetInfo = async () => {
    try {
      const res = await axios.get(`/api/academy/academyDetail/${acaId}`);
      setAcademyInfo(res.data.resultData.acaName);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    academyGetInfo();
  }, []);

  useEffect(() => {
    academyStudentList();
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
        <h1 className="title-font flex justify-between align-middle">
          {academyInfo}의 수강생 목록
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              수강생 이름
            </div>
            <div className="flex items-center justify-center w-60">연락처</div>
            <div className="flex items-center justify-center w-40">
              생년월일
            </div>
            {/*<div className="flex items-center justify-center w-40">삭제</div>*/}
          </div>

          {studentList.length === 0 && (
            <div className="loop-content flex w-full justify-center align-middle p-4 border-b">
              등록된 수강생이 없습니다.
            </div>
          )}

          {studentList.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 font-bold">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.userPic
                          ? item.userPic === "default_user.jpg"
                            ? "/aca_image_1.png"
                            : `http://112.222.157.156:5223/api/user/${item.userId}/${item.userPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  {item.name}
                </div>
              </div>
              <div className="flex items-center justify-center w-60">
                {item.phone}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.birth.substr(0, 10)}
              </div>
              {/*
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() => navigate("/mypage/academy/testList?classId=1")}
                >
                  삭제하기
                </button>
              </div>
              */}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={studentList.length}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

export default AcademyStudent;
