import { useEffect } from "react";
import { message } from "antd";
import jwtAxios from "../../apis/jwt";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const completePayment = async () => {
      const pgToken = searchParams.get("pg_token");
      const tid = localStorage.getItem("paymentTid");

      if (!pgToken || !tid) {
        message.error("결제 정보가 올바르지 않습니다.");
        return;
      }

      try {
        const response = await jwtAxios.post("/api/payment/success", {
          pg_token: pgToken,
          tid: tid,
        });

        if (response.data.resultMessage === "결제 성공") {
          message.success("결제가 완료되었습니다!");

          // localStorage 정리
          localStorage.removeItem("paymentTid");

          // 창 닫기
          window.close();
        }
      } catch (error) {
        console.error("Payment completion error:", error);
        message.error("결제 완료 처리 중 오류가 발생했습니다.");
      }
    };

    completePayment();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">결제 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
