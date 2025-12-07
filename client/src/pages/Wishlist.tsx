import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist, loading } =
    useWishlist();
  const { addToCart } = useCart();

  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      // For wishlist items, we default to full payment (0 months)
      installmentMonths: 0,
    });
  };

  // const handleAddToCart = (product: any) => {
  //   addToCart({
  //     id: product.id,
  //     name: product.name,
  //     price: product.price,
  //     image_url: product.image_url,
  //     category: product.category,
  //     quantity: 1,
  //   });
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="w-10 h-10 text-primary fill-primary" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
              for later
            </p>
          </div>

          {wishlist.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlist.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      removeFromWishlist(product.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  {product.stock <= 0 && (
                    <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </div>
                  )}

                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Only {product.stock} left
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3
                    className="font-semibold text-lg mb-1 line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>

                  {product.category && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.category}
                    </p>
                  )}

                  <p className="text-2xl font-bold text-primary mb-4">
                    Rs. {product.price.toLocaleString()}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={product.stock <= 0}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">
                Your Wishlist is Empty
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start adding products you love to your wishlist and come back to
                them later
              </p>
              <Button onClick={() => navigate("/products")}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Helpful Info */}
        {wishlist.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-none">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Easy Shopping</h3>
                  <p className="text-sm text-muted-foreground">
                    Add items to cart with one click
                  </p>
                </div>
                <div>
                  <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Save Favorites</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep track of products you love
                  </p>
                </div>
                <div>
                  <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Stock Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified when items are available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Wishlist;

// import { useNavigate } from "react-router-dom";
// import Navbar from "@/components/Navbar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Heart, ShoppingCart, Trash2,Package } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useState } from "react";

// const Wishlist = () => {
//   const { toast } = useToast();
//   const [wishlistItems, setWishlistItems] = useState([
//     {
//       id: 1,
//       name: "Premium Wireless Headphones",
//       price: 299.99,
//       image: "/placeholder.svg",
//       inStock: true
//     },
//     {
//       id: 2,
//       name: "Smart Fitness Watch",
//       price: 399.99,
//       image: "/placeholder.svg",
//       inStock: true
//     },
//     {
//       id: 3,
//       name: "Professional Camera Kit",
//       price: 1299.99,
//       image: "/placeholder.svg",
//       inStock: false
//     }
//   ]);

//   const removeItem = (id: number) => {
//     setWishlistItems(items => items.filter(item => item.id !== id));
//     toast({
//       title: "Removed from wishlist",
//       description: "Item has been removed from your wishlist",
//     });
//   };

//   const addToCart = (item: any) => {
//     toast({
//       title: "Added to cart",
//       description: `${item.name} has been added to your cart`,
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <main className="container mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
//             <Heart className="w-10 h-10 text-primary fill-primary" />
//             My Wishlist
//           </h1>
//           <p className="text-muted-foreground">
//             {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
//           </p>
//         </div>

//         {/* Wishlist Items */}
//         {wishlistItems.length > 0 ? (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {wishlistItems.map((item) => (
//               <Card key={item.id} className="overflow-hidden">
//                 <div className="relative">
//                   <img
//                     src={item.image}
//                     alt={item.name}
//                     className="w-full h-48 object-cover"
//                   />
//                   <Button
//                     variant="destructive"
//                     size="icon"
//                     className="absolute top-2 right-2"
//                     onClick={() => removeItem(item.id)}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                   {!item.inStock && (
//                     <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
//                       Out of Stock
//                     </div>
//                   )}
//                 </div>

//                 <CardContent className="p-6">
//                   <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
//                   <p className="text-2xl font-bold text-primary mb-4">
//                     ${item.price.toFixed(2)}
//                   </p>

//                   <Button
//                     className="w-full"
//                     disabled={!item.inStock}
//                     onClick={() => addToCart(item)}
//                   >
//                     <ShoppingCart className="w-4 h-4 mr-2" />
//                     {item.inStock ? 'Add to Cart' : 'Out of Stock'}
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <Card className="text-center py-16">
//             <CardContent>
//               <Heart className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
//               <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h2>
//               <p className="text-muted-foreground mb-8 max-w-md mx-auto">
//                 Start adding products you love to your wishlist and come back to them later
//               </p>
//               <Button asChild>
//                 <a href="/products">Browse Products</a>
//               </Button>
//             </CardContent>
//           </Card>
//         )}

//         {/* Share Wishlist */}
//         {wishlistItems.length > 0 && (
//           <Card className="mt-8 bg-card/50">
//             <CardContent className="p-6 text-center">
//               <h3 className="text-xl font-semibold mb-2">Share Your Wishlist</h3>
//               <p className="text-muted-foreground mb-4">
//                 Let friends and family know what you're wishing for
//               </p>
//               <Button variant="outline">
//                 Share Wishlist
//               </Button>
//             </CardContent>
//           </Card>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Wishlist;
