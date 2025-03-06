import { useEffect, useState } from "react";
import Draggable from "react-draggable";
import jwtAxios from "../../apis/jwt";
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

interface PopupWindowProps {
  isAdmin?: boolean; // prop 추가
}

const PopupWindow: React.FC<PopupWindowProps> = ({ isAdmin = false }) => {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [closedPopups, setClosedPopups] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const response = await jwtAxios.get("/api/popUp", {
          params: { page: 1, size: 1000 },
        });

        const today = dayjs();
        // admin과 일반 페이지에 따라 다른 필터링 조건 적용
        const activePopups = response.data.resultData.filter(
          (popup: PopupItem) => {
            const isActive =
              dayjs(popup.endDate).isSameOrAfter(today, "day") &&
              popup.popUpShow === 1;

            if (isAdmin) {
              // admin 페이지: popUpType이 1인 팝업만 표시
              return isActive && popup.popUpType === 1;
            } else {
              // 메인 페이지: popUpType이 0인 팝업만 표시
              return isActive && popup.popUpType === 0;
            }
          },
        );

        setPopups(activePopups);
      } catch (error) {
        console.error("팝업 데이터 로드 실패:", error);
      }
    };

    fetchPopups();
  }, [isAdmin]); // isAdmin이 변경될 때마다 다시 fetch

  const handleClose = (
    popUpId: number,
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    e.preventDefault(); // 기본 이벤트 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    setClosedPopups(prev => new Set([...prev, popUpId]));
  };

  return (
    <>
      {popups.map(
        popup =>
          !closedPopups.has(popup.popUpId) && (
            <Draggable key={popup.popUpId} handle=".popup-handle">
              <div className="fixed top-20 left-20 bg-white border border-gray-300 rounded-lg shadow-lg w-[400px] h-[400px] z-50 max-w-[90vw]">
                <div className="popup-handle flex justify-between items-center p-4 bg-gray-100 cursor-move rounded-t-lg">
                  <h3 className="text-lg font-semibold">{popup.title}</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700 p-2 touch-manipulation"
                    onClick={e => handleClose(popup.popUpId, e)}
                    onTouchEnd={e => handleClose(popup.popUpId, e)}
                    aria-label="Close popup"
                  >
                    <span className="block w-6 h-6 flex items-center justify-center">
                      ✕
                    </span>
                  </button>
                </div>
                <div className="p-4 h-[calc(400px-64px)] overflow-auto">
                  {popup.popUpPic ? (
                    <img
                      src={`http://112.222.157.157:5233/pic/popUp/${popup.popUpId}/${popup.popUpPic}`}
                      alt={popup.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
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
