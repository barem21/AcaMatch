import { message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  useEffect(() => {
    const completePayment = async () => {
      const pgToken = searchParams.get("pg_token");
      const Tid = localStorage.getItem("paymentTid");

      console.log("Payment tokens:", { pgToken, Tid });

      if (!pgToken || !Tid) {
        localStorage.removeItem("paymentTid");
        message.error("결제 정보가 올바르지 않습니다.");
        return;
      }

      try {
        await axios.post(`/api/payment/success?pg_token=${pgToken}&TId=${Tid}`);

        message.success("결제가 완료되었습니다!");
        localStorage.removeItem("paymentTid");
        setIsPaymentComplete(true);
      } catch (error) {
        console.error("Payment completion error:", error);
        localStorage.removeItem("paymentTid");
        message.error("결제 완료 처리 중 오류가 발생했습니다.");
      }
    };

    completePayment();
  }, [searchParams]);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {!isPaymentComplete ? (
          <>
            <h2 className="text-xl mb-4">결제 처리 중...</h2>
            <p>잠시만 기다려주세요.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl mb-4">결제가 완료되었습니다!</h2>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              창 닫기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
