import { Button, Form, Input, message, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import axios from "axios";
import CustomModal from "../../../components/modal/Modal";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";

interface classListType {
  acaPic: string;
  acaPics: string;
  classId: number;
  className: string;
  endDate: string;
  name: string;
  startDate: string;
}

interface textBookListType {
  bookAmount: number;
  bookComment: string;
  bookId: number;
  bookName: string;
  bookPic: string;
  bookPrice: number;
  classId: number;
  manager: string;
}

interface myAcademyListType {
  acaId: number;
  acaName: string;
}

function AcademyTextbookList(): JSX.Element {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId, roleId } = useRecoilValue(userInfo);
  const [searchParams] = useSearchParams();
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]); //학원 목록
  const [classList, setClassList] = useState<classListType[]>([]); //강좌 목록
  const [textBookList, setTextBookList] = useState<textBookListType[]>([]); //교제 목록
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [textBookId, setTextBookId] = useState<number>(0);

  const acaId: number = parseInt(searchParams.get("acaId") || "", 0);
  const classId: number = parseInt(searchParams.get("classId") || "", 0);
  const showCnt: number = parseInt(searchParams.get("showCnt") || "10", 0);

  //전체학원 목록
  const academyList = async () => {
    try {
      if (roleId === 0) {
        //전체 관리자일 때
        const res = await axios.get(`/api/menuOut/academy`);
        setMyAcademyList(res.data.resultData);
        //console.log("admin : ", res.data.resultData);
      } else {
        const res = await axios.get(
          `/api/academy/getAcademyListByUserId?signedUserId=${userId}`,
        );
        setMyAcademyList(res.data.resultData);
        //console.log("academy : ", res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // acaId와 acaName만 남기기
  const simplifiedData = myAcademyList.map(
    ({ acaId: value, acaName: label }) => ({
      value,
      label,
    }),
  );

  //강좌 목록
  const academyClassList = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/menuOut/class?acaId=${value ? value : acaId}`,
      );
      setClassList(res.data.resultData);
      console.log("classList : ", res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };
  // acaId와 acaName만 남기기
  const simplifiedData2 = classList?.map(
    ({ classId: value, className: label }) => ({
      value,
      label,
    }),
  );

  //교재목록 호출
  const getTextBookList = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/book/getBookList/${value ? value : classId}`,
      );
      setTextBookList(res.data.resultData);
      //console.log("book list : ", res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //학원 선택
  const handleAcademyChange = (value: number) => {
    //console.log(value);
    form.setFieldsValue({
      classId: null,
    });
    form.submit();
    academyClassList(value); //강좌목록
    //getTextBookList(value); //교제목록
    setTextBookList([]);
  };

  //강좌선택
  const handleClassChange = (value: number) => {
    //alert(value);
    form.submit();
    getTextBookList(value); //교제목록
  };

  //학원 검색
  const onFinished = async (values: any) => {
    //console.log(values);

    try {
      const res = await axios.get(
        `/api/book/getBookList/${values.classId}&size=${showCnt}`,
      );
      //console.log(res.data.resultData);
      setTextBookList(res.data.resultData);
    } catch (error) {
      console.log(error);
    }

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../textbook?${queryParams}`); //쿼리스트링 url에 추가
  };

  //교재삭제 팝업
  const handleTextBookDelete = (bookId: number) => {
    setTextBookId(bookId);
    setIsModalVisible(true);
  };

  //교재삭제
  const DeleteTextBook = async (bookId: number) => {
    try {
      const res = await axios.delete(`/api/book/deleteBook?bookId=${bookId}`);
      //console.log(res.data.resultData);

      if (res.data.resultData === 1) {
        message.success("등록된 교재을 삭제하였습니다.");
        getTextBookList(classId);
      }
    } catch (error) {
      message.error("교재 삭제가 실패되었습니다.");
      console.log(error);
    }
  };

  //교재삭제 확인
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    DeleteTextBook(textBookId);
    setIsModalVisible(false);
  };

  useEffect(() => {
    academyList(); //학원 목록
    academyClassList(acaId); //강좌 목록
    getTextBookList(classId); //교재 목록
  }, []);

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      acaId: acaId ? acaId : null,
      classId: classId ? classId : null,
      search: "",
      showCnt: 10,
    });
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          교재 관리
          <p>학원 관리 &gt; 학원 강의목록 &gt; 교재 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="mr-3 text-sm">학원 선택</label>
                <Form.Item name="acaId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="학원 선택"
                    optionFilterProp="label"
                    className="select-admin-basic !min-w-52"
                    onChange={handleAcademyChange}
                    options={simplifiedData}
                  />
                </Form.Item>

                <label className="mr-3 ml-10 text-sm">강좌 선택</label>
                <Form.Item name="classId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="강좌를 선택하세요"
                    optionFilterProp="label"
                    className="select-admin-basic !min-w-52"
                    onChange={handleClassChange}
                    options={simplifiedData2}
                  />
                </Form.Item>

                <Form.Item name="search" className="mb-0">
                  <Input
                    className="input-admin-basic w-60"
                    placeholder="검색어를 입력해 주세요."
                  />
                </Form.Item>

                <Button htmlType="submit" className="btn-admin-basic">
                  검색하기
                </Button>
              </div>

              <div className="flex gap-2">
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    showSearch
                    placeholder="10개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={handleClassChange}
                    options={[
                      {
                        value: 10,
                        label: "10개씩 보기",
                      },
                      {
                        value: 20,
                        label: "20개씩 보기",
                      },
                      {
                        value: 50,
                        label: "50개씩 보기",
                      },
                    ]}
                  />
                </Form.Item>

                <Button
                  className="btn-admin-basic"
                  onClick={() =>
                    navigate(
                      `../textbook-add?acaId=${acaId}&classId=${classId}`,
                    )
                  }
                >
                  + 교재 신규등록
                </Button>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              교재명
            </div>
            <div className="flex items-center justify-center w-40">담당자</div>
            <div className="flex items-center justify-center w-40">수량</div>
            <div className="flex items-center justify-center w-40">가격</div>
            <div className="flex items-center justify-center w-36">관리</div>
          </div>

          {!textBookList && (
            <div className="p-4 text-center border-b">
              등록된 교재가 없습니다.
            </div>
          )}
          {textBookList?.length === 0 && (
            <div className="p-4 text-center border-b">
              등록된 교재가 없습니다.
            </div>
          )}

          {textBookList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.bookPic && item.bookPic !== "default_user.jpg"
                          ? `http://112.222.157.157:5233/pic/book/${item.bookId}/${item.bookPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  {item.bookName}
                </div>
              </div>
              <div className="flex items-center justify-center text-center w-40">
                {item.manager}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.bookAmount}개
              </div>
              <div className="flex items-center justify-center w-40">
                {item.bookPrice.toLocaleString()}원
              </div>
              <div className="flex gap-4 items-center justify-center w-36">
                <button
                  onClick={() =>
                    navigate(
                      `../textbook-edit?acaId=${acaId}&classId=${classId}&bookId=${item.bookId}`,
                    )
                  }
                >
                  <FaPen className="w-3 text-gray-400" />
                </button>
                <button onClick={() => handleTextBookDelete(item.bookId)}>
                  <FaRegTrashAlt className="w-3 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination defaultCurrent={1} total={10} showSizeChanger={false} />
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"교재 삭제하기"}
        content={"선택하신 교재를 삭제하시겠습니까?"}
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text={"취소하기"}
        button2Text={"삭제하기"}
        modalWidth={400}
      />
    </div>
  );
}

export default AcademyTextbookList;
