import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useSwiper } from "swiper/react";
import "swiper/css";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface AdvertisementProps {
  id: string;
  height?: number;
}

// const advertisements = [
//   { id: 1, imageUrl: '/ad1.jpg' },
//   { id: 2, imageUrl: '/ad2.jpg' },
//   { id: 3, imageUrl: '/ad3.jpg' },
// ];

// // ... 그리고 SwiperSlide 내부에서:
// <div
//   className="w-full h-full rounded-lg bg-cover bg-center"
//   style={{ backgroundImage: `url(${ad.imageUrl})` }}
// >
// </div>

const Advertisement = ({ id, height = 300 }: AdvertisementProps) => {
  const swiperRef = useRef<SwiperType>();

  const advertisements = [
    { id: 1, color: "bg-blue-500" },
    { id: 2, color: "bg-red-500" },
    { id: 3, color: "bg-green-500" },
  ];

  return (
    <div
      className="w-1/2 border-2 border-[#999999] rounded-lg p-1"
      style={{ height: `${height + 50}px` }}
    >
      <div className="h-full flex flex-col">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          // autoplay={
          //   {
          //     // delay: 3000,
          //     // disableOnInteraction: false,
          //   }
          // }
          loop={true}
          className="w-full flex-1 rounded-lg"
          style={{ height: `${height}px` }}
          onBeforeInit={swiper => {
            swiperRef.current = swiper;
          }}
        >
          {advertisements.map(ad => (
            <SwiperSlide key={ad.id}>
              <div
                className={`w-full h-full ${ad.color} rounded-lg flex items-center justify-center text-white`}
              >
                광고 {id}-{ad.id}
              </div>
            </SwiperSlide>
          ))}
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
