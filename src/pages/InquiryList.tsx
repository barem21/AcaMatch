import { Pagination } from "antd";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomModal from "../components/modal/Modal";
import jwtAxios from "../apis/jwt";
import { useRecoilValue } from "recoil";
import userInfo from "../atoms/userInfo";
import axios from "axios";

function InquiryList() {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userId, roleId } = useRecoilValue(userInfo); // Recoil에서 userId 가져오기
  const [myAcademyList, setMyAcademyList] = useState<InquiryData[]>([]);

  const titleName = "고객지원";
  const menuItems = [
    { label: "FAQ", isActive: false, link: "/support" },
    { label: "1 : 1 문의", isActive: true, link: "/support/inquiryList" },
  ];
  interface InquiryData {
    id: number;
    academyName: string;
    date: string;
    status: "처리중" | "답변완료";
    canCancel: boolean;
  }

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  //학원 목록
  const academyList = async () => {
    try {
      //학원 관계자일 때
      if (roleId === 3) {
        const res = await axios.get(
          `/api/academy/getAcademyListByUserId?signedUserId=${userId}`,
        );
      } else {
        const res = await jwtAxios.get(
          `/api/joinClass?userId=${userId}&page=1`,
        );
      }
      setMyAcademyList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    academyList();
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />
      <div className="flex flex-col w-full">
        <h1 className="title-font">1:1 학원별 문의</h1>
        <div className="flex flex-col w-full border border-[#DBE3E6] rounded-xl">
          {/* 테이블 헤더 */}
          <div className="flex flex-row h-[46px] items-center justify-center">
            <span className="flex-row-center text-[14px] text-brand-default text-center w-full">
              학원명
            </span>
          </div>

          {myAcademyList && myAcademyList.length > 0 ? (
            myAcademyList.map((academy, index) => (
              <div
                key={index}
                className="flex flex-row w-full p-4 border-t border-[#DBE3E6]"
              >
                <div
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() =>
                    navigate(`/support/inquiry?acaId=${academy.acaId}`)
                  }
                >
                  <div className="flex justify-center items-center w-14 h-14 mr-3 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src="/aca_image_1.png"
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  {academy.acaName}
                </div>
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
            total={myAcademyList.length} // 전체 아이템 수
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

export default InquiryList;
