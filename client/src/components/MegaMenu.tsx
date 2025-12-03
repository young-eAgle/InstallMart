import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Grid3x3, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const MegaMenu = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<any | null>(null);

  // Fetch categories from API
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const categories = data?.categories ?? [];

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/products?category=${categorySlug}`);
  };

  const handleSubcategoryClick = (
    categorySlug: string,
    subcategorySlug: string,
  ) => {
    navigate(
      `/products?category=${categorySlug}&subcategory=${subcategorySlug}`,
    );
  };

  if (isLoading) {
    return (
      <div className="h-10 w-40 bg-primary rounded-md animate-pulse" />
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
            <Grid3x3 className="h-4 w-4 mr-2" />
            All Departments
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid grid-cols-[250px_1fr] w-[900px] p-0">
              {/* Left Side - Main Categories */}
              <div className="border-r bg-muted/30">
                {categories.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No categories available
                  </div>
                ) : (
                  categories.map((category: any) => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                        hoveredCategory?.id === category.id
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "hover:bg-muted"
                      }`}
                      onMouseEnter={() => setHoveredCategory(category)}
                      onClick={() => handleCategoryClick(category.slug)}
                    >
                      <div className="flex items-center gap-3">
                        {category.icon ? (
                          <div
                            className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <Package
                              className="h-4 w-4"
                              style={{ color: category.color }}
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>

              {/* Right Side - Subcategories */}
              <div className="p-6">
                {hoveredCategory ? (
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      {hoveredCategory.icon ? (
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                          style={{
                            backgroundColor: `${hoveredCategory.color}20`,
                          }}
                        >
                          <img
                            src={hoveredCategory.icon}
                            alt={hoveredCategory.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${hoveredCategory.color}20`,
                          }}
                        >
                          <Package
                            className="h-5 w-5"
                            style={{ color: hoveredCategory.color }}
                          />
                        </div>
                      )}
                      {hoveredCategory.name}
                    </h3>
                    {hoveredCategory.subcategories &&
                    hoveredCategory.subcategories.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          {hoveredCategory.subcategories.map((sub: any) => (
                            <div
                              key={sub._id}
                              className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors group"
                              onClick={() =>
                                handleSubcategoryClick(
                                  hoveredCategory.slug,
                                  sub.slug,
                                )
                              }
                            >
                              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                {sub.name}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <button
                            onClick={() =>
                              handleCategoryClick(hoveredCategory.slug)
                            }
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            View All {hoveredCategory.name} →
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No subcategories available. Click to view all products
                        in this category.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Hover over a category to see subcategories</p>
                  </div>
                )}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};





// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronRight, Grid3x3 } from "lucide-react";
// import { categories, type Category } from "@/data/categories";
// import {
//   NavigationMenu,
//   NavigationMenuContent,
//   NavigationMenuItem,
//   NavigationMenuList,
//   NavigationMenuTrigger,
// } from "@/components/ui/navigation-menu";

// export const MegaMenu = () => {
//   const navigate = useNavigate();
//   const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

//   const handleCategoryClick = (categorySlug: string) => {
//     navigate(`/products?category=${categorySlug}`);
//   };

//   const handleSubcategoryClick = (
//     categorySlug: string,
//     subcategorySlug: string,
//   ) => {
//     navigate(
//       `/products?category=${categorySlug}&subcategory=${subcategorySlug}`,
//     );
//   };

//   return (
//     <NavigationMenu>
//       <NavigationMenuList>
//         <NavigationMenuItem>
//           <NavigationMenuTrigger className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
//             <Grid3x3 className="h-4 w-4 mr-2" />
//             All Departments
//           </NavigationMenuTrigger>
//           <NavigationMenuContent>
//             <div className="grid grid-cols-[250px_1fr] w-[900px] p-0">
//               {/* Left Side - Main Categories */}
//               <div className="border-r bg-muted/30">
//                 {categories.map((category) => {
//                   const Icon = category.icon;
//                   return (
//                     <div
//                       key={category.id}
//                       className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
//                         hoveredCategory?.id === category.id
//                           ? "bg-primary/10 border-l-4 border-primary"
//                           : "hover:bg-muted"
//                       }`}
//                       onMouseEnter={() => setHoveredCategory(category)}
//                       onClick={() => handleCategoryClick(category.slug)}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className="w-8 h-8 rounded-lg flex items-center justify-center"
//                           style={{ backgroundColor: `${category.color}20` }}
//                         >
//                           <Icon
//                             className="h-4 w-4"
//                             style={{ color: category.color }}
//                           />
//                         </div>
//                         <span className="text-sm font-medium">
//                           {category.name}
//                         </span>
//                       </div>
//                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Right Side - Subcategories */}
//               <div className="p-6">
//                 {hoveredCategory ? (
//                   <div>
//                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
//                       <div
//                         className="w-10 h-10 rounded-lg flex items-center justify-center"
//                         style={{
//                           backgroundColor: `${hoveredCategory.color}20`,
//                         }}
//                       >
//                         <hoveredCategory.icon
//                           className="h-5 w-5"
//                           style={{ color: hoveredCategory.color }}
//                         />
//                       </div>
//                       {hoveredCategory.name}
//                     </h3>
//                     <div className="grid grid-cols-3 gap-3">
//                       {hoveredCategory.subcategories.map((sub) => (
//                         <div
//                           key={sub.id}
//                           className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors group"
//                           onClick={() =>
//                             handleSubcategoryClick(
//                               hoveredCategory.slug,
//                               sub.slug,
//                             )
//                           }
//                         >
//                           <p className="text-sm font-medium group-hover:text-primary transition-colors">
//                             {sub.name}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="mt-4 pt-4 border-t">
//                       <button
//                         onClick={() =>
//                           handleCategoryClick(hoveredCategory.slug)
//                         }
//                         className="text-sm text-primary hover:underline font-medium"
//                       >
//                         View All {hoveredCategory.name} →
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center h-full text-muted-foreground">
//                     <p>Hover over a category to see subcategories</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </NavigationMenuContent>
//         </NavigationMenuItem>
//       </NavigationMenuList>
//     </NavigationMenu>
//   );
// };
