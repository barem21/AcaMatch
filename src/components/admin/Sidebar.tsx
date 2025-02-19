import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaUserFriends,
  FaCreditCard,
  FaBullhorn,
  FaShieldAlt,
} from "react-icons/fa";

// 타입 정의
type MenuItem = {
  icon: JSX.Element;
  label: string;
  active: boolean;
};

type Divider = {
  type: "divider";
};

// 타입 가드 함수
const isMenuItem = (item: MenuItem | Divider): item is MenuItem => {
  return (item as MenuItem).label !== undefined;
};

// 메뉴 데이터
const menuItems: (MenuItem | Divider)[] = [
  { icon: <FiHome />, label: "대시보드", active: true },
  { icon: <FaChalkboardTeacher />, label: "학원 관리", active: false },
  { icon: <FaUserFriends />, label: "회원 관리", active: false },
  { type: "divider" }, // 구분선 추가
  { icon: <FaCreditCard />, label: "결제 및 지출 관리", active: false },
  { icon: <FaBullhorn />, label: "공지 및 콘텐츠 관리", active: false },
  { icon: <FaShieldAlt />, label: "사이트 운영 및 보안", active: false },
];

const Sidebar = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      {/* {isOpen && <div className="w-[256px]">aaaa</div>} */}
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#254C98] text-white w-[256px] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <div className="p-4 flex justify-between items-center h-14">
          <h1 className="text-xl font-bold">로고 AcaMatch</h1>
          <button onClick={() => close()}>
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            {menuItems.map((item, index) =>
              isMenuItem(item) ? ( // 타입 체크 후 active 속성 접근
                <li
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 ${item.active ? "" : "opacity-50"}`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-[13px] ${item.active ? "" : "opacity-50"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.active ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4 opacity-50" />
                  )}
                </li>
              ) : (
                <li
                  key={index}
                  className="border-b border-gray-700 border-dashed"
                ></li> // 구분선 표시
              ),
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
