import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: { type: String },
    image_url: { type: String },
  },
  { _id: false }
);

const installmentSchema = new mongoose.Schema(
  {
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
    paidAt: { type: Date },
    transactionId: { type: String },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    installmentMonths: { type: Number, default: 6 },
    monthlyPayment: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "shipped"], default: "pending" },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, enum: ["jazzcash", "easypaisa", "bank", "mock"], required: true },
    paymentReference: { type: String },
    paymentProofUrl: { type: String },
    paymentStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    installments: [installmentSchema],
    nextDueDate: { type: Date },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model("Order", orderSchema);