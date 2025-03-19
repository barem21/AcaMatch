import { useNavigate } from "react-router-dom";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { BiSupport } from "react-icons/bi";
import { FaRegUser } from "react-icons/fa";

const BottomNavBar = () => {
  const navigate = useNavigate();

  const navItems = [
    { icon: <AiOutlineHome size={24} />, label: "홈", path: "/" },
    {
      icon: <AiOutlineSearch size={24} />,
      label: "학원검색",
      path: "/academy?page=1",
    },
    { icon: <BiSupport size={24} />, label: "고객지원", path: "/support" },
    { icon: <FaRegUser size={24} />, label: "마이페이지", path: "/mypage" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 min-[769px]:hidden max-[768px]:block">
      <div className="flex justify-between items-center px-4">
        {navItems.map((item, index) => (
          <button
            key={index}
            className="flex flex-col items-center justify-center py-2 w-1/4"
            onClick={() => navigate(item.path)}
          >
            <div className="text-gray-600 hover:text-blue-500">{item.icon}</div>
            <span className="text-xs mt-1 text-gray-600 hover:text-blue-500">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
