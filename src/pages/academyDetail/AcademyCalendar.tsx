import styled from "@emotion/styled";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { AcademyData } from "./types";
import { EventApi } from "@fullcalendar/core";

const CalendarContainer = styled.div`
  .fc .fc-toolbar-title {
    font-size: 1.5em;
    font-weight: bold;
  }

  .fc .fc-daygrid-more-link {
    font-size: 12px !important;
    color: #676d9c;
  }

  .fc .fc-today-button {
    background-color: #3b77d8 !important;
    border-color: #3b77d8 !important;
    color: white !important;

    &:hover {
      background-color: #3b77d8 !important;
      border-color: #3b77d8 !important;
    }
    &:active {
      background-color: #3b77d8 !important;
      border-color: #3b77d8 !important;
    }
    &:disabled {
      background-color: #fff !important;
      border-color: #d9d9d9 !important;
      color: #242424 !important;
      /* opacity: 0.7 !important; // 투명도 조절 가능 */
      /* cursor: not-allowed !important; */
    }
  }

  .fc .fc-button-primary {
    background-color: #ffffff;
    border-color: #e5e7eb;
    color: #242424;

    &:hover {
      background-color: #f3f4f6;
      border-color: #e5e7eb;
    }

    &:not(:disabled):active,
    &:not(:disabled).fc-button-active {
      background-color: #3b77d8;
      border-color: #3b77d8;
      color: white;
    }
  }

  // 날짜 셀의 높이 조정
  .fc .fc-daygrid-day {
    height: 120px !important; // 원하는 높이로 조정 가능
  }

  // 또는 더 구체적으로 내부 컨테이너의 높이를 조정
  .fc .fc-daygrid-day-frame {
    min-height: 120px !important;
  }

  // 날짜 그리드 전체의 높이를 조정하고 싶다면
  .fc .fc-daygrid-body {
    height: auto !important;
  }
`;

interface AcademyCalendarProps {
  academyData: AcademyData | null;
}

interface EventModalProps {
  event: EventApi;
}

const AcademyCalendar = ({ academyData }: AcademyCalendarProps) => {
  const colorPalette = [
    "#3b77d8", // 메인 컬러
    "#F8B195", // 피치
    "#F67280", // 코랄
    "#C06C84", // 모브
    "#6C5B7B", // 플럼
    "#355C7D", // 네이비
    "#99B898", // 세이지
    "#A8E6CF", // 민트
  ];

  // 캘린더 이벤트 데이터 생성
  const calendarEvents = useMemo(() => {
    if (!academyData?.classes) return [];

    const validClasses = academyData.classes.filter(
      c => c.classId !== null && c.classId !== 0,
    );

    const events = validClasses.map((classItem, index) => {
      const baseColor = colorPalette[index % colorPalette.length];
      const isToday = dayjs(classItem.classStartDate).isSame(dayjs(), "day");

      return {
        id: String(classItem.classId),
        title: classItem.className,
        start: classItem.classStartDate, // 날짜만 사용
        end: classItem.classEndDate, // 날짜만 사용
        allDay: true, // 하루 종일 이벤트로 처리
        backgroundColor: baseColor,
        borderColor: baseColor,
        classNames: isToday ? ["today-event"] : [],
        extendedProps: {
          classComment: classItem.classComment,
          classPrice: classItem.classPrice,
          classDay: classItem.classDay,
          classCategoryName: classItem.classCategoryName,
          isToday,
          startTime: classItem.classStartTime,
          endTime: classItem.classEndTime,
        },
      };
    });

    // // 3개 이상의 이벤트가 있는 날짜에 대한 처리
    // const eventsByDate = events.reduce((acc: any, event) => {
    //   const date = event.start;
    //   if (!acc[date]) acc[date] = [];
    //   acc[date].push(event);
    //   return acc;
    // }, {});

    // Object.entries(eventsByDate).forEach(
    //   ([date, dateEvents]: [string, any[]]) => {
    //     if (dateEvents.length > 2) {
    //       events.push({
    //         start: date,
    //         end: date,
    //         title: `외 ${dateEvents.length - 2}개의 강좌`,
    //         display: "background",
    //         backgroundColor: "transparent",
    //         textColor: "#676d9c",
    //         classNames: ["more-events"],
    //       });
    //     }
    //   },
    // );

    return events;
  }, [academyData]);

  return (
    <CalendarContainer className="p-4">
      <style>
        {`
          .today-event {
            animation: todayPulse 2s infinite;
            position: relative;
          }
          
          @keyframes todayPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 119, 216, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(59, 119, 216, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 119, 216, 0);
            }
          }
        `}
      </style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        buttonText={{
          today: "오늘",
          month: "월",
          week: "주",
          day: "일",
        }}
        locale="ko"
        events={calendarEvents}
        eventContent={eventInfo => <EventContent eventInfo={eventInfo} />}
        dayMaxEvents={2}
        height="auto"
        slotEventOverlap={false}
        displayEventTime={false}
      />
    </CalendarContainer>
  );
};

export const EventContent = ({ eventInfo }: { eventInfo: any }) => {
  const isMoreEvents = eventInfo.event.classNames?.includes("more-events");

  if (isMoreEvents) {
    return (
      <div className="text-[10px] text-[#676d9c] text-right pr-1 mt-[-2px]">
        {eventInfo.event.title}
      </div>
    );
  }

  return (
    <div className="flex p-1">
      <div
        className="text-[12px] leading-none truncate w-full"
        style={{
          color: "white",
          padding: "2px 4px",
          borderRadius: "2px",
        }}
      >
        {eventInfo.event.title}
      </div>
    </div>
  );
};

export const EventModal = ({ event }: EventModalProps) => {
  return (
    <div className="space-y-2">
      <p>
        <strong>수업 설명:</strong> {event.extendedProps.classComment}
      </p>
      <p>
        <strong>수업 시간:</strong> {event.extendedProps.classDay || "미정"}
      </p>
      <p>
        <strong>수업료:</strong>{" "}
        {event.extendedProps.classPrice.toLocaleString()}원
      </p>
      {event.extendedProps.classCategoryName && (
        <p>
          <strong>수강 대상:</strong> {event.extendedProps.classCategoryName}
        </p>
      )}
      <p>
        <strong>기간:</strong> {new Date(event.start!).toLocaleDateString()} -{" "}
        {new Date(event.end!).toLocaleDateString()}
      </p>
    </div>
  );
};

export default AcademyCalendar;
