import { ConfigProvider, message } from "antd";
import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop.tsx";
import AcademySearch from "./pages/AcademySearch";
import HomePage from "./pages/HomePage";
import HotAcademy from "./pages/HotAcademy.tsx";
import Inquiry from "./pages/Inquiry";
import InquiryDetail from "./pages/InquiryDetail";
import InquiryList from "./pages/InquiryList";
import NotFoundPage from "./pages/NotFoundPage";
import Support from "./pages/Support";
import AcademyDetail from "./pages/academyDetail/AcademyDetail";
import AcaManagement from "./pages/admin/AcaManagement.tsx";
import DashBoard from "./pages/admin/DashBoard/DashBoard.tsx";
import PaymentManager from "./pages/admin/PaymentManager.tsx";
import ForgotPw from "./pages/member/ForgotPw";
import LoginPage from "./pages/member/LoginPage";
import SignupEnd from "./pages/member/SignupEnd";
import SignupPage from "./pages/member/SignupPage";
import SignupSnsPage from "./pages/member/SignupSnsPage";
import MyPage from "./pages/mypage/MyPage";
import MyPageLike from "./pages/mypage/MyPageLike";
import MyPageRecord from "./pages/mypage/MyPageRecord";
import MyPageRecordDetail from "./pages/mypage/MyPageRecordDetail.jsx";
import MyPageUserInfo from "./pages/mypage/MyPageUserInfo";
import MypageChild from "./pages/mypage/MypageChild";
import MypageParent from "./pages/mypage/MypageParent";
import MypageReview from "./pages/mypage/MypageReview";

import AcaRevenue from "./pages/admin/AcaRevenue.tsx";
import BannerContent from "./pages/admin/BannerContent.tsx";
import MemberInfo from "./pages/admin/MemberInfo";
import MemberList from "./pages/admin/MemberList";
import NoticeAdd from "./pages/admin/NoticeAdd.tsx";
import NoticeContent from "./pages/admin/NoticeContent.tsx";
import NoticeView from "./pages/admin/NoticeView.tsx";
import PopupAdd from "./pages/admin/popup/PopupAdd.tsx";
import PopupContent from "./pages/admin/popup/PopupContent.tsx";
import AcademyAdd from "./pages/admin/academy/AcademyAdd";
import AcademyArrow from "./pages/admin/academy/AcademyArrow";
import AcademyClassAdd from "./pages/admin/academy/AcademyClassAdd";
import AcademyClassEdit from "./pages/admin/academy/AcademyClassEdit";
import AcademyClassList from "./pages/admin/academy/AcademyClassList";
import AcademyEdit from "./pages/admin/academy/AcademyEdit";
import AcademyList from "./pages/admin/academy/AcademyList";
import AcademyPremium from "./pages/admin/academy/AcademyPremium";
import AcademyPremiumReq from "./pages/admin/academy/AcademyPremiumReq";
import AcademyRecord from "./pages/admin/academy/AcademyRecord";
import AcademyStudent from "./pages/admin/academy/AcademyStudent";
import AcademyTestList from "./pages/admin/academy/AcademyTestList";
import AcademyTextbookAdd from "./pages/admin/academy/AcademyTextbookAdd";
import AcademyTextbookEdit from "./pages/admin/academy/AcademyTextbookEdit";
import AcademyTextbookList from "./pages/admin/academy/AcademyTextbookList";
import AcademyLike from "./pages/admin/academy/AcademyLike";
import AcademyReview from "./pages/admin/academy/AcademyReview";
import BannerView from "./pages/admin/BannerView.tsx";
import CheckIn from "./pages/admin/teacher/CheckIn.tsx";
import TeacherList from "./pages/admin/teacher/TeacherList";
import TeacherAdd from "./pages/admin/teacher/TeacherAdd";
import PaymentSuccess from "./pages/payment/PaymentSuccess";

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
              <Route path="/log-in" element={<LoginPage />} />
              <Route path="/forgotPw" element={<ForgotPw />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/fe/redirect" element={<SignupSnsPage />} />
              <Route path="/signup/end" element={<SignupEnd />} />
              <Route path="/success" element={<PaymentSuccess />} />
              {/* <Route path="/ai" element={<AI />} /> */}
              <Route path="/mypage">
                <Route index element={<MyPage />} />
                <Route path="/mypage/record" element={<MyPageRecord />} />
                <Route path="/mypage/like" element={<MyPageLike />} />
                <Route path="/mypage/user" element={<MyPageUserInfo />} />
                <Route path="/mypage/review" element={<MypageReview />} />
                <Route path="/mypage/child" element={<MypageChild />} />
                <Route path="/mypage/parent" element={<MypageParent />} />
                <Route
                  path="/mypage/record/detail"
                  element={<MyPageRecordDetail />}
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

              <Route path="/admin">
                <Route index element={<DashBoard />} />
                <Route path="member" element={<MemberList />} />
                {/* <Route path="memberInfo" element={<MemberInfo />} /> */}
                <Route path="profile" element={<MemberInfo />} />
                <Route path="acamanager" element={<AcaManagement />} />
                <Route path="paymentmanager" element={<PaymentManager />} />
                <Route path="acarevenue" element={<AcaRevenue />} />
                <Route path="notice-content" element={<NoticeContent />} />
                <Route path="notice-content/add" element={<NoticeAdd />} />
                <Route path="notice-content/view" element={<NoticeView />} />
                <Route path="popup-content" element={<PopupContent />} />
                <Route path="popup-content/add" element={<PopupAdd />} />
                <Route path="banner-content" element={<BannerContent />} />
                <Route path="banner-content/view" element={<BannerView />} />
                <Route path="teacher">
                  <Route path="checkIn" element={<CheckIn />} />
                  <Route path="add" element={<TeacherAdd />} />
                  <Route path="list" element={<TeacherList />} />
                </Route>
                <Route path="academy" element={<AcademyList />} />
                <Route path="academy/arrow" element={<AcademyArrow />} />
                <Route path="academy/add" element={<AcademyAdd />} />
                <Route path="academy/edit" element={<AcademyEdit />} />
                <Route path="academy/class" element={<AcademyClassList />} />
                <Route path="academy/classAdd" element={<AcademyClassAdd />} />
                <Route
                  path="academy/classEdit"
                  element={<AcademyClassEdit />}
                />
                <Route path="academy/like" element={<AcademyLike />} />
                <Route path="academy/review" element={<AcademyReview />} />
                <Route path="academy/student" element={<AcademyStudent />} />
                <Route path="academy/testList" element={<AcademyTestList />} />
                <Route path="academy/record" element={<AcademyRecord />} />
                <Route path="academy/premium" element={<AcademyPremium />} />
                <Route
                  path="academy/premium-req"
                  element={<AcademyPremiumReq />}
                />
                <Route
                  path="academy/textbook"
                  element={<AcademyTextbookList />}
                />
                <Route
                  path="academy/textbookAdd"
                  element={<AcademyTextbookAdd />}
                />
                <Route
                  path="academy/textbookEdit"
                  element={<AcademyTextbookEdit />}
                />
              </Route>
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/success" element={<PaymentSuccess />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </RecoilRoot>
  );
}

export default App;
