import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerSlide {
  id: string | number;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  link?: string;
}

interface HeroBannerProps {
  slides: BannerSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export const HeroBanner = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useState(() => {
    if (!autoPlay || !slides || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(interval);
  });

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  const BannerImage = () => (
    <>
      {/* Desktop Image - 16:9 aspect ratio */}
      <img
        src={currentSlide.desktopImage}
        alt={currentSlide.alt}
        className="hidden md:block w-full h-auto object-cover"
      />
      {/* Mobile Image - shows full image */}
      <img
        src={currentSlide.mobileImage}
        alt={currentSlide.alt}
        className="block md:hidden w-full h-auto object-cover"
      />
    </>
  );

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Banner Content */}
      <div className="relative">
        {currentSlide.link ? (
          <a href={currentSlide.link} className="block">
            <BannerImage />
          </a>
        ) : (
          <BannerImage />
        )}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-primary scale-110"
                  : "bg-background/60 hover:bg-background/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;


// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// interface Banner {
//   id: string;
//   title?: string;
//   subtitle?: string;
//   description?: string;
//   image_url: string;
//   link?: string;
//   buttonText?: string;
//   backgroundColor?: string;
//   textColor?: string;
//   type?: string;
// }

// interface HeroBannerProps {
//   banners: Banner[];
//   mode?: "component" | "image"; // New: Support both modes
// }

// export const HeroBanner = ({
//   banners,
//   mode = "component",
// }: HeroBannerProps) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (banners.length <= 1) return;

//     const timer = setInterval(() => {
//       setDirection(1);
//       setCurrentIndex((prev) => (prev + 1) % banners.length);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [banners.length]);

//   const goToSlide = (index: number) => {
//     setDirection(index > currentIndex ? 1 : -1);
//     setCurrentIndex(index);
//   };

//   const goToPrevious = () => {
//     setDirection(-1);
//     setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
//   };

//   const goToNext = () => {
//     setDirection(1);
//     setCurrentIndex((prev) => (prev + 1) % banners.length);
//   };

//   if (banners.length === 0) return null;

//   const currentBanner = banners[currentIndex];

//   const slideVariants = {
//     enter: (direction: number) => ({
//       x: direction > 0 ? 1000 : -1000,
//       opacity: 0,
//     }),
//     center: {
//       zIndex: 1,
//       x: 0,
//       opacity: 1,
//     },
//     exit: (direction: number) => ({
//       zIndex: 0,
//       x: direction < 0 ? 1000 : -1000,
//       opacity: 0,
//     }),
//   };

//   // IMAGE MODE - Just display the full banner image
//   if (mode === "image") {
//     return (
//       <div className="relative w-full h-[300px] sm:h-[400px] md:h-[538px]  overflow-hidden  bg-green-500">
//         <AnimatePresence initial={false} custom={direction}>
//           <motion.div
//             key={currentIndex}
//             custom={direction}
//             variants={slideVariants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{
//               x: { type: "spring", stiffness: 300, damping: 30 },
//               opacity: { duration: 0.2 },
//             }}
//             className="absolute w-full h-full cursor-pointer"
//             onClick={() => navigate(currentBanner.link || "/products")}
//           >
//             <img
//               src={currentBanner.image_url}
//               alt={currentBanner.title || "Banner"}
//               className="w-full h-full object-contain"
//             />
//           </motion.div>
//         </AnimatePresence>

//         {/* Navigation Controls */}
//         {banners.length > 1 && (
//           <>
//             <button
//               onClick={goToPrevious}
//               className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
//             >
//               <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
//             </button>
//             <button
//               onClick={goToNext}
//               className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
//             >
//               <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
//             </button>

//             <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-10">
//               {banners.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => goToSlide(index)}
//                   className={`h-1.5 sm:h-2 rounded-full transition-all ${
//                     index === currentIndex
//                       ? "w-4 sm:w-8 bg-white"
//                       : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/80"
//                   }`}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     );
//   }

//   // COMPONENT MODE - Full structured banner
//   return (
//     <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] overflow-hidden">
//       <AnimatePresence initial={false} custom={direction}>
//         <motion.div
//           key={currentIndex}
//           custom={direction}
//           variants={slideVariants}
//           initial="enter"
//           animate="center"
//           exit="exit"
//           transition={{
//             x: { type: "spring", stiffness: 300, damping: 30 },
//             opacity: { duration: 0.2 },
//           }}
//           className="absolute w-full h-full"
//         >
//           <div
//             className="w-full h-full flex items-center relative overflow-hidden"
//             style={{
//               background: currentBanner.backgroundColor
//                 ? `linear-gradient(135deg, ${currentBanner.backgroundColor} 0%, ${currentBanner.backgroundColor}dd 100%)`
//                 : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//             }}
//           >
//             {/* Background Pattern */}
//             <div className="absolute inset-0 opacity-10">
//               <div
//                 className="absolute inset-0"
//                 style={{
//                   backgroundImage:
//                     "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
//                   backgroundSize: "40px 40px",
//                 }}
//               />
//             </div>

//             <div className="container mx-auto px-4 relative z-10">
//               <div className="grid md:grid-cols-2 gap-12 items-center">
//                 {/* Text Content */}
//                 <div className="space-y-6">
//                   {currentBanner.subtitle && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.2 }}
//                       className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30"
//                     >
//                       <span
//                         className="text-sm font-semibold"
//                         style={{ color: currentBanner.textColor || "#ffffff" }}
//                       >
//                         {currentBanner.subtitle}
//                       </span>
//                     </motion.div>
//                   )}

//                   <motion.h1
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.3 }}
//                     className="text-2xl sm:text-4xl md:text-6xl font-bold leading-tight"
//                     style={{ color: currentBanner.textColor || "#ffffff" }}
//                   >
//                     {currentBanner.title}
//                   </motion.h1>

//                   {currentBanner.description && (
//                     <motion.p
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.4 }}
//                       className="text-base sm:text-lg md:text-xl max-w-xl"
//                       style={{
//                         color: currentBanner.textColor
//                           ? `${currentBanner.textColor}dd`
//                           : "#ffffffdd",
//                       }}
//                     >
//                       {currentBanner.description}
//                     </motion.p>
//                   )}

//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.5 }}
//                   >
//                     <Button
//                       size="lg"
//                       className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
//                       onClick={() =>
//                         navigate(currentBanner.link || "/products")
//                       }
//                     >
//                       {currentBanner.buttonText || "Shop Now"}
//                     </Button>
//                   </motion.div>
//                 </div>

//                 {/* Image */}
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.3, duration: 0.5 }}
//                   className="relative"
//                 >
//                   <div className="absolute inset-0 bg-white/20 rounded-3xl blur-3xl" />
//                   <img
//                     src={currentBanner.image_url}
//                     alt={currentBanner.title}
//                     className="relative w-full h-auto max-h-96 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
//                   />
//                 </motion.div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       {/* Navigation */}
//       {banners.length > 1 && (
//         <>
//           <button
//             onClick={goToPrevious}
//             className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
//           >
//             <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
//           </button>
//           <button
//             onClick={goToNext}
//             className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
//           >
//             <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
//           </button>

//           <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-10">
//             {banners.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => goToSlide(index)}
//                 className={`h-1.5 sm:h-2 rounded-full transition-all ${
//                   index === currentIndex
//                     ? "w-4 sm:w-8 bg-white"
//                     : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/80"
//                 }`}
//               />
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HeroBanner;
