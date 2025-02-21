import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FaHeartCircleMinus, FaHeartCirclePlus } from "react-icons/fa6";
import axios from "axios";
import { Cookies } from "react-cookie";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import jwtAxios from "../../apis/jwt";

interface LikeButtonProps {
  academyId: number;
  initialIsLiked: boolean;
  onLikeChange?: (isLiked: boolean) => void;
  setLikeCount?: Dispatch<SetStateAction<number>>;
  isMyLike?: boolean;
}
/**
 * 학원 좋아요 버튼 컴포넌트
 * @param {number} academyId - 학원 ID
 * @param {boolean} initialIsLiked - 초기 좋아요 상태
 * @param {function} [onLikeChange] - 좋아요 상태 변경 시 호출되는 콜백 함수 (선택적)
 * @returns {JSX.Element} 좋아요 버튼 컴포넌트
 */
const LikeButton = ({
  academyId,
  initialIsLiked,
  onLikeChange,
  setLikeCount,
  isMyLike,
}: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const cookies = new Cookies();
  const navigate = useNavigate();
  const { userId } = useRecoilValue(userInfo); // Recoil에서 userId 가져오기

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const checkIsAuthenticated = () => {
    const accessToken = cookies.get("accessToken");
    return !!accessToken; // accessToken이 존재하면 true, 없으면 false
  };

  const handleLikeClick = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (!checkIsAuthenticated()) {
        navigate("/log-in");
        message.error("로그인이 필요한 서비스입니다.");
        return;
      }

      console.log(userId, academyId);

      if (isLiked) {
        // 좋아요 삭제
        const res = await jwtAxios.delete(
          `/api/like?userId=${userId}&acaId=${academyId}`,
          {
            headers: {
              Authorization: `Bearer ${cookies.get("accessToken")}`,
            },
            data: {
              userId: userId,
              acaId: academyId,
            },
          },
        );
        if (setLikeCount) {
          setLikeCount((prevCount: number) => prevCount - 1); // 타입 명시
        }
        console.log("좋아요 삭제 완료", res);
      } else {
        // 좋아요 등록
        const res = await jwtAxios.post(
          `/api/like`,
          {
            userId: userId,
            acaId: academyId,
          },
          {
            headers: {
              Authorization: `Bearer ${cookies.get("accessToken")}`,
            },
          },
        );
        console.log("좋아요 등록 완료", res);
        if (setLikeCount) {
          setLikeCount(prevCount => prevCount + 1); // 좋아요 수 증가
        }
      }

      // 상태 업데이트
      if (!isMyLike) {
        setIsLiked(prev => !prev);
      }

      // 부모 컴포넌트에 변경 알림
      if (onLikeChange) {
        onLikeChange(!isLiked);
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류 발생:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        message.error("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading}
      className="px-2.5 py-0.5 border-0 rounded bg-gray-200 w-full flex justify-center items-center group"
    >
      {isLiked ? (
        <FaHeartCircleMinus
          className="text-[20px] focus:outline-none transition-transform duration-200 group-hover:scale-110"
          color="#3b77d8"
        />
      ) : (
        <FaHeartCirclePlus
          className="text-[20px] focus:outline-none transition-transform duration-200 group-hover:scale-110"
          color="#bbb"
        />
      )}
    </button>
  );
};

export default LikeButton;
