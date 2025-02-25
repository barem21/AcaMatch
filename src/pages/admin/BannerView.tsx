import { Form, Pagination, Select } from "antd";
import { useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
const BannerView = () => {
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
          프리미엄 학원 배너 관리
          <p>공지 및 콘텐츠 관리 {">"} 배너 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="text-sm">학원명</label>
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
            <div className="flex items-center justify-center w-[75%]">
              베너위치
            </div>
            <div className="flex items-center justify-center w-[132px]">
              노출상태
            </div>
            <div className="flex items-center justify-center w-[132px]">
              수정하기
            </div>
            <div className="flex items-center justify-center w-[72px]">
              삭제
            </div>
          </div>

          <div className="loop-content flex justify-between align-middle p-2 pl-3 border-b">
            <div className="flex justify-start items-center w-[75%] h-[56px]">
              <div className="flex items-center gap-3 cursor-pointer">
                <div>
                  <h4>대구 ABC 상아탑 학원</h4>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-[132px]">
              <p
                className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center bg-[#f8a57d]`}
              >
                미출력
              </p>
            </div>
            <div className="flex items-center justify-center w-[132px]">
              <p
                className={`w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300 cursor-pointer`}
                onClick={() => navigate("/admin/banner-content/view")}
              >
                수정하기
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

export default BannerView;
