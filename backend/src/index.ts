// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // برای اینکه بتوانیم JSON دریافت کنیم

// Routes
app.use('/api/products', productRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Night Backend running on http://localhost:${PORT}`);
});

