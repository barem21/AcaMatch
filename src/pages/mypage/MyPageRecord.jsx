import { useEffect, useRef, useState } from "react";
import SideBar from "../../components/SideBar";
import { message, Pagination } from "antd";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import jwtAxios from "../../apis/jwt";
import { useLocation, useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";

function MyPageRecord() {
  const cookies = new Cookies();
  const [myAcademyArray, setMyAcademyArray] = useState([]);
  const currentUserInfo = useRecoilValue(userInfo);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const scrollRef = useRef(null);
  const { search } = useLocation();

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
    const params = new URLSearchParams(search);
    // setCurrentPage(params.get("page"));

    //자녀목록 호출
    let checkUserId = currentUserInfo.userId; //기본은 본인 아이디
    if (currentUserInfo.roleId === 2) {
      //학부모는 자녀 정보 필요
      const myChildList = async () => {
        try {
          const res = await jwtAxios.get("/api/user/relationship/list/1");
          //console.log(res.data.resultData[0].userId);
          checkUserId = res.data.resultData[0].userId; //자녀 아이디로 교체
        } catch (error) {
          console.log(error);
        }
      };
      myChildList();
    }

    try {
      //나의 수강목록 호출
      const res = await jwtAxios.get(
        `/api/joinClass?userId=${checkUserId}&page=${currentPage}`,
      );
      //console.log(checkUserId);
      //console.log(res);

      const splitClasses = res.data.resultData.flatMap(academy => {
        return academy.classList.map(classItem => {
          return {
            acaId: academy.acaId,
            acaPic: academy.acaPic,
            acaName: academy.acaName,
            classId: classItem.classId,
            className: classItem.className,
            startDate: classItem.startDate,
            endDate: classItem.endDate,
          };
        });
      });

      // 나눈 데이터를 상태에 저장
      setMyAcademyArray(splitClasses);
    } catch (error) {
      console.log(error);
    }
    //console.log(page);
    //axios 데이터 호출할 때 페이지당 갯수랑 페이지 번호 전달
  };

  useEffect(() => {
    myAcademyList();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  const handlePageChange = page => {
    setCurrentPage(page);
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const paginatedData = myAcademyArray.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  return (
    <div ref={scrollRef} className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full">
        <h1 className="title-font">
          {currentUserInfo.roleId === 2 ? "자녀" : "나의"} 성적확인
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            {/* <div className="flex items-center justify-center w-60">
              테스트일
            </div> */}
            <div className="flex items-center justify-center w-40">
              문의하기
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

          {paginatedData?.map((item, index) => (
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
                    <div className="flex text-gray-400 text-sm">
                      [수업명 :{item.className}]
                    </div>
                    {/* {item.classList?.length > 0 ? (
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
                    )} */}
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center justify-center w-60">
                2025-01-01
              </div> */}
              <div className="flex items-center justify-center w-40">
                <span
                  className="small_line_button cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/support/inquiry/detail?acaId=${item.acaId}&userId=${currentUserInfo.userId}`,
                    )
                  }
                >
                  1:1 문의
                </span>
              </div>
              <div className="flex items-center justify-center w-40">
                <span
                  className="small_line_button cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/mypage/record/detail?acaId=${item.acaId}&acaName=${item.acaName}`,
                    )
                  }
                >
                  성적확인
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            defaultCurrent={1}
            total={myAcademyArray?.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

export default MyPageRecord;
