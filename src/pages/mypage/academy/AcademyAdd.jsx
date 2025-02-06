import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Form, Image, Input, message, TimePicker, Upload } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../../apis/jwt";
import userInfo from "../../../atoms/userInfo";
import CustomModal from "../../../components/modal/Modal";
import SideBar from "../../../components/SideBar";

const AcademyInfo = styled.div`
  .ant-form-item-label {
    display: flex;
    justify-content: flex-start;
    padding-top: 14px;
  }
  .ant-form-item-label label {
    min-width: 130px !important;
  }
  .ant-form-item-required::before {
    content: "" !important;
  }
  .ant-form-item-required::after {
    content: "*" !important;
    font-size: 1.25rem;
    color: #ff3300;
  }
  .ant-form-item-label label::after {
    content: "";
  }

  .ant-form-item-control-input-content {
    .input-wrap {
      display: flex;
      justify-content: flex-start;
      gap: 15px;
      align-items: center;
    }
    .flex-start {
      align-items: flex-start;
    }
    label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 130px !important;
    }
    label span {
      height: 24px;
      margin-left: 5px;
      color: #ff3300;
      font-size: 1.25rem;
    }
    input {
      height: 56px;
    }
    textarea {
      padding: 15px 12px;
    }

    .input,
    .ant-input-password {
      border-radius: 12px;
    }

    span.readonly {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0px 11px;
      border-radius: 12px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 0.9rem;
    }
  }
  .ant-input-affix-wrapper,
  .ant-picker {
    padding: 0px 11px;
  }
  .ant-input-status-error {
    border: 1px solid #3b77d8 !important;
  }
  .ant-form-item-explain-error {
    padding-left: 12px;
    color: #3b77d8;
    font-size: 0.85rem;
  }
  .ant-upload-list-item {
    border: 1px solid #3b77d8 !important;
  }
`;

const TagListSelect = styled.div`
  input[type="checkbox"] {
    display: none;
  }
  input[type="checkbox"] + label {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #eee;
    padding: 4px 15px 6px 15px;
    border-radius: 50px;
    cursor: pointer;
  }
  input[type="checkbox"]:checked + label {
    background-color: #666;
    color: #fff;
  }
`;

const menuItems = [
  { label: "회원정보 관리", isActive: false, link: "/mypage/user" },
  { label: "학원정보 관리", isActive: true, link: "/mypage/academy" },
  /*
  {
    label: "학원학생 관리",
    isActive: false,
    link: "/mypage/academy/student",
  },
  */
  {
    label: "학원리뷰 목록",
    isActive: false,
    link: "/mypage/academy/review",
  },
  { label: "좋아요 목록", isActive: false, link: "/mypage/academy/like" },
];

