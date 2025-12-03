import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const txnId = searchParams.get("txnId");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center border-green-200 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">
                Your payment has been processed successfully.
              </p>
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                {orderId && (
                  <p className="text-sm">
                    <span className="font-semibold">Order ID:</span> {orderId}
                  </p>
                )}
                {txnId && (
                  <p className="text-sm">
                    <span className="font-semibold">Transaction ID:</span>{" "}
                    {txnId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting to dashboard in {countdown} seconds...
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/dashboard")} size="lg">
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/orders")}
                  variant="outline"
                  size="lg"
                >
                  View Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
