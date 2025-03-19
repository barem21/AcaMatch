import { message, Pagination } from "antd";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import SideBar from "../../components/SideBar";
import CustomModal from "../../components/modal/Modal";

interface mypageRefundListType {
  costId: number;
  createdAt: string;
  name: string;
  orderDate: string;
  orderType: number;
  price: number;
  prname: string;
  refundId: number;
  refundStatus: number;
  updatedAt: string;
}

function MypageRefundList() {
  const cookies = new Cookies();
  const [resultTitle, _setResultTitle] = useState("");
  const [resultMessage, _setResultMessage] = useState("");
  const [mypageRefundList, setMypageRefundList] = useState<
    mypageRefundListType[]
  >([]); //취소(환불) 내역
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
        { label: "결제 내역", isActive: false, link: "/mypage/order" },
        { label: "취소(환불) 내역", isActive: true, link: "/mypage/refund" },
      ];
      break;
  }

  const scrollRef = useRef<HTMLDivElement | null>(null);

  //취소내역
  const myRefundList = async () => {
    try {
      const res = await axios.get(
        `/api/refund/getRefundListByUserId/${userId}`,
      );

      if (res.data.resultData.length > 0) {
        for (let i = 0; i < res.data.resultData.length; i++) {
          const costId = res.data.resultData[i].costId;

          const orderDetailInfo = async (costId: number) => {
            const result = await axios.get(
              `/api/academyCost/getAcademyCostInfoByCostId/${costId}`,
            );
            res.data.resultData[i].prname = result.data.resultData.productName;
            res.data.resultData[i].name = result.data.resultData.name;
            res.data.resultData[i].price = result.data.resultData.price;
            res.data.resultData[i].orderType = result.data.resultData.orderType;
            res.data.resultData[i].orderDate =
              result.data.resultData.createdAt.substr(0, 10);
          };
          await orderDetailInfo(costId);
        }
        //console.log(res.data.resultData);
        /*
        const costIdValue = res.data.resultData[0].costId;
        alert(costIdValue);
        const refundInfo = async (costId: number) => {
          alert(costId);
        };
        await refundInfo(costIdValue);
        */
        setMypageRefundList(res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
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

  /*
  const paginatedData = mypageRefundList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  */

  useEffect(() => {
    if (userId !== "") {
      myRefundList();
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
          {roleId === 2 ? "자녀" : "나의"} 취소(환불) 내역
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b max-[640px]:hidden">
            <div className="flex items-center justify-center w-full">
              주문상품 정보
            </div>
            {/* <div className="flex items-center justify-center w-60">등록일</div> */}
            <div className="flex items-center justify-center min-w-24">
              주문자명
            </div>
            <div className="flex items-center justify-center min-w-24">
              결제금액
            </div>
            <div className="flex items-center justify-center min-w-24">
              주문일자
            </div>
            <div className="flex items-center justify-center min-w-24">
              취소일자
            </div>
          </div>

          {mypageRefundList?.length === 0 && (
            <div className="text-center p-4 border-b">
              등록한 학원이 없습니다.
            </div>
          )}

          {mypageRefundList.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b max-[640px]:flex-col"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex justify-start items-center font-semibold">
                  {item.orderType === 0 ? (
                    <span className="mr-1.5 pr-1 pt-[1px] pb-0.5 pl-1 rounded-md bg-blue-400 text-[11px] text-white">
                      강좌
                    </span>
                  ) : (
                    <span>교제</span>
                  )}
                  {item.prname}
                </div>
              </div>
              <div className="flex max-[640px]:mt-2">
                <div className="flex items-center justify-center min-w-24 max-[640px]:hidden">
                  {item.name}
                </div>
                <div className="flex items-center justify-center min-w-24 max-[640px]:flex-col max-[640px]:items-start max-[640px]:w-1/3">
                  <span className="min-[640px]:hidden text-sm">주문금액</span>
                  {item.price.toLocaleString()}원
                </div>
                <div className="flex items-center justify-center min-w-24 max-[640px]:flex-col max-[640px]:w-1/3">
                  <span className="min-[640px]:hidden text-sm">주문일자</span>
                  {item.orderDate}
                </div>
                <div className="flex items-center justify-center min-w-24 max-[640px]:flex-col max-[640px]:w-1/3">
                  <span className="min-[640px]:hidden text-sm">취소일자</span>
                  {item.createdAt}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={mypageRefundList?.length}
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

export default MypageRefundList;
