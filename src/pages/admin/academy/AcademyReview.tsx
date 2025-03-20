import { Form, message, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { GoStar, GoStarFill } from "react-icons/go";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import axios from "axios";
import { Cookies } from "react-cookie";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomModal from "../../../components/modal/Modal";

interface ademyReviewListType {
  classId: number;
  className: string;
  userId: number;
  writerName: string;
  writerPic: string;
  comment: string;
  star: number;
  createdAt: string;
  acaId: number;
  reviewCount: number;
  reviewId: number;
}

interface myAcademyListType {
  acaId: number;
  acaName: string;
}

function AcademyReview() {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const [academyReviewList, setAcademyReviewList] = useState<
    ademyReviewListType[]
  >([]); //학원리뷰 목록
  const [resultMessage, setResultMessage] = useState("");
  const [searchParams, _] = useSearchParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [myAcademyList, setMyAcademyList] = useState<myAcademyListType[]>([]);
  const [reviewId, setReviewId] = useState(0);
  const [reviewUserId, setReviewUserId] = useState(0);
  const { roleId, userId } = useRecoilValue(userInfo);
  const navigate = useNavigate();

  const acaId = parseInt(searchParams.get("acaId") || "0", 0);
  //const classId = parseInt(searchParams.get("classId") || "0", 0);
  const showCnt = parseInt(searchParams.get("showCnt") || "10", 0);

  //전체학원 목록
  const academyList = async () => {
    try {
      if (roleId === 0) {
        //전체 관리자일 때
        const res = await axios.get(`/api/menuOut/academy`);
        setMyAcademyList(res.data.resultData);
      } else {
        const res = await axios.get(
          `/api/academy/getAcademyListByUserId?signedUserId=${userId}`,
        );
        setMyAcademyList(res.data.resultData);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // acaId와 acaName만 남기기
  const simplifiedData = myAcademyList.map(
    ({ acaId: value, acaName: label }) => ({
      value,
      label,
    }),
  );

  //학원 텍스트 리뷰 목록
  const getReviewList = async (values: any) => {
    try {
      const res = await axios.get(
        `/api/review/academy/noPic?acaId=${values.acaId ? values.acaId : acaId}&page=1&size=${values.showCnt ? values.showCnt : showCnt}`,
      );
      setAcademyReviewList(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //리뷰 삭제하기
  const deleteReviewCheck = (reviewId: number, userId: number) => {
    setResultMessage(
      `리뷰를 삭제하시면 복구할 수 없습니다. 해당 리뷰를 삭제하시겠습니까?`,
    );
    setReviewId(reviewId);
    setReviewUserId(userId);
    setIsModalVisible(true);
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = async () => {
    try {
      const res = await axios.delete(
        `/api/review/me?userId=${reviewUserId}&reviewId=${reviewId}`,
      );
      if (res.data.resultData === 1) {
        message.success("해당 리뷰가 삭제되었습니다.");
        getReviewList({ acaId: acaId, showCnt: showCnt });
      }
      setReviewUserId(0); //초기화
      setReviewId(0); //초기화
      setIsModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onFinished = async (values: any) => {
    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가

    getReviewList(values);
  };

  const onChange = () => {
    //setCurrentPage(1);
    form.submit();
  };

  useEffect(() => {
    getReviewList({ acaId: 0, showCnt: 10 });
  }, [userId]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      acaId: acaId ? acaId : null,
      showCnt: 10,
    });

    academyList(); //학원 목록
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          학원 텍스트 리뷰
          <p>학원 관리 &gt; 학원 텍스트 리뷰</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="mr-3 text-sm">학원 선택</label>
                <Form.Item name="acaId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="학원 선택"
                    optionFilterProp="label"
                    className="select-admin-basic !min-w-52"
                    onChange={onChange}
                    options={simplifiedData}
                  />
                </Form.Item>
              </div>

              <div className="flex gap-2">
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    placeholder="10개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: 10,
                        label: "10개씩 보기",
                      },
                      {
                        value: 20,
                        label: "20개씩 보기",
                      },
                      {
                        value: 50,
                        label: "50개씩 보기",
                      },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>

          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              리뷰 내용
            </div>
            <div className="flex items-center justify-center min-w-28">
              삭제하기
            </div>
          </div>

          {!academyReviewList && (
            <div className="p-4 text-center border-b">
              등록된 학원리뷰가 없습니다.
            </div>
          )}
          {academyReviewList?.length === 0 && (
            <div className="p-4 text-center border-b">
              등록된 학원리뷰가 없습니다.
            </div>
          )}

          {academyReviewList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-2 border-b"
            >
              <div className="w-full">
                <div className="flex justify-between items-center mb-3 gap-3 pl-3">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex justify-center items-center w-12 h-12 border rounded-xl overflow-hidden">
                      <img
                        src={
                          item.writerPic
                            ? `http://112.222.157.157:5233/pic/user/${item.userId}/${item.writerPic}`
                            : "/aca_image_1.png"
                        }
                        className="max-w-fit max-h-20 object-cover"
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {item.writerName}
                      </div>
                      <div className="flex items-center justify-start gap-1">
                        <p className=" text-sm text-gray-500">
                          {item.createdAt.substr(0, 10)}
                        </p>

                        <div className="flex items-center gap-1 ml-2 mt-0.5">
                          {Array.from({ length: 5 }, (_, index) =>
                            index < item.star ? <GoStarFill /> : <GoStar />,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center min-w-28">
                    <button
                      className="small_line_button"
                      onClick={() =>
                        deleteReviewCheck(item.reviewId, item.userId)
                      }
                    >
                      삭제하기
                    </button>
                  </div>
                </div>

                <div className="p-3 pb-3.5 bg-gray-100 rounded-md">
                  <div className="text-lg font-bold">
                    {item.className ? item.className : "학원 정보가 없습니다."}
                  </div>
                  <div className="text-sm text-gray-500">{item.comment}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={academyReviewList?.length}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"리뷰 삭제하기"}
          content={<div className="addOk">{resultMessage}</div>}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소하기"}
          button2Text={"삭제하기"}
          modalWidth={400}
        />
      </div>
    </div>
  );
}

export default AcademyReview;
