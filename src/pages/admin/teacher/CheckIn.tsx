import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Select, Form, message } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import userInfo from "../../../atoms/userInfo";
import jwtAxios from "../../../apis/jwt";

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

          <div className="p-4">
            <div className="w-[800px] mx-auto">
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
                height="auto"
                eventContent={eventInfo => {
                  return (
                    <div className="p-1 text-xs">{eventInfo.event.title}</div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
