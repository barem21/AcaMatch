import { Button, Form, Input, Pagination, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import CustomModal from "../../../components/modal/Modal";
//import CustomModal from "../../../components/modal/Modal";

function AcademyArrow(): JSX.Element {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  //학원등록 거부사유
  const handleButton1Click = (): void => {
    form2.resetFields(); //초기화
    setIsModalVisible(false);
  };
  const handleButton2Click = (): void => {
    const reject = form2.getFieldValue("reject");

    if (!reject) {
      alert("거부사유를 입력해 주세요.");
    } else {
      setIsModalVisible(false);
      form2.submit();
      form2.resetFields(); //초기화
      //목록 다시 불러오기 한번 실행
    }
  };

  //학원 검색
  const onFinished = async (values: any) => {
    console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../academy/arrow?${queryParams}`); //쿼리스트링 url에 추가
  };

  const AcademyArrowChange = (e: any) => {
    if (parseInt(e.target.value) === 2) {
      //alert("거부사유 입력");
      setIsModalVisible(true);
    }
  };

  const onChange = () => {
    form.submit();
  };

  //학원등록 승인삭제 팝업
  const handleAcademyDelete = () => {};

  //학원등록 거부사유 처리
  const onFinishedSe = async (values: any) => {
    console.log(values);
  };

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      search: "",
      showCnt: 40,
    });
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학원등록 승인
          <p>학원 관리 &gt; 학원등록 승인</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">학원 검색</label>
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
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              학원명
            </div>
            <div className="flex items-center justify-center w-40">등록일</div>
            <div className="flex items-center justify-center w-52">
              학원 연락처
            </div>
            <div className="flex items-center justify-center w-96">
              학원 주소
            </div>
            <div className="flex items-center justify-center w-40">등록자</div>
            <div className="flex items-center justify-center w-36">처리</div>
            <div className="flex items-center justify-center w-36">삭제</div>
          </div>

          <div className="loop-content flex justify-between align-middle p-2 pl-3 border-b">
            <div className="flex justify-start items-center w-full">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                  <img
                    src="/aca_image_1.png"
                    className="max-w-fit max-h-full object-cover"
                    alt=" /"
                  />
                </div>
                대구 ABC상아탑 학원
              </div>
            </div>
            <div className="flex items-center justify-center text-center w-40">
              2025-02-24
            </div>
            <div className="flex items-center justify-center text-center w-52">
              010-0000-0000
            </div>
            <div className="flex items-center justify-center text-center w-96">
              대구광역시 수성구 범어로 100
            </div>
            <div className="flex items-center justify-center w-40">홍길동</div>
            <div className="flex items-center justify-center w-40">
              <select
                className="p-1 border rounded-lg"
                onChange={e => AcademyArrowChange(e)}
              >
                <option value="">선택</option>
                <option value="0">승인대기</option>
                <option value="1">승인완료</option>
                <option value="2">승인거부</option>
              </select>
            </div>
            <div className="flex gap-4 items-center justify-center w-36">
              <button
                //onClick={e => DeleteAcademy(item.acaId)}
                onClick={() => handleAcademyDelete()}
              >
                <FaRegTrashAlt className="w-3 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination defaultCurrent={1} total={10} showSizeChanger={false} />
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"학원등록 거부사유"}
        content={
          <Form form={form2} onFinish={values => onFinishedSe(values)}>
            <Form.Item
              name="reject"
              className="mb-0"
              rules={[
                { required: true, message: "등록 거부사유를 입력해주세요." },
              ]}
            >
              <Input
                className="w-full input-admin-basic"
                placeholder="학원등록 거부사유를 입력해 주세요."
              />
            </Form.Item>
          </Form>
        }
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text={"취소하기"}
        button2Text={"저장하기"}
        modalWidth={400}
      />
    </div>
  );
}

export default AcademyArrow;
