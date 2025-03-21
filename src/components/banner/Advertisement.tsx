import { useRef, useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface AdvertisementProps {
  id: string;
  height?: number;
}

interface Banner {
  acaId: number;
  acaName: string;
  bannerId: number;
  bannerUrl: string;
  bannerShow: number;
  bannerPosition: number;
  bannerPic: string;
  bannerType: number;
}

const Advertisement = ({ id, height = 300 }: AdvertisementProps) => {
  const swiperRef = useRef<SwiperType>();
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  // 오른쪽 배너 가져오기
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("/api/banner/all?page=1&size=1000");

        // bannerShow === 1 && bannerPosition === 4 && bannerType === 1 인 배너만 필터링
        const filteredBanners = response.data.resultData.filter(
          (banner: Banner) =>
            banner.bannerShow === 1 &&
            banner.bannerPosition === 4 &&
            banner.bannerType === 1,
        );

        setBanners(filteredBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);
  const handleAcademyClick = (acaId: number) => {
    navigate(`/academy/detail?id=${acaId}&page=1&size=10`);
  };

  return (
    <div
      className="w-[132px] border-2 border-[#999999] rounded-lg p-1"
      style={{ height: `${height + 50}px` }}
    >
      <div className="h-full flex flex-col">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full flex-1 rounded-lg"
          style={{ height: `${height}px` }}
          onBeforeInit={swiper => {
            swiperRef.current = swiper;
          }}
        >
          {banners.length > 0 ? (
            banners.map(banner => (
              <SwiperSlide key={banner.bannerId}>
                <img
                  src={`http://112.222.157.157:5233/pic/banner/${banner.acaId}/right/${banner.bannerPic}`}
                  alt="banner"
                  className="w-full h-full object-cover rounded-lg"
                  onClick={() => {
                    handleAcademyClick(Number(banner.acaId));
                    // console.log(banner.acaId);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white rounded-lg">
                광고 {id} - 등록된 배너가 없습니다.
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* 커스텀 네비게이션 버튼 */}
        <div className="flex justify-center gap-4 mt-4 h-[20px]">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="px-1 py-0 transition-colors"
          >
            <IoIosArrowBack size={20} />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="px-1 py-0 transition-colors"
          >
            <IoIosArrowForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advertisement;
