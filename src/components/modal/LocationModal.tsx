import axios from "axios";
import { useEffect, useState } from "react";
import MainButton from "../button/PrimaryButton";

import styled from "@emotion/styled";

interface LocationModalProps {
  visible: boolean;
  handleCloseModal: () => void;
  handleLocationSelect: (location: number, locationText: string) => void;
}

interface City {
  cityId: number;
  cityName: string;
}
interface Street {
  streetId: number;
  streetName: string;
}
interface Dong {
  dongId: number;
  dongName: string;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  handleCloseModal,
  handleLocationSelect,
}) => {
  const [resultData, setResultData] = useState<City[]>([]);
  const [streetData, setStreetData] = useState<Street[]>([]);
  const [dongData, setDongData] = useState<Dong[]>([]); // 추가
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedStreetId, setSelectedStreetId] = useState<number | null>(null);
  const [selectedDongId, setSelectedDongId] = useState<number | null>(null);
  const [selectedDongText, setSelectedDongText] = useState<string | null>(null);
  // API 호출 함수
  // 지역 데이터 호출
  const fetchCityData = async () => {
    try {
      const response = await axios.get("/api/academy/getCity");
      // API 응답 데이터가 배열인지 확인하고, 배열이 아니면 빈 배열로 설정

      const dataWithAll = [
        { cityId: "all", cityName: "전체" }, // 전체 항목 추가
        ...response.data.resultData,
      ];

      setResultData(dataWithAll); // API 응답 데이터를 상태에 저장
      // console.log(dataWithAll);
    } catch (error) {
      console.error("Failed to fetch city data:", error);
      //   setResultData([]); // 오류 발생 시 빈 배열로 설정
    }
  };
  // 거리 데이터 호출
  const fetchStreetData = async (cityId: number) => {
    try {
      const response = await axios.get(`/api/academy/getStreet`, {
        params: {
          cityId: cityId,
        },
      });
      setStreetData(response.data.resultData);
      // console.log(response.data.resultData);
    } catch (error) {
      console.error("Failed to fetch dong data:", error);
      setStreetData([]);
    }
  };
  const fetchDongData = async (cityId: number, streetId: number) => {
    try {
      const response = await axios.get(`/api/academy/getDong`, {
        params: {
          cityId: cityId,
          streetId: streetId,
        },
      });
      setDongData(response.data.resultData); // setStreetData에서 setDongData로 수정
      // console.log(response.data.resultData);
    } catch (error) {
      console.error("Failed to fetch dong data:", error);
      setDongData([]); // setStreetData에서 setDongData로 수정
    }
  };

  useEffect(() => {
    if (visible) {
      fetchCityData();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 cursor-default text-brand-default">
      <div className=" h-[700px] flex justify-center items-center max-[640px]:w-full">
        <div className="bg-white rounded-3xl p-6 w-[600px] h-[700px] max-[640px]:w-[92%] max-[640px]:h-[80vh] max-[640px]:pl-3 max-[640px]:pr-3">
          <h2 className="text-2xl font-bold text-left mb-[15px] ml-[25px]">
            지역선택
          </h2>
          <div className="border-b mb-[15px]"></div>
          <div className="flex gap-[24px] justify-center max-[640px]:gap-2">
            <CustomScrollbar className="flex flex-col w-[150px] h-[528px] overflow-y-auto pr-[10px] max-[640px]:w-1/3 max-[640px]:h-[calc(80vh-170px)]">
              {resultData.map(data => (
                <p
                  key={data.cityId}
                  className={`flex items-center pl-[15px] text-base text-left mb-[10px] h-[48px] leading-[48px] cursor-pointer rounded-[12px] max-[640px]:h-auto max-[640px]:leading-normal max-[640px]:p-2 ${
                    selectedCityId === data.cityId
                      ? "text-white bg-brand-BTBlue font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCityId(data.cityId);
                    setSelectedStreetId(null); // street 선택 초기화
                    setSelectedDongId(null); // dong 선택 초기화
                    setSelectedDongText(null); // dong 텍스트 초기화
                    setDongData([]); // dong 데이터 초기화
                    setStreetData([]); // street 데이터도 초기화
                    fetchStreetData(data.cityId);
                  }}
                >
                  {data.cityName}
                </p>
              ))}
            </CustomScrollbar>

            <CustomScrollbar className="flex flex-col w-[150px] h-[528px] overflow-y-auto pr-[10px] max-[640px]:w-1/3 max-[640px]:h-[calc(80vh-170px)]">
              {streetData.map(street => (
                <p
                  key={street.streetId}
                  className={` text-base pl-[15px] text-left mb-[10px] h-[48px] leading-[48px] cursor-pointer rounded-[12px] ${
                    selectedStreetId === street.streetId
                      ? "text-white bg-brand-BTBlue font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedStreetId(street.streetId);
                    setSelectedDongId(null); // dong 선택 초기화
                    setSelectedDongText(null); // dong 텍스트 초기화
                    setDongData([]); // dong 데이터 초기화
                    if (selectedCityId) {
                      fetchDongData(selectedCityId, street.streetId);
                    }
                  }}
                >
                  {street.streetName}
                </p>
              ))}
            </CustomScrollbar>

            <CustomScrollbar className="flex flex-col w-[150px] h-[528px] overflow-y-auto pr-[10px] max-[640px]:w-1/3 max-[640px]:h-[calc(80vh-170px)]">
              {dongData.map(dong => (
                <p
                  key={dong.dongId}
                  className={`flex items-center pl-[15px] text-base text-left mb-[10px] h-[48px] leading-[48px] cursor-pointer rounded-[12px] max-[640px]:h-auto max-[640px]:leading-normal max-[640px]:p-2 ${
                    selectedDongId === dong.dongId
                      ? "text-white bg-brand-BTBlue font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedDongId(dong.dongId);
                    setSelectedDongText(dong.dongName);
                  }}
                >
                  {dong.dongName}
                </p>
              ))}
            </CustomScrollbar>
          </div>

          <div className="flex justify-center gap-[12px] w-[490px] items-center mx-auto mt-[20px] max-[640px]:w-full">
            <MainButton
              onClick={handleCloseModal}
              className="px-4 py-2 w-[144px] h-[32px]"
            >
              닫기
            </MainButton>
            <MainButton
              type="primary"
              onClick={() =>
                handleLocationSelect(
                  selectedDongId ?? -1,
                  selectedDongText ?? "",
                )
              }
              className={`px-4 py-2 w-full h-[32px] ${
                !selectedDongId ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!selectedDongId}
            >
              검색
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;

const CustomScrollbar = styled.div`
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 7px; /* 세로 스크롤바의 너비 */
  }

  &::-webkit-scrollbar-track {
    /* background: #f1f1f1;  */
    background: none;
    border-radius: 10px; /* 스크롤바 트랙의 둥근 모서리 */
  }

  &::-webkit-scrollbar-thumb {
    background: #eee; /* 스크롤바 핸들의 색 */
    border-radius: 10px; /* 핸들의 둥근 모서리 */
    /* border: 3px solid #888; */
  }
`;
// const CustomScrollbar = styled.div`
//   overflow-y: auto;

//   /* 항상 스크롤바 숨기기 */
//   &::-webkit-scrollbar {
//     width: 0;
//     background: transparent;
//   }

//   /* Firefox를 위한 스타일 */
//   scrollbar-width: none;
//   -ms-overflow-style: none;
// `;