function AcademyAdd() {
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tagKeyword, setTagKeyword] = useState(""); //태그검색 키워드
  const [tagList, setTagList] = useState([]); //태그목록(전체/검색결과)
  const [selectedItems, setSelectedItems] = useState([]); //선택한 태그값
  const [fileList, setFileList] = useState([]);

  const currentUserInfo = useRecoilValue(userInfo);
  const navigate = useNavigate();

  // 체크박스 클릭 시 선택/해제 처리
  const handleCheckbox2Change = value => {
    setSelectedItems(
      prevSelectedItems =>
        prevSelectedItems.includes(value)
          ? prevSelectedItems.filter(item => item !== value) // 이미 선택된 항목이면 제거
          : [...prevSelectedItems, value], // 선택되지 않은 항목이면 추가
    );
  };

  // 선택한 항목 제거
  const handleRemoveItem = value => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.filter(item => item !== value),
    );
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: data => {
        form.setFieldsValue({ postNum: data.zonecode });
        form.setFieldsValue({ address: data.address });
      },
    }).open();
  };

  const handleButton1Click = () => {
    setIsModalVisible(false);
  };

  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  //모달창에서 태그 검색하기
  const handleTagSearch = () => {
    setIsModalVisible(true);
  };

  //태그 전체목록 가져오기
  const getTagList = async () => {
    try {
      const res = await axios.get("/api/tag");
      setTagList(res.data.resultData.selTagList);
    } catch (error) {
      console.log(error);
    }
  };

  //태그검색
  const handleTagSearchForm = e => {
    e.preventDefault();

    const tagSearch = async () => {
      try {
        const res = await axios.get(`/api/tag?searchTag=${tagKeyword}`);
        setTagList(res.data.resultData.selTagList);
      } catch (error) {
        console.log(error);
      }
    };
    tagSearch();
  };

  //input 값 변경 처리
  const handleChangeTag = e => {
    setTagKeyword(e.target.value);
  };

  const tagAllListNew = tagList.map(item => {
    return (
      <div key={item.tagId}>
        <input
          type="checkbox"
          id={`checkbox-${item.tagId}`}
          checked={selectedItems.includes(item.tagId)}
          onChange={() => handleCheckbox2Change(item.tagId)}
        />
        <label htmlFor={`checkbox-${item.tagId}`}>{item.tagName}</label>
      </div>
    );
  });

  //첨부파일 처리
  const handleChange = info => {
    let newFileList = [...info.fileList];

    // maxCount로 인해 하나의 파일만 유지
    newFileList = newFileList.slice(-1);

    // 파일 상태 업데이트
    setFileList(newFileList);

    // 선택된 파일이 있으면 콘솔에 출력
    if (info.file.status === "done" && info.file.originFileObj) {
      console.log("파일 선택됨:", info.file.originFileObj);
      form.setFieldValue("pic", info.file.originFileObj);
    }
  };

  const onFinished = async values => {
    try {
      const startTimes = dayjs(values.openTime.$d).format("HH:mm");
      const endTimes = dayjs(values.closeTime.$d).format("HH:mm");

      const formData = new FormData();

      // pic이 있는 경우에만 추가
      if (values.pic) {
        formData.append("pic", values.pic);
      }

      const reqData = {
        userId: currentUserInfo.userId,
        dongId: 3,
        acaName: values.acaName,
        acaPhone: values.acaPhone,
        comment: values.comment,
        teacherNum: values.teacherNum,
        openTime: startTimes,
        closeTime: endTimes,
        addressDto: {
          address: values.address,
          detailAddress: values.detailAddress,
          postNum: values.postNum,
        },
        tagIdList: selectedItems.map(item => parseInt(item, 10)),
        //tagIdList: [1, 3],
      };

      //JSON 형태로 데이터를 만들어 formData에 추가
      formData.append(
        "req",
        new Blob([JSON.stringify(reqData)], { type: "application/json" }),
      );

      const header = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await jwtAxios.post("/api/academy", formData, header);
      //console.log(res.data.resultData);
      if (res.data.resultData === 1) {
        navigate("/mypage/academy");
        message.error("학원등록이 완료되었습니다.");
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Daum 우편번호 스크립트 로드
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    getTagList(); //태그목록 가져오기
  }, []);

  useEffect(() => {
    if (!currentUserInfo.userId) {
      navigate("/login");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <AcademyInfo className="w-full">
      <div className="flex gap-5 w-full justify-center pb-10">
        <SideBar menuItems={menuItems} />

        <div className="w-full">
          <h1 className="title-font flex justify-between align-middle">
            학원 등록
          </h1>
          <div className="w-3/4">
            <Form form={form} onFinish={values => onFinished(values)}>
              <Form.Item
                name="acaName"
                label="학원 이름"
                rules={[
                  { required: true, message: "학원 이름을 입력해 주세요." },
                ]}
              >
                <Input
                  className="input"
                  id="acaName"
                  maxLength={20}
                  placeholder="학원 이름을 입력해 주세요."
                />
              </Form.Item>

              <div className="flex gap-3 w-full">
                <Form.Item
                  name="postNum"
                  label="학원 주소"
                  className="w-full"
                  rules={[
                    { required: true, message: "학원 주소를 입력해 주세요." },
                  ]}
                >
                  <Input
                    className="input"
                    id="acaZipcode"
                    maxLength={6}
                    placeholder="우편번호"
                    readOnly
                  />
                </Form.Item>
                <Form.Item>
                  <button
                    type="button"
                    className="min-w-[84px] h-14 bg-[#E8EEF3] rounded-xl font-bold text-sm"
                    onClick={() => handleAddressSearch()}
                  >
                    주소 검색
                  </button>
                </Form.Item>
              </div>

              <Form.Item
                name="address"
                className="ml-[130px]"
                rules={[
                  { required: true, message: "학원 주소를 입력해 주세요." },
                ]}
              >
                <Input
                  className="input"
                  id="acaAddr"
                  placeholder="학원 기본주소"
                  readOnly
                />
              </Form.Item>

              <Form.Item
                name="detailAddress"
                className="ml-[130px]"
                rules={[
                  { required: true, message: "학원 주소를 입력해 주세요." },
                ]}
              >
                <Input
                  className="input"
                  id="acaAddr2"
                  maxLength={20}
                  placeholder="학원 상세주소"
                />
              </Form.Item>

              <Form.Item
                name="acaPhone"
                label="학원 전화번호"
                rules={[
                  { required: true, message: "학원 전화번호를 입력해 주세요." },
                ]}
              >
                <Input
                  className="input"
                  id="acaPhone"
                  maxLength={13}
                  placeholder="학원 전화번호를 입력해 주세요."
                />
              </Form.Item>

              <div className="flex gap-3">
                <Form.Item
                  name="openTime"
                  label="영업 시간"
                  rules={[
                    { required: true, message: "시작 시간을 선택해 주세요." },
                  ]}
                >
                  <TimePicker
                    placeholder="학원 시작 시간"
                    className="input"
                    format="HH:mm"
                  />
                </Form.Item>
                <Form.Item
                  name="closeTime"
                  label=""
                  rules={[
                    { required: true, message: "종료 시간을 선택해 주세요." },
                  ]}
                >
                  <TimePicker
                    placeholder="학원 종료 시간"
                    className="input w-full"
                    format="HH:mm"
                  />
                </Form.Item>
              </div>

              <Form.Item name="teacherNum" label="강사 인원수">
                <Input
                  className="input"
                  id="teacherNum"
                  maxLength={5}
                  placeholder="강사 인원수를 입력해 주세요."
                />
              </Form.Item>

              <Form.Item name="comment" label="학원 소개글" className="h-44">
                <ReactQuill
                  placeholder="소개글을 작성해 주세요."
                  className="h-32"
                />
              </Form.Item>

              <div className="flex gap-3 w-full">
                <Form.Item label="태그 등록" className="w-full">
                  <Input
                    className="input"
                    id="academyTag"
                    placeholder="태그를 입력해 주세요."
                    onClick={() => handleTagSearch()}
                    readOnly
                  />
                </Form.Item>

                <Form.Item>
                  <button
                    type="button"
                    className="min-w-[84px] h-14 bg-[#E8EEF3] rounded-xl font-bold text-sm"
                    onClick={() => handleTagSearch()}
                  >
                    태그 검색
                  </button>
                </Form.Item>
              </div>

              {selectedItems && (
                <div className="w-full pl-32 pb-6">
                  <ul className="flex flex-wrap gap-5">
                    {selectedItems.map(value => {
                      const selectedTags = tagList.find(
                        option => option.tagId === value,
                      );
                      return (
                        <li
                          key={value}
                          className="flex justify-center items-center"
                        >
                          {selectedTags.tagName}
                          <button
                            onClick={() => handleRemoveItem(value)}
                            className="size-5 ml-2 border border-gray-300 rounded-full text-xs"
                          >
                            &times;
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <Form.Item name="pic" label="학원 이미지">
                <div>
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    onChange={handleChange}
                    showUploadList={{ showPreviewIcon: false }}
                  >
                    <button
                      style={{ border: 0, background: "none" }}
                      type="button"
                    >
                      <PlusOutlined />
                    </button>
                  </Upload>

                  <Image
                    wrapperStyle={{ display: "none" }}
                    preview={{
                      visible: previewOpen,
                      onVisibleChange: visible => setPreviewOpen(visible),
                      afterOpenChange: visible =>
                        !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                  />
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  htmlType="submit"
                  className="w-full h-14 bg-[#E8EEF3] font-bold text-sm"
                >
                  학원 등록
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>

      <CustomModal
        visible={isModalVisible}
        title={"태그 검색"}
        content={
          <TagListSelect>
            <form onSubmit={handleTagSearchForm}>
              <div className="flex justify-center items-center mb-5 gap-3">
                <input
                  type="text"
                  name="tagSearch"
                  value={tagKeyword}
                  placeholder="태그를 선택해 주세요."
                  className="w-full h-14 pl-3 border rounded-xl text-sm"
                  onChange={handleChangeTag}
                />
                <button
                  type="submit"
                  className="h-14 w-24 bg-[#E8EEF3] rounded-xl"
                >
                  검색
                </button>
              </div>

              <ul className="flex w-full flex-wrap gap-2 overflow-y-auto max-h-32">
                {tagAllListNew.length > 0 ? (
                  tagAllListNew
                ) : (
                  <li className="w-full text-center">검색 결과가 없습니다.</li>
                )}
              </ul>
            </form>
          </TagListSelect>
        }
        onButton1Click={handleButton1Click}
        onButton2Click={handleButton2Click}
        button1Text={"취소하기"}
        button2Text={"선택완료"}
        modalWidth={400}
      />
    </AcademyInfo>
  );
}

export default AcademyAdd;
