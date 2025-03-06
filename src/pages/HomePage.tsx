import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BsBuilding, BsClock } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/CustomInput ";
import MainButton from "../components/button/MainButton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getCookie } from "../utils/cookie";

interface Academy {
  acaId: number;
  acaPic: string;
  acaName: string;
  address: string;
  star: number;
  tagNames: string | null;
  reviewCount: number;
  starAvg: number;
}
interface BestAcademy {
  acaId: number;
  subject: string;
  description: string;
  reviews: string;
  questionsAnswered: string;
  link: string;
  image: string;
}

interface Tag {
  tagName: string;
}

interface Banner {
  acaId: number;
  acaName: string;
  bannerId: number;
  bannerUrl: string;
  bannerShow: number;
  bannerPosition: number;
  bannerPic: string;
}

// const usedRandomNumbers = new Set<number>();

// const getRandomUniqueNumber = () => {
//   if (usedRandomNumbers.size === 10) {
//     usedRandomNumbers.clear(); // 모든 숫자가 사용되면 초기화
//   }

//   let randomNum;
//   do {
//     randomNum = Math.floor(Math.random() * 10) + 1; // 1~10 사이의 랜덤 숫자
//   } while (usedRandomNumbers.has(randomNum));

//   usedRandomNumbers.add(randomNum);
//   return randomNum;
// };

