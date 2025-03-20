import React, { ReactNode, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userInfo } from "../atoms/userInfo";
import {
  adminMenuItems,
  Divider,
  getMenuItems,
  MenuItem,
  // SubMenuItem,
} from "../constants/adminMenuItems";
import { getCookie, setCookie, removeCookie } from "../utils/cookie";
import AdminFooter from "./admin/Footer";
import AdminHeader from "./admin/Header";
import Sidebar from "./admin/Sidebar";
import BannerLayout from "./banner/BannerLayout";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import ScrollButton from "./ScrollButton";
import PopupWindow from "./popup/PopupWindow";
import jwtAxios from "../apis/jwt";
import BottomNavBar from "./BottomNavBar";

interface LayoutProps {
  children?: ReactNode;
}

interface PopupData {
  popUpId: number;
  popUpType: number;
  popUpShow: number;
  popUpTitle: string;
  popUpContent: string;
  popUpStartDate: string;
  popUpEndDate: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentUserInfo = useRecoilValue(userInfo);
  const location = useLocation();
  const navigate = useNavigate();
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
    "/success",
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

  const [popupData, setPopupData] = useState<PopupData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // useEffect(() => {
  //   const fetchPopupData = async () => {
  //     try {
  //       const response = await fetch("/api/popup/getPopup");
  //       const data = await response.json();
  //       setPopupData(data);
  //       console.log("팝업 데이터", data);
  //     } catch (error) {
  //       console.error("팝업 데이터 가져오기 실패:", error);
  //     }
  //   };

  //   if (isAdminPage) {
  //     fetchPopupData();
  //   }
  // }, [isAdminPage]);

  const checkPathMatch = (link: string | undefined): boolean => {
    if (!link) return false;

    // 대시보드 경로인 경우 정확히 일치하는지 확인
    if (link === "/admin") {
      return location.pathname === "/admin";
    }

    // 다른 경로들은 기존처럼 startsWith로 확인
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

    setMenuItems(updatedItems as (MenuItem | Divider)[]);
  }, [currentUserInfo.roleId, location.pathname]);

  const handleScrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const logOut = async () => {
    try {
      const res = await jwtAxios.post("/api/user/log-out", {});
      // console.log(res);
      removeCookie("accessToken");
      removeCookie("message");
      removeCookie("isOpen");
      navigate("/");
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    const accessToken = getCookie("accessToken");
    if (isAdminPage && !accessToken) {
      navigate("/log-in");
    }
  }, [isAdminPage, navigate]);

  useEffect(() => {
    if (currentUserInfo.roleId === 0 && !isAdminPage) {
      logOut();
    }
  }, [currentUserInfo.roleId, isAdminPage]);

  // BottomNavBar를 숨길 경로들
  const hideBottomNavPaths = [
    ...noLayoutPaths, // 기존 noLayoutPaths의 모든 경로 포함
  ];

  return (
    <div className="flex mobile-width" ref={mainRef}>
      {isAdminPage ? (
        <div className="w-full min-w-[1280px]">
          {location.pathname === "/admin" && <PopupWindow isAdmin={true} />}
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

            {/* 팝업 조건부 렌더링 */}
            {popupData &&
              popupData.popUpType === 1 &&
              popupData.popUpShow === 1 && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                  <h3 className="text-xl font-bold mb-4">
                    {popupData.popUpTitle}
                  </h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: popupData.popUpContent }}
                  />
                  <button
                    className="mt-4 px-4 py-2 bg-[#507A95] text-white rounded-lg"
                    onClick={() => setPopupData(null)}
                  >
                    닫기
                  </button>
                </div>
              )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 relative">
          {isLayoutVisible && !isAdminPage && (
            <Header className="sticky top-0 left-0 right-0 z-1000 flex items-center h-[64px] bg-white border-b border-brand-BTWhite mobile-width " />
          )}

          {isLayoutVisible ? (
            <>
              {location.pathname === "/" && <PopupWindow isAdmin={false} />}
              <div className="flex justify-center">
                <main
                  className="flex w-full min-w-[1280px] mx-auto max-w-[1280px] max-[768px]:min-w-[640px] max-[640px]:min-w-[320px]"
                  style={{
                    minHeight: "calc(100vh - 164px - 60px)",
                  }}
                >
                  {children}
                </main>
                <BannerLayout />
              </div>
            </>
          ) : (
            <main style={{ minHeight: "calc(100vh - 60px)" }}>
              {/* // BottomNavBar가 있는 경우 */}
              {children}
            </main>
          )}
          {isLayoutVisible && !isAdminPage && (
            <Footer className="w-full h-[100px] max-[768px]:h-[130px] flex-col-center mx-auto bg-[#242424] text-white text-[14px] border-[#000] border-t-[1px]" />
          )}
          {/* BottomNavBar 조건부 렌더링 수정 */}
          {!hideBottomNavPaths.includes(location.pathname) && <BottomNavBar />}
          <ScrollButton onScrollToTop={handleScrollToTop} />
        </div>
      )}
    </div>
  );
};

export default Layout;
