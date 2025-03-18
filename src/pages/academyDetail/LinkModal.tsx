import { message } from "antd";
import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaLink, FaShare, FaXTwitter } from "react-icons/fa6";
import { SiNaver } from "react-icons/si";

// LinkModal props 타입 정의
interface LinkModalProps {
  acaId: string | null;
}

const LinkModal: React.FC<LinkModalProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setIsLink(true);

    try {
      // 현재 브라우저의 URL을 가져옴
      const currentURL = window.location.href;

      // Clipboard API 사용
      await navigator.clipboard.writeText(currentURL);
      message.success("링크가 복사되었습니다!");
    } catch (error) {
      console.error("링크 복사 실패:", error);

      // Clipboard API 지원이 안되는 경우, input을 활용한 복사
      try {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        message.success("링크가 복사되었습니다!");
      } catch (fallbackError) {
        console.error("대체 복사 실패:", fallbackError);
        message.error("링크 복사에 실패했습니다. 수동으로 복사해주세요.");
      }
    }
  };

  const snsSendProc = (type: string) => {
    const shareTitle = "학원 상세정보 공유하기";
    const currentURL = window.location.href;
    let href = "";

    switch (type) {
      case "FB":
        href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}&t=${encodeURIComponent(shareTitle)}`;
        break;
      case "TW":
        href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentURL)}`;
        break;
      case "NB":
        href = `https://share.naver.com/web/shareView?url=${encodeURIComponent(currentURL)}&title=${encodeURIComponent(shareTitle)}`;
        break;
    }

    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative inline-block">
      {/* 모달을 여는 버튼 */}
      <button
        onClick={e => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <FaShare color="#507A95" />
      </button>

      {/* 모달 */}
      {isOpen && (
        <div className="absolute right-0 flex justify-center items-center z-1">
          <div
            ref={modalRef}
            onClick={handleModalClick}
            className="bg-white p-5 rounded-lg shadow-lg w-64"
          >
            <h2 className="text-lg font-semibold mb-3">공유하기</h2>
            <div className="flex justify-around gap-3">
              <button onClick={() => snsSendProc("FB")}>
                <FaFacebookF className="text-blue-600 text-3xl" />
              </button>
              <button onClick={() => snsSendProc("TW")}>
                <FaXTwitter className="text-blue-400 text-3xl" />
              </button>
              <button onClick={() => snsSendProc("NB")}>
                <SiNaver className="text-green-500 text-3xl" />
              </button>
              <button onClick={handleCopy}>
                <FaLink
                  className={`text-gray-600 text-3xl ${isLink ? "text-green-400" : ""}`}
                />
              </button>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-gray-200 py-2 rounded-md"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkModal;
