import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  icon: { type: String },
  description: { type: String },
});

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String }, // This will store image URL
    iconPublicId: { type: String }, // Cloudinary public ID for deletion
    color: { type: String },
    description: { type: String },
    subcategories: [subcategorySchema],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Category = mongoose.model("Category", categorySchema);







// import mongoose from "mongoose";

// const subcategorySchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   slug: { type: String, required: true },
//   icon: { type: String },
//   description: { type: String },
// });

// const categorySchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     slug: { type: String, required: true, unique: true },
//     icon: { type: String },
//     color: { type: String },
//     description: { type: String },
//     subcategories: [subcategorySchema],
//     isActive: { type: Boolean, default: true },
//     order: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// );

// categorySchema.set("toJSON", {
//   virtuals: true,
//   transform: (_, ret) => {
//     ret.id = ret._id.toString();
//     delete ret._id;
//     delete ret.__v;
//     return ret;
//   },
// });

// export const Category = mongoose.model("Category", categorySchema);
