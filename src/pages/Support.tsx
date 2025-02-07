import { Pagination } from "antd";
import { useState } from "react";
import { SlArrowDown } from "react-icons/sl";
import SideBar from "../components/SideBar";

function Support() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 페이지당 10개 항목
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [openItems, setOpenItems] = useState<number[]>([]); // 열린 항목들의 인덱스 배열

  const titleName = "고객지원";
  const menuItems = [
    { label: "FAQ", isActive: true, link: "/support" },
    { label: "1 : 1 문의", isActive: false, link: "/support/inquiryList" },
  ];

  const faqData: {
    category: string;
    question: string;
    answer: string;
  }[] = [
    // 가입 관련
    {
      category: "가입",
      question: "회원가입은 어떻게 하나요?",
      answer:
        "홈페이지 우측 상단의 '회원가입' 버튼을 클릭하여 필요한 정보를 입력하시면 됩니다. 이메일 인증 후 서비스 이용이 가능합니다.",
    },
    {
      category: "가입",
      question: "회원가입시 필요한 정보는 무엇인가요?",
      answer:
        "회원타입, 이메일, 비밀번호, 이름, 닉네임, 휴대폰번호와 약관동의가 필요합니다.",
    },

    // 학원 문의
    {
      category: "학원 문의",
      question: "학원 정보는 어떻게 등록하나요?",
      answer: "마이페이지의 나의 학원 탭의 오른쪽 상단에 학원 등록이 있습니다.",
    },
    {
      category: "학원 문의",
      question: "등록된 학원 정보 수정은 어떻게 하나요?",
      answer: "마이페이지 > 학원정보 관리에서 수정 가능합니다.",
    },
    {
      category: "학원 문의",
      question: "학원 검색은 어떤 방식으로 되나요?",
      answer:
        "지역, 수강 연령, 수준, 학원명으로 검색이 가능하며, 필터를 통해 더 자세한 조건 설정이 가능합니다.",
    },

    // 계정 관련
    {
      category: "계정",
      question: "비밀번호를 잊어버렸어요.",
      answer:
        "로그인 페이지의 '비밀번호를 잊으셨나요?'을 통해 가입한 이메일로 인증 후 재설정이 가능합니다.",
    },
    {
      category: "계정",
      question: "회원 탈퇴는 어떻게 하나요?",
      answer:
        "마이페이지 > 회원정보 관리 > 회원탈퇴에서 가능합니다. 탈퇴 시 작성한 리뷰 등의 데이터는 삭제됩니다.",
    },

    // 리뷰 관련
    {
      category: "리뷰",
      question: "리뷰는 어떻게 작성하나요?",
      answer:
        "학원 상세페이지에서 '리뷰작성' 버튼을 클릭하여 작성 가능합니다. 실제 수강생만 작성할 수 있습니다.",
    },
    {
      category: "리뷰",
      question: "부적절한 리뷰를 발견했어요.",
      answer: "준비 중",
    },
    {
      category: "리뷰",
      question: "작성한 리뷰는 어떻게 수정하나요?",
      answer:
        "마이페이지 > 내 리뷰에서 수정 및 삭제가 가능합니다. 또는 상세페이지에서 가능합니다.",
    },

    // 기타
    {
      category: "기타",
      question: "학원 1:1문의는 어떻게 하나요?",
      answer:
        "학원 상세페이지의 1:1 문의를 통해 문의해주시면 신속히 도와드리겠습니다.",
    },
    {
      category: "기타",
      question: "광고 문의는 어떻게 하나요?",
      answer: "준비 중",
    },
  ];

  const filteredFaq =
    selectedCategory === "전체"
      ? faqData
      : faqData.filter(item => item.category === selectedCategory);

  const currentFaq = filteredFaq.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // 항목 토글 함수
  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setOpenItems([]); // 페이지 변경 시 모든 항목 닫기
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const Kategorie = ["전체", "가입", "학원 문의", "계정", "리뷰", "기타"];

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <SideBar menuItems={menuItems} titleName={titleName} />
      <div className="flex flex-col w-full gap-[12px]">
        <h1 className="title-font">자주 물어보는 질문</h1>
        <div className="flex flex-wrap gap-3 justify-start items-center">
          {Kategorie.map(kategorie => (
            <div
              key={kategorie}
              className={`px-4 py-1.5 rounded-xl flex-row-center cursor-pointer ${
                selectedCategory === kategorie
                  ? "bg-brand-BTWhiteHover"
                  : "bg-brand-BTWhite hover:bg-brand-BTWhiteHover"
              }`}
              onClick={() => {
                setSelectedCategory(kategorie);
                setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
                setOpenItems([]); // 카테고리 변경 시 모든 항목 닫기
              }}
            >
              <span className="text-sm font-medium">{kategorie}</span>
            </div>
          ))}
        </div>

        <div className="w-full border rounded-lg overflow-hidden">
          <div className="flex flex-col">
            {currentFaq.map((faq, index) => (
              <div
                key={index}
                className="border-b last:border-b-0 cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <div className="py-4 px-[16px]">
                  <div className="flex items-start gap-2">
                    <span className="flex justify-center rounded-full text-[14px] w-6 h-6 border border-[#DDDDDD] text-brand-BTBlue font-medium">
                      Q
                    </span>
                    {/* <FaQuestionCircle className="w-[28px] h-[28px] text-brand-BTBlue" /> */}
                    <div className="flex flex-col gap-2 w-full">
                      <div
                        className="flex justify-between items-center w-full "
                        // onClick={() => toggleItem(index)}
                      >
                        <h3 className="text-base font-medium">
                          {faq.question}
                        </h3>
                        <SlArrowDown
                          className={`transition-transform duration-200 ${
                            openItems.includes(index) ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`transition-all duration-200 overflow-hidden bg-brand-BTWhite ${
                    openItems.includes(index) ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <div className="py-4 px-[16px]">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={filteredFaq.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

export default Support;
