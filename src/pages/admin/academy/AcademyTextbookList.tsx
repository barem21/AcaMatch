import { Button, Form, Input, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import axios from "axios";

function AcademyTextbookList(): JSX.Element {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const [classList, setClassList] = useState([]);
  const acaId = searchParams.get("acaId");
  const classId = searchParams.get("classId");

  //학원 검색
  const onFinished = async (values: any) => {
    console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../academy/textBook?acaId=${acaId}&${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    form.submit();
  };

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      classId: classId ? parseInt(classId) : "all",
      search: "",
      showCnt: 40,
    });
  }, []);

  useEffect(() => {
    //강좌 목록
    const academyClassList = async () => {
      try {
        const res = await axios.get(
          `/api/acaClass?acaId=${acaId ? acaId : 0}&page=1`,
        );
        const formatted = res.data.resultData.map(item => ({
          value: item.classId,
          label: item.className,
        }));
        setClassList(formatted);
        //console.log(res.data.resultData);
      } catch (error) {
        console.log(error);
      }
    };
    academyClassList();
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          교재 관리
          <p>학원 관리 &gt; 학원 강의목록 &gt; 교재 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">교재 검색</label>
                <Form.Item name="classId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="학원 선택"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={classList}
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
                  onClick={() =>
                    navigate(
                      `../academy/textbookAdd?acaId=${acaId}&classId=${classId}`,
                    )
                  }
                >
                  + 교재 신규등록
                </Button>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              교재명
            </div>
            <div className="flex items-center justify-center w-40">등록일</div>
            <div className="flex items-center justify-center w-40">수량</div>
            <div className="flex items-center justify-center w-40">가격</div>
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
                원숭이도 이해?!할 수 있는 초등영어
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-40">
              2025-01-01
            </div>
            <div className="flex items-center justify-center w-40">1개</div>
            <div className="flex items-center justify-center w-40">
              25,000원
            </div>
            <div className="flex gap-4 items-center justify-center w-36">
              <button
                onClick={() =>
                  navigate(
                    `../academy/textbookEdit?acaId=${acaId}&classId=${classId}`,
                  )
                }
              >
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

export default AcademyTextbookList;
