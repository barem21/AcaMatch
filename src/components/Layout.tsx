import React, { ReactNode, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userInfo } from "../atoms/userInfo";
import {
  adminMenuItems,
  Divider,
  getMenuItems,
  MenuItem,
  // SubMenuItem,
} from "../constants/adminMenuItems";
import { getCookie, setCookie } from "../utils/cookie";
import AdminFooter from "./admin/Footer";
import AdminHeader from "./admin/Header";
import Sidebar from "./admin/Sidebar";
import BannerLayout from "./banner/BannerLayout";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import ScrollButton from "./ScrollButton";

interface LayoutProps {
  children?: ReactNode;
}

// interface SubMenuItem {
//   label: string;
//   link: string;
//   active: boolean;
// }

// interface SubListItem {
//   label: string;
//   link: string;
//   active: boolean;
// }

// MenuItem인지 확인하는 타입 가드 함수
// const isMenuItem = (item: MenuItem | Divider): item is MenuItem => {
//   return item.type === "item";
// };

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

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const checkPathMatch = (link: string | undefined): boolean => {
    if (!link) return false;
    return location.pathname.startsWith(link);
  };

  const shouldExpand = (menuItem: MenuItem): boolean => {
    if (checkPathMatch(menuItem.link)) return true;

    if (!menuItem.list) return false;

    return menuItem.list.some(subItem => {
      if (checkPathMatch(subItem.link)) return true;
      return (
        subItem.subList?.some(subListItem =>
          checkPathMatch(subListItem.link),
        ) ?? false
      );
    });
  };

  // const handleMenuClick = (item: MenuItem | SubMenuItem) => {
  //   const updatedItems = menuItems.map(menuItem => {
  //     if (!isMenuItem(menuItem)) return menuItem;

  //     if (menuItem.link === item.link) {
  //       return { ...menuItem, expanded: !menuItem.expanded };
  //     }

  //     const updatedList = menuItem.list?.map(subItem => {
  //       if (subItem.link === item.link) {
  //         return { ...subItem, expanded: !subItem.expanded };
  //       }
  //       return subItem;
  //     });

  //     return { ...menuItem, list: updatedList };
  //   });

  //   setMenuItems(updatedItems);
  // };

  useEffect(() => {
    const initialItems =
      currentUserInfo.roleId === 0
        ? adminMenuItems
        : getMenuItems(currentUserInfo.roleId);

    const updatedItems = initialItems.map(item => {
      if (item.type === "divider") return item; // Divider는 변경 없이 유지

      const isMainActive = checkPathMatch(item.link);
      const shouldBeExpanded = shouldExpand(item as MenuItem);

      const updatedList = item.list?.map(subItem => {
        const updatedSubList = subItem.subList?.map(subListItem => ({
          ...subListItem,
          active: checkPathMatch(subListItem.link) || false,
        }));

        const isSubActive =
          checkPathMatch(subItem.link) ||
          updatedSubList?.some(subListItem => subListItem.active) ||
          false;

        return {
          ...subItem,
          active: isSubActive,
          expanded: isSubActive || shouldBeExpanded || false,
          subList: updatedSubList,
        };
      });

      const isAnySubActive =
        updatedList?.some(
          subItem =>
            subItem.active ||
            subItem.subList?.some(subListItem => subListItem.active),
        ) || false;

      return {
        ...item,
        active: isMainActive || isAnySubActive || false,
        expanded: shouldBeExpanded || isMainActive || isAnySubActive || false,
        list: updatedList,
        icon: item.icon || <></>,
      };
    });

    // 🚀 타입 강제 변환
    setMenuItems(updatedItems as (MenuItem | Divider)[]);
  }, [currentUserInfo.roleId, location.pathname]);

  const handleScrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex mobile-width" ref={mainRef}>
      {isAdminPage ? (
        <>
          <Sidebar
            isOpen={isOpen}
            close={close}
            menuItems={menuItems as (MenuItem | Divider)[]}
            setMenuItems={
              setMenuItems as React.Dispatch<
                React.SetStateAction<(MenuItem | Divider)[]>
              >
            }
          />
          <div
            className={`relative duration-300 ${
              isOpen ? "w-[calc(100%-256px)] left-[256px]" : "w-[100%] left-0"
            }`}
            style={{ transition: "0.3" }}
          >
            <AdminHeader
              // isOpen={isOpen}
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
