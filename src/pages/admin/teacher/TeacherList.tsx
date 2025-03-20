import { Form, message, Pagination, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomModal from "../../../components/modal/Modal";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import { Cookies } from "react-cookie";

interface teacherResultType {
  classId: number;
  className: string;
  userId: number;
  name: string;
  email: string;
  birth: string;
  phone: string;
  teacherComment: string;
  teacherAgree: number;
}

interface myAcademyListType {
  acaId: number;
  acaName: string;
}
const TeacherList = () => {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId, roleId } = useRecoilValue(userInfo);
  const [academyName, setAcademyName] = useState<string>();
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]); //학원 목록
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [classId, setClassId] = useState(0);
  const [teacherId, setTeacherId] = useState(0);
  const [agree, setAgree] = useState(0);
  const [teacherResultList, setTeacherResultList] = useState<
    teacherResultType[]
  >([]);
  const acaId = parseInt(searchParams.get("acaId") || "0", 0);

  //전체학원 목록
  const academyList = async () => {
    try {
      if (roleId === 0) {
        //전체 관리자일 때
        const res = await axios.get(`/api/menuOut/academy`);
        setMyAcademyList(res.data.resultData);
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

  //학원정보 불러오기
  const academyInfo = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/academy/academyDetail/${value ? value : acaId}`,
      );
      setAcademyName(res.data.resultData.acaName);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //강사 등록 신청목록
  const teacherRequestList = async (value: number) => {
    //alert(value);

    try {
      const res = await axios.get(
        `/api/teacher/Agree?acaId=${value ? value : acaId}`,
      );
      setTeacherResultList(res.data.resultData);
      // console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
      setTeacherResultList([]);
    }
  };

  //강사승인 팝업
  const handleAcademyDelete = (
    classId: number,
    userId: number,
    agree: number,
  ) => {
    setClassId(classId);
    setTeacherId(userId);
    setAgree(agree);
    setIsModalVisible(true);
  };

  //강사승인
  const handleButton1Click = () => {
    setAgree(0);
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    teacherAgree(classId, teacherId, agree);
    setIsModalVisible(false);
  };

  //강사 승인하기
  const teacherAgree = async (
    classId: number,
    userId: number,
    agree: number,
  ) => {
    try {
      const res = await axios.put(
        `/api/teacher/agree?classId=${classId}&userId=${userId}&teacherAgree=${agree}`,
      );
      //console.log(res.data.resultData);
      if (res.data.resultData === 1) {
        message.success("강사 승인상태 변경이 완료되었습니다.");
      } else {
        message.error("강사 승인상태 변경이 실패되었습니다.");
      }
      teacherRequestList(acaId); //목록 다시 불러오기
    } catch (error) {
      console.log(error);
    }
  };

  //학원 선택
  const handleAcademyChange = (value: number) => {
    //console.log(value);
    form.submit();
    academyInfo(value);
    teacherRequestList(value);
  };

  //학원 검색
  const onFinished = async (values: any) => {
    //console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../teacher?${queryParams}`); //쿼리스트링 url에 추가
  };

  useEffect(() => {
    academyList(); //학원 목록

    academyInfo(acaId);
    teacherRequestList(acaId);
  }, []);

  useEffect(() => {
    if (!cookies.get("accessToken") || roleId === 1) {
      navigate("-");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <div className="flex justify-between items-end">
          <h1 className="title-admin-font">
            강사 등록 신청내역
            <p>강사 등록 &gt; 강사 등록 신청내역</p>
          </h1>

          <button
            className="btn-admin-basic border text-sm pl-3 pr-3 mb-3"
            onClick={() => navigate("../teacher-add")}
          >
            + 강사 등록신청
          </button>
        </div>

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
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            <div className="flex items-center justify-center min-w-32">
              신청자
            </div>
            <div className="flex items-center justify-center min-w-52">
              신청자 이메일
            </div>
            <div className="flex items-center justify-center min-w-32">
              신청자 연락처
            </div>
            <div className="flex items-center justify-center min-w-32">
              처리상태
            </div>
            <div className="flex items-center justify-center min-w-24">
              승인
            </div>
          </div>

          {!teacherResultList && (
            <div className="p-4 text-center border-b">
              강사등록 신청 내역이 없습니다.
            </div>
          )}

          {teacherResultList.length === 0 && (
            <div className="p-4 text-center border-b">
              강사등록 신청 내역이 없습니다.
            </div>
          )}

          {teacherResultList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 border-b"
            >
              <div className="flex flex-col justify-start w-full pl-3">
                <h6 className="font-semibold">{academyName}</h6>
                <p className="text-gray-400 text-sm">
                  [강좌명 : {item?.className}]
                </p>
              </div>
              <div className="flex items-center justify-center text-center min-w-32">
                {item.name}
              </div>
              <div className="flex items-center justify-center text-center min-w-52">
                {item.email}
              </div>
              <div className="flex items-center justify-center text-center min-w-32">
                {item.phone}
              </div>
              <div className="flex items-center justify-center min-w-32">
                {item.teacherAgree === 0 ? (
                  <span className="w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center bg-[#f8a57d]">
                    승인대기
                  </span>
                ) : (
                  <span className="w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center bg-[#90b1c4]">
                    승인완료
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center min-w-24">
                {item.teacherAgree === 0 ? (
                  <button
                    className="small_line_button"
                    onClick={() =>
                      handleAcademyDelete(item.classId, item.userId, 1)
                    }
                  >
                    승인하기
                  </button>
                ) : (
                  <button
                    className="small_line_button"
                    onClick={() =>
                      handleAcademyDelete(item.classId, item.userId, 0)
                    }
                  >
                    승인취소
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={teacherResultList?.length}
            showSizeChanger={false}
          />
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"강사 승인하기"}
        content={`선택하신 강사를 승인${agree === 0 ? " 취소" : ""}하시겠습니까?`}
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text={"취소하기"}
        button2Text={`승인${agree === 0 ? " 취소" : ""}하기`}
        modalWidth={400}
      />
    </div>
  );
};

export default TeacherList;
