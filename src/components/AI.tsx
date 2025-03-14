import styled from "@emotion/styled";
import { message } from "antd";
import OpenAI from "openai";
import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import jwtAxios from "../apis/jwt";

interface TestGradeId {
  //testGradeId?: { gradeId: number };
  gradeId: number;
  testGradeId?: { gradeId: number };
}

const AI: React.FC<TestGradeId> = () => {
  const [openAiKey, setOpenAiKey] = useState<string | null>(null);
  const [openai, setOpenai] = useState<OpenAI | null>(null); // OpenAI 인스턴스를 상태로 관리
  const fetchApiKey = async () => {
    try {
      const res = await jwtAxios.get("/api/ai/getApiKey"); // await 추가
      setOpenAiKey(res.data.resultData); // 응답 데이터에서 API 키 가져오기
    } catch (error) {
      console.log("API 키 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  // API 키가 설정된 후 OpenAI 인스턴스 생성
  useEffect(() => {
    if (openAiKey) {
      setOpenai(
        new OpenAI({
          apiKey: openAiKey,
          dangerouslyAllowBrowser: true,
        }),
      );
    }
  }, [openAiKey]); // openAiKey가 변경될 때만 실행

  // OpenAI API 설정
  // const openai = new OpenAI({
  //   // apiKey: import.meta.env.VITE_OPENAI_KEY, // :불: OpenAI API 키 설정
  //   apiKey: openAiKey, // :불: OpenAI API 키 설정
  //   dangerouslyAllowBrowser: true,
  // });

  const [image, setImage] = useState<File | null>(null);
  const [textInput, _setTextInput] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [fileName, setFileName] = useState<string>(""); //첨부파일명
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // OpenAI API 호출 수정
  const analyzeInput = async () => {
    setLoading(true);
    setIsLoading(true);

    try {
      const messages: any[] = [
        {
          role: "system",
          content: `당신은 학원 선생님입니다. 학생의 성적 데이터나 시험지를 분석하여 다음 형식으로 답변해주세요:

1. [전반적 평가] - 전체적인 성적 수준과 두드러진 특징
2. [강점 분석] - 잘하는 영역과 그 이유
3. [개선점] - 보완이 필요한 부분
4. [학습 전략] - 성적 향상을 위한 구체적인 학습 방법
5. [특이사항] - 특별히 주목할 만한 패턴이나 변화

답변은 150자 이내로 작성하되, 구체적이고 실용적인 조언을 포함해주세요.`,
        },
      ];

      if (textInput.trim() !== "") {
        messages.push({ role: "user", content: textInput });
      }

      if (image) {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(image);

          const base64Image = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });

          messages.push({
            role: "user",
            content: [
              {
                type: "text",
                text: "시험지를 분석하여 정답과 오답 패턴을 파악하고, 위 형식에 맞춰 구체적인 피드백을 제공해주세요. 시험지의 동그라미는 정답, 대각선으로 그어진 빨간선은 오답으로 간주합니다.",
              },
              { type: "image_url", image_url: { url: base64Image } },
            ],
          });

          const response = await openai?.chat.completions.create({
            model: "gpt-4-turbo",
            messages,
          });

          setAnalysisResult(
            response?.choices[0].message.content || "분석 실패",
          );
        } catch (error) {
          console.error("이미지 처리 오류:", error);
          message.error("이미지 처리 중 오류가 발생했습니다.");
        }
      } else {
        message.error("분석할 이미지 파일을 첨부해주세요.");
      }
    } catch (error) {
      console.error("입력 분석 오류:", error);
      setAnalysisResult("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  // console.log(testGradeId);

  //피드백 저장
  // const hadleSaveHistory = async () => {
  //   const res = await axios.post("/api/ai/postFeedBack", {
  //     gradeId: testGradeId?.gradeId,
  //     feedBack: analysisResult,
  //   });
  //   console.log(res.data.dataResult);

  //   if (res.data.dataResult === 1) {
  //     message.success("AI 성적분석 결과 저장이 완료되었습니다.");
  //   }
  // };

  return (
    <div className="flex flex-col items-center p-0">
      {/* <h1 className="text-2xl font-bold mb-4">📄 입력 분석</h1> */}

      {/* 
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
        <div className="max-h-[400px] mt-4 p-4 border rounded-md bg-gray-100 w-full">
          <h2 className="mb-3 text-lg font-semibold">📢 분석 결과</h2>
          <div className="max-h-[250px] overflow-y-auto">
            <p className="whitespace-pre-line">{analysisResult}</p>
          </div>
          {/* <button
            type="button"
            className="w-full bg-gray-400 text-white px-4 py-2 mt-4 rounded-md"
            onClick={() => hadleSaveHistory()}
          >
            분석결과 저장
          </button> */}
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

interface AITextProps {
  textInput?: string;
}

export const AIText: React.FC<AITextProps> = ({ textInput }) => {
  const [openAiKey, setOpenAiKey] = useState<string | null>(null);
  const [openai, setOpenai] = useState<OpenAI | null>(null);
  // const [textInput, setTextInput] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // OpenAI API 키 가져오기
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await jwtAxios.get("/api/ai/getApiKey");
        setOpenAiKey(res.data.resultData);
      } catch (error) {
        console.log("API 키 가져오기 실패:", error);
      }
    };
    fetchApiKey();
  }, []);

  // OpenAI 인스턴스 생성
  useEffect(() => {
    if (openAiKey) {
      setOpenai(
        new OpenAI({
          apiKey: openAiKey,
          dangerouslyAllowBrowser: true,
        }),
      );
    }
  }, [openAiKey]);

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

  // OpenAI API 호출 (텍스트 분석)
  const analyzeInput = async () => {
    console.log(textInput);

    const jsonData = JSON.stringify(textInput, null, 2);

    setLoading(true);
    try {
      const messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [
        {
          role: "system",
          content:
            "넌 학원 선생이다. 학생의 성적 데이터를 분석하여 발전한 점, 잘하는 과목, 부족한 과목을 구체적으로 설명하고 학습 방향을 제안해라. 150자 이하로 답변해라.",
        },
        {
          role: "user",
          content: jsonData,
        },
      ];

      const response = await openai?.chat.completions.create({
        model: "gpt-4-turbo",
        messages,
      });

      setAnalysisResult(response?.choices[0].message.content || "분석 실패");
    } catch (error) {
      console.error("입력 분석 오류:", error);
      setAnalysisResult("분석 중 오류가 발생했습니다.");
      console.log(jsonData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="mb-5 text-md text-gray-500">
        학생의 시험 성적 데이터를 확인할 수 있습니다.
        <br />
        AI 분석을 통해 과목별 성적 변화 및 학습 방향을 제안해 드립니다.
      </p>
      {/* 분석 버튼 */}
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={analyzeInput}
        disabled={loading}
      >
        {loading ? "분석 중..." : "AI 분석 시작"}
      </button>

      {/* 분석 결과 */}
      {analysisResult && (
        <div className="max-h-[400px] mt-4 p-4 border rounded-md bg-gray-100 w-full">
          <h2 className="mb-3 text-lg font-semibold">📢 분석 결과</h2>
          <div className="max-h-[250px] overflow-y-auto">
            <p>{analysisResult}</p>
          </div>
        </div>
      )}
      {loading && (
        <LoadingWrap>
          <FadeLoader color="#fff" width={10} height={30} margin={20} />
        </LoadingWrap>
      )}
    </div>
  );
};
