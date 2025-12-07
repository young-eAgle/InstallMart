import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export const FullscreenTakeover = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const { data } = useQuery({
    queryKey: ["banners", "splash"],
    queryFn: () => bannerApi.getActive("splash"),
  });

  const takeoverBanners = data?.banners ?? [];

  // ✔ FIX 1 — Only close after 8 sec if banners exist
  useEffect(() => {
    if (takeoverBanners.length === 0) return;

    const timer = setTimeout(() => setIsVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [takeoverBanners.length]);

  // ✔ FIX 2 — Auto slide
  useEffect(() => {
    if (takeoverBanners.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % takeoverBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [takeoverBanners.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + takeoverBanners.length) % takeoverBanners.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % takeoverBanners.length);
  };

  const closeTakeover = () => setIsVisible(false);

  const handleBannerClick = (link?: string) => {
    if (link) window.location.href = link;
    closeTakeover();
  };

  if (!isVisible || takeoverBanners.length === 0) return null;

  const currentBanner = takeoverBanners[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 800 : -800,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1, zIndex: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 800 : -800,
      opacity: 0,
      zIndex: 0,
    }),
  };

 return (
  <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6">

    {/* Popup Container (smaller box, center aligned) */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-4 sm:p-6 md:p-8 overflow-hidden"
    >
      {/* Close Button */}
      <button
        onClick={closeTakeover}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gray-200 hover:bg-gray-300 p-2 sm:p-3 rounded-full"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
      </button>

      {/* Welcome Text */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
        Welcome to Our Store!
      </h2>

      {/* Banner Image */}
      <div className="w-full flex justify-center">
        <img
          src={currentBanner.image_url}
          alt="Popup Banner"
          className="rounded-xl max-h-60 sm:max-h-80 md:max-h-96 lg:max-h-[500px] object-contain w-full"
        />
      </div>

      {/* Pagination Dots (if multiple banners) */}
      {takeoverBanners.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {takeoverBanners.map((_, index) => (
            <div
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full cursor-pointer ${
                index === currentIndex ? "bg-gray-800" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Prev & Next Arrows */}
      {takeoverBanners.length > 1 && (
        <>
          <button
            onClick={() => {
              setDirection(-1);
              goToPrevious();
            }}
            className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 p-2 sm:p-3 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => {
              setDirection(1);
              goToNext();
            }}
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 p-2 sm:p-3 rounded-full"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
    </motion.div>
  </div>
);

};






// import { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { bannerApi } from "@/lib/api";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, ChevronLeft, ChevronRight } from "lucide-react";

// interface Banner {
//   id: string;
//   title?: string;
//   subtitle?: string;
//   description?: string;
//   image_url: string;
//   link?: string;
//   buttonText?: string;
//   type?: string;
// }

// export const FullscreenTakeover = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(0);
//   const [isVisible, setIsVisible] = useState(true);

//   // Fetch fullscreen takeover banners
//   const { data } = useQuery({
//     queryKey: ["banners", "splash"],
//     queryFn: () => bannerApi.getActive("splash"),
//   });

//   const takeoverBanners = data?.banners ?? [];

//   // Auto-hide takeover after 8 seconds if no interaction
//   useEffect(() => {
//     if (takeoverBanners.length === 0) {
//       const timer = setTimeout(() => {
//         setIsVisible(false);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
    
//     // Auto-close after 8 seconds
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//     }, 8000);
    
//     return () => clearTimeout(timer);
//   }, [takeoverBanners.length]);

//   // Auto-advance banners
//   useEffect(() => {
//     if (takeoverBanners.length <= 1) return;

//     const timer = setInterval(() => {
//       setDirection(1);
//       setCurrentIndex((prev) => (prev + 1) % takeoverBanners.length);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [takeoverBanners.length]);

//   const goToSlide = (index: number) => {
//     setDirection(index > currentIndex ? 1 : -1);
//     setCurrentIndex(index);
//   };

//   const goToPrevious = () => {
//     setDirection(-1);
//     setCurrentIndex((prev) => (prev - 1 + takeoverBanners.length) % takeoverBanners.length);
//   };

//   const goToNext = () => {
//     setDirection(1);
//     setCurrentIndex((prev) => (prev + 1) % takeoverBanners.length);
//   };

//   const closeTakeover = () => {
//     setIsVisible(false);
//   };

//   const handleBannerClick = (link?: string) => {
//     if (link) {
//       window.location.href = link;
//     }
//     closeTakeover();
//   };

//   if (!isVisible || takeoverBanners.length === 0) {
//     return null;
//   }

//   const currentBanner = takeoverBanners[currentIndex];

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

//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-[100] bg-gray-100 flex items-center justify-center"
//         >
//           {/* Close button */}
//           <button
//             onClick={closeTakeover}
//             className="absolute top-6 right-6 z-20 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-colors"
//             aria-label="Close banner"
//           >
//             <X className="w-8 h-8" />
//           </button>

//           <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
//             <AnimatePresence initial={false} custom={direction}>
//               <motion.div
//                 key={currentIndex}
//                 custom={direction}
//                 variants={slideVariants}
//                 initial="enter"
//                 animate="center"
//                 exit="exit"
//                 transition={{
//                   x: { type: "spring", stiffness: 300, damping: 30 },
//                   opacity: { duration: 0.2 },
//                 }}
//                 className="absolute w-full h-full cursor-pointer flex items-center justify-center"
//                 onClick={() => handleBannerClick(currentBanner.link)}
//               >
//                 <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
//                   <img
//                     src={currentBanner.image_url}
//                     alt={currentBanner.title || "Fullscreen Takeover Banner"}
//                     className="max-w-full max-h-full object-contain w-auto h-auto max-h-[calc(100vh-120px)]"
//                   />
//                 </div>
                
//                 {/* Overlay content */}
//                 <div className="absolute inset-0 bg-black/40 flex items-end md:items-center p-4 sm:p-8 pointer-events-none">
//                   <div className="max-w-4xl mx-auto text-center md:text-left text-white pointer-events-auto w-full">
//                     {currentBanner.title && (
//                       <motion.h1
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2 }}
//                         className="text-2xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4"
//                       >
//                         {currentBanner.title}
//                       </motion.h1>
//                     )}
                    
//                     {currentBanner.description && (
//                       <motion.p
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.4 }}
//                         className="text-base sm:text-xl md:text-2xl mb-4 sm:mb-6 max-w-2xl"
//                       >
//                         {currentBanner.description}
//                       </motion.p>
//                     )}
                    
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.6 }}
//                       className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start"
//                     >
//                       {currentBanner.link && (
//                         <button 
//                           className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-base sm:text-lg transition-colors shadow-lg"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleBannerClick(currentBanner.link);
//                           }}
//                         >
//                           {currentBanner.buttonText || "Explore Now"}
//                         </button>
//                       )}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           closeTakeover();
//                         }}
//                         className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-base sm:text-lg backdrop-blur-sm transition-colors"
//                       >
//                         Continue to Site
//                       </button>
//                     </motion.div>
//                   </div>
//                 </div>
//               </motion.div>
//             </AnimatePresence>

//             {/* Navigation Controls */}
//             {takeoverBanners.length > 1 && (
//               <>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     goToPrevious();
//                   }}
//                   className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full text-white hover:bg-white/30 transition-all pointer-events-auto"
//                   aria-label="Previous banner"
//                 >
//                   <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     goToNext();
//                   }}
//                   className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full text-white hover:bg-white/30 transition-all pointer-events-auto"
//                   aria-label="Next banner"
//                 >
//                   <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//                 </button>

//                 <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10 pointer-events-auto">
//                   {takeoverBanners.map((_: any, index: number) => (
//                     <button
//                       key={index}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         goToSlide(index);
//                       }}
//                       className={`h-2 sm:h-3 rounded-full transition-all ${
//                         index === currentIndex
//                           ? "w-6 sm:w-10 bg-white"
//                           : "w-2 sm:w-3 bg-white/50 hover:bg-white/80"
//                       }`}
//                       aria-label={`Go to banner ${index + 1}`}
//                     />
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };