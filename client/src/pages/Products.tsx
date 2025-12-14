import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { productApi, categoryApi } from "@/lib/api";
import { X, ChevronDown, Filter as FilterIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [subcategory, setSubcategory] = useState(
    searchParams.get("subcategory") || "",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  // Ref to track if the last navigation was from MegaMenu (URL change)
  const isNavigatingFromMenu = useRef(false);

  // Listen for URL parameter changes to update state when navigating from MegaMenu
  useEffect(() => {
    isNavigatingFromMenu.current = true;
    setCategory(searchParams.get("category") || "all");
    setSubcategory(searchParams.get("subcategory") || "");
    setSearchQuery(searchParams.get("search") || "");
    
    // Reset the flag after state update
    setTimeout(() => {
      isNavigatingFromMenu.current = false;
    }, 0);
  }, [searchParams]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    0, 500000,
  ]);
  const [sortBy, setSortBy] = useState("newest");

  // Helper function to handle slider value changes with proper typing
  const handleSliderChange = (values: number[]) => {
    if (values.length === 2) {
      setTempPriceRange([values[0], values[1]] as [number, number]);
    }
  };

  // Popover states
  const [priceOpen, setPriceOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const categories = categoriesData?.categories ?? [];
  const selectedCategoryData = categories.find((c: any) => c.slug === category);

  // // Fetch products with filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "products",
      category,
      subcategory,
      searchQuery,
      selectedBrands,
      priceRange,
      sortBy,
      searchParams.toString(), // Add searchParams to trigger query when URL changes
    ],
    queryFn: () =>
      productApi.list({
        category: category !== "all" ? category : undefined,
        subcategory: subcategory || undefined,
        search: searchQuery || undefined,
        brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort: sortBy,
        limit: 100, // Increase limit to show more products
      }),
  });



  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const availableBrands = data?.filters?.brands ?? [];
  const minProductPrice = data?.filters?.minPrice ?? 0;
  const maxProductPrice = data?.filters?.maxPrice ?? 500000;

  useEffect(() => {
    if (minProductPrice !== undefined && maxProductPrice !== undefined) {
      setPriceRange([minProductPrice, maxProductPrice]);
      setTempPriceRange([minProductPrice, maxProductPrice]);
    }
  }, [minProductPrice, maxProductPrice]);

  // Only update URL params when state changes programmatically (not from URL)
  useEffect(() => {
    // Skip if navigation was from MegaMenu
    if (isNavigatingFromMenu.current) return;
    
    const params: any = {};
    if (category !== "all") params.category = category;
    if (subcategory) params.subcategory = subcategory;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  }, [category, subcategory, searchQuery, setSearchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (
    newCategory: string,
    newSubcategory?: string,
  ) => {
    setCategory(newCategory);
    setSubcategory(newSubcategory || "");
    setSelectedBrands([]);
    setCategoryOpen(false);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const handlePriceApply = () => {
    setPriceRange(tempPriceRange);
    setPriceOpen(false);
  };
  const handlePriceReset = () => {
    setTempPriceRange([minProductPrice, maxProductPrice]);
    setPriceRange([minProductPrice, maxProductPrice]);
  };

  const clearAllFilters = () => {
    setCategory("all");
    setSubcategory("");
    setSelectedBrands([]);
    setPriceRange([minProductPrice, maxProductPrice]);
    setTempPriceRange([minProductPrice, maxProductPrice]);
  };

  const activeFiltersCount =
    (category !== "all" ? 1 : 0) +
    (subcategory ? 1 : 0) +
    selectedBrands.length +
    (priceRange[0] !== minProductPrice || priceRange[1] !== maxProductPrice
      ? 1
      : 0);

  const isPriceFiltered =
    priceRange[0] !== minProductPrice || priceRange[1] !== maxProductPrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {subcategory
              ? selectedCategoryData?.subcategories.find(
                  (s: any) => s.slug === subcategory,
                )?.name
              : category !== "all"
                ? selectedCategoryData?.name
                : "All Products"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : `Showing ${products.length} products`}
          </p>
        </div>

        {/* Horizontal Filter Bar */}
        <div className="mb-6 bg-background border rounded-lg p-4 sticky top-16 z-40 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Filter Label */}
            <div className="flex items-center gap-2 font-semibold text-lg">
              <FilterIcon className="h-5 w-5" />
              Filter:
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Price Filter */}
              <Popover open={priceOpen} onOpenChange={setPriceOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`gap-2 ${isPriceFiltered ? "border-primary text-primary" : ""}`}
                  >
                    Price
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Price Range</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePriceReset}
                        className="text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <Slider
                        value={tempPriceRange}
                        onValueChange={handleSliderChange}
                        min={minProductPrice}
                        max={maxProductPrice}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Rs. {tempPriceRange[0].toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">to</span>
                        <span className="font-medium">
                          Rs. {tempPriceRange[1].toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button onClick={handlePriceApply} className="w-full">
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Brands Filter */}
              {availableBrands.length > 0 && (
                <Popover open={brandsOpen} onOpenChange={setBrandsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`gap-2 ${selectedBrands.length > 0 ? "border-primary text-primary" : ""}`}
                    >
                      Brands
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          {selectedBrands.length} selected
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBrands([])}
                          className="text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                      <Separator />
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {availableBrands.map((brand: string) => (
                          <div
                            key={brand}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`brand-${brand}`}
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={() => handleBrandToggle(brand)}
                            />
                            <Label
                              htmlFor={`brand-${brand}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {brand}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Category Filter */}
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`gap-2 ${category !== "all" || subcategory ? "border-primary text-primary" : ""}`}
                  >
                    Category
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {(category !== "all" ? 1 : 0) + (subcategory ? 1 : 0)}{" "}
                        selected
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryChange("all")}
                        className="text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {categories.map((cat: any) => (
                        <div key={cat.id} className="space-y-1">
                          <div
                            className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-muted ${
                              category === cat.slug && !subcategory
                                ? "bg-primary/10"
                                : ""
                            }`}
                            onClick={() => handleCategoryChange(cat.slug)}
                          >
                            <span className="text-sm font-medium">
                              {cat.name}
                            </span>
                          </div>
                          {cat.subcategories &&
                            cat.subcategories.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {cat.subcategories.map((sub: any) => (
                                  <div
                                    key={sub._id}
                                    className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-muted text-sm ${
                                      subcategory === sub.slug
                                        ? "bg-accent text-accent-foreground"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleCategoryChange(cat.slug, sub.slug)
                                    }
                                  >
                                    {sub.name}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer hover:bg-muted transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Remove All Button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-destructive hover:text-destructive"
              >
                Remove all
              </Button>
            )}
          </div>

          {/* Active Filters as Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {category !== "all" && !subcategory && (
                <Badge className="gap-2 px-3 py-1 bg-primary text-primary-foreground">
                  {selectedCategoryData?.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-primary-foreground/20 rounded-full"
                    onClick={() => handleCategoryChange("all")}
                  />
                </Badge>
              )}
              {subcategory && (
                <Badge className="gap-2 px-3 py-1 bg-primary text-primary-foreground">
                  {
                    selectedCategoryData?.subcategories.find(
                      (s: any) => s.slug === subcategory,
                    )?.name
                  }
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-primary-foreground/20 rounded-full"
                    onClick={() => setSubcategory("")}
                  />
                </Badge>
              )}
              {isPriceFiltered && (
                <Badge className="gap-2 px-3 py-1 bg-primary text-primary-foreground">
                  Rs. {priceRange[0].toLocaleString()} - Rs.{" "}
                  {priceRange[1].toLocaleString()}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-primary-foreground/20 rounded-full"
                    onClick={handlePriceReset}
                  />
                </Badge>
              )}
              {selectedBrands.map((brand) => (
                <Badge
                  key={brand}
                  className="gap-2 px-3 py-1 bg-primary text-primary-foreground"
                >
                  {brand}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-primary-foreground/20 rounded-full"
                    onClick={() => handleBrandToggle(brand)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div>
          {isError && (
            <div className="text-center py-12 text-destructive">
              <p className="text-lg font-semibold mb-2">
                Error loading products
              </p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-96 bg-muted/40 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <FilterIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button onClick={clearAllFilters}>Clear All Filters</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
