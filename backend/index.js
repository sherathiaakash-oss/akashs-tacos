import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Resolve __dirname path compatibility for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({ origin: '/api/', credentials: true }));


// 1. API Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deals', dealRoutes);

// 2. Serve Frontend Static Production Assets
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 3. Fallback Route: Pass web traffic routing requests to React Router
app.get('/:any', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Database Connection & Initialization
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("🚀 Secure connection established with MongoDB Cloud Cluster!");
        app.listen(PORT, () => {
            console.log(`🔥 Server running smoothly on dynamic Port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Database connection error:", error.message);
    });
