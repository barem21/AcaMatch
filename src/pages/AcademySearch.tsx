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

// interface AcademyData {
//   acaPic: string;
//   acaName: string;
//   tag: string;
//   location: string;
//   rating: string;
// }
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
  // value,
  checked,
  onChange,
}: {
  label: string;
  // value: string;
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
            // value={option.value}
            checked={selectedValues.includes(option.value)}
            onChange={checked => onValueChange(option.value, checked)}
          />
        ))}
      </div>
    </div>
  );
};
interface Academy {
  acaId: string;
  acaPic: string;
  acaName: string;
  tagName: string;
  address: string;
  star: string;
  totalCount: string;
  premium: string;
}

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

  const [_searchInput, _setSearchInput] = useState<string>("");

  // const [age, setAge] = useState("");
  // const [level, setLevel] = useState("");
  const [academyData, setAcademyData] = useState<Academy[]>([]);

  const [searchValue, setSearchValue] = useState("");
  const [_searchLocation, _setSearchLocation] = useState("");

  const [isFirst, setIsFirst] = useState(true);

  const [isFlag, setIsFlag] = useState(true);
  const [temp, setTemp] = useState(0);

  const [searchState, setSearchState] = useState(
    "/api/academy/getAcademyListByAll?premiumLimit=3&page=1&size=10",
  );

  const updateSearchState = (params: URLSearchParams) => {
    const baseUrl = "/api/academy/getAcademyListByAll";

    params.set("size", "10");

    const newSearchState = `${baseUrl}?premiumLimit=3&${params.toString()}`;

    setSearchState(newSearchState);
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleLocationSelect = (location: number, locationText: string) => {
    setSelectedLocation(location);
    setSelectedLocationText(locationText);
    setIsModalVisible(false);

    const params = new URLSearchParams(search);
    // if (selectedLocation === -1) {
    //   params.set("dongId", "");
    // } else {
    params.set("dongId", String(location) === "-1" ? "" : String(location));
    // }
    params.set("page", "1");
    params.set("locationText", locationText);
    updateSearchState(params);

    navigate({
      pathname: window.location.pathname,
      search: params.toString(),
    });

    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchState.split("?")[1]);
    params.set("page", String(page));
    updateSearchState(params);
    setCurrentPage(Number(params.get("page")));
  };

  const handleFilterCheck = (
    sectionId: string, // "age" 또는 "level"
    id: string, // 선택한 필터 값
    checked: boolean, // 체크 여부
  ) => {
    console.log("나실행");

    setSelectedFilters(prev => {
      const currentValues = prev[sectionId] || [];
      const newValues = checked
        ? [...currentValues, id] // 선택한 필터 추가
        : currentValues.filter(value => value !== id); // 선택한 필터 제거

      const updatedFilters = { ...prev, [sectionId]: newValues };

      const allSelectedValues = [
        ...(updatedFilters["age"] || []),
        ...(updatedFilters["level"] || []),
      ];

      const params = new URLSearchParams(search);
      params.set("page", "1"); // 필터 변경 시 첫 페이지로 이동
      setCurrentPage(Number(params.get("page")));

      // 🔥 categoryIds에 모든 필터 값 추가
      if (allSelectedValues.length > 0) {
        params.delete("categoryIds"); // 기존 값 제거 후 다시 추가
        allSelectedValues.forEach(value => {
          params.append("categoryIds", value);
        });
      } else {
        params.delete("categoryIds"); // 모든 필터 해제 시 제거
      }

      setTimeout(() => {
        updateSearchState(params);
      }, 0);

      return updatedFilters;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(search);

    const selectedCategories = params.getAll("categoryIds") || [];
    const selectedFilters: { [key: string]: string[] } = {
      age: [],
      level: [],
    };

    selectedCategories.forEach(value => {
      if (["1", "2", "3", "4", "5"].includes(value)) {
        selectedFilters.age.push(value);
      } else if (["6", "7", "8", "9", "10"].includes(value)) {
        selectedFilters.level.push(value);
      }
    });

    setSelectedFilters(selectedFilters);

    const page = params.get("page") ? Number(params.get("page")) : 1;
    // console.log("page", page);

    setCurrentPage(page);

    const location = params.get("dongId") ? Number(params.get("dongId")) : -1;

    const locationText = params.get("locationText") || "-1";

    const searchName = params.get("searchName") || "";
    const tagName = params.get("tagName") || "";

    // console.log(searchName);

    // console.log("전", selectedSearchType);
    if (searchName) {
      setSelectedSearchType("검색어");
    }
    if (tagName) {
      setSelectedSearchType("태그");
    }

    if (tagName) {
      setSearchValue(tagName);
      updateSearchState(params);
    }
    if (searchName) {
      setSearchValue(searchName);
      updateSearchState(params);
    }

    // console.log("후", selectedSearchType);

    // updateSearchState(params);

    setSelectedLocation(location);
    setSelectedLocationText(locationText);

    const fetchData = async () => {
      if (categoryIds) {
        return;
      }
      if (page > 1) {
        return;
      }
      try {
        const response = await axios.get(searchState);
        // console.log("API 응답:", response.data);
        // console.log(searchState);
        // console.log("처음");

        setAcademyData(response.data.resultData);
        // console.log("ddd", response.data.resultData);
      } catch (error) {
        console.error("API 요청 실패:", error);
      }
    };

    // console.log(selectedSearchType);
    if (selectedSearchType === "태그" && tagName) {
      params.set("tagName", tagName);
      updateSearchState(params);
      // console.log("여기실행");
      return;
    } else {
      setTemp(1);
    }
    if (selectedSearchType === "검색어" && searchName) {
      params.set("searchName", searchName);
      updateSearchState(params);
      // console.log("여기실행");
      return;
    } else {
      setTemp(1);
    }
    if (location) {
      if (location !== -1) {
        params.set("dongId", String(location));
        updateSearchState(params);
        // console.log(location);

        return;
      }
    } else {
      setTemp(2);
    }

    const categoryIds = params.get("categoryIds");
    if (categoryIds) {
      updateSearchState(params);
    } else {
      setTemp(3);
    }

    if (temp >= 0) {
      if (isFirst && params.get("searchName")) {
        setIsFirst(false);
      } else {
        updateSearchState(params);
        fetchData();
        setIsFirst(false);
      }
    }
  }, []); // 최초 1회 실행

  useEffect(() => {
    if (isFlag) {
      setIsFlag(false);
    } else {
      // console.log("나실행");

      // const params = new URLSearchParams(search);
      if (!searchState) return; // 초기 실행 방지

      const fetchData = async () => {
        // console.log(searchState);
        try {
          const response = await axios.get(searchState);
          // console.log("API 응답:", response.data);
          // console.log("두번째 실행");

          // console.log(searchState);

          setAcademyData(response.data.resultData);
          // console.log("ddd", response.data.resultData);
        } catch (error) {
          console.error("API 요청 실패:", error);
        }
      };

      fetchData();
    }
  }, [searchState]);
  useEffect(() => {
    console.log(search);
    const params = new URLSearchParams(search);

    if (search === "?page=1") {
      setCurrentPage(Number(params.get("page")));
      selectedFilters.age.length = 0;
      selectedFilters.level.length = 0;
      setSearchValue("");
      setSelectedLocation(-1);
      setSelectedLocationText("지역 검색");
      // onFinish("");
      form.resetFields();
      updateSearchState(params);
    }
    console.log("주소가 변경되었습니다!", location.pathname); // 경로(pathname) 출력
    console.log("쿼리 파라미터:", location.search); // 쿼리 파라미터 출력
  }, [search]);

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

  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({
    age: [],
    level: [],
  });

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

    const temp1 = search;

    // 필터 값 추가
    // for (const [key, values] of Object.entries(selectedFilters)) {
    //   if (values.length) {
    //     params.set(key, values.join(",")); // 필터 값들을 ','로 연결하여 저장
    //   }
    // }

    // 지역 추가
    if (selectedLocation !== -1) {
      params.set("dongId", String(selectedLocation));
    }

    // 검색어 추가 (버튼을 눌렀을 때만 반영)
    if (values.searchInput !== null && values.searchInput !== undefined) {
      if (selectedSearchType === "태그") {
        params.set("tagName", values.searchInput);
        setSearchValue(values.searchInput);
        params.delete("searchName");
      } else {
        params.set("searchName", values.searchInput);
        setSearchValue(values.searchInput);
        params.delete("tagName");
      }
    }
    // console.log(selectedSearchType);

    // console.log("검색", params.get("searchName"));
    // console.log("태그", params.get("tagName"));

    // console.log("전원본", values.searchInput);

    if (params.get("tagName")) {
      values.searchInput = params.get("tagName");
      params.set("tagName", values.searchInput);
      params.delete("searchName");
      // console.log(values.searchInput);
    } else if (params.get("searchName")) {
      values.searchInput = params.get("searchName");
      params.delete("tagName");
      params.set("searchName", values.searchInput);
      // console.log(values.searchInput);
    } else {
      if (!params.get("tagName") && !params.get("searchName")) {
        params.delete("tagName");
        params.delete("searchName");
      }
    }
    // console.log("원본", values.searchInput);

    // console.log("검색", params.get("searchName"));
    // console.log("태그", params.get("tagName"));
    if (params.get("tagName") && selectedSearchType !== "태그") {
      params.set("searchName", values.searchInput);
      params.delete("tagName");
    } else if (params.get("searchName") && selectedSearchType !== "검색어") {
      params.set("tagName", values.searchInput);
      params.delete("searchName");
    }
    // console.log("후원본", values.searchInput);
    // console.log("후검색", params.get("searchName"));
    // console.log("후태그", params.get("tagName"));

    // console.log(search);
    // console.log("나 작동");

    if (temp1 === search) {
      setCurrentPage(1);

      params.set("page", "1");
    }

    // URL 업데이트
    navigate({
      pathname: window.location.pathname,
      search: params.toString(),
    });

    setTimeout(() => {
      updateSearchState(params);
    }, 0);
  };

  const handleSearch = (value: string) => {
    // console.log("나 작동");

    if (!value.trim()) {
      // 값이 없을 경우에도 폼을 제출
      form.submit();
      setSearchValue("");
    } else {
      form.submit();
      setSearchValue("");
    }
  };
  // const handleSearchClick = () => {
  //   form.submit(); // 검색 값이 없을 때도 강제로 form.submit() 호출
  // };

  return (
    <Form form={form} onFinish={onFinish}>
      <div className="flex flex-row justify-between w-full gap-[12px]">
        <div className="flex mt-[75px] ">
          <div className="flex-col-start gap-4 w-[288px] h-[916px]">
            <div className="flex items-start pb-5">
              <h2 className="text-[24px] font-[500] leading-[21px] text-brand-default mb-[15px]">
                카테고리
              </h2>
            </div>

            <div className="flex flex-col gap-[8px]">
              {filterSections.map(section => (
                <FilterBox
                  key={section.id}
                  title={section.title}
                  options={section.options}
                  selectedValues={selectedFilters[section.id] || []}
                  onValueChange={(value, checked) =>
                    handleFilterCheck(section.id, value, checked)
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
                  // value={searchValue}
                  defaultValue={searchValue}
                  // onSearch={() => form.submit()}
                  onSearch={handleSearch}
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
                      src={`http://112.222.157.157:5233/pic/academy/${academy.acaId}/${academy.acaPic}`} // 기본 이미지 설정
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        const randomNum = getRandomUniqueNumber();
                        target.src = `/default_academy${randomNum}.jpg`;
                      }}
                    />
                  </div>
                  <div className="flex items-center p-4 w-full text-start">
                    <span className="text-[14px] text-brand-default">
                      {Number(academy.premium) === 1
                        ? `(유료)${academy.acaName} `
                        : academy.acaName}
                    </span>
                  </div>
                  <div className="flex min-w-[15%] items-center p-4">
                    <span className="text-[14px] text-brand-placeholder line-clamp-1 text-start">
                      {Array.isArray(academy.tagName)
                        ? academy.tagName.join(", ")
                        : academy.tagName}
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
