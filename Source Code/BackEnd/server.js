const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Models removed seed DB logic to avoid mock data

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const path = require('path');

// Explicitly load .env from root directory to avoid path issues
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins explicitly to avoid CORS blocking
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/labs', require('./routes/labtestsRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes.js'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
