import { Button, Form, Pagination, message } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwtAxios from "../../../apis/jwt";
import CustomModal from "../../../components/modal/Modal"; // 커스텀 모달 import 추가

interface PopupItem {
  popUpId: number;
  title: string;
  startDate: string;
  endDate: string;
  popUpShow: number;
  popUpType: number;
  sumCount: number;
  imageUrl?: string; // 이미지 URL 속성 추가
  content?: string; // 일반 팝업 내용 속성 추가
  popUpPic?: string; // popUpPic 필드 추가
  comment?: string;
}

const PopupContent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const [popupList, setPopupList] = useState<PopupItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 한 페이지당 10개씩 출력
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupDetail, setPopupDetail] = useState<PopupItem | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // 팝업 리스트 불러오기
  const fetchPopupList = async (page: number) => {
    try {
      const response = await jwtAxios.get("/api/popUp", {
        params: { page, size: pageSize }, // 페이지네이션 적용
      });
      console.log(response);

      const { resultData } = response.data;
      setPopupList(resultData);
      setTotalItems(resultData[0]?.sumCount || 0);
    } catch (error) {
      console.error("Error fetching popup list:", error);
      message.error("팝업 목록을 불러오는데 실패했습니다.");
    }
  };

  // 팝업 상세 정보 조회
  const fetchPopupDetail = async (popUpId: number) => {
    try {
      const response = await jwtAxios.get("/api/popUp/detail", {
        params: { popUpId },
      });
      if (response.data.resultData.length > 0) {
        const detail = response.data.resultData[0];
        setPopupDetail(detail);
        // imageUrl 설정
        setImageUrl(
          detail.popUpPic
            ? `http://112.222.157.157:5233/pic/popUp/${detail.popUpId}/${detail.popUpPic}`
            : null,
        );
        setIsModalOpen(true);
      }
      console.log(response);
    } catch (error) {
      console.error("Error fetching popup detail:", error);
      message.error("팝업 상세 정보를 불러오는데 실패했습니다.");
    }
  };

  // 팝업 삭제
  const handleDelete = async (popUpId: number) => {
    try {
      await jwtAxios.delete(`/api/popUp/${popUpId}`);
      message.success("팝업이 삭제되었습니다.");
      fetchPopupList(currentPage); // ✅ 현재 페이지 데이터 다시 불러오기
    } catch (error) {
      console.error("삭제 실패:", error);
      message.error("팝업 삭제에 실패했습니다.");
    }
  };

  // 페이지 변경 시 실행될 함수
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    fetchPopupList(page);
  };

  useEffect(() => {
    fetchPopupList(currentPage);
    form.setFieldsValue({
      state: searchParams.get("state")
        ? parseInt(searchParams.get("state")!)
        : "all",
      search: "",
      showCnt: pageSize,
    });
  }, []);

  const renderModalContent = () => {
    if (!popupDetail) return null;

    return (
      <div
        className="space-y-3"
        style={{ maxHeight: imageUrl ? "525px" : "275px", overflowY: "auto" }}
      >
        <div className="space-y-3 mb-4">
          <p>
            <strong>제목:</strong> {popupDetail.title}
          </p>
          <p>
            <strong>시작일:</strong> {popupDetail.startDate}
          </p>
          <p>
            <strong>종료일:</strong> {popupDetail.endDate}
          </p>
          <p>
            <strong>노출 상태:</strong>{" "}
            {popupDetail.popUpShow === 1 ? "출력중" : "미출력"}
          </p>
          <p>
            <strong>팝업 타입:</strong>{" "}
            {popupDetail.popUpType === 0 ? "일반 팝업" : "이미지 팝업"}
          </p>
          {/* <p>
            <strong>총 조회 수:</strong> {popupDetail.sumCount}
          </p> */}
        </div>

        <div className="border-t pt-4">
          <p className="font-bold mb-2">팝업 내용:</p>
          {popupDetail.comment === "" && imageUrl ? (
            <div className="w-full flex justify-center">
              <img
                src={imageUrl}
                alt="팝업 이미지"
                className="max-w-full"
                style={{
                  width: "600px",
                  height: "600px",
                  objectFit: "contain",
                }}
                onError={e => {
                  console.error("이미지 로드 실패:", imageUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {popupDetail.comment || "내용이 없습니다."}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          팝업창 관리
          <p>공지 및 콘텐츠 관리 {">"} 팝업창 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="text-sm">
                  팝업창 등록개수 : 총 {totalItems} 건
                </label>
              </div>
              <Button
                className="btn-admin-basic"
                onClick={() => navigate("/admin/popup-content/add")}
              >
                + 팝업창 등록
              </Button>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-[100%]">
              제목
            </div>
            <div className="flex items-center justify-center w-[200px]">
              시작일
            </div>
            <div className="flex items-center justify-center w-[200px]">
              종료일
            </div>
            <div className="flex items-center justify-center w-[200px]">
              출력 위치
            </div>
            <div className="flex items-center justify-center w-[200px]">
              노출 상태
            </div>
            <div className="flex items-center justify-center w-[132px]">
              수정하기
            </div>
            <div className="flex items-center justify-center w-[72px]">
              삭제
            </div>
          </div>

          {popupList.map(popup => (
            <div
              key={popup.popUpId}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div
                className="flex justify-start items-center w-[100%] h-[56px] cursor-pointer"
                onClick={() => fetchPopupDetail(popup.popUpId)}
              >
                <h4>{popup.title}</h4>
              </div>
              <div className="flex items-center justify-center text-center w-[200px]">
                {popup.startDate}
              </div>
              <div className="flex items-center justify-center text-center w-[200px]">
                {popup.endDate}
              </div>
              <div className="flex items-center justify-center w-[200px]">
                {popup.popUpType === 1 ? "관리자" : "사용자"}
              </div>
              <div className="flex items-center justify-center w-[200px]">
                <p
                  onClick={async () => {
                    try {
                      await jwtAxios.put(`/api/popUp/show/${popup.popUpId}`, {
                        popUpShow: popup.popUpShow === 0 ? 1 : 0,
                      });
                      message.success("출력 상태가 변경되었습니다.");
                      fetchPopupList(currentPage);
                    } catch (error) {
                      console.error("출력 상태 변경 실패:", error);
                      message.error("출력 상태 변경에 실패했습니다.");
                    }
                  }}
                  className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center cursor-pointer ${
                    popup.popUpShow === 1 ? "bg-[#90b1c4]" : "bg-[#f8a57d]"
                  }`}
                >
                  {popup.popUpShow === 1 ? "출력중" : "미출력"}
                </p>
              </div>
              <div className="flex items-center justify-center w-[132px]">
                <p
                  className="w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300 cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/popup-content/add?id=${popup.popUpId}`)
                  }
                >
                  수정하기
                </p>
              </div>
              <div className="flex gap-4 items-center justify-center w-[72px]">
                <button onClick={() => handleDelete(popup.popUpId)}>
                  <FaRegTrashAlt className="w-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 추가 */}
        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            showSizeChanger={false}
            onChange={onPageChange} // 페이지 변경 이벤트 핸들러
          />
        </div>
      </div>

      {/* CustomModal 사용 */}
      <CustomModal
        visible={isModalOpen}
        title="팝업 상세정보"
        content={renderModalContent()}
        onButton1Click={() => {
          setIsModalOpen(false);
          setPopupDetail(null);
          setImageUrl(null);
        }}
        onButton2Click={() => {
          setIsModalOpen(false);
          setPopupDetail(null);
          setImageUrl(null);
        }}
        button1Text="닫기"
        button2Text="확인"
        modalWidth={600}
        modalHeight={imageUrl ? 700 : 450}
      />
    </div>
  );
};

export default PopupContent;
