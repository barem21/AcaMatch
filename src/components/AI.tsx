import React, { useState } from "react";
import OpenAI from "openai";
import { message } from "antd";
import styled from "@emotion/styled";
import { FadeLoader } from "react-spinners";

const AI: React.FC = () => {
  // OpenAI API 설정
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_KEY, // 🔥 OpenAI API 키 설정
    dangerouslyAllowBrowser: true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [textInput, _setTextInput] = useState<string>(""); // ✅ 텍스트 입력 상태 추가
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [fileName, setFileName] = useState<string>(""); //첨부파일명
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const LoadingWrap = styled.div`
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  `;

  // 이미지 파일 업로드 핸들러
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedImage = event.target.files?.[0];
    if (uploadedImage && uploadedImage.type.startsWith("image/")) {
      setImage(uploadedImage);
      setFileName(uploadedImage?.name);
    } else {
      message.error("이미지 파일만 업로드 가능합니다.");
    }
  };

  // OpenAI API 호출 (이미지 & 텍스트 분석)
  const analyzeInput = async () => {
    setLoading(true);
    setIsLoading(true); //로딩중 열기

    try {
      const messages: any[] = [
        {
          role: "system",
          content:
            "넌 학원 선생이다. 아래 학생의 성적 데이터를 분석하여 발전한 점, 잘하는 과목, 부족한 과목을 구체적으로 설명해라. 또한, 과목별로 성적 변화 패턴을 반영하여 학습 방향을 제안해라. 150자 이하로 답변해라.",
        },
      ];

      // ✅ 텍스트 입력이 있는 경우
      if (textInput.trim() !== "") {
        messages.push({ role: "user", content: textInput });
      }

      // ✅ 이미지가 있는 경우 (Base64 변환 후 전송)
      if (image) {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = async () => {
          const base64Image = reader.result as string;
          messages.push({
            role: "user",
            content: [
              {
                type: "text",
                text: "넌 학원 선생이다. 아래 학생의 성적 데이터를 분석하여 오답과 정답에 대해 잘하는 점과 부족한 점에 대해 150자 이하로 답변해라. 그리고 시험지의 동그라미가 있으면 정답 대각선으로 빨간선이 끄어져있으면 틀린것으로 간주해라",
              },
              { type: "image_url", image_url: { url: base64Image } },
            ],
          });

          // OpenAI API 요청
          const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages,
          });

          setAnalysisResult(response.choices[0].message.content || "분석 실패");
          setLoading(false);
          setIsLoading(false); //로딩중 닫기
        };
        return;
      } else {
        message.error("분석할 이미지 파일을 첨부해주세요.");
        return;
      }

      // ✅ 텍스트만 입력된 경우 OpenAI API 요청
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages,
      });

      setAnalysisResult(response.choices[0].message.content || "분석 실패");
    } catch (error) {
      console.error("입력 분석 오류:", error);
      setAnalysisResult("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      //setIsLoading(false); //로딩중 닫기
    }
  };

  return (
    <div className="flex flex-col items-center p-0">
      {/* <h1 className="text-2xl font-bold mb-4">📄 입력 분석</h1> */}

      {/* ✅ 텍스트 입력 필드 추가 * /}
      <textarea
        value={textInput}
        onChange={e => setTextInput(e.target.value)}
        placeholder="텍스트를 입력하세요..."
        className="border p-2 rounded-md w-80 h-24"
      />
      */}

      <p className="mb-5 text-md text-gray-500">
        시험지 이미지를 등록하시면 분석결과를 확인하실 수 있습니다.
        <br />
        단, 시험지 이미지가 흐리거나 품질이 떨어질 경우 결과값이 정확하게
        분석되지 않을 수 있습니다.
      </p>

      {/* ✅ 이미지 업로드 입력 */}
      <div className="flex justify-between items-center gap-1 w-full">
        <label
          htmlFor="add-img"
          className="flex justify-center items-center bg-gray-400 text-white h-10 w-1/4 rounded-md cursor-pointer"
        >
          파일첨부
        </label>
        <input
          type="file"
          accept="image/*"
          id="add-img"
          onChange={handleImageChange}
          className="w-0 h-0"
        />
        <span
          id="img-name"
          className="flex items-center border w-full h-10 pl-2 rounded-md"
        >
          {fileName ? fileName : "파일을 선택해 주세요."}
        </span>
      </div>

      {/* 분석 버튼 */}
      <button
        className="w-full bg-yellow-500 text-white px-4 py-2 mt-4 rounded-md"
        onClick={analyzeInput}
        disabled={loading}
      >
        {loading ? "분석 중..." : "AI분석 시작"}
      </button>

      {/* 분석 결과 표시 */}
      {analysisResult && (
        <div className="mt-4 p-4 border rounded-md bg-gray-100 w-full">
          <h2 className="mb-3 p-3 pt-2 pb-2 bg-white border rounded-md text-lg font-semibold">
            분석결과 확인 📢
          </h2>
          <p>{analysisResult}</p>
        </div>
      )}

      {isLoading && (
        <LoadingWrap>
          <FadeLoader color="#fff" width={10} height={30} margin={20} />
        </LoadingWrap>
      )}
    </div>
  );
};

export default AI;
