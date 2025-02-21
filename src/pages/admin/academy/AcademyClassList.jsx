import { Button, Form, message, Pagination, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import { Cookies } from "react-cookie";
import CustomModal from "../../../components/modal/Modal";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";

function AcademyClassList() {
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const currentUserInfo = useRecoilValue(userInfo);
  const [classId, setClassId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isModalVisible3, setIsModalVisible3] = useState(false);
  const [classList, setClassList] = useState([]);
  const [academyInfo, setAcademyInfo] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const acaId = searchParams.get("acaId");

  //학원정보 가져오기
  const academyGetInfo = async () => {
    try {
      const res = await axios.get(`/api/academy/academyDetail/${acaId}`);
      setAcademyInfo(res.data.resultData.acaName);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //강좌 목록
  const academyClassList = async () => {
    try {
      const res = await axios.get(`/api/acaClass?acaId=${acaId}&page=1`);
      setClassList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //강좌 삭제하기
  const deleteClass = async classId => {
    setClassId(classId);
    setIsModalVisible(true);
  };

  //강좌삭제 확인팝업 관련
  const handleButton1Click = () => {
    setClassId();
    setIsModalVisible(false);
  };
  const handleButton2Click = async () => {
    try {
      const res = await axios.delete(
        `/api/acaClass?acaId=${acaId}&classId=${classId}`,
      );
      //console.log(res.data.resultData);
      if (res.data.resultData === 1) {
        setIsModalVisible(false);
        setIsModalVisible2(true);
        setClassId();
        academyClassList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  //강좌 삭제완료 팝업
  const handleButton1Click1 = () => {
    setIsModalVisible2(false);
  };
  const handleButton2Click2 = () => {
    setIsModalVisible2(false);
  };

  //학원선택 안내 팝업
  const handleButton1Click3 = () => {
    setIsModalVisible3(false);
  };
  const handleButton2Click4 = () => {
    setIsModalVisible3(false);
  };

  //강의선택 안내 팝업창 오픈
  const errorMessage = () => {
    setIsModalVisible3(true);
  };

  const onFinished = async values => {
    //console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../academy/class?${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    form.submit();
  };

  useEffect(() => {
    academyClassList();
  }, [currentUserInfo]);

  useEffect(() => {
    academyGetInfo();

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      acaId: acaId ? parseInt(acaId) : "",
      search: "",
      showCnt: 40,
    });
  }, []);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          {academyInfo}의 강의목록
          <p>학원 관리 &gt; 학원 강의목록</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">강의 검색</label>
                <Form.Item name="acaId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="학원 선택"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    //onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "",
                        label: "전체",
                      },
                      {
                        value: 2047,
                        label: "대구 ABC상아탑 학원",
                      },
                      {
                        value: "2",
                        label: "in서울 입시학원",
                      },
                      {
                        value: "3",
                        label: "가나다 어학원",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="search" className="mb-0">
                  <input
                    type="text"
                    placeholder="강의 명를 입력해 주세요."
                    className="input-admin-basic w-60"
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
                    name="showCnt"
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

                {acaId ? (
                  <Button
                    className="btn-admin-basic"
                    onClick={() =>
                      navigate(`../academy/classAdd?acaId=${acaId}`)
                    }
                  >
                    + 강의 신규등록
                  </Button>
                ) : (
                  <Button
                    className="btn-admin-basic"
                    onClick={() => errorMessage()}
                  >
                    + 강의 신규등록
                  </Button>
                )}
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b">
            <div className="flex items-center justify-center w-full">
              강의 명
            </div>
            <div className="flex items-center justify-center w-40">강사명</div>
            <div className="flex items-center justify-center w-44">시작일</div>
            <div className="flex items-center justify-center w-44">종료일</div>
            <div className="flex items-center justify-center w-40">
              교재 관리
            </div>
            <div className="flex items-center justify-center w-40">
              테스트 관리
            </div>
            <div className="flex items-center justify-center w-28">관리</div>
          </div>

          {classList === null && (
            <div className="text-center p-4 border-b">
              등록된 강의가 없습니다.
            </div>
          )}

          {classList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div
                  className="flex items-center gap-4 pl-2 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/admin/academy/student?acaId=${acaId}&classId=${item.classId}`,
                    )
                  }
                >
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={`http://112.222.157.157:5223/pic/academy/${acaId}/${item.acaPic}`}
                      alt=""
                      className="max-w-fit max-h-full object-cover"
                    />
                  </div>
                  {item.className}
                </div>
              </div>
              <div className="flex items-center justify-center w-40">
                홍길동
              </div>
              <div className="flex items-center justify-center w-44">
                {item.startDate}
              </div>
              <div className="flex items-center justify-center w-44">
                {item.endDate}
              </div>
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() =>
                    navigate(
                      `../academy/textBook?acaId=${acaId}&classId=${item.classId}`,
                    )
                  }
                >
                  교재 목록
                </button>
              </div>
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() =>
                    navigate(
                      `../academy/testList?acaId=${acaId}&classId=${item.classId}`,
                    )
                  }
                >
                  테스트 목록
                </button>
              </div>
              <div className="flex gap-4 items-center justify-center w-28">
                <button
                  onClick={() =>
                    navigate(
                      `../academy/classEdit?acaId=${acaId}&classId=${item.classId}`,
                    )
                  }
                >
                  <FaPen className="w-3 text-gray-400" />
                </button>
                <button onClick={() => deleteClass(item.classId)}>
                  <FaRegTrashAlt className="w-3 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={classList?.length}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"강좌 삭제하기"}
          content={"선택하신 강좌를 삭제하시겠습니까?"}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소하기"}
          button2Text={"삭제하기"}
          modalWidth={400}
        />

        <CustomModal
          visible={isModalVisible2}
          title={"강좌 삭제완료"}
          content={"선택하신 강좌가 삭제되었습니다."}
          onButton1Click={handleButton1Click1}
          onButton2Click={handleButton2Click2}
          button1Text={"닫기"}
          button2Text={"확인"}
          modalWidth={400}
        />

        <CustomModal
          visible={isModalVisible3}
          title={"강의 신규등록"}
          content={"강의를 등록할 학원을 먼저 선택해 주세요."}
          onButton1Click={handleButton1Click3}
          onButton2Click={handleButton2Click4}
          button1Text={"닫기"}
          button2Text={"확인"}
          modalWidth={400}
        />
      </div>
    </div>
  );
}

export default AcademyClassList;
