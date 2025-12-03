import { ArrowRight, CreditCard, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  // Fetch categories from API
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const categories = data?.categories ?? [];

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10" />

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                🎉 Shop Now, Pay Later
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Buy Your Dream Products on{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Easy Installments
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Choose from 6, 12, or 18-month payment plans. No hidden charges, complete transparency, and flexible payment options with JazzCash, Easypaisa, and Bank transfers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="gradient-primary text-lg shadow-glow"
                onClick={() => navigate("/products")}
              >
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg"
                onClick={() => navigate("/how-it-works")}
              >
                See How It Works
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">Flexible Plans</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">Secure Payment</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mx-auto">
                  <Truck className="h-6 w-6 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">Fast Delivery</p>
              </div>
            </div>
          </div>

          {/* Right Content - Dynamic Categories Display */}
          <div className="relative animate-fade-in">
            <div className="aspect-square rounded-2xl gradient-hero opacity-20 animate-glow" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center space-y-4 p-8 bg-background/80 backdrop-blur rounded-xl shadow-card w-full max-w-md">
                {categories.length > 0 ? (
                  <>
                    <div className="flex justify-center items-center gap-3 flex-wrap">
                      {categories.slice(0, 6).map((category: any) => (
                        category.icon ? (
                          <div
                            key={category.id}
                            className="w-14 h-14 rounded-xl overflow-hidden hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: `${category.color}20` }}
                            onClick={() => navigate(`/products?category=${category.slug}`)}
                            title={category.name}
                          >
                            <img
                              src={category.icon}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null
                      ))}
                    </div>
                    <p className="text-lg font-semibold">
                      {categories.length}+ Product Categories
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Starting from Rs. 5,000/month
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl">📱💻🎮</div>
                    <p className="text-lg font-semibold">Premium Electronics</p>
                    <p className="text-sm text-muted-foreground">
                      Starting from Rs. 5,000/month
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


// import { ArrowRight, CreditCard, Shield, Truck } from "lucide-react";
// import { Button } from "@/components/ui/button";

// const Hero = () => {
//   return (
//     <section className="relative overflow-hidden">
//       {/* Background gradient */}
//       <div className="absolute inset-0 gradient-hero opacity-10" />

//       <div className="container mx-auto px-4 py-20 md:py-32">
//         <div className="grid md:grid-cols-2 gap-12 items-center">
//           {/* Left Content */}
//           <div className="space-y-8 animate-fade-in">
//             <div className="inline-block">
//               <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
//                 🎉 Shop Now, Pay Later
//               </span>
//             </div>

//             <h1 className="text-5xl md:text-6xl font-bold leading-tight">
//               Buy Your Dream Products on{" "}
//               <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//                 Easy Installments
//               </span>
//             </h1>

//             <p className="text-xl text-muted-foreground leading-relaxed">
//               Choose from 6, 12, or 18-month payment plans. No hidden charges, complete transparency, and flexible payment options with JazzCash, Easypaisa, and Bank transfers.
//             </p>

//             <div className="flex flex-col sm:flex-row gap-4">
//               <Button size="lg" className="gradient-primary text-lg shadow-glow">
//                 Browse Products
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//               <Button size="lg" variant="outline" className="text-lg">
//                 See How It Works
//               </Button>
//             </div>

//             {/* Features */}
//             <div className="grid grid-cols-3 gap-6 pt-8">
//               <div className="text-center space-y-2">
//                 <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mx-auto">
//                   <CreditCard className="h-6 w-6 text-accent-foreground" />
//                 </div>
//                 <p className="text-sm font-medium">Flexible Plans</p>
//               </div>
//               <div className="text-center space-y-2">
//                 <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mx-auto">
//                   <Shield className="h-6 w-6 text-accent-foreground" />
//                 </div>
//                 <p className="text-sm font-medium">Secure Payment</p>
//               </div>
//               <div className="text-center space-y-2">
//                 <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mx-auto">
//                   <Truck className="h-6 w-6 text-accent-foreground" />
//                 </div>
//                 <p className="text-sm font-medium">Fast Delivery</p>
//               </div>
//             </div>
//           </div>

//           {/* Right Content - Hero Image Placeholder */}
//           <div className="relative animate-fade-in">
//             <div className="aspect-square rounded-2xl gradient-hero opacity-20 animate-glow" />
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="text-center space-y-4 p-8 bg-background/80 backdrop-blur rounded-xl shadow-card">
//                 <div className="text-6xl">📱💻🎮</div>
//                 <p className="text-lg font-semibold">Premium Electronics</p>
//                 <p className="text-sm text-muted-foreground">Starting from Rs. 5,000/month</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;
