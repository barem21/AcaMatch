import { Button, Form, message, Pagination, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import CustomModal from "../../components/modal/Modal";

// 게시글 타입 정의
interface BoardItem {
  boardId: number;
  userId: number;
  boardName: string;
  createdAt: string;
  name: string;
  totalCount: number;
}

const NoticeContent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const [boardList, setBoardList] = useState<BoardItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [_searchText, setSearchText] = useState("");
  const { userId, roleId } = useRecoilValue(userInfo);
  const [noticeType, setNoticeType] = useState<"server" | "academy">("academy");
  const [myAcademyList, setMyAcademyList] = useState<
    Array<{ acaId: number; acaName: string }>
  >([]);
  const [selectedAcaId, setSelectedAcaId] = useState<number | null>(null);
  const location = useLocation();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [academyLoading, setAcademyLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  const fetchBoardList = async (page: number, size: number) => {
    setLoading(true);
    setDataReady(false);
    try {
      const params = {
        ...(noticeType === "server" ? { userId: 1 } : { acaId: selectedAcaId }),
        page,
        size,
      };

      const response = await jwtAxios.get(`/api/board/list`, { params });
      const { resultData } = response.data;

      if (resultData) {
        if (resultData.length > 0) {
          setTotalItems(resultData[0].totalCount);
        }

        const filteredData = resultData.filter(
          (item: BoardItem | null): item is BoardItem => item !== null,
        );

        setBoardList(filteredData);
        setDataReady(true);
      }
    } catch (error) {
      console.error("Error fetching board list:", error);
      message.error("공지사항 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onFinished = async (values: any) => {
    // console.log(values);
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

  const selectOptions = boardList?.map(item => ({
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
        setIsDeleteModalVisible(false);
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      message.error("게시글 삭제에 실패했습니다.");
    }
  };

  const handleNoticeTypeChange = (value: "server" | "academy") => {
    setNoticeType(value);
    if (value === "server") {
      setSelectedAcaId(null);
      navigate("/admin/notice-content");
    } else if (value === "academy" && myAcademyList.length > 0) {
      const firstAcademy = myAcademyList[0];
      setSelectedAcaId(firstAcademy.acaId);
      navigate(`/admin/notice-content?acaId=${firstAcademy.acaId}`);
    }
  };

  const handleAcademyChange = (value: number) => {
    setSelectedAcaId(value);
    setCurrentPage(1);
    navigate(`/admin/notice-content?acaId=${value}`);
    fetchBoardList(1, pageSize);
  };

  const fetchAcademyList = async () => {
    setAcademyLoading(true);
    try {
      const res = await axios.get(
        `/api/academy/getAcademyListByUserId?signedUserId=${userId}&acaAgree=1`,
      );

      if (res.data && res.data.resultData) {
        setMyAcademyList(res.data.resultData);

        if (res.data.resultData.length > 0) {
          const params = new URLSearchParams(location.search);
          const acaId = params.get("acaId");

          if (!acaId) {
            const firstAcademy = res.data.resultData[0];
            setSelectedAcaId(firstAcademy.acaId);
            navigate(`/admin/notice-content?acaId=${firstAcademy.acaId}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch academy list:", error);
      message.error("학원 목록을 불러오는데 실패했습니다.");
    } finally {
      setAcademyLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      const params = new URLSearchParams(location.search);
      const acaId = params.get("acaId");

      if (acaId) {
        setNoticeType("academy");
        setSelectedAcaId(Number(acaId));
      } else {
        setNoticeType("server");
        setSelectedAcaId(null);
      }

      form.setFieldsValue({
        state: searchParams.get("state")
          ? parseInt(searchParams.get("state")!)
          : "항목을 검색해 주세요",
        search: "",
        showCnt: pageSize,
      });
    }
  }, [userId, location.search]);

  useEffect(() => {
    if (userId && noticeType === "academy") {
      fetchAcademyList();
    } else {
      setAcademyLoading(false);
    }
  }, [userId, noticeType]);

  useEffect(() => {
    if (
      userId &&
      (noticeType === "server" || (noticeType === "academy" && selectedAcaId))
    ) {
      fetchBoardList(currentPage, pageSize);
    }
  }, [userId, noticeType, selectedAcaId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      {!loading && !academyLoading && (dataReady || noticeType === "server") ? (
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
                  {roleId === 3 && (
                    <div className="flex">
                      <Select
                        className="select-admin-basic w-[100px] mr-2"
                        value={noticeType}
                        onChange={handleNoticeTypeChange}
                        options={[
                          { value: "academy", label: "학원" },
                          { value: "server", label: "사이트" },
                        ]}
                      />

                      {noticeType === "academy" && (
                        <Select
                          showSearch
                          className="select-admin-basic w-[200px] mr-2"
                          placeholder="학원을 선택하세요"
                          value={selectedAcaId}
                          onChange={handleAcademyChange}
                          optionFilterProp="label"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={myAcademyList.map(academy => ({
                            value: academy.acaId,
                            label: academy.acaName,
                          }))}
                        />
                      )}
                    </div>
                  )}
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
                  {(roleId !== 3 || noticeType !== "server") && (
                    <Button
                      className="btn-admin-basic"
                      onClick={() => {
                        if (
                          roleId === 3 &&
                          noticeType === "academy" &&
                          selectedAcaId
                        ) {
                          navigate(
                            `/admin/notice-content/add?acaId=${selectedAcaId}`,
                          );
                        } else {
                          navigate("/admin/notice-content/add");
                        }
                      }}
                    >
                      + 공지사항 등록
                    </Button>
                  )}
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
              {(roleId !== 3 || noticeType !== "server") && (
                <>
                  <div className="flex items-center justify-center min-w-[132px]">
                    수정하기
                  </div>
                  <div className="flex items-center justify-center min-w-[72px]">
                    삭제
                  </div>
                </>
              )}
            </div>

            {boardList && boardList.length > 0 ? (
              boardList.map(item => (
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
                  {(roleId !== 3 || noticeType !== "server") && (
                    <>
                      <div className="flex items-center justify-center min-w-[132px]">
                        <p
                          className="w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300 cursor-pointer"
                          onClick={() => {
                            const queryParams = new URLSearchParams();
                            queryParams.append(
                              "boardId",
                              item.boardId.toString(),
                            );
                            if (
                              roleId === 3 &&
                              noticeType === "academy" &&
                              selectedAcaId
                            ) {
                              queryParams.append(
                                "acaId",
                                selectedAcaId.toString(),
                              );
                            }
                            navigate(
                              `/admin/notice-content/add?${queryParams.toString()}`,
                            );
                          }}
                        >
                          수정하기
                        </p>
                      </div>
                      <div className="flex gap-4 items-center justify-center min-w-[72px]">
                        <button
                          onClick={() => {
                            setSelectedBoardId(item.boardId);
                            setIsDeleteModalVisible(true);
                          }}
                        >
                          <FaRegTrashAlt className="w-3 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="p-2 border-b">
                <div className="flex justify-center items-center h-[56px]  ">
                  등록된 공지사항이 없습니다.
                </div>
              </div>
            )}
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
      ) : (
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">데이터를 불러오는 중입니다...</div>
        </div>
      )}

      {isDeleteModalVisible && (
        <CustomModal
          visible={isDeleteModalVisible}
          title={"공지사항 삭제"}
          content={<p className="mt-[15px]">공지사항을 삭제하시겠습니까?</p>}
          onButton1Click={() => setIsDeleteModalVisible(false)}
          onButton2Click={() =>
            selectedBoardId && handleDelete(selectedBoardId)
          }
          button1Text={"취소"}
          button2Text={"확인"}
          modalWidth={400}
        />
      )}
    </div>
  );
};

export default NoticeContent;
