const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("MONGO_URI not found in .env");
        }

        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(uri);

        console.log("✅ MongoDB Connected (REAL DATABASE)");
    } catch (err) {
        console.error("❌ DB Error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;