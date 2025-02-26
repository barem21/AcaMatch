import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

// 메뉴 항목 타입 정의
interface MenuItem {
  type?: "item";
  icon: JSX.Element;
  label: string;
  link?: string;
  active: boolean;
  list?: { label: string; link: string; active: boolean }[];
}

interface Divider {
  type: "divider";
}

// 타입 가드 함수: MenuItem인지 확인
const isMenuItem = (item: MenuItem | Divider): item is MenuItem => {
  return (item as MenuItem).label !== undefined;
};

const Sidebar: React.FC<{
  isOpen: boolean;
  close: () => void;
  menuItems: (MenuItem | Divider)[];
  setMenuItems: React.Dispatch<React.SetStateAction<(MenuItem | Divider)[]>>;
}> = ({ isOpen, menuItems, setMenuItems }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>(
    {},
  );
  const isFirstLoad = useRef(true);

  useEffect(() => {
    setMenuItems(prevItems =>
      prevItems.map((item, _index) => {
        if (!isMenuItem(item)) return item;

        // 서브메뉴 active 상태 업데이트
        const updatedList = item.list?.map(subItem => ({
          ...subItem,
          active: pathname === subItem.link,
        }));

        // 메인 메뉴 active 상태 업데이트
        const isActive =
          (item.link === "/admin" && pathname === "/admin") || // 대시보드 특별 처리
          (item.link &&
            item.link !== "/admin" &&
            pathname.startsWith(item.link)) ||
          (updatedList?.some(subItem => subItem.active) ?? false);

        return {
          ...item,
          active: isActive,
          list: updatedList,
        };
      }),
    );
  }, [pathname, setMenuItems]);

  useEffect(() => {
    if (!isFirstLoad.current) return;

    const newOpenSubmenus: { [key: number]: boolean } = {};
    menuItems.forEach((item, index) => {
      if (isMenuItem(item) && item.list) {
        const isSubmenuActive = item.list.some(subItem =>
          pathname.startsWith(subItem.link),
        );
        if (isSubmenuActive) {
          newOpenSubmenus[index] = true;
        }
      }
    });

    setOpenSubmenus(newOpenSubmenus);
    isFirstLoad.current = false;
  }, [menuItems, pathname]);

  const toggleSubmenu = (index: number) => {
    setOpenSubmenus(prevState => ({
      ...Object.keys(prevState).reduce(
        (acc, key) => {
          acc[parseInt(key)] = false;
          return acc;
        },
        {} as { [key: number]: boolean },
      ),
      [index]: !prevState[index],
    }));
  };

  const handleMenuClick = (index: number, item: MenuItem) => {
    setMenuItems(prevItems =>
      prevItems.map((prevItem, idx) => {
        if (!isMenuItem(prevItem)) return prevItem;
        return { ...prevItem, active: idx === index };
      }),
    );

    if (item.list && item.list.length > 0) {
      navigate(item.list[0].link);
    } else if (item.link) {
      navigate(item.link);
    }

    setOpenSubmenus({});
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
