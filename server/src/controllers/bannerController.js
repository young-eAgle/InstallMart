import { Banner } from "../models/Banner.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

// Get active banners (Public)
export const getActiveBanners = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const now = new Date();

  const filters = {
    isActive: true,
    $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }],
    $and: [
      {
        $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
      },
    ],
  };

  if (type) {
    filters.type = type;
  }

  const banners = await Banner.find(filters).sort({
    position: 1,
    createdAt: -1,
  });
  console.log(`✅ Found ${banners.length} active banners`);

  res.json({ banners });
});

// Get all banners (Admin)
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ position: 1, createdAt: -1 });
  res.json({ banners });
});

// Get single banner
export const getBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return res.status(404).json({ message: "Banner not found" });
  }
  res.json({ banner });
});

// Create banner (Admin)
export const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    link,
    buttonText,
    type,
    position,
    isActive,
    startDate,
    endDate,
    backgroundColor,
    textColor,
  } = req.body;

  let image_url = null;
  let cloudinaryPublicId = null;

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path);
      image_url = result.url;
      cloudinaryPublicId = result.publicId;
      await unlinkAsync(req.file.path);
      console.log("✅ Banner image uploaded to Cloudinary");
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

  const banner = await Banner.create({
    title,
    subtitle,
    description,
    image_url,
    cloudinaryPublicId,
    link,
    buttonText,
    type,
    position: position || 0,
    isActive: isActive !== undefined ? isActive : true,
    startDate,
    endDate,
    backgroundColor,
    textColor,
  });

  console.log(`✅ Banner created: ${banner.title}`);
  res.status(201).json({ banner });
});

// Update banner (Admin)
export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    subtitle,
    description,
    link,
    buttonText,
    type,
    position,
    isActive,
    startDate,
    endDate,
    backgroundColor,
    textColor,
  } = req.body;

  const banner = await Banner.findById(id);
  if (!banner) {
    return res.status(404).json({ message: "Banner not found" });
  }

  let image_url = banner.image_url;
  let cloudinaryPublicId = banner.cloudinaryPublicId;

  if (req.file) {
    try {
      if (banner.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(banner.cloudinaryPublicId);
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

  banner.title = title || banner.title;
  banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
  banner.description =
    description !== undefined ? description : banner.description;
  banner.image_url = image_url;
  banner.cloudinaryPublicId = cloudinaryPublicId;
  banner.link = link !== undefined ? link : banner.link;
  banner.buttonText = buttonText || banner.buttonText;
  banner.type = type || banner.type;
  banner.position = position !== undefined ? position : banner.position;
  banner.isActive = isActive !== undefined ? isActive : banner.isActive;
  banner.startDate = startDate !== undefined ? startDate : banner.startDate;
  banner.endDate = endDate !== undefined ? endDate : banner.endDate;
  banner.backgroundColor = backgroundColor || banner.backgroundColor;
  banner.textColor = textColor || banner.textColor;

  await banner.save();
  console.log(`✅ Banner updated: ${banner.title}`);

  res.json({ banner });
});

// Delete banner (Admin)
export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Attempting to delete banner with ID: ${id}`);

  try {
    const banner = await Banner.findById(id);
    if (!banner) {
      console.log(`❌ Banner not found: ${id}`);
      return res.status(404).json({ message: "Banner not found" });
    }

    if (banner.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(banner.cloudinaryPublicId);
        console.log(`✅ Deleted banner image from Cloudinary`);
      } catch (error) {
        console.error("⚠️ Failed to delete image from Cloudinary:", error);
      }
    }

    await Banner.findByIdAndDelete(id);
    console.log(`✅ Banner "${banner.title}" deleted successfully`);

    res.status(200).json({
      message: "Banner deleted successfully",
      bannerTitle: banner.title,
    });
  } catch (error) {
    console.error("❌ Error deleting banner:", error);
    throw error;
  }
});
