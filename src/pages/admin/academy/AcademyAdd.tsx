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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
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
      height: 32px;
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

const AcademyListSelect = styled.div``;

interface tagListType {
  tagId: number;
  tagName: string;
}

interface searchAcademyResultType {
  ACA_ASNUM: string;
  ACA_INSTI_SC_NM: string;
  ACA_NM: string;
  ADMST_ZONE_NM: string;
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  BRHS_ACA_YN: string;
  CAA_BEGIN_YMD: string;
  CAA_END_YMD: string;
  DTM_RCPTN_ABLTY_NMPR_SMTOT: number;
  ESTBL_YMD: string;
  FA_RDNDA: string;
  FA_RDNMA: string;
  FA_RDNZC: string;
  FA_TELNO: string;
  LE_CRSE_LIST_NM: string;
  LE_CRSE_NM: string;
  LE_ORD_NM: string;
  LOAD_DTM: string;
  PSNBY_THCC_CNTNT: string;
  REALM_SC_NM: string;
  REG_STTUS_NM: string;
  REG_YMD: string;
  THCC_OTHBC_YN: string;
  TOFOR_SMTOT: number;
}

declare global {
  interface Window {
    daum: any; // daum 객체의 타입을 any로 지정 (정확한 타입을 알고 있다면 타입을 더 구체적으로 지정할 수 있습니다)
  }
}

