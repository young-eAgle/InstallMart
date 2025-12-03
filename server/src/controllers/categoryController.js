import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

// Get all categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({
    order: 1,
    name: 1,
  });
  res.json({ categories });
});

// Get single category
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json({ category });
});

// Create category (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, color, description, subcategories, order } = req.body;

  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    return res
      .status(400)
      .json({ message: "Category with this slug already exists" });
  }

  let icon = null;
  let iconPublicId = null;

  // Upload image to Cloudinary if file was uploaded
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path);
      icon = result.url;
      iconPublicId = result.publicId;
      await unlinkAsync(req.file.path);
    } catch (error) {
      if (req.file && req.file.path) {
        try {
          await unlinkAsync(req.file.path);
        } catch (unlinkError) {
          console.error("Failed to delete local file:", unlinkError);
        }
      }
      return res
        .status(500)
        .json({ message: `Image upload failed: ${error.message}` });
    }
  }

  const category = await Category.create({
    name,
    slug,
    icon,
    iconPublicId,
    color,
    description,
    subcategories: subcategories || [],
    order: order || 0,
  });

  res.status(201).json({ category });
});

// Update category (Admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, color, description, subcategories, isActive, order } =
    req.body;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Check if slug is being changed and if it conflicts
  if (slug && slug !== category.slug) {
    const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this slug already exists" });
    }
  }

  let icon = category.icon;
  let iconPublicId = category.iconPublicId;

  // Upload new image to Cloudinary if file was uploaded
  if (req.file) {
    try {
      // Delete old image from Cloudinary if exists
      if (category.iconPublicId) {
        try {
          await deleteFromCloudinary(category.iconPublicId);
        } catch (deleteError) {
          console.error(
            "Failed to delete old image from Cloudinary:",
            deleteError,
          );
        }
      }

      // Upload new image
      const result = await uploadToCloudinary(req.file.path);
      icon = result.url;
      iconPublicId = result.publicId;
      await unlinkAsync(req.file.path);
    } catch (error) {
      if (req.file && req.file.path) {
        try {
          await unlinkAsync(req.file.path);
        } catch (unlinkError) {
          console.error("Failed to delete local file:", unlinkError);
        }
      }
      return res
        .status(500)
        .json({ message: `Image upload failed: ${error.message}` });
    }
  }

  category.name = name || category.name;
  category.slug = slug || category.slug;
  category.icon = icon;
  category.iconPublicId = iconPublicId;
  category.color = color || category.color;
  category.description =
    description !== undefined ? description : category.description;
  category.subcategories =
    subcategories !== undefined ? subcategories : category.subcategories;
  category.isActive = isActive !== undefined ? isActive : category.isActive;
  category.order = order !== undefined ? order : category.order;

  await category.save();

  res.json({ category });
});

// Delete category (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log(`🗑️ Attempting to delete category with ID: ${id}`);

  try {
    const category = await Category.findById(id);
    if (!category) {
      console.log(`❌ Category not found: ${id}`);
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if there are products using this category
    const { Product } = await import("../models/Product.js");
    const productsCount = await Product.countDocuments({
      category: category.slug,
    });

    if (productsCount > 0) {
      console.log(
        `⚠️ Cannot delete category "${category.name}": ${productsCount} products are using it`,
      );
      return res.status(400).json({
        message: `Cannot delete category. ${productsCount} product(s) are still using this category. Please reassign or delete those products first.`,
        productsCount,
      });
    }

    // Delete image from Cloudinary if exists
    if (category.iconPublicId) {
      try {
        await deleteFromCloudinary(category.iconPublicId);
        console.log(`✅ Deleted category icon from Cloudinary`);
      } catch (error) {
        console.error("⚠️ Failed to delete image from Cloudinary:", error);
        // Continue with category deletion even if image deletion fails
      }
    }

    await Category.findByIdAndDelete(id);
    console.log(`✅ Category "${category.name}" deleted successfully`);

    res.status(200).json({
      message: "Category deleted successfully",
      categoryName: category.name,
    });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    throw error; // asyncHandler will catch this
  }
});

// // Delete category (Admin)
// export const deleteCategory = asyncHandler(async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) {
//     return res.status(404).json({ message: "Category not found" });
//   }

//   // Delete image from Cloudinary if exists
//   if (category.iconPublicId) {
//     try {
//       await deleteFromCloudinary(category.iconPublicId);
//     } catch (error) {
//       console.error("Failed to delete image from Cloudinary:", error);
//     }
//   }

//   await Category.findByIdAndDelete(req.params.id);
//   res.status(204).end();
// });

// Add subcategory to category (Admin)
export const addSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, icon, description } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Check if subcategory slug already exists
  const exists = category.subcategories.some((sub) => sub.slug === slug);
  if (exists) {
    return res
      .status(400)
      .json({ message: "Subcategory with this slug already exists" });
  }

  category.subcategories.push({ name, slug, icon, description });
  await category.save();

  res.json({ category });
});

