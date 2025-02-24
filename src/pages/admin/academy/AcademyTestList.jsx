import styled from "@emotion/styled";
import { Button, Input, Form, message, Pagination, Radio, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import CustomModal from "../../../components/modal/Modal";
import { Cookies } from "react-cookie";

function AcademyTestList() {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const cookies = new Cookies();
  const currentUserInfo = useRecoilValue(userInfo);
  const [myAcademyTestList, setMyAcademyTestList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal2Visible, setIsModal2Visible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [academyInfo, setAcademyInfo] = useState("");
  const [radioValue, setRadioValue] = useState(1);
  const [classList, setClassList] = useState([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const acaId = searchParams.get("acaId");
  const classId = searchParams.get("classId");

  const TestList = styled.div`
    button {
      //display: none !important;
    }
    .addOk button,
    .title-font button,
    .small_line_button,
    .ant-form-item-control-input button {
      display: flex !important;
    }
  `;
  const AddTest = styled.div`
    div {
      display: flex;
      align-items: center;
      margin-bottom: 0px;
    }
    .ant-row,
    .ant-form-item-control-input {
      width: 100%;
    }
    .ant-col > label {
      width: 110px;
    }

    .ant-col > label::before {
      content: "" !important;
    }
    .ant-col > label::after {
      content: "*" !important;
      margin-top: 5px;
      color: #ff4400;
      font-size: 1.25rem;
    }
    .ant-form-item-additional {
      width: 100%;
      font-size: 14px;
    }
  `;

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    const subjectName = form.getFieldValue("subjectName");

    if (!subjectName) {
      message.error("시험제목을 입력해 주세요.");
    } else {
      setIsModalVisible(false);
      form.submit();
      form.resetFields(); //초기화
      //목록 다시 불러오기 한번 실행
    }
  };

  const handleButton1Click2 = () => {
    setIsModal2Visible(false);
  };
  const handleButton2Click2 = () => {
    setIsModal2Visible(false);
  };

  const initialValues = {
    scoreType: 0,
    subjectName: "",
  };

  //학원정보 가져오기
  const academyGetInfo = async () => {
    try {
      const res = await axios.get(`/api/academy/academyDetail/${acaId}`);
      setAcademyInfo(res.data.resultData.acaName);
      //console.log(res.data.resultData.acaName);
    } catch (error) {
      console.log(error);
    }
  };

  //과목별 등록된 테스트 목록 가져오기
  const academyTestList = async () => {
    try {
      const res = await axios.get(
        `/api/grade/status?acaId=${acaId}&classId=${classId}`,
      );
      setMyAcademyTestList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //전송하기
  const onFinished = async values => {
    values.classId = parseInt(classId);
    const res = await axios.post("/api/subject", values);
    //console.log(res.data);
    if (res.data.resultData === 1) {
      form.resetFields(); //초기화
      setIsModal2Visible(true);
      setIsModalVisible(false);
      academyTestList(); //목록 다시 호출
    }
    if (res.data.resultData === 0) {
      setIsModal2Visible(true);
    }
    setResultMessage(res.data.resultMessage); //결과 메시지
  };

  //테스트 검색
  const onFinishedSe = async values => {
    console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../academy/testList?acaId=${acaId}&${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    form2.submit();
  };

  useEffect(() => {
    academyGetInfo();

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form2.setFieldsValue({
      classId: classId ? parseInt(classId) : "all",
      search: "",
      showCnt: 40,
    });
  }, []);

  useEffect(() => {
    academyTestList();
  }, []);

  useEffect(() => {
    //강좌 목록
    const academyClassList = async () => {
      try {
        const res = await axios.get(
          `/api/acaClass?acaId=${acaId ? acaId : 0}&page=1`,
        );
        const formatted = res.data.resultData.map(item => ({
          value: item.classId,
          label: item.className,
        }));
        setClassList(formatted);
        //console.log(res.data.resultData);
      } catch (error) {
        console.log(error);
      }
    };
    academyClassList();
  }, []);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <TestList className="w-full">
        <h1 className="title-admin-font">
          {academyInfo}의 테스트 목록
          <p>학원관리 &gt; 강좌목록 &gt; 테스트 목록</p>
        </h1>

        <div className="board-wrap">
          <Form form={form2} onFinish={values => onFinishedSe(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">테스트 검색</label>
                <Form.Item name="classId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="강좌 선택"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={classList}
                  />
                </Form.Item>
                <Form.Item name="search" className="mb-0">
                  <input
                    placeholder="테스트 명을 입력해 주세요."
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

                <Button
                  className="btn-admin-basic"
                  onClick={() => setIsModalVisible(true)}
                >
                  + 테스트 신규등록
                </Button>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              테스트 명
            </div>
            <div className="flex items-center justify-center w-60">등록일</div>
            <div className="flex items-center justify-center w-60">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              채점하기
            </div>
          </div>

          {myAcademyTestList === null && (
            <div className="loop-content w-full p-4 border-b text-center">
              등록된 테스트가 없습니다.
            </div>
          )}

          {myAcademyTestList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `../academy/student?acaId=${acaId}&classId=${classId}`,
                    )
                  }
                >
                  <div className="flex justify-center align-middle w-14 h-14 rounded-xl overflow-hidden">
                    <img
                      src={
                        item.acaPic
                          ? `http://112.222.157.157:5223/pic/academy/${acaId}/${item.acaPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.subjectName}</h4>
                    {/* <p className="text-sm text-gray-500">[채점방식 : 점수]</p> */}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center w-60">
                {item.examDate}
              </div>
              <div className="flex items-center justify-center w-60">
                {item.processingStatus === 0 ? "채점 전" : "채점 완료"}
              </div>
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() =>
                    navigate(
                      `../academy/record?acaId=${acaId}&classId=${classId}&subjectId=${item.subjectId}`,
                    )
                  }
                >
                  채점하기
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={myAcademyTestList?.length}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"테스트 신규등록"}
          content={
            <AddTest>
              <Form
                form={form}
                initialValues={initialValues}
                onFinish={values => onFinished(values)}
              >
                <Form.Item
                  name="scoreType"
                  label="채점 방식"
                  rules={[
                    { required: true, message: "채점 방식을 선택해 주세요." },
                  ]}
                >
                  <Radio.Group
                    value={radioValue}
                    options={[
                      {
                        value: 0,
                        label: "점수",
                      },
                      {
                        value: 1,
                        label: "합격 / 불합격",
                      },
                    ]}
                  />
                </Form.Item>

                <div className="flex w-full mt-3">
                  <Form.Item
                    name="subjectName"
                    className="w-full"
                    rules={[
                      { required: true, message: "시험 제목을 입력해 주세요." },
                    ]}
                  >
                    <Input
                      className="input w-full h-14 border rounded-xl"
                      placeholder="시험 제목을 입력해 주세요."
                    />
                  </Form.Item>
                </div>

                {/*
                <div className="flex w-full gap-3 justify-between">
                  <Form.Item>
                    <Button
                      className="w-full h-14 text-sm"
                      onClick={() => setIsModalVisible(false)}
                    >
                      취소하기
                    </Button>
                  </Form.Item>

                  <Form.Item className="w-full">
                    <Button
                      htmlType="submit"
                      className="w-full h-14 bg-[#E8EEF3] text-sm"
                    >
                      등록하기
                    </Button>
                  </Form.Item>
                </div>
                */}
              </Form>
            </AddTest>
          }
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소하기"}
          button2Text={"등록하기"}
          modalWidth={400}
        />

        <CustomModal
          visible={isModal2Visible}
          title={"시험 등록 완료"}
          content={
            <div className="addOk">
              {resultMessage}
              {/*
              <button
                type="button"
                onClick={() => setIsModal2Visible(false)}
                className="w-full flex justify-center items-center rounded-xl h-14 mt-4 bg-[#E8EEF3] text-base"
              >
                닫기
              </button>
              */}
            </div>
          }
          onButton1Click={handleButton1Click2}
          onButton2Click={handleButton2Click2}
          button1Text={"창닫기"}
          button2Text={"확인완료"}
          modalWidth={400}
        />
      </TestList>
    </div>
  );
}

export default AcademyTestList;
