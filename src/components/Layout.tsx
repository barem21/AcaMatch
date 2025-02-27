import React, { ReactNode, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userInfo } from "../atoms/userInfo";
import {
  adminMenuItems,
  MenuItem,
  Divider,
  getMenuItems,
} from "../constants/adminMenuItems";
import { getCookie, setCookie } from "../utils/cookie";
import AdminFooter from "./admin/Footer";
import AdminHeader from "./admin/Header";
import Sidebar from "./admin/Sidebar";
import BannerLayout from "./BannerLayout";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import ScrollButton from "./ScrollButton";

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

// MenuItem인지 확인하는 타입 가드 함수
const isMenuItem = (item: MenuItem | Divider): item is MenuItem => {
  return (item as MenuItem).label !== undefined;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentUserInfo = useRecoilValue(userInfo);
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<(MenuItem | Divider)[]>(() => {
    const roleId = currentUserInfo?.roleId;
    return getMenuItems(roleId);
  });

  const noLayoutPaths = [
    "/log-in",
    "/signup",
    "/signup/end",
    "/forgotPw",
    "/fe/redirect",
  ];
  const isLayoutVisible = !noLayoutPaths.includes(location.pathname);
  const isAdminPage = location.pathname.startsWith("/admin");

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

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const checkPathMatch = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const shouldExpand = (item: MenuItem) => {
    // 메인 메뉴 자체가 활성화된 경우
    if (checkPathMatch(item.link)) return true;

    // 서브 메뉴 중 하나라도 활성화된 경우
    const hasActiveSubItem = item.list?.some(subItem => {
      if (checkPathMatch(subItem.link)) return true;
      return subItem.subList?.some(subListItem =>
        checkPathMatch(subListItem.link),
      );
    });

    return !!hasActiveSubItem;
  };

  const handleMenuClick = (item: MenuItem | SubMenuItem) => {
    const updatedItems = menuItems.map(menuItem => {
      if (!isMenuItem(menuItem)) return menuItem;

      if (menuItem.link === item.link) {
        return { ...menuItem, expanded: !menuItem.expanded };
      }

      const updatedList = menuItem.list?.map(subItem => {
        if (subItem.link === item.link) {
          return { ...subItem, expanded: !subItem.expanded };
        }
        return subItem;
      });

      return { ...menuItem, list: updatedList };
    });

    setMenuItems(updatedItems);
  };

  useEffect(() => {
    const initialItems =
      currentUserInfo.roleId === 0
        ? adminMenuItems
        : getMenuItems(currentUserInfo.roleId);

    const updatedItems = initialItems.map(item => {
      if (item.type === "divider") return item;

      const isMainActive = checkPathMatch(item.link);
      const shouldBeExpanded = shouldExpand(item);

      const updatedList = item.list?.map(subItem => {
        const updatedSubList = subItem.subList?.map(subListItem => ({
          ...subListItem,
          active: checkPathMatch(subListItem.link),
        }));

        const isSubActive =
          checkPathMatch(subItem.link) ||
          updatedSubList?.some(subListItem => subListItem.active);

        return {
          ...subItem,
          active: isSubActive,
          expanded: isSubActive || shouldBeExpanded,
          subList: updatedSubList,
        };
      });

      const isAnySubActive = updatedList?.some(
        subItem =>
          subItem.active ||
          subItem.subList?.some(subListItem => subListItem.active),
      );

      return {
        ...item,
        active: isMainActive || isAnySubActive,
        expanded: shouldBeExpanded || isMainActive || isAnySubActive,
        list: updatedList,
      };
    });

    setMenuItems(updatedItems);
  }, [currentUserInfo.roleId, location.pathname]);

  const handleScrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
              ref={mainRef}
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
        <div className="flex flex-col flex-1 relative">
          {isLayoutVisible && !isAdminPage && (
            <Header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite mobile-width" />
          )}

          {isLayoutVisible ? (
            <div className="flex">
              {/* <BannerLayout position="left" /> */}
              <div className="w-[280px]"></div>
              <main
                ref={mainRef}
                className="flex w-full min-w-[990px] mx-auto max-w-[1280px] max-[640px]:min-w-[360px]"
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
          <ScrollButton onScrollToTop={handleScrollToTop} />
        </div>
      )}
    </div>
  );
};

export default Layout;
