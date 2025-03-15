import { useNavigate } from "react-router-dom";

interface AcademyApproval {
  date: string;
  name: string;
  status: string;
}

interface AcademyApprovalListProps {
  academyApprovals: AcademyApproval[];
}

const AcademyApprovalList = ({
  academyApprovals,
}: AcademyApprovalListProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full border rounded-[4px] h-fit mr-3">
      <span
        className="flex p-4 items-center w-full h-[47px] text-[#303E67] border-b cursor-pointer"
        onClick={() => navigate("arrow-list")}
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
      <div className="overflow-hidden">
        {academyApprovals.slice(0, 5).map((item, index, array) => (
          <ul
            key={index}
            className={`flex mx-auto w-full h-[30px] text-[14px] ${index !== array.length - 1 ? "border-b" : ""}`}
          >
            <li className="flex justify-center items-center w-1/3 text-[#242424] text-[14px]">
              {item.date}
            </li>
            <li className="flex justify-center items-center w-1/3 text-[#242424] text-[14px]">
              {item.name}
            </li>
            <li className="flex justify-center items-center w-1/3 text-[#242424] text-[14px]">
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
