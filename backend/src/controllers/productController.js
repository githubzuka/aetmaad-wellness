import Product from '../models/Product.js';
import Shop from '../models/Shop.js';

/**
 * @desc    Get products for a shop
 * @route   GET /api/shops/:shopId/products
 * @access  Public
 */
export const getProductsByShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const products = await Product.find({ shop: req.params.shopId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products across platform
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('shop', 'name city').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop', 'name city address');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product in a shop
 * @route   POST /api/shops/:shopId/products
 * @access  Private (Admin, Volunteer)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, retailPrice, bulkPrice, stock } = req.body;

    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (retailPrice === undefined || bulkPrice === undefined) {
      return res.status(400).json({ message: 'Both retailPrice and bulkPrice are required' });
    }

    const product = await Product.create({
      shop: req.params.shopId,
      name,
      description: description || '',
      retailPrice,
      bulkPrice,
      stock: stock !== undefined ? stock : 0,
    });

    // Update shop lastUpdated timestamp
    shop.lastUpdated = Date.now();
    await shop.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Private (Admin, Volunteer)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description !== undefined ? req.body.description : product.description;
    product.retailPrice = req.body.retailPrice !== undefined ? req.body.retailPrice : product.retailPrice;
    product.bulkPrice = req.body.bulkPrice !== undefined ? req.body.bulkPrice : product.bulkPrice;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;

    await product.save();

    // Touch parent shop lastUpdated timestamp
    await Shop.findByIdAndUpdate(product.shop, { lastUpdated: Date.now() });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin, Volunteer)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const shopId = product.shop;
    await product.deleteOne();

    await Shop.findByIdAndUpdate(shopId, { lastUpdated: Date.now() });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
