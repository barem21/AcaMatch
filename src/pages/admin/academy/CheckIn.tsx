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
//import jwtAxios from "../../../apis/jwt";
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

interface studentList2Type {
  birth: string;
  name: string;
  phone: string;
  userId: number;
  userPic: string;
  joinClassId: number;
  attendance: {
    attendanceId: number;
    name: string;
    status: string;
    userId: number;
  };
}

interface AttendanceType {
  attendanceId: number;
  name: string;
  status: string;
  userId: number;
}

interface myAcademyListType {
  acaId: number;
  acaName: string;
}

const CheckIn = () => {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const navigate = useNavigate();
  const { userId, roleId } = useRecoilValue(userInfo);
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]); //학원 목록
  const [classList, setClassList] = useState<classListType[]>([]); //강좌 목록
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string | null>(null);
  const [studentList, setStudentList] = useState<studentListType[]>([]);
  const [mergeData, setMergeData] = useState<studentList2Type[]>([]);
  const [searchParams] = useSearchParams();

  const acaId = parseInt(searchParams.get("acaId") || "0", 0);
  const classId = parseInt(searchParams.get("classId") || "0", 0);

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
  const academyStudentList = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/acaClass/acaClassUser?classId=${value}&page=1`,
      );
      setStudentList(res.data.resultData);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  // 현재 날짜 기준으로 해당 월의 시작일과 종료일 계산
  const getCurrentMonthRange = () => {
    //const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
    const startDate = dayjs()
      .subtract(3, "month")
      .startOf("month")
      .format("YYYY-MM-DD"); //3달전부터
    const endDate = dayjs().endOf("month").format("YYYY-MM-DD");
    return { startDate, endDate };
  };

  // 출석 데이터 조회
  const fetchAttendanceData = async (value: number) => {
    const { startDate, endDate } = getCurrentMonthRange();

    try {
      const response = await axios.get(`/api/attendance`, {
        params: {
          acaId: acaId,
          classId: value,
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

  //학원 선택
  const handleAcademyChange = (value: number) => {
    //console.log(value);
    form.setFieldsValue({
      classId: null,
    });
    form.submit();
    academyClassList(value); //강좌목록
  };

  //강좌선택
  const handleClassChange = (value: number) => {
    //console.log(value);
    form.submit();
    fetchAttendanceData(value);
  };

  // 날짜 클릭 시 호출될 함수
  const handleDateClick = async (info: any, acaId: number, classId: number) => {
    const clickedDate = info.dateStr; // 클릭한 날짜 정보 (YYYY-MM-DD 형식)
    setAttendanceDate(clickedDate); // 상태 업데이트
    academyStudentList(classId); //수강생 목록

    if (!classId) {
      alert("강좌를 선택해 주세요.");
      return;
    }

    //날짜 선택하면 기존 선택값 초기화
    form2.setFieldsValue({
      status: "출석",
      joinClassId: [],
    });

    // 오늘 날짜보다 이후 날짜가 선택된 경우
    const today = dayjs().format("YYYY-MM-DD");
    if (dayjs(clickedDate).isAfter(today, "day")) {
      notification.error({
        message: "알림 메시지 : ",
        description: "오늘 이후의 날짜는 선택할 수 없습니다.",
      });
    } else {
      //학생별 출석정보 확인하기
      const res = await axios.get(
        `/api/attendance/user?acaId=${acaId}&classId=${classId}&attendanceDate=${clickedDate}`,
      );
      //console.log(res.data.resultData);

      // 사용자 배열과 출석 배열을 userId를 기준으로 합치기
      const mergedData = studentList?.map(user => {
        // userId가 같은 출석 정보를 찾음
        const attendanceData = res.data.resultData.find(
          (att: AttendanceType) => att.userId === user.userId,
        );
        // 출석 정보가 있으면 합침
        return attendanceData
          ? { ...user, attendance: attendanceData }
          : { ...user, attendance: null };
      });
      //console.log(mergedData);
      setMergeData(mergedData);
      //console.log(mergedData);

      //기존 쿼리 스트링에 date를 추가
      const url = new URL(window.location.href);
      url.searchParams.set("date", clickedDate); // date 파라미터 추가
      window.history.pushState({}, "", url); // URL 업데이트

      // 선택한 날짜에 대해 색을 적용
      const allCells = document.querySelectorAll(".fc-day");

      allCells.forEach((cell: any) => {
        // 셀의 데이터 날짜와 선택한 날짜를 비교
        if (cell.getAttribute("data-date") === clickedDate) {
          cell.style.backgroundColor = "#ddd"; // 선택된 날짜에 파란색 배경
        } else {
          cell.style.backgroundColor = ""; // 선택되지 않은 날짜는 기본 배경
        }
      });
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
    //console.log(values);
    if (!acaId) {
      notification.error({
        message: "알림 : ",
        description: "학원이 선택되지 않았습니다.",
      });
      return;
    }
    if (!classId) {
      notification.error({
        message: "알림 : ",
        description: "강좌가 선택되지 않았습니다.",
      });
      return;
    }
    if (!attendanceDate) {
      notification.error({
        message: "알림 : ",
        description: "날짜가 선택되지 않았습니다.",
      });
      return;
    }

    if (values.joinClassId === undefined) {
      notification.error({
        message: "알림 : ",
        description: "학생이 선택되지 않았습니다.",
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
        fetchAttendanceData(classId); //출석정보 갱신
        setStudentList([]); //수강생 목록 초기화

        //날짜 선택하면 기존 선택값 초기화
        form2.setFieldsValue({
          status: "출석",
          joinClassId: [],
        });
      } catch (error) {
        console.log(error);
        message.error("출석정보가 저장이 실패되었습니다.");
      }
    }
  };

  useEffect(() => {
    academyList(); //학원 목록
    academyClassList(acaId); //강좌 목록
    if (classId) {
      fetchAttendanceData(classId); //출석부
    }
  }, []);

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      acaId: acaId ? acaId : null,
      classId: classId ? classId : null,
    });

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form2.setFieldsValue({
      status: "출석",
    });
  }, []);

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
                <label className="mr-3 text-sm">학원 선택</label>
                <Form.Item name="acaId" className="mb-0 mr-[10px]">
                  <Select
                    showSearch
                    placeholder="학원을 선택하세요"
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
                dateClick={e => handleDateClick(e, acaId, classId)} // 날짜 클릭 이벤트 핸들러
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
                      options={[
                        { value: "출석", label: "출석" },
                        { value: "결석", label: "결석" },
                        { value: "지각", label: "지각" },
                        { value: "조퇴", label: "조퇴" },
                      ]}
                    />
                  </Form.Item>
                </div>

                <div className="flex flex-col items flex-1 p-4">
                  {mergeData?.length > 0 ? (
                    <Form.Item name="joinClassId">
                      <Checkbox.Group value={[19, 20]}>
                        {mergeData?.map(item => (
                          <Checkbox
                            key={item.joinClassId}
                            value={item.joinClassId}
                            className="w-full"
                          >
                            {item.name}
                            {item.attendance?.status ? (
                              item.attendance?.status === "결석" ? (
                                <span className="ml-1.5 text-red-500 text-[13px] font-semibold">
                                  ({item.attendance?.status})
                                </span>
                              ) : (
                                <span className="ml-1.5 text-blue-500 text-[13px] font-semibold">
                                  ({item.attendance?.status})
                                </span>
                              )
                            ) : (
                              <span className="ml-1.5 text-gray-400 text-[13px] font-semibold">
                                (미처리)
                              </span>
                            )}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    </Form.Item>
                  ) : (
                    <div className="text-gray-500">
                      출석 처리할 날짜를 선택해 주세요.
                    </div>
                  )}
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
