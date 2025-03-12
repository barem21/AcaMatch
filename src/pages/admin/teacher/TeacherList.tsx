import { message, Pagination } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomModal from "../../../components/modal/Modal";

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

const TeacherList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [academyName, setAcademyName] = useState<string>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [classId, setClassId] = useState(0);
  const [userId, setUserId] = useState(0);
  const [agree, setAgree] = useState(0);
  const [teacherResultList, setTeacherResultList] = useState<
    teacherResultType[]
  >([]);
  const acaId = parseInt(searchParams.get("acaId") || "0", 0);

  //학원정보 불러오기
  const academyInfo = async () => {
    try {
      const res = await axios.get(`/api/academy/academyDetail/${acaId}`);
      setAcademyName(res.data.resultData.acaName);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //강사 등록 신청목록
  const teacherList = async () => {
    try {
      const res = await axios.get(`/api/teacher/Agree?acaId=${acaId}`);
      setTeacherResultList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //강사승인 팝업
  const handleAcademyDelete = (
    classId: number,
    userId: number,
    agree: number,
  ) => {
    setClassId(classId);
    setUserId(userId);
    setAgree(agree);
    setIsModalVisible(true);
  };

  //강사승인
  const handleButton1Click = () => {
    setAgree(0);
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    teacherAgree(classId, userId, agree);
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
      teacherList(); //목록 다시 불러오기
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    academyInfo();
    teacherList();
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
            onClick={() => navigate("../add")}
          >
            + 강사 등록신청
          </button>
        </div>

        <div className="board-wrap">
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
