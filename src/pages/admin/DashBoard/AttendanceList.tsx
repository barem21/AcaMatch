import { Select, Spin } from "antd";
import { useEffect, useState } from "react";
import jwtAxios from "../../../apis/jwt";

interface Academy {
  acaId: number;
  acaName: string;
  // 기타 필요한 학원 정보
}

interface Class {
  classId: number;
  className: string;
  // 기타 필요한 클래스 정보
}

interface AttendanceRecord {
  acaId: number;
  classId: number;
  acaName: string;
  className: string;
  present: number;
  late: number;
  absent: number;
  earlyLeave: number;
  attendanceDate: string;
  sumCount: number;
}

interface AttendanceListProps {
  userId: number;
}

const AttendanceList = ({ userId }: AttendanceListProps) => {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 현재 날짜 기준으로 해당 월의 시작일과 종료일 계산
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 월의 첫날
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;

    // 월의 마지막 날
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, "0")}-${lastDay}`;

    return { startDate, endDate };
  };

  // 학원 목록 가져오기
  const fetchAcademies = async () => {
    try {
      const response = await jwtAxios.get(
        `/api/academy/getAcademyListByUserId`,
        {
          params: {
            signedUserId: userId,
            acaAgree: 1,
          },
        },
      );

      if (response.data && response.data.resultData) {
        setAcademies(response.data.resultData);

        // 첫 번째 학원 자동 선택
        if (response.data.resultData.length > 0) {
          setSelectedAcademy(response.data.resultData[0].acaId);
        }
      }
    } catch (error) {
      console.error("Error fetching academies:", error);
    }
  };

  // 선택된 학원의 클래스 목록 가져오기
  const fetchClasses = async (acaId: number) => {
    try {
      const response = await jwtAxios.get(`/api/menuOut/class`, {
        params: { acaId },
      });

      if (response.data && response.data.resultData) {
        setClasses(response.data.resultData);

        // 첫 번째 클래스 자동 선택
        if (response.data.resultData.length > 0) {
          setSelectedClass(response.data.resultData[0].classId);
        } else {
          setSelectedClass(null);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      // 에러 발생 시 빈 배열로 설정
      setClasses([]);
      setSelectedClass(null);
    }
  };

  // 출석부 데이터 가져오기
  const fetchAttendanceData = async () => {
    if (!selectedAcademy || !selectedClass) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getCurrentMonthRange();

      const response = await jwtAxios.get(`/api/attendance`, {
        params: {
          acaId: selectedAcademy,
          classId: selectedClass,
          startDate,
          endDate,
        },
      });

      if (response.data && response.data.resultData) {
        // 날짜 기준으로 정렬
        const sortedData = [...response.data.resultData].sort(
          (a, b) =>
            new Date(a.attendanceDate).getTime() -
            new Date(b.attendanceDate).getTime(),
        );
        setAttendanceData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 학원 목록 가져오기
  useEffect(() => {
    fetchAcademies();
  }, [userId]);

  // 선택된 학원이 변경되면 클래스 목록 가져오기
  useEffect(() => {
    if (selectedAcademy) {
      fetchClasses(selectedAcademy);
      setSelectedClass(null); // 학원이 변경되면 선택된 클래스 초기화
    }
  }, [selectedAcademy]);

  // 선택된 학원과 클래스가 모두 있으면 출석부 데이터 가져오기
  useEffect(() => {
    if (selectedAcademy && selectedClass) {
      fetchAttendanceData();
    }
  }, [selectedAcademy, selectedClass]);

  // 출석 상태에 따른 배경색 반환
  const getStatusColor = (status: string, count: number) => {
    // if (count === 0) return "bg-gray-100 text-gray-400";

    switch (status) {
      case "present":
        return " text-green-600";
      case "late":
        return " text-yellow-600";
      case "absent":
        return "text-red-600";
      case "earlyLeave":
        return "";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="w-full border rounded-[4px] ">
      <div className="flex justify-between items-center h-[47px] pl-4 p-1 border-b">
        <span className="text-[#303E67]">출석부 현황</span>
        <div className="flex gap-2">
          <Select
            showSearch
            placeholder="학원 선택"
            optionFilterProp="children"
            className="select-admin-basic"
            style={{ width: 180 }}
            value={selectedAcademy}
            onChange={value => setSelectedAcademy(value)}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {academies.map(academy => (
              <Select.Option key={academy.acaId} value={academy.acaId}>
                {academy.acaName}
              </Select.Option>
            ))}
          </Select>

          <Select
            showSearch
            placeholder="클래스 선택"
            optionFilterProp="children"
            className="select-admin-basic"
            style={{ width: 180 }}
            value={selectedClass}
            disabled={!selectedAcademy}
            onChange={value => setSelectedClass(value)}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {classes.map(cls => (
              <Select.Option key={cls.classId} value={cls.classId}>
                {cls.className}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <ul className="flex mx-auto w-full h-[30px] bg-[#F1F5FA] border-b">
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          날짜
        </li>
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          출석
        </li>
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          지각
        </li>
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          결석
        </li>
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          조퇴
        </li>
      </ul>

      <div className="overflow-hidden h-[150px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin />
          </div>
        ) : attendanceData.length > 0 ? (
          attendanceData.slice(0, 5).map((record, index) => (
            <ul
              key={index}
              className={`flex mx-auto w-full h-[30px] ${
                index < 4 ? "border-b" : ""
              }`}
            >
              <li className="flex justify-center items-center w-[20%] text-[#242424] text-[14px]">
                {record.attendanceDate}
              </li>
              <li className="flex justify-center items-center w-[20%]">
                <span
                  className={`w-[60px] text-center rounded-md py-1 ${getStatusColor("present", record.present)}`}
                >
                  {record.present}
                </span>
              </li>
              <li className="flex justify-center items-center w-[20%]">
                <span
                  className={`w-[60px] text-center rounded-md py-1 ${getStatusColor("late", record.late)}`}
                >
                  {record.late}
                </span>
              </li>
              <li className="flex justify-center items-center w-[20%]">
                <span
                  className={`w-[60px] text-center rounded-md py-1 ${getStatusColor("absent", record.absent)}`}
                >
                  {record.absent}
                </span>
              </li>
              <li className="flex justify-center items-center w-[20%]">
                <span
                  className={`w-[60px] text-center rounded-md py-1 ${getStatusColor("earlyLeave", record.earlyLeave)}`}
                >
                  {record.earlyLeave}
                </span>
              </li>
            </ul>
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            {selectedAcademy && selectedClass
              ? "출석 데이터가 없습니다."
              : "학원과 클래스를 선택해주세요."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
