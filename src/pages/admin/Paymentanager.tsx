import React from "react";

interface MenuItemProps {
  title: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ title }) => {
  return (
    <li className="flex items-center text-[12px] font-medium leading-[18px] tracking-[0.1px] text-[#7081B9]">
      {title}
    </li>
  );
};

function Paymentanager() {
  return (
    <div className="top-4 px-2 flex flex-col">
      {/* 관리자 메뉴 타이틀 */}
      <h2 className="text-[17px] font-semibold leading-[18px] tracking-[0.1px] text-[#2C3652] flex items-center w-[252px] h-[18px]">
        결제 및 지출 관리
      </h2>

      {/* 메뉴 리스트 */}
      <ul className="flex flex-wrap items-start gap-0 w-[1491.2px] h-[22px] pt-0.5">
        <MenuItem title="학원별 결제 내역" />
        <MenuItem title="월별 결제 내역" />
        <MenuItem title="연간 결제 내역" />
      </ul>
    </div>
  );
}

export default Paymentanager;
