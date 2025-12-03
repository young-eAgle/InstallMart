import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

export const getProducts = asyncHandler(async (req, res) => {
  const {
    featured,
    category,
    subcategory,
    search,
    minPrice,
    maxPrice,
    brand,
    sort,
    page = 1,
    limit = 20,
  } = req.query;

  const filters = {};

  if (featured === "true") {
    filters.featured = true;
  }

  if (category && category !== "all") {
    filters.category = category;
    console.log(`🔍 Filtering by category: ${category}`);
  }

  if (subcategory) {
    filters.subcategory = subcategory;
    console.log(`🔍 Filtering by subcategory: ${subcategory}`);
  }

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  if (brand) {
    filters.brand = { $regex: brand, $options: "i" };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  console.log("📦 Applied filters:", JSON.stringify(filters, null, 2));

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === "price-asc") sortOption = { price: 1 };
  if (sort === "price-desc") sortOption = { price: -1 };
  if (sort === "name-asc") sortOption = { name: 1 };
  if (sort === "name-desc") sortOption = { name: -1 };
  if (sort === "rating") sortOption = { rating: -1 };

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filters).sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(filters),
  ]);

  console.log(`✅ Found ${products.length} products (Total: ${total})`);
  // Get unique brands for filters
  const brands = await Product.distinct("brand", filters);

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
    filters: {
      brands: brands.filter(Boolean).sort(),
      minPrice: await Product.findOne(filters)
        .sort({ price: 1 })
        .select("price")
        .lean()
        .then((p) => p?.price || 0),
      maxPrice: await Product.findOne(filters)
        .sort({ price: -1 })
        .select("price")
        .lean()
        .then((p) => p?.price || 0),
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json({ product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    subcategory,
    stock,
    brand,
    tags,
    featured,
    specifications,
  } = req.body;

  let image_url = null;
  let cloudinaryPublicId = null;

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path);
      image_url = result.url;
      cloudinaryPublicId = result.publicId;
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

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    subcategory,
    stock: Number(stock) || 0,
    image_url,
    cloudinaryPublicId,
    brand,
    tags: tags
      ? typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags
      : [],
    featured: featured === "true" || featured === true,
    specifications: specifications ? JSON.parse(specifications) : {},
  });

  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    category,
    subcategory,
    stock,
    brand,
    tags,
    featured,
    specifications,
  } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let image_url = product.image_url;
  let cloudinaryPublicId = product.cloudinaryPublicId;

  if (req.file) {
    try {
      if (product.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(product.cloudinaryPublicId);
        } catch (deleteError) {
          console.error(
            "Failed to delete old image from Cloudinary:",
            deleteError,
          );
        }
      }

      const result = await uploadToCloudinary(req.file.path);
      image_url = result.url;
      cloudinaryPublicId = result.publicId;
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

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price ? Number(price) : product.price;
  product.category = category || product.category;
  product.subcategory =
    subcategory !== undefined ? subcategory : product.subcategory;
  product.stock = stock !== undefined ? Number(stock) : product.stock;
  product.image_url = image_url;
  product.cloudinaryPublicId = cloudinaryPublicId;
  product.brand = brand || product.brand;
  product.tags = tags
    ? typeof tags === "string"
      ? tags.split(",").map((tag) => tag.trim())
      : tags
    : product.tags;
  product.featured =
    featured !== undefined
      ? featured === "true" || featured === true
      : product.featured;
  product.specifications = specifications
    ? JSON.parse(specifications)
    : product.specifications;

  await product.save();

  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log(`🗑️ Attempting to delete product with ID: ${id}`);

  try {
    const product = await Product.findById(id);
    if (!product) {
      console.log(`❌ Product not found: ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(`📦 Deleting product: ${product.name}`);

    // Delete image from Cloudinary if exists
    if (product.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(product.cloudinaryPublicId);
        console.log(`✅ Deleted product image from Cloudinary`);
      } catch (error) {
        console.error("⚠️ Failed to delete image from Cloudinary:", error);
        // Continue with product deletion even if image deletion fails
      }
    }

    await Product.findByIdAndDelete(id);
    console.log(`✅ Product "${product.name}" deleted successfully`);

    res.status(200).json({
      message: "Product deleted successfully",
      productName: product.name,
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    throw error; // asyncHandler will catch this
  }
});

// export const deleteProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) {
//     return res.status(404).json({ message: "Product not found" });
//   }

//   if (product.cloudinaryPublicId) {
//     try {
//       await deleteFromCloudinary(product.cloudinaryPublicId);
//     } catch (error) {
//       console.error("Failed to delete image from Cloudinary:", error);
//     }
//   }

//   await Product.findByIdAndDelete(req.params.id);

//   res.status(204).end();
// });
