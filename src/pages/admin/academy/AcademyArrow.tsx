import { Button, Form, Input, message, Pagination, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomModal from "../../../components/modal/Modal";
import jwtAxios from "../../../apis/jwt";

interface myAcademyListType {
  acaId: number;
  acaName: string;
  acaPhone: string;
  acaPic: string;
  acaPics: string;
  address: string;
  comment: string;
  createdAt: string;
  name: string;
  userId: number;
}

function AcademyArrow(): JSX.Element {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const navigate = useNavigate();
  const [academyId, setAcademyId] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]);
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search");
  //const showCnt = searchParams.get("showCnt");

  //미승인 학원 목록
  const academyList = async () => {
    try {
      const res = await axios.get(
        "/api/academy/GetAcademyInfoByAcaNameClassNameExamNameAcaAgree?acaAgree=0" +
          (search !== null ? "&acaName=" + search : ""),
      );
      setMyAcademyList(res.data.resultData);
      //console.log("admin : ", res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

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

  //학원등록 승인
  const handleButton1Click2 = (): void => {
    setIsModalVisible2(false);
    academyList();
  };
  const handleButton2Click2 = async () => {
    const data = { acaId: academyId };
    try {
      const res = await axios.put("/api/academy/agree", data);
      if (res.data.resultData === 1) {
        academyList();
        setIsModalVisible2(false);
        message.success("학원등록 승인이 완료되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //학원 검색
  const onFinished = async (values: any) => {
    try {
      const res = await jwtAxios.get(
        "/api/academy/GetAcademyInfoByAcaNameClassNameExamNameAcaAgree?acaAgree=0" +
          (values.search !== null ? "&acaName=" + values.search : ""),
      );
      setMyAcademyList(res.data.resultData);
    } catch (error) {
      console.log(error);
    }

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`../arrow-list?${queryParams}`); //쿼리스트링 url에 추가
  };

  const AcademyArrowChange = (value: number, acaId: number) => {
    if (value === 2) {
      //alert("거부사유 입력");
      setIsModalVisible(true);
    } else if (value === 1) {
      setAcademyId(acaId);
      setIsModalVisible2(true);
    } else {
      //setIsModalVisible2(true);
      return;
    }
  };

  const onChange = () => {
    form.submit();
  };

  //학원등록 승인삭제 불가...
  const handleAcademyDelete = async (acaId: number, userId: number) => {
    try {
      if (confirm("학원등록 신청을 삭제하시겠습니까?") === true) {
        const res = await jwtAxios.delete(
          `/api/academy?acaId=${acaId}&userId=${userId}`,
        );
        console.log(res.data.resultData);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  //학원등록 거부사유 처리
  const onFinishedSe = async (values: any) => {
    console.log(values);
  };

  useEffect(() => {
    academyList();

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      search: "",
      showCnt: 10,
    });
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학원 등록 승인
          <p>학원 관리 &gt; 학원 등록 승인</p>
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
              학원명
            </div>
            <div className="flex items-center justify-center min-w-32">
              등록일
            </div>
            <div className="flex items-center justify-center min-w-32">
              학원 연락처
            </div>
            <div className="flex items-center justify-center min-w-40">
              학원 주소
            </div>
            <div className="flex items-center justify-center min-w-28">
              등록자
            </div>
            <div className="flex items-center justify-center min-w-24">
              처리
            </div>
            <div className="flex items-center justify-center min-w-16">
              삭제
            </div>
          </div>

          {myAcademyList === null && (
            <div className=" flex justify-center align-middle p-2 border-b">
              등록 대기중인 학원이 없습니다.
            </div>
          )}
          {myAcademyList?.length === 0 && (
            <div className=" flex justify-center align-middle p-2 border-b">
              등록 대기중인 학원이 없습니다.
            </div>
          )}

          {myAcademyList?.map(item => (
            <div className="loop-content flex justify-between align-middle p-2 pl-3 border-b">
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.acaPic
                          ? `http://112.222.157.157:5233/pic/academy/${item.acaId}/${item.acaPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  <div>
                    <div className="flex mb-0.5">
                      <span className="flex items-center pl-1.5 pr-1.5 text-[12px] bg-[#F28C6A] rounded-md text-white">
                        승인대기
                      </span>
                    </div>
                    {item?.acaName}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center text-center min-w-32">
                {item.createdAt.substr(0, 10)}
              </div>
              <div className="flex items-center justify-center text-center min-w-32">
                {item.acaPhone}
              </div>
              <div className="flex items-center justify-center text-center min-w-40">
                {item.address}
              </div>
              <div className="flex items-center justify-center min-w-28">
                {item.name}
              </div>
              <div className="flex items-center justify-center min-w-24">
                <select
                  className="p-1 border rounded-lg"
                  onChange={e =>
                    AcademyArrowChange(parseInt(e.target.value), item.acaId)
                  }
                >
                  <option value={0}>승인대기</option>
                  <option value={1}>승인완료</option>
                  {/* <option value="2">승인거부</option> */}
                </select>
              </div>
              <div className="flex gap-4 items-center justify-center min-w-16">
                <button
                  //onClick={e => DeleteAcademy(item.acaId)}
                  onClick={() => handleAcademyDelete(item.acaId, item.userId)}
                >
                  <FaRegTrashAlt className="w-3 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination defaultCurrent={1} total={10} showSizeChanger={false} />
        </div>
      </div>

      {isModalVisible2 && (
        <CustomModal
          visible={isModalVisible2}
          title={"승인 처리"}
          content={`선택하신 학원을 승인 처리하시겠습니까?`}
          onButton1Click={handleButton1Click2}
          onButton2Click={handleButton2Click2}
          button1Text={"취소"}
          button2Text={"승인"}
          modalWidth={400}
        />
      )}

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
