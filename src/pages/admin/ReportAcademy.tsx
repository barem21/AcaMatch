import { useEffect, useState } from "react";
import CustomModal from "../../components/modal/Modal";
import { Cookies } from "react-cookie";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface reportAcademyListType {
  actionType: string;
  acaId: number;
  acaName: string;
  acaPic: string;
  email: string;
  exposureEndDate: string;
  processingStatus: number;
  reportsCount: number;
  reportsType: string;
  totalCount: number;
  updatedAt: string;
  reportId: number;
}

function ReportAcademy() {
  const cookies = new Cookies();
  const { roleId } = useRecoilValue(userInfo);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [reportAcademyList, setReportAcademyList] = useState<
    reportAcademyListType[]
  >([]);
  const [reportId, setReportId] = useState<number>(0);
  const [reportType, setReportType] = useState<string | null>(null);

  //신고당한 학원 목록
  const ReportAcademyResult = async () => {
    try {
      const res = await axios.get(`/api/reports/getAcademyList`);
      setReportAcademyList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  const reportProcess = (reportsId: number, value: string) => {
    console.log(reportsId, value);

    switch (value) {
      case "two_week_ban":
        setReportMessage("2주일 정지");
        break;
      case "one_month_ban":
        setReportMessage("1개월 정지");
        break;
      case "one_year_ban":
        setReportMessage("1년 정지");
        break;
      case "forever_ban":
        setReportMessage("영구 정지");
        break;
      default:
        setReportMessage("1주일 정지");
        break;
    }
    setIsModalVisible(true);
    setReportId(reportsId);
    setReportType(value);
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
    setReportId(0);
    setReportType(null);
  };
  const handleButton2Click = async () => {
    try {
      const res = await axios.put(
        `/api/reports/updateReports?reportsId=${reportId}&actionType=${reportType}`,
      );
      if (res.data.resultData === 1) {
        message.success("신고 조치 처리완료되었습니다.");
      }
      ReportAcademyResult(); //리스트 다시 호출
    } catch (error) {
      console.log(error);
    }
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (!cookies.get("accessToken") || roleId === 1) {
      navigate("-");
      message.error("로그인이 필요한 서비스입니다.");
    }

    ReportAcademyResult(); //신고당한 학원 목록
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학원 신고
          <p>신고 관리 &gt; 학원 신고</p>
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              회원명/아이디
            </div>
            <div className="flex items-center justify-center min-w-52">
              신고사유
            </div>
            <div className="flex items-center justify-center min-w-20">
              신고횟수
            </div>
            <div className="flex items-center justify-center min-w-56">
              제한일자
            </div>
            <div className="flex items-center justify-center min-w-20">
              처리상태
            </div>
            <div className="flex items-center justify-center min-w-28">
              신고 조치
            </div>
          </div>

          {reportAcademyList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="flex justify-center items-center w-14 min-w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.acaPic && item.acaPic !== "default_user.jpg"
                          ? `http://112.222.157.157:5233/pic/academy/${item.acaId}/${item.acaPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.acaName}</h4>
                    <p className="text-gray-500 text-[12px]">{item.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center text-center min-w-52">
                {item.reportsType}
              </div>
              <div className="flex items-center justify-center min-w-20">
                {item.reportsCount}회
              </div>
              <div className="flex items-center justify-center min-w-56">
                {item.exposureEndDate
                  ? item.exposureEndDate?.substr(0, 10)
                  : "-"}
              </div>
              <div className="flex items-center justify-center min-w-20">
                {item.processingStatus === 1 ? "처리완료" : "처리대기"}
              </div>
              <div className="flex items-center justify-center min-w-28">
                <select
                  name="actionType"
                  value={item.actionType}
                  className="p-1 border rounded-lg"
                  onChange={e =>
                    reportProcess(
                      item.reportId ? item.reportId : 0,
                      e.target.value,
                    )
                  }
                >
                  <option value="no_action">문제 없음</option>
                  <option value="one_week_ban">1주일 정지</option>
                  <option value="two_week_ban">2주일 정지</option>
                  <option value="one_month_ban">1개월 정지</option>
                  <option value="one_year_ban">1년 정지</option>
                  <option value="forever_ban">영구 정지</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalVisible && (
        <CustomModal
          visible={isModalVisible}
          title={"신고 조치"}
          content={`선택하신 학원을 신고조치(${reportMessage}) 처리하시겠습니까?`}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소"}
          button2Text={"확인"}
          modalWidth={400}
          modalHeight={244}
        />
      )}
    </div>
  );
}

export default ReportAcademy;
