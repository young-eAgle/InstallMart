import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { adminApi, productApi, categoryApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { Edit, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/types";

interface ProductFormState extends Partial<Product> {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string | null;
  image_url?: string | null;
  featured?: boolean;
  tags?: string[];
  specifications?: Record<string, string>;
}

export const AdminProducts = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);

  const enabled = Boolean(token);

  const { data: productsData } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => productApi.list(),
    enabled,
  });

  // Fetch categories for product form
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
    enabled,
  });

  const categories = categoriesData?.categories ?? [];
  const products = productsData?.products ?? [];

  // Update subcategories when category changes
  const handleCategoryChange = (value: string) => {
    setProductForm((prev) => ({
      ...prev,
      category: value,
      subcategory: "", // Reset subcategory when category changes
    }));
    setSelectedCategory(value);

    const category = categories.find((cat: any) => cat.slug === value);
    setAvailableSubcategories(category?.subcategories || []);
  };

  // Set initial category when editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      description: product.description,
      featured: product.featured,
      tags: product.tags,
      specifications: product.specifications,
    });
    setSelectedCategory(product.category || "");
    
    // Set available subcategories for the selected category
    const category = categories.find((cat: any) => cat.slug === product.category);
    setAvailableSubcategories(category?.subcategories || []);
    setProductDialogOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", productForm.name || "");
    formData.append("price", String(productForm.price || 0));
    formData.append("stock", String(productForm.stock || 0));
    formData.append("category", productForm.category || "");
    if (productForm.subcategory) {
      formData.append("subcategory", productForm.subcategory);
    }
    if (productForm.brand) {
      formData.append("brand", productForm.brand);
    }
    if (productForm.description) {
      formData.append("description", productForm.description);
    }
    formData.append("featured", String(productForm.featured || false));

    if (productForm.tags && productForm.tags.length > 0) {
      formData.append("tags", productForm.tags.join(","));
    }

    if (productForm.specifications) {
      formData.append(
        "specifications",
        JSON.stringify(productForm.specifications),
      );
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, formData, token!);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await adminApi.createProduct(formData, token!);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({});
      setSelectedImage(null);
      setSelectedCategory("");
      setAvailableSubcategories([]);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const result = await adminApi.deleteProduct(id, token);
      toast({
        title: "Success",
        description: result?.message || "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (error: any) {
      console.error("Delete product error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Add, edit, or remove items</CardDescription>
        </div>

        <Dialog
          open={productDialogOpen}
          onOpenChange={(open) => {
            setProductDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              setProductForm({});
              setSelectedImage(null);
              setSelectedCategory("");
              setAvailableSubcategories([]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update product information and inventory"
                  : "Add a new product to your catalog with detailed information"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Product Image
                </Label>
                <ImageUpload
                  currentImage={editingProduct?.image_url}
                  onImageSelect={setSelectedImage}
                />
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Basic Information
                </h3>
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., iPhone 15 Pro Max"
                    value={productForm.name ?? ""}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the product"
                    value={productForm.description ?? ""}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Apple, Samsung, Sony"
                    value={productForm.brand ?? ""}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Category & Classification
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={productForm.category ?? ""}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No categories available
                          </SelectItem>
                        ) : (
                          categories.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.slug}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Subcategory</Label>
                    <Select
                      value={productForm.subcategory ?? ""}
                      onValueChange={(value) =>
                        setProductForm((prev) => ({
                          ...prev,
                          subcategory: value,
                        }))
                      }
                      disabled={
                        !selectedCategory ||
                        availableSubcategories.length === 0
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.length === 0 ? (
                          <SelectItem value="none" disabled>
                            {selectedCategory
                              ? "No subcategories"
                              : "Select category first"}
                          </SelectItem>
                        ) : (
                          availableSubcategories.map(
                            (subcategory: any) => (
                              <SelectItem
                                key={subcategory._id}
                                value={subcategory.slug}
                              >
                                {subcategory.name}
                              </SelectItem>
                            ),
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {!selectedCategory
                        ? "Select a category first"
                        : availableSubcategories.length === 0
                          ? "No subcategories available for this category"
                          : "Optional: Narrow down the category"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Pricing & Inventory
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (Rs.) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={productForm.price ?? ""}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: Number(e.target.value),
                        }))
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      min="0"
                      value={productForm.stock ?? ""}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          stock: Number(e.target.value),
                        }))
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Product Toggle */}
              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="featured"
                  checked={productForm.featured ?? false}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
                <div>
                  <Label
                    htmlFor="featured"
                    className="cursor-pointer font-semibold"
                  >
                    Featured Product
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display this product prominently on the homepage
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setProductDialogOpen(false);
                    setEditingProduct(null);
                    setProductForm({});
                    setSelectedImage(null);
                    setSelectedCategory("");
                    setAvailableSubcategories([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products yet.
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Rs. {product.price.toLocaleString()} · Stock{" "}
                  {product.stock} · {product.category}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};