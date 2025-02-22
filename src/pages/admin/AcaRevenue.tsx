import { Form, Pagination, Select } from "antd";
import { useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";

const AcaRevenue = (): JSX.Element => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();

  const state = searchParams.get("state");

  const onFinished = async (values: any) => {
    console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    form.submit();
  };

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      state: state ? parseInt(state) : "all",
      search: "",
      showCnt: 40,
    });
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학원별 매출 정산
          <p>결제 및 지출 관리 {">"} 학원 및 지출 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">정산 통합검색</label>

                <Form.Item name="state" className="mb-0">
                  <Select
                    placeholder="전체 학원"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "all",
                        label: "전체 학원",
                      },
                      {
                        value: 0,
                        label: "미정산",
                      },
                      {
                        value: 1,
                        label: "정산완료",
                      },
                    ]}
                  />
                </Form.Item>
                <Select
                  placeholder="2025"
                  optionFilterProp="label"
                  className="select-admin-basic"
                  // onChange={onChange}
                  // onSearch={onSearch}
                  options={[
                    {
                      value: "all",
                      label: "2025",
                    },
                    {
                      value: 0,
                      label: "2024",
                    },
                    {
                      value: 1,
                      label: "2023",
                    },
                  ]}
                />
                <Select
                  placeholder="1월"
                  optionFilterProp="label"
                  className="select-admin-basic"
                  // onChange={onChange}
                  // onSearch={onSearch}
                  options={[
                    {
                      value: "all",
                      label: "1월",
                    },
                    {
                      value: 0,
                      label: "2월",
                    },
                    {
                      value: 1,
                      label: "3월",
                    },
                    {
                      value: 3,
                      label: "4월",
                    },
                    {
                      value: 4,
                      label: "5월",
                    },
                    {
                      value: 5,
                      label: "6월",
                    },
                    {
                      value: 7,
                      label: "7월",
                    },
                    {
                      value: 8,
                      label: "8월",
                    },
                    {
                      value: 9,
                      label: "9월",
                    },
                    {
                      value: 10,
                      label: "10월",
                    },
                    {
                      value: 11,
                      label: "11월",
                    },
                    {
                      value: 12,
                      label: "12월",
                    },
                  ]}
                />
              </div>

              <div className="flex gap-2">
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    placeholder="40개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: 40,
                        label: "40개씩 보기",
                      },
                      {
                        value: 50,
                        label: "50개씩 보기",
                      },
                      {
                        value: 60,
                        label: "60개씩 보기",
                      },
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
              정산기간
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

          <div className="loop-content flex justify-between align-middle p-2 pl-3 border-b">
            <div className="flex justify-start items-center w-[50%]">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                  <img
                    src={"/aca_image_1.png"}
                    className="max-w-fit max-h-full object-cover"
                    alt=" /"
                  />
                </div>
                <div>
                  <h4>은빛피아노미술학원</h4>
                  <p className="text-[#1761FD] text-[12px]">
                    [대구 광역시 수성구 범어동]
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-[200px]">
              2025-01-01 ~ 2025-01-31
            </div>
            <div className="flex items-center justify-center text-center w-[100px]">
              125,000원
            </div>
            <div className="flex items-center justify-center w-[132px]">
              <p
                className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center bg-[#f8a57d]`}
              >
                정산완료
              </p>
            </div>
            <div className="flex items-center justify-center w-[132px]">
              <p
                className={`w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300`}
              >
                주문내역
              </p>
            </div>
            <div className="flex gap-4 items-center justify-center w-[72px]">
              <button>
                <FaRegTrashAlt className="w-3 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination defaultCurrent={1} total={10} showSizeChanger={false} />
        </div>
      </div>
    </div>
  );
};

export default AcaRevenue;
