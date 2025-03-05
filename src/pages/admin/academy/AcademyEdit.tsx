import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import {
  Button,
  Form,
  Image,
  Input,
  message,
  TimePicker,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../../apis/jwt";
import userInfo from "../../../atoms/userInfo";
import CustomModal from "../../../components/modal/Modal";

const AcademyInfo = styled.div`
  .ant-form-item-label {
    display: flex;
    justify-content: flex-start;
  }
  .ant-form-item-label label {
    min-width: 130px !important;
    color: #676d9c;
    font-size: 13px;
  }
  .ant-form-item-required::before {
    content: "" !important;
    margin-inline-end: 0px !important;
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
      height: 32px;
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

interface tagListType {
  tagId: number;
  tagName: string;
}

declare global {
  interface Window {
    daum: any; // daum 객체의 타입을 any로 지정 (정확한 타입을 알고 있다면 타입을 더 구체적으로 지정할 수 있습니다)
  }
}
function AcademyEdit() {
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [tagKeyword, setTagKeyword] = useState(""); //태그검색 키워드
  const [tagList, setTagList] = useState<tagListType[]>([]); //태그목록(전체/검색결과)
  const [selectedItems, setSelectedItems] = useState<string[]>([]); //선택한 태그값
  const [searchParams] = useSearchParams();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const acaId: number = parseInt(searchParams.get("acaId") || "", 0);
  const { userId } = useRecoilValue(userInfo);
  const navigate = useNavigate();

  // 체크박스 클릭 시 선택/해제 처리
  const handleCheckbox2Change = (tagId: number, tagName: string) => {
    //alert(tagId + "/" + tagName);
    console.log(tagId);
    setSelectedItems(
      prevSelectedItems =>
        prevSelectedItems.includes(tagName)
          ? prevSelectedItems.filter(item => item !== tagName) // 이미 선택된 항목이면 제거
          : [...prevSelectedItems, tagName], // 선택되지 않은 항목이면 추가
    );
  };

  // 선택한 항목 제거
  const handleRemoveItem = (value: any) => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.filter(item => item !== value),
    );
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
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

  const handleButton1Click2 = () => {
    setIsModalVisible2(false);
  };

  const handleButton2Click2 = () => {
    setIsModalVisible2(false);
    navigate("../academy");
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
  const handleTagSearchForm = (e: any) => {
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
  const handleChangeTag = (e: any) => {
    setTagKeyword(e.target.value);
  };

  const tagAllListNew = tagList.map(item => {
    return (
      <div key={item.tagId}>
        <input
          type="checkbox"
          id={`checkbox-${item.tagId}`}
          checked={selectedItems.includes(item.tagName)}
          onChange={() => handleCheckbox2Change(item.tagId, item.tagName)}
        />
        <label htmlFor={`checkbox-${item.tagId}`}>{item.tagName}</label>
      </div>
    );
  });

  //학원정보 가져오기
  const academyGetInfo = async () => {
    try {
      const res = await axios.get(`/api/academy/academyDetail/${acaId}`);
      console.log("aca_info : ", res.data.resultData);

      // 데이터를 받아온 즉시 form 값 설정
      form.setFieldsValue({
        acaId: res.data.resultData.acaId,
        acaName: res.data.resultData.acaName,
        address: res.data.resultData.addressDto.address,
        detailAddress: res.data.resultData.addressDto.detailAddress,
        postNum: res.data.resultData.addressDto.postNum,
        acaPhone: res.data.resultData.acaPhone,
        openTime: dayjs(res.data.resultData.openTime.substr(0, 5), "HH:mm"),
        closeTime: dayjs(res.data.resultData.closeTime.substr(0, 5), "HH:mm"),
        comment: res.data.resultData.comment,
        teacherNum: res.data.resultData.teacherNum,
        businessNumber: res.data.resultData.businessNumber,
      });

      const acaPicArr = res.data.resultData.acaPic
        .split(",")
        .map((item: string) => item.trim()); // 공백 제거

      //console.log(acaPicArr[0]);

      setFileList(
        acaPicArr.map((item: string, index: number) => ({
          uid: index + 1, // uid는 index를 기반으로 하거나 적절한 값을 사용
          name: item,
          status: "done",
          url: `http://112.222.157.157:5233/pic/academy/${res.data.resultData.acaId}/${item}`,
        })),
      );
    } catch (error) {
      console.log(error);
    }
  };

  //첨부파일 처리
  /*
  const handleChange = (info: any) => {
    const newFileList = [...info.fileList];

    // 파일 상태 업데이트
    setFileList(newFileList);

    console.log("파일 선택됨:", info.file.originFileObj);
    form.setFieldValue("pics", info.file.originFileObj);
  };
  */
  const handleChange: UploadProps["onChange"] = (info: any) => {
    const newFileList = [...info.fileList];
    setFileList(newFileList);

    //form.setFieldValue("pics", info.file.originFileObj);
    form.setFieldValue(
      "pics",
      newFileList.map((file: any) => file.originFileObj),
    );
  };

  const onFinished = async (values: any) => {
    try {
      const startTimes = dayjs(values.openTime.$d).format("HH:mm");
      const endTimes = dayjs(values.closeTime.$d).format("HH:mm");

      const formData = new FormData();

      // pic이 있는 경우에만 추가
      if (values.pics) {
        const picsCount = values.pics.length;
        for (let i = 0; i < picsCount; i++) {
          formData.append("pics", values.pics[i]);
        }
      }

      const reqData = {
        acaId: acaId,
        userId: userId,
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
        tagNameList: selectedItems.map(item => parseInt(item, 10)),
        //tagIdList: [1, 3],
      };

      //JSON 형태로 데이터를 만들어 formData에 추가
      formData.append(
        "req",
        new Blob([JSON.stringify(reqData)], { type: "application/json" }),
      );

      const header = {
        headers: {
          Accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await jwtAxios.put("/api/academy", formData, header);
      if (res.data.resultData === 1) {
        setResultTitle("학원정보 수정 완료");
        setResultMessage("학원정보 수정이 완료되었습니다.");
        setIsModalVisible2(true);
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
    academyGetInfo();
  }, []);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <AcademyInfo className="w-full">
      <div className="flex gap-5 w-full justify-center pb-10">
        <div className="w-full">
          <h1 className="title-admin-font">
            학원정보 수정
            <p>학원관리 &gt; 학원정보 수정</p>
          </h1>

          <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
            <Form form={form} onFinish={values => onFinished(values)}>
              <Form.Item
                name="acaName"
                label="학원 이름"
                rules={[
                  { required: true, message: "학원 이름을 입력해 주세요." },
                ]}
              >
                <Input
                  className="input-admin-basic"
                  maxLength={20}
                  placeholder="학원 이름을 입력해 주세요."
                />
              </Form.Item>

              <Form.Item name="businessNumber" label="사업자등록번호">
                <Input
                  className="input-admin-basic"
                  id="acaName"
                  maxLength={20}
                  placeholder="사업자등록번호를 입력해 주세요."
                  readOnly
                  disabled
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
                    className="input-admin-basic"
                    maxLength={6}
                    placeholder="우편번호"
                    readOnly
                  />
                </Form.Item>
                <Form.Item>
                  <button
                    type="button"
                    className="min-w-[84px] h-8 bg-[#E8EEF3] rounded-md text-[12px]"
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
                  className="input-admin-basic"
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
                  className="input-admin-basic"
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
                  className="input-admin-basic"
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
                    className="input-admin-basic"
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
                    className="input-admin-basic w-full"
                    format="HH:mm"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="teacherNum"
                label="강사 인원수"
                rules={[
                  { required: true, message: "강사 인원수를 입력해 주세요." },
                ]}
              >
                <Input
                  className="input-admin-basic"
                  maxLength={5}
                  placeholder="강사 인원수를 입력해 주세요."
                />
              </Form.Item>

              <Form.Item
                name="comment"
                label="학원 소개글"
                className="h-44"
                rules={[
                  { required: true, message: "학원 소개글을 입력해 주세요." },
                ]}
              >
                <ReactQuill
                  placeholder="소개글을 작성해 주세요."
                  className="h-32"
                />
              </Form.Item>

              <div className="flex gap-3 w-full">
                <Form.Item label="태그 등록 *" className="w-full">
                  <Input
                    className="input-admin-basic"
                    placeholder="태그를 선택해 주세요."
                    onClick={() => handleTagSearch()}
                    readOnly
                  />
                </Form.Item>

                <Form.Item>
                  <button
                    type="button"
                    className="min-w-[84px] h-8 bg-[#E8EEF3] rounded-md text-[12px]"
                    onClick={() => handleTagSearch()}
                  >
                    태그 검색
                  </button>
                </Form.Item>
              </div>

              {selectedItems && (
                <div className="w-full pl-32 pb-6">
                  <ul className="flex flex-wrap gap-5">
                    {selectedItems.map((value, index) => {
                      const selectedTags = tagList.find(
                        option => option.tagName === value,
                      );
                      return (
                        <li
                          key={index}
                          className="flex justify-center items-center"
                        >
                          {selectedTags?.tagName}
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

              <Form.Item name="pics" label="학원 이미지">
                <div>
                  <Upload
                    multiple
                    listType="picture-card"
                    maxCount={5}
                    onChange={handleChange}
                    showUploadList={{ showPreviewIcon: false }}
                    fileList={fileList}
                    customRequest={({ onSuccess }) => {
                      // 자동 업로드 방지
                      setTimeout(() => {
                        onSuccess?.("ok");
                      }, 0);
                    }}
                  >
                    <button
                      style={{ border: 0, background: "none" }}
                      type="button"
                    >
                      <PlusOutlined />
                    </button>
                  </Upload>

                  {previewImage && (
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
                  )}
                </div>
              </Form.Item>

              <div className="flex justify-end pt-3 border-t gap-3">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => navigate(-1)}
                >
                  취소하기
                </button>

                <Form.Item className="mb-0">
                  <Button htmlType="submit" className="btn-admin-ok">
                    학원정보 수정
                  </Button>
                </Form.Item>
              </div>
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
                  placeholder="태그를 입력해 주세요."
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

      <CustomModal
        visible={isModalVisible2}
        title={resultTitle}
        content={resultMessage}
        onButton1Click={handleButton1Click2}
        onButton2Click={handleButton2Click2}
        button1Text={"창닫기"}
        button2Text={"목록으로"}
        modalWidth={400}
      />
    </AcademyInfo>
  );
}

export default AcademyEdit;
