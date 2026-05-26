import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // 1. Import mongoose
import adminRoutes from './routes/adminroutes.js';
import categoryRoutes from './routes/categoryroutes.js';
import varietyRoutes from './routes/varietyroutes.js';

// Initialize environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined in .env file");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("MongoDB Connected Successfully"))
        .catch((err) => console.error("MongoDB Connection Failed:", err.message));
}

app.get('/', (req, res) => {
    res.send('API is running securely...');
});

app.use('/api/admin', adminRoutes);
app.use('/api/admin/category', categoryRoutes);
app.use('/api/admin/variety', varietyRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin Login active at: http://localhost:${PORT}/api/admin/login`);
});