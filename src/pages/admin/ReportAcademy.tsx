import { useState } from "react";
import CustomModal from "../../components/modal/Modal";

function ReportAcademy() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  //const [reportId, setReportId] = useState<number>(0);
  //const [reportType, setReportType] = useState<string | null>(null);

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
    //setReportId(reportsId);
    //setReportType(value);
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
    //setReportId(0);
    //setReportType(null);
  };
  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

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

          <div className="loop-content flex justify-between align-middle p-2 pl-3 border-b">
            <div className="flex justify-start items-center w-full">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                  <img
                    src={"/aca_image_1.png"}
                    className="max-w-fit max-h-full object-cover"
                    alt=" /"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">가나다라ABCD 학원</h4>
                  <p className="text-gray-500 text-[12px]">test@test.com</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center text-center min-w-52">
              허위광고
            </div>
            <div className="flex items-center justify-center min-w-20">3회</div>
            <div className="flex items-center justify-center min-w-56">
              2025-03-01 ~ 2025-03-31
            </div>
            <div className="flex items-center justify-center min-w-20">
              처리완료
            </div>
            <div className="flex items-center justify-center min-w-28">
              <select
                name="actionType"
                value={"one_month_ban"}
                className="p-1 border rounded-lg"
                onChange={e => reportProcess(1, e.target.value)}
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
