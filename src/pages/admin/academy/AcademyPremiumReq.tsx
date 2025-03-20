import styled from "@emotion/styled";
import { Button, Form, Input, message, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import axios from "axios";
import { Cookies } from "react-cookie";

const AcademyInfo = styled.div`
  .ant-form-item-label {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .ant-form-item-label label {
    min-width: 130px !important;
    color: #676d9c;
    font-size: 13px;
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

interface myAcademyListType {
  acaId: number;
  acaName: string;
}

function AcademyPremiumReq(): JSX.Element {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId, roleId } = useRecoilValue(userInfo);
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]);
  const [premiumAcademyCount, setPremiumAcademyCount] = useState(0);

  //전체학원 목록
  const academyList = async () => {
    try {
      if (roleId === 0) {
        //전체 관리자일 때
        const res = await axios.get(`/api/menuOut/academy`);
        setMyAcademyList(res.data.resultData);
        //console.log("admin : ", res.data.resultData);
      } else {
        const res = await axios.get(
          `/api/academy/premium/notPremium?userId=${userId}`,
        );
        setMyAcademyList(res.data.resultData);
        //console.log("academy : ", res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // acaId와 acaName만 남기기
  const simplifiedData = myAcademyList.map(
    ({ acaId: value, acaName: label }) => ({
      value,
      label,
    }),
  );
  //console.log(simplifiedData);

  //프리미엄 학원 갯수 확인
  const premiumAcadenyCount = async () => {
    try {
      const res = await axios.get(`/api/academy/premium?page=1&size=10`);
      // console.log(res.data.resultData);
      const filteredData = res.data.resultData.filter(
        (item: any) => item.preCheck === 1,
      );
      setPremiumAcademyCount(filteredData.length);
    } catch (error) {
      console.log(error);
    }
  };

  const onFinished = async (values: any) => {
    // console.log(values);

    if (!values.acaId) {
      message.error("프리미엄 신청할 학원을 선택해 주세요.");
      return;
    }

    try {
      const response = await axios.post("/api/payment/ready", {
        products: [
          {
            productId: 1,
            quantity: 1,
          },
        ],
        acaId: values.acaId,
        userId: userId,
      });

      if (response.data.resultData.next_redirect_pc_url) {
        // tid를 localStorage에 저장
        localStorage.setItem("paymentTid", response.data.resultData.tid);

        // 결제창 열기
        window.open(
          response.data.resultData.next_redirect_pc_url,
          "KakaoPayment",
          "width=800,height=800",
        );
      } else {
        message.error("결제 페이지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error during payment preparation:", error);
      message.error("결제 준비 중 오류가 발생했습니다.");
    }
  };

  //다음달 정보 구하기
  const currentDate = new Date();
  // 1. 다음 달 시작일
  const nextMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1,
  );
  // 2. 다음 달 말일
  const nextMonthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 2,
    0,
  );

  function formatDate(date: any): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1 해줍니다.
    const day = String(date.getDate()).padStart(2, "0"); // 날짜를 두 자릿수로 맞춥니다.
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      acaId: null,
      set_date: formatDate(nextMonthStart) + " ~ " + formatDate(nextMonthEnd),
      price: 165000,
    });

    academyList(); //학원 목록
    premiumAcadenyCount(); //프리미엄 학원 갯수 확인
  }, []);

  // 결제 완료 후 처리를 위한 useEffect 추가
  useEffect(() => {
    // URL에서 pg_token 확인
    const urlParams = new URLSearchParams(window.location.search);
    const pgToken = urlParams.get("pg_token");

    if (pgToken) {
      const tid = localStorage.getItem("paymentTid");

      // 결제 완료 처리
      const completePayment = async () => {
        try {
          await axios.post("/api/payment/success", {
            pg_token: pgToken,
            tid: tid,
          });

          message.success("결제가 완료되었습니다.");
          localStorage.removeItem("paymentTid"); // tid 삭제
          // 필요한 경우 페이지 리디렉션
        } catch (error) {
          console.error("Error during payment completion:", error);
          message.error("결제 완료 처리 중 오류가 발생했습니다.");
        }
      };

      if (tid) {
        completePayment();
      }
    }
  }, []);

  useEffect(() => {
    if (!cookies.get("accessToken") || roleId === 1) {
      navigate("-");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <AcademyInfo className="w-full">
      <div className="flex gap-5 w-full justify-center pb-10">
        <div className="w-full">
          <h1 className="title-admin-font">
            프리미엄 학원 관리
            <p>학원관리 &gt; 프리미엄 학원 관리</p>
          </h1>

          <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
            <Form form={form} onFinish={values => onFinished(values)}>
              <Form.Item
                name="acaId"
                label="학원명"
                rules={[{ required: true, message: "학원을 선택해 주세요." }]}
              >
                <Select
                  showSearch
                  className="select-admin-basic"
                  placeholder="학원을 선택해 주세요."
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={simplifiedData}
                />
              </Form.Item>

              <Form.Item
                name="set_date"
                label="프리미엄 적용 기간"
                rules={[
                  {
                    required: true,
                    message: "프리미엄 적용기간을 입력해 주세요.",
                  },
                ]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="프리미엄 적용기간을 입력해 주세요."
                  readOnly
                />
              </Form.Item>

              <Form.Item
                name="price"
                label="결제금액"
                rules={[
                  { required: true, message: "결제금액을 입력해 주세요." },
                ]}
              >
                <Input
                  type="text"
                  className="input-admin-basic"
                  placeholder="결제금액을 입력해 주세요."
                  readOnly
                />
              </Form.Item>

              <div className="pt-4 pb-4 border-t">
                <h4 className="text-[12px]">※ 프리미엄 학원 정책 안내</h4>
                <ul>
                  <li className="pl-2 text-[12px] text-gray-500">
                    · 프리미엄 학원을 신청하시면 적용기간동안 주요부분에서 배너
                    광고가 진행되며, 학원 검색 상단에 학원 정보가 우선
                    출력됩니다.
                  </li>
                  <li className="pl-2 text-[12px] text-gray-500">
                    · 프리미엄 신청은 관리자에 의해서 신청이 거부될 수 있으며,
                    거부시 결제금액은 환불처리 됩니다.
                  </li>
                </ul>
              </div>

              <div className="flex justify-end pt-3 border-t gap-3">
                {premiumAcademyCount < 5 ? (
                  <>
                    <button
                      type="button"
                      className="btn-admin-cancel"
                      onClick={() => navigate(-1)}
                    >
                      취소하기
                    </button>

                    <Form.Item className="mb-0">
                      <Button htmlType="submit" className="btn-admin-ok">
                        신청 및 결제하기
                      </Button>
                    </Form.Item>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-admin-cancel"
                    onClick={() => navigate(-1)}
                  >
                    프리미엄 학원 신청이 마감되었습니다.
                  </button>
                )}

                {/*
                <button type="button" className="btn-admin-ok">
                  프리미엄 학원 신청 심사중입니다.
                </button>
                */}
              </div>
            </Form>
          </div>
        </div>
      </div>
    </AcademyInfo>
  );
}

export default AcademyPremiumReq;
