import { Form, Select, message, Pagination, Button, Upload } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwtAxios from "../../apis/jwt";
import CustomModal from "../../components/modal/Modal"; // CustomModal 추가
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";

interface PremiumAcademy {
  acaId: number;
  acaName: string;
  startDate: string;
  endDate: string;
  preCheck: number;
  bannerType: number;
  createdAt: string;
  countPremium: number;
}

const BannerContent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [premiumAcademies, setPremiumAcademies] = useState<PremiumAcademy[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);
  const { userId, roleId } = useRecoilValue(userInfo);

  // 쿼리스트링에서 현재 페이지와 페이지 크기를 가져오기
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 30;

  // 배너 등록 모달 관련 상태 추가
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [fileList, setFileList] = useState<{
    top: UploadFile[];
    bottom: UploadFile[];
    right: UploadFile[];
  }>({
    top: [],
    bottom: [],
    right: [],
  });
  const [selectedAcademy, setSelectedAcademy] = useState<number>(0);
  const [academyList, setAcademyList] = useState<
    { acaId: number; acaName: string }[]
  >([]);

  // 승인 상태 변경 관련 상태 추가
  const [selectedAcaId, setSelectedAcaId] = useState<number | null>(null);
  const [selectedBannerType, setSelectedBannerType] = useState<number | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 학원 목록 불러오기
  const fetchPremiumAcademies = async () => {
    try {
      let response;

      if (roleId === 3) {
        // 학원 관리자용 API
        response = await jwtAxios.get(`/api/academy/premium/bannerExist`, {
          params: {
            userId,
            page: currentPage,
            size: pageSize,
          },
        });
      } else {
        // 관리자용 기존 API
        response = await jwtAxios.get(`/api/academy/premium/bannerType`, {
          params: {
            page: currentPage,
            size: pageSize,
          },
        });

        // 관리자용 데이터 필터링
        const filteredAcademies = response.data.resultData.filter(
          (academy: PremiumAcademy) => "bannerType" in academy,
        );
        response.data.resultData = filteredAcademies;
      }

      const { resultData, totalItems } = response.data;
      setPremiumAcademies(resultData);
      setTotalItems(totalItems || resultData.length);
    } catch (error: any) {
      console.error("Error fetching premium academies:", error);
      message.error("프리미엄 학원 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleDelete = async (acaId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await jwtAxios.delete(`/api/academy/premium/${acaId}`);
      message.success("삭제되었습니다.");
      fetchPremiumAcademies(); // 목록 새로고침
    } catch (error) {
      console.error("Error deleting premium academy:", error);
      message.error("삭제에 실패했습니다.");
    }
  };

  // 페이지 변경 시 쿼리스트링 업데이트
  const onPageChange = (page: number) => {
    setSearchParams({ page: page.toString(), size: pageSize.toString() });
  };

  // 페이지 크기 변경 시 쿼리스트링 업데이트
  const onPageSizeChange = (size: number) => {
    setSearchParams({ page: "1", size: size.toString() }); // 변경 시 1페이지로 초기화
  };

  // 학원 목록 가져오기 함수 추가
  const fetchAcademyList = async () => {
    try {
      if (roleId === 3) {
        // 1. 현재 배너가 있는 학원 목록 가져오기
        const existingBannersResponse = await jwtAxios.get(
          `/api/academy/premium/bannerExist`,
          {
            params: {
              userId,
              page: 1,
              size: 1000,
            },
          },
        );

        // 2. 모든 프리미엄 학원 목록 가져오기
        const allAcademiesResponse = await jwtAxios.get(
          `/api/academy/premium/acaAdmin`,
          {
            params: {
              userId,
              page: 1,
              size: 1000,
            },
          },
        );

        // 3. 이미 배너가 있는 학원의 ID 목록 생성
        const existingBannerAcaIds = new Set(
          existingBannersResponse.data.resultData.map(
            (academy: any) => academy.acaId,
          ),
        );

        // 4. 배너가 없는 학원만 필터링
        const availableAcademies = allAcademiesResponse.data.resultData.filter(
          (academy: any) => !existingBannerAcaIds.has(academy.acaId),
        );

        setAcademyList(availableAcademies);
      } else {
        // 관리자용 로직 수정
        // 1. 현재 배너가 있는 학원 목록 가져오기
        const existingBannersResponse = await jwtAxios.get(
          `/api/academy/premium/bannerType`,
          {
            params: {
              page: 1,
              size: 1000,
            },
          },
        );

        // 2. 모든 프리미엄 학원 목록 가져오기
        const allAcademiesResponse = await jwtAxios.get(
          `/api/academy/premium/bannerType`,
          {
            params: {
              page: 1,
              size: 1000,
            },
          },
        );

        // 3. 이미 배너가 있는 학원의 ID 목록 생성
        const existingBannerAcaIds = new Set(
          existingBannersResponse.data.resultData
            .filter((academy: any) => "bannerType" in academy)
            .map((academy: any) => academy.acaId),
        );

        // 4. 배너가 없는 학원만 필터링
        const availableAcademies = allAcademiesResponse.data.resultData.filter(
          (academy: any) => !existingBannerAcaIds.has(academy.acaId),
        );

        setAcademyList(availableAcademies);
      }
    } catch (error: any) {
      console.error(
        "학원 목록 가져오기 실패:",
        error.response?.data || error.message,
      );
      message.error("학원 목록을 불러오는데 실패했습니다.");
    }
  };

  // 파일 업로드 전 검증
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("이미지 파일만 업로드 가능합니다!");
    }
    return false; // 자동 업로드 방지
  };

  // 파일 변경 핸들러 수정
  const handleChange = (position: "top" | "bottom" | "right", info: any) => {
    setFileList(prev => ({
      ...prev,
      [position]: info.fileList.slice(-1), // 각 위치당 1개의 이미지만 허용
    }));
  };

  // 배너 등록 함수 수정
  const handleBannerRegister = async () => {
    if (!selectedAcademy) {
      message.error("학원을 선택해주세요.");
      return;
    }

    const formData = new FormData();

    // 파일 추가
    if (fileList.top[0]?.originFileObj) {
      formData.append("topBannerPic", fileList.top[0].originFileObj);
    }
    if (fileList.bottom[0]?.originFileObj) {
      formData.append("bottomBannerPic", fileList.bottom[0].originFileObj);
    }
    if (fileList.right[0]?.originFileObj) {
      formData.append("rightBannerPic", fileList.right[0].originFileObj);
    }

    // req 객체를 JSON 문자열로 변환하여 추가
    const reqData = {
      acaId: selectedAcademy,
    };
    formData.append(
      "req",
      new Blob([JSON.stringify(reqData)], {
        type: "application/json",
      }),
    );

    try {
      await jwtAxios.post("/api/banner", formData, {
        headers: {
          // Content-Type을 설정하지 않음 (브라우저가 자동으로 설정)
          Accept: "application/json",
        },
      });

      message.success("배너가 등록되었습니다.");
      setIsRegisterModalOpen(false);
      setFileList({ top: [], bottom: [], right: [] });
      setSelectedAcademy(0);
      fetchPremiumAcademies();
    } catch (error) {
      console.error("배너 등록 실패:", error);
      message.error("배너 등록에 실패했습니다.");
    }
  };

  // 배너 등록 모달 열기 전에 학원 목록 가져오기
  const handleOpenRegisterModal = () => {
    fetchAcademyList();
    setIsRegisterModalOpen(true);
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
      await jwtAxios.put(`/api/banner/agree`, {
        acaId: selectedAcaId,
        bannerType: selectedBannerType,
      });

      message.success(
        selectedBannerType === 1 ? "승인되었습니다." : "승인 취소되었습니다.",
      );
      setIsModalOpen(false);
      fetchPremiumAcademies(); // 목록 새로고침
    } catch (error) {
      console.error("Error updating approval status:", error);
      message.error("승인 상태 변경에 실패했습니다.");
    }
  };

  // 컴포넌트 마운트 시 학원 목록 가져오기
  useEffect(() => {
    fetchPremiumAcademies();
  }, [currentPage, pageSize, roleId, userId]);

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
                <Button
                  className="btn-admin-basic"
                  onClick={handleOpenRegisterModal}
                >
                  + 배너등록
                </Button>
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
            {roleId !== 3 && (
              <div className="flex items-center justify-center w-[132px]">
                승인여부
              </div>
            )}
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
              {roleId !== 3 && (
                <div className="flex items-center justify-center w-[132px]">
                  <select
                    className="p-1 border rounded-lg"
                    value={academy.bannerType || 0}
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
              )}
              <div className="flex gap-4 items-center justify-center w-[72px]">
                <button onClick={() => handleDelete(academy.acaId)}>
                  <FaRegTrashAlt className="w-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            showSizeChanger={false}
            onChange={onPageChange}
          />
        </div>

        <CustomModal
          visible={isRegisterModalOpen}
          title="배너 등록"
          content={
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <label className="block mb-2">학원 선택</label>
                <Select
                  className="w-full"
                  placeholder={
                    academyList.length === 0
                      ? "등록 가능한 학원이 없습니다"
                      : "학원을 선택해주세요"
                  }
                  onChange={value => setSelectedAcademy(value)}
                  disabled={academyList.length === 0}
                >
                  {academyList.map(academy => (
                    <Select.Option key={academy.acaId} value={academy.acaId}>
                      {academy.acaName}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block mb-2">메인 배너</label>
                <Upload
                  listType="picture-card"
                  fileList={fileList.top}
                  onChange={info => handleChange("top", info)}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                >
                  {fileList.top.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </div>
              <div>
                <label className="block mb-2">모바일 배너</label>
                <Upload
                  listType="picture-card"
                  fileList={fileList.bottom}
                  onChange={info => handleChange("bottom", info)}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                >
                  {fileList.bottom.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </div>
              <div>
                <label className="block mb-2">우측 배너</label>
                <Upload
                  listType="picture-card"
                  fileList={fileList.right}
                  onChange={info => handleChange("right", info)}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                >
                  {fileList.right.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </div>
            </div>
          }
          onButton1Click={() => {
            setIsRegisterModalOpen(false);
            setFileList({ top: [], bottom: [], right: [] });
            setSelectedAcademy(0);
          }}
          onButton2Click={handleBannerRegister}
          button1Text="취소"
          button2Text="등록"
          modalWidth={500}
        />

        <CustomModal
          visible={isModalOpen}
          title="승인 상태 변경"
          content={
            <p className="mt-[15px]">
              {selectedBannerType === 1
                ? "승인하시겠습니까?"
                : "승인 취소하시겠습니까?"}
            </p>
          }
          onButton1Click={() => setIsModalOpen(false)}
          onButton2Click={confirmApprovalChange}
          button1Text="취소"
          button2Text="확인"
          modalWidth={400}
        />
      </div>
    </div>
  );
};

export default BannerContent;
