const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [
      {
        name: String,
        price: Number,
        needsPrescription: Boolean,
      },
    ],

    totalAmount: Number,

    prescriptionUploaded: {
      type: Boolean,
      default: false,
    },

    // 🆕 ADD THIS (VERY IMPORTANT)
    prescriptionPath: {
      type: String,
      default: null,
    },

    // 🔄 IMPROVE THIS
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"], // 👈 controlled values
      default: "PENDING",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
