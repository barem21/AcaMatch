import { Button, Form, Input, message } from "antd";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import jwtAxios from "../../apis/jwt";
import userInfo from "../../atoms/userInfo";
import ReactQuill from "react-quill";

// const InputWrapper = styled.div`
//   width: 100%;
//   .ant-input {
//     height: 40px;
//     border-radius: 4px;
//   }
//   .ant-form-item {
//     width: 100%;
//   }
// `;
const NoticeAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId } = useRecoilValue(userInfo);
  const boardId = searchParams.get("boardId");
  const isEdit = !!boardId;

  const fetchBoardDetail = async () => {
    if (!userId || !boardId) return;

    try {
      const response = await jwtAxios.get(`/api/board`, {
        params: {
          userId: userId,
          page: 1,
          size: 40,
        },
      });

      const boardDetail = response.data.resultData.filter(
        (item: any) => item !== null && item.boardId === Number(boardId),
      )[0];

      if (boardDetail) {
        form.setFieldsValue({
          title: boardDetail.boardName,
          content: boardDetail.boardComment,
        });
      }
    } catch (error) {
      console.error("Error fetching board detail:", error);
    }
  };

  const onFinished = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("userId", (userId ?? -1).toString());
      formData.append("boardName", values.title);
      formData.append("boardComment", values.content);

      let response;

      if (isEdit) {
        // 수정 시 PUT 요청
        formData.append("boardId", boardId!);
        response = await jwtAxios.put("/api/board", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // 신규 등록 시 POST 요청
        response = await jwtAxios.post("/api/board", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      console.log(response);

      if (response.data.resultMessage) {
        message.success(
          isEdit ? "공지사항이 수정되었습니다." : "공지사항이 등록되었습니다.",
        );
        navigate("/admin/notice-content");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data);
      message.error(
        isEdit
          ? "공지사항 수정에 실패했습니다."
          : "공지사항 등록에 실패했습니다.",
      );
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchBoardDetail();
    }
  }, [boardId, userId]);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          공지사항 {isEdit ? "수정" : "등록"}
          <p>
            공지 및 콘텐츠 관리 {">"} 공지사항 관리 {">"} 공지사항{" "}
            {isEdit ? "수정" : "등록"}
          </p>
        </h1>

        <div className="board-wrap">
          <Form form={form} onFinish={values => onFinished(values)}>
            <div className="flex justify-between p-2 border-b">
              <div className="flex items-center gap-1 w-full">
                <label className="min-w-[100px] text-sm">제목</label>
                <Form.Item
                  name="title"
                  className="w-full m-0"
                  rules={[{ required: true, message: "제목을 입력해주세요" }]}
                >
                  <Input
                    placeholder="제목을 입력해주세요"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex justify-between p-2 border-b">
              <div className="flex gap-1 w-full h-[545px]">
                <label className="min-w-[100px] text-sm">내용</label>
                <Form.Item
                  name="content"
                  className="w-full m-0"
                  rules={[{ required: true, message: "내용을 입력해주세요" }]}
                >
                  {/* <Input.TextArea
                    rows={20}
                    placeholder="내용을 입력해주세요"
                    style={{ width: "100%" }}
                  /> */}
                  <ReactQuill
                    placeholder="내용을 작성해 주세요."
                    className="h-[500px]"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex justify-end p-3 gap-3 border-b">
              <button
                type="button"
                className="btn-admin-cancel"
                onClick={() => navigate(-1)}
              >
                취소하기
              </button>
              <Button htmlType="submit" className="btn-admin-ok">
                {isEdit ? "수정하기" : "등록하기"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NoticeAdd;
