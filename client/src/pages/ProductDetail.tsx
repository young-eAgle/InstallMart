import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Calendar } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";
import { WishlistButton } from "@/components/WishlistButton";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedPlan, setSelectedPlan] = useState<number>(0); // 0 = full payment, 3, 6, 12 = installment plans
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'installment'>('cash'); // Track payment method selection
  const [downPayment, setDownPayment] = useState<number>(0); // Track down payment amount for installments

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.get(id as string),
    enabled: Boolean(id),
  });

  const product = data?.product || null;

  // Define category-based interest rates
  const getCategoryInterestRates = (category: string) => {
    // Category 1: Refrigerator / AC / LED / Washing Machine
    const category1 = ['Refrigerator', 'AC', 'LED', 'Washing Machine', 'Air Conditioner', 'Television', 'TV'];
    // Category 2: Mobile / Solar / Laptop / Motorcycle
    const category2 = ['Mobile', 'Solar', 'Laptop', 'Motorcycle', 'Smartphones', 'Laptops & Computers', 'Phone', 'Smartphone', 'Laptop'];
    // Category 3: Oven / Dryer / Single W/M / Kitchen Home Appliances
    const category3 = ['Oven', 'Dryer', 'Single W/M', 'Kitchen Home Appliances', 'Microwave', 'Blender', 'Juicer', 'Toaster'];
    
    // Normalize category name for comparison
    const normalizedCategory = category.toLowerCase();
    
    if (category1.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return { 3: 0.15, 6: 0.25, 12: 0.35 };
    } else if (category2.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return { 3: 0.20, 6: 0.30, 12: 0.40 };
    } else if (category3.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return { 3: 0.30, 6: 0.40, 12: 0.50 };
    }
    // Default rates if category doesn't match
    return { 3: 0.20, 6: 0.30, 12: 0.40 };
  };

  // Calculate installment plans based on category and down payment
  const calculateInstallmentPlans = (price: number, category: string, downPaymentAmount: number = 0) => {
    const rates = getCategoryInterestRates(category);
    
    // Ensure down payment is at least 20% of the price (minimum requirement)
    const minDownPayment = price * 0.20;
    const actualDownPayment = Math.max(downPaymentAmount, minDownPayment);
    
    const plans = [
      { 
        months: 3, 
        total: price * (1 + rates[3]), 
        firstPayment: actualDownPayment, 
        monthly: (price * (1 + rates[3]) - actualDownPayment) / (3 - 1) 
      },
      { 
        months: 6, 
        total: price * (1 + rates[6]), 
        firstPayment: actualDownPayment, 
        monthly: (price * (1 + rates[6]) - actualDownPayment) / (6 - 1) 
      },
      { 
        months: 12, 
        total: price * (1 + rates[12]), 
        firstPayment: actualDownPayment, 
        monthly: (price * (1 + rates[12]) - actualDownPayment) / (12 - 1) 
      }
    ];
    
    return plans;
  };

  const getCategoryName = (category: string) => {
    const category1 = ['Refrigerator', 'AC', 'LED', 'Washing Machine', 'Air Conditioner', 'Television', 'TV'];
    const category2 = ['Mobile', 'Solar', 'Laptop', 'Motorcycle', 'Smartphones', 'Laptops & Computers', 'Phone', 'Smartphone', 'Laptop'];
    const category3 = ['Oven', 'Dryer', 'Single W/M', 'Kitchen Home Appliances', 'Microwave', 'Blender', 'Juicer', 'Toaster'];
    
    const normalizedCategory = category.toLowerCase();
    
    if (category1.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return 'Home Appliances';
    } else if (category2.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return 'Electronics';
    } else if (category3.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return 'Kitchen Appliances';
    }
    return 'General';
  };

  // Initialize down payment when product changes or when switching to installment payment
  useEffect(() => {
    if (product && paymentMethod === 'installment' && selectedPlan > 0) {
      const minDownPayment = product.price * 0.20;
      setDownPayment(minDownPayment);
    }
  }, [product, paymentMethod, selectedPlan]);
  
  const installmentPlans = product ? calculateInstallmentPlans(product.price, product.category, downPayment) : []; // Calculate plans with down payment
  const selectedPlanDetails = selectedPlan > 0 ? installmentPlans.find(plan => plan.months === selectedPlan) : null;
  
  // Show original product price for cash payment, otherwise show installment plan total
  const totalPrice = paymentMethod === 'cash' ? product?.price || 0 : (selectedPlanDetails ? selectedPlanDetails.total : product?.price || 0);
  const installmentFrom = Math.round(product?.price / 18);
  
  // Functions to adjust down payment by fixed amount (5000)
  const increaseDownPayment = () => {
    if (product) {
      const increment = 5000; // Fixed increment of 5000
      setDownPayment(prev => Math.min(prev + increment, product.price * 0.5)); // Max 50%
    }
  };
  
  const decreaseDownPayment = () => {
    if (product) {
      const decrement = 5000; // Fixed decrement of 5000
      const minDownPayment = product.price * 0.20; // 20% minimum
      setDownPayment(prev => Math.max(prev - decrement, minDownPayment));
    }
  };
  
  // Reset selected plan when switching to cash payment
  useEffect(() => {
    if (paymentMethod === 'cash') {
      setSelectedPlan(0);
    }
  }, [paymentMethod]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error or missing product state
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              {product.stock < 10 && (
                <Badge variant="destructive">Only {product.stock} left!</Badge>
              )}
            </div>

            <div className="space-y-4">
              {/* Price Display */}
              <div className="flex items-baseline gap-2">
                {selectedPlan === 0 ? (
                  <span className="text-4xl font-bold text-primary">
                    Rs. {product.price.toLocaleString()}
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      Rs. {Math.round(totalPrice).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground line-through">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Payment Method</h3>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cash-payment"
                      name="payment-method"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="cash-payment" className="ml-2 text-sm font-medium">
                      Cash Payment
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="installment-payment"
                      name="payment-method"
                      checked={paymentMethod === 'installment'}
                      onChange={() => setPaymentMethod('installment')}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="installment-payment" className="ml-2 text-sm font-medium">
                      Installment Plan
                    </label>
                  </div>
                </div>
                
                {/* Conditional Payment Options Display */}
                {paymentMethod === 'cash' ? (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800">Full Payment Selected</h4>
                    <p className="text-sm text-green-700 mt-1">Pay the full amount upfront and save on interest charges.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mt-4">
                      <h3 className="font-semibold text-lg">Installment Options</h3>
                      <Badge variant="secondary" className="text-xs">
                        {product ? getCategoryName(product.category) + ' Rates' : 'General Rates'}
                      </Badge>
                    </div>
                
                    <div className="grid grid-cols-4 gap-2">
                      {/* Full Payment Option */}
                      {/* <Card 
                        className={`cursor-pointer transition-all text-center p-3 ${selectedPlan === 0 ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedPlan(0)}
                      >
                        <span className="font-medium text-sm">Full</span>
                        <p className="text-xs text-muted-foreground mt-1">Save money</p>
                      </Card> */}

                      {/* Installment Plans */}
                      {installmentPlans.map((plan) => (
                        <Card 
                          key={plan.months}
                          className={`cursor-pointer transition-all text-center p-3 ${selectedPlan === plan.months ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setSelectedPlan(plan.months)}
                        >
                          <span className="font-medium text-sm">{plan.months}M</span>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rs. {Math.round(plan.total / plan.months).toLocaleString()}/mo
                          </p>
                        </Card>
                      ))}
                    </div>

                    {/* Detailed breakdown when a plan is selected */}
                    {selectedPlan > 0 && selectedPlanDetails && (
                      <Card className="bg-accent/10">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">{selectedPlan} Months Plan Details</h4>
                          
                          {/* Down Payment Adjustment */}
                          <div className="mb-4 p-3 bg-white rounded-lg border">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Down Payment:</span>
                              <span className="font-bold">Rs. {Math.round(downPayment).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={decreaseDownPayment}
                                disabled={downPayment <= product.price * 0.20}
                              >
                                -
                              </Button>
                              <div className="flex-1 text-center text-sm text-muted-foreground">
                                Adjust your down payment
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={increaseDownPayment}
                                disabled={downPayment >= product.price * 0.50}
                              >
                                +
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Minimum: Rs. {Math.round(product.price * 0.20).toLocaleString()} | Maximum: Rs. {Math.round(product.price * 0.50).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Down payment:</span>
                              <span className="font-medium">Rs. {Math.round(selectedPlanDetails.firstPayment).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly payments ({selectedPlan - 1}x):</span>
                              <span className="font-medium">Rs. {Math.round(selectedPlanDetails.monthly).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t mt-2">
                              <span>Total cost:</span>
                              <span className="font-bold">Rs. {Math.round(selectedPlanDetails.total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Interest cost:</span>
                              <span className="font-medium">Rs. {Math.round(selectedPlanDetails.total - product.price).toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                              <p>* Interest is applied to enable flexible payment options</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
          </div>

          {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 gradient-accent text-lg"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: totalPrice,
                      image_url: product.image_url,
                      category: product.category,
                      installmentMonths: selectedPlan,
                    });
                  }}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>

                <WishlistButton product={product} size="lg" showText={false} />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Product Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Flexible payment options</li>
                <li>✓ 0% interest on select plans</li>
                <li>✓ Fast delivery</li>
                <li>✓ Secure checkout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
