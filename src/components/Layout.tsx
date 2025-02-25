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
import { getCookie, setCookie } from "../utils/cookie";

interface LayoutProps {
  children?: ReactNode;
}

interface MenuItem {
  type?: "item";
  icon: JSX.Element;
  label: string;
  link?: string;
  active: boolean;
  list?: {
    label: string;
    link: string;
    active?: boolean;
    subList?: {
      label: string;
      link: string;
      active?: boolean;
    }[];
  }[];
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
      active: false,
    },
    {
      type: "item",
      icon: <FaChalkboardTeacher />,
      label: "학원 관리",
      link: "/admin/1/1",
      active: false,
      list: [
        {
          label: "학원 등록/수정/삭제",
          link: "/admin/academy",
          active: false,
        },
        /*
        {
          label: "학원 등록 요청",
          link: "/admin/academy?state=0",
          active: false,
        },
        */
        {
          label: "학원 등록 승인(관리자 전용)",
          link: "/admin/academy/arrow",
        },
        {
          label: "강의 관리",
          link: "/admin/academy/class",
          active: false,
        },
        {
          label: "프리미엄 학원 관리(관리자 전용?)",
          link: "/admin/academy/premium",
          active: false,
        },
        {
          label: "프리미엄 학원 신청",
          link: "/admin/academy/premium-req",
          active: false,
        },
      ],
    },
    {
      type: "item",
      icon: <FaUserFriends />,
      label: "회원 관리",
      link: "/admin/member",
      active: false,
    },
    { type: "divider" },
    {
      type: "item",
      icon: <FaCreditCard />,
      label: "결제 및 지출 관리",
      link: "/admin/paymentanager",
      active: false,
      list: [
        {
          label: "학원별 결제 내역",
          link: "/admin/paymentanager",
          active: false,
        },
        {
          label: "학원별 매출 정산",
          link: "/admin/acarevenue",
          active: false,
        },
      ],
    },
    {
      type: "item",
      icon: <FaBullhorn />,
      label: "공지 및 콘텐츠 관리",
      link: "/admin/notice-content",
      active: false,
      list: [
        {
          label: "공지사항 관리",
          link: "/admin/notice-content",
          subList: [
            {
              label: "공지사항 목록",
              link: "/admin/notice-content",
            },
            {
              label: "공지사항 등록",
              link: "/admin/notice-content/add",
              active: false,

            },
            {
              label: "공지사항 수정",
              link: "/admin/notice-content/edit",
              active: false,
            },
          ],
        },
        {
          label: "팝업 관리",
          link: "/admin/popup-content",
          active: false,
        },
        {
          label: "배너관리",
          link: "/admin/banner-content",
          active: false,
        },
      ],
    },
    {
      type: "item",
      icon: <FaShieldAlt />,
      label: "사이트 운영 및 보안",
      link: "/admin/5",
      active: false,
    },
  ]);

  const { pathname } = useLocation();

  const noLayoutPaths = [
    "/log-in",
    "/signup",
    "/signup/end",
    "/forgotPw",
    "/fe/redirect",
  ];
  const isLayoutVisible = !noLayoutPaths.includes(pathname);
  const isAdminPage = pathname.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(() => {
    return getCookie("isOpen") ? getCookie("isOpen") === "true" : true;
  });

  const close = () => {
    const newValue = isOpen;
    setIsOpen(!newValue);
    setCookie("isOpen", String(newValue), {
      path: "/",
      // 쿠키 옵션 추가
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년
      sameSite: "strict",
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setMenuItems(prevItems =>
      prevItems.map(item => {
        if (!isMenuItem(item)) return item;

        // [1] 최상위 메뉴 활성화 여부 확인
        const isItemActive =
          item.link === "/admin"
            ? pathname === "/admin" // 대시보드인 경우 정확히 일치할 때만 활성화
            : pathname === item.link || pathname.startsWith(item.link || "");

        // [2] 서브메뉴 활성화 여부 확인
        let isParentActive = isItemActive;
        const updatedList = item.list?.map(subItem => {
          const isSubActive =
            pathname === subItem.link || pathname.startsWith(subItem.link);

          // [3] 하위 서브메뉴(subList)가 있다면 활성화 여부 확인

          const isSubListActive =
            updatedSubList?.some(sub => sub.active) || false;

          if (isSubActive || isSubListActive) {
            isParentActive = true;
          }

          return {
            ...subItem,
            active: isSubActive || isSubListActive,
            subList: updatedSubList,
          };
        });

        return {
          ...item,
          active: isParentActive,
          list: updatedList,
        };
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
              isOpen ? "w-[calc(100%-256px)] left-[256px]" : "w-[100%] left-0"
            }`}
            style={{ transition: "0.3" }}
          >
            <AdminHeader
              isOpen={isOpen}
              close={close}
              className={`sticky top-0 right-0 z-50 flex items-center h-[53px] transition-transform duration-300 `}
            />
            <main
              className="flex w-full p-5"
              style={{
                minHeight: "calc(100vh - 105px)",
              }}
            >
              {children}
            </main>
            <AdminFooter className="w-full h-[52px] border-t text-[#7081B9] p-4 text-[13px]" />
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1">
          {isLayoutVisible && !isAdminPage && (
            <Header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite" />
          )}

          {isLayoutVisible ? (
            <main
              className={"flex w-full min-w-[990px] mx-auto max-w-[1280px]"}
              style={{ minHeight: "calc(100vh - 164px)" }}
            >
              {children}
            </main>
          ) : (
            <main>{children}</main>
          )}
          {isLayoutVisible && !isAdminPage && (
            <Footer className="w-full h-[100px] flex-col-center mx-auto bg-[#242424] text-white text-[14px] border-[#000] border-t-[1px]" />
          )}
        </div>
      )}
    </div>
  );
};

export default Layout;
