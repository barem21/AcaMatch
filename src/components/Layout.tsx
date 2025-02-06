import React, { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./footer/Footer";
import Header from "./header/Header";

interface LayoutProps {
  children?: ReactNode; // children의 타입을 ReactNode로 지정
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation(); // 현재 경로 확인

  // const navigate = useNavigate();
  // 특정 경로에서 Header와 Footer를 숨기기 위한 배열
  const noLayoutPaths = ["/login", "/signup", "/signup/end", "/forgotPw"];
  // const noSideBarPaths = ["/signup", "/signup/end", "/"];

  // 현재 경로가 noLayoutPaths에 포함되어 있으면 Header와 Footer를 숨김
  const isLayoutVisible = !noLayoutPaths.includes(pathname);
  // const isSideBarVisible = !noSideBarPaths.includes(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div>
      {isLayoutVisible && (
        <Header className="sticky top-0 left-0 right-0 z-50 flex items-center h-[64px] bg-white border-b border-brand-BTWhite" />
      )}
      {isLayoutVisible ? (
        <main
          className={"flex min-w-[990px] mx-auto max-w-[1280px]"}
          style={{ minHeight: "calc(100vh - 164px)" }}
        >
          {children}
        </main>
      ) : (
        <main>{children}</main>
      )}
      {isLayoutVisible && (
        <Footer className="w-[full] h-[100px] flex-col-center mx-auto bg-[#0E161B] text-white text-[14px]" />
      )}
    </div>
  );
};

export default Layout;
