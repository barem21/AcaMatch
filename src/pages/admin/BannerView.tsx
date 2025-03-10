import { Form, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
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
  // const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bannerList, setBannerList] = useState<BannerItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);

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

  const handleBannerShowChange = async (banner: BannerItem, value: number) => {
    try {
      await jwtAxios.put(`/api/banner`, {
        acaId: banner.acaId,
        bannerPosition: banner.bannerPosition,
        bannerShow: value,
      });
      message.success("배너 상태가 변경되었습니다.");
      fetchBannerList(); // 변경 후 목록 갱신
    } catch (error) {
      console.error("Error updating banner show state:", error);
      message.error("배너 상태 변경에 실패했습니다.");
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

  const handleBannerClick = (banner: BannerItem) => {
    setSelectedBanner(banner);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedBanner(null);
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

  const getBannerPositionText = (position: number) => {
    switch (position) {
      case 1:
        return "상단 배너";
      case 2:
        return "중단 배너";
      case 3:
        return "좌측 배너";
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
                <label className="flex text-sm h-[32px] items-center">
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
                    src={`http://112.222.157.157:5233/pic/banner/${banner.acaId}/${getBannerPositionFolder(banner.bannerPosition)}/${banner.bannerPic}`}
                    alt={`배너 ${getBannerPositionText(banner.bannerPosition)}`}
                    className="w-[56px] h-[56px] object-cover rounded-md"
                  />
                  <div>
                    <h4
                      className="cursor-pointer hover:underline"
                      onClick={() => handleBannerClick(banner)}
                    >
                      {getBannerPositionText(banner.bannerPosition)}
                    </h4>
                  </div>
                </div>
              </div>

              {/* 노출 상태 드롭다운 */}
              <div className="flex items-center justify-center text-center w-[132px]">
                <Select
                  value={banner.bannerShow}
                  className="w-[100px] h-[28px] text-center text-[10px] [&_.ant-select-selection-item]:text-[14px]"
                  onChange={value => handleBannerShowChange(banner, value)}
                  options={[
                    { value: 1, label: "출력" },
                    { value: 0, label: "미출력" },
                  ]}
                />
              </div>

              {/* 삭제 버튼 */}
              <div className="flex gap-4 items-center justify-center w-[72px]">
                <button onClick={() => handleDelete(banner.bannerPosition)}>
                  <FaRegTrashAlt className="w-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모달: 선택한 배너 이미지 크게 보기 */}
      <Modal
        visible={isModalVisible}
        title="배너 이미지 보기"
        footer={null}
        onCancel={handleModalClose}
        centered
        getContainer={false}
      >
        {selectedBanner && (
          <div className="flex flex-col items-center">
            <img
              src={`http://112.222.157.157:5233/pic/banner/${selectedBanner.acaId}/${getBannerPositionFolder(selectedBanner.bannerPosition)}/${selectedBanner.bannerPic}`}
              alt="배너 이미지"
              className="max-w-full max-h-[600px] object-contain"
            />
            <p className="mt-4">
              {getBannerPositionText(selectedBanner.bannerPosition)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BannerView;
