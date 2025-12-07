import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    description: {
      type: String,
    },
    image_url: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
    },
    link: {
      type: String,
    },
    buttonText: {
      type: String,
      default: "Shop Now",
    },
    type: {
      type: String,
      enum: ["hero", "secondary", "promotional", "splash"],
      default: "secondary",
      description: "Banner type - splash is for fullscreen takeover banners",
    },
    position: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    textColor: {
      type: String,
      default: "#000000",
    },
  },
  { timestamps: true },
);

bannerSchema.index({ isActive: 1, position: 1 });
bannerSchema.index({ type: 1 });

bannerSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Banner = mongoose.model("Banner", bannerSchema);