function AcademyAdd() {
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); //태그 검색
  const [isModalVisible2, setIsModalVisible2] = useState(false); //학원 검색
  const [tagKeyword, setTagKeyword] = useState(""); //태그검색 키워드
  const [tagList, setTagList] = useState<tagListType[]>([]); //태그목록(전체/검색결과)
  const [selectedItems, setSelectedItems] = useState<string[]>([]); //선택한 태그값
  const [academyArea, setAcademyArea] = useState(""); //지역선택
  const [academyKeyword, setAcademyKeyword] = useState(""); //학원검색 키워드
  const [searchAcademyResult, setSearchAcademyResult] = useState<
    searchAcademyResultType[]
  >([]); //학원검색 결과
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  //const [fileList2, setFileList2] = useState("");
  //const [fileList3, setFileList3] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userId } = useRecoilValue(userInfo);
  const navigate = useNavigate();

  // 체크박스 클릭 시 선택/해제 처리
  const handleCheckbox2Change = (tagId: number, tagName: string) => {
    // console.log(tagId);
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

  //태그검색 관련
  const handleButton1Click = () => {
    setIsModalVisible(false);
  };
  const handleButton2Click = () => {
    setIsModalVisible(false);
  };

  //학원검색 관련
  const handleButton1Click2 = () => {
    setIsModalVisible2(false);
  };
  const handleButton2Click2 = () => {
    setAcademyArea("");
    setAcademyKeyword("");
    setSearchAcademyResult([]); //검색결과 초기화
    setIsModalVisible2(false);
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

  //첨부파일 처리
  const handleChange: UploadProps["onChange"] = (info: any) => {
    const newFileList = [...info.fileList];
    setFileList(newFileList);

    //form.setFieldValue("pics", info.file.originFileObj);
    form.setFieldValue(
      "pics",
      newFileList.map((file: any) => file.originFileObj),
    );
  };

  //사업자등록증 파일 처리
  const handle1Change: UploadProps["onChange"] = (info2: any) => {
    form.setFieldValue("businessLicensePic", info2.file.originFileObj);
  };

  //학원등록증 파일 처리
  const handle2Change: UploadProps["onChange"] = (info3: any) => {
    form.setFieldValue("operationLicensePic", info3.file.originFileObj);
  };

  //모달창에서 학원 검색하기
  const handleAcademySearch = () => {
    setAcademyArea("");
    setAcademyKeyword("");
    setSearchAcademyResult([]); //검색결과 초기화
    setIsModalVisible2(true);
  };

  //input 값 변경 처리
  const handleChangeArea = (e: any) => {
    setAcademyArea(e.target.value);
  };
  const handleChangeAcademy = (e: any) => {
    setAcademyKeyword(e.target.value);
  };

  //학원검색
  const handleAcademySearchForm = (e: any) => {
    e.preventDefault();

    const academyApiSearch = async () => {
      //학원 공공 API테스트
      try {
        const res = await axios.get(
          `https://open.neis.go.kr/hub/acaInsTiInfo?KEY=2143c6cb07f24ada85a7d265c6832b2b&Type=json&pIndex=1&pSize=20&ATPT_OFCDC_SC_CODE=${academyArea}&ACA_NM=${academyKeyword}`,
        );
        // console.log(res.data.acaInsTiInfo[1]);
        setSearchAcademyResult(res.data.acaInsTiInfo[1].row);
      } catch (error) {
        console.log(error);
      }
      //학원 공공 API테스트
    };
    academyApiSearch();
  };

  //검색결과 적용
  const settingData = (
    acaName: string,
    acaPhone: string,
    comment: string,
    //postNum,
    //address,
    //detailAddress,
  ) => {
    //데이터를 받아온 즉시 form 값 설정
    form.setFieldsValue({
      acaName: acaName,
      acaPhone: acaPhone,
      comment: comment,
      //postNum: postNum,
      //address: address,
      //detailAddress: detailAddress,
    });
  };

  const onFinished = async (values: any) => {
    const picsCount = values.pics.length;
    console.log(values);

    if (isSubmitting) return; // 이미 제출 중이면 추가 제출을 막음
    setIsSubmitting(true); // 제출 중 상태로 설정
    try {
      const startTimes = dayjs(values.openTime.$d).format("HH:mm");
      const endTimes = dayjs(values.closeTime.$d).format("HH:mm");

      const formData = new FormData();

      // pic이 있는 경우에만 추가
      if (values.pics) {
        for (let i = 0; i < picsCount; i++) {
          formData.append("pics", values.pics[i]);
        }
      }

      if (values.businessLicensePic) {
        formData.append("businessLicensePic", values.businessLicensePic);
      }

      if (values.operationLicensePic) {
        formData.append("operationLicensePic", values.operationLicensePic);
      }

      const reqData = {
        userId: userId,
        //dongId: 3,
        acaName: values.acaName,
        acaPhone: values.acaPhone,
        comment: values.comment,
        teacherNum: parseInt(values.teacherNum),
        openTime: startTimes,
        closeTime: endTimes,
        address: values.address,
        detailAddress: values.detailAddress,
        postNum: values.postNum,
        //tagNameList: ["영어", "미술"],
        tagNameList: selectedItems,
        businessName: values.businessName,
        businessNumber: values.businessNumber,
        corporateNumber: values.corporateNumber,
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
        navigate("../academy");
        message.success("학원등록이 완료되었습니다.");
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false); // 제출 완료 후 상태 리셋
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
    if (!userId) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <AcademyInfo className="w-full">
      <div className="flex gap-5 w-full justify-center pb-10">
        <div className="w-full">
          <h1 className="title-admin-font">
            학원 관리
            <p>학원관리 &gt; 학원 신규등록</p>
          </h1>

          <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
            <Form form={form} onFinish={values => onFinished(values)}>
              <div className="flex gap-3 w-full">
                <Form.Item
                  name="acaName"
                  label="학원 이름"
                  className="w-full"
                  rules={[
                    { required: true, message: "학원 이름을 입력해 주세요." },
                  ]}
                >
                  <Input
                    className="input-admin-basic"
                    id="acaName"
                    maxLength={20}
                    placeholder="학원 이름을 입력해 주세요."
                  />
                </Form.Item>
                <Form.Item>
                  <button
                    type="button"
                    className="min-w-[84px] h-8 bg-[#E8EEF3] rounded-md text-[12px]"
                    onClick={() => handleAcademySearch()}
                  >
                    학원 검색
                  </button>
                </Form.Item>
              </div>

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
                    id="acaZipcode"
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
                  className="input-admin-basic"
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
                  className="input-admin-basic"
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
                    className="input-admin-basic"
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
                <Form.Item label="태그 등록" name="userTag" className="w-full">
                  <Input
                    className="input-admin-basic"
                    placeholder="태그를 입력해 주세요."
                    //onClick={() => handleTagSearch()}
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
                    {selectedItems.map(value => {
                      const selectedTags = tagList.find(
                        option => option.tagName === value,
                      );
                      return (
                        <li
                          key={value}
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

              <Form.Item
                name="businessName"
                label="상호"
                rules={[
                  {
                    required: true,
                    message: "상호를 입력해 주세요.",
                  },
                ]}
              >
                <Input
                  className="input-admin-basic"
                  maxLength={20}
                  placeholder="상호를 입력해 주세요."
                />
              </Form.Item>

              <Form.Item
                name="businessNumber"
                label="사업자등록번호"
                rules={[
                  {
                    required: true,
                    message: "사업자등록번호를 입력해 주세요.",
                  },
                ]}
              >
                <Input
                  className="input-admin-basic"
                  maxLength={20}
                  placeholder="사업자등록번호를 입력해 주세요."
                />
              </Form.Item>

              <Form.Item name="corporateNumber" label="법인번호">
                <Input
                  className="input-admin-basic"
                  maxLength={20}
                  placeholder="법인번호를 입력해 주세요."
                />
              </Form.Item>

              <Form.Item
                name="businessLicensePic"
                label="사업자등록증"
                rules={[
                  {
                    required: true,
                    message: "사업자등록증 이미지를 등록해 주세요.",
                  },
                ]}
              >
                <div>
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    onChange={handle1Change}
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

              <Form.Item
                name="operationLicensePic"
                label="학원등록증"
                rules={[
                  {
                    required: true,
                    message: "학원등록증 이미지를 등록해 주세요.",
                  },
                ]}
              >
                <div>
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    onChange={handle2Change}
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

              <Form.Item
                name="pics"
                label="학원 이미지"
                rules={[
                  { required: true, message: "학원 이미지를 등록해 주세요." },
                ]}
              >
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

              <div className="flex justify-end pt-3 border-t gap-3">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => navigate(-1)}
                >
                  취소하기
                </button>

                <Form.Item className="mb-0">
                  <Button
                    htmlType="submit"
                    className="btn-admin-ok"
                    disabled={isSubmitting}
                  >
                    등록하기
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

      <CustomModal
        visible={isModalVisible2}
        title={"학원 검색"}
        content={
          <AcademyListSelect>
            <form onSubmit={handleAcademySearchForm}>
              <div className="flex justify-center items-center mb-5 gap-2">
                <select
                  name="ATPT_OFCDC_SC_CODE"
                  className="pl-3 pr-3 border rounded-xl h-[56px]"
                  onChange={handleChangeArea}
                >
                  <option value="Z00">지역</option>
                  <option value="B10">서울</option>
                  <option value="C10">부산</option>
                  <option value="D10">대구</option>
                  <option value="E10">인천</option>
                  <option value="F10">광주</option>
                  <option value="G10">대전</option>
                  <option value="H10">울산</option>
                  <option value="I10">세종</option>
                  <option value="J10">경기</option>
                  <option value="K10">강원</option>
                  <option value="M10">충북</option>
                  <option value="N10">충남</option>
                  <option value="P10">전북</option>
                  <option value="Q10">전남</option>
                  <option value="R10">경북</option>
                  <option value="S10">경남</option>
                  <option value="T10">제주</option>
                </select>

                <input
                  type="text"
                  name="tagSearch"
                  value={academyKeyword}
                  placeholder="검색어를 입력해 주세요."
                  className="w-full h-14 pl-3 border rounded-xl text-sm"
                  onChange={handleChangeAcademy}
                />
                <button
                  type="submit"
                  className="h-14 w-24 bg-[#E8EEF3] rounded-xl"
                >
                  검색
                </button>
              </div>

              <ul className="w-full max-h-32 pr-2 overflow-y-auto">
                {searchAcademyResult.length > 0 ? (
                  searchAcademyResult?.map((item, index) => (
                    <li
                      key={index}
                      className={
                        index % 2 === 0
                          ? "p-2 bg-gray-100 cursor-pointer rounded-md"
                          : "p-2 cursor-pointer"
                      }
                      onClick={() =>
                        settingData(
                          item.ACA_NM,
                          //item.FA_RDNZC,
                          //item.FA_RDNMA,
                          //item.FA_RDNDA,
                          item.FA_TELNO,
                          item.REALM_SC_NM,
                        )
                      }
                    >
                      <button className="mr-2 pl-2 pr-2 bg-gray-300 rounded-md text-[12px]">
                        선택
                      </button>
                      {item.ACA_NM}
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-center bg-gray-100">
                    검색된 학원이 없습니다.
                  </li>
                )}
              </ul>
            </form>
          </AcademyListSelect>
        }
        onButton1Click={handleButton1Click2}
        onButton2Click={handleButton2Click2}
        button1Text={"취소하기"}
        button2Text={"선택완료"}
        modalWidth={500}
      />
    </AcademyInfo>
  );
}

export default AcademyAdd;
