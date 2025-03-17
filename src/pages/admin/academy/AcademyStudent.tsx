import { Button, Form, Input, message, Pagination, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import { Cookies } from "react-cookie";

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

interface studentListType {
  userId: number;
  userPic: string;
  name: string;
  phone: string;
  birth: string;
}

function AcademyStudent() {
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const { roleId, userId } = useRecoilValue(userInfo);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]); //학원 목록
  const [classList, setClassList] = useState<classListType[]>([]); //강좌 목록
  const [studentList, setStudentList] = useState<studentListType[]>([]);
  const [academyInfo, setAcademyInfo] = useState("");

  const acaId = parseInt(searchParams.get("acaId") || "", 0);
  const classId = parseInt(searchParams.get("classId") || "", 0);
  // const showCnt = parseInt(searchParams.get("showCnt") || "10", 0);

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

  //수강생 목록
  const academyStudentList = async (values: any) => {
    try {
      const res = await axios.get(
        `/api/acaClass/acaClassUser?classId=${values.classId}&page=1`,
      );
      setStudentList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

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

  //학원 선택
  const handleAcademyChange = (value: number) => {
    //console.log(value);
    form.setFieldsValue({
      classId: null,
    });
    form.submit();
    academyClassList(value); //강좌목록
    setStudentList([]); //학원 선택하면 목록 초기화
  };

  //강좌선택
  const handleClassChange = () => {
    //console.log(value);
    form.submit();
  };

  //학원 검색
  const onFinished = async (values: any) => {
    //console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../class-student?${queryParams}`); //쿼리스트링 url에 추가

    academyStudentList(values);
  };

  const onChange = () => {
    form.submit();
  };

  useEffect(() => {
    academyGetInfo();

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      acaId: acaId ? acaId : null,
      classId: classId ? classId : null,
      search: "",
      showCnt: 10,
    });
  }, []);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }

    academyList(); //학원 목록
    academyClassList(acaId); //강좌 목록
    academyStudentList({ classId: classId }); //학생 목록
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          {academyInfo}의 수강생 목록
          <p>학원 관리 &gt; 학원 강의목록 &gt; 수강생 목록</p>
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
                    placeholder="수강생 이름을 입력해 주세요."
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
                    onChange={onChange}
                    // onSearch={onSearch}
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
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              수강생 이름
            </div>
            <div className="flex items-center justify-center w-60">연락처</div>
            <div className="flex items-center justify-center w-40">
              생년월일
            </div>
            {/*<div className="flex items-center justify-center w-40">삭제</div>*/}
          </div>

          {studentList?.length === 0 && (
            <div className="loop-content flex w-full justify-center align-middle p-4 border-b">
              등록된 수강생이 없습니다.
            </div>
          )}

          {!studentList && (
            <div className="loop-content flex w-full justify-center align-middle p-4 border-b">
              등록된 수강생이 없습니다.
            </div>
          )}

          {studentList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 pl-3 font-bold">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.userPic
                          ? item.userPic === "default_user.jpg"
                            ? "/aca_image_1.png"
                            : `http://112.222.157.157:5233/pic/user/${item.userId}/${item.userPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  {item.name}
                </div>
              </div>
              <div className="flex items-center justify-center w-60">
                {item.phone}
              </div>
              <div className="flex items-center justify-center w-40">
                {item.birth.substr(0, 10)}
              </div>
              {/*
              <div className="flex items-center justify-center w-40">
                <button
                  className="small_line_button"
                  onClick={() => navigate("/mypage/academy/testList?classId=1")}
                >
                  삭제하기
                </button>
              </div>
              */}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={studentList?.length}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

export default AcademyStudent;
