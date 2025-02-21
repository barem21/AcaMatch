import { Button, DatePicker, Form, Pagination, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";

interface AcademyList {
  acaName: string;
  className: string;
  paymentDate: string;
  paymentAmount: string;
  orderer: string;
  processingStatus: string;
}

function PaymentManager() {
  const [form] = Form.useForm();
  // const navigate = useNavigate();
  const [academyList, setAcademyList] = useState<AcademyList[] | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const generateAcademyList = () => {
    const newList: AcademyList[] = [
      {
        acaName: "서울 학원",
        className: "수학 정규반",
        paymentDate: "2025-01-01",
        paymentAmount: "12000",
        orderer: "김철수",
        processingStatus: Math.random() > 0.5 ? "결제완료" : "결제대기",
      },
      {
        acaName: "부산 학원",
        className: "영어 특강",
        paymentDate: "2025-02-15",
        paymentAmount: "12000",
        orderer: "이영희",
        processingStatus: Math.random() > 0.5 ? "결제완료" : "결제대기",
      },
      {
        acaName: "대구 학원",
        className: "과학 캠프",
        paymentDate: "2025-03-10",
        paymentAmount: "12000",
        orderer: "박민수",
        processingStatus: Math.random() > 0.5 ? "결제완료" : "결제대기",
      },
    ];
    setAcademyList(newList);
  };

  useEffect(() => {
    generateAcademyList();
  }, []);

  //학원 검색
  // const onFinished = async values => {
  //   console.log("검색");
  // };

  //학원삭제 팝업
  // const handleAcademyDelete = acaId => {
  //   // setAcademyId(acaId);
  //   // setIsModalVisible(true);
  // };

  const handleStartChange = (date: Dayjs | null) => {
    setStartDate(date);
    if (endDate && date && date.isAfter(endDate)) {
      setEndDate(null); // 시작 날짜가 변경되면 종료 날짜 초기화
    }
  };
  const handleEndChange = (date: Dayjs | null) => {
    setEndDate(date);
  };
  // 종료 날짜 선택 제한 (시작 날짜 이후만 선택 가능)
  const disabledEndDate = (current: Dayjs) => {
    return startDate ? current.isBefore(startDate, "day") : false;
  };

  const handleButtonClick = (days: number) => {
    let newStartDate: Dayjs;
    let newEndDate: Dayjs;

    if (days === -1) {
      newStartDate = dayjs().subtract(1, "day"); // 어제로 설정
      newEndDate = dayjs(); // 종료 날짜를 오늘로 설정
    } else {
      newStartDate = dayjs(); // 오늘 기준
      newEndDate = newStartDate.add(days, "day"); // n일 후 종료 날짜 설정
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <>
      <div className="flex m-[10px] gap-5 w-full justify-center align-top">
        <div className="w-full">
          <h1 className="title-admin-font">
            학원별 결제 내역 (학원비/교제구매)
            <p>결제 및 지출 관리 {">"} 학원별 결제 내역</p>
          </h1>

          <div className="board-wrap">
            {/* <Form form={form} onFinish={values => onFinished(values)}> */}
            <Form form={form}>
              <div className="flex justify-between w-full p-3 border-b">
                <div className="flex items-center gap-1">
                  <label className="w-24 text-sm">주문 통합검색</label>
                  <Select
                    showSearch
                    placeholder="전체학원"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "0",
                        label: "학원명1",
                      },
                      {
                        value: "1",
                        label: "학원명2",
                      },
                    ]}
                  />
                  <Select
                    showSearch
                    placeholder="학원비"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "0",
                        label: "학원비",
                      },
                      {
                        value: "1",
                        label: "교재",
                      },
                    ]}
                  />
                  <input
                    type="text"
                    placeholder="주문자명을 입력해 주세요."
                    className="input-admin-basic"
                  />
                  <DatePicker
                    className="w-[130px]"
                    onChange={handleStartChange}
                    value={startDate}
                    placeholder="시작 날짜 선택"
                  />
                  {"~"}
                  <DatePicker
                    className="w-[130px]"
                    onChange={handleEndChange}
                    value={endDate}
                    disabledDate={disabledEndDate}
                    placeholder="종료 날짜 선택"
                  />
                  <Button
                    className="btn-admin-basic"
                    onClick={() => handleButtonClick(0)}
                  >
                    오늘
                  </Button>
                  <Button
                    className="btn-admin-basic"
                    onClick={() => handleButtonClick(-1)}
                  >
                    어제
                  </Button>
                  <Button
                    className="btn-admin-basic"
                    onClick={() => handleButtonClick(7)}
                  >
                    7일
                  </Button>
                  <Button
                    className="btn-admin-basic"
                    onClick={() => handleButtonClick(30)}
                  >
                    한달
                  </Button>
                  <Button className="btn-admin-basic">검색하기</Button>
                </div>
                <div className="flex gap-2">
                  <Select
                    showSearch
                    placeholder="40개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "40",
                        label: "40개씩 보기",
                      },
                      {
                        value: "50",
                        label: "50개씩 보기",
                      },
                      {
                        value: "60",
                        label: "60개씩 보기",
                      },
                    ]}
                  />

                  {/* <Button
                    className="btn-admin-basic"
                    onClick={() => navigate("/admin/academy/add")}
                  >
                    학원 신규등록
                  </Button> */}
                </div>
              </div>
            </Form>

            <div className="flex justify-between align-middle p-2 border-b">
              <div className="flex items-center justify-center w-3/4">
                학원명/수업명
              </div>
              <div className="flex items-center justify-center w-40">
                결제일자
              </div>
              <div className="flex items-csenter justify-center w-40">
                결제금액
              </div>
              <div className="flex items-csenter justify-center w-40">
                주문자
              </div>
              <div className="flex items-center justify-center w-40">
                처리상태
              </div>
              <div className="flex items-center justify-center w-28">삭제</div>
            </div>

            {academyList?.length === 0 && (
              <div className="p-4 text-center border-b">
                결제된 학원이 없습니다.
              </div>
            )}
            {academyList === null && (
              <div className="p-4 text-center border-b">
                결제된 학원이 없습니다.
              </div>
            )}

            {academyList?.map((item, index) => (
              <div
                key={index}
                className="loop-content flex justify-between align-middle p-2 border-b"
              >
                {/* 학원명 + 수업명 */}
                <div className="flex justify-start items-center w-3/4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    // onClick={() => navigate(`/academ/y/detail?id=${item.acaId}`)}
                  >
                    <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                      {/* <img
                        src={
                          item.acaPic && item.acaPic !== "default_user.jpg"
                            ? `http://112.222.157.157:5223/pic/academy/${item.acaId}/${item.acaPic}`
                            : "/aca_image_1.png"
                        }
                        className="max-w-fit max-h-full object-cover"
                        alt="academy"
                      /> */}
                    </div>
                    <div>
                      <p className="font-bold text-[13px]">{item.acaName}</p>
                      <p className="text-[#1761FD] text-[12px]">
                        강좌명 [{item.className}]
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center text-center w-40">
                  {item.paymentDate}
                </div>
                {/* 결제 금액 */}
                <div className="flex items-center justify-center text-center w-40">
                  {item.paymentAmount}
                </div>

                {/* 주문자 */}
                <div className="flex items-center justify-center text-center w-40">
                  {item.orderer}
                </div>

                {/* 처리 상태 (결제완료 or 결제대기) */}
                <div className="flex items-center justify-center w-40">
                  <p
                    className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center ${
                      item.processingStatus === "결제완료"
                        ? "bg-[#90b1c4]"
                        : "bg-[#f8a57d]"
                    }`}
                  >
                    {item.processingStatus}
                  </p>
                </div>

                {/* 삭제 버튼 */}
                <div className="flex gap-4 items-center justify-center w-28">
                  <button
                    onClick={() =>
                      // navigate(`/mypage/academy/edit?acaId=${item.acaId}`)
                      console.log("클릭")
                    }
                  >
                    <FaPen className="w-3 text-gray-400" />
                  </button>
                  <button
                    onClick={() =>
                      // handleAcademyDelete(item.acaId)
                      console.log("클릭2")
                    }
                  >
                    <FaRegTrashAlt className="w-3 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center m-6 mb-10">
            <Pagination
              defaultCurrent={1}
              total={academyList?.length}
              showSizeChanger={false}
            />
          </div>
        </div>

        {/* <CustomModal
          // visible={isModalVisible}
          title={"학원 삭제하기"}
          content={"선택하신 학원을 삭제하시겠습니까?"}
          // onButton1Click={handleButton1Click}
          // onButton2Click={handleButton2Click}
          button1Text={"취소하기"}
          button2Text={"삭제하기"}
          modalWidth={400}
        /> */}
      </div>
    </>
  );
}

export default PaymentManager;
