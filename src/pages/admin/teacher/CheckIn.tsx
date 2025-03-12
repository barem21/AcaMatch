import koLocale from "@fullcalendar/core/locales/ko";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { Button, Checkbox, Form, message, notification, Select } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../../apis/jwt";
import userInfo from "../../../atoms/userInfo";

/*
interface BoardItem {
  boardId: number;
  userId: number;
  boardName: string;
  createdAt: string;
  name: string;
}
  */

interface Event {
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
}

interface classListType {
  acaId: number;
  acaPics: string;
  acaPic: string;
  acaName: string;
  classId: number;
  className: string;
  startDate: string;
  endDate: string;
  teacherId: number;
  academyId: number;
  teacherName: string;
}

interface studentListType {
  birth: string;
  name: string;
  phone: string;
  userId: number;
  userPic: string;
  joinClassId: number;
}

const CheckIn = () => {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const navigate = useNavigate();
  const { userId, roleId } = useRecoilValue(userInfo);
  const [myAcademyList, setMyAcademyList] = useState([]); //학원 목록
  const [classList, setClassList] = useState<classListType[]>([]); //강좌 목록
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string | null>(null);
  const [studentList, setStudentList] = useState<studentListType[]>([]);
  const [searchParams] = useSearchParams();

  const acaId = parseInt(searchParams.get("acaId") || "0", 0);
  const classId = parseInt(searchParams.get("classId") || "0", 0);

  //검색조건용 학원 목록
  const academyList = async () => {
    try {
      if (roleId === 0) {
        //전체 관리자일 때
        const res = await axios.get(
          `/api/academy/GetAcademyInfoByAcaNameClassNameExamNameAcaAgree`,
        );
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
  const simplifiedData = myAcademyList?.map(
    ({ acaId: value, acaName: label }) => ({
      value,
      label,
    }),
  );

  //강좌 목록
  const academyClassList = async () => {
    try {
      const res = await axios.get(
        `/api/acaClass?acaId=${acaId}&page=1&size=30`,
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

  //수강생 목록
  const academyStudentList = async () => {
    try {
      const res = await axios.get(
        `/api/acaClass/acaClassUser?classId=${classId}&page=1`,
      );
      setStudentList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  // 현재 날짜 기준으로 해당 월의 시작일과 종료일 계산
  const getCurrentMonthRange = () => {
    const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs().endOf("month").format("YYYY-MM-DD");
    return { startDate, endDate };
  };

  // 출석 데이터 조회
  const fetchAttendanceData = async () => {
    const { startDate, endDate } = getCurrentMonthRange();
    const academyId = 2;
    const classId = 2;

    try {
      const response = await jwtAxios.get(`/api/attendance`, {
        params: {
          acaId: academyId,
          classId: classId,
          startDate: startDate,
          endDate: endDate,
        },
      });

      const attendanceData = response.data.resultData;

      if (!Array.isArray(attendanceData)) {
        console.error("Invalid response format:", response.data);
        message.error("출석 데이터를 올바르게 불러올 수 없습니다.");
        return;
      }

      const attendanceEvents: Event[] = attendanceData.map((record: any) => {
        let statusText = "";
        let color = "#D3D3D3"; // 기본 회색

        if (record.absent > 0) {
          statusText = "결석";
          color = "#FF5252"; // 빨간색
        } else if (record.earlyLeave > 0) {
          statusText = "조퇴";
          color = "#2979FF"; // 파란색
        } else if (record.late > 0) {
          statusText = "지각";
          color = "#FFC107"; // 노란색
        } else if (record.present > 0) {
          statusText = "출석";
          color = "#4CAF50"; // 초록색
        }

        return {
          title: `${record.className} (${statusText})`,
          start: record.attendanceDate,
          end: record.attendanceDate,
          backgroundColor: color,
        };
      });

      setEvents(attendanceEvents);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      message.error("출석 데이터를 불러오는데 실패했습니다.");
    }
  };

  const handleAcademyChange = (value: number) => {
    console.log(value);
    form.submit();
    //setSelectedAcademy(value);
    //fetchAttendanceData();
    // fetchAttendanceData(value);
  };

  // const handleDateClick = async (info: any) => {
  //   if (!selectedAcademy) {
  //     message.warning("학원을 먼저 선택해주세요.");
  //     return;
  //   }

  //   // 출석 체크 로직 구현
  //   try {
  //     await jwtAxios.post("/api/attendance", {
  //       academyId: selectedAcademy,
  //       date: info.dateStr,
  //       userId,
  //     });

  //     fetchAttendanceData(selectedAcademy);
  //     message.success("출석이 등록되었습니다.");
  //   } catch (error) {
  //     console.error("Error marking attendance:", error);
  //     message.error("출석 등록에 실패했습니다.");
  //   }
  // };

  // 날짜 클릭 시 호출될 함수
  const handleDateClick = (info: any) => {
    const clickedDate = info.dateStr; // 클릭한 날짜 정보 (YYYY-MM-DD 형식)
    setAttendanceDate(clickedDate); // 상태 업데이트

    // 오늘 날짜보다 이후 날짜가 선택된 경우
    const today = dayjs().format("YYYY-MM-DD");
    if (dayjs(clickedDate).isAfter(today, "day")) {
      notification.error({
        message: "경고",
        description: "오늘 이후의 날짜는 선택할 수 없습니다.",
      });
    } else {
      //기존 쿼리 스트링에 date를 추가
      const url = new URL(window.location.href);
      url.searchParams.set("date", clickedDate); // date 파라미터 추가
      window.history.pushState({}, "", url); // URL 업데이트
    }
  };

  //검색
  const onFinished = async (values: any) => {
    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가
  };

  //출석상태 저장
  const onFinishedSe = async (values: any) => {
    console.log(values);

    if (!attendanceDate) {
      notification.error({
        message: "경고",
        description: "날짜가 선택되지 않았습니다.",
      });
      return;
    }

    for (let i = 0; i < values.joinClassId.length; i++) {
      const data = {
        joinClassId: values.joinClassId[i],
        attendanceDate: attendanceDate,
        status: values.status,
      };

      try {
        const res = await axios.post("/api/attendance", data);
        //console.log(res.data.resultData);
        if (res.data.resultData === 1) {
          message.success("출석정보가 저장되었습니다.");
        } else {
          message.error("출석정보가 저장이 실패되었습니다.");
        }
      } catch (error) {
        console.log(error);
        message.error("출석정보가 저장이 실패되었습니다.");
      }
    }
  };

  useEffect(() => {
    academyList(); //학원 목록
    academyClassList(); //강좌 목록
    academyStudentList(); //수강생 목록
    fetchAttendanceData();
  }, []);

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      acaId: acaId ? acaId : 0,
      classId: classId ? classId : 0,
    });
  }, []);

  // useEffect(() => {
  //   if (userId) {
  //     fetchBoardList();
  //   }
  // }, [userId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학생 출석 관리
          <p>학원 관리 &gt; 학원 강의목록 &gt; 학생 출석 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-28 text-sm">학원 선택</label>
                <Form.Item name="acaId" className="mb-0 mr-[10px]">
                  <Select
                    showSearch
                    placeholder="학원을 선택하세요"
                    optionFilterProp="label"
                    className="select-admin-basic w-[300px]"
                    onChange={handleAcademyChange}
                    options={simplifiedData}
                  />
                </Form.Item>

                <label className="w-28 text-sm">강좌 선택</label>
                <Form.Item name="classId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="강좌를 선택하세요"
                    optionFilterProp="label"
                    className="select-admin-basic w-[300px]"
                    onChange={handleAcademyChange}
                    options={simplifiedData2}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>

          <div className="p-4 pb-0 pt-0 pr-0 flex gap-4 justify-center border-b">
            <div className="justify-center w-full pt-2">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={koLocale}
                events={events}
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "today",
                }}
                height="620px"
                eventContent={eventInfo => {
                  return (
                    <div className="p-1 text-xs">{eventInfo.event.title}</div>
                  );
                }}
                dateClick={handleDateClick} // 날짜 클릭 이벤트 핸들러
              />
            </div>
            <Form form={form2} onFinish={values => onFinishedSe(values)}>
              <div className="flex flex-col w-[300px] h-[640px] border-l border-[#EEEEEE]">
                {/* 헤더 */}
                <div className="flex flex-col justify-center px-5 h-16 border-b border-[#EEEEEE]">
                  <h2 className="text-base font-medium leading-10 flex items-center tracking-wide uppercase text-[#303E67]">
                    수강생 목록 및 일괄 출석처리
                  </h2>
                </div>

                {/* 수강생 목록 */}
                <div className="flex justify-center items-center p-4 border-b">
                  <h6 className="w-1/2">출석상태 선택</h6>
                  <Form.Item name="status" className="w-full mb-0">
                    <Select
                      defaultValue={"출석"}
                      options={[
                        { value: "출석", label: "출석" },
                        { value: "결석", label: "결석" },
                        { value: "지각", label: "지각" },
                        { value: "조퇴", label: "조퇴" },
                      ]}
                    />
                  </Form.Item>
                </div>

                <div className="flex flex-col items flex-1 p-5">
                  <Form.Item name="joinClassId">
                    <Checkbox.Group>
                      {studentList?.map(item => (
                        <Checkbox
                          key={item.joinClassId}
                          value={item.joinClassId}
                          className="w-full"
                        >
                          {item.name}
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                </div>

                {/* 하단 버튼 */}
                <Button
                  htmlType="submit"
                  className="w-full flex justify-center items-center px-5 h-20 bg-[#303E67] text-white !rounded-none"
                >
                  출석정보 저장하기
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
