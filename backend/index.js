import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import dealRoutes from './routes/deals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deals', dealRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to Akash's Tacos 100% Veg Backend API!");
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("🚀 Secure connection established with MongoDB Cloud Cluster!");
        app.listen(PORT, () => {
            console.log(`🔥 Server running smoothly on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Database connection error:", error.message);
    });
