import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { categoryApi } from "@/lib/api";
import { ArrowRight, Package } from "lucide-react";

export const CategoryShowcase = () => {
  const navigate = useNavigate();

  // Fetch categories from API
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const categories = data?.categories ?? [];

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Shop by Categories</h2>
          <p className="text-muted-foreground">
            Browse our wide range of electronic products
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="h-48 bg-muted/40 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Shop by Categories</h2>
          <p className="text-muted-foreground">
            Browse our wide range of electronic products
          </p>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No categories available at the moment.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Shop by Categories</h2>
        <p className="text-muted-foreground">
          Browse our wide range of electronic products
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category: any) => (
          <Card
            key={category.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-primary"
            onClick={() => navigate(`/products?category=${category.slug}`)}
          >
            <CardContent className="p-6 text-center">
              {category.icon ? (
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Package className="h-8 w-8" style={{ color: category.color }} />
                </div>
              )}
              <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {category.subcategories?.length || 0} items
              </p>
              <div className="flex items-center justify-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};


// import { useNavigate } from "react-router-dom";
// import { Card, CardContent } from "@/components/ui/card";
// import { categories } from "@/data/categories";
// import { ArrowRight } from "lucide-react";

// export const CategoryShowcase = () => {
//   const navigate = useNavigate();

//   return (
//     <section className="container mx-auto px-4 py-12">
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold mb-2">Shop by Department</h2>
//         <p className="text-muted-foreground">
//           Browse our wide range of electronic products
//         </p>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//         {categories.map((category) => {
//           const Icon = category.icon;
//           return (
//             <Card
//               key={category.id}
//               className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-primary"
//               onClick={() => navigate(`/products?category=${category.slug}`)}
//             >
//               <CardContent className="p-6 text-center">
//                 <div
//                   className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
//                   style={{ backgroundColor: `${category.color}20` }}
//                 >
//                   <Icon className="h-8 w-8" style={{ color: category.color }} />
//                 </div>
//                 <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
//                   {category.name}
//                 </h3>
//                 <p className="text-xs text-muted-foreground mb-3">
//                   {category.subcategories.length} items
//                 </p>
//                 <div className="flex items-center justify-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
//                   Shop Now <ArrowRight className="h-3 w-3 ml-1" />
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </section>
//   );
// };
