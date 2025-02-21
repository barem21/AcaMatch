import { Button, Form, Input, Pagination, Select } from "antd";
import { useEffect } from "react";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";

function MemberList(): JSX.Element {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
          회원 관리
          <p>회원 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">회원 검색</label>

                <Form.Item name="state" className="mb-0">
                  <Select
                    placeholder="전체"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "all",
                        label: "전체",
                      },
                      {
                        value: 0,
                        label: "학생",
                      },
                      {
                        value: 1,
                        label: "학부모",
                      },
                      {
                        value: 2,
                        label: "학원 관계자",
                      },
                      {
                        value: 3,
                        label: "강사",
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
            <div className="flex items-center justify-center w-full">
              회원명/아이디
            </div>
            <div className="flex items-center justify-center w-40">
              회원유형
            </div>
            <div className="flex items-center justify-center w-40">가입일</div>
            <div className="flex items-center justify-center w-52">
              전화번호
            </div>
            <div className="flex items-center justify-center w-96">주소</div>
            <div className="flex items-center justify-center w-40">닉네임</div>
            <div className="flex items-center justify-center w-36">
              신고횟수
            </div>
            <div className="flex items-center justify-center w-36">관리</div>
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
                <div>
                  <h4>홍길동</h4>
                  <p className="text-gray-500 text-[12px]">test@test.com</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-40">
              학부모
            </div>
            <div className="flex items-center justify-center text-center w-40">
              2025-01-01
            </div>
            <div className="flex items-center justify-center text-center w-52">
              010-0000-0000
            </div>
            <div className="flex items-center justify-center text-center w-96">
              대구광역시 수성구 범어로 100
            </div>
            <div className="flex items-center justify-center w-40">홍길동</div>
            <div className="flex items-center justify-center w-36">3회</div>
            <div className="flex gap-4 items-center justify-center w-36">
              <button onClick={() => navigate(`../memberInfo?userId=0`)}>
                <FaPen className="w-3 text-gray-400" />
              </button>
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

export default MemberList;
