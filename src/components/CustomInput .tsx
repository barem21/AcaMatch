import styled from "@emotion/styled";
import { Input } from "antd";

interface CustomInputProps {
  placeholder?: string;
  height?: string;
  width?: string;
  borderRadius?: string;
  children?: React.ReactNode;
  padding?: string;
  borderColor?: string;
  focusOutline?: string;
  focusBorder?: string;
  border?: string;
  type?: "text" | "password"; // type 속성 추가
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
/**
 * 커스텀 입력 필드 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {string} [props.placeholder] - (선택) 입력 필드의 placeholder 텍스트
 * @param {string} [props.height="56px"] - (선택) 입력 필드의 높이, 기본값: 56px
 * @param {string} [props.width="448px"] - (선택) 입력 필드의 너비, 기본값: 448px
 * @param {string} [props.borderRadius="12px"] - (선택) 입력 필드의 테두리 둥글기, 기본값: 12px
 * @param {string} [props.padding] - (선택) 입력 필드의 내부 여백
 * @param {React.ReactNode} [props.children] - (선택) 자식 컴포넌트
 * @param {string} [props.borderColor] - (선택) 테두리 색상
 * @param {string} [props.focusOutline] - (선택) 포커스 시 외곽선 스타일
 * @param {string} [props.focusBorder] - (선택) 포커스 시 테두리 스타일
 * @param {string} [props.border] - (선택) 기본 테두리 스타일
 * @param {'text' | 'password'} [props.type="text"] - (선택) 입력 필드 타입 (일반 텍스트 또는 비밀번호), 기본값: text
 * @returns {JSX.Element} 커스텀 스타일이 적용된 입력 필드
 */
function CustomInput({
  placeholder,
  height = "56px",
  width = "448px",
  borderRadius = "12px",
  padding,
  children,
  focusOutline,
  focusBorder,
  border,
  type = "text", // 기본값은 text
  value,
  onChange,
}: CustomInputProps) {
  const inputClassName = [
    "text-[14px]",
    "placeholder:text-[14px]",
    "max-[640px]:!w-full",
    // "placeholder:text-brand-placeholder",
    focusOutline && `focus:outline-${focusOutline}`,
    focusBorder && `focus:border-${focusBorder}`,
    border && `border-${border}`,
  ]
    .filter(Boolean)
    .join(" ");
  const InputStyle = styled.div`
    .ant-input-password input::placeholder {
      /* color: #507a95 !important; 플레이스홀더 색상 */
      /* opacity: 1; */
    }
  `;

  return (
    <>
      {type === "password" ? (
        <InputStyle>
          <Input.Password
            maxLength={16}
            className={inputClassName}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{
              width,
              height,
              borderRadius,
              padding,
              fontSize: "14px",
            }}
            classNames={{
              wrapper: "max-[640px]:w-full",
            }}
          />
        </InputStyle>
      ) : (
        <Input
          maxLength={24}
          className={inputClassName}
          placeholder={placeholder}
          onChange={onChange}
          style={{
            width,
            height,
            borderRadius,
            padding,
            fontSize: "14px",
          }}
          classNames={{
            wrapper: "max-[640px]:w-full",
          }}
        />
      )}
      {children}
    </>
  );
}

export default CustomInput;
