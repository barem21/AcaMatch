import { Pagination, Skeleton } from "antd";
import SideBar from "../components/SideBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

function HotAcademy() {
  // const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 쿼리스트링에서 page 값 읽기 (없으면 1로 설정)
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

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
    { label: "화제가 되고 있는 학원", isActive: true, link: "/hotAcademy" },
    { label: "주변에 있는 학원", isActive: false, link: "/nearby-academies" },
  ];

  const [academyData, setAcademyData] = useState<
    Array<{
      id: number;
      image: string;
      name: string;
      tags: string;
      likeCount: string;
      reviewCount: number;
      academyLikeCount: number;
    }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/academy/best?page=${currentPage}&size=${pageSize}`,
        );

        const updatedCards = response.data.resultData.map((item: any) => ({
          id: item.acaId,
          image: getAcademyImageUrl(item.acaId, item.acaPic),
          acaName: item.acaName || "학원 이름",
          tags: item.tagNames || "태그 정보 없음",
          starAvg: item.starAvg?.toFixed(1) || "0.0",
          reviewCount: item.reviewCount || 0,
          academyLikeCount: item.academyLikeCount,
        }));

        setAcademyData(updatedCards);
        setHasMore(updatedCards.length === pageSize);
      } catch (error) {
        console.error("Error fetching academy data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchParams]); // searchParams 의존성 유지

  // 스켈레톤 UI 표시 최적화
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (loading) {
      timeoutId = setTimeout(() => setShowSkeleton(true), 200);
    } else {
      setShowSkeleton(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) }); // URL의 쿼리스트링 업데이트
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex gap-5 w-full max-[768px]:flex-col max-[768px]:gap-0">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <div className="w-full max-[768px]:p-4">
        <h1 className="title-font flex justify-between align-middle max-[768px]:mb-3 max-[768px]:text-xl max-[768px]:mt-0">
          화제의 학원
        </h1>
        <div className="w-full gap-[12px] py-[16px] px-[16px] border rounded-lg overflow-hidden">
          <div className="flex flex-col gap-6">
            {/* 학원 목록 */}
            <div className="grid grid-cols-5 gap-6 h-[568px] max-[768px]:grid-cols-2 max-[768px]:h-auto max-[640px]:grid-cols-2 max-[640px]:h-auto">
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
              hasMore ? (currentPage + 1) * pageSize : currentPage * pageSize
            }
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

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
  // console.log("여기", academy);

  return (
    <div
      className="flex flex-col items-start pb-3 gap-3 w-[166px] cursor-pointer max-[768px]:w-full"
      onClick={() =>
        navigate(`/academy/detail?id=${academy.id}&page=1&size=10`)
      }
    >
      <div className="relative w-full max-[768px]:pb-[100%]">
        <img
          src={academy.image}
          alt={academy.acaName}
          className="w-[166px] h-[166px] rounded-xl object-cover max-[768px]:absolute max-[768px]:w-full max-[768px]:h-full"
        />
      </div>

      <div className="flex flex-col items-start w-full">
        <h3 className="text-base font-medium text-[#0E161B] leading-6 w-full line-clamp-1">
          {academy.acaName}
        </h3>
        <p className="text-sm text-[#507A95] leading-[21px] w-full ">
          <p className="line-clamp-1">{academy.tags}</p>
          <p className="text-sm line-clamp-1">
            {/* {console.log(academy.starAvg)} */}
            {academy.starAvg} ({academy.reviewCount} reviews)
          </p>
        </p>
      </div>
    </div>
  );
};

export default HotAcademy;
