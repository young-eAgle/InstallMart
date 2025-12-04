import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, CreditCard } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const txnId = searchParams.get("txnId");
  const amount = searchParams.get("amount");
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
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Thank you for your payment. Your transaction has been completed successfully.
              </p>
              
              <div className="bg-green-50 p-6 rounded-lg space-y-3 text-left">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </h3>
                
                <div className="space-y-2 text-sm">
                  {orderId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">#{orderId.substring(0, 6)}</span>
                    </div>
                  )}
                  {txnId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-medium font-mono text-xs">{txnId.substring(0, 12)}...</span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-bold text-green-600">₨ {parseFloat(amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">Digital Wallet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600">Confirmed</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5" />
                  What Happens Next?
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Your order status will be updated to processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Track your payment status in your dashboard</span>
                  </li>
                </ul>
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
