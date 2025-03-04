import { Button, Card, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwtAxios from "../../../apis/jwt";

interface PopupDetail {
  popUpId: number;
  title: string;
  startDate: string;
  endDate: string;
  popUpShow: number;
  popUpType: number;
  sumCount: number;
}

const PopupDetail = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const [popupDetail, setPopupDetail] = useState<PopupDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPopupDetail = async () => {
    try {
      const response = await jwtAxios.get("/api/popUp/detail", {
        params: { popUpId: id },
      });
      console.log(response);

      if (response.data.resultData.length > 0) {
        setPopupDetail(response.data.resultData[0]);
      } else {
        message.error("팝업 상세 정보를 찾을 수 없습니다.");
        // navigate("/admin/popup-content"); // 목록 페이지로 이동
      }
    } catch (error) {
      console.error("Error fetching popup detail:", error);
      message.error("팝업 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopupDetail();
  }, [id]);

  return (
    <div className="flex justify-center items-center w-full h-screen">
      {loading ? (
        <Spin size="large" />
      ) : popupDetail ? (
        <Card title="팝업 상세정보" className="w-[600px] shadow-lg">
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
          <p>
            <strong>총 조회 수:</strong> {popupDetail.sumCount}
          </p>

          <div className="flex justify-end gap-3 mt-5">
            <Button onClick={() => navigate("/admin/popup-content")}>
              뒤로가기
            </Button>
          </div>
        </Card>
      ) : (
        <p>팝업 정보를 찾을 수 없습니다.</p>
      )}
    </div>
  );
};

export default PopupDetail;
