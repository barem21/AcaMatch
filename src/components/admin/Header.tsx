import { useEffect } from "react";
import { Cookies } from "react-cookie";
import { FaBell } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { useSetRecoilState } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";

interface HeaderProps {
  className?: string;
  isOpen: boolean;
  close: () => void;
}

const Header: React.FC<HeaderProps> = ({ className, close }) => {
  const setUserInfo = useSetRecoilState(userInfo);
  const cookies = new Cookies();

  useEffect(() => {
    const accessToken = cookies.get("accessToken");

    if (accessToken) {
      const fetchUserData = async () => {
        try {
          const response = await jwtAxios.get("/api/user", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // 서버에서 받은 데이터 매핑
          const userData = {
            name: response.data.resultData.name, // 서버에서 받은 name
            roleId: response.data.resultData.roleId, // roleId를 문자열로 변환
            userId: response.data.resultData.userId, // userId를 문자열로 변환
          };
          console.log(userData);

          setUserInfo(userData); // Recoil 상태 업데이트
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };
      fetchUserData();
    }
  }, [setUserInfo]);

  // const navigate = useNavigate();

  return (
    <>
      <header
        className={`${className} relative w-full border-b bg-white transform transition-transform duration-300`}
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
