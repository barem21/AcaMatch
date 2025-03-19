import { Button, ButtonProps } from "antd";

interface MainButtonProps extends ButtonProps {
  // ButtonProps를 상속받아서 Button의 타입을 그대로 사용
  onClick?: () => void;
  className: string;
  children: React.ReactNode;
  htmlType?: "button" | "submit" | "reset";
  disabled?: boolean; // disabled prop 추가
}
/**
 * MainButton 컴포넌트는 클릭 이벤트와 스타일링을 처리하는 버튼입니다.
 *
 * @param {Object} param0 - 컴포넌트의 props
 * @param {Function} param0.onClick - 버튼 클릭 시 실행되는 이벤트 핸들러
 * @param {string} param0.className - 버튼에 추가할 스타일 클래스 (필수)
 * @param {React.ReactNode} param0.children - 버튼의 텍스트나 자식 요소 (필수)
 * @param {string} [param0.type="default"] - 버튼의 타입, 기본값은 "default" (선택)
 *
 * @returns {JSX.Element} 버튼을 렌더링하는 컴포넌트
 */
export default function PrimaryButton({
  onClick,
  className,
  children,
  type = "default", // 기본값으로 'default' 설정
  htmlType,
  disabled = false, // disabled prop 기본값 추가
  ...rest // 나머지 ButtonProps를 받아옴
}: MainButtonProps) {
  return (
    <Button
      className={`${className} ${disabled ? "cursor-not-allowed" : ""}`}
      onClick={onClick}
      type={type} // Button의 type을 그대로 전달
      htmlType={htmlType}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#d9d9d9" : undefined,
        borderColor: disabled ? "#d9d9d9" : undefined,
        ...rest.style,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
