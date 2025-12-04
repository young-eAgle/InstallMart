import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentGateway } from "@/components/PaymentGateway";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";

const PaymentCenter = () => {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      navigate("/auth");
    }
  }, [user, token, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading payment center...
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Payment Center</h1>
              <p className="text-muted-foreground">
                Manage all your installment payments and payment history
              </p>
            </div>
          </div>
        </div>

        <PaymentGateway />
      </main>
    </div>
  );
};

export default PaymentCenter;