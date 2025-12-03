import Navbar from "@/components/Navbar";
import InstallmentPlanCard from "@/components/InstallmentPlanCard";

const Plans = () => {
  const examplePrice = 180000; // Example product price

  const plans = [
    {
      months: 6,
      totalPrice: examplePrice,
      monthlyPayment: Math.round(examplePrice / 6),
      isPopular: false
    },
    {
      months: 12,
      totalPrice: examplePrice,
      monthlyPayment: Math.round(examplePrice / 12),
      isPopular: true
    },
    {
      months: 18,
      totalPrice: examplePrice,
      monthlyPayment: Math.round(examplePrice / 18),
      isPopular: false
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Perfect{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Payment Plan
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible installment options designed to fit your budget. No hidden fees, complete transparency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <InstallmentPlanCard key={plan.months} {...plan} />
          ))}
        </div>

        {/* How it works section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Choose Your Product</h3>
              <p className="text-muted-foreground">
                Browse our catalog and select the item you want
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Select Payment Plan</h3>
              <p className="text-muted-foreground">
                Pick 6, 12, or 18 months that suits your budget
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Pay Monthly</h3>
              <p className="text-muted-foreground">
                Make easy payments via JazzCash, Easypaisa, or Bank
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
