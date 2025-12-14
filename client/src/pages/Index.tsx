import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroBanner from "@/components/HeroBanner";
import { PromotionalBanners } from "@/components/PromotionalBanners";
import ProductCard from "@/components/ProductCard";
import { PromoBanner } from "@/components/PromoBanner";
import { CategoryShowcase } from "@/components/categoryShowcase";
import { CategoryProductSection } from "@/components/CategoryProductSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, Truck, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi, bannerApi, categoryApi } from "@/lib/api";

const Index = () => {
  const navigate = useNavigate();

  // Fetch hero banners
  const { data: heroBannersData } = useQuery({
    queryKey: ["banners", "hero"],
    queryFn: () => bannerApi.getActive("hero"),
  });

  // Fetch promotional banners
  const { data: promoBannersData } = useQuery({
    queryKey: ["banners", "promotional"],
    queryFn: () => bannerApi.getActive("promotional"),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  // Fetch products for each category
  const categories = categoriesData?.categories ?? [];
  const heroBanners = heroBannersData?.banners ?? [];
  const promoBanners = promoBannersData?.banners ?? [];

  // Fetch featured products
  const { data, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productApi.list({ featured: true }),
  });

  const featuredProducts = data?.products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PromoBanner />
      {/* <Hero /> */}

      {/* Hero Banner Carousel - Only show if banners exist */}
      {heroBanners && heroBanners.length > 0 ? (
        <HeroBanner 
          slides={heroBanners.map(banner => ({
            id: banner.id,
            desktopImage: banner.image_url,
            mobileImage: banner.image_url,
            alt: banner.title || 'Hero Banner',
            link: banner.link
          }))}
        />
      ) : (
        <Hero />
      )}

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">
              Discover our best-selling items with flexible payment plans
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex"
            onClick={() => navigate("/products")}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 bg-muted/40 animate-pulse rounded-xl"
              />
            ))
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="mb-4">No featured products yet.</p>
              <Button onClick={() => navigate("/products")}>
                Browse All Products
              </Button>
            </div>
          ) : (
            featuredProducts
              .slice(0, 8)
              .map((product) => <ProductCard key={product.id} {...product} />)
          )}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate("/products")}
          >
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Promotional Banners */}
      {promoBanners && promoBanners.length > 0 && (
        <PromotionalBanners banners={promoBanners} />
      )}

      {/* Category-wise Product Sections */}
      {categories && categories.slice(0, 4).map((category: any) => (
        <CategoryProductsWrapper key={category.id} category={category} />
      ))}

      {/* Features Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Free Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Easy Installments Available
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Installments</h3>
                  <p className="text-sm text-muted-foreground">
                    3, 6, or 12 months plans
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quick Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders shipped within 24hrs
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    100% secure transactions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Shopping with Zero Hassle
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers enjoying flexible payment plans on
            their favorite electronics
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="shadow-xl hover:shadow-2xl transition-shadow"
            onClick={() => navigate("/products")}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

// Wrapper component to fetch products for each category
const CategoryProductsWrapper = ({ category }: { category: any }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "category", category.slug],
    queryFn: () => productApi.list({ category: category.slug, limit: 5 }),
  });

  const products = data?.products ?? [];

  return (
    <CategoryProductSection
      category={category}
      products={products}
      isLoading={isLoading}
    />
  );
};

export default Index;
