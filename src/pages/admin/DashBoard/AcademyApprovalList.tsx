import { useNavigate } from "react-router-dom";

interface UserApproval {
  name: string;
  userPic?: string;
  email: string;
  registrationDate: string;
  acaName: string;
  className: string;
  phone: string;
  certification: number;
}

interface AcademyApproval {
  date: string;
  name: string;
  status: string;
  className: string;
}

interface AcademyApprovalListProps {
  data: UserApproval[] | AcademyApproval[];
  roleId: number;
}
const AcademyApprovalList = ({ data, roleId }: AcademyApprovalListProps) => {
  const navigate = useNavigate();
  // 데이터가 없거나 배열이 아닌 경우 처리
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full border rounded-[4px] h-fit mr-3">
        <span className="flex p-4 items-center w-full h-[47px] text-[#303E67] border-b">
          {roleId === 3 ? "수강 신청 현황" : "학원 승인 대기"}
        </span>
        <div className="flex justify-center items-center h-[180px] text-gray-500">
          데이터가 없습니다
        </div>
      </div>
    );
  }

  if (roleId === 3) {
    // 학원 관리자용 리스트
    const userApprovals = data as UserApproval[];
    return (
      <div className="w-full border rounded-[4px] h-fit mr-3">
        <span className="flex p-4 items-center w-full h-[47px] text-[#303E67] border-b">
          수강 신청 현황
        </span>
        <ul className="flex mx-auto w-full h-[30px] bg-[#F1F5FA] border-b">
          <li className="flex justify-center items-center w-[30%] text-[#303E67]">
            유저정보
          </li>
          <li className="flex justify-center items-center w-[11%] text-[#303E67]">
            신청일
          </li>
          <li className="flex justify-center items-center w-[14%] text-[#303E67]">
            학원명
          </li>
          <li className="flex justify-center items-center w-[14%] text-[#303E67]">
            강의명
          </li>
          <li className="flex justify-center items-center w-[16%] text-[#303E67]">
            전화번호
          </li>
          <li className="flex justify-center items-center w-[11%] text-[#303E67]">
            승인상태
          </li>
        </ul>
        <div className="overflow-hidden h-[150px]">
          {userApprovals.slice(0, 5).map((item, index) => (
            <ul
              key={index}
              className={`flex mx-auto w-full h-[30px] ${
                index < 4 ? "border-b" : ""
              }`}
            >
              <li className="flex justify-center items-center w-[30%] text-[#242424] text-[14px]">
                <div className="flex items-center text-[12px] w-full overflow-hidden">
                  <div className="flex px-2 items-center w-full truncate">
                    <span className="text-[14px] truncate">{item.name}</span>
                    <span className="text-[12px] text-gray-500 truncate ml-1">
                      ({item.email})
                    </span>
                  </div>
                </div>
              </li>
              <li className="flex justify-center items-center w-[11%] text-[#242424] text-[12px]">
                {item.registrationDate}
              </li>
              <li className=" w-[14%] my-auto text-[#242424] overflow-hidden whitespace-nowrap text-ellipsis text-center text-[14px]">
                {item.acaName}
              </li>
              <li className="w-[14%] my-auto text-[#242424] overflow-hidden whitespace-nowrap text-ellipsis text-center text-[14px]">
                {item.className}
              </li>
              <li className="flex justify-center items-center w-[16%] text-[#242424] text-[14px]">
                {item.phone}
              </li>
              <li className="flex justify-center items-center w-[11%] text-[#242424] text-[12px]">
                <p
                  className={`w-full max-w-[80px] pb-[1px] rounded-md ${
                    item.certification === 1 ? "bg-[#90b1c4]" : "bg-[#f8a57d]"
                  } text-white text-[12px] text-center`}
                >
                  {item.certification === 1 ? "승인완료" : "승인대기"}
                </p>
              </li>
            </ul>
          ))}
        </div>
      </div>
    );
  }

  // 관리자용 기존 리스트
  const academyApprovals = data as AcademyApproval[];
  return (
    <div className="w-full border rounded-[4px] h-fit mr-3">
      <span
        className="flex p-4 items-center w-full h-[47px] text-[#303E67] border-b cursor-pointer"
        onClick={() => navigate("/admin/arrow-list")}
      >
        학원 승인 대기
      </span>
      <ul className="flex mx-auto w-full h-[30px] bg-[#F1F5FA] border-b">
        <li className="flex justify-center items-center w-full text-[#303E67]">
          신청일
        </li>
        <li className="flex justify-center items-center w-full text-[#303E67]">
          학원명
        </li>
        <li className="flex justify-center items-center w-full text-[#303E67]">
          요청상태
        </li>
      </ul>
      <div className="overflow-hidden h-[150px]">
        {academyApprovals.slice(0, 5).map((item, index, _array) => (
          <ul
            key={index}
            className={`flex mx-auto w-full h-[30px] ${
              index < 4 ? "border-b" : ""
            }`}
          >
            <li className="flex justify-center items-center w-full text-[#242424] text-[14px]">
              {item.date}
            </li>
            <li className="flex justify-center items-center w-full text-[#242424] text-[14px] overflow-hidden whitespace-nowrap text-ellipsis px-2">
              {item.name}
            </li>
            {/* <li className="flex justify-center items-center w-full text-[#242424] text-[14px]">
              <div className="overflow-hidden whitespace-nowrap text-ellipsis text-center px-2">
                {item.className}
              </div> 
            </li> */}
            <li className="flex justify-center items-center w-full text-[#242424] text-[14px]">
              <p className="w-full max-w-[80px] pb-[1px] rounded-md bg-[#90b1c4] text-white text-[12px] text-center">
                {item.status}
              </p>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default AcademyApprovalList;
