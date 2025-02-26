import styled from "@emotion/styled";
import { Button, Form, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwtAxios from "../../apis/jwt";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";

const InputWrapper = styled.div`
  width: 100%;
  .ant-input {
    height: 40px;
    border-radius: 4px;
  }
  .ant-form-item {
    width: 100%;
  }
`;

interface BoardItem {
  boardId: number;
  userId: number;
  boardComment: string;
  boardName: string;
  createdAt: string;
  name: string;
}

const NoticeView = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");
  const [boardDetail, setBoardDetail] = useState<BoardItem | null>(null);
  const { userId } = useRecoilValue(userInfo);

  const fetchBoardDetail = async () => {
    if (!userId) return;

    try {
      const response = await jwtAxios.get(`/api/board`, {
        params: {
          userId: userId,
          page: 1,
          size: 10,
        },
      });

      const filteredData = response.data.resultData.filter(
        (item: BoardItem | null): item is BoardItem =>
          item !== null && item.boardId === Number(boardId),
      )[0]; // 첫 번째 항목만 가져옴
      console.log(response);

      setBoardDetail(filteredData);
    } catch (error) {
      console.error("Error fetching board detail:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await jwtAxios.delete("/api/board", {
        params: {
          boardId: boardId,
          userId: userId,
        },
      });

      if (response.data.resultMessage) {
        message.success("게시글이 삭제되었습니다.");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      message.error("게시글 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (boardId && userId) {
      fetchBoardDetail();
    }
  }, [boardId, userId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          공지사항 보기
          <p>공지 및 콘텐츠 관리 {">"} 공지사항 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form}>
            <div className="justify-between p-2 border-b">
              <div className="flex items-center gap-1">
                <label className="min-w-[100px] text-sm">제목</label>
                <InputWrapper>
                  <Form.Item name="title" className="m-0 text-[#666]">
                    {boardDetail?.boardName}
                  </Form.Item>
                </InputWrapper>
              </div>
            </div>
            <div className="flex p-2 pl-3 border-b h-[600px] text-[#666]">
              {boardDetail?.boardComment}
            </div>
            <div className="flex justify-end p-3 gap-3 border-b">
              <button
                type="button"
                className="btn-admin-cancel"
                onClick={handleDelete}
              >
                삭제하기
              </button>

              <Button
                className="btn-admin-ok"
                onClick={() =>
                  navigate(`/admin/notice-content/add?boardId=${boardId}`)
                }
              >
                수정하기
              </Button>

              <button
                type="button"
                className="h-[30px] px-[10px] bg-[#ececec] rounded-[4px] text-[#242424] text-[12px]"
                onClick={() => navigate(-1)}
              >
                목록으로
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NoticeView;
