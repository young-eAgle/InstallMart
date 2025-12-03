import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types";

interface WishlistButtonProps {
  product: Product;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export const WishlistButton = ({
  product,
  variant = "outline",
  size = "icon",
  showText = false
}: WishlistButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/auth");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={inWishlist ? "text-red-500 hover:text-red-600" : ""}
    >
      <Heart
        className={`w-4 h-4 ${showText ? 'mr-2' : ''}`}
        fill={inWishlist ? "currentColor" : "none"}
      />
      {showText && (inWishlist ? "Remove from Wishlist" : "Add to Wishlist")}
    </Button>
  );
};
