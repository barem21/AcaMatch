import { DownOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Checkbox, Dropdown, Form, Input, Menu, Pagination } from "antd";
import { useEffect, useState } from "react";
import { SlArrowDown } from "react-icons/sl";
import { useLocation, useNavigate } from "react-router-dom";
import MainButton from "../components/button/MainButton";
import LocationModal from "../components/modal/LocationModal";
import axios from "axios";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
}

interface AcademyData {
  acaPic: string;
  acaName: string;
  tag: string;
  location: string;
  rating: string;
}
const usedRandomNumbers = new Set<number>();

const DropdownButton = styled(MainButton)`
  border: 1px solid #dbe3e6 !important;
  &:hover {
    background-color: #c4d9e9 !important;
    border-color: #507a95 !important;
    border: 1px solid #dbe3e6 !important;
    color: #242424 !important;
  }
`;

const FilterCheckbox = ({
  label,
  value,
  checked,
  onChange,
}: {
  label: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center p-3 px-[10px] gap-[11px]">
    <Checkbox checked={checked} onChange={e => onChange(e.target.checked)}>
      <span className="text-base text-brand-default">{label}</span>
    </Checkbox>
  </div>
);

const FilterBox = ({
  title,
  options,
  style,
  selectedValues,
  onValueChange,
}: {
  title: string;
  options: FilterOption[];
  style?: React.CSSProperties;
  selectedValues: string[];
  onValueChange: (value: string, checked: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="w-[288px] border border-brand-BTWhite rounded-xl p-[12px]"
      style={style}
    >
      {/* Header 부분 */}
      <div
        className="flex justify-between items-center w-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base text-brand-default">{title}</span>
        <SlArrowDown
          className={`transition-transform duration-200 ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </div>

      {/* Filter Options: 열림/닫힘에 따른 높이 조정 */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden`}
        style={{
          maxHeight: isOpen ? `${options.length * 50}px` : "0", // 옵션 개수에 따라 동적 높이
        }}
      >
        {options.map(option => (
          <FilterCheckbox
            key={option.value}
            label={option.label}
            value={option.value}
            checked={selectedValues.includes(option.value)}
            onChange={checked => onValueChange(option.value, checked)}
          />
        ))}
      </div>
    </div>
  );
};

const AcademySearch = () => {
  const [selectedSearchType, setSelectedSearchType] = useState<string>("태그");
  const [currentPage, setCurrentPage] = useState(1);
  // const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const { search } = useLocation();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<number | null>(-1);
  const [selectedLocationText, setSelectedLocationText] = useState<
    string | null
  >(null);

  const [searchInput, setSearchInput] = useState<string>("");

  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleLocationSelect = (location: number, locationText: string) => {
    setSelectedLocation(location); // 지역 선택
    setIsModalVisible(false); // 모달 닫기
    setSelectedLocationText(locationText);

    // URL에 location 파라미터 추가
    const params = new URLSearchParams(search);
    params.set("location", String(location)); // location 값 설정
    params.set("locationText", locationText); // locationText 값 추가
    navigate({
      pathname: window.location.pathname,
      search: params.toString(),
    });
  };
  const [academyData, setAcademyData] = useState([
    {
      acaId: "",
      acaPic: "",
      acaName: "",
      tagName: "",
      address: "",
      star: "",
      totalCount: "",
    },
  ]);

  const navigate = useNavigate();

  const getRandomUniqueNumber = () => {
    if (usedRandomNumbers.size === 10) {
      usedRandomNumbers.clear(); // 모든 숫자가 사용되면 초기화
    }

    let randomNum;
    do {
      randomNum = Math.floor(Math.random() * 10) + 1; // 1~10 사이의 랜덤 숫자
    } while (usedRandomNumbers.has(randomNum));

    usedRandomNumbers.add(randomNum);
    return randomNum;
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const menu = (
    <Menu
      onClick={({ key }) =>
        setSelectedSearchType(key === "1" ? "태그" : "검색어")
      }
    >
      <Menu.Item key="1">
        <span>태그</span>
      </Menu.Item>
      <Menu.Item key="2">
        <span>검색어</span>
      </Menu.Item>
    </Menu>
  );

  const filterSections: FilterSection[] = [
    {
      id: "age",
      title: "수강 연령",
      options: [
        { label: "성인", value: "1" },
        { label: "청소년", value: "2" },
        { label: "초등학생", value: "3" },
        { label: "유아", value: "4" },
        { label: "기타", value: "5" },
      ],
    },
    {
      id: "level",
      title: "수준",
      options: [
        { label: "전문가", value: "6" },
        { label: "상급", value: "7" },
        { label: "중급", value: "8" },
        { label: "초급", value: "9" },
        { label: "입문자", value: "10" },
      ],
    },
  ];

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page); // 상태 업데이트

    // URL 업데이트
    const params = new URLSearchParams(location.search);
    params.set("page", String(page));

    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  // 필터 상태 관리
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({
    age: [],
    level: [],
  });

  const [prevFilters, setPrevFilters] = useState({
    age: "",
    level: "",
  });

  // 개별 필터 값 변경 핸들러
  const handleFilterChange = (
    sectionId: string,
    id: string,
    checked: boolean,
  ) => {
    setSelectedFilters(prev => {
      const currentValues = prev[sectionId] || [];
      if (checked && !currentValues.includes(id)) {
        currentValues.push(id);
      } else {
        const index = currentValues.indexOf(id);
        if (index > -1) {
          currentValues.splice(index, 1);
        }
      }

      // URL 쿼리 스트링 업데이트
      const params = new URLSearchParams(search);
      params.set(sectionId, currentValues.join(","));
      navigate({
        pathname: window.location.pathname,
        search: params.toString(),
      });

      return {
        ...prev,
        [sectionId]: currentValues,
      };
    });
  };
  useEffect(() => {
    const params = new URLSearchParams(search);
    const newFilters: { [key: string]: string[] } = {};

    // 필터 값 갱신
    filterSections.forEach(section => {
      const values = params.get(section.id);
      newFilters[section.id] = values ? values.split(",") : [];
    });

    // 필터 상태가 이전과 다르면 업데이트
    if (JSON.stringify(newFilters) !== JSON.stringify(selectedFilters)) {
      setSelectedFilters(newFilters);
    }
    const currentAge = params.get("age");
    const currentLevel = params.get("level");
    if (currentAge !== prevFilters.age || currentLevel !== prevFilters.level) {
      // handlePageChange(1);
      setPrevFilters({ age: currentAge || "", level: currentLevel || "" }); // 이전 값을 업데이트
    }

    // handlePageChange(1);

    // 지역 값 갱신
    const location = params.get("location");
    const locationText = params.get("locationText");

    if (
      location !== String(selectedLocation) ||
      locationText !== selectedLocationText
    ) {
      setSelectedLocation(location ? Number(location) : -1);
      setSelectedLocationText(locationText || null);
    }
    if (currentAge !== age || currentLevel !== level) {
      setAge(currentAge);
      setLevel(currentLevel);
      // handlePageChange(1); // 필터 변경 시 페이지 1로 이동
    }
    console.log("작동중", age, level);

    if (searchLocation !== location) {
      setSearchLocation(location);
      // handlePageChange(1);
    }

    if (location) {
      // URL에서 'location' 파라미터를 가져와서 상태에 반영
      setSelectedLocation(Number(location));
    }
    if (params.get("tagName")) {
      setSearchValue(params.get("tagName"));
      // console.log("작동중", searchValue);
    }

    fetchData(currentPage); // 필터가 변경될 때마다 데이터 갱신
  }, [
    // selectedFilters.age,
    // selectedFilters.level,
    // selectedLocation,
    searchInput,
    search,
    currentPage,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get("page");

    if (pageParam) {
      setCurrentPage(Number(pageParam)); // 'string' → 'number' 변환
    }
  }, [location.search]);

  const SearchInput = styled(Input.Search)`
    .ant-input {
      height: 56px !important;
    }

    .ant-input-search-button {
      height: 56px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  const onFinish = async (values: any) => {
    const params = new URLSearchParams(search);

    // 필터 값 추가
    for (const [key, values] of Object.entries(selectedFilters)) {
      if (values.length) {
        params.set(key, values.join(",")); // 필터 값들을 ','로 연결하여 저장
      }
    }

    // 지역 추가
    if (selectedLocation !== -1) {
      params.set("dongId", String(selectedLocation));
    }

    console.log(selectedSearchType);
    console.log(values.searchInput);

    // 검색어 추가 (버튼을 눌렀을 때만 반영)
    if (values.searchInput) {
      if (selectedSearchType === "태그") {
        params.set("tagName", values.searchInput);
        params.delete("searchName");
      } else {
        params.set("searchName", values.searchInput);
        params.delete("tagName");
      }
    } else {
      params.delete("tagName");
      params.delete("searchName");
    }

    // URL 업데이트
    navigate({
      pathname: window.location.pathname,
      search: params.toString(),
    });

    fetchData(1); // 첫 페이지에서 다시 검색
  };

  const fetchData = async (page: number) => {
    const params = new URLSearchParams(search);

    // 페이지 번호와 크기
    params.set("page", String(page));
    params.set("size", "10");

    // 필터 값 추가
    for (const [key, values] of Object.entries(selectedFilters)) {
      if (values.length) {
        values.forEach(value => {
          params.append("categoryIds", value); // 같은 key에 여러 값을 추가
        });
      }
    }

    // location 값 추가 (필터가 있을 경우 추가)
    if (selectedLocation !== -1) {
      params.set("dongId", String(selectedLocation));
    }

    console.log(searchInput);

    if (searchInput) {
      if (selectedSearchType === "태그") {
        params.set("tagName", String(searchInput));
      } else {
        params.set("searchName", String(searchInput));
      }
    }

    // params가 어떤 값인지 확인하기
    console.log(params.toString()); // URL 파라미터 형태로 출력

    try {
      const response = await axios.get("/api/academy/getAcademyListByAll", {
        params: params,
      });

      setAcademyData(response.data.resultData);
      // setTotalCount(response.data.)
      console.log(response);
    } catch (error) {
      console.error("API 요청 실패:", error);
    }
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <div className="flex flex-row justify-between w-full gap-[12px]">
        <div className="flex mt-[77px] ">
          <div className="flex-col-start gap-4 w-[288px] h-[916px]">
            <div className="flex items-start pb-5">
              <h2 className="text-[24px] font-[500] leading-[21px] text-brand-default mb-[15px]">
                카테고리
              </h2>
            </div>

            <div className="flex flex-col gap-[8px]">
              {filterSections.map((section, index) => (
                <FilterBox
                  key={section.id}
                  title={section.title}
                  options={section.options}
                  selectedValues={selectedFilters[section.id] || []}
                  onValueChange={(value, checked) =>
                    handleFilterChange(section.id, value, checked)
                  }
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 w-full mt-[65px]">
          {/* 상단 검색 영역 */}
          <div className="flex flex-row flex-wrap justify-between items-start gap-3 w-full h-[72px]">
            <div className="flex flex-col w-[288px] min-w-[288px] h-10">
              <h1 className="font-bold text-3xl text-brand-default">
                학원 검색
              </h1>
            </div>
          </div>

          {/* 검색 필터 */}
          <div className="flex flex-row gap-3 w-full h-14">
            {/* 태그 검색 */}
            <div>
              <div className="flex justify-center items-center">
                {/* Dropdown 컴포넌트 */}
                <Dropdown overlay={menu} trigger={["click"]}>
                  <DropdownButton
                    onClick={() => {}}
                    className="w-[100px] h-[56px] border-none flex items-center px-4 text-brand-default"
                  >
                    {selectedSearchType} <DownOutlined />
                  </DropdownButton>
                </Dropdown>
              </div>
            </div>
            <div className="relative">
              <Form.Item name="searchInput">
                <SearchInput
                  key={location.search}
                  placeholder={`${selectedSearchType}를 입력해주세요`}
                  className="border-none w-[395px] h-[56px]"
                  size="large"
                  value={searchValue}
                  defaultValue={
                    new URLSearchParams(location.search).get("tagName") || ""
                  }
                  onSearch={value => form.submit()}
                />
              </Form.Item>
              {/* <CiSearch className="text-[24px] font-bold  text-brand-placeholder absolute right-[10px] bottom-[15px] " /> */}
            </div>
            <div
              className="flex items-center text-brand-placeholder pl-[11px] w-[460px] h-[56px] bg-[#ffffff] border border-[#DBE3E6] rounded-[12px] justify-between pr-[10px] cursor-pointer"
              onClick={() => setIsModalVisible(true)}
            >
              <span>
                {selectedLocation === -1 ? "지역 검색" : selectedLocationText}
              </span>
              <SlArrowDown />
            </div>
            {/* <div className="w-5 h-5 bg-brand-default" /> */}
          </div>

          {/* 학원 목록 테이블 */}
          <div className="flex flex-col w-full border border-[#DBE3E6] rounded-xl">
            {/* 테이블 헤더 */}
            <div className="flex flex-row h-[46px] items-center justify-center">
              <span className="flex-row-center text-[14px] text-brand-default text-center w-full">
                학원
              </span>
              <span className="flex-row-center text-[14px] text-brand-default text-center min-w-[15%]">
                태그
              </span>
              <span className="flex-row-center text-[14px] text-brand-default text-center  min-w-[15%]">
                지역
              </span>
              <span className="flex-row-center text-[14px] text-brand-default text-center  min-w-[15%]">
                별점
              </span>
            </div>

            {/* 학원 목록 아이템 */}

            {academyData && academyData.length > 0 ? (
              academyData.map((academy, index) => (
                <div
                  key={index}
                  className="flex flex-row h-[72px] border-t border-[#DBE3E6] cursor-pointer"
                  onClick={() => {
                    const id = academy.acaId;
                    const path = `/academy/detail?id=${id}`;
                    navigate(path);
                  }}
                >
                  <div className="flex justify-center items-center min-w-[10%]">
                    <img
                      className="w-[60px] h-[60px] rounded-[20px]"
                      src={academy.acaPic} // 기본 이미지 설정
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        const randomNum = getRandomUniqueNumber();
                        target.src = `/default_academy${randomNum}.jpg`;
                      }}
                    />
                  </div>
                  <div className="flex items-center p-4 w-full text-start">
                    <span className="text-[14px] text-brand-default">
                      {academy.acaName}
                    </span>
                  </div>
                  <div className="flex min-w-[15%] items-center p-4">
                    <span className="text-[14px] text-brand-placeholder line-clamp-1 text-start">
                      {academy.tagName}
                    </span>
                  </div>
                  <div className="flex min-w-[15%] justify-center items-center p-4">
                    <span className="text-[14px] text-brand-placeholder line-clamp-1">
                      {academy.address}
                    </span>
                  </div>
                  <div className="flex min-w-[15%] justify-center items-center p-4">
                    <div className="flex justify-center items-center px-4 h-8 bg-[#F0F2F5] rounded-xl">
                      <span className="text-[14px] font-medium text-brand-default ">
                        {Number(academy.star).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 border-t">
                등록한 학원이 없습니다.
              </div>
            )}
          </div>
          <div className="flex w-full justify-center items-center my-4">
            <Pagination
              current={currentPage}
              total={
                academyData &&
                academyData.length > 0 &&
                academyData[0].totalCount
                  ? Number(academyData[0].totalCount)
                  : 1
              } // 전체 아이템 수
              pageSize={10} // 페이지당 아이템 수
              onChange={handlePageChange}
              showSizeChanger={false} // 페이지 사이즈 변경 옵션 숨김
            />
          </div>
        </div>
        {isModalVisible && (
          <Form.Item name="location">
            <LocationModal
              visible={isModalVisible}
              handleCloseModal={() => handleButton1Click()}
              handleLocationSelect={handleLocationSelect}
            />
          </Form.Item>
        )}
      </div>
    </Form>
  );
};

export default AcademySearch;
