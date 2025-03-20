import styled from "@emotion/styled";
import {
  DatePicker,
  Button,
  Checkbox,
  Form,
  Input,
  TimePicker,
  message,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import jwtAxios from "../../../apis/jwt";
import CustomModal from "../../../components/modal/Modal";
import { Cookies } from "react-cookie";
const { RangePicker } = DatePicker;

const AcademyInfo = styled.div`
  .ant-form-item-label {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .ant-form-item-label label {
    min-width: 130px !important;
  }
  .ant-form-item-required::before {
    content: "" !important;
    margin-inline-end: 0px !important;
  }
  .ant-form-item-required::after {
    content: "*" !important;
    font-size: 1.25rem;
    color: #ff3300;
  }
  .ant-form-item-label label::after {
    content: "";
  }

  .ant-form-item-control-input-content {
    .input-wrap {
      display: flex;
      justify-content: flex-start;
      gap: 15px;
      align-items: center;
    }
    .flex-start {
      align-items: flex-start;
    }
    .ant-form-item-label label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 130px !important;
    }
    .ant-form-item-label label span {
      height: 24px;
      margin-left: 5px;
      color: #ff3300;
      font-size: 1.25rem;
    }
    input {
      height: 32px;
    }
    textarea {
      padding: 15px 12px;
    }

    .input,
    .ant-input-password {
      border-radius: 12px;
    }

    span.readonly {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0px 11px;
      border-radius: 12px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 0.9rem;
    }
  }
  .ant-checkbox-wrapper {
    margin-right: 25px;
  }
  .ant-input-affix-wrapper,
  .ant-picker {
    padding: 0px 11px;
  }
  .ant-input-status-error {
    border: 1px solid #3b77d8 !important;
  }
  .ant-form-item-explain-error {
    padding-left: 12px;
    color: #3b77d8;
    font-size: 0.85rem;
  }
  .ant-upload-list-item {
    border: 1px solid #3b77d8 !important;
  }
`;

function AcademyClassEdit() {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const currentUserInfo = useRecoilValue(userInfo);
  const navigate = useNavigate();
  const [resultMessage, setResultMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchParams] = useSearchParams();

  const acaId = parseInt(searchParams.get("acaId") || "", 0);
  const classId = parseInt(searchParams.get("classId") || "", 0);

  const handleButton1Click = () => {
    setIsModalVisible(false);
    navigate(`../academy/class?acaId=${acaId}`);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
    navigate(`../class?acaId=${acaId}`);
  };

  const initialValues = {
    acaId: "",
    classId: "",
    className: "",
    classComment: "",
    startDate: "",
    endDate: "",
    startTime: dayjs("10:00", "HH:mm"),
    endTime: dayjs("20:00", "HH:mm"),
    price: "",
  };

  //강좌정보 가져오기
  const academyGetInfo = async () => {
    try {
      const res = await jwtAxios.get(`/api/acaClass/detail?acaId=${acaId}`);
      for (let i = 0; i < res.data.resultData.length; i++) {
        if (res.data.resultData[i].classId === classId) {
          // console.log(res.data.resultData[i]);

          // 데이터를 받아온 즉시 form 값 설정
          form.setFieldsValue({
            //acaId: res.data.resultData[i].acaId,
            //classId: res.data.resultData[i].classId,
            className: res.data.resultData[i].className,
            classComment: res.data.resultData[i].classComment,
            classDate: [
              dayjs(res.data.resultData[i].startDate, "YYYY-MM-DD"),
              dayjs(res.data.resultData[i].endDate, "YYYY-MM-DD"),
            ],
            startTime: dayjs(
              res.data.resultData[i].startTime.substr(0, 5),
              "HH:mm",
            ),
            endTime: dayjs(
              res.data.resultData[i].endTime.substr(0, 5),
              "HH:mm",
            ),
            price: res.data.resultData[i].price,
            day: res.data.resultData[i].day,
            yearsAndLevel: res.data.resultData[i].yearsAndLevel,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onFinished = async (values: any) => {
    //console.log(values);

    const startDate = dayjs(values.classDate[0].$d).format("YYYY-MM-DD");
    const endDate = dayjs(values.classDate[1].$d).format("YYYY-MM-DD");
    const startTimes = dayjs(values.startTime.$d).format("HH:mm");
    const endTimes = dayjs(values.endTime.$d).format("HH:mm");

    const datas = {
      acaId: acaId,
      classId: classId,
      className: values.className,
      classComment: values.classComment,
      startDate: startDate,
      endDate: endDate,
      startTime: startTimes,
      endTime: endTimes,
      price: values.price,
    };

    try {
      const res = await jwtAxios.put("/api/acaClass", datas);
      //console.log(res.data.resultData);

      if (res.data.resultData === 1) {
        //alert("강좌 수정 완료");
        setResultMessage("강좌 수정이 완료되었습니다.");
        setIsModalVisible(true);
      } else {
        setResultMessage("강좌 수정이 실패되었습니다. 다시 시도해 주세요.");
        setIsModalVisible(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    academyGetInfo();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <AcademyInfo className="w-full  pb-12">
      <div className="flex gap-5 w-full justify-center align-top">
        <div className="w-full">
          <h1 className="title-admin-font">
            강의 수정
            <p>학원관리 &gt; 강의 관리 &gt; 강의 등록/수정</p>
          </h1>

          <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
            <Form
              form={form}
              onFinish={values => onFinished(values)}
              initialValues={initialValues}
            >
              <Form.Item
                name="className"
                label="강좌 이름"
                rules={[
                  { required: true, message: "강좌 이름을 입력해 주세요." },
                ]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="강좌 이름을 입력해 주세요."
                />
              </Form.Item>

              <Form.Item
                name="classDate"
                label="강좌 기간"
                rules={[
                  { required: true, message: "강좌 기간을 입력해 주세요." },
                ]}
              >
                <RangePicker placeholder={["강좌 시작일", "강좌 종료일"]} />
              </Form.Item>

              <Form.Item
                name="classComment"
                label="강좌 소개글"
                className="h-44"
                rules={[
                  { required: true, message: "강좌 소개글을 입력해 주세요." },
                ]}
              >
                <ReactQuill
                  placeholder="소개글을 작성해 주세요."
                  className="h-32"
                />
              </Form.Item>
              <div className="flex gap-3">
                <Form.Item
                  name="startTime"
                  label="강좌 시간"
                  rules={[
                    { required: true, message: "시작 시간을 선택해 주세요." },
                  ]}
                >
                  <TimePicker
                    placeholder="강좌 시작 시간"
                    className="input-admin-basic"
                    format="HH:mm"
                  />
                </Form.Item>
                <Form.Item
                  name="endTime"
                  label=""
                  rules={[
                    { required: true, message: "종료 시간을 선택해 주세요." },
                  ]}
                >
                  <TimePicker
                    placeholder="강좌 종료 시간"
                    className="input-admin-basic w-full"
                    format="HH:mm"
                  />
                </Form.Item>
              </div>
              <Form.Item name="classAge" label="수강 연령대">
                <Checkbox>성인</Checkbox>
                <Checkbox>청소년</Checkbox>
                <Checkbox>초등학생</Checkbox>
                <Checkbox>유아</Checkbox>
                <Checkbox>기타</Checkbox>
              </Form.Item>

              <Form.Item label="수준" name="classLevel" valuePropName="checked">
                <Checkbox>전문가</Checkbox>
                <Checkbox>상급</Checkbox>
                <Checkbox>중급</Checkbox>
                <Checkbox>초급</Checkbox>
                <Checkbox>입문자</Checkbox>
              </Form.Item>

              <Form.Item
                name="price"
                label="가격"
                rules={[{ required: true, message: "가격을 입력해 주세요." }]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="가격을 입력해 주세요."
                />
              </Form.Item>

              <div className="flex justify-end pt-3 border-t gap-3">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => navigate(-1)}
                >
                  취소하기
                </button>

                <Form.Item className="mb-0">
                  <Button htmlType="submit" className="btn-admin-ok">
                    수정하기
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </div>

          {resultMessage && (
            <CustomModal
              visible={isModalVisible}
              title={"수업수정 완료"}
              content={resultMessage}
              onButton1Click={handleButton1Click}
              onButton2Click={handleButton2Click}
              button1Text={"닫기"}
              button2Text={"확인"}
              modalWidth={400}
            />
          )}
        </div>
      </div>
    </AcademyInfo>
  );
}

export default AcademyClassEdit;
