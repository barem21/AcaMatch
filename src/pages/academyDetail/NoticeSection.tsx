import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { SlArrowDown } from "react-icons/sl";
import jwtAxios from "../../apis/jwt";

// BoardItem 인터페이스 정의
interface BoardItem {
  boardId: number;
  acaId?: number;
  acaName?: string;
  userId?: number;
  boardName: string;
  boardComment?: string;
  createdAt: string;
  name: string;
  totalCount?: number;
}

interface NoticeSectionProps {
  acaId: string | null;
}

const NoticeSection: React.FC<NoticeSectionProps> = ({ acaId }) => {
  // 공지사항 상태
  const [academyNotices, setAcademyNotices] = useState<BoardItem[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [openNotices, setOpenNotices] = useState<number[]>([]);
  const [noticeDetails, setNoticeDetails] = useState<Record<number, BoardItem>>(
    {},
  );
  const [loadingNoticeIds, setLoadingNoticeIds] = useState<number[]>([]);

  // 공지사항 토글 함수
  const toggleNotice = async (notice: BoardItem) => {
    const boardId = notice.boardId;

    // 이미 열려있는 경우 닫기
    if (openNotices.includes(boardId)) {
      setOpenNotices(prev => prev.filter(id => id !== boardId));
      return;
    }

    // 아직 상세 내용을 불러오지 않은 경우
    if (!noticeDetails[boardId]?.boardComment) {
      setLoadingNoticeIds(prev => [...prev, boardId]);

      try {
        const response = await jwtAxios.get(`/api/board`, {
          params: { boardId },
        });

        const detailData = response.data.resultData;
        setNoticeDetails(prev => ({
          ...prev,
          [boardId]: detailData,
        }));
      } catch (error) {
        console.error("Error fetching notice detail:", error);
        message.error("공지사항 상세 내용을 불러오는데 실패했습니다.");
      } finally {
        setLoadingNoticeIds(prev => prev.filter(id => id !== boardId));
      }
    }

    // 열린 공지사항 목록에 추가
    setOpenNotices(prev => [...prev, boardId]);
  };

  // 학원 공지사항 불러오는 함수
  const fetchAcademyNotices = async () => {
    if (!acaId) return;

    setNoticeLoading(true);
    try {
      const params = {
        acaId: acaId,
        page: 1,
        size: 5, // 최근 5개 공지사항만 표시
      };

      const response = await jwtAxios.get(`/api/board/list`, { params });
      const { resultData } = response.data;

      const filteredData = resultData?.filter(
        (item: BoardItem | null): item is BoardItem => item !== null,
      );

      setAcademyNotices(filteredData || []);
    } catch (error) {
      console.error("Error fetching academy notices:", error);
    } finally {
      setNoticeLoading(false);
    }
  };

  // 학원 정보 로드 시 공지사항도 함께 로드
  useEffect(() => {
    if (acaId) {
      fetchAcademyNotices();
    }
  }, [acaId]);

  return (
    <>
      <div className="text-[24px] font-bold flex items-center h-[70px]">
        공지사항
      </div>
      <div className="mb-[50px] w-[100%] max-[640px]:w-[90%]">
        {noticeLoading ? (
          <div className="flex justify-center items-center h-[100px]">
            <Spin />
          </div>
        ) : academyNotices.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            {academyNotices.map(notice => (
              <div
                key={notice.boardId}
                className="border-b last:border-b-0 cursor-pointer"
                onClick={() => toggleNotice(notice)}
              >
                <div className="py-4 px-[16px]">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                          <h3 className="text-base font-medium">
                            {notice.boardName}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {notice.createdAt}
                          </span>
                        </div>
                        {loadingNoticeIds.includes(notice.boardId) ? (
                          <Spin size="small" />
                        ) : (
                          <SlArrowDown
                            className={`transition-transform duration-200 ${
                              openNotices.includes(notice.boardId)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`transition-all duration-200 overflow-hidden bg-brand-BTWhite ${
                    openNotices.includes(notice.boardId)
                      ? "max-h-[500px]"
                      : "max-h-0"
                  }`}
                >
                  <div className="py-4 px-[16px]">
                    <div className="flex items-center gap-2">
                      {noticeDetails[notice.boardId]?.boardComment ? (
                        <div
                          className="text-sm"
                          dangerouslySetInnerHTML={{
                            __html:
                              noticeDetails[notice.boardId].boardComment || "",
                          }}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          내용을 불러오는 중...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-[157px] border rounded-lg">
            등록된 공지사항이 없습니다.
          </div>
        )}
      </div>
    </>
  );
};

export default NoticeSection;
