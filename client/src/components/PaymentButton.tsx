import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/types";

interface PaymentButtonProps {
  order: Order;
  installmentId?: string;
  amount: number;
  disabled?: boolean;
}

export const PaymentButton = ({
  order,
  installmentId,
  amount,
  disabled,
}: PaymentButtonProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"safepay" | "payfast" | "mock">("payfast");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!order?.id) {
      toast({
        title: "Error",
        description: "Order information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await paymentApi.initialize(
        {
          orderId: order.id,
          paymentMethod,
          installmentId,
        },
        token,
      );

      if (response.success) {
        // For mock payments, redirect directly to success page
        if (paymentMethod === "mock") {
          window.location.href = response.redirectUrl || `${window.location.origin}/payment/success?orderId=${order.id}&txnId=${response.transactionRef}&amount=${amount}`;
        }
        // For SafePay, we redirect to the payment URL
        else if (paymentMethod === "safepay") {
          // Redirect to SafePay checkout page
          window.location.href = response.paymentUrl;
        }
        // For GoPay Fast, redirect to the payment URL from the API response
        else if (paymentMethod === "payfast") { 
          // GoPay Fast returns a direct payment URL
          const url = `${window.location.origin}/payfast-payment?paymentUrl=${encodeURIComponent(response.paymentUrl)}&orderId=${order.id}&transactionId=${response.transactionId}`;
          
          // Open in a new tab
          window.open(url, '_blank', 'noopener,noreferrer');

          // Close the dialog and stop processing in current tab
          setIsProcessing(false);
          setOpen(false);
        }
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={disabled || isProcessing}
          className="gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Pay Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Method</DialogTitle>
          <DialogDescription>
            Complete your payment of Rs. {amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-3 border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">PF</span>
              </div>
              <div>
                <p className="font-medium">PayFast</p>
                <p className="text-xs text-muted-foreground">
                  Pay with JazzCash, EasyPaisa, Bank Transfer, or Credit Card
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount to Pay:</span>
              <span className="font-bold">Rs. {amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium capitalize">PayFast</span>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to PayFast to complete your payment securely.
            PayFast supports JazzCash, EasyPaisa, Bank Transfers, and Credit Cards.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};