import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, Search, MapPin, Calendar, CreditCard, Phone } from "lucide-react";

const GuestOrderTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to track order
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock order data for demonstration
      if (trackingNumber) {
        setOrder({
          id: "ORD-" + trackingNumber,
          status: "processing",
          createdAt: new Date().toISOString(),
          shippingAddress: "123 Main Street, Karachi, Pakistan",
          phone: "0300-1234567",
          total: 45000,
          installmentMonths: 6,
          monthlyPayment: 7500,
          items: [
            {
              name: "Samsung Galaxy S23 Ultra",
              quantity: 1,
              price: 45000,
            }
          ],
          installments: [
            { id: 1, dueDate: "2023-12-15", status: "paid", amount: 7500, paidAt: "2023-12-10" },
            { id: 2, dueDate: "2024-01-15", status: "pending", amount: 7500 },
            { id: 3, dueDate: "2024-02-15", status: "pending", amount: 7500 },
            { id: 4, dueDate: "2024-03-15", status: "pending", amount: 7500 },
            { id: 5, dueDate: "2024-04-15", status: "pending", amount: 7500 },
            { id: 6, dueDate: "2024-05-15", status: "pending", amount: 7500 },
          ]
        });
      } else {
        toast({
          title: "Tracking number required",
          description: "Please enter a valid tracking number",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order number to track the status of your purchase
            </p>
          </div>

          {!order ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Order Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tracking-number">Order Number</Label>
                    <Input
                      id="tracking-number"
                      placeholder="Enter your order number (e.g., ORD-123456)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Your order number was sent to your email after purchase
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? "Searching..." : "Track Order"}
                  </Button>
                </form>
                
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-3">Need help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can't find your order number? Sign in to your account to view all your orders.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/auth")}
                  >
                    Sign In to Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">Order Details</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        statusStyles[order.status] || statusStyles.processing
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Order Date</p>
                          <p className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Shipping Address</p>
                          <p className="font-medium">{order.shippingAddress}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Contact Number</p>
                          <p className="font-medium">{order.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Plan</p>
                          <p className="font-medium">
                            {order.installmentMonths} months installment
                          </p>
                          <p className="text-sm">
                            Rs. {order.monthlyPayment.toLocaleString()} per month
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 mt-4 border-t">
                      <p className="font-medium">Total</p>
                      <p className="text-xl font-bold">
                        Rs. {order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Installment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.installments.map((installment: any) => (
                      <div 
                        key={installment.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 ${
                          installment.status === "paid"
                            ? "bg-green-50 border-green-200"
                            : installment.status === "overdue"
                              ? "bg-destructive/5 border-destructive"
                              : "bg-background border-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            installment.status === "paid"
                              ? "bg-green-500 text-white"
                              : installment.status === "overdue"
                                ? "bg-destructive text-white"
                                : "bg-muted text-foreground"
                          }`}>
                            {installment.id}
                          </div>
                          <div>
                            <p className="font-medium">
                              Payment #{installment.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(installment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">
                              Rs. {installment.amount.toLocaleString()}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              installment.status === "paid"
                                ? "bg-green-500/10 text-green-500"
                                : installment.status === "overdue"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {installment.status.toUpperCase()}
                            </span>
                          </div>
                          
                          {installment.status === "paid" && (
                            <div className="text-xs text-muted-foreground">
                              Paid on {new Date(installment.paidAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setOrder(null)}
                  variant="outline"
                >
                  Track Another Order
                </Button>
                <Button 
                  onClick={() => navigate("/contact")}
                  variant="secondary"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestOrderTracking;