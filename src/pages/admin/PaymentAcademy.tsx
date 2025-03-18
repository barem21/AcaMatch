import { Button, Form, Input, message, Pagination, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import CustomModal from "../../components/modal/Modal";

interface paymentListType {
  name: string;
  userPic: string;
  email: string;
  registrationDate: string;
  acaName: string;
  className: string;
  phone: string;
  certification: number;
  totalCount: number;
  joinClassId: number;
}

function PaymenuAcademy() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentList, setPaymentList] = useState<paymentListType[]>([]);
  const { userId } = useRecoilValue(userInfo);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentCount, setPaymenuCount] = useState(0); //총 최원수
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  //const [joinClassId, setJoinClassId] = useState(0);

  const state = parseInt(searchParams.get("state") || "0", 0);
  const search = searchParams.get("search");
  const showCnt = parseInt(searchParams.get("showCnt") || "10", 0);

  const paymentAcademyList = async (values: any) => {
    try {
      const res = await axios.get(
        "/api/academy-manager/GetUserInfoList?userId=" +
          userId +
          ("&page=" + (currentPage ? currentPage : 1)) +
          ("&size=" + (values.showCnt ? values.showCnt : 10)) +
          (values.state ? "&certification=" + values.state : "") +
          (values.search ? "&name=" + values.search : ""),
      );
      setPaymentList(res.data.resultData);
      setPaymenuCount(res.data.resultData.totalCount);
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = () => {
    setCurrentPage(1);
    form.submit();
  };

  //승인처리하기
  const reportProcess = async (joinClassId: number, value: string) => {
    if (value === "2") {
      //승인거부
      setIsModalVisible(true);
      return;
    } else {
      const data = { joinClassId: joinClassId, certification: parseInt(value) };
      try {
        const res = await axios.put(`/api/joinClass`, data);
        //console.log(res.data.resultData);

        if (res.data.resultData === 1) {
          message.success("승인처리 완료되었습니다.");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  //승인거부팝업
  const handleButton1Click = () => {
    setIsModalVisible(false);
    //setJoinClassId(0);
    //setReportType(null);
  };
  const handleButton2Click = async () => {
    setIsModalVisible(false);
  };

  //페이지 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page); // 페이지 변경
    //paymentAcademyList(page);
  };

  const onFinished = async (values: any) => {
    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가

    paymentAcademyList(values);
  };

  useEffect(() => {
    paymentAcademyList(1); //학원등록 승인대기 내역

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      state: state ? state : 0,
      search: search ? search : "",
      showCnt: showCnt ? showCnt : 10,
    });
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학원 수강신청
          <p>결제 및 지출 관리 &gt; 학원 수강신청</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">처리 상태</label>

                <Form.Item name="state" className="mb-0">
                  <Select
                    placeholder="전체"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    style={{ minWidth: "110px" }}
                    onChange={onChange}
                    options={[
                      {
                        value: 0,
                        label: "승인대기",
                      },
                      {
                        value: 1,
                        label: "승인완료",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="search" className="mb-0">
                  <Input
                    className="input-admin-basic w-60"
                    placeholder="검색어를 입력해 주세요."
                  />
                </Form.Item>

                <Button htmlType="submit" className="btn-admin-basic">
                  검색하기
                </Button>
              </div>

              <div className="flex gap-2">
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    placeholder="10개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: 10,
                        label: "10개씩 보기",
                      },
                      {
                        value: 20,
                        label: "20개씩 보기",
                      },
                      {
                        value: 50,
                        label: "50개씩 보기",
                      },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              학원명/수업명
            </div>
            <div className="flex items-center justify-center min-w-32">
              회원명
            </div>
            <div className="flex items-center justify-center min-w-40">
              이메일
            </div>
            <div className="flex items-center justify-center min-w-32">
              연락처
            </div>
            <div className="flex items-center justify-center min-w-28">
              결제일자
            </div>
            <div className="flex items-center justify-center min-w-24">
              처리상태
            </div>
            <div className="flex items-center justify-center min-w-24">
              승인
            </div>
          </div>

          {paymentList?.length === 0 && (
            <div className="loop-content flex justify-center align-middle p-2 pl-3 border-b">
              수강신청 내역이 없습니다.
            </div>
          )}

          {paymentList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div>
                    <h4 className="font-semibold">{item.acaName}</h4>
                    <p className="text-gray-500 text-[12px]">
                      {item.className}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center min-w-32">
                {item.name}
              </div>
              <div className="flex items-center justify-center min-w-40">
                {item.email}
              </div>
              <div className="flex items-center justify-center text-center min-w-32">
                {item.phone}
              </div>
              <div className="flex items-center justify-center text-center min-w-28">
                {item.registrationDate.substr(0, 10)}
              </div>
              <div className="flex items-center justify-center text-center min-w-24">
                {item.certification === 0 ? (
                  <span className="w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center bg-[#f8a57d]">
                    승인대기
                  </span>
                ) : (
                  <span className="w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center bg-[#90b1c4]">
                    승인완료
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center text-center min-w-24">
                <select
                  name="actionType"
                  value={item.certification}
                  className="p-1 border rounded-lg"
                  onChange={e =>
                    reportProcess(
                      item.joinClassId ? item.joinClassId : 0,
                      e.target.value,
                    )
                  }
                >
                  <option value="0">승인대기</option>
                  <option value="1">승인완료</option>
                  <option value="2">승인거부</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            total={paymentCount}
            current={1} // 현재 페이지 번호
            pageSize={showCnt} // 한 페이지에 표시할 항목 수
            onChange={handlePageChange} // 페이지 변경 시 호출되는 핸들러
            showSizeChanger={false}
          />
        </div>
      </div>

      {isModalVisible && (
        <CustomModal
          visible={isModalVisible}
          title={"수강 승인거부"}
          content={`선택하신 수강신청을 수강 승인거부하시겠습니까?`}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소"}
          button2Text={"수강 승인거부"}
          modalWidth={400}
        />
      )}
    </div>
  );
}

export default PaymenuAcademy;
