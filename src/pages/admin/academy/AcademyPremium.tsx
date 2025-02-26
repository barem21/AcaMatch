import { Button, Form, Input, Pagination, Select } from "antd";
import { useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";

function AcademyPremium(): JSX.Element {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();

  const state = searchParams.get("state");

  const onFinished = async (values: any) => {
    //console.log(values);

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
          프리미엄 학원 관리
          <p>학원관리 &gt; 프리미엄 학원 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">학원 검색</label>

                <Form.Item name="state" className="mb-0">
                  <Select
                    showSearch
                    placeholder="처리상태"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "all",
                        label: "처리상태",
                      },
                      {
                        value: 0,
                        label: "승인대기",
                      },
                      {
                        value: 1,
                        label: "승인완료",
                      },
                      {
                        value: 2,
                        label: "승인거부",
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
                    showSearch
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

                <Button
                  className="btn-admin-basic"
                  onClick={() => navigate("../academy/premium-req")}
                >
                  + 프리미엄 학원 신청
                </Button>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            <div className="flex items-center justify-center w-40">신청일</div>
            <div className="flex items-center justify-center w-72">
              적용기간
            </div>
            <div className="flex items-center justify-center w-40">
              처리상태
            </div>
            <div className="flex items-center justify-center w-40">
              승인여부
            </div>
            <div className="flex items-center justify-center w-28">관리</div>
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
                대구 ABC상아탑 학원
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-40">
              2025-01-01
            </div>
            <div className="flex items-center justify-center w-72">
              2025-01-01 ~ 2025-01-31
            </div>
            <div className="flex items-center justify-center w-40">
              <p className="w-full max-w-[80px] pb-[1px] rounded-md bg-[#90b1c4] text-white text-[12px] text-center">
                승인완료
              </p>
            </div>
            <div className="flex items-center justify-center w-40">
              <select className="p-1 border rounded-lg">
                <option value="">선택</option>
                <option value="0">승인대기</option>
                <option value="1">승인완료</option>
                <option value="2">승인거부</option>
              </select>
            </div>
            <div className="flex gap-4 items-center justify-center w-28">
              <button>
                <FaRegTrashAlt className="w-3 text-gray-400" />
              </button>
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
                대구 ABC상아탑 학원
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-40">
              2025-01-01
            </div>
            <div className="flex items-center justify-center w-72">
              2025-01-01 ~ 2025-01-31
            </div>
            <div className="flex items-center justify-center w-40">
              <p className="w-full max-w-[80px] pb-[1px] rounded-md bg-[#90b1c4] text-white text-[12px] text-center">
                승인완료
              </p>
            </div>
            <div className="flex items-center justify-center w-40">
              <select className="p-1 border rounded-lg">
                <option value="">선택</option>
                <option value="0">승인대기</option>
                <option value="1">승인완료</option>
                <option value="2">승인거부</option>
              </select>
            </div>
            <div className="flex gap-4 items-center justify-center w-28">
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
}

export default AcademyPremium;
