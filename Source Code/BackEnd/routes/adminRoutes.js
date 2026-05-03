const express = require("express");
const {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/auth");
const router = express.Router();
const Order = require("../models/Order");

router.use(protect, admin);

router.get("/pending-doctors", getPendingDoctors);
router.put("/approve-doctor/:id", approveDoctor);
router.delete("/reject-doctor/:id", rejectDoctor);

// 📦 Get all orders
router.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// ⏳ Get only pending orders
router.get("/orders/pending", async (req, res) => {
  const orders = await Order.find({ status: "PENDING" });
  res.json(orders);
});

// ✅ Approve order
router.put("/orders/:id/approve", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "APPROVED" },
    { new: true },
  );

  res.json(order);
});

// ❌ Reject order
router.put("/orders/:id/reject", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "REJECTED" },
    { new: true },
  );

  res.json(order);
});

module.exports = router;
