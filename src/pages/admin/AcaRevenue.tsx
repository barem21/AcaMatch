import { Form, Pagination, Select, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomModal from "../../components/modal/Modal";

interface RevenueData {
  acaId: number;
  acaName: string;
  address: string;
  acaPic: string;
  totalPrice: number;
  latestStatus: number;
  totalCount: number;
  costIds: string;
}

// interface OrderDetails {
//   name: string;
//   partnerOrderId: string;
//   price: number;
//   fee: number;
//   createdAt: string;
//   orderType: number;
// }

const AcaRevenue = (): JSX.Element => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  // const [modalVisible, setModalVisible] = useState(false);
  // const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  // 확인 모달의 상태를 관리하는 state
  const [confirmModal, setConfirmModal] = useState({
    visible: false, // 모달 표시 여부
    acaId: 0, // 학원 ID
    newStatus: 0, // 변경할 상태 값
    costIds: "", // 정산 ID 목록
    message: "", // 모달에 표시할 메시지
  });

  // 기본값: 현재 연도와 월
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // URL에서 검색 조건 가져오기
  const status = searchParams.get("status") || "all";
  const year = searchParams.get("year") || currentYear.toString();
  const month = searchParams.get("month") || currentMonth.toString();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const size = parseInt(searchParams.get("size") || "30", 10);

  useEffect(() => {
    fetchRevenueData();
  }, [status, year, month, page, size]);

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

      console.log("API Response:", response.data.resultData);
      setRevenueData(response.data.resultData);
      if (response.data.resultData.length > 0) {
        setTotalCount(response.data.resultData[0].totalCount);
      }
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
      message.error("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // const fetchOrderDetails = async (costId: number) => {
  //   try {
  //     const response = await axios.get(
  //       `/api/academyCost/getAcademyCostInfoByCostId/${costId}`,
  //     );
  //     console.log(response.data.resultData);
  //     setOrderDetails(response.data.resultData);
  //     setModalVisible(true);
  //   } catch (error) {
  //     console.error("주문내역 불러오기 실패:", error);
  //     message.error("주문내역을 불러오는 데 실패했습니다.");
  //   }
  // };

  const onFinished = (values: any) => {
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`);
  };

  const onChange = () => {
    form.submit();
  };

  // 현재 선택된 월의 마지막 날짜 구하기
  const getLastDayOfMonth = () => {
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  // 정산일 표시 형식
  const getSettlementDate = () => {
    return `${year}-${month.padStart(2, "0")}-${getLastDayOfMonth()}`;
  };

  // 상태 변경을 처리하는 함수 추가
  const handleStatusChange = (
    acaId: number,
    newStatus: number,
    costIds: string,
  ) => {
    setConfirmModal({
      visible: true,
      acaId,
      newStatus,
      costIds,
      // 새로운 상태가 1(정산완료)이면 정산 확인, 아니면 정산 취소 확인
      message:
        newStatus === 1 ? "정산하시겠습니까?" : "정산을 취소하시겠습니까?",
    });
  };

  // 상태 변경을 실제로 처리하는 함수
  const handleConfirmStatusChange = async () => {
    try {
      const { newStatus, costIds } = confirmModal;

      // API 호출하여 상태 변경
      const res = await axios.put(`/api/academyCost/updateStatus/${costIds}`);

      // 모달 초기화 및 데이터 새로고침
      setConfirmModal({
        visible: false,
        acaId: 0,
        newStatus: 0,
        costIds: "",
        message: "",
      });
      fetchRevenueData();
      if (res.data.resultData === 1) {
        // 성공 메시지 표시
        message.success(
          newStatus === 1 ? "정산이 완료되었습니다." : "정산이 취소되었습니다.",
        );
      } else {
        message.error("상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("상태 변경 실패:", error);
      message.error("상태 변경에 실패했습니다.");
    }
  };

  // 주문상세보기 처리 함수 수정
  const handleOrderDetail = (acaName: string) => {
    // 해당 월의 시작일과 마지막 날짜 구성
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDate = `${year}-${month.padStart(2, "0")}-${getLastDayOfMonth()}`;

    // 수정된 URL 형식으로 이동
    navigate(
      `/admin/paymentmanager?startDate=${startDate}&endDate=${endDate}&acaName=${encodeURIComponent(acaName)}&page=1`,
    );
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
            {/* <div className="flex items-center justify-center w-[72px]">
              삭제
            </div> */}
          </div>

          {loading ? (
            <p className="text-center p-4">데이터 로딩 중...</p>
          ) : revenueData.length > 0 ? (
            revenueData.map(item => {
              console.log("Item status:", item.latestStatus);
              return (
                <div
                  key={item.acaId}
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
                    {getSettlementDate()}
                  </div>
                  <div className="flex items-center justify-center text-center w-[100px]">
                    {item.totalPrice.toLocaleString()}원
                  </div>
                  <div className="flex items-center justify-center w-[132px]">
                    <select
                      className="p-1 border rounded-lg"
                      value={item.latestStatus}
                      onChange={e =>
                        handleStatusChange(
                          item.acaId,
                          Number(e.target.value),
                          item.costIds,
                        )
                      }
                    >
                      <option value="0">미정산</option>
                      <option value="1">정산완료</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-center w-[132px]">
                    <button
                      onClick={() => handleOrderDetail(item.acaName)}
                      className="w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300"
                    >
                      주문내역
                    </button>
                  </div>
                  {/* <div className="flex items-center justify-center w-[72px] ">
                    <button>
                      <FaRegTrashAlt className="w-3 text-gray-400" />
                    </button>
                  </div> */}
                </div>
              );
            })
          ) : (
            <div className="text-center p-4 text-gray-500 border-b">
              데이터가 없습니다.
            </div>
          )}
        </div>
        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={page}
            total={totalCount}
            pageSize={size}
            showSizeChanger={false}
            onChange={newPage => {
              setSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                page: newPage.toString(),
              });
            }}
          />
        </div>
      </div>
      {/* 상태 변경 확인 모달 */}
      <CustomModal
        visible={confirmModal.visible}
        title="정산 상태 변경"
        content={confirmModal.message}
        onButton1Click={() => {
          // 취소 시 모달 초기화 및 데이터 새로고침
          setConfirmModal({
            visible: false,
            acaId: 0,
            newStatus: 0,
            costIds: "",
            message: "",
          });
          fetchRevenueData(); // 상태 되돌리기
        }}
        onButton2Click={handleConfirmStatusChange}
        button1Text="취소"
        button2Text="확인"
        modalWidth={400}
      />
    </div>
  );
};

export default AcaRevenue;
