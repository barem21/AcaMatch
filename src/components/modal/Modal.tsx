import styled from "@emotion/styled";
import React from "react";
import MainButton from "../button/PrimaryButton";

interface CustomModalProps {
  visible: boolean;
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  onButton1Click?: () => void;
  onButton2Click?: () => void;
  button1Text: string;
  button2Text?: string;
  button2Disabled?: boolean;
  button2Style?: React.CSSProperties;
  modalWidth?: number;
  modalHeight?: number;
  btWidth?: number; // 버튼 너비
  btHeight?: number; // 버튼 높이
  gap?: string; // gap 값
  children?: React.ReactNode;
}

const CancelButton = styled(MainButton)`
  &:hover {
    background-color: #c4d9e9 !important;
    border-color: #c4d9e9 !important;
    color: #000 !important;
  }
`;
/**
 * CustomModal 컴포넌트는 커스텀 모달을 렌더링하는 컴포넌트입니다.
 * 모달은 두 개의 버튼과 함께 제목 및 내용을 표시합니다.
 *
 * @param {Object} param0 - 컴포넌트의 props
 * @param {boolean} param0.visible - 모달의 표시 여부
 * @param {string | React.ReactNode} param0.title - 모달의 제목 (문자열 또는 React 요소)
 * @param {string} param0.content - 모달의 내용
 * @param {Function} param0.onButton1Click - 버튼1 클릭 시 실행되는 이벤트 핸들러
 * @param {Function} param0.onButton2Click - 버튼2 클릭 시 실행되는 이벤트 핸들러
 * @param {string} param0.button1Text - 버튼1의 텍스트
 * @param {string} param0.button2Text - 버튼2의 텍스트
 * @param {boolean} param0.button2Disabled - 버튼2의 비활성화 여부
 * @param {React.CSSProperties} param0.button2Style - 버튼2의 스타일
 * @param {number} [param0.modalWidth=400] - 모달의 너비 (기본값 400px)
 * @param {number} [param0.modalHeight=244] - 모달의 높이 (기본값 244px)
 *
 * @returns {JSX.Element | null} 모달을 렌더링하는 컴포넌트, visible이 false일 경우 null 반환
 */
const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  content,
  onButton1Click,
  onButton2Click,
  button1Text = "취소하기",
  button2Text = "확인하기",
  button2Disabled = false,
  button2Style,
  modalWidth = 400,
  modalHeight,
}) => {
  if (!visible) return null; // visible이 false일 경우 렌더링하지 않음

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[1000] modal-popup-wrap"
      style={{ width: "100%", height: "100vh" }}
    >
      <div
        className={`bg-white rounded-3xl p-6 transition-all ease-out duration-300 max-[640px]:!w-[92%]
        ${visible ? "opacity-100 animate-fade-in animate-scale-up" : "opacity-0"}`}
        style={{
          width: `${modalWidth}px`,
          height: modalHeight ? `${modalHeight}px` : "auto",
        }}
      >
        <h2 className="text-2xl font-bold text-left mb-[30px]">{title}</h2>
        <p className="text-base text-left mb-5">{content}</p>
        <div className="btn-wrap flex justify-end space-x-[10px]">
          <CancelButton
            onClick={onButton1Click}
            className={`px-4 py-2 w-[100%] h-[100%]`}
          >
            {button1Text}
          </CancelButton>
          <MainButton
            type="primary"
            onClick={onButton2Click}
            disabled={button2Disabled}
            className={`px-4 py-2 w-[100%] h-[100%]`}
            style={button2Style}
          >
            {button2Text}
          </MainButton>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
export const SecondaryButton = styled(MainButton)`
  &:hover {
    background-color: #c4d9e9 !important;
    border-color: #c4d9e9 !important;
    color: #000 !important;
  }
`;
