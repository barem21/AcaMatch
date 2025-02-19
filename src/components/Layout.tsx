import React, { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import Sidebar from "./admin/Sidebar";
import AdminHeader from "./admin/Header";

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  // 특정 경로에서 Header와 Footer를 숨기기 위한 배열
  const noLayoutPaths = ["/login", "/signup", "/signup/end", "/forgotPw"];
  const isLayoutVisible = !noLayoutPaths.includes(pathname);
  const isAdminPage = pathname.startsWith("/admin"); // `/admin` 페이지 감지

  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(!isOpen);
    // console.log("작동중");
  };
  // isAdmin

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex">
      {/* Admin 페이지일 경우 Sidebar 표시 */}
      {isAdminPage ? (
        <>
          <Sidebar isOpen={isOpen} close={close} />
          <div
            className={`relative w-full transform transition-transform duration-300 ${
              isOpen ? "translate-x-[256px]" : "translate-x-0"
            }`}
          >
            <AdminHeader
              isOpen={isOpen}
              close={close}
              className={`sticky top-0 right-0 z-50 flex items-center h-[53px] transition-transform duration-300 `}
            />
            <main className="w-full" style={{ backgroundColor: "#ccc" }}>
              asda
            </main>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1">
          {/* 일반 페이지일 경우 Header 표시 */}
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
          {/* 일반 페이지일 경우 Footer 표시 */}
          {isLayoutVisible && !isAdminPage && (
            <Footer className="w-full h-[100px] flex-col-center mx-auto bg-[#0E161B] text-white text-[14px]" />
          )}
        </div>
      )}
    </div>
  );
};

export default Layout;