function HomePage() {
  const navigate = useNavigate();

  // const [defaultAcademies, setDefaultAcademies] = useState<Academy[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  // const [isDefaultLoading, setIsDefaultLoading] = useState(true);

  // const [loading, setLoading] = useState(true); // 로딩 상태 추가

  const [popularTag, setPopularTag] = useState<Tag[]>([]);
  const [bestAcademyCards, setBestAcademyCards] = useState<BestAcademy[]>([]);

  const [academies, setAcademies] = useState<Academy[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const serviceStats = [
    {
      icon: BsClock,
      title: "최근 접속자 수",
      count: "0",
    },
    {
      icon: BsBuilding,
      title: "총 학원 수",
      count: "0",
    },
    {
      icon: LiaUserFriendsSolid,
      title: "등록 인원",
      count: "0",
    },
  ];
  const [service, setService] = useState(serviceStats);

  // const [isModalVisible, setIsModalVisible] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleButton1Click = () => {
    navigate(`academy?tagName=${searchValue}`);
  };
  const randomNumbersRef = useRef<{ [key: number]: number }>({});

  const getAcademyImageUrl = (acaId: number, pic: string) => {
    if (!pic || pic === "default.jpg") {
      // 학원별로 고유한 랜덤 숫자를 설정
      if (!randomNumbersRef.current[acaId]) {
        randomNumbersRef.current[acaId] = Math.floor(Math.random() * 10) + 1; // 1~10 사이 랜덤
      }
      return `/default_academy${randomNumbersRef.current[acaId]}.jpg`;
    }
    return `http://112.222.157.157:5233/pic/academy/${acaId}/${pic}`;
  };

  const handleAcademyClick = (acaId: number) => {
    navigate(`/academy/detail?id=${acaId}&page=1&size=10`);
  };

  const getBannerPositionFolder = (position: number) => {
    switch (position) {
      case 1:
        return "top";
      case 2:
        return "bottom";
      case 3:
        return "left";
      case 4:
        return "right";
      default:
        return "etc";
    }
  };

  // 거리별
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    setIsLoggedIn(!!accessToken);

    if (accessToken) {
      // 로그인한 유저라면 위치 정보를 가져옴
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        error => {
          console.error("위치 정보를 가져오는 데 실패했습니다.", error);
        },
      );
    }
  }, []);

  useEffect(() => {
    const fetchAcademies = async () => {
      try {
        let response;
        if (isLoggedIn && userLocation) {
          // 로그인 상태라면 "주변에 있는 학원" API 호출
          response = await axios.get("/api/academy/GetAcademyListByDistance", {
            params: {
              lat: userLocation.lat,
              lon: userLocation.lon,
            },
          });
        } else {
          // 로그인하지 않았다면 기존 추천 학원 목록 사용
          response = await axios.get("/api/academy/AcademyDefault");
        }

        setAcademies(response.data.resultData);
      } catch (error) {
        console.error("학원 목록을 가져오는 데 실패했습니다.", error);
      }
    };

    if (isLoggedIn) {
      fetchAcademies();
    }
  }, [isLoggedIn, userLocation]);

  // 배너 데이터 가져오기
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("/api/banner/all");

        // bottom(2) 위치의 배너만 필터링
        const filteredBanners = response.data.resultData.filter(
          (banner: Banner) =>
            banner.bannerShow === 1 &&
            getBannerPositionFolder(banner.bannerPosition) === "bottom",
        );

        setBanners(filteredBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const fetchDefaultAcademies = async () => {
      // setIsDefaultLoading(true);
      try {
        const response = await axios.get("/api/academy/popularSearch");
        setPopularTag(response.data.resultData);
        // console.log(response);
      } catch (error) {
        console.error("Error fetching default academies:", error);
      } finally {
        // setIsDefaultLoading(false);
      }
    };

    fetchDefaultAcademies();
  }, []);

  // useEffect(() => {
  //   const fetchDefaultAcademies = async () => {
  //     // setIsDefaultLoading(true);
  //     try {
  //       const response = await axios.get("/api/academy/AcademyDefault");
  //       setDefaultAcademies(response.data.resultData);
  //       // console.log(response);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       // setIsDefaultLoading(false);
  //     }
  //   };

  //   fetchDefaultAcademies();
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/access-log");
        // console.log(res);

        setService(prevService =>
          prevService.map(item =>
            item.title === "최근 접속자 수"
              ? { ...item, count: res.data.resultData }
              : item,
          ),
        );
      } catch (error) {
        console.log(error);
      }
    };

    const fetchData2 = async () => {
      try {
        await axios.post("/api/access-log");
        // console.log("작동중", res);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchData3 = async () => {
      try {
        const res = await axios.get("/api/academy/GetAcademyCount");
        // console.log("작동중", res);

        setService(prevService =>
          prevService.map(item => {
            if (item.title === "총 학원 수") {
              return { ...item, count: res.data.resultData.academyCount };
            } else if (item.title === "등록 인원") {
              return { ...item, count: res.data.resultData.userCount };
            }
            return item;
          }),
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchData2();
    fetchData();
    fetchData3();
  }, []);

  //화제의 학원
  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true); // 데이터 로딩 시작
      try {
        const response = await axios.get("/api/academy/best", {
          params: { page: 1, size: 4 },
        });
        // console.log("작동중", response);

        const updatedCards: BestAcademy[] = response.data.resultData.map(
          (item: any) => ({
            acaId: item.acaId,
            subject: item.acaName || "학원명",
            description: item.tagNames || "태그 정보 없음",
            reviews: `${item.starAvg.toFixed(1)} (${item.reviewCount} reviews)`,
            questionsAnswered: item.questionsAnswered || "질문 정보 없음",
            link: "/",
            image: getAcademyImageUrl(item.acaId, item.acaPic),
          }),
        );

        setBestAcademyCards(updatedCards);
        // console.log(updatedCards);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        // setLoading(false); // 데이터 로딩 완료
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full items-center px-4 py-[36px] max-[640px]:py-[16px] gap-8 mx-auto">
      {/* 메인 베너 */}
      <div
        className="w-[990px] h-[540px] max-[640px]:w-[330px] max-[640px]:h-[400px] bg-gradient-to-b from-black/10 to-black/40 rounded-xl relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url(/main_banner.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-10 max-[640px]:left-5 top-[216px] max-[640px]:top-[175px] text-white">
          <h1 className="text-2xl min-[640px]:text-4xl font-black font-lexend mb-4">
            원하는 학원을 찾아보세요
          </h1>
          <p className="text-sm min-[640px]:text-base max-[640px]:w-[290px] font-normal">
            여러분의 학습 목표에 맞는 학원을 쉽고 빠르게 추천해 드립니다.
          </p>
        </div>
        <div
          className="absolute left-10 max-[640px]:left-5 right-10 max-[640px]:right-5 max-[640px]:bottom-5 bottom-10 py-5 flex justify-center items-center w-[full]"
          onKeyDown={e => {
            if (e.key === "Enter") handleButton1Click(); // 엔터 입력 시 버튼 클릭
          }}
        >
          <CustomInput
            placeholder="태그를 입력해 주세요"
            width="100%"
            height="64px"
            borderRadius="12px"
            padding="0 46px 0 36px"
            focusOutline="none"
            focusBorder="none"
            border="none"
            value={searchValue}
            onChange={handleInputChange}
          >
            <CiSearch className="text-[24px] font-bold  text-brand-placeholder absolute left-[10px] bottom-[40px] " />

            <MainButton
              className="py-5 text-white w-[95px] h-[48px] absolute right-[8px] bottom-[28px] z-10"
              onClick={handleButton1Click}
              type="primary"
            >
              검색
            </MainButton>
          </CustomInput>
        </div>
      </div>

      {/* 인기 태그 */}
      <div className="w-full max-w-[990px] ">
        <h2 className="text-2xl font-bold mb-6">인기 태그</h2>
        <div className="flex flex-wrap gap-5 justify-start items-center">
          {popularTag && popularTag.length > 0 ? (
            popularTag.map((subject, index) => (
              <div
                key={index}
                className="bg-brand-BTWhite hover:bg-brand-BTWhiteHover px-4 py-1.5 rounded-xl flex-row-center cursor-pointer"
                onClick={() =>
                  navigate(`academy?tagName=${subject.tagName}&page=1&size=10`)
                }
              >
                <span className="text-sm font-medium">{subject.tagName}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">인기 태그가 존재하지 않습니다.</p>
          )}
        </div>
      </div>

      <div className="w-full max-w-[990px] max-[640px]:hidden">
        <h2 className="text-2xl font-bold mb-6">
          {isLoggedIn ? "주변에 있는 학원" : "이 학원 어떠신가요?"}
        </h2>
        {academies && academies.length > 0 ? (
          <div className="grid grid-cols-5 gap-6">
            {academies.map(academy => (
              <div
                key={academy.acaId}
                className="flex flex-col gap-4 cursor-pointer"
                onClick={() => {
                  handleAcademyClick(academy.acaId);
                  // console.log(academy.acaId);
                }}
              >
                <img
                  src={`http://112.222.157.157:5233/pic/academy/${academy.acaId}/${academy.acaPic}`}
                  alt={academy.acaName}
                  className="w-full h-[178px] rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-medium text-base text-[#242424] truncate">
                    {academy.acaName}
                  </h3>
                  <p className="text-sm text-[#507A95] truncate">
                    {academy.tagNames || "태그 정보 없음"}
                  </p>
                  <p className="text-sm text-[#507A95]">
                    {academy.starAvg?.toFixed(1)}&nbsp; ({academy.reviewCount}{" "}
                    reviews)
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            {isLoggedIn
              ? "주변 학원이 존재하지 않습니다."
              : "추천할 학원이 존재하지 않습니다."}
          </p>
        )}
      </div>

      {/* 모바일용 */}
      <div className="w-full max-[640px]:w-[330px] min-[640px]:hidden">
        <h2 className="text-2xl font-bold mb-6">
          {isLoggedIn ? "주변에 있는 학원" : "이 학원 어떠신가요?"}
        </h2>
        {academies && academies.length > 0 ? (
          <Swiper
            modules={[FreeMode]}
            slidesPerView={"auto"} // 자동으로 크기 조정
            spaceBetween={16} // 각 카드 사이의 간격
            freeMode={true} // 드래그 이동 가능
            grabCursor={true} // 마우스 커서 손모양
            className="overflow-visible"
          >
            {academies.map(academy => (
              <SwiperSlide
                key={academy.acaId}
                className="w-[160px] flex-shrink-0"
              >
                <div
                  className="flex flex-col gap-4 cursor-pointer"
                  onClick={() => handleAcademyClick(academy.acaId)}
                >
                  <img
                    src={getAcademyImageUrl(academy.acaId, academy.acaPic)}
                    alt={academy.acaName}
                    className="w-full h-[160px] rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-base text-[#242424] truncate">
                      {academy.acaName}
                    </h3>
                    <p className="text-sm text-[#507A95] truncate">
                      {academy.tagNames || "태그 정보 없음"}
                    </p>
                    <p className="text-sm text-[#507A95]">
                      {academy.starAvg?.toFixed(1)}&nbsp; ({academy.reviewCount}{" "}
                      reviews)
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-gray-500">추천할 학원이 존재하지 않습니다.</p>
        )}
      </div>

      {/* 베너 */}
      <div className="w-full max-w-[990px]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="rounded-xl"
        >
          {banners.length > 0 ? (
            banners.map(banner => (
              <SwiperSlide key={banner.bannerId}>
                <img
                  src={`http://112.222.157.157:5233/pic/banner/${banner.acaId}/bottom/${banner.bannerPic}`}
                  alt="banner"
                  className="w-full h-[200px] bg-gray-300 rounded-xl object-cover"
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="w-full h-[200px] bg-gray-300 rounded-xl flex items-center justify-center">
                <p className="text-white">등록된 배너가 없습니다.</p>
              </div>
            </SwiperSlide>
          )}
          <SwiperSlide>
            {/* <div className="w-full h-[200px] bg-blue-500 rounded-xl"></div> */}
            <img
              src="/ai2.png"
              alt="main_banner"
              className="w-full h-[200px] bg-blue-500 rounded-xl"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/ai1.png"
              alt="main_banner"
              className="w-full h-[200px] bg-blue-500 rounded-xl"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {/* 서비스 현황 */}
      <div className="w-full max-w-[990px]">
        <h2 className="text-2xl font-bold font-lexend mb-7">서비스 현황</h2>
        {service && service.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 max-[640px]:grid-cols-1">
            {service.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 p-4 bg-[#F8FAFB] border border-[#D1DDE6] rounded-lg"
              >
                <stat.icon className="w-6 h-6 text-[#242424]" />
                <div>
                  <h3 className="text-base font-bold text-[#242424]">
                    {stat.title}
                  </h3>
                  <p className="text-sm text-[#507A95] max-[640px]:text-xs">
                    {stat.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">서비스 현황 정보가 존재하지 않습니다.</p>
        )}
      </div>

      {/* 화제가 되고 있는 학원 */}
      <div className="w-full max-w-[990px] max-[640px]:hidden">
        <h2 className="text-2xl font-bold mb-7">화제가 되고 있는 학원</h2>
        {bestAcademyCards && bestAcademyCards.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {bestAcademyCards.map((card, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 cursor-pointer"
                onClick={() => handleAcademyClick(Number(card.acaId))}
              >
                <img
                  className="h-56 bg-gray-200 rounded-xl object-cover"
                  src={card.image}
                  alt={card.subject}
                />
                <div className="flex flex-col">
                  <h3 className="font-medium text-base text-[#242424]">
                    {card.subject || "학원명 없음"}
                  </h3>
                  <div className="text-sm text-[#507A95]">
                    <p className="text-[14px] line-clamp-1">
                      {card.description || "태그 정보 없음"}
                    </p>
                    <p className="text-[14px] line-clamp-1">
                      {card.reviews || "리뷰 정보 없음"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            화제가 되고 있는 학원이 존재하지 않습니다.
          </p>
        )}
      </div>

      {/* 화제가 되고 있는 학원 (모바일) */}
      <div className="w-full max-[640px]:w-[330px] min-[640px]:hidden">
        <h2 className="text-2xl font-bold mb-6">화제가 되고 있는 학원</h2>
        {bestAcademyCards && bestAcademyCards.length > 0 ? (
          <Swiper
            modules={[FreeMode]}
            slidesPerView={"auto"} // 자동으로 크기 조정
            spaceBetween={16} // 각 카드 사이의 간격
            freeMode={true} // 드래그 이동 가능
            grabCursor={true} // 마우스 커서 손모양
            className="overflow-visible"
          >
            {bestAcademyCards.map((card, index) => (
              <SwiperSlide key={index} className="w-[160px] flex-shrink-0">
                <div
                  className="flex flex-col gap-4 cursor-pointer"
                  onClick={() => handleAcademyClick(Number(card.acaId))}
                >
                  <img
                    className="h-[160px] bg-gray-200 rounded-xl object-cover"
                    src={card.image}
                    alt={card.subject}
                  />
                  <div className="flex flex-col">
                    <h3 className="font-medium text-base text-[#242424] truncate">
                      {card.subject || "학원명 없음"}
                    </h3>
                    <div className="text-sm text-[#507A95]">
                      <p className="text-[14px] line-clamp-1">
                        {card.description || "태그 정보 없음"}
                      </p>
                      <p className="text-[14px] line-clamp-1">
                        {card.reviews || "리뷰 정보 없음"}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-gray-500">
            화제가 되고 있는 학원이 존재하지 않습니다.
          </p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
