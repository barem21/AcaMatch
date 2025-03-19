import { Pagination, Skeleton } from "antd";
import SideBar from "../components/SideBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCookie } from "../utils/cookie";

interface Location {
  lat: number;
  lon: number;
}

const NearbyAcademies = () => {
  // const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 쿼리스트링에서 page 값 읽기 (없으면 1로 설정)
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  // const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const [_isLoggedIn, setIsLoggedIn] = useState(false);
  const [_userLocation, setUserLocation] = useState<Location | null>(null);

  const usedRandomNumbers = new Set<number>();
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

  const getAcademyImageUrl = (acaId: number, pic: string) => {
    // console.log(acaId, pic);
    if (pic === "default.jpg" || pic === undefined || pic === null) {
      return `/default_academy${getRandomUniqueNumber()}.jpg`;
    }
    return `http://112.222.157.157:5233/pic/academy/${acaId}/${pic}`;
  };

  const titleName = "학원목록";
  const menuItems = [
    { label: "화제의 학원", isActive: false, link: "/hotAcademy" },
    { label: "근처의 학원", isActive: true, link: "/nearby-academies" },
  ];

  const [academyData, setAcademyData] = useState<
    Array<{
      id: number;
      image: string;
      name: string;
      tags: string;
      starAvg: string;
      reviewCount: number;
      distance: string;
      totalCount: number;
    }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const accessToken = getCookie("accessToken");
      setIsLoggedIn(!!accessToken);

      try {
        let location: Location;
        // if (accessToken) {
        //   // 방법 1: ip-api.com 사용
        try {
          const locationResponse = await axios.get("http://ip-api.com/json");
          location = {
            lat: locationResponse.data.lat,
            lon: locationResponse.data.lon,
          };
        } catch (error) {
          // 방법 2: abstractapi.com 사용 (API 키 필요)
          try {
            const API_KEY = "your_api_key";
            const locationResponse = await axios.get(
              `https://ipgeolocation.abstractapi.com/v1/?api_key=${API_KEY}`,
            );
            location = {
              lat: locationResponse.data.latitude,
              lon: locationResponse.data.longitude,
            };
          } catch (error) {
            // 방법 3: geolocation API 사용 (브라우저 내장)
            location = await new Promise<Location>(resolve => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  position => {
                    resolve({
                      lat: position.coords.latitude,
                      lon: position.coords.longitude,
                    });
                  },
                  error => {
                    console.error("Error getting location:", error);
                    // 실패시 기본 위치 (서울시청)
                    resolve({
                      lat: 37.5665,
                      lon: 126.978,
                    });
                  },
                );
              } else {
                // geolocation이 지원되지 않는 경우 기본 위치
                resolve({
                  lat: 37.5665,
                  lon: 126.978,
                });
              }
            });
          }
        }
        // } else {
        //   // 로그인하지 않은 경우 기본 위치
        //   location = {
        //     lat: 37.5665,
        //     lon: 126.978,
        //   };
        // }

        setUserLocation(location);

        // 위치 기반 주변 학원 정보 가져오기
        const response = await axios.get(
          "/api/academy/GetAcademyListByDistance",
          {
            params: {
              lat: location.lat,
              lon: location.lon,
              page: currentPage,
              size: pageSize,
            },
          },
        );
        console.log(response.data.resultData);

        const updatedCards = response.data.resultData.map((item: any) => ({
          id: item.acaId,
          image: getAcademyImageUrl(item.acaId, item.acaPic),
          name: item.acaName || "학원 이름",
          tags: item.tagNames || "태그 정보 없음",
          starAvg: item.starAvg?.toFixed(1) || "0.0",
          reviewCount: item.reviewCount || 0,
          distance: item.distance
            ? `${(item.distance / 1000).toFixed(1)}km`
            : "거리 정보 없음",
          totalCount: item.totalCount || 0,
        }));

        setAcademyData(updatedCards);
      } catch (error) {
        console.error("Error fetching academy data:", error);
        // 에러 발생시 기본 위치 사용
        const defaultLocation = {
          lat: 37.5665,
          lon: 126.978,
        };
        setUserLocation(defaultLocation);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  // 스켈레톤 UI 표시 최적화
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (loading) {
      timeoutId = setTimeout(() => setShowSkeleton(true), 200);
    } else {
      setShowSkeleton(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId); // ✅ 명확하게 void만 반환하도록 수정
    };
  }, [loading]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) }); // URL의 쿼리스트링 업데이트
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex gap-5 w-full max-[640px]:flex-col max-[640px]:gap-0">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full max-[640px]:p-4">
        <h1 className="title-font flex justify-between align-middle max-[640px]:mb-3 max-[640px]:text-xl max-[640px]:mt-0">
          근처의 학원
        </h1>
        <div className="w-full gap-[12px] py-[16px] px-[16px] border rounded-lg overflow-hidden">
          <div className="flex flex-col gap-6">
            {/* 학원 목록 */}
            <div className="grid grid-cols-5 gap-6 h-[568px] max-[640px]:grid-cols-2 max-[640px]:h-auto">
              {showSkeleton
                ? [...Array(10)].map((_, index) => <SkeletonCard key={index} />)
                : academyData.map(academy => (
                    <AcademyCard key={academy.id} academy={academy} />
                  ))}
            </div>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center m-6">
          <Pagination
            current={currentPage}
            total={
              academyData && academyData.length > 0 && academyData[0].totalCount
                ? Number(academyData[0].totalCount)
                : 1
            } // 전체 아이템 수
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

// 스켈레톤 컴포넌트
const SkeletonCard = () => (
  <div className="flex flex-col items-start pb-3 gap-3 w-[166px]">
    <Skeleton.Image
      active
      style={{ width: "166px", height: "166px", borderRadius: "12px" }}
    />
    <div className="flex flex-col items-start w-full gap-2">
      <Skeleton.Input active style={{ width: "80%", height: "24px" }} />
      <div className="flex flex-col gap-1">
        <Skeleton.Input active size="small" style={{ width: "100%" }} />
        <Skeleton.Input active size="small" style={{ width: "60%" }} />
      </div>
    </div>
  </div>
);

// 학원 카드 컴포넌트
const AcademyCard = ({ academy }: { academy: any }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-start pb-3 gap-3 w-[166px] cursor-pointer max-[640px]:w-full"
      onClick={() =>
        navigate(`/academy/detail?id=${academy.id}&page=1&size=10`)
      }
    >
      <div className="relative w-full max-[640px]:pb-[100%]">
        <img
          src={academy.image}
          alt={academy.name}
          className="w-[166px] h-[166px] rounded-xl object-cover max-[640px]:absolute max-[640px]:w-full max-[640px]:h-full"
        />
      </div>

      <div className="flex flex-col items-start w-full">
        <h3 className="text-base font-medium text-[#0E161B] leading-6 w-full line-clamp-1">
          {academy.name}
        </h3>
        <p className="text-sm text-[#507A95] leading-[21px] w-full">
          <p className="line-clamp-1">{academy.tags}</p>
          <div className="flex justify-between text-[14px]">
            {academy.starAvg} ({academy.reviewCount} reviews)
          </div>
        </p>
      </div>
    </div>
  );
};

export default NearbyAcademies;
