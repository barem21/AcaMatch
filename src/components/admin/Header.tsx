import { FaBell } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  className?: string;
  isOpen: boolean;
  close: () => void;
}

const Header: React.FC<HeaderProps> = ({ className, isOpen, close }) => {
  const navigate = useNavigate();
  return (
    <>
      <header
        className={`${className} relative w-full transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-0"
        }`}
      >
        <div
          className={`flex justify-between min-w-0 transition-all duration-300 w-[100%]`}
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
            <ul className="flex justify-center items-center gap-[12px] p-[12px] ">
              <li>
                <FaBell />
              </li>
              <li className="text-[13px]">프로필</li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
