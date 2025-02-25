import styled from "@emotion/styled";
import { message } from "antd";
import { useEffect, useRef, useState } from "react";
import { Cookies } from "react-cookie";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import { getCookie, removeCookie, setCookie } from "../../utils/cookie";
import MainButton from "../button/MainButton";

const SecondaryButton = styled(MainButton)`
  &:hover {
    background-color: #c4d9e9 !important;
    border-color: #c4d9e9 !important;
    color: #000 !important;
  }
`;
const menuItems = [
  { label: "학원 검색", link: "/academy?page=1" },
  { label: "화제의 학원", link: "/hotAcademy" },
  { label: "고객지원", link: "/support" },
  { label: "마이페이지", link: "/mypage" },
];

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const setUserInfo = useSetRecoilState(userInfo);
  const cookies = new Cookies();
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false); // 알림창 표시 여부
  const modalRef = useRef<HTMLDivElement | null>(null);
  const currentUserInfo = useRecoilValue(userInfo);

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

          // console.log(response);

          setUserInfo(userData); // Recoil 상태 업데이트
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };

      fetchUserData();
    }
  }, [setUserInfo]);

  useEffect(() => {
    const accessToken = cookies.get("accessToken");
    if (!accessToken || !currentUserInfo.userId) return;

    // console.log(currentUserInfo.userId);

    // console.log(
    //   "SSE 연결 시도:",
    //   `/api/notifications/subscribe/${currentUserInfo.userId}`,
    // );

    const eventSource = new EventSource(
      `/api/notifications/subscribe/${currentUserInfo.userId}`,
    );

    eventSource.onopen = () => {
      // console.log(" SSE 연결 성공!");
    };

    eventSource.onmessage = () => {
      // console.log("새 알림 수신:", event.data);
      try {
        // const data = JSON.parse(event.data);
        setCookie("message", "true", { path: "/" });
        setNotifications(_ => ["읽지 않은 메시지가 있습니다."]);
      } catch (error) {
        console.error("JSON 파싱 오류:", error);
      }
    };

    eventSource.onerror = error => {
      console.error("SSE 오류 발생:", error);
      eventSource.close();
    };

    return () => {
      console.log("SSE 연결 종료");
      eventSource.close();
    };
  }, [currentUserInfo.userId]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await jwtAxios.get("/api/chat/unread-message");
        if (res.data.resultData) {
          setCookie("message", "true", { path: "/" });
        }
      } catch (error) {
        console.log(error);
      }

      if (getCookie("message")) {
        setNotifications(["1"]);
      }
    };

    fetchUnreadMessages(); // 함수 호출
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showNotifications]);
  // useEffect(() => {
  //   // console.log("Current userInfo:", currentUserInfo);
  // }, [currentUserInfo]); // userInfo가 변경될 때마다 로그 출력

  // const handleModalClick = (e: React.MouseEvent) => {
  //   setShowNotifications(prev => !prev);
  //   e.stopPropagation();
  // };

  const logOut = async () => {
    try {
      const res = await jwtAxios.post("/api/user/log-out", {});
      console.log(res);
      removeCookie("accessToken");
      removeCookie("message");
      navigate("/");
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const navigate = useNavigate();

  const isMypage = (link: string) => {
    if (link.startsWith("/mypage") && !cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
      return true; // 로그인 페이지로 이동했음을 나타냄
    }
    return false;
  };
  return (
    <header className={className}>
      <div className="w-[1280px] max-[640px]:w-[360px] flex items-center justify-between mx-auto">
        <img
          src="/logo2.png"
          className="w-[160px] cursor-pointer mr-[full]"
          onClick={() => {
            navigate("/");
          }}
        />

        <div className="flex items-center gap-[30px] max-[640px]:hidden">
          <ul className="flex items-center gap-[30px]">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className="w-[100px] hover:text-brand-BTBlueHover cursor-pointer justify-center text-center"
                onClick={() => {
                  if (!isMypage(item.link)) {
                    navigate(item.link);
                  }
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
          {/* const accessToken = cookies.get('accessToken'); */}
          <div className="flex items-center gap-[15px]">
            {getCookie("accessToken") ? ( // 쿠키에 accessToken이 있는지 확인
              <div className="flex w-[185px] justify-end items-center gap-7">
                <div ref={modalRef} className="relative">
                  <FaBell
                    size="20px"
                    className="cursor-pointer"
                    // onClick={() => setShowNotifications(!showNotifications)}
                    // onClick={handleModalClick}
                    onClick={() => {
                      navigate(`/support/inquiryList`);
                      removeCookie("message");
                      setNotifications([]);
                    }}
                  />
                  {notifications.length > 0 && (
                    <span
                      className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-3 h-3 flex items-center justify-center rounded-full cursor-pointer"
                      // onClick={handleModalClick}
                    >
                      N
                    </span>
                  )}

                  {showNotifications && (
                    <div className="absolute top-8 right-[-128px] w-64 bg-white shadow-lg rounded-md p-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-500">
                          알림이 없습니다
                        </p>
                      ) : (
                        notifications.map((noti, index) => (
                          <div
                            key={index}
                            className="p-2 border-b last:border-0"
                          >
                            {noti}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <MainButton
                  onClick={() => {
                    logOut();
                    // 로그아웃 처리 로직 추가
                  }}
                  className={`px-4 py-2 w-[85px] h-[40px]`}
                >
                  로그아웃
                </MainButton>
              </div>
            ) : (
              <>
                <MainButton
                  type="primary"
                  onClick={() => {
                    navigate("/signup");
                  }}
                  className={`px-4 py-2 w-[85px] h-[40px]`}
                >
                  회원가입
                </MainButton>
                <SecondaryButton
                  onClick={() => {
                    navigate("/log-in");
                  }}
                  className={`px-4 py-2 w-[85px] h-[40px]`}
                >
                  로그인
                </SecondaryButton>
              </>
            )}
          </div>
        </div>
        <button>≡</button>
      </div>
    </header>
  );
};

export default Header;
