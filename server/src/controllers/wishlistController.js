import Wishlist from "../models/Wishlist.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get user's wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  console.log("📋 Fetching wishlist for user:", req.user.id);

  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
    "products",
  );

  if (!wishlist) {
    console.log("✅ No wishlist found, returning empty");
    return res.json({ wishlist: { products: [], productCount: 0 } });
  }

  // Convert to JSON to apply Product model's toJSON transforms
  const wishlistData = wishlist.toJSON();
  console.log(`✅ Found ${wishlistData.products.length} products in wishlist`);

  res.json({ wishlist: wishlistData });
});

// Add product to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  console.log("➕ Adding product to wishlist:", productId);

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    console.log("❌ Product not found:", productId);
    return res.status(404).json({ message: "Product not found" });
  }

  // Find user's wishlist or create if not exists
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    console.log("📝 Creating new wishlist for user");
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: [productId],
    });
  } else {
    // Check if product is already in wishlist
    const productExists = wishlist.products.some(
      (p) => p.toString() === productId,
    );

    if (productExists) {
      console.log("⚠️ Product already in wishlist");
      return res
        .status(400)
        .json({ message: "Product is already in wishlist" });
    }

    // Add product to wishlist
    wishlist.products.push(productId);
    await wishlist.save();
    console.log("✅ Product added to existing wishlist");
  }

  // Return populated wishlist with proper JSON transform
  wishlist = await Wishlist.findById(wishlist._id).populate("products");
  const wishlistData = wishlist.toJSON();

  res.json({
    wishlist: wishlistData,
    message: "Product added to wishlist",
  });
});

// Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  console.log("🗑️ Removing product from wishlist:", productId);

  // Find user's wishlist
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    console.log("❌ Wishlist not found");
    return res.status(404).json({ message: "Wishlist not found" });
  }

  // Count before removal
  const beforeCount = wishlist.products.length;

  // Remove product from wishlist
  wishlist.products = wishlist.products.filter(
    (product) => product.toString() !== productId,
  );

  const afterCount = wishlist.products.length;

  if (beforeCount === afterCount) {
    console.log("⚠️ Product not found in wishlist");
    return res.status(404).json({ message: "Product not found in wishlist" });
  }

  await wishlist.save();
  console.log(`✅ Product removed. Count: ${beforeCount} → ${afterCount}`);

  // Return populated wishlist with proper JSON transform
  wishlist = await Wishlist.findById(wishlist._id).populate("products");
  const wishlistData = wishlist.toJSON();

  res.json({
    wishlist: wishlistData,
    message: "Product removed from wishlist",
  });
});

// Clear entire wishlist
export const clearWishlist = asyncHandler(async (req, res) => {
  console.log("🗑️ Clearing entire wishlist for user:", req.user.id);

  // Find user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    console.log("❌ Wishlist not found");
    return res.status(404).json({ message: "Wishlist not found" });
  }

  // Clear wishlist products
  wishlist.products = [];
  await wishlist.save();
  console.log("✅ Wishlist cleared");

  res.json({
    wishlist: wishlist.toJSON(),
    message: "Wishlist cleared",
  });
});

// Check if product is in wishlist
export const checkInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });

  const isInWishlist =
    wishlist?.products.some((p) => p.toString() === productId) || false;

  res.json({ isInWishlist });
});

// import Wishlist from "../models/Wishlist.js";
// import { Product } from "../models/Product.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// // Get user's wishlist
// export const getWishlist = asyncHandler(async (req, res) => {
//   let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
//     "products",
//   );

//   if (!wishlist) {
//     wishlist = { products: [], productCount: 0 };
//   } else {
//     // Convert to JSON to apply toJSON transforms
//     wishlist = wishlist.toJSON();
//   }

//   res.json({ wishlist });
// });

// // Get user's wishlist
// // export const getWishlist = asyncHandler(async (req, res) => {
// //   let wishlist = await Wishlist.findOne({ user: req.user._id })
// //     .populate("products")
// //     .lean();

// //   if (!wishlist) {
// //     wishlist = { products: [], productCount: 0 };
// //   }

// //   res.json({ wishlist });
// // });

// // Add product to wishlist
// export const addToWishlist = asyncHandler(async (req, res) => {
//   const { productId } = req.params;

//   // Check if product exists
//   const product = await Product.findById(productId);
//   if (!product) {
//     return res.status(404).json({ message: "Product not found" });
//   }

//   // Find user's wishlist or create if not exists
//   let wishlist = await Wishlist.findOne({ user: req.user.id });

//   if (!wishlist) {
//     wishlist = await Wishlist.create({
//       user: req.user.id,
//       products: [productId],
//     });
//   } else {
//     // Check if product is already in wishlist
//     const productExists = wishlist.products.some(
//       (p) => p.toString() === productId,
//     );

//     if (productExists) {
//       return res
//         .status(400)
//         .json({ message: "Product is already in wishlist" });
//     }

//     // Add product to wishlist
//     wishlist.products.push(productId);
//     await wishlist.save();
//   }
//   // Return populated wishlist
//   wishlist = await Wishlist.findById(wishlist._id).populate("products");

//   res.json({
//     wishlist: wishlist.toJSON(),
//     message: "Product added to wishlist",
//   });
// });

// // Return populated wishlist
// //   wishlist = await Wishlist.findById(wishlist._id).populate("products").lean();

// //   res.json({
// //     wishlist,
// //     message: "Product added to wishlist",
// //   });
// // });

// // Remove product from wishlist
// export const removeFromWishlist = asyncHandler(async (req, res) => {
//   const { productId } = req.params;

//   // Find user's wishlist
//   let wishlist = await Wishlist.findOne({ user: req.user.id });

//   if (!wishlist) {
//     return res.status(404).json({ message: "Wishlist not found" });
//   }

//   // Remove product from wishlist
//   wishlist.products = wishlist.products.filter(
//     (product) => product.toString() !== productId,
//   );

//   await wishlist.save();

//   // Return populated wishlist
//   wishlist = await Wishlist.findById(wishlist._id).populate("products");

//   res.json({
//     wishlist: wishlist.toJSON(),
//     message: "Product removed from wishlist",
//   });
// });

// //   await wishlist.save();

// //   // Return populated wishlist
// //   wishlist = await Wishlist.findById(wishlist._id).populate("products").lean();

// //   res.json({
// //     wishlist,
// //     message: "Product removed from wishlist",
// //   });
// // });

// // Clear entire wishlist
// export const clearWishlist = asyncHandler(async (req, res) => {
//   // Find user's wishlist
//   const wishlist = await Wishlist.findOne({ user: req.user.id });

//   if (!wishlist) {
//     return res.status(404).json({ message: "Wishlist not found" });
//   }

//   // Clear wishlist products
//   wishlist.products = [];
//   await wishlist.save();

//   res.json({
//     wishlist,
//     message: "Wishlist cleared",
//   });
// });

// // Check if product is in wishlist
// export const checkInWishlist = asyncHandler(async (req, res) => {
//   const { productId } = req.params;

//   const wishlist = await Wishlist.findOne({ user: req.user.id });

//   const isInWishlist =
//     wishlist?.products.some((p) => p.toString() === productId) || false;

//   res.json({ isInWishlist });
// });
