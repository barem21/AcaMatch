import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useMemo } from "react";
import { AcademyData } from "./types";
import styled from "@emotion/styled";

const CalendarContainer = styled.div`
  .fc .fc-toolbar-title {
    font-size: 1.5em;
    font-weight: bold;
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
`;

interface AcademyCalendarProps {
  academyData: AcademyData | null;
}

const AcademyCalendar = ({ academyData }: AcademyCalendarProps) => {
  // 색상 팔레트 정의
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

  // 클래스별 색상 매핑 생성 (classId 기준)
  const classColors = useMemo(() => {
    if (!academyData?.classes) return {};

    const uniqueClassIds = [
      ...new Set(academyData.classes.map(c => c.classId)),
    ];
    return Object.fromEntries(
      uniqueClassIds.map((id, index) => [
        id,
        colorPalette[index % colorPalette.length],
      ]),
    );
  }, [academyData]);

  // 캘린더 이벤트 데이터 생성
  const calendarEvents = useMemo(() => {
    return (
      academyData?.classes?.map(classItem => ({
        id: String(classItem.classId),
        title: classItem.className,
        start: `${classItem.classStartDate}T${classItem.classStartTime}`,
        end: `${classItem.classEndDate}T${classItem.classEndTime}`,
        backgroundColor: classColors[classItem.classId], // classId로 색상 매핑
        borderColor: classColors[classItem.classId], // classId로 색상 매핑
        extendedProps: {
          classComment: classItem.classComment,
          classPrice: classItem.classPrice,
          classDay: classItem.classDay,
          classCategoryName: classItem.classCategoryName,
        },
      })) || []
    );
  }, [academyData, classColors]);

  return (
    <CalendarContainer className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
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
        events={calendarEvents}
        eventContent={eventInfo => <EventContent eventInfo={eventInfo} />}
        // eventClick={info => {
        //   const event = info.event;
        //   Modal.info({
        //     title: event.title,
        //     content: <EventModal event={event} />,
        //     width: 500,
        //   });
        // }}
        height="auto"
        dayMaxEvents={true}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
    </CalendarContainer>
  );
};

export default AcademyCalendar;

// interface EventContentProps {
//   eventInfo: {
//     event: any; // FullCalendar 이벤트 타입
//   };
// }

interface EventModalProps {
  event: any; // FullCalendar 이벤트 타입
}

export const EventContent = ({ eventInfo }: { eventInfo: any }) => {
  const view = eventInfo.view.type;

  // 시작 시간과 종료 시간 포맷팅
  const startTime = eventInfo.event.start?.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const endTime = eventInfo.event.end?.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // 날짜 포맷팅
  // const date = eventInfo.event.start?.toLocaleDateString("ko-KR", {
  //   month: "short",
  //   day: "numeric",
  // });

  if (view === "dayGridMonth") {
    // 월간 뷰
    return (
      <div className="flex p-1">
        <div className="text-[12px] leading-none  truncate">
          {eventInfo.event.title}
        </div>
      </div>
    );
  } else {
    // 주간/일간 뷰
    return (
      <div className="flex flex-col p-1 ">
        <div className="font-bold truncate">{eventInfo.event.title}</div>
        <div className="text-sm">
          {startTime} - {endTime}
        </div>
        <div className="text-sm">
          {eventInfo.event.extendedProps.classComment}
        </div>
      </div>
    );
  }
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
