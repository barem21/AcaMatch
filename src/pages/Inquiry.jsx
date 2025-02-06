import { Pagination } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../apis/jwt";
import userInfo from "../atoms/userInfo";
import CustomModal from "../components/modal/Modal";
import SideBar from "../components/SideBar";
function Inquiry() {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userId } = useRecoilValue(userInfo); // Recoil에서 userId 가져오기
  const [academyData, setAcademyData] = useState([]); // 초기값을 빈 배열로 설정

  const titleName = "고객지원";
  const menuItems = [
    { label: "FAQ", isActive: false, link: "/support" },
    { label: "1 : 1 문의", isActive: true, link: "/support/inquiryList" },
  ];

  /*
  interface InquiryData {
    id: number;
    academyName: string;
    date: string;
    status: "처리중" | "답변완료";
    canCancel: boolean;
  }
  */

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    setIsModalVisible(false);
  };
  //1:1 문의 목록 호출
  const myMtomList = async () => {
    try {
      const res = await jwtAxios.get(`/api/chat?aca-id=2047`);
      console.log(res.data.resultData.users);
      setAcademyData(res.data.resultData.users);
    } catch (error) {
      console.log(error);
    }
    //console.log(page);
    //axios 데이터 호출할 때 페이지당 갯수랑 페이지 번호 전달
  };

  useEffect(() => {
    myMtomList();
  }, []);
  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />
      <div className="flex flex-col w-full">
        <h1 className="title-font">1:1 학원별 회원 문의</h1>
        <div className="flex flex-col w-full border border-[#DBE3E6] rounded-xl">
          {/* 테이블 헤더 */}
          <div className="flex flex-row h-[46px] items-center justify-center">
            <span className="flex-row-center text-[14px] text-brand-default text-center w-full">
              작성자
            </span>
            <span className="flex-row-center text-[14px] text-brand-default text-center w-1/2">
              학원명
            </span>
            <span className="flex-row-center text-[14px] text-brand-default text-center min-w-[15%]">
              날짜
            </span>
            {/*<span className="flex-row-center text-[14px] text-brand-default text-center  min-w-[15%]">
              취소하기
            </span>*/}
          </div>

          {academyData && academyData.length > 0 ? (
            academyData.map((academy, index) => (
              <div
                key={index}
                className="flex flex-row h-[72px] border-t border-[#DBE3E6]"
              >
                <div className="flex justify-center items-center min-w-[10%]">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        academy.acaPic
                          ? `http://112.222.157.156:5223/pic/user/${academy.userId}/${academy.userPic}`
                          : "/default_academy.jpg"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                </div>
                <div
                  className="flex items-center p-4 w-full text-start cursor-pointer"
                  onClick={e =>
                    navigate(
                      `/support/inquiry/detail?acaId=${academy.acaId}&userId=${academy.userId}`,
                    )
                  }
                >
                  <span className="text-[14px] text-brand-default">
                    {academy.userName}
                  </span>
                </div>
                <div className="flex w-1/2 justify-center items-center p-4">
                  {academy.acaName}
                  <div
                    className={`flex justify-center items-center px-4 h-8 rounded-xl ${
                      academy.status === "처리중"
                    }`}
                  >
                    <span className="text-[14px] font-medium">
                      {academy.status}
                    </span>
                  </div>
                </div>
                <div className="flex min-w-[15%] justify-center items-center p-4">
                  <span className="text-[14px] text-brand-placeholder">
                    {academy.createdAt.substr(0, 10)}
                  </span>
                </div>
                {/*
                <div className="flex min-w-[15%] justify-center items-center p-4">
                  {academy.canCancel ? (
                    <button
                      className="small_line_button"
                      onClick={e => {
                        e.stopPropagation(); // 이벤트 전파 중지
                        setIsModalVisible(true);
                      }}
                    >
                      취소하기
                    </button>
                  ) : (
                    <button
                      className="small_line_button bg-gray-200 opacity-50"
                      disabled
                      onClick={e => e.stopPropagation()}
                    >
                      취소하기
                    </button>
                  )}
                </div>
                */}
              </div>
            ))
          ) : (
            <div className="text-center p-4 border-t">
              문의한 학원이 없습니다.
            </div>
          )}
        </div>
        <div className="flex justify-center items-center m-6">
          <Pagination
            // current={currentPage}
            pageSize={10} // 페이지당 아이템 수
            total={academyData.length} // 전체 아이템 수
            // onChange={handlePageChange}
            showSizeChanger={false} // 페이지 사이즈 변경 옵션 숨김
          />
        </div>
      </div>
      {isModalVisible && (
        <CustomModal
          visible={isModalVisible}
          title={"학원등록 취소하기"}
          content={"선택하신 학원을 등록 취소하시겠습니까?"}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소"}
          button2Text={"확인"}
          modalWidth={400}
          modalHeight={244}
        />
      )}
    </div>
  );
}
export default Inquiry;
