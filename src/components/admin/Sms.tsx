// import { Input } from "antd";
// const { TextArea } = Input;

const Sms = () => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [from, setFrom] = useState("");
  // const [text, setText] = useState("");
  // const [error, setError] = useState("");
  // const validateForm = () => {
  //   if (!from.trim()) {
  //     setError("발신번호를 입력해주세요.");
  //     return false;
  //   }
  //   if (!text.trim()) {
  //     setError("메시지 내용을 입력해주세요.");
  //     return false;
  //   }
  //   if (text.length > 90) {
  //     setError("메시지는 90자를 초과할 수 없습니다.");
  //     return false;
  //   }
  //   return true;
  // };
  // const smskey = async () => {
  //   const response = await jwtAxios.get("/api/sms/key");
  //   console.log(response);
  // };
  // const handleSendMessage = async () => {
  //   if (!validateForm()) return;
  //   try {
  //     const response = await jwtAxios.get("/api/sms/key");
  //     const messageService = new SolapiMessageService(
  //       response.data.resultData.apiKey,
  //       response.data.resultData.apiSecret,
  //     );
  //     await messageService.send({
  //       to: "01042743370",
  //       from: from,
  //       text: text,
  //     });
  //     alert("메시지가 성공적으로 전송되었습니다.");
  //     setIsModalOpen(false);
  //     setFrom("");
  //     setText("");
  //     setError("");
  //   } catch (error) {
  //     console.error("메시지 전송 실패:", error);
  //     setError("메시지 전송에 실패했습니다.");
  //   }
  // };
  // const MessageModalContent = (
  //   <div className="flex flex-col gap-4">
  //     {error && <p className="text-red-500 text-sm">{error}</p>}
  //     <div className="flex flex-col gap-2">
  //       <label className="text-sm font-medium">발신번호</label>
  //       <Input
  //         value={from}
  //         onChange={e => setFrom(e.target.value)}
  //         placeholder="발신번호를 입력하세요"
  //         maxLength={11}
  //       />
  //     </div>
  //     <div className="flex flex-col gap-2">
  //       <label className="text-sm font-medium">메시지 내용</label>
  //       <TextArea
  //         value={text}
  //         onChange={e => setText(e.target.value)}
  //         placeholder="메시지 내용을 입력하세요 (최대 90자)"
  //         maxLength={90}
  //         rows={4}
  //       />
  //       <p className="text-right text-sm text-gray-500">{text.length}/90자</p>
  //     </div>
  //     <div className="flex flex-col gap-2">
  //       <label className="text-sm font-medium">수신번호</label>
  //       <Input value={to} disabled />
  //     </div>
  //   </div>
  // );
  // return (
  //   <>
  //     <button
  //       onClick={() => setIsModalOpen(true)}
  //       className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //     >
  //       문자 보내기
  //     </button>
  //     <CustomModal
  //       visible={isModalOpen}
  //       title="문자메시지 전송"
  //       content={MessageModalContent}
  //       onButton1Click={() => {
  //         setIsModalOpen(false);
  //         setError("");
  //         setFrom("");
  //         setText("");
  //       }}
  //       onButton2Click={handleSendMessage}
  //       button1Text="취소"
  //       button2Text="전송"
  //       modalWidth={500}
  //     />
  //   </>
  // );
};

export default Sms;
