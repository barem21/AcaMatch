import { Button, Form, Pagination, Select, message } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import CustomModal from "../../components/modal/Modal";

interface RevenueData {
  acaId: number;
  acaName: string;
  address: string;
  acaPic: string;
  price: number;
  status: number;
  createdAt: string;
  costId: number;
}

const AcaRevenue = (): JSX.Element => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // 기본값: 현재 연도와 월
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // URL에서 검색 조건 가져오기
  const status = searchParams.get("status") || "all";
  const year = searchParams.get("year") || currentYear.toString();
  const month = searchParams.get("month") || currentMonth.toString();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);

  useEffect(() => {
    fetchRevenueData();
  }, [status, year, month, page]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/academyCost/getSettlementList", {
        params: {
          status: status === "all" ? undefined : status,
          year,
          month,
          page,
          size,
        },
      });

      setRevenueData(response.data.resultData);
      setTotalItems(response.data.resultData.length);
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
      message.error("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async costId => {
    try {
      const response = await axios.get(
        `/api/academyCost/getAcademyCostInfoByCostId/${costId}`,
      );
      setOrderDetails(response.data.resultData);
      setModalVisible(true);
    } catch (error) {
      console.error("주문내역 불러오기 실패:", error);
      message.error("주문내역을 불러오는 데 실패했습니다.");
    }
  };

  const onFinished = (values: any) => {
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`);
  };

  const onChange = () => {
    form.submit();
  };

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학원별 매출 정산
          <p>결제 및 지출 관리 {">"} 학원 및 지출 관리</p>
        </h1>

        <div className="board-wrap">
          <Form
            form={form}
            onFinish={values => onFinished(values)}
            initialValues={{ status, year, month, size }}
          >
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">정산 상태</label>
                <Form.Item name="status" className="mb-0">
                  <Select
                    className="select-admin-basic"
                    onChange={onChange}
                    options={[
                      { value: "all", label: "전체" },
                      { value: "0", label: "미정산" },
                      { value: "1", label: "정산완료" },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="year" className="mb-0">
                  <Select className="select-admin-basic" onChange={onChange}>
                    {Array.from({ length: 5 }, (_, i) => {
                      const y = currentYear - i;
                      return { value: y.toString(), label: y.toString() };
                    }).map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="month" className="mb-0">
                  <Select className="select-admin-basic" onChange={onChange}>
                    {Array.from({ length: 12 }, (_, i) => ({
                      value: (i + 1).toString(),
                      label: `${i + 1}월`,
                    })).map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="flex gap-2">
                <Form.Item name="size" className="mb-0">
                  <Select
                    className="select-admin-basic"
                    onChange={onChange}
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

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-[50%]">
              학원명
            </div>
            <div className="flex items-center justify-center w-[200px]">
              정산일
            </div>
            <div className="flex items-center justify-center w-[100px]">
              정산금액
            </div>
            <div className="flex items-center justify-center w-[132px]">
              처리상태
            </div>
            <div className="flex items-center justify-center w-[132px]">
              주문내역
            </div>
            <div className="flex items-center justify-center w-[72px]">
              삭제
            </div>
          </div>

          {loading ? (
            <p className="text-center p-4">데이터 로딩 중...</p>
          ) : revenueData.length > 0 ? (
            revenueData.map(item => (
              <div
                key={item.costId}
                className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
              >
                <div className="flex justify-start items-center w-[50%]">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                      <img
                        src={`http://112.222.157.157:5233/pic/academy/${item.acaId}/${item.acaPic}`}
                        className="w-full h-full object-cover"
                        alt={item.acaName}
                      />
                    </div>
                    <div>
                      <h4>{item.acaName}</h4>
                      <p className="text-[#1761FD] text-[12px]">
                        [{item.address}]
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center text-center w-[200px]">
                  {item.createdAt.split("T")[0]}
                </div>
                <div className="flex items-center justify-center text-center w-[100px]">
                  {item.price.toLocaleString()}원
                </div>
                <div className="flex items-center justify-center w-[132px]">
                  <p
                    className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center ${item.status === 1 ? "bg-[#90b1c4]" : "bg-[#f8a57d]"}`}
                  >
                    {item.status === 1 ? "정산완료" : "미정산"}
                  </p>
                </div>
                <div className="flex items-center justify-center w-[132px]">
                  <button
                    onClick={() => fetchOrderDetails(item.costId)}
                    className="w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300"
                  >
                    주문내역
                  </button>
                </div>
                <div className="flex items-center justify-center w-[72px] ">
                  <button>
                    <FaRegTrashAlt className="w-3 text-gray-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-gray-500 border-b">
              데이터가 없습니다.
            </div>
          )}
        </div>
        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={page}
            total={totalItems}
            showSizeChanger={false}
          />
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white w-[500px] rounded-lg shadow-lg">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">주문 상세 정보</h3>
              <button
                onClick={() => setModalVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* 모달 컨텐츠 */}
            <div className="p-6">
              {orderDetails ? (
                <div className="space-y-3">
                  <p className="flex justify-between">
                    <span className="font-semibold">구매자:</span>
                    <span>{orderDetails.name}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">주문 ID:</span>
                    <span>{orderDetails.partnerOrderId}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">결제 금액:</span>
                    <span>{orderDetails.price.toLocaleString()}원</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">수수료:</span>
                    <span>{orderDetails.fee.toLocaleString()}원</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">구매 시간:</span>
                    <span>
                      {new Date(orderDetails.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex justify-center items-center h-20">
                  <p>로딩 중...</p>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-center p-4 border-t">
              <Button
                onClick={() => setModalVisible(false)}
                className="w-full h-14 text-sm"
                // className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcaRevenue;
