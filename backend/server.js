import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminroutes.js';
import categoryRoutes from './routes/categoryroutes.js';
import varietyRoutes from './routes/varietyroutes.js';
import foodRoutes from './routes/foodroutes.js';
import salesRoutes from './routes/salesroutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('API is running securely...');
});

app.use('/api/admin', adminRoutes);
app.use('/api/admin/category', categoryRoutes);
app.use('/api/admin/variety', varietyRoutes);
app.use('/api/admin/food', foodRoutes);
app.use('/api/admin/sales', salesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Database & Server Initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI is missing.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB Connected Successfully");
            // Start server ONLY after DB connects
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
                console.log(`Admin Login: http://localhost:${PORT}/api/admin/login`);
            });
        })
        .catch((err) => {
            console.error("Database connection failed. Server not started:", err.message);
        });
}