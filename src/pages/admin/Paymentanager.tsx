import { Button, Dropdown, Menu } from "antd";

function PaymentManager() {
  const menu = (
    <Menu
      items={[
        { key: "1", label: "Option 1" },
        { key: "2", label: "Option 2" },
      ]}
    />
  );

  return (
    <div className="w-[100%] top-4 px-2 flex flex-col">
      {/* 관리자 메뉴 타이틀 */}
      <div className="p-4">
        <h2 className="text-[17px] font-semibold leading-[18px] tracking-[0.1px] text-[#242424] flex items-center h-[18px]">
          학원별 결제 내역 (학원비/교제구매)
        </h2>
        <span className="flex items-center text-[12px] font-medium leading-[18px] tracking-[0.1px] text-[#7081B9]">
          결제 및 지출 관리 {">"} 학원별 결제 내역
        </span>
      </div>

      <div className="flex p-3 items-center border border-[#E3EBF6]">
        {/* 통합검색 */}
        <div className="h-[38px] flex items-center gap-2">
          <span className="mr-[12px] h-[22px] text-[14px] font-medium text-[#242424] flex items-center">
            주문 통합검색
          </span>
        </div>

        {/* Container */}
        <div className="w-[200px] h-[38px] flex justify-center items-start relative">
          <div className="w-full h-full bg-white border border-[#E3EBF6] rounded-md relative px-2 flex items-center">
            <span className="text-[13px] text-[#303E67]">전체 학원</span>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-1 border border-black"></div>
          </div>

          {/* ✅ Ant Design Dropdown 적용 */}
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button>test</Button>
          </Dropdown>
        </div>

        {/* 검색 버튼 */}
        <button className="w-[300px] h-[30px] flex justify-between items-center px-4 bg-blue-100 rounded-md">
          <span className="text-[11.4px] text-blue-600">
            주문자명을 입력하세요.
          </span>
          <div className="w-4 h-4 border border-black"></div>
        </button>

        {/* 날짜 선택 */}
        <div className="w-[401px] h-[31px] flex items-center gap-1">
          <button className="w-[100px] h-full px-2 bg-blue-100 rounded-md text-blue-600 text-[11.4px]">
            2025-01-01
          </button>
          <span className="text-[11.4px]">~</span>
          <button className="w-[100px] h-full px-2 bg-blue-100 rounded-md text-blue-600 text-[11.4px]">
            2025-01-31
          </button>
        </div>

        {/* 기간 선택 버튼 */}
        <div className="flex gap-1">
          {["오늘", "어제", "7일", "한달"].map(text => (
            <button
              key={text}
              className="w-[42px] h-[31px] px-2 bg-blue-100 rounded-md text-blue-600 text-[11.4px]"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Combobox menu */}
        <div className="w-[120px] h-[38px] flex justify-center items-start relative">
          <div className="w-full h-full bg-white border border-[#E3EBF6] rounded-md relative px-2 flex items-center">
            <span className="text-[13px] text-[#303E67]">40개씩 보기</span>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-1 border border-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentManager;
