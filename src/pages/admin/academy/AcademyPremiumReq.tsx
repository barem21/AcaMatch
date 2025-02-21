import styled from "@emotion/styled";
import { Button, Form, Input, Select } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

function AcademyPremiumReq(): JSX.Element {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinished = (values: any) => {
    console.log(values);
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
      acaId: 1,
      set_date: formatDate(nextMonthStart) + " ~ " + formatDate(nextMonthEnd),
      price: 125000,
    });
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
                  className="select-admin-basic"
                  placeholder="학원을 선택해 주세요."
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    { value: 1, label: "대구 ABC상아탑 학원" },
                    { value: 2, label: "서울 ABC상아탑 학원" },
                    { value: 3, label: "부산 ABC상아탑 학원" },
                  ]}
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

                <button type="button" className="btn-admin-cancel">
                  프리미엄 학원 신청이 마감되었습니다.
                </button>

                <button type="button" className="btn-admin-ok">
                  프리미엄 학원 신청 심사중입니다.
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </AcademyInfo>
  );
}

export default AcademyPremiumReq;
