import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Wallet, FileBadge2, AlertCircle } from "lucide-react";
import type { PaymentMethod } from "@/types";
import { CheckoutDocumentUpload } from "@/components/CheckoutDocumentUpload";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState("6");

  const [formData, setFormData] = useState({
    address: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("jazzcash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [documentsVerified, setDocumentsVerified] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const monthlyPayment = Math.round(totalPrice / parseInt(installmentMonths));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate order processing
      await orderApi.create(
        {
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          shippingAddress: formData.address,
          phone: formData.phone,
          installmentMonths: parseInt(installmentMonths),
          paymentMethod,
          paymentReference,
          paymentProofUrl: paymentProofUrl || undefined,
        },
        token
      );

      toast({
        title: "Order placed successfully!",
        description: `Monthly payment: Rs. ${monthlyPayment.toLocaleString()}`,
      });

      clearCart();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="03XX-XXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Identity Verification Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <CheckoutDocumentUpload onDocumentsVerified={setDocumentsVerified} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Installment Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Plan Duration</Label>
                    <Select value={installmentMonths} onValueChange={setInstallmentMonths}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Months</SelectItem>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="18">18 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card className="bg-accent/10">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-accent" />
                        <span className="font-medium">Monthly Payment</span>
                      </div>
                      <span className="text-accent font-bold text-xl">
                        Rs. {monthlyPayment.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jazzcash">JazzCash</SelectItem>
                        <SelectItem value="easypaisa">Easypaisa</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-reference">Transaction ID / Payment Reference</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="payment-reference"
                        className="pl-10"
                        placeholder="e.g. TXN123456"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the reference / transaction ID you received after sending the payment.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-proof">Payment Proof URL (optional)</Label>
                    <div className="relative">
                      <FileBadge2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="payment-proof"
                        className="pl-10"
                        placeholder="https://drive.google.com/receipt..."
                        value={paymentProofUrl}
                        onChange={(e) => setPaymentProofUrl(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paste a link to your receipt screenshot or uploaded proof if available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 py-4 border-y">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">Rs. {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan Duration</span>
                      <span className="font-medium">{installmentMonths} months</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xl font-bold">
                    <span>Monthly</span>
                    <span className="text-primary">Rs. {monthlyPayment.toLocaleString()}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-accent"
                    size="lg"
                    disabled={isProcessing || !documentsVerified}
                  >
                    {isProcessing ? "Processing..." : documentsVerified ? "Place Order" : "Upload Required Documents"}
                  </Button>
                  {!documentsVerified && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          Documents Required
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          Please upload both sides of your CNIC to proceed with checkout.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
