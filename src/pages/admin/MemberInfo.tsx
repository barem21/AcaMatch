import { Form, Button, Input, message, Upload, Image } from "antd";
import styled from "@emotion/styled";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import jwtAxios from "../../apis/jwt";
import CustomModal from "../../components/modal/Modal";
import { useNavigate } from "react-router-dom";

const UserInfo = styled.div`
  .ant-form-item-label {
    display: flex;
    justify-content: flex-start;
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
    label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 130px !important;
    }
    label span {
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
      border-radius: 4px;
    }

    span.readonly {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0px 11px;
      border-radius: 4px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 0.9rem;
    }
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
  .modal-popup-wrap button {
    display: none;
  }
  .btn-wrap button {
    display: block;
  }
  .btn-wrap .ant-form-item {
    margin-bottom: 0px;
  }
`;

function MemberInfo(): JSX.Element {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nickNameCheck, setNickNameCheck] = useState(0);
  const [editMember, setEditMember] = useState({});
  const navigate = useNavigate();

  //회원정보 조회
  const memberInfo = async () => {
    try {
      const res = await jwtAxios.get(`/api/user`);
      setEditMember(res.data.resultData);
      //console.log("res.data.resultData : ", res.data.resultData);

      // 데이터를 받아온 즉시 form 값 설정
      form.setFieldsValue({
        user_id: res.data.resultData.email,
        name: res.data.resultData.name,
        nick_name: res.data.resultData.nickName,
        phone: res.data.resultData.phone,
        birth: res.data.resultData.birth,
        pic: res.data.resultData.userPic,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 비밀번호와 비밀번호 확인이 일치하는지 검사하는 커스텀 유효성 검사 함수
  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("newPw"); // 'password' 필드의 값 가져오기
    if (value && value !== password) {
      return Promise.reject(new Error("비밀번호가 일치하지 않습니다."));
    }
    return Promise.resolve();
  };

  useEffect(() => {
    memberInfo();
  }, []);

  useEffect(() => {
    if (
      editMember?.userPic &&
      editMember.userPic !== "null" &&
      editMember.userPic !== ""
    ) {
      setFileList([
        {
          uid: "1",
          name: editMember.userPic,
          status: "done",
          url: `http://112.222.157.157:5223/pic/user/${editMember.userId}/${editMember.userPic}`,
        },
      ]);
    }
  }, [editMember, form]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [phoneNumber, _setPhoneNumber] = useState("");
  const [fileList, setFileList] = useState([]);

  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];

    // maxCount로 인해 하나의 파일만 유지
    newFileList = newFileList.slice(-1);

    //console.log("newFileList : ", newFileList);

    // 파일 상태 업데이트
    setFileList(newFileList);

    // 선택된 파일이 있으면 콘솔에 출력
    if (info.file.status === "done" && info.file.originFileObj) {
      console.log("파일 선택됨:", info.file.originFileObj);
      form.setFieldValue("pic", info.file.originFileObj);
    }
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  const onFinished = async (values: any) => {
    if (nickNameCheck === 2) {
      setIsModalVisible(true);
      //console.log("닉네임 확인이 필요합니다.");
      return;
    }

    try {
      const formData = new FormData();

      // 전송할 데이터 객체 생성
      const sendData = {
        name: values.name,
        phone: values.phone,
        currentPw: values.currentPw,
        newPw: values.newPw,
        birth: values.birth,
        nickName: values.nickName,
      };

      // Blob 형식으로 데이터 추가
      formData.append(
        "req",
        new Blob([JSON.stringify(sendData)], { type: "application/json" }),
      );

      // pic이 있는 경우에만 추가
      if (values.pic) {
        formData.append("pic", values.pic);
      }

      const response = await jwtAxios.put("/api/user", formData, {
        headers: {
          Accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.resultData) {
        message.success("회원정보가 수정되었습니다.");
        console.log("response : ", response);
      }
    } catch (error) {
      console.error("Update failed:", error);
      message.error("회원정보 수정에 실패했습니다.");
    }
  };

  //닉네임 중복확인
  const sameCheck = async (nickName: string) => {
    if (!nickName) {
      setIsModalVisible(true);
      setNickNameCheck(3);
      return;
    }

    try {
      const res = await axios.get(
        `/api/user/check-duplicate/nick-name?text=${nickName}`,
      );

      if (res.data.resultData === 1) {
        setIsModalVisible(true);
        setNickNameCheck(res.data.resultData);
      } else {
        setIsModalVisible(true);
        setNickNameCheck(0);
      }
    } catch (error) {
      setIsModalVisible(true);
      setNickNameCheck(0);
      console.log(error);
    }
  };

  //휴대폰 번호 구분기호 자동입력
  const handlePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // 숫자만 남기기

    if (value.length <= 3) {
      form.setFieldsValue({ phone: value.replace(/(\d{1,3})/, "$1") }); //첫 3자리
    } else if (value.length <= 7) {
      form.setFieldsValue({
        phone: value.replace(/(\d{3})(\d{1,4})/, "$1-$2"),
      }); //4~7자리
    } else {
      form.setFieldsValue({
        phone: value.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3"),
      }); //8자리 이상
    }
  };

  return (
    <UserInfo className="flex gap-5 w-full justify-center align-top">
      <div className="w-full mb-20">
        <h1 className="title-admin-font">
          회원 관리
          <p>회원 관리 &gt; 회원정보 수정</p>
        </h1>

        <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
          <Form form={form} onFinish={values => onFinished(values)}>
            <Form.Item
              name="user_id"
              label="이메일"
              rules={[{ required: true, message: "이메일을 입력해 주세요." }]}
            >
              <Input
                type="text"
                className="input-admin-basic readonly"
                readOnly
              />
            </Form.Item>

            <Form.Item
              name="currentPw"
              label={"현재 비밀번호"}
              rules={[
                { required: true, message: "비밀번호를 입력해 주세요." },
                // {
                //   pattern:
                //     /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                //   message:
                //     "비밀번호는 영어/숫자/특수문자 포함 8자리 이상으로 입력해 주세요.",
                // },
              ]}
            >
              <Input.Password
                className="input-admin-basic"
                id="newPw"
                maxLength={20}
                placeholder="비밀번호를 입력해 주세요."
              />
            </Form.Item>

            <Form.Item
              name="newPw"
              label="신규 비밀번호"
              rules={[
                {
                  pattern:
                    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  message:
                    "비밀번호는 영어/숫자/특수문자 포함 8자리 이상으로 입력해 주세요.",
                },
              ]}
            >
              <Input.Password
                className="input-admin-basic"
                id="newPw"
                placeholder="신규 비밀번호를 입력해 주세요."
              />
            </Form.Item>

            <Form.Item
              // name="new_upw_check"
              label="신규 비밀번호 확인"
              rules={[
                { validator: validateConfirmPassword }, // 커스텀 검증 함수
              ]}
            >
              <Input.Password
                className="input-admin-basic"
                id="new_upw_check"
                placeholder="신규 비밀번호를 다시 입력해 주세요."
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="이름"
              rules={[{ required: true, message: "이름을 입력해 주세요." }]}
            >
              <Input
                type="text"
                className="input-admin-basic readonly"
                readOnly
              />
            </Form.Item>

            <div className="flex gap-3 w-full">
              <Form.Item
                name="nickName"
                label="닉네임"
                className="w-full"
                rules={[{ required: true, message: "닉네임을 입력해 주세요." }]}
              >
                <Input
                  className="input-admin-basic"
                  id="nick_name"
                  maxLength={20}
                  placeholder="닉네임을 입력해 주세요."
                  onChange={() => setNickNameCheck(2)}
                />
              </Form.Item>

              <Form.Item>
                <button
                  type="button"
                  className="min-w-[84px] h-8 bg-[#E8EEF3] rounded-md text-sm"
                  onClick={() => sameCheck(form.getFieldValue("nickName"))}
                >
                  중복확인
                </button>
              </Form.Item>
            </div>

            <Form.Item
              name="phone"
              label="휴대폰 번호"
              rules={[
                { required: true, message: "휴대폰 번호를 입력해 주세요." },
              ]}
            >
              <Input
                className="input-admin-basic"
                id="phone"
                value={phoneNumber}
                maxLength={13}
                onChange={e => handlePhoneNumber(e)}
                placeholder="휴대폰 번호를 입력해 주세요."
              />
            </Form.Item>

            <Form.Item name="birth" label="생년월일">
              <span className="readonly w-full">{editMember.birth}</span>
            </Form.Item>

            <Form.Item name="pic" label="프로필 이미지">
              <Upload
                // action="/upload.do"
                listType="picture-card"
                maxCount={1}
                showUploadList={{ showPreviewIcon: false }}
                fileList={fileList}
                onChange={handleChange}
                customRequest={({ onSuccess }) => {
                  // 자동 업로드 방지
                  setTimeout(() => {
                    onSuccess?.("ok");
                  }, 0);
                }}
              >
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>

              {previewImage && (
                <Image
                  wrapperStyle={{ display: "none" }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: visible => setPreviewOpen(visible),
                    afterOpenChange: visible => !visible && setPreviewImage(""),
                  }}
                  src={previewImage}
                />
              )}
            </Form.Item>

            <div className="flex justify-end pt-3 border-t gap-3">
              <button
                type="button"
                className="btn-admin-cancel"
                onClick={() => navigate(-1)}
              >
                취소하기
              </button>
              <Form.Item>
                <Button htmlType="submit" className="btn-admin-ok">
                  회원정보 수정
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"닉네임 중복체크"}
        content={
          <div>
            {nickNameCheck === 1
              ? "사용가능한 닉네임입니다."
              : nickNameCheck === 2
                ? "닉네임 중복확인해 주세요."
                : nickNameCheck === 3
                  ? "닉네임을 입력해 주세요."
                  : "닉네임이 중복되었습니다."}
            <div className="w-full mt-5 btn-wrap">
              <button
                className="w-full h-14 text-sm font-bold border rounded-xl bg-[#E8EEF3]"
                onClick={() => handleButton1Click()}
              >
                확인
              </button>
            </div>
          </div>
        }
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text={"취소"}
        button2Text={"확인"}
        modalWidth={400}
      />
    </UserInfo>
  );
}

export default MemberInfo;
