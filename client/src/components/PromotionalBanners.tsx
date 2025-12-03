import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link?: string;
  buttonText?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface PromotionalBannersProps {
  banners: Banner[];
}

export const PromotionalBanners = ({ banners }: PromotionalBannersProps) => {
  const navigate = useNavigate();

  if (banners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card
            key={banner.id}
            className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate(banner.link || "/products")}
            style={{
              backgroundColor: banner.backgroundColor || "#ffffff",
            }}
          >
            <div className="relative h-64 overflow-hidden">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${banner.image_url})`,
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: banner.textColor || "#ffffff" }}
                >
                  {banner.title}
                </h3>

                {banner.subtitle && (
                  <p
                    className="text-sm mb-4"
                    style={{
                      color: banner.textColor
                        ? `${banner.textColor}dd`
                        : "#ffffffdd",
                    }}
                  >
                    {banner.subtitle}
                  </p>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-fit group-hover:gap-2 transition-all"
                >
                  {banner.buttonText || "Shop Now"}
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
