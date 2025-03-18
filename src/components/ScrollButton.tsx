import { IoIosArrowUp } from "react-icons/io";

interface ScrollButtonProps {
  onScrollToTop: () => void;
}

const ScrollButton = ({ onScrollToTop }: ScrollButtonProps) => {
  return (
    <div className="fixed bottom-5 max-[640px]:bottom-5 right-[50px] max-[640px]:right-[10px] z-[999]">
      <button
        onClick={onScrollToTop}
        className="bg-[#3B77D8] hover:bg-[#2F5FB5] text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
      >
        <IoIosArrowUp size={24} />
      </button>
    </div>
  );
};

export default ScrollButton;
