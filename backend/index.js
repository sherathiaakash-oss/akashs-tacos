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
// Northflank dynamically provides a PORT variable, so this handles both local and cloud environments
const PORT = process.env.PORT || 5000; 

app.use(express.json());

// Restrict CORS safely in production to protect your endpoints, allowing your local and future Vercel frontend
const allowedOrigins = [
    'http://localhost:5173', // Local Vite development
    process.env.FRONTEND_URL  // Your live Vercel URL (configured later)
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server or tools like Postman (which send no origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

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
            // Updated log to dynamically show the active environment port
            console.log(`🔥 Server running smoothly on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Database connection error:", error.message);
    });
