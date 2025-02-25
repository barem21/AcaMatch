import { Button, Form, Pagination, Select } from "antd";
import { useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";

const PopupContent = () => {
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
          팝업창 관리
          <p>공지 및 콘텐츠 관리 {">"} 팝업창 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="text-sm">팝업창 등록개수 : 총 N 건</label>
              </div>

              <div className="flex gap-2">
                <Button
                  className="btn-admin-basic"
                  onClick={() => navigate("/admin/popup-content/add")}
                >
                  + 팝업창 등록
                </Button>
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
            <div className="flex items-center justify-center w-[100%]">
              제목
            </div>
            <div className="flex items-center justify-center w-[200px]">
              시작일
            </div>
            <div className="flex items-center justify-center w-[200px]">
              종료일
            </div>
            <div className="flex items-center justify-center w-[132px]">
              수정하기
            </div>
            <div className="flex items-center justify-center w-[72px]">
              삭제
            </div>
          </div>

          <div className="loop-content flex justify-between align-middle p-2 pl-3 border-b">
            <div className="flex justify-start items-center w-[100%] h-[56px]">
              <div className="flex items-center gap-3 cursor-pointer">
                <div>
                  <h4>관리자 팝업입니다.</h4>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-[200px]">
              2025-01-01
            </div>
            <div className="flex items-center justify-center text-center w-[200px]">
              2025-01-31
            </div>
            <div className="flex items-center justify-center w-[132px]">
              <p
                className={`w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300 cursor-pointer`}
                onClick={() => navigate("/admin/popup-content/add")}
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

export default PopupContent;
