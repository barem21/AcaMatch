import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Select, Form, message, Checkbox } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import userInfo from "../../../atoms/userInfo";
import jwtAxios from "../../../apis/jwt";
import type { CheckboxChangeEvent } from "antd/es/checkbox";

interface BoardItem {
  boardId: number;
  userId: number;
  boardName: string;
  createdAt: string;
  name: string;
}

interface Event {
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
}

const CheckIn = () => {
  const [form] = Form.useForm();
  const { userId } = useRecoilValue(userInfo);
  const [boardList, setBoardList] = useState<BoardItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<number | null>(null);
  const [checkedList, setCheckedList] = useState<number[]>([]);

  // 학원 목록 조회
  const fetchBoardList = async () => {
    if (!userId) return;

    try {
      const response = await jwtAxios.get(`/api/board`, {
        params: { userId },
      });
      const filteredData = response.data.resultData.filter(
        (item: BoardItem | null): item is BoardItem => item !== null,
      );
      setBoardList(filteredData);
    } catch (error) {
      console.error("Error fetching board list:", error);
      message.error("학원 목록을 불러오는데 실패했습니다.");
    }
  };

  // 출석 데이터 조회
  const fetchAttendanceData = async (academyId: number) => {
    try {
      const response = await jwtAxios.get(`/api/attendance`, {
        params: {
          academyId,
          userId,
        },
      });

      // 서버에서 받은 출석 데이터를 FullCalendar 이벤트 형식으로 변환
      const attendanceEvents = response.data.map((attendance: any) => ({
        title: attendance.studentName,
        start: attendance.date,
        end: attendance.date,
        backgroundColor:
          attendance.status === "present" ? "#4CAF50" : "#FF5252",
      }));

      setEvents(attendanceEvents);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      message.error("출석 데이터를 불러오는데 실패했습니다.");
    }
  };

  const handleAcademyChange = (value: number) => {
    setSelectedAcademy(value);
    fetchAttendanceData(value);
  };

  const handleDateClick = async (info: any) => {
    if (!selectedAcademy) {
      message.warning("학원을 먼저 선택해주세요.");
      return;
    }

    // 출석 체크 로직 구현
    try {
      await jwtAxios.post("/api/attendance", {
        academyId: selectedAcademy,
        date: info.dateStr,
        userId,
      });

      fetchAttendanceData(selectedAcademy);
      message.success("출석이 등록되었습니다.");
    } catch (error) {
      console.error("Error marking attendance:", error);
      message.error("출석 등록에 실패했습니다.");
    }
  };

  const onCheckboxChange = (index: number) => (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setCheckedList([...checkedList, index]);
    } else {
      setCheckedList(checkedList.filter(item => item !== index));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBoardList();
    }
  }, [userId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학생 출석 관리
          <p>결제 및 지출 관리 {">"} 학원 및 지출 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-28 text-sm">학원 선택</label>
                <Form.Item name="academy" className="mb-0">
                  <Select
                    showSearch
                    placeholder="학원을 선택하세요"
                    optionFilterProp="label"
                    className="select-admin-basic w-[300px]"
                    onChange={handleAcademyChange}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={boardList.map(item => ({
                      value: item.boardId,
                      label: item.boardName,
                    }))}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>

          <div className="p-4 pb-0 pt-0 flex gap-4 justify-center border-b">
            <div className="justify-center w-[1200px] pt-2">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={koLocale}
                events={events}
                dateClick={handleDateClick}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth",
                }}
                height="620px"
                eventContent={eventInfo => {
                  return (
                    <div className="p-1 text-xs">{eventInfo.event.title}</div>
                  );
                }}
              />
            </div>
            <div className="flex flex-col w-[300px] h-[640px] border-l border-[#EEEEEE]">
              {/* 헤더 */}
              <div className="flex flex-col justify-center px-5 h-20 border-b border-[#EEEEEE]">
                <h2 className="text-base font-medium leading-10 flex items-center tracking-wide uppercase text-[#303E67]">
                  수강생 목록 및 일괄 출석처리
                </h2>
              </div>

              {/* 수강생 목록 */}
              <div className="flex flex-col flex-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-row items-center px-5 h-10 gap-2.5"
                  >
                    <Checkbox
                      onChange={onCheckboxChange(index)}
                      checked={checkedList.includes(index)}
                      className="flex justify-center items-center"
                    />
                    <span className="flex items-center h-10 text-sm font-medium tracking-wide uppercase text-[#666666]">
                      홍길동
                    </span>
                  </div>
                ))}
              </div>

              {/* 하단 버튼 */}
              <div className="flex justify-center items-center px-5 h-20 bg-[#303E67]">
                <button
                  className="w-full h-10 font-bold text-base leading-10 flex items-center justify-center tracking-wide uppercase text-white"
                  onClick={() => {
                    console.log("선택된 학생들:", checkedList);
                    // 여기에 출석 처리 로직 추가
                  }}
                >
                  출석정보 저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
