import { message, Pagination } from "antd";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import SideBar from "../../components/SideBar";
import CustomModal from "../../components/modal/Modal";

interface mypageAcademyListType {
  acaId: number;
  acaPics: string;
  acaPic: string;
  acaName: string;
  classList: [
    {
      classId: number;
      className: string;
      startDate: string;
      endDate: string;
    },
  ];
}

function MypageOrderList() {
  const cookies = new Cookies();
  const [resultTitle, _setResultTitle] = useState("");
  const [resultMessage, _setResultMessage] = useState("");
  const [mypageAcademyList, setMypageAcademyList] = useState<
    mypageAcademyListType[]
  >([]); //내 학원 내역
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { roleId, userId } = useRecoilValue(userInfo);
  const navigate = useNavigate();
  const pageSize = 10;

  const titleName = "마이페이지";
  let menuItems = [];
  switch (roleId) {
    case 0: //관리자
    case 3: //학원관계자
    case 4: //강사
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "학원 관리자", isActive: false, link: "/admin" },
      ];
      break;
    case 2: //학부모
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "자녀 관리", isActive: false, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: true, link: "/mypage" },
        { label: "자녀 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: false, link: "/mypage" },
        { label: "보호자 정보", isActive: false, link: "/mypage/parent" },
        { label: "나의 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
        { label: "결제 내역", isActive: true, link: "/mypage/order" },
        { label: "취소(환불) 내역", isActive: false, link: "/mypage/refund" },
      ];
      break;
  }

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const myOrderList = async (page: number) => {
    try {
      const res = await axios.get(
        `/api/academy/GetAcademyListByAcaNameOrderType?userId=${userId}&page=${page}&size=30`,
      );

      if (res.data.resultData?.length > 0) {
        setMypageAcademyList(res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
    //console.log(page);
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const paginatedData = mypageAcademyList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (userId !== "") {
      myOrderList(1);
    }
  }, [userId]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, [userId]);

  useEffect(() => {
    if (roleId === 0 || roleId === 3 || roleId === 4) {
      navigate("/mypage/user");
    }
  }, []);

  return (
    <div
      id="list-wrap"
      ref={scrollRef}
      className="flex gap-5 w-full max-[640px]:flex-col max-[640px]:gap-0"
    >
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full max-[640px]:p-4">
        <h1 className="title-font max-[640px]:mb-3 max-[640px]:text-xl max-[640px]:mt-0">
          {roleId === 2 ? "자녀" : "나의"} 결제 내역
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            {/* <div className="flex items-center justify-center w-60">등록일</div> */}
            <div className="flex items-center justify-center w-40">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              취소하기
            </div>
          </div>

          {mypageAcademyList?.length === 0 && (
            <div className="text-center p-4 border-b">
              등록한 학원이 없습니다.
            </div>
          )}

          {paginatedData.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b cursor-pointer"
              onClick={() =>
                navigate(`/academy/detail?id=${item.acaId}&page=1&size=10`)
              }
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
                          ? `http://112.222.157.157:5233/pic/academy/${item.acaId}/${item.acaPic}`
                          : "aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.acaName}</h4>
                    {item.classList.length > 0 ? (
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
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center justify-center w-60">
                2025-01-01
              </div> */}
              <div className="flex items-center justify-center w-40">
                등록완료
              </div>
              <div className="flex items-center justify-center w-40">
                <span className="small_line_button bg-gray-200 opacity-50">
                  취소하기
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={mypageAcademyList?.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={resultTitle}
          content={resultMessage}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소"}
          button2Text={"확인"}
          modalWidth={400}
        />
      </div>
    </div>
  );
}

export default MypageOrderList;
