import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // One wishlist per user
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ]
  },
  { timestamps: true }
);

// Index for faster queries
wishlistSchema.index({ user: 1 });

// Virtual for product count
wishlistSchema.virtual("productCount").get(function () {
  return this.products.length;
});

wishlistSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
}); //  <-- this was missing

export default mongoose.model("Wishlist", wishlistSchema);




// import mongoose from "mongoose";

// const wishlistSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true // One wishlist per user
//     },
//     products: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product"
//     }]
//   },
//   { timestamps: true }
// );

// // Index for faster queries
// wishlistSchema.index({ user: 1 });

// // Virtual for product count
// wishlistSchema.virtual('productCount').get(function() {
//   return this.products.length;
// });

// wishlistSchema.set("toJSON", {
//   virtuals: true,
//   transform: (_, ret) => {
//     ret.id = ret._id.toString();
//     delete ret._id;
//     delete ret.__v;
//     return ret;
