import { Button, Form, message, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";

// 게시글 타입 정의
interface BoardItem {
  boardId: number;
  userId: number;
  boardName: string;
  createdAt: string;
  name: string;
}

const NoticeContent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const [boardList, setBoardList] = useState<BoardItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [searchText, setSearchText] = useState("");
  const { userId } = useRecoilValue(userInfo);

  const fetchBoardList = async (page: number, size: number) => {
    if (!userId) return;

    try {
      const response = await jwtAxios.get(`/api/board`, {
        params: {
          userId: userId,
          page: page,
          size: size,
        },
      });
      console.log(userId);
      const filteredData = response.data.resultData.filter(
        (item: BoardItem | null): item is BoardItem => item !== null,
      );
      setBoardList(filteredData);
    } catch (error) {
      console.error("Error fetching board list:", error);
    }
  };

  const onFinished = async (values: any) => {
    console.log(values);
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`);
  };

  const onChange = (value: number) => {
    setPageSize(value);
    fetchBoardList(currentPage, value);
    form.submit();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBoardList(page, pageSize);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchBoardList(currentPage, pageSize);
  };

  const selectOptions = boardList.map(item => ({
    value: item.boardId,
    label: item.boardName,
  }));

  const handleDelete = async (boardId: number) => {
    try {
      const response = await jwtAxios.delete("/api/board", {
        params: {
          boardId: boardId,
          userId: userId,
        },
      });

      if (response.data.resultMessage) {
        message.success("게시글이 삭제되었습니다.");
        fetchBoardList(currentPage, pageSize);
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      message.error("게시글 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (userId) {
      form.setFieldsValue({
        state: searchParams.get("state")
          ? parseInt(searchParams.get("state")!)
          : "항목을 검색해 주세요",
        search: "",
        showCnt: pageSize,
      });
      fetchBoardList(currentPage, pageSize);
    }
  }, [userId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          공지사항 관리
          <p>공지 및 콘텐츠 관리 {">"} 공지사항 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-28 text-sm">공지사항 통합검색</label>
                <Form.Item name="state" className="mb-0">
                  <Select
                    showSearch
                    placeholder="공지사항을 검색하세요"
                    optionFilterProp="label"
                    className="select-admin-basic w-[300px]"
                    onChange={handleSearch}
                    onSearch={handleSearch}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={selectOptions}
                  />
                </Form.Item>
              </div>

              <div className="flex gap-2">
                <Button
                  className="btn-admin-basic"
                  onClick={() => navigate("/admin/notice-content/add")}
                >
                  + 공지사항 등록
                </Button>
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    placeholder="40개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: 40,
                        label: "40개씩 보기",
                      },
                      {
                        value: 50,
                        label: "50개씩 보기",
                      },
                      {
                        value: 60,
                        label: "60개씩 보기",
                      },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-[100%]">
              제목
            </div>
            <div className="flex items-center justify-center min-w-[200px]">
              작성일
            </div>
            <div className="flex items-center justify-center min-w-[200px]">
              작성자
            </div>
            <div className="flex items-center justify-center min-w-[132px]">
              수정하기
            </div>
            <div className="flex items-center justify-center min-w-[72px]">
              삭제
            </div>
          </div>

          {boardList.map(item => (
            <div
              key={item.boardId}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-[100%] h-[56px]">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() =>
                      navigate(
                        `/admin/notice-content/view?boardId=${item.boardId}`,
                      )
                    }
                  >
                    <h4>{item?.boardName}</h4>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center text-center min-w-[200px]">
                {item.createdAt}
              </div>
              <div className="flex items-center justify-center text-center min-w-[200px]">
                {item.name}
              </div>
              <div className="flex items-center justify-center min-w-[132px]">
                <p
                  className="w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/admin/notice-content/add?boardId=${item.boardId}`,
                    )
                  }
                >
                  수정하기
                </p>
              </div>
              <div className="flex gap-4 items-center justify-center min-w-[72px]">
                <button
                  onClick={() => {
                    if (window.confirm("정말 삭제하시겠습니까?")) {
                      handleDelete(item.boardId);
                    }
                  }}
                >
                  <FaRegTrashAlt className="w-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default NoticeContent;
