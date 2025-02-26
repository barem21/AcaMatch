import React, { useEffect, useRef, useState } from "react";
import SideBar from "../components/SideBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VscSend } from "react-icons/vsc";
import styled from "@emotion/styled";
import jwtAxios from "../apis/jwt";
import { useRecoilValue } from "recoil";
import userInfo from "../atoms/userInfo";
import { Button, Form } from "antd";
import axios from "axios";

/* 채팅관련 */
import SockJS from "sockjs-client";
import Stomp from "stompjs";
/* 채팅관련 */

function InquiryDetail() {
  /* 채팅관련 */
  const [stompClient, setStompClient] = useState(null);
  //const [messages, setMessages] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(0);
  const [senderType, setSenderType] = useState("USER_TO_ACADEMY");
  const [messageInput, setMessageInput] = useState("");
  /* 채팅관련 */

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [academyName, setAcademyName] = useState();
  const { userId, roleId } = useRecoilValue(userInfo); // Recoil에서 userId 가져오기
  const [searchParams, setSearchParams] = useSearchParams();
  const acaId = searchParams.get("acaId");
  //const userId = searchParams.get("userId");

  const scrollRef = useRef(null); //scroll을 내릴 div

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

  //채팅방 개설
  const makeChat = async () => {
    try {
      const res = await jwtAxios.get(
        `/api/chat?aca-id=${acaId}&user-id=${userId}`,
      );
      setChatRoomId(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //학원정보 가져오기
  const academyGetInfo = async () => {
    try {
      const res = await axios.get(`/api/academy/academyDetail/${acaId}`);
      setAcademyName(res.data.resultData.acaName);
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //1:1 문의 내용 호출
  const myMtomDetail = async () => {
    try {
      const res = await jwtAxios.get(`/api/chat/${chatRoomId}`);
      console.log(res.data.resultData);
      form.resetFields(); //초기화
      setChatMessages(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    myMtomDetail();
    makeChat(); //채팅방 개설 실행
  }, []);

  useEffect(() => {
    academyGetInfo();
  }, []);

  useEffect(() => {
    document.querySelector("#chat-list-wrap").scrollTo(0, 1500);
  }, [chatMessages]);

  /* 채팅관련 */
  useEffect(() => {
    const socket = new SockJS("http://acamatch.site:5233/ws");
    const client = Stomp.over(socket);

    client.connect({}, frame => {
      console.log("Connected: " + frame);

      // 기존 구독 해제
      if (stompClient !== null) {
        stompClient.disconnect();
      }

      // 새로운 채팅방 ID로 구독 설정
      const subscription = client.subscribe(
        `/queue/${chatRoomId}`,
        response => {
          const message = JSON.parse(response.body);

          /*
          setMessages(prevMessages => [
            ...prevMessages,
            `${message.senderType}: ${message.message}`,
          ]);
          */

          myMtomDetail(); //대화목록 갱신
        },
      );

      setStompClient(client);
      //console.log(`Subscribed to /queue/${chatRoomId}`);
    });

    // 컴포넌트가 언마운트 될 때 WebSocket 연결 종료
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [chatRoomId]); // chatRoomId가 변경될 때마다 연결을 새로 설정

  // 메시지 전송 함수
  const sendMessage = () => {
    if (!chatRoomId || !messageInput.trim()) {
      alert("채팅방 ID와 메시지를 입력하세요!");
      return;
    }

    const messagePayload = {
      chatRoomId: parseInt(chatRoomId, 10),
      senderType: senderType,
      message: messageInput.trim(),
    };

    if (stompClient) {
      stompClient.send("/app/send", {}, JSON.stringify(messagePayload));
    }

    // 메시지 입력창 초기화
    setMessageInput("");
  };
  /* 채팅관련 */

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      {/* 채팅관련 */}
      <div style={{ background: "#eee" }}>
        <p>채팅방 ID : {chatRoomId}</p>
        <p>
          <label>보내는 유형:</label>
          {roleId === 3 ? (
            <input type="text" value="ACADEMY_TO_USER" />
          ) : (
            <input type="text" value="USER_TO_ACADEMY" />
          )}
        </p>

        <input
          type="text"
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          placeholder="메시지 입력"
        />
        <button onClick={sendMessage}>Send</button>

        {/*
        <div id="messages">
          {messages.map((message, index) => (
            <p key={index}>
              <b>{message}</b>
            </p>
          ))}
        </div>
        */}
      </div>
      {/* 채팅관련 */}

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
            <CustomScrollbar
              style={{ height: "calc(100vh - 405px)" }}
              id="chat-list-wrap"
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages?.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.senderType === "USER_TO_ACADEMY" ? (roleId === 3 ? "gap-2" : "justify-end") : roleId === 3 ? "justify-end" : "gap-2"}`}
                  >
                    {/* 학원 프로필 이미지 (사용자가 아닐 때만 표시) */}
                    {!chat.senderType === "ACADEMY_TO_USER" && (
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
                        chat.senderType === "USER_TO_ACADEMY"
                          ? roleId === 3
                            ? "bg-white text-block"
                            : "text-white"
                          : roleId === 3
                            ? "text-white"
                            : "bg-white text-block"
                      } rounded-lg p-3 max-w-[70%]`}
                      style={
                        chat.senderType === "USER_TO_ACADEMY"
                          ? roleId === 3
                            ? {}
                            : {
                                background:
                                  "linear-gradient(45deg, #3B77D8 0%, #4B89DC 50%, #69A7E4 100%)",
                              }
                          : roleId === 3
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
                        message: "보내실 메시지를 입력해 주세요.",
                      },
                      {
                        pattern: /^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s=,\-@]*$/, // 알파벳, 숫자, 한글, 공백만 허용
                        message: "특수문자는 사용하실 수 없습니다.",
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
