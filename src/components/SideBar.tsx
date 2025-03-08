import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// MenuItem 인터페이스 정의
interface MenuItem {
  type?: string;
  label: string;
  isActive: boolean;
  link: string;
}

interface SideBarProps {
  children?: ReactNode; // children의 타입을 ReactNode로 지정
  menuItems: MenuItem[]; // 외부에서 menuItems 배열을 전달받음
  titleName?: string;
  className?: string;
}
/**
 * 사이드바 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {ReactNode} [props.children] - 자식 컴포넌트 (선택적)
 * @param {MenuItem[]} props.menuItems - 메뉴 아이템 배열 (필수)
 * @param {string} [props.className] - 추가 스타일 클래스 (선택적)
 * @param {string} props.menuItems[].label - 메뉴 아이템의 표시 텍스트 (필수)
 * @param {boolean} props.menuItems[].isActive - 메뉴의 활성화 상태 (필수)
 * @param {string} props.menuItems[].link - 메뉴 아이템의 이동 경로 (필수)
 * @returns {JSX.Element} 사이드바 컴포넌트
 */
const SideBar: React.FC<SideBarProps> = ({
  children,
  titleName,
  menuItems,
  className,
}) => {
  const navigate = useNavigate();
  return (
    <div className={`mt-[75px] max-[640px]:mt-0 ${className}`}>
      <div className="w-[240px] mr-10 max-[640px]:w-full max-[640px]:p-4">
        {titleName && (
          <h2 className="mb-10 text-[24px] font-[500] leading-[21px] text-brand-default max-[640px]:hidden">
            {titleName}
          </h2>
        )}
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              if ("link" in item) {
                navigate(item.link);
              }
            }}
            className={`flex items-center p-2 px-5 gap-3 rounded-xl text-sm font-medium cursor-pointer ${
              item.isActive ? "bg-gray-200 font-bold" : "bg-white"
            }`}
          >
            {item.label}
          </div>
        ))}
        {children}
      </div>
    </div>
  );
};

export default SideBar;
