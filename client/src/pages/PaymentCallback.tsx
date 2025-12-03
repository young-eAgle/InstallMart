import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // This page receives the callback from payment gateway
    // The actual processing is done on the backend
    // We just check for success/failure parameters

    const responseCode =
      searchParams.get("pp_ResponseCode") || searchParams.get("responseCode");
    const orderId = searchParams.get("orderId");
    const txnId = searchParams.get("pp_TxnRefNo") || searchParams.get("txnId");

    if (responseCode === "000" || responseCode === "0000") {
      // Success
      navigate(`/payment/success?orderId=${orderId}&txnId=${txnId}`);
    } else {
      // Failed
      const message =
        searchParams.get("pp_ResponseMessage") ||
        searchParams.get("responseDesc") ||
        "Payment failed";
      navigate(`/payment/failed?reason=${encodeURIComponent(message)}`);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg text-muted-foreground">Processing payment...</p>
      </div>
    </div>
  );
};

export default PaymentCallback;
