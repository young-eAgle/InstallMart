import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";

const Index = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productApi.list({ featured: true }),
  });

  const featuredProducts = data?.products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">
              Discover our best-selling items with flexible payment plans
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 bg-muted/40 animate-pulse rounded-xl"
              />
            ))
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No featured products yet.
            </div>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          )}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button variant="outline" className="w-full sm:w-auto">
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Shopping with Zero Hassle
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers enjoying flexible payment plans
          </p>
          <Button size="lg" className="gradient-primary shadow-glow">
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
