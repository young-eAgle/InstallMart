import { useState } from "react";
// import { useQuery, useQueryClient } from "@tantml:react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { categoryApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  FolderPlus,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CategoryManagement = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [selectedCategoryForSub, setSelectedCategoryForSub] =
    useState<any>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<
    string | null
  >(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#667eea",
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const categories = data?.categories ?? [];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCategoryImage(null);
    setCategoryImagePreview(null);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await categoryApi.update(
          editingCategory.id,
          categoryForm,
          categoryImage,
          token!,
        );
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await categoryApi.create(categoryForm, categoryImage, token!);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        slug: "",
        description: "",
        color: "#667eea",
      });
      setCategoryImage(null);
      setCategoryImagePreview(null);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSubcategory) {
        await categoryApi.updateSubcategory(
          selectedCategoryForSub.id,
          editingSubcategory._id,
          subcategoryForm,
          token!,
        );
        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        });
      } else {
        await categoryApi.addSubcategory(
          selectedCategoryForSub.id,
          subcategoryForm,
          token!,
        );
        toast({
          title: "Success",
          description: "Subcategory added successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setSubcategoryDialogOpen(false);
      setSelectedCategoryForSub(null);
      setEditingSubcategory(null);
      setSubcategoryForm({
        name: "",
        slug: "",
        description: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const result = await categoryApi.delete(id, token!);
      toast({
        title: "Success",
        description: result?.message || "Category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      console.error("Delete category error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // const handleDeleteCategory = async (id: string) => {
  //   try {
  //     await categoryApi.delete(id, token!);
  //     toast({
  //       title: "Success",
  //       description: "Category deleted successfully",
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["categories"] });
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: (error as Error).message,
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleDeleteSubcategory = async (
    categoryId: string,
    subcategoryId: string,
  ) => {
    try {
      await categoryApi.deleteSubcategory(categoryId, subcategoryId, token!);
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      color: category.color || "#667eea",
    });
    setCategoryImagePreview(category.icon || null);
    setCategoryImage(null);
    setCategoryDialogOpen(true);
  };

  const openAddSubcategoryDialog = (category: any) => {
    setSelectedCategoryForSub(category);
    setEditingSubcategory(null);
    setSubcategoryForm({
      name: "",
      slug: "",
      description: "",
    });
    setSubcategoryDialogOpen(true);
  };

  const openEditSubcategoryDialog = (category: any, subcategory: any) => {
    setSelectedCategoryForSub(category);
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || "",
    });
    setSubcategoryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({
                  name: "",
                  slug: "",
                  description: "",
                  color: "#667eea",
                });
                setCategoryImage(null);
                setCategoryImagePreview(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update category information and icon"
                  : "Create a new product category with an icon image"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Category Icon (Image)</Label>
                {categoryImagePreview ? (
                  <div className="relative w-full h-48 border-2 border-dashed border-muted rounded-lg overflow-hidden">
                    <img
                      src={categoryImagePreview}
                      alt="Category icon preview"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() =>
                      document.getElementById("category-icon-input")?.click()
                    }
                  >
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload category icon
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <input
                  id="category-icon-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCategoryForm({ ...categoryForm, name: newName });
                    if (!editingCategory) {
                      setCategoryForm({
                        ...categoryForm,
                        name: newName,
                        slug: newName.toLowerCase().replace(/\s+/g, "-"),
                      });
                    }
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, slug: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="color">Brand Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="color"
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        color: e.target.value,
                      })
                    }
                    className="w-20 h-10"
                  />
                  <span className="text-sm text-muted-foreground">
                    {categoryForm.color}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCategoryDialogOpen(false);
                    setEditingCategory(null);
                    setCategoryImage(null);
                    setCategoryImagePreview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subcategory Dialog */}
      <Dialog
        open={subcategoryDialogOpen}
        onOpenChange={setSubcategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory
                ? "Edit Subcategory"
                : `Add Subcategory to ${selectedCategoryForSub?.name}`}
            </DialogTitle>
            <DialogDescription>
              {editingSubcategory
                ? "Update subcategory information"
                : "Create a new subcategory under this category"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubcategorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="sub-name">Subcategory Name</Label>
              <Input
                id="sub-name"
                value={subcategoryForm.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setSubcategoryForm({
                    ...subcategoryForm,
                    name: newName,
                  });
                  if (!editingSubcategory) {
                    setSubcategoryForm({
                      ...subcategoryForm,
                      name: newName,
                      slug: newName.toLowerCase().replace(/\s+/g, "-"),
                    });
                  }
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="sub-slug">Slug</Label>
              <Input
                id="sub-slug"
                value={subcategoryForm.slug}
                onChange={(e) =>
                  setSubcategoryForm({
                    ...subcategoryForm,
                    slug: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="sub-description">Description</Label>
              <Textarea
                id="sub-description"
                value={subcategoryForm.description}
                onChange={(e) =>
                  setSubcategoryForm({
                    ...subcategoryForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingSubcategory ? "Update Subcategory" : "Add Subcategory"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSubcategoryDialogOpen(false);
                  setSelectedCategoryForSub(null);
                  setEditingSubcategory(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Categories List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-muted/40 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category: any) => (
            <Card key={category.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {category.icon ? (
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden border-2"
                        style={{ borderColor: category.color }}
                      >
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <span style={{ color: category.color }}>📦</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        {category.name}
                        <Badge variant="outline">
                          {category.subcategories?.length || 0} subs
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-normal">
                        {category.slug}
                      </p>
                    </div>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddSubcategoryDialog(category)}
                    >
                      <FolderPlus className="h-4 w-4 mr-1" />
                      Add Sub
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{category.name}" and
                            all its subcategories. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {category.subcategories && category.subcategories.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub: any) => (
                      <div key={sub._id} className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() =>
                            openEditSubcategoryDialog(category, sub)
                          }
                        >
                          {sub.name}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Subcategory?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{sub.name}". This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteSubcategory(category.id, sub._id)
                                }
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// import { useState } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { categoryApi } from "@/lib/api";
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Plus, Edit, Trash2, FolderPlus } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// export const CategoryManagement = () => {
//   const { token } = useAuth();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
//   const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<any>(null);
//   const [selectedCategoryForSub, setSelectedCategoryForSub] =
//     useState<any>(null);

//   const [categoryForm, setCategoryForm] = useState({
//     name: "",
//     slug: "",
//     description: "",
//     icon: "",
//     color: "#667eea",
//   });

//   const [subcategoryForm, setSubcategoryForm] = useState({
//     name: "",
//     slug: "",
//     description: "",
//   });

//   const { data, isLoading } = useQuery({
//     queryKey: ["categories"],
//     queryFn: () => categoryApi.list(),
//   });

//   const categories = data?.categories ?? [];

//   const handleCategorySubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       if (editingCategory) {
//         await categoryApi.update(editingCategory.id, categoryForm, token!);
//         toast({
//           title: "Success",
//           description: "Category updated successfully",
//         });
//       } else {
//         await categoryApi.create(categoryForm, token!);
//         toast({
//           title: "Success",
//           description: "Category created successfully",
//         });
//       }

//       queryClient.invalidateQueries({ queryKey: ["categories"] });
//       setCategoryDialogOpen(false);
//       setEditingCategory(null);
//       setCategoryForm({
//         name: "",
//         slug: "",
//         description: "",
//         icon: "",
//         color: "#667eea",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: (error as Error).message,
//         variant: "destructive",
//       });
//     }
//   };

//   const handleSubcategorySubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await categoryApi.addSubcategory(
//         selectedCategoryForSub.id,
//         subcategoryForm,
//         token!,
//       );

//       toast({
//         title: "Success",
//         description: "Subcategory added successfully",
//       });

//       queryClient.invalidateQueries({ queryKey: ["categories"] });
//       setSubcategoryDialogOpen(false);
//       setSelectedCategoryForSub(null);
//       setSubcategoryForm({
//         name: "",
//         slug: "",
//         description: "",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: (error as Error).message,
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDeleteCategory = async (id: string) => {
//     try {
//       await categoryApi.delete(id, token!);
//       toast({
//         title: "Success",
//         description: "Category deleted successfully",
//       });
//       queryClient.invalidateQueries({ queryKey: ["categories"] });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: (error as Error).message,
//         variant: "destructive",
//       });
//     }
//   };

//   const openEditDialog = (category: any) => {
//     setEditingCategory(category);
//     setCategoryForm({
//       name: category.name,
//       slug: category.slug,
//       description: category.description || "",
//       icon: category.icon || "",
//       color: category.color || "#667eea",
//     });
//     setCategoryDialogOpen(true);
//   };

//   const openAddSubcategoryDialog = (category: any) => {
//     setSelectedCategoryForSub(category);
//     setSubcategoryDialogOpen(true);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">Category Management</h2>
//         <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
//           <DialogTrigger asChild>
//             <Button
//               onClick={() => {
//                 setEditingCategory(null);
//                 setCategoryForm({
//                   name: "",
//                   slug: "",
//                   description: "",
//                   icon: "",
//                   color: "#667eea",
//                 });
//               }}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Add Category
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>
//                 {editingCategory ? "Edit Category" : "Add New Category"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editingCategory
//                   ? "Update category information"
//                   : "Create a new product category"}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleCategorySubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="name">Category Name</Label>
//                 <Input
//                   id="name"
//                   value={categoryForm.name}
//                   onChange={(e) => {
//                     setCategoryForm({ ...categoryForm, name: e.target.value });
//                     if (!editingCategory) {
//                       setCategoryForm({
//                         ...categoryForm,
//                         name: e.target.value,
//                         slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
//                       });
//                     }
//                   }}
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="slug">Slug</Label>
//                 <Input
//                   id="slug"
//                   value={categoryForm.slug}
//                   onChange={(e) =>
//                     setCategoryForm({ ...categoryForm, slug: e.target.value })
//                   }
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={categoryForm.description}
//                   onChange={(e) =>
//                     setCategoryForm({
//                       ...categoryForm,
//                       description: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="icon">Icon (Lucide name)</Label>
//                   <Input
//                     id="icon"
//                     value={categoryForm.icon}
//                     onChange={(e) =>
//                       setCategoryForm({ ...categoryForm, icon: e.target.value })
//                     }
//                     placeholder="e.g., Smartphone"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="color">Color</Label>
//                   <Input
//                     id="color"
//                     type="color"
//                     value={categoryForm.color}
//                     onChange={(e) =>
//                       setCategoryForm({
//                         ...categoryForm,
//                         color: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <Button type="submit" className="flex-1">
//                   {editingCategory ? "Update Category" : "Create Category"}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     setCategoryDialogOpen(false);
//                     setEditingCategory(null);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Subcategory Dialog */}
//       <Dialog
//         open={subcategoryDialogOpen}
//         onOpenChange={setSubcategoryDialogOpen}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               Add Subcategory to {selectedCategoryForSub?.name}
//             </DialogTitle>
//             <DialogDescription>
//               Create a new subcategory under this category
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubcategorySubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="sub-name">Subcategory Name</Label>
//               <Input
//                 id="sub-name"
//                 value={subcategoryForm.name}
//                 onChange={(e) => {
//                   setSubcategoryForm({
//                     ...subcategoryForm,
//                     name: e.target.value,
//                   });
//                   setSubcategoryForm({
//                     ...subcategoryForm,
//                     name: e.target.value,
//                     slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
//                   });
//                 }}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="sub-slug">Slug</Label>
//               <Input
//                 id="sub-slug"
//                 value={subcategoryForm.slug}
//                 onChange={(e) =>
//                   setSubcategoryForm({
//                     ...subcategoryForm,
//                     slug: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="sub-description">Description</Label>
//               <Textarea
//                 id="sub-description"
//                 value={subcategoryForm.description}
//                 onChange={(e) =>
//                   setSubcategoryForm({
//                     ...subcategoryForm,
//                     description: e.target.value,
//                   })
//                 }
//               />
//             </div>
//             <div className="flex gap-2">
//               <Button type="submit" className="flex-1">
//                 Add Subcategory
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setSubcategoryDialogOpen(false);
//                   setSelectedCategoryForSub(null);
//                 }}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Categories List */}
//       {isLoading ? (
//         <div className="space-y-4">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div
//               key={i}
//               className="h-32 bg-muted/40 animate-pulse rounded-lg"
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {categories.map((category: any) => (
//             <Card key={category.id}>
//               <CardHeader className="pb-4">
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="flex items-center gap-3">
//                     <div
//                       className="w-10 h-10 rounded-lg flex items-center justify-center"
//                       style={{ backgroundColor: `${category.color}20` }}
//                     >
//                       <span style={{ color: category.color }}>📦</span>
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-2">
//                         {category.name}
//                         <Badge variant="outline">
//                           {category.subcategories.length} subs
//                         </Badge>
//                       </div>
//                       <p className="text-sm text-muted-foreground font-normal">
//                         {category.slug}
//                       </p>
//                     </div>
//                   </CardTitle>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => openAddSubcategoryDialog(category)}
//                     >
//                       <FolderPlus className="h-4 w-4 mr-1" />
//                       Add Sub
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => openEditDialog(category)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <AlertDialog>
//                       <AlertDialogTrigger asChild>
//                         <Button variant="destructive" size="sm">
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </AlertDialogTrigger>
//                       <AlertDialogContent>
//                         <AlertDialogHeader>
//                           <AlertDialogTitle>Delete Category?</AlertDialogTitle>
//                           <AlertDialogDescription>
//                             This will permanently delete "{category.name}" and
//                             all its subcategories. This action cannot be undone.
//                           </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                           <AlertDialogCancel>Cancel</AlertDialogCancel>
//                           <AlertDialogAction
//                             onClick={() => handleDeleteCategory(category.id)}
//                             className="bg-destructive hover:bg-destructive/90"
//                           >
//                             Delete
//                           </AlertDialogAction>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   </div>
//                 </div>
//               </CardHeader>
//               {category.subcategories.length > 0 && (
//                 <CardContent>
//                   <div className="flex flex-wrap gap-2">
//                     {category.subcategories.map((sub: any) => (
//                       <Badge key={sub._id} variant="secondary">
//                         {sub.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 </CardContent>
//               )}
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };
