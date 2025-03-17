import { Button, Form, Input, message, Pagination, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomModal from "../../../components/modal/Modal";

interface premiumListType {
  acaId: number;
  acaName: string;
  countPremium: number;
  createdAt: string;
  endDate: string;
  preCheck: number;
  startDate: string;
}

function AcademyPremium(): JSX.Element {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  const [countPremium, setCountPremium] = useState(0); //전체 갯수
  const [premiumList, setPremiumList] = useState<premiumListType[]>([]); //프리미엄 목록
  const [academyId, setAcademyId] = useState(0); //삭제할려는 아카데미 고유값
  const [isModalVisible, setIsModalVisible] = useState(false);

  const state = searchParams.get("state");

  //프리미엄 학원 신청내역
  const premiumAcademy = async () => {
    try {
      const res = await axios.get(`/api/academy/premium?page=1&size=30`);
      setPremiumList(res.data.resultData);
      setCountPremium(res.data.resultData[0].countPremium);
      //console.log(res.data.resultData[0].countPremium);
    } catch (error) {
      console.log(error);
    }
  };

  //프리미엄 학원 삭제하기
  const handleDeletePremium = (value: number) => {
    setAcademyId(value);
    setIsModalVisible(true);
  };

  //강좌삭제 확인팝업 관련
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = async (value: number) => {
    try {
      const res = await axios.delete(`/api/academy/premium`, {
        data: { acaId: value },
      });
      //console.log(res.data.resultData);

      if (res.data.resultData === 1) {
        message.success("프리미엄 학원 삭제가 완료되었습니다.");
        setAcademyId(0);
      }
      premiumAcademy(); //신청목록 다시 호출
    } catch (error) {
      console.log(error);
      message.error("프리미엄 학원 삭제가 실패되었습니다.");
      setAcademyId(0);
    }
    setIsModalVisible(false);
  };

  //프리미엄 승인처리
  const handleChangeCheck = async (acaId: number, value: string) => {
    try {
      const data = { acaId: acaId, preCheck: parseInt(value) };
      const res = await axios.put(`/api/academy/premium`, data);
      //console.log(res.data.resultData);

      if (res.data.resultData === 1) {
        message.success(
          `프리미엄 학원 상태변경(${value === "1" ? "승인완료" : "승인대기"})이 완료되었습니다.`,
        );
      }
      premiumAcademy(); //신청목록 다시 호출
    } catch (error) {
      console.log(error);
      message.error("프리미엄 학원 상태변경이 실패되었습니다.");
    }
    if (value === "2") {
      //승인거부
      alert(acaId);
    }
  };

  const onFinished = async (values: any) => {
    //console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    form.submit();
    premiumAcademy();
  };

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      state: state ? parseInt(state) : null,
      search: "",
      showCnt: 10,
    });

    premiumAcademy(); //프리미엄 학원 목록
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
                    placeholder="처리상태"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
                    // onSearch={onSearch}
                    options={[
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
                <Form.Item name="showCnt" className="mb-0 min-w-28">
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

                <Button
                  className="btn-admin-basic"
                  onClick={() => navigate("../premium-req")}
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

          {premiumList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={"/aca_image_1.png"}
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  {item.acaName}
                </div>
              </div>
              <div className="flex items-center justify-center text-center w-40">
                {item.createdAt.substr(0, 10)}
              </div>
              <div className="flex items-center justify-center w-72">
                {item.startDate} ~ {item.endDate}
              </div>
              <div className="flex items-center justify-center w-40">
                <p
                  className={`w-full max-w-[80px] pb-[1px] rounded-md ${item.preCheck === 1 ? "bg-[#90b1c4]" : "bg-[#F28C6A]"} text-white text-[12px] text-center`}
                >
                  {item.preCheck === 1 ? "승인완료" : "승인대기"}
                </p>
              </div>
              <div className="flex items-center justify-center w-40">
                <select
                  className="p-1 border rounded-lg"
                  value={item.preCheck}
                  onChange={e => handleChangeCheck(item.acaId, e.target.value)}
                >
                  <option value="0">승인대기</option>
                  <option value="1">승인완료</option>
                  <option value="2">승인거부</option>
                </select>
              </div>
              <div className="flex gap-4 items-center justify-center w-28">
                <button onClick={() => handleDeletePremium(item.acaId)}>
                  <FaRegTrashAlt className="w-3 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={countPremium}
            showSizeChanger={false}
          />
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"프리미엄 삭제하기"}
        content={"선택하신 학원의 프리미엄 신청을 삭제하시겠습니까?"}
        onButton1Click={handleButton1Click}
        onButton2Click={() => handleButton2Click(academyId)}
        button1Text={"취소하기"}
        button2Text={"삭제하기"}
        modalWidth={400}
      />
    </div>
  );
}

export default AcademyPremium;
