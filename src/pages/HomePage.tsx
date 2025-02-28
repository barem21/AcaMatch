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
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

  const [defaultAcademies, setDefaultAcademies] = useState<Academy[]>([]);
  // const [isDefaultLoading, setIsDefaultLoading] = useState(true);

  // const [loading, setLoading] = useState(true); // 로딩 상태 추가

  const [popularTag, setPopularTag] = useState<Tag[]>([]);
  const [bestAcademyCards, setBestAcademyCards] = useState<BestAcademy[]>([]);

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
      // 🔥 학원별로 고유한 랜덤 숫자를 설정
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

  useEffect(() => {
    const fetchDefaultAcademies = async () => {
      // setIsDefaultLoading(true);
      try {
        const response = await axios.get("/api/academy/AcademyDefault");
        setDefaultAcademies(response.data.resultData);
        // console.log(response);
      } catch (error) {
        console.error(error);
      } finally {
        // setIsDefaultLoading(false);
      }
    };

    fetchDefaultAcademies();
  }, []);
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

  // const SkeletonCard = () => (
  //   <div className="flex flex-col gap-4">
  //     <Skeleton.Image
  //       active
  //       style={{
  //         width: "100%",
  //         height: "224px", // h-56과 동일
  //         borderRadius: "12px",
  //       }}
  //     />
  //     <div className="flex flex-col gap-3">
  //       <Skeleton.Input active style={{ width: "60%" }} />
  //       <div className="flex flex-col gap-1">
  //         <Skeleton.Input active size="small" style={{ width: "80%" }} />
  //         <Skeleton.Input active size="small" style={{ width: "40%" }} />
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex flex-col w-full items-center px-4 py-[36px] gap-8 mx-auto">
      {/* 메인 베너 */}
      <div
        className="w-[990px] h-[540px] max-[640px]:w-[360px] bg-gradient-to-b from-black/10 to-black/40 rounded-xl relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url(/main_banner.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-10 top-[216px] text-white">
          <h1 className="text-5xl font-black font-lexend mb-4">
            원하는 학원을 찾아보세요
          </h1>
          <p className="text-base font-normal">
            여러분의 학습 목표에 맞는 학원을 쉽고 빠르게 추천해 드립니다.
          </p>
        </div>
        <div
          className="absolute left-10 right-10 bottom-10 py-5 flex justify-center items-center w-[full]"
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
      <div className="w-full max-w-[990px]">
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
      <div className="w-full max-w-[990px]">
        <h2 className="text-2xl font-bold mb-6">이 학원 어떠신가요?</h2>
        {defaultAcademies && defaultAcademies.length > 0 ? (
          <div className="grid grid-cols-5 gap-6">
            {defaultAcademies.map(academy => (
              <div
                key={academy.acaId}
                className="flex flex-col gap-4 cursor-pointer"
                onClick={() => {
                  handleAcademyClick(academy.acaId);
                  // console.log(academy.acaId);
                }}
              >
                <img
                  src={getAcademyImageUrl(academy.acaId, academy.acaPic)}
                  alt={academy.acaName}
                  // effect="blur"
                  className="w-full h-[178px] rounded-xl object-cover"
                  // placeholderSrc="/image-placeholder.jpg" // 로딩 중 표시될 저해상도 이미지
                  // wrapperClassName="w-full h-[186px]"
                />
                <div>
                  <h3 className="font-medium text-base text-[#242424] truncate">
                    {academy.acaName}
                  </h3>
                  <p className="text-sm text-[#507A95] truncate">
                    {/* {academy.address} */}
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
          <p className="text-gray-500">추천할 학원이 존재하지 않습니다.</p>
        )}
      </div>

      {/* 베너 */}
      <div className="w-full max-w-[990px]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          // navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="rounded-xl"
        >
          <SwiperSlide>
            <div className="w-full h-[200px] bg-blue-500 rounded-xl"></div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-[200px] bg-red-500 rounded-xl"></div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-[200px] bg-green-500 rounded-xl"></div>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* 서비스 현황 */}
      <div className="w-full max-w-[990px]">
        <h2 className="text-2xl font-bold font-lexend mb-7">서비스 현황</h2>
        {service && service.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
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
                  <p className="text-sm text-[#507A95]">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">서비스 현황 정보가 존재하지 않습니다.</p>
        )}
      </div>

      {/* 화제가 되고 있는 학원 */}
      <div className="w-full max-w-[990px]">
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
    </div>
  );
}

export default HomePage;