// Update subcategory (Admin)
export const updateSubcategory = asyncHandler(async (req, res) => {
  const { id, subcategoryId } = req.params;
  const { name, slug, icon, description } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const subcategoryIndex = category.subcategories.findIndex(
    (sub) => sub._id.toString() === subcategoryId,
  );

  if (subcategoryIndex === -1) {
    return res.status(404).json({ message: "Subcategory not found" });
  }

  // Check if slug is being changed and if it conflicts
  if (slug && slug !== category.subcategories[subcategoryIndex].slug) {
    const exists = category.subcategories.some(
      (sub, idx) => sub.slug === slug && idx !== subcategoryIndex,
    );
    if (exists) {
      return res
        .status(400)
        .json({ message: "Subcategory with this slug already exists" });
    }
  }

  // Update subcategory
  category.subcategories[subcategoryIndex].name =
    name || category.subcategories[subcategoryIndex].name;
  category.subcategories[subcategoryIndex].slug =
    slug || category.subcategories[subcategoryIndex].slug;
  category.subcategories[subcategoryIndex].icon =
    icon !== undefined ? icon : category.subcategories[subcategoryIndex].icon;
  category.subcategories[subcategoryIndex].description =
    description !== undefined
      ? description
      : category.subcategories[subcategoryIndex].description;

  await category.save();

  res.json({ category });
});

// Remove subcategory from category (Admin)
export const removeSubcategory = asyncHandler(async (req, res) => {
  const { id, subcategoryId } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.subcategories = category.subcategories.filter(
    (sub) => sub._id.toString() !== subcategoryId,
  );

  await category.save();

  res.json({ category });
});

// import { Category } from "../models/Category.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// // Get all categories
// export const getCategories = asyncHandler(async (req, res) => {
//   const categories = await Category.find({ isActive: true }).sort({
//     order: 1,
//     name: 1,
//   });
//   res.json({ categories });
// });

// // Get single category
// export const getCategory = asyncHandler(async (req, res) => {
//   const category = await Category.findOne({ slug: req.params.slug });
//   if (!category) {
//     return res.status(404).json({ message: "Category not found" });
//   }
//   res.json({ category });
// });

// // Create category (Admin)
// export const createCategory = asyncHandler(async (req, res) => {
//   const { name, slug, icon, color, description, subcategories, order } =
//     req.body;

//   const existingCategory = await Category.findOne({ slug });
//   if (existingCategory) {
//     return res
//       .status(400)
//       .json({ message: "Category with this slug already exists" });
//   }

//   const category = await Category.create({
//     name,
//     slug,
//     icon,
//     color,
//     description,
//     subcategories: subcategories || [],
//     order: order || 0,
//   });

//   res.status(201).json({ category });
// });

// // Update category (Admin)
// export const updateCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     slug,
//     icon,
//     color,
//     description,
//     subcategories,
//     isActive,
//     order,
//   } = req.body;

//   const category = await Category.findById(id);
//   if (!category) {
//     return res.status(404).json({ message: "Category not found" });
//   }

//   // Check if slug is being changed and if it conflicts
//   if (slug && slug !== category.slug) {
//     const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
//     if (existingCategory) {
//       return res
//         .status(400)
//         .json({ message: "Category with this slug already exists" });
//     }
//   }

//   category.name = name || category.name;
//   category.slug = slug || category.slug;
//   category.icon = icon !== undefined ? icon : category.icon;
//   category.color = color || category.color;
//   category.description =
//     description !== undefined ? description : category.description;
//   category.subcategories =
//     subcategories !== undefined ? subcategories : category.subcategories;
//   category.isActive = isActive !== undefined ? isActive : category.isActive;
//   category.order = order !== undefined ? order : category.order;

//   await category.save();

//   res.json({ category });
// });

// // Delete category (Admin)
// export const deleteCategory = asyncHandler(async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) {
//     return res.status(404).json({ message: "Category not found" });
//   }

//   await Category.findByIdAndDelete(req.params.id);
//   res.status(204).end();
// });

// // Add subcategory to category (Admin)
// export const addSubcategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { name, slug, icon, description } = req.body;

//   const category = await Category.findById(id);
//   if (!category) {
//     return res.status(404).json({ message: "Category not found" });
//   }

//   // Check if subcategory slug already exists
//   const exists = category.subcategories.some((sub) => sub.slug === slug);
//   if (exists) {
//     return res
//       .status(400)
//       .json({ message: "Subcategory with this slug already exists" });
//   }

//   category.subcategories.push({ name, slug, icon, description });
//   await category.save();

//   res.json({ category });
// });

// // Remove subcategory from category (Admin)
// export const removeSubcategory = asyncHandler(async (req, res) => {
//   const { id, subcategoryId } = req.params;

//   const category = await Category.findById(id);
//   if (!category) {
//     return res.status(404).json({ message: "Category not found" });
//   }

//   category.subcategories = category.subcategories.filter(
//     (sub) => sub._id.toString() !== subcategoryId,
//   );

//   await category.save();

//   res.json({ category });
// });
