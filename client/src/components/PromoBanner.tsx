import { useState, useEffect } from "react";
import { Flame } from "lucide-react";

const promos = [
  "Monthly Deals & Discounts",
  "100k+ products at one click",
  "Welcome to InstallMart",
  "Flat 199 delivery charges",
  "Same day delivery available",
  "Easy Installment Plans - 6, 12, 18 Months",
  "Shop Now, Pay Later!",
  "0% Interest on Select Products",
];

export const PromoBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 animate-fade-in">
          <Flame className="h-4 w-4 animate-pulse" />
          <span className="font-medium text-sm md:text-base">
            {promos[currentIndex]}
          </span>
          <Flame className="h-4 w-4 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
