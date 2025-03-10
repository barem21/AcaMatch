import { Form, Select, message, Pagination } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwtAxios from "../../apis/jwt";
import CustomModal from "../../components/modal/Modal"; // CustomModal 추가

interface PremiumAcademy {
  acaId: number;
  acaName: string;
  startDate?: string;
  endDate?: string;
  preCheck: number;
  createdAt: string;
  bannerType?: number; // bannerType이 없을 수도 있으므로 선택적(`?`) 속성으로 설정
}

const BannerContent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const [premiumAcademies, setPremiumAcademies] = useState<PremiumAcademy[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30); // 기본값: 30개씩 보기

  // 승인/미승인 모달 관련 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcaId, setSelectedAcaId] = useState<number | null>(null);
  const [selectedBannerType, setSelectedBannerType] = useState<number | null>(
    null,
  );

  // 학원 목록 불러오기 (페이지네이션 적용)
  const fetchPremiumAcademies = async (page = 1, size = pageSize) => {
    try {
      const response = await jwtAxios.get("/api/academy/premium", {
        params: { page, size },
      });
      const { resultData, totalCount } = response.data;

      // bannerType이 없는 항목 제외
      const filteredData = resultData.filter(
        (academy: PremiumAcademy) => academy.bannerType !== undefined,
      );

      setPremiumAcademies(filteredData);
      setTotalItems(totalCount || filteredData.length);
    } catch (error) {
      console.error("Error fetching premium academies:", error);
      message.error("프리미엄 학원 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleDelete = async (acaId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await jwtAxios.delete(`/api/academy/premium/${acaId}`);
      message.success("삭제되었습니다.");
      fetchPremiumAcademies(currentPage, pageSize); // 목록 새로고침
    } catch (error) {
      console.error("Error deleting premium academy:", error);
      message.error("삭제에 실패했습니다.");
    }
  };

  // 승인 상태 변경 시 모달 띄우기
  const handleApprovalChange = (bannerType: number, acaId: number) => {
    setSelectedAcaId(acaId);
    setSelectedBannerType(bannerType);
    setIsModalOpen(true);
  };

  // 승인/미승인 API 호출
  const confirmApprovalChange = async () => {
    if (selectedAcaId === null || selectedBannerType === null) return;

    try {
      await jwtAxios.put("/api/banner/agree", {
        acaId: selectedAcaId,
        bannerType: selectedBannerType,
      });

      message.success(
        selectedBannerType === 1 ? "승인되었습니다." : "승인 취소되었습니다.",
      );
      setIsModalOpen(false);
      fetchPremiumAcademies(currentPage, pageSize); // 목록 새로고침
    } catch (error) {
      console.error("Error updating approval status:", error);
      message.error("승인 상태 변경에 실패했습니다.");
    }
  };

  // 페이지 변경 시 데이터 새로 불러오기
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    fetchPremiumAcademies(page, pageSize);
  };

  // 출력 개수 변경 시 데이터 새로 불러오기
  const onPageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 페이지를 1페이지로 초기화
    fetchPremiumAcademies(1, size);
  };

  useEffect(() => {
    fetchPremiumAcademies(currentPage, pageSize);
  }, []);

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
                  프리미엄 학원 등록개수 : 총 {totalItems}건
                </label>
              </div>

              <div className="flex gap-2">
                <Select
                  value={pageSize}
                  className="select-admin-basic"
                  onChange={onPageSizeChange}
                  options={[
                    { value: 30, label: "30개씩 보기" },
                    { value: 40, label: "40개씩 보기" },
                    { value: 50, label: "50개씩 보기" },
                  ]}
                />
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-[100%]">
              제목
            </div>
            <div className="flex items-center justify-center w-[200px]">
              시작일
            </div>
            <div className="flex items-center justify-center w-[200px]">
              종료일
            </div>
            <div className="flex items-center justify-center w-[132px]">
              상세보기
            </div>
            <div className="flex items-center justify-center w-[132px]">
              승인여부
            </div>
            <div className="flex items-center justify-center w-[72px]">
              삭제
            </div>
          </div>

          {premiumAcademies.map(academy => (
            <div
              key={academy.acaId}
              className="loop-content flex justify-between align-middle p-2 pl-3 border-b"
            >
              <div className="flex justify-start items-center w-[100%] h-[56px]">
                <h4>{academy.acaName}</h4>
              </div>
              <div className="flex items-center justify-center w-[200px]">
                {academy.startDate || "-"}
              </div>
              <div className="flex items-center justify-center w-[200px]">
                {academy.endDate || "-"}
              </div>
              <div className="flex items-center justify-center w-[132px]">
                <p
                  className="w-[80px] pb-[1px] rounded-md text-[12px] text-center border border-gray-300 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/admin/banner-content/view?acaId=${academy.acaId}`,
                    )
                  }
                >
                  상세보기
                </p>
              </div>
              <div className="flex items-center justify-center w-[132px]">
                <select
                  className="p-1 border rounded-lg"
                  value={academy.bannerType}
                  onChange={e =>
                    handleApprovalChange(
                      parseInt(e.target.value),
                      academy.acaId,
                    )
                  }
                >
                  <option value={0}>미승인</option>
                  <option value={1}>승인</option>
                </select>
              </div>
              <div className="flex gap-4 items-center justify-center w-[72px]">
                <button onClick={() => handleDelete(academy.acaId)}>
                  <FaRegTrashAlt className="w-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 유지 */}
        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onChange={onPageChange}
          />
        </div>

        {/* CustomModal 유지 */}
        <CustomModal
          visible={isModalOpen}
          title="승인 상태 변경"
          content={
            selectedBannerType === 1
              ? "승인하시겠습니까?"
              : "승인 취소하시겠습니까?"
          }
          onButton1Click={() => setIsModalOpen(false)}
          onButton2Click={confirmApprovalChange}
          button1Text="취소"
          button2Text="확인"
        />
      </div>
    </div>
  );
};

export default BannerContent;
