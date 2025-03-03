import { Pagination } from "antd";
import { useState } from "react";
import CustomModal from "../../components/modal/Modal";
import { Cookies } from "react-cookie";
import DOMPurify from "dompurify";
import MainButton from "../../components/button/MainButton";
import { useNavigate } from "react-router-dom";

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
  const pageSize = 5;
  const navigate = useNavigate();
  const cookies = new Cookies();

  // 유효한 책만 필터링
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
    setIsModalVisible(true);
  };

  const handlePayment = () => {
    // 결제 페이지로 이동하는 로직
    navigate(`/payment?bookId=${selectedBook?.bookId}`);
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
        {currentBooks.map(book => (
          <div
            key={book.bookId}
            className="flex flex-col gap-4 cursor-pointer relative"
            onClick={() => handleBookClick(book)}
          >
            <img
              src={`/api/file/getImg/${book.bookPic}`}
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
              <h3 className="font-medium text-base text-[#242424] truncate">
                {book.bookName}
              </h3>
              <p className="text-sm text-[#507A95]">
                {book.bookPrice.toLocaleString()}원
              </p>
              {isOutOfStock(book) && (
                <p className="text-sm text-red-500">품절입니다</p>
              )}
            </div>
          </div>
        ))}
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
        button2Text={
          selectedBook && isOutOfStock(selectedBook) ? "품절" : "결제하기"
        }
        button2Disabled={Boolean(
          !cookies.get("accessToken") ||
            (selectedBook && isOutOfStock(selectedBook)),
        )}
        button2Style={
          selectedBook && isOutOfStock(selectedBook)
            ? { backgroundColor: "#d1d5db", cursor: "not-allowed" }
            : undefined
        }
        modalWidth={600}
        content={
          selectedBook && (
            <div className="flex flex-col gap-6">
              <div className="flex gap-6">
                <img
                  src={`/api/file/getImg/${selectedBook.bookPic}`}
                  alt={selectedBook.bookName}
                  className={`w-[200px] h-[200px] rounded-xl object-cover ${
                    isOutOfStock(selectedBook) ? "opacity-50" : ""
                  }`}
                />
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">{selectedBook.bookName}</h3>
                  <p className="text-[#507A95]">
                    가격: {selectedBook.bookPrice.toLocaleString()}원
                  </p>
                  <p
                    className={`${
                      isOutOfStock(selectedBook)
                        ? "text-red-500"
                        : "text-[#507A95]"
                    }`}
                  >
                    {isOutOfStock(selectedBook)
                      ? "품절입니다"
                      : `재고: ${selectedBook.bookAmount}권`}
                  </p>
                  <p className="text-[#507A95]">
                    담당자: {selectedBook.manager}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-bold mb-2">교재 설명</h4>
                <div
                  className="text-[#507A95]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(selectedBook.bookComment),
                  }}
                />
              </div>
            </div>
          )
        }
      />
    </div>
  );
};

export default BookList;
