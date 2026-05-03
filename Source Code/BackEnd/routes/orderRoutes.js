const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const multer = require("multer");

// Setup multer
const upload = multer({
  dest: "uploads/", // folder for storing prescription files
});

router.post(
  "/create",
  upload.single("prescription"), // 👈 IMPORTANT
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      // Parse items (because FormData sends string)
      const items = JSON.parse(req.body.items);
      const totalAmount = req.body.totalAmount;

      const hasPrescription = items.some((item) => item.needsPrescription);

      // Check if file uploaded when required
      if (hasPrescription && !req.file) {
        return res.status(400).json({
          success: false,
          message: "Prescription required",
        });
      }

      const newOrder = new Order({
        items,
        totalAmount,

        prescriptionUploaded: !!req.file,

        // 🆕 ADD THIS
        prescriptionPath: req.file ? req.file.path : null,

        // 🆕 ADD THIS
        status: "PENDING",
      });

      await newOrder.save();

      res.json({
        success: true,
        order: newOrder,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false });
    }
  },
);

module.exports = router;
