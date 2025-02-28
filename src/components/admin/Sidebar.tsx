import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { Divider, MenuItem } from "../../constants/adminMenuItems";

// // 메뉴 항목 타입 정의
// interface MenuItem {
//   type?: "item";
//   icon: JSX.Element;
//   label: string;
//   link?: string;
//   active: boolean;
//   list?: { label: string; link: string; active: boolean }[];
// }

// interface Divider {
//   type: "divider";
// }

// 타입 가드 함수: MenuItem인지 확인
const isMenuItem = (item: MenuItem | Divider): item is MenuItem => {
  return (item as MenuItem).label !== undefined;
};

const Sidebar: React.FC<{
  isOpen: boolean;
  close: () => void;
  menuItems: (MenuItem | Divider)[];
  setMenuItems: React.Dispatch<React.SetStateAction<(MenuItem | Divider)[]>>;
}> = ({ isOpen, menuItems }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>(
    {},
  );

  // 초기 렌더링 시 현재 경로에 해당하는 메뉴 열기
  useEffect(() => {
    const newOpenSubmenus: { [key: number]: boolean } = {};
    menuItems.forEach((item, index) => {
      if (isMenuItem(item)) {
        // 메인 메뉴 경로 체크
        if (item.link && pathname.startsWith(item.link)) {
          newOpenSubmenus[index] = true;
        }
        // 서브메뉴 경로 체크
        if (item.list?.some(subItem => pathname.startsWith(subItem.link))) {
          newOpenSubmenus[index] = true;
        }
      }
    });
    setOpenSubmenus(newOpenSubmenus);
  }, [pathname, menuItems]);

  const toggleSubmenu = (index: number) => {
    setOpenSubmenus(prevState => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleMenuClick = (index: number, item: MenuItem) => {
    if (item.list && item.list.length > 0) {
      toggleSubmenu(index);
      navigate(item.list[0].link);
    } else if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div className="flex">
      <div
        className={`fixed top-0 left-0 h-full bg-[#254C98] text-white w-[256px] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <div className="p-4 flex justify-center items-center mx-auto h-14 w-full">
          <h1 className="text-xl font-bold">
            <img src="/logo8.png" className="w-[180px] h-[38px]" />
          </h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-0">
            {menuItems.map((item, index) =>
              isMenuItem(item) ? (
                <li key={index} className="flex flex-col">
                  <div
                    className="flex justify-between items-center p-3 pl-0 rounded-lg cursor-pointer"
                    onClick={() => {
                      handleMenuClick(index, item);
                      if (item.list) {
                        toggleSubmenu(index);
                      }
                    }}
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
                    {item.list ? (
                      openSubmenus[index] ? (
                        <FiChevronDown className="w-4 h-4" />
                      ) : (
                        <FiChevronRight className="w-4 h-4 opacity-50" />
                      )
                    ) : null}
                  </div>
                  {openSubmenus[index] && item.list && (
                    <ul className="pl-6 mt-0 space-y-0">
                      {item.list.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className={`text-[13px] p-2 rounded-md cursor-pointer text-white ${
                            !subItem.active && "text-white opacity-50"
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            navigate(subItem.link);
                          }}
                        >
                          - {subItem.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li
                  key={index}
                  className="border-b border-gray-700 border-dashed"
                ></li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
