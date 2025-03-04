import { Input, message, Pagination } from "antd";
import DOMPurify from "dompurify";
import { useState, useEffect } from "react";
import jwtAxios from "../../apis/jwt";
import CustomModal from "../../components/modal/Modal";
import { useRecoilState, useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import { useSearchParams } from "react-router-dom";

// Book 인터페이스 수정
interface Book {
  bookId: number;
  bookName: string;
  bookAmount: number;
  bookComment: string;
  bookPic: string;
  bookPrice: number;
  manager: string;
  classId: number; // 클래스 ID 추가
}

interface BookListProps {
  books?: Book[];
  classes?: { classId: number; className: string }[];
}

const BookList: React.FC<BookListProps> = ({ books = [], classes = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentMode, setIsPaymentMode] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const currentUserInfo = useRecoilValue(userInfo);
  const pageSize = 5;
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  // 클래스별 교재 필터링
  useEffect(() => {
    if (selectedClassId) {
      const booksForClass = books.filter(
        book => book.classId === selectedClassId && book.bookId !== 0,
      );
      setFilteredBooks(booksForClass);
    } else {
      setFilteredBooks(books.filter(book => book.bookId !== 0));
    }
  }, [selectedClassId, books]);

  const validBooks = filteredBooks;
  const currentBooks = validBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsPaymentMode(false);
    setIsModalVisible(true);
  };

  const handlePayment = async () => {
    if (!selectedBook || !currentUserInfo?.userId) {
      message.error("로그인이 필요하거나 교재가 선택되지 않았습니다.");
      return;
    }

    try {
      // 현재 도메인의 success 경로를 리다이렉트 URL로 설정
      const redirectUrl = `${window.location.origin}/success`;

      const response = await jwtAxios.post("/api/payment/ready", {
        products: [
          {
            productId: selectedBook.bookId,
            quantity: 1,
          },
        ],
        userId: currentUserInfo.userId,
        joinClassId: selectedBook.classId,
        redirectUrl: redirectUrl, // 리다이렉트 URL 추가
      });

      if (response.data.resultData.next_redirect_pc_url) {
        localStorage.setItem("paymentTid", response.data.resultData.tid);

        // 결제 창 열기
        const paymentWindow = window.open(
          response.data.resultData.next_redirect_pc_url,
          "KakaoPayment",
          "width=800,height=800",
        );

        setIsModalVisible(false);
      } else {
        message.error("결제 페이지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error during payment preparation:", error);
      message.error("결제 준비 중 오류가 발생했습니다.");
    }
  };

  // 결제 완료 후 처리를 위한 useEffect 추가
  useEffect(() => {
    // URL에서 pg_token 확인
    const urlParams = new URLSearchParams(window.location.search);
    const pgToken = urlParams.get("pg_token");

    if (pgToken) {
      const tid = localStorage.getItem("paymentTid");

      // 결제 완료 처리
      const completePayment = async () => {
        try {
          await jwtAxios.post("/api/payment/success", {
            pg_token: pgToken,
            tid: tid,
          });

          message.success("결제가 완료되었습니다.");
          localStorage.removeItem("paymentTid"); // tid 삭제
          // 필요한 경우 페이지 리디렉션
        } catch (error) {
          console.error("Error during payment completion:", error);
          message.error("결제 완료 처리 중 오류가 발생했습니다.");
        }
      };

      if (tid) {
        completePayment();
      }
    }
  }, []);

  const isOutOfStock = (book: Book | null) => {
    if (!book) return false;
    return book.bookAmount !== undefined && book.bookAmount <= 0;
  };

  if (!books || books.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-[24px] font-bold flex items-center h-[70px]">
          교재 소개
        </h2>
        <div className="col-span-5 h-[178px] flex items-center justify-center border rounded-xl bg-gray-100">
          <p className="text-lg text-gray-500">등록된 교재가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-[24px] font-bold flex items-center h-[70px]">
        교재 소개
      </h2>
      {/* 교재 목록 표시 */}
      <div className="grid grid-cols-5 gap-4">
        {currentBooks.length > 0 ? (
          currentBooks.map(book => (
            <div
              key={book.bookId}
              className="relative cursor-pointer border rounded-xl p-4 hover:border-brand-default"
              onClick={() => handleBookClick(book)}
            >
              <img
                src={`http://112.222.157.157:5233/pic/book/${book.bookId}/${book.bookPic}`}
                alt={book.bookName}
                className={`w-full h-[178px] rounded-xl object-cover ${
                  isOutOfStock(book) ? "opacity-50" : ""
                }`}
              />
              {isOutOfStock(book) && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
                  품절
                </div>
              )}
              <div>
                <h3
                  className={`font-medium text-base text-[#242424] truncate ${
                    isOutOfStock(book) ? "opacity-50" : ""
                  }`}
                >
                  {book.bookName}
                </h3>
                <p className="text-sm text-[#507A95]">
                  {book.bookPrice.toLocaleString()}원
                </p>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                클래스:{" "}
                {classes.find(c => c.classId === book.classId)?.className ||
                  "미지정"}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-5 h-[178px] flex items-center justify-center border rounded-xl bg-gray-100">
            <p className="text-lg text-gray-500">등록된 교재가 없습니다</p>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-4 mb-[50px]">
        <Pagination
          current={currentPage}
          total={validBooks.length}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>

      {/* 교재 상세 모달 */}
      <CustomModal
        visible={isModalVisible}
        title="교재 상세정보"
        onButton1Click={() => setIsModalVisible(false)}
        onButton2Click={handlePayment}
        button1Text="닫기"
        button2Text="구매하기"
        button2Disabled={isOutOfStock(selectedBook)}
        modalWidth={600}
        content={
          selectedBook ? (
            <div className="flex flex-col gap-6">
              <img
                src={`http://112.222.157.157:5233/pic/book/${selectedBook.bookId}/${selectedBook.bookPic}`}
                alt={selectedBook.bookName}
                className="w-[200px] h-[200px] rounded-xl object-cover"
              />
              <h3 className="text-xl font-bold">{selectedBook.bookName}</h3>
              <p className="text-[#507A95]">
                가격: {selectedBook.bookPrice.toLocaleString()}원
              </p>
              <div
                className="text-[#507A95]"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedBook.bookComment || ""),
                }}
              />
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default BookList;
