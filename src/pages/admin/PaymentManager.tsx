import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Pagination,
  Select,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import jwtAxios from "../../apis/jwt";
import CustomModal from "../../components/modal/Modal";
import axios from "axios";

interface AcademyList {
  acaName: string;
  className?: string;
  paymentDate: string;
  paymentAmount: string;
  orderer: string;
  processingStatus: string;
  classOrBookName: string;
  tid: number;
  costId: number;
}

function PaymentManager() {
  const [form] = Form.useForm();
  const [academyList, setAcademyList] = useState<AcademyList[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toTid, setToTid] = useState(0);
  const [toCostId, setToCostId] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // const [searchAcaName, setSearchAcaName] = useState(
  //   searchParams.get("acaName") || "",
  // );
  const [inputAcaName, setInputAcaName] = useState("");

  // URL에서 모든 파라미터 가져오기
  const currentPage = Number(searchParams.get("page")) || 1;
  const [pageSize, setPageSize] = useState<number>(
    Number(searchParams.get("size")) || 30, // size 파라미터가 없을 경우 기본값 30
  );
  // const orderType = Number(searchParams.get("orderType")) || 0;
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");

  // 날짜 상태를 URL 파라미터에서 초기화
  const [startDate, setStartDate] = useState<Dayjs | null>(
    startDateStr ? dayjs(startDateStr) : null,
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    endDateStr ? dayjs(endDateStr) : null,
  );

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    setSearchParams(newSearchParams);
  };

  const handleStartChange = (date: Dayjs | null) => {
    setStartDate(date);
    updateSearchParams({
      startDate: date ? date.format("YYYY-MM-DD") : null,
    });
  };

  const handleEndChange = (date: Dayjs | null) => {
    setEndDate(date);
    updateSearchParams({
      endDate: date ? date.format("YYYY-MM-DD") : null,
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({
      page: page.toString(),
    });
    // MyPage 컴포넌트와 동일한 방식으로 스크롤 처리
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderTypeChange = (value: string) => {
    if (value === "all") {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("orderType");
      setSearchParams(newSearchParams);
    } else {
      updateSearchParams({ orderType: value });
    }
  };

  const handleButtonClick = (days: number) => {
    let newStartDate: Dayjs;
    const newEndDate: Dayjs = dayjs();

    if (days === -1) {
      newStartDate = dayjs().subtract(1, "day");
    } else if (days === 7) {
      newStartDate = dayjs().subtract(7, "day");
    } else if (days === 30) {
      newStartDate = dayjs().subtract(30, "day");
    } else {
      newStartDate = dayjs();
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    updateSearchParams({
      startDate: newStartDate.format("YYYY-MM-DD"),
      endDate: newEndDate.format("YYYY-MM-DD"),
    });
  };

  const handleAcaNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAcaName(e.target.value);
  };

  const handleSearch = () => {
    updateSearchParams({
      acaName: inputAcaName || null,
      page: "1",
    });
  };

  // API에서 학원 결제 내역을 가져오는 함수 (Axios 사용)
  const fetchAcademyList = async () => {
    const url = `/api/academy/GetAcademyListByAcaNameOrderType`;

    const params: any = {
      page: currentPage,
      size: pageSize,
      acaName: searchParams.get("acaName") || undefined,
    };

    const orderTypeParam = searchParams.get("orderType");
    if (orderTypeParam) {
      params.orderType = orderTypeParam;
    }

    if (startDate) {
      params.startDate = startDate.format("YYYY-MM-DD");
    }
    if (endDate) {
      params.endDate = endDate.format("YYYY-MM-DD");
    }

    try {
      const response = await jwtAxios.get(url, { params });
      const data = response.data;

      if (data.resultData && data.resultData.length > 0) {
        const formattedData = data.resultData.map((item: any) => ({
          acaName: item.acaName,
          classOrBookName: item.classOrBookName,
          paymentDate: item.createdAt.split(" ")[0],
          paymentAmount: item.price.toLocaleString(),
          orderer: item.name,
          tid: item.tid,
          costId: item.costId,
          processingStatus: item.costStatus === 2 ? "결제완료" : "결제대기",
        }));
        setAcademyList(formattedData);
        setTotalCount(data.resultData[0].totalCount);
      } else {
        setAcademyList([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("API 요청 실패:", error);
      setAcademyList([]);
      setTotalCount(0);
    }
  };

  //주문취소
  const orderCancel = (tid: number, costId: number) => {
    //alert("주문취소 처리하시겠습니까?");
    setToTid(tid);
    setToCostId(costId);
    setIsModalVisible(true);
    return;
  };

  //주문취소 팝업
  const handleButton1Click = () => {
    setToTid(0);
    setToCostId(0);
    setIsModalVisible(false);
  };
  const handleButton2Click = async () => {
    try {
      //취소요청되야만 취소가능해서 취소요청부터 실행
      const res = await axios.post(`/api/refund/postRefund?costId=${toCostId}`);
      if (res.data.resultData === 1) {
        const deleteOrder = async () => {
          const rese = await axios.post(
            `/api/payment/refund?tid=${toTid}&costId=${toCostId}`,
          );
          console.log(rese.data.resultData);
        };

        await deleteOrder(); //삭제 실행
        setToTid(0);
        setToCostId(0);
        message.success("결제취소 완료되었습니다.");
        fetchAcademyList(); //목록 다시 호출
      }
    } catch (error) {
      console.log(error);
    }
    setIsModalVisible(false);
  };

  // 페이지 변경 감지를 위한 useEffect 추가
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]); // currentPage가 변경될 때마다 실행

  // searchParams 변경 감지를 위한 useEffect
  useEffect(() => {
    fetchAcademyList();
  }, [searchParams]);

  const handleSizeChange = (value: number) => {
    // 먼저 스크롤을 실행
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);

    setPageSize(value);
    updateSearchParams({
      size: value.toString(),
      page: "1",
    });
  };

  return (
    <div
      id="list-wrap"
      ref={scrollRef}
      className="flex gap-5 w-full justify-center align-top"
    >
      <div className="w-full">
        <h1 className="title-admin-font">
          학원별 결제 내역 (학원비/교제구매)
          <p>결제 및 지출 관리 {">"} 학원별 결제 내역</p>
        </h1>

        <div className="board-wrap">
          <Form form={form}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">주문 통합검색</label>
                <Select
                  placeholder="전체"
                  className="select-admin-basic"
                  value={searchParams.get("orderType") || "all"}
                  onChange={handleOrderTypeChange}
                  options={[
                    { value: "all", label: "전체" },
                    { value: "0", label: "학원비" },
                    { value: "1", label: "교재" },
                  ]}
                />
                <Input
                  placeholder="학원명 검색"
                  className="w-[200px]"
                  value={inputAcaName}
                  onChange={handleAcaNameChange}
                />
                <Button className="btn-admin-basic" onClick={handleSearch}>
                  검색하기
                </Button>
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
              </div>
              <div className="flex gap-2">
                <Form.Item name="size" className="mb-0">
                  <Select
                    className="select-admin-basic"
                    defaultValue={30}
                    value={pageSize}
                    onChange={handleSizeChange}
                    options={[
                      { value: 30, label: "30개씩 보기" },
                      { value: 40, label: "40개씩 보기" },
                      { value: 50, label: "50개씩 보기" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b">
            <div className="w-[60%] text-center">학원명/수업명</div>
            <div className="w-[8%] text-center">결제일자</div>
            <div className="w-[8%] text-center">결제금액</div>
            <div className="w-[8%] text-center">주문자</div>
            <div className="w-[8%] text-center">처리상태</div>
            <div className="w-[8%] text-center">결제취소</div>
            {/* <div className="w-[8%] text-center">삭제</div> */}
          </div>

          {academyList?.map((item, index) => (
            <div
              key={index}
              className="flex justify-between align-middle p-2 border-b items-center"
            >
              <div className="w-[60%] text-left">
                <p className="text-[14px] font-bold">{item.acaName}</p>
                <p className="text-[12px] text-blue-500">
                  [{item.classOrBookName}]
                </p>
              </div>
              <div className="w-[8%] text-center">{item.paymentDate}</div>
              <div className="w-[8%] text-center">{item.paymentAmount}</div>
              <div className="w-[8%] text-center">{item.orderer}</div>
              <div className="w-[8%] text-center">
                <p
                  className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center mx-auto ${
                    item.processingStatus === "결제대기"
                      ? "bg-[#f8a57d]"
                      : "bg-[#90b1c4]"
                  }`}
                >
                  {item.processingStatus}
                </p>
              </div>
              <div className="w-[8%] text-center">
                <button
                  className="small_line_button"
                  onClick={() => orderCancel(item.tid, item.costId)}
                >
                  결제취소
                </button>
              </div>
              {/* <div className="w-[8%] text-center flex justify-center">
                <FaPen className="mx-2 text-gray-400 cursor-pointer" />
                <FaRegTrashAlt className="mx-2 text-gray-400 cursor-pointer" />
              </div> */}
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center m-6">
          <Pagination
            current={currentPage}
            total={totalCount}
            pageSize={pageSize}
            showSizeChanger={false}
            onChange={handlePageChange}
          />
        </div>
      </div>

      {isModalVisible && (
        <CustomModal
          visible={isModalVisible}
          title={"결제 취소"}
          content={`선택하신 주문의 결제를 취소하시겠습니까?`}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소"}
          button2Text={"결제취소하기"}
          modalWidth={400}
        />
      )}
    </div>
  );
}

export default PaymentManager;
