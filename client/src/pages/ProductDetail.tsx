import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Calendar } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";
import { WishlistButton } from "@/components/WishlistButton";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.get(id as string),
    enabled: Boolean(id),
  });

  const product = data?.product || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const installmentFrom = Math.round(product.price / 18);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              {product.stock < 10 && (
                <Badge variant="destructive">Only {product.stock} left!</Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  Rs. {product.price.toLocaleString()}
                </span>
              </div>

              <Card className="bg-accent/10">
                <CardContent className="p-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <span className="font-medium">
                    From <span className="text-accent font-bold text-lg">Rs. {installmentFrom.toLocaleString()}/mo</span>
                  </span>
                </CardContent>
              </Card>
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 gradient-accent text-lg"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      category: product.category,
                      quantity: 1,
                    });
                  }}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>

                <WishlistButton product={product} size="lg" showText={false} />
              </div>


              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/plans")}
              >
                View Installment Plans
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Product Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Flexible payment options</li>
                <li>✓ 0% interest on select plans</li>
                <li>✓ Fast delivery</li>
                <li>✓ Secure checkout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
