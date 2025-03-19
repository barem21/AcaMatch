import { Button, Form, Input, message, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomModal from "../../components/modal/Modal";
import axios from "axios";
import { Cookies } from "react-cookie";
import { useRecoilValue } from "recoil";
import userInfo from "../../atoms/userInfo";
import Sms from "../../components/admin/Sms";

interface memberListType {
  birth: string;
  createdAt: string;
  email: string;
  name: string;
  nickName: string;
  phone: string;
  reportsCount: number;
  updatedAt: string;
  userId: number;
  userPic: string;
  userRole: number;
}

function MemberList(): JSX.Element {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const currentUserInfo = useRecoilValue(userInfo);
  const [searchParams] = useSearchParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [memberList, setMemberList] = useState<memberListType[]>([]); //회원목록
  const [memberCount, setMemberCount] = useState(0); //총 최원수
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState("");

  const state = parseInt(searchParams.get("state") || "0", 0);
  const search = searchParams.get("search");
  const showCnt = parseInt(searchParams.get("showCnt") || "10", 0);

  //회원삭제 팝업
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  //회원 목록
  const memberAllList = async (value: number) => {
    try {
      const res = await axios.get(
        `/api/user/search?page=${value}&size=${showCnt}`,
      );
      setMemberList(res.data.resultData.content);
      setMemberCount(res.data.resultData.totalElements); //총 회원수
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const onFinished = async (values: any) => {
    //console.log(values);
    setCurrentPage(1);

    try {
      const res = await axios.get(
        "/api/user/search?page=" +
          currentPage +
          (values.state ? "&userRole=" + values.state : "") +
          (values.search ? "&name=" + values.search : "") +
          (values.showCnt ? "&size=" + values.showCnt : ""),
      );
      if (res.data.resultData) {
        setMemberList(res.data.resultData.content);
        setMemberCount(res.data.resultData.totalElements); //총 회원수
      } else {
        setMemberList([]);
        setMemberCount(0);
      }
      //console.log(res.data.resultData);
    } catch (error) {
      console.log(error);
    }

    // 쿼리 문자열로 변환
    const queryParams = new URLSearchParams(values).toString();
    navigate(`?${queryParams}`); //쿼리스트링 url에 추가
  };

  const onChange = () => {
    setCurrentPage(1);
    form.submit();
  };

  //페이지 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page); // 페이지 변경
    memberAllList(page);
  };

  const handleSendMessage = (phone: string) => {
    setSelectedPhone(phone);
    setIsSmsModalOpen(true);
  };

  useEffect(() => {
    memberAllList(1);

    //페이지 들어오면 ant design 처리용 기본값 세팅
    form.setFieldsValue({
      state: state ? state : null,
      search: search ? search : "",
      showCnt: showCnt ? showCnt : 10,
    });
  }, []);

  useEffect(() => {
    if (!cookies.get("accessToken") || currentUserInfo.roleId === 1) {
      navigate("-");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          회원 관리
          <p>회원 관리 &gt; 회원 목록</p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between w-full p-3 border-b">
              <div className="flex items-center gap-1">
                <label className="w-24 text-sm">회원 검색</label>

                <Form.Item name="state" className="mb-0">
                  <Select
                    placeholder="전체"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    style={{ minWidth: "110px" }}
                    onChange={onChange}
                    options={[
                      {
                        value: "",
                        label: "전체",
                      },
                      {
                        value: 1,
                        label: "학생",
                      },
                      {
                        value: 2,
                        label: "학부모",
                      },
                      {
                        value: 3,
                        label: "학원 관계자",
                      },
                      {
                        value: 4,
                        label: "강사",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="search" className="mb-0">
                  <Input
                    className="input-admin-basic w-60"
                    placeholder="검색어를 입력해 주세요."
                  />
                </Form.Item>

                <Button htmlType="submit" className="btn-admin-basic">
                  검색하기
                </Button>
              </div>

              <div className="flex gap-2">
                <Form.Item name="showCnt" className="mb-0">
                  <Select
                    placeholder="10개씩 보기"
                    optionFilterProp="label"
                    className="select-admin-basic"
                    onChange={onChange}
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
              회원명/아이디
            </div>
            <div className="flex items-center justify-center w-40">닉네임</div>
            <div className="flex items-center justify-center w-40">
              회원유형
            </div>
            <div className="flex items-center justify-center w-40">가입일</div>
            <div className="flex items-center justify-center w-52">
              전화번호
            </div>
            <div className="flex items-center justify-center w-52">
              생년월일
            </div>
            <div className="flex items-center justify-center w-36">
              신고횟수
            </div>
            {/*<div className="flex items-center justify-center w-36">관리</div>*/}
          </div>

          {memberList?.length === 0 && (
            <div className="loop-content flex justify-center align-middle p-2 pl-3 border-b">
              등록된 회원이 없습니다.
            </div>
          )}

          {memberList?.map(item => (
            <div className="loop-content flex justify-between align-middle p-2 pl-3 border-b">
              <div className="flex justify-start items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-gray-300 overflow-hidden">
                    <img
                      src={
                        item.userPic
                          ? `http://112.222.157.157:5233/pic/user/${item.userId}/${item.userPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=" /"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-gray-500 text-[12px]">{item.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center w-40">
                {item.nickName}
              </div>
              <div className="flex items-center justify-center text-center w-40">
                {item.userRole === 0 && "관리자"}
                {item.userRole === 1 && "학생"}
                {item.userRole === 2 && "학부모"}
                {item.userRole === 3 && "학원 관계자"}
                {item.userRole === 4 && "강사"}
                {item.userRole === 5 && "??"}
              </div>
              <div className="flex items-center justify-center text-center w-40">
                {item.createdAt.substr(0, 10)}
              </div>
              <div className="flex flex-col items-center justify-center text-center w-52">
                {item.phone}
                <Sms to={item.phone} />
              </div>
              <div className="flex items-center justify-center text-center w-52">
                {item.birth}
              </div>
              <div className="flex items-center justify-center w-36">
                {item.reportsCount}회
              </div>

              {/*
            <div className="flex gap-4 items-center justify-center w-36">
              <button onClick={() => navigate(`../memberInfo?userId=0`)}>
                <FaPen className="w-3 text-gray-400" />
              </button>
              <button onClick={() => setIsModalVisible(true)}>
                <FaRegTrashAlt className="w-3 text-gray-400" />
              </button>
            </div>
            */}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            total={memberCount}
            current={currentPage} // 현재 페이지 번호
            pageSize={showCnt} // 한 페이지에 표시할 항목 수
            onChange={handlePageChange} // 페이지 변경 시 호출되는 핸들러
            showSizeChanger={false}
          />
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"회원 탈퇴"}
        content={"선택한 회원을 탈퇴시키겠습니까?"}
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text={"취소하기"}
        button2Text={"탈퇴처리"}
        modalWidth={400}
      />
    </div>
  );
}

export default MemberList;
