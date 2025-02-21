import styled from "@emotion/styled";
import { Form, message, Pagination } from "antd";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { FaPlusCircle } from "react-icons/fa";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import { AIText } from "../../components/AI";
import SideBar from "../../components/SideBar";
import CustomModal from "../../components/modal/Modal";

function MyPageRecordDetail() {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const currentUserInfo = useRecoilValue(userInfo);
  const [testStudentList, setTestStudentList] = useState([]);
  const [testGradeId, setTestGradeId] = useState();
  const [testRecord, setTestRecord] = useState();
  const [joinClassId, setJoinClassId] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isModalVisible3, setIsModalVisible3] = useState(false);
  const [isModalVisible4, setIsModalVisible4] = useState(false);
  const [isModalVisible5, setIsModalVisible5] = useState(false); //ai 성적분석 팝업창
  const [isModalVisible6, setIsModalVisible6] = useState(false);
  const [isModalVisible7, setIsModalVisible7] = useState(false);
  const [academyInfo, setAcademyInfo] = useState();

  const [currentPage, setCurrentPage] = useState(1);

  const { search } = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [fileList, setFileList] = useState([]);

  const pageSize = 10;

  const navigate = useNavigate();
  const acaId = searchParams.get("acaId");
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");

  const titleName = "마이페이지";
  let menuItems = [];
  switch (currentUserInfo.roleId) {
    case 2: //학부모
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "자녀 관리", isActive: false, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: false, link: "/mypage" },
        { label: "자녀 성적확인", isActive: true, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: false, link: "/mypage" },
        { label: "보호자 정보", isActive: false, link: "/mypage/parent" },
        { label: "나의 성적확인", isActive: true, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
  }

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

  //AI 성적분석 모달창 오픈
  const handleRecordAI = userId => {
    if (testStudentList === null || testStudentList?.length === 0) {
      message.error("테스트 내역이 없습니다.");
      return;
    }
    setIsModalVisible5(true);
  };

  //수강생 다운로드 모달창 오픈
  const handleStudentDownload = () => {
    setIsModalVisible2(true);
  };

  //점수 일괄 업로드 모달창 오픈
  const handleScoreUpload = () => {
    setIsModalVisible3(true);
  };

  //시험정보 가져오기
  const testGetInfo = async () => {
    console.log("여기", currentUserInfo.userId);

    const params = new URLSearchParams(search);
    const acaId = params.get("acaId");

    console.log(
      `/api/grade?userId=${currentUserInfo.userId}&classId=${acaId}&page=${currentPage}&size=1000`,
    );
    try {
      const res = await jwtAxios.get(
        `/api/grade?userId=${currentUserInfo.userId}&classId=${acaId}&page=${currentPage}&size=1000`,
      );
      console.log(res);
      setTestStudentList(res.data.resultData);
      setAcademyInfo(() => params.get("acaName"));
      // console.log(res.data.resultData.acaName);
    } catch (error) {
      console.log(error);
    }
  };

  const initialValues = {
    gradeId: testGradeId,
    record: testRecord ? testRecord : 0,
  };

  useEffect(() => {
    if (currentUserInfo.userId !== "") {
      testGetInfo();
    }
  }, [currentUserInfo]);

  // useEffect(() => {
  //   academyStudentList();
  // }, [currentUserInfo]);
  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  const handlePageChange = page => {
    setCurrentPage(page);
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const paginatedData = testStudentList?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <RecordList className="w-full">
        <h1 className="title-font flex justify-between align-middle">
          {academyInfo}의 시험 결과
          <div className="flex items-center gap-1">
            <button
              className="flex items-center gap-1 mr-5 text-sm font-normal"
              onClick={() => handleRecordAI()}
            >
              AI 시험 분석
              <FaPlusCircle />
            </button>
            {/* <button
              className="flex items-center gap-1 mr-5 text-sm font-normal"
              onClick={() => handleScoreUpload()}
            >
              AI 성적 분석
              <FaPlusCircle />
            </button> */}
          </div>
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b">
            <div className="flex items-center justify-center w-full">
              테스트 명
            </div>
            <div className="flex items-center justify-center w-60">
              테스트 일
            </div>
            <div className="flex items-center justify-center w-60">평가</div>
            {/* <div className="flex items-center justify-center w-40">
              수정하기
            </div> */}
            {/* <div className="flex items-center justify-center w-60">
              AI성적분석
            </div> */}
          </div>

          {testStudentList === null && (
            <div className="p-4 text-center border-b">
              테스트 내역이 없습니다.
            </div>
          )}
          {testStudentList?.length === 0 && (
            <div className="p-4 text-center border-b">
              테스트 내역이 없습니다.
            </div>
          )}

          {testStudentList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer">
                  <img src="/aca_image_1.png" alt="" />
                  {item.subjectName}
                </div>
              </div>
              <div className="flex items-center justify-center w-60">
                {item.examDate}
              </div>
              <div className="flex items-center justify-center w-60">
                {item.pass !== null
                  ? item.pass === 1
                    ? "합격"
                    : "불합격"
                  : item.score !== null
                    ? item.score + "점"
                    : 0 + "점"}
              </div>
              {/* <div className="flex items-center justify-center w-40">
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
                      handleRecordEdit(
                        item.gradeId,
                        item.pass !== null ? item.pass : item.score,
                      )
                    }
                  >
                    수정하기
                  </button>
                )}
              </div> */}

              {/* <div className="flex items-center justify-center w-60">
                <button
                  className="small_line_button"
                  onClick={() => handleRecordAI()}
                >
                  AI 분석하기
                </button>
              </div> */}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={testStudentList?.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible5}
          title={"수강생 AI성적분석"}
          content={<AIText textInput={testStudentList} />}
          onButton1Click={handle5Button1Click}
          onButton2Click={handle5Button2Click}
          button1Text={"창닫기"}
          button2Text={"분석완료"}
          modalWidth={500}
        />
      </RecordList>
    </div>
  );
}

export default MyPageRecordDetail;
