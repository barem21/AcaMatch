import styled from "@emotion/styled";
import { Button, Form, message, Pagination } from "antd";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import CustomModal from "../../components/modal/Modal";
import SideBar from "../../components/SideBar";
//import { getCookie } from "../../utils/cookie";

interface mypageChildListType {
  birth: string;
  certification: number;
  createdAt: string;
  email: string;
  name: string;
  phone: string;
  updatedAt: string;
  userId: number;
  userPic?: string;
}

function MypageParent() {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const [mypageChildList, setMypageChildList] = useState<mypageChildListType[]>(
    [],
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isModalVisible3, setIsModalVisible3] = useState(false);
  const currentUserInfo = useRecoilValue(userInfo);
  //const accessToken = getCookie("accessToken");
  //const [parentList, setParentList] = useState([]); //자녀 목록
  const navigate = useNavigate();

  const titleName = "마이페이지";
  let menuItems = [];
  switch (currentUserInfo.roleId) {
    case 2: //학부모
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "자녀 관리", isActive: true, link: "/mypage/child" },
        { label: "자녀 학원정보", isActive: false, link: "/mypage" },
        { label: "자녀 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
      break;
    default: //일반학생
      menuItems = [
        { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
        { label: "나의 학원정보", isActive: false, link: "/mypage" },
        { label: "보호자 정보", isActive: true, link: "/mypage/parent" },
        { label: "나의 성적확인", isActive: false, link: "/mypage/record" },
        { label: "나의 좋아요 목록", isActive: false, link: "/mypage/like" },
        { label: "나의 리뷰 목록", isActive: false, link: "/mypage/review" },
      ];
  }

  const ParentList = styled.div`
    button {
      display: none !important;
    }
    .addOk button,
    .title-font button,
    .small_line_button,
    .ant-form-item-control-input button,
    .showBtn {
      display: flex !important;
    }
  `;

  const AddParent = styled.div`
    input[type="text"] {
      margin-bottom: 15px;
    }
    div {
      display: flex;
      align-items: center;
      margin-bottom: 0px;
    }
    .ant-form-item-additional {
      width: 100%;
      font-size: 14px;
    }
    .ant-row,
    .ant-form-item-control-input {
      width: 100%;
    }
    .ant-col > label {
      width: 110px;
    }

    .ant-col > label::before {
      content: "" !important;
    }
    .ant-col > label::after {
      content: "*" !important;
      margin-top: 5px;
      color: #ff4400;
      font-size: 1.25rem;
    }
  `;

  const handleButton1Click = () => {
    form.resetFields(); //초기화
    setIsModalVisible(false);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  const handle2Button1Click = () => {
    setIsModalVisible2(false);
  };

  const handle2Button2Click = () => {
    setIsModalVisible2(false);
  };

  //부모등록요청 취소 관련
  const handle3Button1Click = () => {
    setIsModalVisible3(false);
  };

  const handle3Button2Click = () => {
    setIsModalVisible3(false);
  };

  //보호자 신청 목록 가져오기
  const myChildList = async () => {
    try {
      const res = await jwtAxios.get("/api/user/relationship/list/2");
      setMypageChildList(res.data.resultData);
      console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  //부모등록 전송하기
  const onFinished = async (values: any) => {
    try {
      const res = await jwtAxios.post("/api/user/relationship", values);
      //setMypageChildList(res.data.resultData);
      if (res.data.resultData === 1) {
        form.resetFields(); //초기화
        setIsModalVisible(false);
        setIsModalVisible2(true);
        form.resetFields(); //초기화
        myChildList();
      }
    } catch (error) {
      console.log(error);
      const customError = error as { status: number };
      if (customError.status === 404) {
        message.error("해당되는 정보가 없습니다. 이메일을 다시 확인해 주세요.");
      }
    }
  };

  //부모등록 취소하기
  const cancelRequest = async (values: any) => {
    try {
      const res = await jwtAxios.delete("/api/user/relationship", {
        data: { email: values },
      });
      if (res.data.resultData === 1) {
        //alert("delete ok");
        setIsModalVisible3(true);
        myChildList();
      }
      //console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    myChildList();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full max-[640px]:flex-col max-[640px]:gap-0">
      <SideBar menuItems={menuItems} titleName={titleName} />

      <ParentList className="w-full max-[640px]:p-4">
        <h1 className="title-font flex justify-between align-middle max-[640px]:mb-3 max-[640px]:text-xl max-[640px]:mt-0">
          보호자 정보
          <button
            className="flex items-center gap-1 mr-5 text-sm font-normal"
            onClick={() => setIsModalVisible(true)}
          >
            보호자 등록
            <FaPlusCircle />
          </button>
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-4 border-b max-[640px]:hidden">
            <div className="flex items-center justify-center w-full">
              보호자 정보
            </div>
            <div className="flex items-center justify-center min-w-32">
              요청일
            </div>
            <div className="flex items-center justify-center min-w-32">
              처리상태
            </div>
            <div className="flex items-center justify-center min-w-32">
              요청상태
            </div>
          </div>

          {mypageChildList?.length === 0 && (
            <div className="p-4 text-center border-b">
              등록된 보호자 정보가 없습니다.
            </div>
          )}

          {mypageChildList === null && (
            <div className="p-4 text-center">
              등록된 보호자 정보가 없습니다.
            </div>
          )}

          {mypageChildList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-4 border-b max-[640px]:flex-col max-[640px]:justify-start"
            >
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center align-middle w-14 h-14 bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={
                        item.userPic
                          ? `http://112.222.157.156:5223/pic/user/${item.userId}/${item.userPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center min-w-32 max-[640px]:w-full max-[640px]:justify-start max-[640px]:pl-[68px]">
                {item.createdAt.substr(0, 10)}
              </div>
              <div className="flex items-center justify-center min-w-32 max-[640px]:justify-start max-[640px]:pl-[68px]">
                {item.certification === 0 ? "승인대기" : "등록완료"}
              </div>
              <div className="flex items-center justify-center min-w-32 max-[640px]:justify-start max-[640px]:pl-[68px] max-[640px]:mt-2">
                {item.certification === 1 ? (
                  <span className="small_line_button bg-gray-200 opacity-50">
                    요청취소
                  </span>
                ) : (
                  <button
                    type="button"
                    className="showBtn small_line_button"
                    onClick={() => cancelRequest(item.email)}
                  >
                    요청취소
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={mypageChildList.length}
            showSizeChanger={false}
          />
        </div>

        <CustomModal
          visible={isModalVisible}
          title={"보호자 등록"}
          content={
            <AddParent>
              <h4 className="mb-3">부모님 이메일 주소를 입력해 주세요.</h4>
              <Form form={form} onFinish={values => onFinished(values)}>
                <Form.Item
                  name="email"
                  className="w-full"
                  rules={[
                    {
                      required: true,
                      message: "부모님 이메일을 입력해 주세요.",
                    },
                  ]}
                >
                  <input
                    maxLength={25}
                    placeholder="이메일 주소 입력"
                    className="w-full h-14 pl-3 border rounded-xl text-sm"
                  />
                </Form.Item>

                <div className="flex w-full gap-3 mt-4 justify-between">
                  <Form.Item>
                    <Button
                      className="w-full h-14 text-sm"
                      onClick={() => handleButton1Click()}
                    >
                      창닫기
                    </Button>
                  </Form.Item>

                  <Form.Item className="w-full">
                    <Button
                      htmlType="submit"
                      className="w-full h-14 bg-[#E8EEF3] text-sm"
                    >
                      요청하기
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </AddParent>
          }
          onButton1Click={handleButton1Click}
          onButton2Click={handleButton2Click}
          button1Text={"취소하기"}
          button2Text={"수정하기"}
          modalWidth={400}
        />

        <CustomModal
          visible={isModalVisible2}
          title={"보호자 등록 요청"}
          content={
            <div>
              <p>보호자 등록 요청이 완료되었습니다.</p>
              <div className="w-full mt-4 justify-between">
                <Form.Item className="mb-0">
                  <Button
                    className="w-full h-14 bg-[#E8EEF3] text-sm"
                    onClick={() => handle2Button1Click()}
                  >
                    창닫기
                  </Button>
                </Form.Item>
              </div>
            </div>
          }
          onButton1Click={handle2Button1Click}
          onButton2Click={handle2Button2Click}
          button1Text={"취소하기"}
          button2Text={"확인완료"}
          modalWidth={400}
        />

        <CustomModal
          visible={isModalVisible3}
          title={"보호자 등록요청 취소하기"}
          content={
            <div>
              <p>보호자 등록요청 취소가 완료되었습니다.</p>
              <div className="w-full mt-4 justify-between">
                <Form.Item className="mb-0">
                  <Button
                    className="w-full h-14 bg-[#E8EEF3] text-sm"
                    onClick={() => handle3Button1Click()}
                  >
                    창닫기
                  </Button>
                </Form.Item>
              </div>
            </div>
          }
          onButton1Click={handle3Button1Click}
          onButton2Click={handle3Button2Click}
          button1Text={"취소하기"}
          button2Text={"확인완료"}
          modalWidth={400}
        />
      </ParentList>
    </div>
  );
}

export default MypageParent;
