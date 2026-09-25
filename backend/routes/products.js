// backend/routes/products.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * @route   GET /api/products
 * @desc    List all products
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('❌ Get Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('❌ Get Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create product (admin only)
 * @access  Admin
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, image, price, priceDisplay } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name and price are required',
      });
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price',
      });
    }

    const product = await prisma.product.create({
      data: {
        name: String(name),
        description: String(description || ''),
        image: String(image || ''),
        price: parsedPrice,
        priceDisplay: String(priceDisplay || `${parsedPrice} π`),
      },
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('❌ Create Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
    });
  }
});

module.exports = router;
