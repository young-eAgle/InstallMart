import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "./AuthContext";
import type { Product, Wishlist } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlist: Product[];
  loading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();

  // Load wishlist on mount or when user logs in
  useEffect(() => {
    if (user && token) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user, token]);

  const loadWishlist = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const { wishlist: data } = await wishlistApi.get(token);
      setWishlist(data.products || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      const { wishlist: data } = await wishlistApi.add(product.id, token);
      setWishlist(data.products || []);
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!token) return;

    try {
      const { wishlist: data } = await wishlistApi.remove(productId, token);
      setWishlist(data.products || []);
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const clearWishlist = async () => {
    if (!token) return;

    try {
      await wishlistApi.clear(token);
      setWishlist([]);
      toast({
        title: "Wishlist Cleared",
        description: "All items have been removed from your wishlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((product) => product.id === productId);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
