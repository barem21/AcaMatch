import { message, Pagination } from "antd";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import SideBar from "../../components/SideBar";
import CustomModal from "../../components/modal/Modal";

interface myOrderListType {
  acaId: number;
  acaName: string;
  classOrBookName: string;
  acaPic: string;
  createdAt: string;
  price: number;
  costStatus: number;
  name: string;
  costId: number;
  refundStatus: number;
  tid: string;
}

function MypageOrderList() {
  const cookies = new Cookies();
  const [myOrderList, setMyOrderList] = useState<myOrderListType[]>([]); //내 학원 내역
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [costId, setCostId] = useState(0);
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

  //내 주문내역
  const myOrderListAll = async () => {
    try {
      const res = await axios.get(
        `/api/academyCost/getAcademyCostListByUser/${userId}`,
      );

      if (res.data.resultData?.length > 0) {
        setMyOrderList(res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
    //console.log(page);
  };

  //환불신청
  const orderCancel = (value: number) => {
    setCostId(value);
    setIsModalVisible(true);
  };
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = async (value: number) => {
    try {
      const res = await axios.post(
        `/api/refund/postRefund?costId=${value}&refundComment=사용자 환불신청`,
      );
      if (res.data.resultData === 1) {
        message.success("환불신청 완료되었습니다.");
        myOrderListAll(); //목록 다시 불러오기
      }
    } catch (error) {
      console.log(error);
    }
    setCostId(0); //초기화
    setIsModalVisible(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (userId !== "") {
      myOrderListAll();
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
          <div className="hidden justify-between align-middle p-4 border-b sm:flex">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            {/* <div className="flex items-center justify-center w-60">등록일</div> */}
            <div className="flex items-center justify-center min-w-24">
              주문자명
            </div>
            <div className="flex items-center justify-center min-w-24">
              주문일자
            </div>
            <div className="flex items-center justify-center min-w-24">
              처리상태
            </div>
            <div className="flex items-center justify-center min-w-24">
              취소요청
            </div>
          </div>

          {myOrderList?.length === 0 && (
            <div className="text-center p-4 border-b">
              결제한 내역이 없습니다.
            </div>
          )}

          {myOrderList.map((item, index) => (
            <div
              key={index}
              className="loop-content flex flex-col justify-between align-middle p-4 border-b sm:flex-row"
            >
              <div className="flex justify-start items-center w-full mb-2 sm:mb-0">
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
                    <p className="text-[13px] text-gray-400">
                      [{item.classOrBookName}]
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-2 sm:gap-0 sm:mb-0">
                <div className="hidden items-center justify-center sm:min-w-24 sm:flex">
                  {item.name}
                </div>
                <div className="flex items-center justify-center sm:min-w-24">
                  {item.createdAt.substr(0, 10)}
                </div>
                <div className="flex items-center justify-center sm:min-w-24">
                  {item.costStatus === 2 ? "결제완료" : "결제대기"}
                </div>
              </div>

              <div className="flex items-center justify-start sm:min-w-24 sm:justify-center">
                <button
                  className="small_line_button bg-gray-200 opacity-50"
                  onClick={() => orderCancel(item.costId)}
                >
                  취소요청
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={myOrderList?.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"취소 요청"}
          content={"선택한 결제내역을 취소요청하시겠습니까?"}
          onButton1Click={handleButton1Click}
          onButton2Click={() => handleButton2Click(costId)}
          button1Text={"취소"}
          button2Text={"확인"}
          modalWidth={400}
        />
      </div>
    </div>
  );
}

export default MypageOrderList;
