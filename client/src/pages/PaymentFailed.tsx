import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get("reason") || "Unknown error";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center border-red-200 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl text-red-600">
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">
                Unfortunately, your payment could not be processed.
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">
                  <span className="font-semibold">Reason:</span>{" "}
                  {decodeURIComponent(reason)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please try again or contact support if the problem persists.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/dashboard")} size="lg">
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/contact")}
                  variant="outline"
                  size="lg"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailed;
