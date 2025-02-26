import React, { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminMenuItems, Divider } from "../constants/adminMenuItems";
import { getCookie, setCookie } from "../utils/cookie";
import AdminFooter from "./admin/Footer";
import AdminHeader from "./admin/Header";
import Sidebar from "./admin/Sidebar";
import BannerLayout from "./BannerLayout";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import { useRecoilValue } from "recoil";
import { userInfo } from "../atoms/userInfo";
import { getMenuItems } from "../constants/adminMenuItems";

interface LayoutProps {
  children?: ReactNode;
}

interface SubMenuItem {
  label: string;
  link: string;
  active: boolean;
  subList?: SubListItem[];
}

interface SubListItem {
  label: string;
  link: string;
  active: boolean;
}

interface MenuItem {
  type?: "item";
  icon: JSX.Element;
  label: string;
  link?: string;
  active: boolean;
  list?: SubMenuItem[];
}

// MenuItem인지 확인하는 타입 가드 함수
const isMenuItem = (item: MenuItem | Divider): item is MenuItem => {
  return (item as MenuItem).label !== undefined;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentUserInfo = useRecoilValue(userInfo);
  const [menuItems, setMenuItems] = useState<(MenuItem | Divider)[]>([]);

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
    // roleId에 따라 메뉴 아이템 설정
    const items = getMenuItems(currentUserInfo.roleId);
    setMenuItems(items);
  }, [currentUserInfo.roleId]);

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
          const updatedSubList = subItem.subList?.map(sub => {
            const isSubListActive =
              pathname === sub.link || pathname.startsWith(sub.link);
            return { ...sub, active: isSubListActive };
          });

          // 하위 서브메뉴가 하나라도 활성화되어 있다면 부모도 활성화
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
    <div className="flex mobile-width">
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
            <Header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite mobile-width" />
          )}

          {isLayoutVisible ? (
            <div className="flex ">
              <BannerLayout position="left" />
              <main
                className={
                  "flex w-full min-w-[990px] mx-auto max-w-[1280px] max-[640px]:min-w-[360px]"
                  // "flex w-full min-w-[990px] mx-auto max-w-[1280px] max-[640px]:min-w-[360px]"
                }
                style={{ minHeight: "calc(100vh - 164px)" }}
              >
                {children}
              </main>
              <BannerLayout position="right" />
            </div>
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
