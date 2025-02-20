import React, { ReactNode, useEffect, useState } from "react";
import {
  FaBullhorn,
  FaChalkboardTeacher,
  FaCreditCard,
  FaShieldAlt,
  FaUserFriends,
} from "react-icons/fa";
import { FiHome } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import AdminFooter from "./admin/Footer";
import AdminHeader from "./admin/Header";
import Sidebar from "./admin/Sidebar";
import Footer from "./footer/Footer";
import Header from "./header/Header";

interface LayoutProps {
  children?: ReactNode;
}

interface MenuItem {
  type?: "item"; // 기본 값 설정
  icon: JSX.Element;
  label: string;
  link?: string;
  active: boolean;
  list?: { label: string; link: string }[];
}

interface Divider {
  type: "divider";
}
// MenuItem인지 확인하는 타입 가드 함수
const isMenuItem = (item: MenuItem | Divider): item is MenuItem => {
  return (item as MenuItem).label !== undefined;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<(MenuItem | Divider)[]>([
    {
      type: "item",
      icon: <FiHome />,
      label: "대시보드",
      link: "/admin",
      active: true,
    },
    {
      type: "item",
      icon: <FaChalkboardTeacher />,
      label: "학원 관리",
      link: "/admin/1/1",
      active: false,
      list: [
        {
          label: "학원 등록 / 수정 / 삭제",
          link: "/admin/1/1",
        },
        {
          label: "강의 관리",
          link: "/admin/1/2",
        },
        {
          label: "학원 승인",
          link: "/admin/1/3",
        },
        {
          label: "프리미엄 학원 관리",
          link: "/admin/1/4",
        },
      ],
    },
    {
      type: "item",
      icon: <FaUserFriends />,
      label: "회원 관리",
      link: "/admin/2",
      active: false,
    },
    { type: "divider" },
    {
      type: "item",
      icon: <FaCreditCard />,
      label: "결제 및 지출 관리",
      link: "/admin/paymentanager",
      active: false,
    },
    {
      type: "item",
      icon: <FaBullhorn />,
      label: "공지 및 콘텐츠 관리",
      link: "/admin/4",
      active: false,
    },
    {
      type: "item",
      icon: <FaShieldAlt />,
      label: "사이트 운영 및 보안",
      link: "/admin/5",
      active: false,
    },
  ]);

  // // 클릭된 항목만 active 상태로 변경하는 함수
  // const toggleActive = (index: number, link?: string) => {
  //   setMenuItems(prevItems =>
  //     prevItems.map((item, idx) => {
  //       if (!isMenuItem(item)) return item;

  //       const isActive = idx === index;
  //       return { ...item, active: isActive };
  //     }),
  //   );

  //   if (link) {
  //     navigate(link);
  //   }
  // };

  const { pathname } = useLocation();

  const noLayoutPaths = ["/login", "/signup", "/signup/end", "/forgotPw"];
  const isLayoutVisible = !noLayoutPaths.includes(pathname);
  const isAdminPage = pathname.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(true);

  const close = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setMenuItems(prevItems =>
      prevItems.map(item => {
        if (!isMenuItem(item)) return item;

        const isActive =
          (item.link && pathname.startsWith(item.link)) ||
          (item.list?.some(subItem => pathname === subItem.link) ?? false);

        return { ...item, active: isActive };
      }),
    );
  }, [pathname]);

  return (
    <div className="flex">
      {isAdminPage ? (
        <>
          <Sidebar
            isOpen={isOpen}
            close={close}
            menuItems={menuItems}
            setMenuItems={setMenuItems}
          />
          <div
            className={`relative duration-300 ${
              isOpen
                ? "w-[calc(100%-256px)] translate-x-[256px]"
                : "w-[100%] translate-x-0"
            }`}
          >
            <AdminHeader
              isOpen={isOpen}
              close={close}
              className={`sticky top-0 right-0 z-50 flex items-center h-[53px] transition-transform duration-300 `}
            />
            <main
              className="flex w-full"
              style={{
                minHeight: "calc(100vh - 110px)",
              }}
            >
              {children}
            </main>
            <AdminFooter className="w-full h-[52px] text-[#7081B9] p-4 text-[13px]" />
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1">
          {isLayoutVisible && !isAdminPage && (
            <Header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite" />
          )}

          <main
            className="flex min-w-[990px] mx-auto max-w-[1280px]"
            style={{
              minHeight: "calc(100vh - 164px)",
            }}
          >
            {children}
          </main>
          {isLayoutVisible && !isAdminPage && (
            <Footer className="w-full h-[100px] flex-col-center mx-auto bg-[#242424] text-white text-[14px] border-[#000] border-t-[1px]" />
          )}
        </div>
      )}
    </div>
  );
};

export default Layout;
