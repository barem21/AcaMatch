import axios from "axios";
import { Button, DatePicker, Form, Pagination, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import jwtAxios from "../../apis/jwt";

interface AcademyList {
  acaName: string;
  className?: string;
  paymentDate: string;
  paymentAmount: string;
  orderer: string;
  processingStatus: string;
  classOrBookName: string;
}

function PaymentManager() {
  const [form] = Form.useForm();
  const [academyList, setAcademyList] = useState<AcademyList[] | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs().subtract(7, "day"),
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [orderType, setOrderType] = useState<number>(0); // 0: 학원, 1: 교재
  const [searchParams, setSearchParams] = useSearchParams();

  // URL에서 페이지 번호 및 페이지 크기 가져오기
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 30;
  const [totalCount, setTotalCount] = useState(0);

  // API에서 학원 결제 내역을 가져오는 함수 (Axios 사용)
  const fetchAcademyList = async () => {
    if (!startDate || !endDate) return;

    const url = `/api/academy/GetAcademyListByAcaNameOrderType`;
    const params = {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      orderType,
      page: currentPage,
      size: pageSize,
    };

    try {
      const response = await jwtAxios.get(url, { params });
      const data = response.data;

      if (data.resultData) {
        const formattedData = data.resultData.map((item: any) => ({
          acaName: item.acaName,
          classOrBookName: item.classOrBookName, // 강좌명 or 책
          paymentDate: item.createdAt.split(" ")[0], // YYYY-MM-DD 형식 추출
          paymentAmount: item.price.toLocaleString(), // 결제 금액을 콤마 포함된 문자열로 변환
          orderer: item.name,
          processingStatus: item.costStatus === 2 ? "결제완료" : "결제대기",
        }));
        setAcademyList(formattedData);
        setTotalCount(data.totalCount); // 전체 데이터 개수 저장
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

  useEffect(() => {
    fetchAcademyList();
  }, [startDate, endDate, orderType, currentPage, pageSize]);

  const handleStartChange = (date: Dayjs | null) => {
    setStartDate(date);
    if (endDate && date && date.isAfter(endDate)) {
      setEndDate(null);
    }
  };

  const handleEndChange = (date: Dayjs | null) => {
    setEndDate(date);
  };

  const handleButtonClick = (days: number) => {
    let newStartDate: Dayjs;
    const newEndDate: Dayjs = dayjs(); // 오늘 날짜

    if (days === -1) {
      newStartDate = dayjs().subtract(1, "day");
    } else if (days === 7) {
      newStartDate = dayjs().subtract(7, "day"); // 7일 전부터 오늘까지
    } else if (days === 30) {
      newStartDate = dayjs().subtract(30, "day"); // 30일 전부터 오늘까지
    } else {
      newStartDate = dayjs(); // 기본적으로 오늘
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <div className="flex gap-5 w-full justify-center align-top">
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
                  placeholder="학원비"
                  className="select-admin-basic"
                  value={orderType.toString()}
                  onChange={value => setOrderType(Number(value))}
                  options={[
                    { value: "0", label: "학원비" },
                    { value: "1", label: "교재" },
                  ]}
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
                <Button className="btn-admin-basic" onClick={fetchAcademyList}>
                  검색하기
                </Button>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b">
            <div className="w-[60%] text-center">학원명/수업명</div>
            <div className="w-[8%] text-center">결제일자</div>
            <div className="w-[8%] text-center">결제금액</div>
            <div className="w-[8%] text-center">주문자</div>
            <div className="w-[8%] text-center">처리상태</div>
            <div className="w-[8%] text-center">삭제</div>
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
              <div className="w-[8%] text-center">{item.processingStatus}</div>
              <div className="w-[8%] text-center flex justify-center">
                <FaPen className="mx-2 text-gray-400 cursor-pointer" />
                <FaRegTrashAlt className="mx-2 text-gray-400 cursor-pointer" />
              </div>
            </div>
          ))}

          <div className="flex justify-center items-center m-6">
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={pageSize}
              showSizeChanger={false}
              onChange={page =>
                setSearchParams({
                  page: page.toString(),
                  size: pageSize.toString(),
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentManager;
