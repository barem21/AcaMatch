import { useEffect, useState } from "react";
import Draggable from "react-draggable";
import jwtAxios from "../apis/jwt";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// isSameOrAfter 플러그인 추가
dayjs.extend(isSameOrAfter);

interface PopupItem {
  title: string;
  startDate: string;
  endDate: string;
  popUpShow: number;
  popUpType: number;
  popUpId: number;
  comment?: string;
  popUpPic?: string;
  sumCount: number;
}

const PopupWindow = () => {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [closedPopups, setClosedPopups] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const response = await jwtAxios.get("/api/popUp", {
          params: { page: 1, size: 1000 },
        });
        console.log(response);

        const today = dayjs();
        // endDate가 오늘 포함 이후이고 popUpType이 0인 팝업만 필터링
        const activePopups = response.data.resultData.filter(
          (popup: PopupItem) =>
            dayjs(popup.endDate).isSameOrAfter(today, "day") &&
            popup.popUpType === 0 &&
            popup.popUpShow === 1,
        );

        setPopups(activePopups);
      } catch (error) {
        console.error("팝업 데이터 로드 실패:", error);
      }
    };

    fetchPopups();
  }, []);

  const handleClose = (popUpId: number) => {
    setClosedPopups(prev => new Set([...prev, popUpId]));
  };

  return (
    <>
      {popups.map(
        popup =>
          !closedPopups.has(popup.popUpId) && (
            <Draggable key={popup.popUpId} handle=".popup-handle">
              <div className="fixed top-20 left-20 bg-white border border-gray-300 rounded-lg shadow-lg w-[400px] h-[400px] z-50">
                {/* 팝업 헤더 (드래그 핸들) */}
                <div className="popup-handle flex justify-between items-center p-4 bg-gray-100 cursor-move rounded-t-lg">
                  <h3 className="text-lg font-semibold">{popup.title}</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => handleClose(popup.popUpId)}
                  >
                    ✕
                  </button>
                </div>

                {/* 팝업 컨텐츠 */}
                <div className="p-4 h-[calc(400px-64px)] overflow-auto">
                  {popup.popUpPic ? (
                    <img
                      src={`http://112.222.157.157:5233/pic/popUp/${popup.popUpId}/${popup.popUpPic}`}
                      alt={popup.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{popup.comment}</div>
                  )}
                </div>
              </div>
            </Draggable>
          ),
      )}
    </>
  );
};

export default PopupWindow;
