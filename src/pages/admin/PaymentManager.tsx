import { Button, DatePicker, Form, Input, Pagination, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
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

  useEffect(() => {
    fetchAcademyList();
  }, [searchParams]); // searchParams가 변경될 때마다 API 호출

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
                    defaultValue={30} // 기본값 설정
                    value={pageSize} // 현재 상태값
                    onChange={value => {
                      setPageSize(value); // 상태 업데이트
                      updateSearchParams({
                        size: value.toString(),
                        page: "1",
                      });
                    }}
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
            onChange={page => {
              updateSearchParams({
                page: page.toString(),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PaymentManager;
