import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  Star,
  TrendingUp,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { WishlistButton } from "./WishlistButton";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  stock: number;
  category: string;
  brand?: string;
  rating?: number;
}

interface CategoryProductSectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
  products: Product[];
  isLoading?: boolean;
}

export const CategoryProductSection = ({
  category,
  products,
  isLoading,
}: CategoryProductSectionProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-muted animate-pulse rounded-xl" />
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-96 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  // Calculate discount percentage (mock - add real logic)
  const getDiscountPercentage = () => Math.floor(Math.random() * 25) + 5;

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Decorative Background */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${category.color || "#3b82f6"} 1px, transparent 0)`,
          backgroundSize: "30px 30px",
        }}
      />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Category Icon & Title */}
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${category.color || "#3b82f6"} 0%, ${category.color || "#3b82f6"}dd 100%)`,
              }}
            >
              {category.icon && (
                <>
                  {category.icon.startsWith("http") ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span className="text-3xl filter drop-shadow-lg">
                      {category.icon}
                    </span>
                  )}
                </>
              )}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                {category.name}
              </h2>
              <p className="text-muted-foreground mt-1">
                Premium {category.name.toLowerCase()} with best prices
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="hidden lg:flex group border-2 hover:border-primary"
            onClick={() => navigate(`/products?category=${category.slug}`)}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Products Horizontal Scroll */}
        <div className="relative">
          {/* Gradient Overlays for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {products.slice(0, 6).map((product) => {
              const discount = getDiscountPercentage();
              const originalPrice = Math.round(
                product.price / (1 - discount / 100),
              );
              const isHovered = hoveredProduct === product.id;

              return (
                <Card
                  key={product.id}
                  className="group relative flex-shrink-0 w-64 overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl snap-start cursor-pointer"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <Badge
                      variant="destructive"
                      className="text-sm font-bold shadow-lg px-3 py-1 rounded-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      }}
                    >
                      -{discount}%
                    </Badge>
                  </div>

                  {/* Brand Badge */}
                  {product.brand && (
                    <div className="absolute top-3 right-3 z-20">
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold backdrop-blur-sm bg-white/95 shadow-md"
                      >
                        {product.brand}
                      </Badge>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <div className="absolute top-14 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <WishlistButton
                      product={product}
                      variant="ghost"
                      size="icon"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="relative h-64 bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <div
                        className="w-48 h-48 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${category.color || "#3b82f6"}40 0%, transparent 70%)`,
                        }}
                      />
                    </div>

                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="relative w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Quick View Overlay */}
                    <div
                      className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-4 space-y-3">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (product.rating || 4)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({product.rating || 4}.0)
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          Rs. {product.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          Rs. {originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-green-600 font-semibold">
                          Save Rs.{" "}
                          {(originalPrice - product.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Stock Status */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <p className="text-xs text-orange-600 font-semibold">
                        Only {product.stock} left in stock!
                      </p>
                    )}

                    {/* Add to Cart Button */}
                    <Button
                      size="sm"
                      className="w-full group-hover:shadow-lg transition-all"
                      disabled={product.stock <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image_url: product.image_url,
                          category: product.category,
                          installmentMonths: 0,
                        });
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}

            {/* View All Card */}
            <Card
              className="flex-shrink-0 w-64 overflow-hidden border-2 border-dashed hover:border-primary transition-all duration-300 cursor-pointer snap-start group"
              onClick={() => navigate(`/products?category=${category.slug}`)}
            >
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-muted/30 to-muted/60">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${category.color || "#3b82f6"}20 0%, ${category.color || "#3b82f6"}40 100%)`,
                  }}
                >
                  <ArrowRight className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">View All</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore {products.length}+ {category.name.toLowerCase()}
                </p>
                <Button variant="outline" size="sm">
                  Browse More
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* View All Button (Mobile) */}
        <div className="text-center mt-6 lg:hidden">
          <Button
            variant="outline"
            className="w-full max-w-sm"
            onClick={() => navigate(`/products?category=${category.slug}`)}
          >
            View All {category.name}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
