import { Form, Pagination, Select, message } from "antd";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwtAxios from "../../apis/jwt";

interface PremiumAcademy {
  acaId: number;
  acaName: string;
  startDate: string;
  endDate: string;
  preCheck: number;
  createdAt: string;
}

const BannerContent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const [premiumAcademies, setPremiumAcademies] = useState<PremiumAcademy[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);

  const fetchPremiumAcademies = async () => {
    try {
      const response = await jwtAxios.get("/api/academy/premium");
      const { resultData } = response.data;
      setPremiumAcademies(resultData);
      setTotalItems(resultData.length);
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
      fetchPremiumAcademies(); // 목록 새로고침
    } catch (error) {
      console.error("Error deleting premium academy:", error);
      message.error("삭제에 실패했습니다.");
    }
  };

  const onFinished = async (values: any) => {
    console.log(values);

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    form.submit();
  };

  useEffect(() => {
    fetchPremiumAcademies();
    form.setFieldsValue({
      state: searchParams.get("state")
        ? parseInt(searchParams.get("state")!)
        : "all",
      search: "",
      showCnt: 40,
    });
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          프리미엄 학원 배너 관리
          <p>공지 및 콘텐츠 관리 {">"} 배너 관리</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="text-sm">
                  프리미엄 학원 등록개수 : 총 {totalItems}건
                </label>
              </div>

              <div className="flex gap-2">
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    placeholder="40개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: 40,
                        label: "40개씩 보기",
                      },
                      {
                        value: 50,
                        label: "50개씩 보기",
                      },
                      {
                        value: 60,
                        label: "60개씩 보기",
                      },
                    ]}
                  />
                </Form.Item>
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
                <div className="flex items-center gap-3 cursor-pointer">
                  <div>
                    <h4>{academy.acaName}</h4>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center text-center w-[200px]">
                {academy.startDate}
              </div>
              <div className="flex items-center justify-center text-center w-[200px]">
                {academy.endDate}
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
            defaultCurrent={1}
            total={totalItems}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default BannerContent;
