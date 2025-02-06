import Layout from "./components/Layout";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ConfigProvider, message } from "antd";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/member/LoginPage";
import SignupPage from "./pages/member/SignupPage";
import SignupEnd from "./pages/member/SignupEnd";
import MyPage from "./pages/mypage/MyPage";
import AcademySearch from "./pages/AcademySearch";
import AcademyDetail from "./pages/academyDetail/AcademyDetail";
import Support from "./pages/Support";
import NotFoundPage from "./pages/NotFoundPage";
import MyPageRecord from "./pages/mypage/MyPageRecord";
import MyPageLike from "./pages/mypage/MyPageLike";
import MyPageUserInfo from "./pages/mypage/MyPageUserInfo";
import MypageReview from "./pages/mypage/MypageReview";
import AcademyList from "./pages/mypage/academy/AcademyList";
import AcademyAdd from "./pages/mypage/academy/AcademyAdd";
import AcademyEdit from "./pages/mypage/academy/AcademyEdit";
import AcademyClassAdd from "./pages/mypage/academy/AcademyClassAdd";
import AcademyClassEdit from "./pages/mypage/academy/AcademyClassEdit";
import { RecoilRoot } from "recoil";
import AcademyLike from "./pages/mypage/academy/AcademyLike";
import AcademyReview from "./pages/mypage/academy/AcademyReview";
import MypageChild from "./pages/mypage/MypageChild";
import ForgotPw from "./pages/member/ForgotPw";
import { useEffect } from "react";
import Inquiry from "./pages/Inquiry";
import ScrollToTop from "./components/ScrollToTop.tsx";
import InquiryDetail from "./pages/InquiryDetail";
import AcademyClassList from "./pages/mypage/academy/AcademyClassList";
import AcademyStudent from "./pages/mypage/academy/AcademyStudent";
import AcademyTestList from "./pages/mypage/academy/AcademyTestList";
import AcademyRecord from "./pages/mypage/academy/AcademyRecord";
import HotAcademy from "./pages/HotAcademy.tsx";
import MypageParent from "./pages/mypage/MypageParent";
import InquiryList from "./pages/InquiryList";

function App() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .ant-message {
        position: fixed !important;
        top: auto !important;
        bottom: 40px !important;
        right: 20px !important;
        transform: none !important;
        left: auto !important;
      }
      .ant-message .ant-message-notice {
        text-align: right !important;
        margin-inline: 0 !important;
      }
      .ant-message .ant-message-notice-content {
        display: inline-block !important;
        margin-inline: 0 !important;
      }
    `;
    document.head.appendChild(style);

    message.config({
      duration: 2,
      maxCount: 3,
      getContainer: () => {
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.bottom = "20px";
        container.style.right = "20px";
        container.style.transform = "none";
        container.style.zIndex = "1000";
        container.style.display = "flex";
        container.style.flexDirection = "column-reverse";
        container.style.alignItems = "flex-end";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);
        return container;
      },
    });
  }, []);
  return (
    <RecoilRoot>
      <ConfigProvider
        theme={{
          components: {
            // Seed Token
            Button: {
              borderRadius: 12,
              colorPrimary: "#3B77D8",
              colorPrimaryHover: "#2F5FB5",
              algorithm: true, // Enable algorithm
            },
            Message: {
              zIndexPopup: 1000,
            },
            Pagination: {
              itemActiveColorDisabled: "#ffffff",
              colorPrimary: "#3B77D8",
              colorPrimaryHover: "#2F5FB5",
            },
          },
          token: {
            colorError: "#3b77d8", // 오류 색상
            fontSizeSM: 14, // 작은 텍스트 크기
            fontSize: 14,
          },
        }}
      >
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgotPw" element={<ForgotPw />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/signup/end" element={<SignupEnd />} />
              <Route path="/mypage">
                <Route index element={<MyPage />} />
                <Route path="/mypage/record" element={<MyPageRecord />} />
                <Route path="/mypage/like" element={<MyPageLike />} />
                <Route path="/mypage/user" element={<MyPageUserInfo />} />
                <Route path="/mypage/review" element={<MypageReview />} />
                <Route path="/mypage/child" element={<MypageChild />} />
                <Route path="/mypage/parent" element={<MypageParent />} />
              </Route>
              <Route path="/mypage/academy">
                <Route index element={<AcademyList />} />
                <Route
                  path="/mypage/academy/class"
                  element={<AcademyClassList />}
                />
                <Route path="/mypage/academy/add" element={<AcademyAdd />} />
                <Route path="/mypage/academy/Edit" element={<AcademyEdit />} />
                <Route
                  path="/mypage/academy/classEdit"
                  element={<AcademyClassEdit />}
                />
                <Route
                  path="/mypage/academy/classAdd"
                  element={<AcademyClassAdd />}
                />
                <Route
                  path="/mypage/academy/student"
                  element={<AcademyStudent />}
                />
                <Route
                  path="/mypage/academy/testList"
                  element={<AcademyTestList />}
                />
                <Route
                  path="/mypage/academy/record"
                  element={<AcademyRecord />}
                />
                <Route path="/mypage/academy/like" element={<AcademyLike />} />
                <Route
                  path="/mypage/academy/review"
                  element={<AcademyReview />}
                />
              </Route>
              <Route path="/academy">
                <Route index element={<AcademySearch />} />
                <Route path="detail" element={<AcademyDetail />} />
              </Route>
              <Route path="/support">
                <Route index element={<Support />} />
                <Route path="inquiry" element={<Inquiry />} />
                <Route path="inquiryList" element={<InquiryList />} />
                <Route path="inquiry/detail" element={<InquiryDetail />} />
              </Route>
              <Route path="/hotAcademy" element={<HotAcademy />} />
              {/* <Route path="/support" element={<Support />} /> */}
              {/* <Route path="/support/faq" element={<SupportFaq />} /> */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </RecoilRoot>
  );
}

export default App;
