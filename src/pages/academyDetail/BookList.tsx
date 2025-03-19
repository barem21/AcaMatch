import { message, Pagination } from "antd";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import CustomModal from "../../components/modal/Modal";
import { Book } from "./types";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

interface BookListProps {
  books: Book[];
  selectedClassId?: number;
}

const BookList = ({ books, selectedClassId }: BookListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [_isPaymentMode, setIsPaymentMode] = useState(false);
  const currentUserInfo = useRecoilValue(userInfo);
  const pageSize = 5;
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

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
      const response = await jwtAxios.post("/api/payment/ready", {
        products: [
          {
            productId: selectedBook.bookId,
            quantity: 1,
          },
        ],
        userId: currentUserInfo.userId,
        joinClassId: selectedBook.classId,
      });

      if (response.data.resultData.next_redirect_pc_url) {
        // tid를 localStorage에 저장
        localStorage.setItem("paymentTid", response.data.resultData.tid);

        // 결제 창 열기
        window.open(
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
    <div className="w-full max-[768px]:p-4 max-[640px]:p-4">
      <h2 className="text-[24px] font-bold flex items-center h-[70px]">
        교재 소개
      </h2>

      {/* 데스크톱용 교재 목록 */}
      <div className="max-[768px]:hidden">
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
                  className={`w-full max-h-[178px] rounded-xl object-cover ${
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
                  클래스: {book.classId ? "지정됨" : "미지정"}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 h-[178px] flex items-center justify-center border rounded-xl">
              <p className="text-[16px]">등록된 교재가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 모바일용 교재 목록 */}
      <div className="hidden max-[768px]:block">
        {currentBooks.length > 0 ? (
          <Swiper
            modules={[FreeMode]}
            slidesPerView={"auto"}
            spaceBetween={16}
            freeMode={true}
            grabCursor={true}
            className="overflow-visible"
          >
            {currentBooks.map(book => (
              <SwiperSlide
                key={book.bookId}
                className="w-[160px] flex-shrink-0"
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => handleBookClick(book)}
                >
                  <img
                    src={`http://112.222.157.157:5233/pic/book/${book.bookId}/${book.bookPic}`}
                    alt={book.bookName}
                    className={`w-full h-[160px] rounded-xl object-cover ${
                      isOutOfStock(book) ? "opacity-50" : ""
                    }`}
                  />
                  {isOutOfStock(book) && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
                      품절
                    </div>
                  )}
                  <div className="mt-4">
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
                    <p className="text-sm text-gray-500">
                      클래스: {book.classId ? "지정됨" : "미지정"}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-[178px] flex items-center justify-center border rounded-xl">
            <p className="text-[16px]">등록된 교재가 없습니다</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
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
              <div className="flex justify-center items-center">
                <img
                  src={`http://112.222.157.157:5233/pic/book/${selectedBook.bookId}/${selectedBook.bookPic}`}
                  alt={selectedBook.bookName}
                  className="w-[200px] h-[200px] rounded-xl object-cover"
                />
              </div>
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
