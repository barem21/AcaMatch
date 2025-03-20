import { UploadOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import {
  Button,
  Form,
  message,
  Pagination,
  Radio,
  Select,
  Upload,
  UploadProps,
} from "antd";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../../apis/jwt";
import userInfo from "../../../atoms/userInfo";
import AI from "../../../components/AI";
import CustomModal from "../../../components/modal/Modal";

const RecordList = styled.div`
  .editModal button {
    display: none !important;
  }
  .addOk button,
  .title-font button,
  .small_line_button,
  .ant-form-item-control-input button {
    display: flex !important;
  }
  .ant-upload.ant-upload-select {
    width: 100%;
  }
  .ant-upload.ant-upload-select .ant-btn {
    width: 100%;
    height: auto;
    padding: 10px 0px;
  }
  .ant-upload-list-item .ant-upload-icon,
  .ant-upload-list-item-progress {
    display: none;
  }
  .btn-wrap .ant-form-item {
    margin: 0px;
  }
`;

const AddRecoad = styled.div``;

interface aiHistoryType {
  feedBack: string;
  createdAt: string;
}

interface testStudentList {
  userId: number;
  userPic: string;
  userName: string;
  joinClassId: number;
  gradeId: number;
  examName: string;
  examDate: string;
  examType: number;
  score: number;
  pass: number;
}

interface classListType {
  acaPic: string;
  acaPics: string;
  classId: number;
  className: string;
  endDate: string;
  name: string;
  startDate: string;
}

interface myAcademyListType {
  acaId: number;
  acaName: string;
}

function AcademyRecord() {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const { roleId, userId } = useRecoilValue(userInfo);
  const [testStudentList, setTestStudentList] = useState<testStudentList[]>([]);
  const [testGradeId, setTestGradeId] = useState<number>(0);
  const [_testRecord, setTestRecord] = useState<number | null>(null);
  const [_testPass, setTestPass] = useState<number | null>(null);
  const [joinClassId, setJoinClassId] = useState<number>(0);
  const [scoreType, setScoreType] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isModalVisible3, setIsModalVisible3] = useState(false);
  const [isModalVisible4, setIsModalVisible4] = useState(false);
  const [isModalVisible5, setIsModalVisible5] = useState(false); //ai 성적분석 팝업창
  const [isModalVisible6, setIsModalVisible6] = useState(false);
  const [_isModalVisible7, setIsModalVisible7] = useState(false);
  const [isModalVisible8, setIsModalVisible8] = useState(false);
  const [isModalVisible9, setIsModalVisible9] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [academyInfo, setAcademyInfo] = useState();
  const [aiHistoryList, _setaiHistoryList] = useState<aiHistoryType[]>([]);
  const [myAcademyTestList, setMyAcademyTestList] = useState([]);

  const [searchParams] = useSearchParams();
  const [fileList, setFileList] = useState([]);
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]); //학원 목록
  const [classList, setClassList] = useState<classListType[]>([]); //강좌 목록

  const navigate = useNavigate();
  const acaId = parseInt(searchParams.get("acaId") || "0", 0);
  const classId = parseInt(searchParams.get("classId") || "0", 0);
  const examId = parseInt(searchParams.get("examId") || "0", 0);
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
      //console.log("classList : ", res.data.resultData);
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

  //테스트 목록
  const academyTestList = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/menuOut/exam?acaId=${acaId}&classId=${value ? value : classId}`,
      );
      const formatted = res.data.resultData.map((item: any) => ({
        value: item.examId,
        label: item.examName,
      }));
      setMyAcademyTestList(formatted);
      //console.log("test list : ", res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //학생 목록
  const academyStudentList = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/grade/gradeDetail?examId=${value ? value : examId}&page=1&size=${showCnt}`,
      );
      setTestStudentList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //학원정보 가져오기
  const academyGetInfo = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/academy/academyDetail/${value ? value : acaId}`,
      );
      setAcademyInfo(res.data.resultData.acaName);
      //console.log(res.data.resultData.acaName);
    } catch (error) {
      console.log(error);
    }
  };

  //학원 선택
  const handleAcademyChange = (value: number) => {
    form3.setFieldsValue({
      classId: null,
      examId: null,
    });
    form3.submit();
    academyGetInfo(value);
    academyClassList(value); //강좌목록
    setTestStudentList([]); //학생목록 초기화
  };

  //강좌 선택
  const handleClassChange = (value: number) => {
    form3.setFieldsValue({
      examId: null,
    });
    form3.submit();
    academyTestList(value); //테스트 목록
    setTestStudentList([]); //학생목록 초기화
  };

  //테스트 선택
  const handleTestChange = (value: number) => {
    form3.submit();
    academyStudentList(value); //수강생 목록
  };

  //시험점수 수정
  const handleButton1Click = () => {
    form.resetFields(); //초기화
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  //수강생 목록 다운로드 관련
  const handle2Button1Click = () => {
    setIsModalVisible2(false);
  };

  //수강생 목록 다운로드(엑셀)
  const handle2Button2Click = async () => {
    const res = await axios.get(`/api/grade/export?examId=${examId}`);
    if (res.data.resultData) {
      window.open(res.data.resultData);
    }
    //console.log(res.data);

    setIsModalVisible2(false);
  };

  //점수 일괄업로드 관련
  const handle3Button1Click = () => {
    setFileList([]);
    setIsModalVisible3(false);
  };
  const handle3Button2Click = () => {
    setFileList([]);
    setIsModalVisible3(false);
  };

  //점수 수정결과 관련
  const handle4Button1Click = () => {
    setIsModalVisible4(false);
  };
  const handle4Button2Click = () => {
    setIsModalVisible4(false);
  };

  //AI 성적분석 관련
  const handle5Button1Click = () => {
    setIsModalVisible5(false);
  };
  const handle5Button2Click = () => {
    setIsModalVisible5(false);
  };

  //점수 등록 관련
  const handle6Button1Click = () => {
    form2.resetFields(); //초기화
    setIsModalVisible6(false);
  };
  /*
  const handle6Button2Click = () => {
    setIsModalVisible6(false);
  };
  */

  //점수 등록결과 관련
  /*
  const handle7Button1Click = () => {
    setIsModalVisible7(false);
  };
  const handle7Button2Click = () => {
    setIsModalVisible7(false);
  };
  */

  //AI 성적분석 내역 관련
  const handle8Button1Click = () => {
    setIsModalVisible8(false);
  };
  const handle8Button2Click = () => {
    setIsModalVisible8(false);
  };

  //점수 일괄등록 에러(엑셀파일 아닐 때)
  const handle9Button1Click = () => {
    setIsModalVisible9(false);
  };
  const handle9Button2Click = () => {
    setIsModalVisible9(false);
  };

  //점수 수정하기 모달창 오픈
  const handleRecordEdit = (
    gradeId: number,
    score: number,
    pass: number,
    examType: number,
  ) => {
    setTestGradeId(gradeId);
    setTestRecord(score);
    setTestPass(pass);
    setScoreType(examType);

    form.setFieldsValue({
      record: pass ? null : score,
      pass: score ? null : pass,
    });
    setIsModalVisible(true);
  };

  //점수 등록하기 모달창 오픈
  const handleRecordAdd = (joinId: number, examType: number) => {
    setJoinClassId(joinId);
    setScoreType(examType);
    form2.setFieldsValue({
      record: examType === 0 && 0,
      pass: examType === 1 && 1,
    });
    setIsModalVisible6(true);
  };

  //AI 성적분석 모달창 오픈
  const handleRecordAI = (gradeId: number) => {
    setTestGradeId(gradeId);

    setIsModalVisible5(true);
  };

  //AI 분석내역 모달창 오픈
  /*
  const handleHistoryAI = async (gradeId: number) => {
    setTestGradeId(gradeId);
    setIsModalVisible8(true);

    //분석목록 가져오기
    try {
      const res = await axios.get(`/api/ai/${gradeId}`);
      //console.log(res.data.resultData);
      setaiHistoryList(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };
  */

  //수강생 다운로드 모달창 오픈
  const handleStudentDownload = () => {
    setIsModalVisible2(true);
  };

  //점수 일괄 업로드 모달창 오픈
  const handleScoreUpload = () => {
    setIsModalVisible3(true);
  };

  //첨부파일 처리
  const handleChange: UploadProps["onChange"] = (info: any) => {
    form.setFieldValue("gradeFile", info.file.originFileObj);
  };

  //점수 직접 등록하기
  const onFinishedTh = async (values: any) => {
    //console.log(values);

    //오늘 날짜 확인
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);
    const dateString = year + "-" + month + "-" + day;

    const datas = {
      joinClassId: joinClassId,
      examId: examId,
      score: parseInt(values.record),
      pass: values.pass ? values.pass : 0,
      examDate: dateString,
      processingStatus: 1,
    };
    const res = await jwtAxios.post("/api/grade", datas);
    if (res.data.resultData === 1) {
      form2.resetFields(); //초기화
      setIsModalVisible6(false);
      setIsModalVisible7(true);
      academyStudentList(examId);
    }
  };

  //점수 직접 수정하기
  const onFinished = async (values: any) => {
    console.log(values);

    //오늘 날짜 확인
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);
    const dateString = year + "-" + month + "-" + day;

    const datas = {
      gradeId: testGradeId,
      score: values.record ? parseInt(values.record) : 0,
      pass: values.pass ? parseInt(values.pass) : 0,
      examDate: dateString,
      processingStatus: 1,
    };

    const res = await jwtAxios.put("/api/grade", datas);
    if (res.data.resultData === 1) {
      form.resetFields(); //초기화
      setIsModalVisible(false);
      setIsModalVisible4(true);
      academyStudentList(examId);
    }
  };

  //엑셀 일괄 수정하기
  const onFinishedSe = async (values: any) => {
    //console.log(values.gradeFile);
    try {
      const formData = new FormData();

      // gradeFile 있는 경우에만 추가
      if (values.gradeFile) {
        formData.append("gradeFile", values.gradeFile);
      } else {
        alert("파일을 선택해 주세요.");
        return;
      }

      const header = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await axios.post(`/api/grade/import`, formData, header);
      if (res.data.resultData === 1) {
        form.resetFields(); //초기화
        setFileList([]);
        message.success("테스트 결과 수정이 완료되었습니다.");
        setIsModalVisible3(false);
        academyStudentList(examId);
      }
    } catch (error: unknown) {
      //console.log(error.response.data.resultMessage);

      form.resetFields(); //초기화
      setFileList([]);
      setIsModalVisible9(true);

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data.resultMessage; //에러 메시지
        if (errorMessage.includes("엑셀 파일이 아닙니다")) {
          setErrorMessage(
            "엑셀 파일(.xlsx)이 아닙니다. 올바른 파일을 선택해주세요.",
          );
        }
        if (errorMessage.includes("DB 수정 중 오류 발생")) {
          setErrorMessage(
            "양식에 맞지 않은 데이터가 포함되어 있습니다. 양식에 맞춰서 엑셀 파일을 작성해 주세요.",
          );
        }
      }

      //message.error(error.response.data.resultMessage);
    }
  };

  //학원 검색
  const onFinishedFo = async (values: any) => {
    console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    form3.submit();
  };

  useEffect(() => {
    academyList(); //학원 목록
    academyGetInfo(acaId); //학원 정보
    academyClassList(acaId); //강좌 목록
    academyTestList(classId); //테스트 목록
    academyStudentList(examId); //수강생 목록

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form3.setFieldsValue({
      acaId: acaId ? acaId : null,
      classId: classId ? classId : null,
      examId: examId ? examId : null,
      search: "",
      showCnt: 10,
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
      <RecordList className="w-full">
        <h1 className="title-admin-font">
          {academyInfo}의 테스트 결과 등록/수정
          <p>
            학원관리 &gt; 강좌 목록 &gt; 테스트 목록 &gt; 테스트 결과 등록/수정
          </p>
        </h1>

        <div className="board-wrap">
          <Form form={form3} onFinish={values => onFinishedFo(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="mr-3 text-sm">학원 선택</label>
                <Form.Item name="acaId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="학원 선택"
                    optionFilterProp="label"
                    className="select-admin-basic !min-w-48"
                    onChange={handleAcademyChange}
                    options={simplifiedData}
                  />
                </Form.Item>

                <label className="mr-3 ml-7 text-sm">강좌 선택</label>
                <Form.Item name="classId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="강좌를 선택하세요"
                    optionFilterProp="label"
                    className="select-admin-basic !min-w-48"
                    onChange={handleClassChange}
                    options={simplifiedData2}
                  />
                </Form.Item>

                <label className="mr-3 ml-7 text-sm">테스트 선택</label>
                <Form.Item name="examId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="강좌 선택"
                    optionFilterProp="label"
                    className="select-admin-basic !min-w-48"
                    onChange={handleTestChange}
                    // onSearch={onSearch}
                    options={myAcademyTestList}
                  />
                </Form.Item>

                {/*
                <Form.Item name="search" className="mb-0">
                  <Input
                    placeholder="수강생 명을 입력해 주세요."
                    className="input-admin-basic w-48"
                  />
                </Form.Item>
                <Button htmlType="submit" className="btn-admin-basic">
                  검색하기
                </Button>
                */}
              </div>

              <div className="flex items-center gap-2">
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    showSearch
                    placeholder="10개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
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
                  onClick={() => handleStudentDownload()}
                >
                  + 수강생 엑셀 다운로드
                </Button>

                <Button
                  className="btn-admin-basic"
                  onClick={() => handleScoreUpload()}
                >
                  + 테스트 결과 일괄등록
                </Button>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              수강생 명
            </div>
            <div className="flex items-center justify-center w-40">채점일</div>
            <div className="flex items-center justify-center w-40">평가</div>
            <div className="flex items-center justify-center w-40">
              결과 등록/수정
            </div>
            <div className="flex items-center justify-center w-52">
              AI성적분석
            </div>
            {/* <div className="flex items-center justify-center w-56">
              AI성적분석 내역
            </div> */}
          </div>

          {testStudentList === null && (
            <div className="p-4 text-center border-b">수강생이 없습니다.</div>
          )}
          {testStudentList?.length === 0 && (
            <div className="p-4 text-center border-b">수강생이 없습니다.</div>
          )}

          {testStudentList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 pl-3 cursor-pointer">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.userPic && item.userPic !== "default_user.jpg"
                          ? `http://112.222.157.157:5233/pic/user/${item.userId}/${item.userPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>

                  {item.userName}
                </div>
              </div>
              <div className="flex items-center justify-center w-40">
                {item.examDate ? item.examDate : "-"}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.pass !== null
                  ? item.pass === 1
                    ? item.examDate === null
                      ? "미응시"
                      : "합격"
                    : item.examDate === null
                      ? "미응시"
                      : "불합격"
                  : item.score !== null
                    ? item.score + "점"
                    : "미응시"}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.examDate === null ? (
                  //점수타입
                  <button
                    className="small_line_button"
                    onClick={() =>
                      handleRecordAdd(item.joinClassId, item.examType)
                    }
                  >
                    등록하기
                  </button>
                ) : (
                  <button
                    className="small_line_button"
                    onClick={() =>
                      handleRecordEdit(
                        item.gradeId,
                        item.score,
                        item.pass,
                        item.examType,
                      )
                    }
                  >
                    수정하기
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center w-52">
                <button
                  className="small_line_button"
                  onClick={() => handleRecordAI(item.gradeId)}
                >
                  AI 분석하기
                </button>
              </div>

              {/* <div className="flex items-center justify-center w-56">
                <button
                  className="small_line_button"
                  onClick={() => handleHistoryAI(item.gradeId)}
                >
                  AI 분석내역
                </button>
              </div> */}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={testStudentList?.length}
            showSizeChanger={false}
          />
        </div>

        <div className="editModal">
          <CustomModal
            visible={isModalVisible}
            title={"점수 수정하기"}
            content={
              <AddRecoad>
                <h4 className="mb-3">
                  수정할 점수, 또는 합격여부를 입력해 주세요.
                </h4>
                <Form
                  form={form}
                  //initialValues={initialValues}

                  onFinish={values => onFinished(values)}
                >
                  {scoreType === 0 ? (
                    <Form.Item
                      name="record"
                      className="w-full"
                      rules={[
                        {
                          required: true,
                          message: "시험 점수를 입력해 주세요.",
                        },
                        {
                          pattern: /^\d+$/,
                          message: "숫자만 입력 가능합니다.",
                        },
                      ]}
                    >
                      <input
                        maxLength={5}
                        placeholder="시험 점수를 입력해 주세요."
                        className="w-full h-14 pl-3 border rounded-xl text-sm"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="pass">
                      <Radio.Group
                        value={1}
                        options={[
                          { value: 1, label: "합격" },
                          { value: 0, label: "불합격" },
                        ]}
                      />
                    </Form.Item>
                  )}

                  <div className="flex w-full gap-3 mt-4 justify-between">
                    <Form.Item className="mb-0">
                      <Button
                        className="w-full h-14 text-sm"
                        onClick={() => handleButton1Click()}
                      >
                        창닫기
                      </Button>
                    </Form.Item>

                    <Form.Item className="w-full mb-0">
                      <Button
                        htmlType="submit"
                        className="w-full h-14 bg-[#E8EEF3] text-sm"
                      >
                        수정하기
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </AddRecoad>
            }
            onButton1Click={handleButton1Click}
            onButton2Click={handleButton2Click}
            button1Text={"취소하기"}
            button2Text={"수정하기"}
            modalWidth={400}
          />
        </div>

        <div className="editModal">
          <CustomModal
            visible={isModalVisible6}
            title={"점수 등록하기"}
            content={
              <AddRecoad>
                <h4 className="mb-3">
                  등록할 점수, 또는 합격여부를 입력해 주세요.
                </h4>
                <Form
                  form={form2}
                  //initialValues={initialValues}

                  onFinish={values => onFinishedTh(values)}
                >
                  {scoreType === 0 ? (
                    <Form.Item
                      name="record"
                      className="w-full"
                      rules={[
                        {
                          required: true,
                          message: "시험 점수를 입력해 주세요.",
                        },
                        {
                          pattern: /^\d+$/,
                          message: "숫자만 입력 가능합니다.",
                        },
                      ]}
                    >
                      <input
                        maxLength={5}
                        placeholder="시험 점수를 입력해 주세요."
                        className="w-full h-14 pl-3 border rounded-xl text-sm"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="pass">
                      <Radio.Group
                        value={1}
                        options={[
                          { value: 1, label: "합격" },
                          { value: 0, label: "불합격" },
                        ]}
                      />
                    </Form.Item>
                  )}

                  <div className="flex w-full gap-3 mt-4 justify-between">
                    <Form.Item className="mb-0">
                      <Button
                        className="w-full h-14 text-sm"
                        onClick={() => handle6Button1Click()}
                      >
                        창닫기
                      </Button>
                    </Form.Item>

                    <Form.Item className="w-full mb-0">
                      <Button
                        htmlType="submit"
                        className="w-full h-14 bg-[#E8EEF3] text-sm"
                      >
                        등록하기
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </AddRecoad>
            }
            onButton1Click={handle6Button1Click}
            onButton2Click={handle6Button1Click}
            button1Text={"취소하기"}
            button2Text={"수정하기"}
            modalWidth={400}
          />
        </div>

        <CustomModal
          visible={isModalVisible2}
          title={"수강생 엑셀 다운로드"}
          content={"전체 수강생 목록을 다운로드 받으시겠습니까?"}
          onButton1Click={handle2Button1Click}
          onButton2Click={handle2Button2Click}
          button1Text={"취소하기"}
          button2Text={"다운로드"}
          modalWidth={400}
        />

        <div className="editModal">
          <CustomModal
            visible={isModalVisible3}
            title={"테스트 결과 일괄등록"}
            content={
              <div>
                <h4 className="mb-2">
                  수강생 엑셀파일에서 성적수정 파일을 업로드하세요.
                  <br />
                  (양식을 임의변경하실 경우 일괄수정이 불가합니다.)
                </h4>
                <Form form={form} onFinish={values => onFinishedSe(values)}>
                  <Form.Item
                    name="gradeFile"
                    rules={[
                      {
                        required: true,
                        message: "파일을 선택해 주세요.",
                      },
                    ]}
                  >
                    <Upload
                      maxCount={1}
                      onChange={handleChange}
                      fileList={fileList}
                      customRequest={({ onSuccess }) => {
                        // 자동 업로드 방지
                        setTimeout(() => {
                          onSuccess?.("ok");
                        }, 0);
                      }}
                    >
                      <Button icon={<UploadOutlined />}>
                        업로드할 파일을 선택해 주세요.
                      </Button>
                    </Upload>
                  </Form.Item>

                  <div className="flex w-full gap-3 justify-between btn-wrap">
                    <Form.Item>
                      <Button
                        className="w-full h-14 text-sm"
                        onClick={() => handle3Button1Click()}
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
                </Form>
              </div>
            }
            onButton1Click={handle3Button1Click}
            onButton2Click={handle3Button2Click}
            button1Text={"취소하기"}
            button2Text={"업로드하기"}
            modalWidth={400}
          />
        </div>

        <div className="editModal">
          {/* <CustomModal
            visible={isModalVisible7}
            title={"점수등록 완료"}
            content={
              <div>
                <p>점수등록이 완료되었습니다.</p>
                <div className="w-full mt-4 justify-between">
                  <Form.Item className="mb-0">
                    <Button
                      className="w-full h-14 bg-[#E8EEF3] text-sm"
                      onClick={() => handle7Button1Click()}
                    >
                      창닫기
                    </Button>
                  </Form.Item>
                </div>
              </div>
            }
            onButton1Click={handle7Button1Click}
            onButton2Click={handle7Button2Click}
            button1Text={"취소하기"}
            button2Text={"창닫기"}
            modalWidth={400}
          /> */}
        </div>

        <div className="editModal">
          <CustomModal
            visible={isModalVisible4}
            title={"점수수정 완료"}
            content={
              <div>
                <p>점수 수정이 완료되었습니다.</p>
                <div className="w-full mt-4 justify-between">
                  <Form.Item className="mb-0">
                    <Button
                      className="w-full h-14 bg-[#E8EEF3] text-sm"
                      onClick={() => handle4Button1Click()}
                    >
                      창닫기
                    </Button>
                  </Form.Item>
                </div>
              </div>
            }
            onButton1Click={handle4Button1Click}
            onButton2Click={handle4Button2Click}
            button1Text={"취소하기"}
            button2Text={"다운로드"}
            modalWidth={400}
          />
        </div>

        <CustomModal
          visible={isModalVisible5}
          title={"수강생 AI성적분석"}
          content={<AI gradeId={testGradeId} />}
          onButton1Click={handle5Button1Click}
          onButton2Click={handle5Button2Click}
          button1Text={"창닫기"}
          button2Text={"분석완료"}
          modalWidth={500}
        />

        <CustomModal
          visible={isModalVisible8}
          title={"AI 성적분석 내역 (최근 3회)"}
          content={
            <div className="pb-2 max-h-60 overflow-y-auto">
              {aiHistoryList.length > 0 ? (
                aiHistoryList.map((item, index) => (
                  <div
                    className={
                      index % 2 === 0 ? "p-3 pl-4 bg-gray-100" : "p-3 pl-4"
                    }
                  >
                    <h4 className="pb-2 font-semibold">
                      분석내역 {index + 1}.
                    </h4>
                    {item.feedBack}
                  </div>
                ))
              ) : (
                <div className="p-3 pl-4 bg-gray-100 text-center">
                  AI 분석내역이 없습니다.
                </div>
              )}
            </div>
          }
          onButton1Click={handle8Button1Click}
          onButton2Click={handle8Button2Click}
          button1Text={"창닫기"}
          button2Text={"확인완료"}
          modalWidth={500}
        />

        <CustomModal
          visible={isModalVisible9}
          title={"테스트 결과 일괄등록"}
          content={errorMessage}
          onButton1Click={handle9Button1Click}
          onButton2Click={handle9Button2Click}
          button1Text={"취소하기"}
          button2Text={"확인완료"}
          modalWidth={400}
        />
      </RecordList>
    </div>
  );
}

export default AcademyRecord;
