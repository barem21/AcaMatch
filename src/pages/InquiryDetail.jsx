import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VscSend } from "react-icons/vsc";
import styled from "@emotion/styled";
import jwtAxios from "../apis/jwt";
import { useRecoilValue } from "recoil";
import userInfo from "../atoms/userInfo";
import { Button, Form } from "antd";

function InquiryDetail() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [academyName, setAcademyName] = useState();
  const { roleId } = useRecoilValue(userInfo); // Recoil에서 userId 가져오기
  const [searchParams, setSearchParams] = useSearchParams();
  const acaId = searchParams.get("acaId");
  const userId = searchParams.get("userId");

  const titleName = "고객지원";
  const menuItems = [
    { label: "FAQ", isActive: false, link: "/support" },
    { label: "1 : 1 문의", isActive: true, link: "/support/inquiry" },
  ];

  const SendMessage = styled.div`
    .ant-form-item-additional {
      margin-top: 10px;
    }
    .ant-form-item-explain-error {
      padding-left: 12px;
    }
    .ant-btn {
      border: none !important;
    }
  `;

  //1:1 문의 내용 호출
  const myMtomDetail = async () => {
    try {
      const res = await jwtAxios.get(
        `/api/chat/log?user-id=${userId}&aca-id=${acaId}`,
      );
      //console.log(res.data.resultData);
      setAcademyName(res.data.resultData[0].acaName);
      setChatMessages(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //1:1 문의 등록
  const onFinished = async values => {
    try {
      const res = await jwtAxios.post(
        `/api/chat?userId=${parseInt(userId)}&acaId=${parseInt(acaId)}&senderType=${roleId === 3 ? 1 : 0}&message=${values.message}`,
      );
      //console.log(res.data.resultData);
      if (res.data.resultData === 1) {
        myMtomDetail();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    myMtomDetail();
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />
      <div className="flex flex-col w-full mb-16">
        <h1 className="title-font">1:1 학원별 문의</h1>

        <div
          className="flex items-center w-full py-4 text-white rounded-t-[12px] relative"
          style={{
            background:
              "linear-gradient(45deg, #3B77D8 0%, #4B89DC 50%, #69A7E4 100%)",
          }}
        >
          <button
            className="flex ml-2 mr-2 absolute left-0"
            onClick={() => navigate(-1)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="flex mx-auto text-lg font-medium">
            {academyName ? academyName : "학원명"}
          </span>
        </div>
        <div
          className="flex flex-col bg-[#4B89DC] h-[80vh] rounded-[12px]"
          style={{ height: "calc(100vh - 300px)" }}
        >
          {/* 채팅 컨테이너 */}
          <div className="flex flex-col h-full bg-gray-200">
            {/* 메시지 영역 */}
            <CustomScrollbar>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages?.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.senderType === 0 ? "justify-end" : "gap-2"}`}
                  >
                    {/* 학원 프로필 이미지 (사용자가 아닐 때만 표시) */}
                    {!chat.senderType === 1 && (
                      <div
                        className="w-12 h-12 rounded-full bg-white flex-shrink-0 bg-cover bg-center border border-gray-200"
                        style={{
                          backgroundImage: `url('/default_academy.jpg')`,
                        }}
                      ></div>
                    )}

                    {/* 메시지 내용 */}
                    <div
                      className={`${
                        chat.senderType === 0
                          ? "text-white"
                          : "bg-white text-black"
                      } rounded-lg p-3 max-w-[70%]`}
                      style={
                        chat.senderType === 0
                          ? {
                              background:
                                "linear-gradient(45deg, #3B77D8 0%, #4B89DC 50%, #69A7E4 100%)",
                            }
                          : {}
                      }
                    >
                      {Array.isArray(chat.message) ? (
                        chat.message.map((msg, index) => (
                          <p key={index} className="mb-1 last:mb-0">
                            {msg}
                          </p>
                        ))
                      ) : (
                        <p>{chat.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CustomScrollbar>

            {/* 입력창 영역 - 하단 고정 */}
            <SendMessage className="p-4 bg-gray-200">
              <Form form={form} onFinish={values => onFinished(values)}>
                <div className="relative">
                  <Form.Item
                    name="message"
                    className="w-full"
                    rules={[
                      {
                        required: true,
                        message: "메시지 내용을 입력해 주세요.",
                      },
                    ]}
                  >
                    <input
                      maxLength={100}
                      placeholder="내용을 입력해 주세요."
                      className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
                    />
                  </Form.Item>
                  <Form.Item className="absolute right-[10px] top-[9px]">
                    <Button htmlType="submit">
                      <VscSend size={24} />
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </SendMessage>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InquiryDetail;

const CustomScrollbar = styled.div`
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 10px; /* 세로 스크롤바의 너비 */
  }

  &::-webkit-scrollbar-track {
    /* background: #f1f1f1;  */
    background: none;
    border-radius: 10px; /* 스크롤바 트랙의 둥근 모서리 */
  }

  &::-webkit-scrollbar-thumb {
    background: #bbb; /* 스크롤바 핸들의 색 */
    border-radius: 10px; /* 핸들의 둥근 모서리 */
    /* border: 3px solid #888; */
  }
`;
