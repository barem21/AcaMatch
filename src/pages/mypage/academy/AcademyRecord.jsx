import { UploadOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Form, message, Pagination, Upload } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../../apis/jwt";
import userInfo from "../../../atoms/userInfo";
import CustomModal from "../../../components/modal/Modal";
import SideBar from "../../../components/SideBar";
import AI from "../../../components/AI";
import { Cookies } from "react-cookie";

function AcademyRecord() {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const currentUserInfo = useRecoilValue(userInfo);
  const [testStudentList, setTestStudentList] = useState([]);
  const [testGradeId, setTestGradeId] = useState();
  const [testRecord, setTestRecord] = useState();
  const [testPass, setTestPass] = useState();
  const [joinClassId, setJoinClassId] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isModalVisible3, setIsModalVisible3] = useState(false);
  const [isModalVisible4, setIsModalVisible4] = useState(false);
  const [isModalVisible5, setIsModalVisible5] = useState(false); //ai 성적분석 팝업창
  const [isModalVisible6, setIsModalVisible6] = useState(false);
  const [isModalVisible7, setIsModalVisible7] = useState(false);
  const [isModalVisible8, setIsModalVisible8] = useState(false);
  const [academyInfo, setAcademyInfo] = useState();
  const [aiHistoryList, setaiHistoryList] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [fileList, setFileList] = useState([]);

  const navigate = useNavigate();
  const acaId = searchParams.get("acaId");
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");

  const titleName = "마이페이지";
  const menuItems = [
    { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
    { label: "학원정보 관리", isActive: true, link: "/mypage/academy" },
    /*
    {
      label: "학원학생 관리",
      isActive: false,
      link: "/mypage/academy/student",
    },
    */
    {
      label: "학원리뷰 목록",
      isActive: false,
      link: "/mypage/academy/review",
    },
    { label: "좋아요 목록", isActive: false, link: "/mypage/academy/like" },
  ];

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
    const res = await axios.get(`/api/grade/export?subjectId=${subjectId}`);
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
  const handle6Button2Click = () => {
    setIsModalVisible6(false);
  };

  //점수 등록결과 관련
  const handle7Button1Click = () => {
    setIsModalVisible7(false);
  };
  const handle7Button2Click = () => {
    setIsModalVisible7(false);
  };

  //AI 성적분석 내역 관련
  const handle8Button1Click = () => {
    setIsModalVisible8(false);
  };
  const handle8Button2Click = () => {
    setIsModalVisible8(false);
  };

  //점수 수정하기 모달창 오픈
  const handleRecordEdit = (gradeId, score, pass) => {
    setTestGradeId(gradeId);
    setTestRecord(score);
    setTestPass(pass);

    form.setFieldsValue({
      record: score,
      pass: pass,
    });
    setIsModalVisible(true);
  };

  //점수 등록하기 모달창 오픈
  const handleRecordAdd = joinId => {
    setJoinClassId(joinId);
    setIsModalVisible6(true);
  };

  //AI 성적분석 모달창 오픈
  const handleRecordAI = gradeId => {
    setTestGradeId(gradeId);

    setIsModalVisible5(true);
  };

  //AI 분석내역 모달창 오픈
  const handleHistoryAI = async gradeId => {
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

  //수강생 다운로드 모달창 오픈
  const handleStudentDownload = () => {
    setIsModalVisible2(true);
  };

  //점수 일괄 업로드 모달창 오픈
  const handleScoreUpload = () => {
    setIsModalVisible3(true);
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

  //학생목록 가져오기
  const academyStudentList = async () => {
    try {
      const res = await axios.get(
        `/api/grade/gradeUser?acaId=${acaId}&joinClassId=${classId}&subjectId=${subjectId}`,
      );
      setTestStudentList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  /*
  const initialValues = {
    gradeId: testGradeId,
    record: testRecord ? testRecord : 0,
  };
  */

  //첨부파일 처리
  const handleChange = info => {
    let newFileList = [...info.fileList];

    // maxCount로 인해 하나의 파일만 유지
    newFileList = newFileList.slice(-1);

    // 파일 상태 업데이트
    setFileList(newFileList);

    form.setFieldValue("gradeFile", info.file.originFileObj);

    // 선택된 파일이 있으면 콘솔에 출력
    if (info.file.status === "done" && info.file.originFileObj) {
      //console.log("파일 선택됨:", info.file.originFileObj);
      //form.setFieldValue("gradeFile", info.file.originFileObj);
    }
  };

  //점수 직접 등록하기
  const onFinishedTh = async values => {
    //오늘 날짜 확인
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);
    const dateString = year + "-" + month + "-" + day;

    const datas = {
      joinClassId: joinClassId,
      subjectId: subjectId,
      score: parseInt(values.record),
      pass: values.pass,
      examDate: dateString,
      processingStatus: 1,
    };
    const res = await jwtAxios.post("/api/grade", datas);
    if (res.data.resultData === 1) {
      form2.resetFields(); //초기화
      setIsModalVisible6(false);
      setIsModalVisible7(true);
      academyStudentList();
    }
  };

  //점수 직접 수정하기
  const onFinished = async values => {
    const datas = {
      gradeId: testGradeId,
      score: values.record ? parseInt(values.record) : null,
      pass: values.pass ? parseInt(values.pass) : null,
      processingStatus: 1,
    };

    const res = await jwtAxios.put("/api/grade", datas);
    if (res.data.resultData === 1) {
      form.resetFields(); //초기화
      setIsModalVisible(false);
      setIsModalVisible4(true);
      academyStudentList();
    }
  };

  //엑셀 일괄 수정하기
  const onFinishedSe = async values => {
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
        academyStudentList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    academyGetInfo();
  }, []);

  useEffect(() => {
    academyStudentList();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <RecordList className="w-full">
        <h1 className="title-font flex justify-between align-middle">
          {academyInfo}의 수강생 목록
          {/*"강좌명 &gt; 테스트 명"의 수강생 목록*/}
          <div className="flex items-center gap-1">
            <button
              className="flex items-center gap-1 mr-5 text-sm font-normal"
              onClick={() => handleStudentDownload()}
            >
              수강생 엑셀 다운로드
              <FaPlusCircle />
            </button>
            <button
              className="flex items-center gap-1 mr-5 text-sm font-normal"
              onClick={e => handleScoreUpload()}
            >
              테스트 결과 일괄등록
              <FaPlusCircle />
            </button>
          </div>
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle pt-4 pb-4 border-b">
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
              className="loop-content flex justify-between align-middle pt-4 pb-4 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 pl-4 cursor-pointer">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.userPic && item.userPic !== "default_user.jpg"
                          ? `http://112.222.157.156:5223/pic/user/${item.userId}/${item.userPic}`
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
                {item.examDate}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.pass !== null
                  ? item.pass === 1
                    ? "합격"
                    : "불합격"
                  : item.score !== null
                    ? item.score + "점"
                    : "미응시"}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.score === null ? (
                  <button
                    className="small_line_button"
                    onClick={() => handleRecordAdd(item.joinClassId)}
                  >
                    등록하기
                  </button>
                ) : (
                  <button
                    className="small_line_button"
                    onClick={() =>
                      handleRecordEdit(item.gradeId, item.score, item.pass)
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
                  {testRecord !== null ? (
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
                    <Form.Item name="pass"></Form.Item>
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
                  <Form.Item
                    name="record"
                    className="w-full"
                    rules={[
                      { required: true, message: "시험 점수를 입력해 주세요." },
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
      </RecordList>
    </div>
  );
}

export default AcademyRecord;
