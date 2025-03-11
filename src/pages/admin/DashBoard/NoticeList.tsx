import { useNavigate } from "react-router-dom";
import { BoardItem } from "./types";

interface NoticeListProps {
  notices: BoardItem[];
}

const NoticeList = ({ notices }: NoticeListProps) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg h-[120px] min-w-[350px]">
      <div>
        <ul className="flex mx-auto w-full h-[30px] bg-[#F1F5FA]">
          <li
            className="flex justify-center items-center w-[200px] cursor-pointer"
            onClick={() => navigate("/admin/notice-content")}
          >
            공지사항
          </li>
          <li className="flex justify-center items-center min-w-32">작성일</li>
        </ul>
        {notices.map((notice, index) => (
          <ul key={index} className="flex mx-auto w-full h-[30px]">
            <li
              className="flex justify-center items-center min-w-[175px] w-[200px] cursor-pointer"
              onClick={() =>
                navigate(`/admin/notice-content/view?boardId=${notice.boardId}`)
              }
            >
              <span
                className="truncate pl-3 pr-3 text-[14px]"
                title={notice.boardName}
              >
                {notice.boardName}
              </span>
            </li>
            <li className="flex justify-center items-center min-w-32 text-gray-500 text-sm text-[14px]">
              {notice.createdAt}
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default NoticeList;
