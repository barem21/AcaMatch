import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";
import { Button, Form, message, Pagination, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import jwtAxios from "../../../apis/jwt";
import CustomModal from "../../../components/modal/Modal";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";

function AcademyList() {
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const currentUserInfo = useRecoilValue(userInfo);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [academyId, setAcademyId] = useState("");
  const [myAcademyList, setMyAcademyList] = useState([]);
  const navigate = useNavigate();

  console.log(currentUserInfo);

  //학원 목록
  const academyList = async () => {
    try {
      const res = await axios.get(
        `/api/academy/getAcademyListByUserId?signedUserId=${currentUserInfo.userId}`,
      );
      setMyAcademyList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //학원삭제 팝업
  const handleAcademyDelete = acaId => {
    setAcademyId(acaId);
    setIsModalVisible(true);
  };

  //학원 삭제
  const DeleteAcademy = async academyId => {
    //alert(academyId);
    try {
      //alert("학원 삭제" + acaId + currentUserInfo.userId);
      const res = await jwtAxios.delete(
        `/api/academy?acaId=${academyId}&userId=${currentUserInfo.userId}`,
      );
      //console.log(res.data.resultData);

      if (res.data.resultData === 1) {
        message.success("등록된 학원을 삭제하였습니다.");
        academyList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  //학원삭제 확인
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    DeleteAcademy(academyId);
    setIsModalVisible(false);
  };

  //학원 검색
  const onFinished = async values => {
    alert("search");
  };

  useEffect(() => {
    academyList();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <>
      <div className="flex gap-5 w-full justify-center align-top">
        <div className="w-full">
          <h1 className="title-admin-font">
            학원 관리
            <p>학원관리 &gt; 학원 등록/수정/삭제</p>
          </h1>

          <div className="board-wrap">
            <Form form={form} onFinish={values => onFinished(values)}>
              <div className="flex justify-between w-full p-3 border-b">
                <div className="flex items-center gap-1">
                  <label className="w-24 text-sm">학원 검색</label>
                  <Select
                    showSearch
                    placeholder="처리상태"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "0",
                        label: "대기중",
                      },
                      {
                        value: "1",
                        label: "등록완료",
                      },
                      {
                        value: "2",
                        label: "등록거부",
                      },
                    ]}
                  />
                  <input
                    type="text"
                    placeholder="검색어를 입력해 주세요."
                    className="input-admin-basic"
                  />
                  <Button className="btn-admin-basic">검색하기</Button>
                </div>
                <div className="flex gap-2">
                  <Select
                    showSearch
                    placeholder="40개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    // onChange={onChange}
                    // onSearch={onSearch}
                    options={[
                      {
                        value: "40",
                        label: "40개씩 보기",
                      },
                      {
                        value: "50",
                        label: "50개씩 보기",
                      },
                      {
                        value: "60",
                        label: "60개씩 보기",
                      },
                    ]}
                  />

                  <Button
                    className="btn-admin-basic"
                    onClick={() => navigate("/admin/academy/add")}
                  >
                    학원 신규등록
                  </Button>
                </div>
              </div>
            </Form>

            <div className="flex justify-between align-middle p-2 border-b">
              <div className="flex items-center justify-center w-3/4">
                학원명
              </div>
              <div className="flex items-center justify-center w-40">
                등록일
              </div>
              <div className="flex items-center justify-center w-40">
                연락처
              </div>
              <div className="flex items-center justify-center w-60">주소</div>
              <div className="flex items-center justify-center w-40">
                처리상태
              </div>
              {/*
              <div className="flex items-center justify-center w-40">
                강좌목록
              </div>
              */}
              <div className="flex items-center justify-center w-28">관리</div>
            </div>

            {myAcademyList?.length === 0 && (
              <div className="p-4 text-center border-b">
                등록된 학원이 없습니다.
              </div>
            )}
            {myAcademyList === null && (
              <div className="p-4 text-center border-b">
                등록된 학원이 없습니다.
              </div>
            )}

            {myAcademyList?.map((item, index) => (
              <div
                key={index}
                className="loop-content flex justify-between align-middle p-2 border-b"
              >
                <div className="flex justify-start items-center w-3/4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/academy/detail?id=${item.acaId}`)}
                  >
                    <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                      <img
                        src={
                          item.acaPic && item.acaPic !== "default_user.jpg"
                            ? `http://112.222.157.157:5223/pic/academy/${item.acaId}/${item.acaPic}`
                            : "/aca_image_1.png"
                        }
                        className="max-w-fit max-h-full object-cover"
                        alt=" /"
                      />
                    </div>
                    {item?.acaName}
                  </div>
                </div>
                <div className="flex items-center justify-center text-center w-40">
                  {item.createdAt.substr(0, 10)}
                </div>
                <div className="flex items-center justify-center text-center w-40">
                  010-0000-0000
                </div>
                <div className="flex items-center justify-center text-center w-60">
                  대구광역시 수성구 범어로 100
                </div>
                <div className="flex items-center justify-center w-40">
                  <p className="w-[80px] pb-[1px] rounded-md bg-[#90b1c4] text-white text-[12px] text-center">
                    승인완료
                  </p>
                </div>
                {/*
                <div className="flex items-center justify-center w-40">
                  <button
                    className="small_line_button"
                    onClick={() =>
                      navigate(`/mypage/academy/class?acaId=${item.acaId}`)
                    }
                  >
                    강좌목록
                  </button>
                </div>
                */}
                <div className="flex gap-4 items-center justify-center w-28">
                  <button
                    onClick={() =>
                      navigate(`/mypage/academy/edit?acaId=${item.acaId}`)
                    }
                  >
                    <FaPen className="w-3 text-gray-400" />
                  </button>
                  <button
                    //onClick={e => DeleteAcademy(item.acaId)}
                    onClick={e => handleAcademyDelete(item.acaId)}
                  >
                    <FaRegTrashAlt className="w-3 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center m-6 mb-10">
            <Pagination
              defaultCurrent={1}
              total={myAcademyList?.length}
              showSizeChanger={false}
            />
          </div>
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"학원 삭제하기"}
          content={"선택하신 학원을 삭제하시겠습니까?"}
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소하기"}
          button2Text={"삭제하기"}
          modalWidth={400}
        />
      </div>
    </>
  );
}

export default AcademyList;
