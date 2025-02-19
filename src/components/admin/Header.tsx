import { FiMenu } from "react-icons/fi";

interface HeaderProps {
  className?: string;
  isOpen: boolean;
  close: () => void;
}

const Header: React.FC<HeaderProps> = ({ className, isOpen, close }) => {
  return (
    <>
      <header
        className={`${className} relative w-full transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-0"
        }`}
      >
        <div
          className={`flex justify-between min-w-0 transition-all duration-300 ${isOpen ? "w-[calc(100%-256px)]" : "w-[100%]"}`}
        >
          <div className="w-[60px] flex justify-center">
            {/* Menu Button */}
            <button
              className="rounded-md transform transition-transform duration-300"
              onClick={close}
            >
              <FiMenu className="w-[20px] h-[20px]" />
            </button>
          </div>
          <div>
            <ul>
              <li>알림</li>
              <li>프로필</li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
