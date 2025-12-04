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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa">(
    "jazzcash",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to make a payment",
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
        // For JazzCash, we submit a form directly
        if (paymentMethod === "jazzcash") {
          // Create a form and submit it to the payment gateway
          const form = document.createElement("form");
          form.method = "POST";
          form.action = response.paymentUrl;
          form.style.display = "none";

          // Add all form fields
          Object.entries(response.formData).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } 
        // For EasyPaisa, we redirect to the payment URL
        else if (paymentMethod === "easypaisa") {
          // Create a form for GET request
          const form = document.createElement("form");
          form.method = "GET";
          form.action = response.paymentUrl;
          form.style.display = "none";

          // Add all form fields
          Object.entries(response.formData).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
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
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to complete the payment of Rs.{" "}
            {amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as "jazzcash" | "easypaisa")
            }
          >
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
              <RadioGroupItem value="jazzcash" id="jazzcash" />
              <Label htmlFor="jazzcash" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">Jazz</span>
                  </div>
                  <div>
                    <p className="font-medium">JazzCash</p>
                    <p className="text-xs text-muted-foreground">
                      Pay using JazzCash wallet
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
              <RadioGroupItem value="easypaisa" id="easypaisa" />
              <Label htmlFor="easypaisa" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">EP</span>
                  </div>
                  <div>
                    <p className="font-medium">EasyPaisa</p>
                    <p className="text-xs text-muted-foreground">
                      Pay using EasyPaisa wallet
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount to Pay:</span>
              <span className="font-bold">Rs. {amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium capitalize">{paymentMethod}</span>
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
            You will be redirected to the payment gateway to complete your
            transaction securely.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
