import { ShoppingCart, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { WishlistButton } from "./WishlistButton";
import type { Product } from "@/types";

type ProductCardProps = Pick<Product, "id" | "name" | "price" | "image_url" | "stock" | "category">;

const ProductCard = ({ id, name, price, image_url, stock, category }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Calculate installment based on category-specific rates
  const getCategoryInterestRate = (category: string) => {
    // Category 1: Refrigerator / AC / LED / Washing Machine
    const category1 = ['Refrigerator', 'AC', 'LED', 'Washing Machine', 'Air Conditioner', 'Television', 'TV'];
    // Category 2: Mobile / Solar / Laptop / Motorcycle
    const category2 = ['Mobile', 'Solar', 'Laptop', 'Motorcycle', 'Smartphones', 'Laptops & Computers', 'Phone', 'Smartphone', 'Laptop'];
    // Category 3: Oven / Dryer / Single W/M / Kitchen Home Appliances
    const category3 = ['Oven', 'Dryer', 'Single W/M', 'Kitchen Home Appliances', 'Microwave', 'Blender', 'Juicer', 'Toaster'];
    
    // Normalize category name for comparison
    const normalizedCategory = category.toLowerCase();
    
    if (category1.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return 0.25; // 25% interest for 12 months
    } else if (category2.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return 0.30; // 30% interest for 12 months
    } else if (category3.some(cat => normalizedCategory.includes(cat.toLowerCase()))) {
      return 0.40; // 40% interest for 12 months
    }
    // Default rate
    return 0.30;
  };

  const interestRate = getCategoryInterestRate(category);
  const totalPriceWithInterest = price * (1 + interestRate);
  const installmentFrom = Math.round(totalPriceWithInterest / 12);

  const product = { id, name, price, image_url, stock, category } as Product;

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col relative">
      <div
        className="relative overflow-hidden aspect-square bg-muted cursor-pointer"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={image_url || "/placeholder.svg"}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Badge variant="secondary" className="bg-black/80 backdrop-blur text-white text-xs px-2 py-1">
            {category}
          </Badge>
          {stock < 10 && stock > 0 && (
            <Badge variant="destructive" className="backdrop-blur text-xs px-2 py-1">
              Only {stock} left
            </Badge>
          )}
          {stock === 0 && (
            <Badge variant="destructive" className="backdrop-blur text-xs px-2 py-1">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <WishlistButton product={product} variant="default" size="sm" />
        </div>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${id}`);
          }}
        >
          <Button variant="secondary" size="sm">
            Quick View
          </Button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>

      <CardContent className="p-4 flex-grow flex flex-col">
        <h3
          className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer flex-grow"
          onClick={() => navigate(`/product/${id}`)}
        >
          {name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-primary">
            Rs. {price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/10 rounded-lg p-2 mt-auto">
          <Calendar className="h-4 w-4 text-accent" />
          <span className="font-medium">
            12mo <span className="text-accent font-bold">Rs. {installmentFrom.toLocaleString()}/mo</span>
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gradient-accent py-5 font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate directly to product detail page for installment selection
            navigate(`/product/${id}`);
          }}
          disabled={stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {stock === 0 ? "Out of Stock" : "Order Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;




// import { ShoppingCart, Calendar } from "lucide-react";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "@/contexts/CartContext";
// import type { Product } from "@/types";

// type ProductCardProps = Pick<Product, "id" | "name" | "price" | "image_url" | "stock" | "category">;

// const ProductCard = ({ id, name, price, image_url, stock, category }: ProductCardProps) => {
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const installmentFrom = Math.round(price / 18);

//   return (
//     <Card className="group overflow-hidden shadow-card hover:shadow-card-hover transition-smooth">
//       <div
//         className="relative overflow-hidden aspect-square bg-muted cursor-pointer"
//         onClick={() => navigate(`/product/${id}`)}
//       >
//         <img
//           src={image_url || "/placeholder.svg"}
//           alt={name}
//           className="object-cover w-full h-full group-hover:scale-110 transition-smooth"
//         />
//         <div className="absolute top-3 right-3 flex flex-col gap-2">
//           <Badge variant="secondary" className="bg-background/90 backdrop-blur">
//             {category}
//           </Badge>
//           {stock < 10 && (
//             <Badge variant="destructive" className="bg-destructive/90 backdrop-blur">
//               Low Stock
//             </Badge>
//           )}
//         </div>
//         <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
//       </div>

//       <CardContent className="p-4">
//         <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-smooth">
//           {name}
//         </h3>

//         <div className="flex items-baseline gap-2 mb-3">
//           <span className="text-2xl font-bold text-primary">
//             Rs. {price.toLocaleString()}
//           </span>
//         </div>

//         <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/10 rounded-lg p-2">
//           <Calendar className="h-4 w-4 text-accent" />
//           <span className="font-medium">
//             From <span className="text-accent font-bold">Rs. {installmentFrom.toLocaleString()}/mo</span>
//           </span>
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0 flex gap-2">
//         <Button
//           variant="outline"
//           className="flex-1"
//           onClick={() => navigate(`/product/${id}`)}
//         >
//           View Details
//         </Button>
//         <Button
//           className="flex-1 gradient-accent"
//           onClick={() => addToCart({ id, name, price, image_url, category })}
//           disabled={stock === 0}
//         >
//           <ShoppingCart className="h-4 w-4 mr-2" />
//           {stock === 0 ? "Out of Stock" : "Add to Cart"}
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// export default ProductCard;
