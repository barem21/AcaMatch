import { useNavigate } from "react-router-dom";

interface StatsItemProps {
  id: number;
  value: string;
  label: string;
}

interface StatsProps {
  statsData: StatsItemProps[];
}

const Stats = ({ statsData }: StatsProps) => {
  const navigate = useNavigate();

  return (
    <ul className="flex gap-[12px]">
      {statsData?.map(item => (
        <li
          key={item.id}
          className="flex flex-col w-full h-[80px] rounded-lg justify-center items-center border border-[#E3EBF6] cursor-pointer"
          onClick={() => navigate("paymentmanager")}
        >
          <span className="text-[18px] font-semibold">{item.value}</span>
          {item.label && (
            <span className="text-[#A4ABC5] text-[13px]">{item.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Stats;
