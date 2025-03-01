import { Form, Pagination, Select, message } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwtAxios from "../../apis/jwt";

interface BannerItem {
  acaId: number;
  acaName: string;
  bannerType: number;
  bannerPic: string;
  bannerPosition: number;
  bannerShow: number;
}

const BannerView = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bannerList, setBannerList] = useState<BannerItem[]>([]);

  const acaId = searchParams.get("acaId");

  const fetchBannerList = async () => {
    if (!acaId) return;

    try {
      const response = await jwtAxios.get(`/api/banner`, {
        params: { acaId },
      });
      const { resultData } = response.data;
      setBannerList(resultData);
    } catch (error) {
      console.error("Error fetching banner list:", error);
      message.error("배너 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleDelete = async (bannerPosition: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await jwtAxios.delete(`/api/banner`, {
        params: {
          acaId,
          bannerPosition,
        },
      });
      message.success("삭제되었습니다.");
      fetchBannerList();
    } catch (error) {
      console.error("Error deleting banner:", error);
      message.error("삭제에 실패했습니다.");
    }
  };

  const getBannerPositionText = (position: number) => {
    switch (position) {
      case 1:
        return "상단 배너";
      case 2:
        return "중단 배너";
      case 3:
        return "하단 배너";
      case 4:
        return "우측 배너";
      default:
        return "기타";
    }
  };

  useEffect(() => {
    if (acaId) {
      fetchBannerList();
    }
  }, [acaId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          프리미엄 학원 배너 관리
          <p>공지 및 콘텐츠 관리 {">"} 배너 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="text-sm">
                  학원명: {bannerList[0]?.acaName}
                </label>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-[75%]">
              배너위치
            </div>
            <div className="flex items-center justify-center w-[132px]">
              노출상태
            </div>
            <div className="flex items-center justify-center w-[132px]">
              수정하기
            </div>
            <div className="flex items-center justify-center w-[72px]">
              삭제
            </div>
          </div>

          {bannerList.map(banner => (
            <div
              key={banner.bannerPosition}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-[75%] h-[56px]">
                <div className="flex items-center gap-3">
                  <img
                    src={`http://112.222.157.157:5233/pic/academy/${banner.acaId}/${banner.bannerPic}`}
                    alt={`배너 ${getBannerPositionText(banner.bannerPosition)}`}
                    className="w-[56px] h-[56px] object-cover rounded-md"
                  />
                  <div>
                    <h4>{getBannerPositionText(banner.bannerPosition)}</h4>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center text-center w-[132px]">
                <p
                  className={`w-[80px] pb-[1px] rounded-md text-white text-[12px] text-center ${banner.bannerShow === 1 ? "bg-[#90b1c4]" : "bg-[#f8a57d]"}`}
                >
                  {banner.bannerShow === 1 ? "출력" : "미출력"}
                </p>
              </div>
              <div className="flex items-center justify-center w-[132px]">
                <p
                  className="w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/admin/banner-content/edit?acaId=${banner.acaId}&position=${banner.bannerPosition}`,
                    )
                  }
                >
                  수정하기
                </p>
              </div>
              <div className="flex gap-4 items-center justify-center w-[72px]">
                <button onClick={() => handleDelete(banner.bannerPosition)}>
                  <FaRegTrashAlt className="w-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerView;
