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

import { orderApi, documentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Wallet, FileBadge2, AlertCircle } from "lucide-react";
import type { PaymentMethod } from "@/types";
import { CheckoutDocumentUpload } from "@/components/CheckoutDocumentUpload";

// Interface for guest documents
interface GuestDocument {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  file: File;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  // Get installment months from cart items
  const cartInstallmentMonths = items[0]?.installmentMonths || 0;

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    address: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("safepay");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [documentsVerified, setDocumentsVerified] = useState(false);
  const [guestDocuments, setGuestDocuments] = useState<GuestDocument[]>([]);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

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

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const monthlyPayment = cartInstallmentMonths > 0 ? Math.round(totalPrice / cartInstallmentMonths) : totalPrice;

  // Handle guest documents upload
  const handleGuestDocumentsUploaded = (documents: GuestDocument[]) => {
    setGuestDocuments(documents);
  };

  // Handle document upload for guest users after order creation
  const uploadGuestDocuments = async (orderId: string) => {
    if (!orderId || guestDocuments.length === 0) return;

    try {
      for (const doc of guestDocuments) {
        const formData = new FormData();
        formData.append("document", doc.file);
        formData.append("type", doc.type);
        formData.append("orderId", orderId);

        await documentApi.uploadGuest(formData);
      }
      
      toast({
        title: "Documents uploaded",
        description: "Your documents have been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading guest documents:", error);
      toast({
        title: "Document upload failed",
        description: "Some documents failed to upload. You can upload them later using your order number.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Check if documents are uploaded for both authenticated and guest users
    const hasRequiredDocuments = user 
      ? documentsVerified // For authenticated users, check if documents are verified
      : guestDocuments.length > 0; // For guests, check if documents are uploaded

    if (!hasRequiredDocuments) {
      toast({
        title: "Documents Required",
        description: "Please upload required identification documents to proceed with checkout.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        shippingAddress: formData.address,
        phone: formData.phone,
        installmentMonths: cartInstallmentMonths,
        paymentMethod,
        paymentReference,
        paymentProofUrl: paymentProofUrl || undefined,
      };

      let orderId: string | null = null;

      // For guest users, include customer info
      if (!user) {
        const result = await orderApi.create(
          {
            ...orderData,
            customerInfo: {
              fullName: formData.fullName,
              email: formData.email,
            },
          },
          undefined // No token for guest users
        );
        orderId = result.order.id;
        
        // Upload guest documents after order creation
        if (guestDocuments.length > 0) {
          await uploadGuestDocuments(orderId);
        }
      } else {
        // For authenticated users
        const result = await orderApi.create(orderData, token);
        orderId = result.order.id;
      }

      toast({
        title: "Order placed successfully!",
        description: cartInstallmentMonths > 0 
          ? `Installment plan: ${cartInstallmentMonths} months`
          : "Full payment selected",
      });

      clearCart();
      navigate("/order-success");
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
              {/* Customer Information Section - Show for both guests and authenticated users */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <div className="text-sm text-muted-foreground">
                      <p>Logged in as: {user.fullName} ({user.email})</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
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
                    <Label htmlFor="phone">Phone Number *</Label>
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
                  <CardTitle>Identity Verification Documents *</CardTitle>
                </CardHeader>
                <CardContent>
                  <CheckoutDocumentUpload 
                    onDocumentsVerified={setDocumentsVerified}
                    onGuestDocumentsUploaded={handleGuestDocumentsUploaded}
                  />
                  {!documentsVerified && !user && guestDocuments.length === 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Documents Required</p>
                          <p className="text-sm text-red-700 mt-1">
                            Please upload identification documents (CNIC front and back) to proceed with checkout.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                  </div>

                  <div className="text-center text-muted-foreground text-sm">
                    <p>Installment plan selected during checkout</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-accent"
                    size="lg"
                    disabled={isProcessing || (!documentsVerified && !user) || (user && !documentsVerified)}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                  
                  {/* Guest checkout note */}
                  {!user && (
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      <p className="mb-2">As a guest, you can track your order using the email provided.</p>
                      <Button 
                        type="button"
                        variant="link"
                        className="text-primary hover:underline p-0 h-auto"
                        onClick={() => navigate("/auth")}
                      >
                        Or sign in to create an account
                      </Button>
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