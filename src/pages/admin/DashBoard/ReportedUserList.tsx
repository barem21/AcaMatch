interface ReportedUser {
  email: string;
  name: string;
  reportsType: string;
  processingStatus: number;
  reportCount: number;
}

interface ReportedUserListProps {
  reportedUsers: ReportedUser[];
}

const ReportedUserList = ({ reportedUsers }: ReportedUserListProps) => {
  // 처리상태를 문자열로 변환하는 함수
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "처리 대기";
      case 1:
        return "처리 완료";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="w-full border rounded-[4px] h-fit">
      <span className="flex p-4 items-center w-full h-[47px] text-[#303E67] border-b">
        신고된 유저 목록
      </span>
      <ul className="flex mx-auto w-full h-[30px] bg-[#F1F5FA] border-b">
        <li className="flex justify-center items-center w-[40%] text-[#303E67]">
          유저정보
        </li>
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          신고 유형
        </li>
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          신고 횟수
        </li>
        <li className="flex justify-center items-center w-[20%] text-[#303E67]">
          처리상태
        </li>
      </ul>
      <div className="overflow-hidden">
        {reportedUsers.slice(0, 5).map((user, index, array) => (
          <ul
            key={index}
            className={`flex mx-auto w-full h-[30px] ${
              index !== array.length - 1 ? "border-b" : ""
            }`}
          >
            <li className="flex justify-center items-center w-[40%] text-[#242424]">
              <div className="flex items-center text-[12px]">
                <span className="text-[14px]">{user.name}</span>
                <span className="text-[12px] text-gray-500">
                  ({user.email})
                </span>
              </div>
            </li>
            <li className="flex justify-center items-center w-[20%] text-[#242424] text-[14px]">
              {user.reportsType}
            </li>
            <li className="flex justify-center items-center w-[20%] text-[#242424] text-[14px]">
              {user.reportCount}
            </li>
            <li className="flex justify-center items-center w-[20%] text-[#242424]">
              <span
                className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center ${
                  user.processingStatus === 1 ? "bg-[#90b1c4]" : "bg-[#f8a57d]"
                }`}
              >
                {getStatusText(user.processingStatus)}
              </span>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default ReportedUserList;
