import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    subcategory: { type: String }, // Add this if missing
    brand: { type: String },
    stock: { type: Number, default: 0 },
    image_url: { type: String },
    cloudinaryPublicId: { type: String },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    specifications: { type: Map, of: String },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);


// Index for better search performance
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });

productSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.model("Product", productSchema);

// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     description: { type: String },
//     price: { type: Number, required: true },
//     category: { type: String, required: true },
//     stock: { type: Number, default: 0 },
//     image_url: { type: String },
//     cloudinaryPublicId: { type: String }, // NEW FIELD for Cloudinary
//     brand: { type: String },
//     tags: [{ type: String }],
//     featured: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//   },
// );

// productSchema.set("toJSON", {
//   virtuals: true,
//   transform: (_, ret) => {
//     ret.id = ret._id.toString();
//     delete ret._id;
//     delete ret.__v;
//     return ret;
//   },
// });

// export const Product = mongoose.model("Product", productSchema);
