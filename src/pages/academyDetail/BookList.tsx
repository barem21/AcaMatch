import { Pagination, Input, message } from "antd";
import { useState } from "react";
import CustomModal from "../../components/modal/Modal";
import { Cookies } from "react-cookie";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import jwtAxios from "../../apis/jwt";

interface Book {
  bookId: number;
  bookName: string;
  bookPrice: number;
  bookPic: string;
  bookAmount: number;
  bookComment: string;
  manager: string;
  classId: number;
}

interface BookListProps {
  books: Book[];
}

const BookList = ({ books }: BookListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentMode, setIsPaymentMode] = useState(false); // 결제 모드 여부
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const pageSize = 5;
  const navigate = useNavigate();
  const cookies = new Cookies();

  const validBooks = books.filter(book => book.bookId !== 0);
  const currentBooks = validBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsPaymentMode(false); // 상세보기 모드로 설정
    setIsModalVisible(true);
  };

  const handlePayment = async () => {
    if (!selectedBook) return;
    if (!buyerName || !buyerEmail) {
      message.error("구매자 이름과 이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await jwtAxios.post("/api/payment/kakaopay", {
        bookId: selectedBook.bookId,
        bookName: selectedBook.bookName,
        bookPrice: selectedBook.bookPrice,
        buyerName,
        buyerEmail,
      });

      if (response.data.next_redirect_pc_url) {
        window.location.href = response.data.next_redirect_pc_url; // 카카오페이 결제 페이지로 이동
      } else {
        message.error("결제 요청 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error during KakaoPay payment:", error);
      message.error("결제 요청 중 오류가 발생했습니다.");
    }
  };

  const isOutOfStock = (book: Book | null) => {
    if (!book) return false;
    return book.bookAmount <= 0;
  };

  return (
    <div className="w-full">
      <h2 className="text-[24px] font-bold flex items-center h-[70px]">
        교재 소개
      </h2>
      <div className="grid grid-cols-5 gap-6 mb-4">
        {currentBooks.length > 0 ? (
          currentBooks.map(book => (
            <div
              key={book.bookId}
              className="flex flex-col gap-4 cursor-pointer relative"
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
        title={isPaymentMode ? "결제 정보 입력" : "교재 상세정보"}
        onButton1Click={() => setIsModalVisible(false)}
        onButton2Click={
          isPaymentMode ? handlePayment : () => setIsPaymentMode(true)
        }
        button1Text="닫기"
        button2Text={isPaymentMode ? "카카오페이로 결제" : "결제하기"}
        button2Disabled={Boolean(
          isPaymentMode
            ? !buyerName || !buyerEmail
            : selectedBook && isOutOfStock(selectedBook),
        )}
        modalWidth={600}
        content={
          isPaymentMode ? (
            <div className="flex flex-col gap-4">
              <Input
                placeholder="구매자 이름"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
              />
              <Input
                placeholder="구매자 이메일"
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
              />
              <p className="text-[#507A95]">
                결제 금액: {selectedBook?.bookPrice.toLocaleString()}원
              </p>
            </div>
          ) : selectedBook ? (
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
                  __html: DOMPurify.sanitize(selectedBook.bookComment),
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
