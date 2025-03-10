import { Button, Form, message, Select } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { useRecoilValue } from "recoil";
import userInfo from "../../../atoms/userInfo";

interface classListType {
  acaId: number;
  acaPics: string;
  acaPic: string;
  acaName: string;
  classId: number;
  className: string;
  startDate: string;
  endDate: string;
  teacherId: number;
  academyId: number;
  teacherName: string;
}

const TeacherAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [myAcademyList, setMyAcademyList] = useState([]);
  const [acaId, setAcaId] = useState<number>(0);
  const [classList, setClassList] = useState<classListType[]>([]); //강좌 목록
  const { name, userId, roleId } = useRecoilValue(userInfo);

  console.log(useRecoilValue(userInfo));

  //학원 목록
  const academyList = async () => {
    try {
      const res = await axios.get(
        `/api/academy/GetAcademyInfoByAcaNameClassNameExamNameAcaAgree`,
      );
      setMyAcademyList(res.data.resultData);
      academyClassList();
      //console.log("admin : ", res.data.resultData);
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

  //강좌 목록
  const academyClassList = async () => {
    try {
      const res = await axios.get(
        `/api/acaClass?acaId=${acaId}&page=1&size=30`,
      );
      setClassList(res.data.resultData);
      //console.log("classList : ", res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  // clsssId와 className만 남기기
  const simplifiedData2 = classList.map(
    ({ classId: value, className: label }) => ({
      value,
      label,
    }),
  );

  const changeValue = (value: number) => {
    setAcaId(value);

    //수업선택 초기화
    form.setFieldsValue({
      classId: null,
    });
  };

  const onFinished = async (values: any) => {
    console.log(values);
    if (roleId === 4) {
      const data = {
        classId: values.classId,
        userId: userId,
        teacherComment: values.teacherComment,
        teacherAgree: 0,
        isActive: 1,
      };
      const res = await axios.post("/api/teacher", data);
      console.log(res.data.resultdata);
      navigate("../add");
    } else {
      message.error("강사 회원만 등록신청이 가능합니다.");
      return;
    }
  };

  useEffect(() => {
    academyList();
  }, [acaId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          강사 등록 신청
          <p>강사 등록 &gt; 강사 등록 신청</p>
        </h1>

        <div className="max-w-3xl p-3 pl-6 pr-6 border rounded-md">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex items-center mb-3 gap-1">
              <label className="min-w-24 pb-1 text-sm">신청자</label>
              <p className="text-sm pb-1">{name}</p>
            </div>

            <div className="flex items-center mb-3 gap-1">
              <label className="min-w-24 text-sm">학원 선택</label>
              <Form.Item
                name="acaId"
                className="mb-0 w-full"
                rules={[{ required: true, message: "학원을 선택해 주세요." }]}
              >
                <Select
                  showSearch
                  placeholder="학원 선택"
                  optionFilterProp="label"
                  className="select-admin-basic"
                  onChange={value => changeValue(value)}
                  options={simplifiedData}
                />
              </Form.Item>
            </div>

            <div className="flex items-center mb-3 gap-1">
              <label className="min-w-24 text-sm">수업 선택</label>
              <Form.Item
                name="classId"
                className="mb-0 w-full"
                rules={[{ required: true, message: "수업을 선택해 주세요." }]}
              >
                <Select
                  showSearch
                  placeholder="수업 선택"
                  optionFilterProp="label"
                  className="select-admin-basic"
                  options={simplifiedData2}
                />
              </Form.Item>
            </div>

            <div className="flex items-center mb-3 gap-1">
              <label className="min-w-24 text-sm">강사 소개</label>
              <Form.Item
                name="teacherComment"
                className="mb-0 min-w-80 w-full"
                rules={[
                  { required: true, message: "강사 소개를 입력해 주세요." },
                ]}
              >
                <TextArea
                  placeholder="강사 소개"
                  rows={10}
                  className="select-admin-basic"
                />
              </Form.Item>
            </div>

            <div className="flex justify-end pt-3 border-t gap-3">
              {roleId === 4 ? (
                <>
                  <button
                    type="button"
                    className="btn-admin-cancel"
                    onClick={() => navigate(-1)}
                  >
                    취소하기
                  </button>

                  <Form.Item className="mb-0">
                    <Button htmlType="submit" className="btn-admin-ok">
                      등록하기
                    </Button>
                  </Form.Item>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-admin-cancel"
                    onClick={() => navigate(-1)}
                  >
                    취소하기
                  </button>

                  <button
                    type="button"
                    className="btn-admin-ok"
                    onClick={() => navigate(-1)}
                  >
                    신청불가 회원입니다.
                  </button>
                </>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default TeacherAdd;
