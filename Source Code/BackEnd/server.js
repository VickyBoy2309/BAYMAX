const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables FIRST (only once)
dotenv.config({ path: path.join(__dirname, '.env') });

// DB connection
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const labRoutes = require('./routes/labtestsRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Initialize app
const app = express();


// 🔥 Connect to MongoDB
connectDB();


// 🌐 Middleware
app.use(cors({
  origin: '*', // You can restrict later in production
}));
app.use(express.json());


// 🚀 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/medicines', medicineRoutes);


// 🧪 Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ API is working perfectly' });
});


// ❌ Error Handling (ALWAYS LAST)
app.use(notFound);
app.use(errorHandler);


// 🚀 Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});