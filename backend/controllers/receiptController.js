import Receipt from '../models/Receipt.js';
import { analyzeReceiptImage } from '../services/geminiService.js';
import fs from 'fs/promises';
import path from 'path';

// Process and save a receipt
export const processReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // Analyze with Gemini Vision
    console.log('📸 Analyzing receipt with Gemini...');
    const analysis = await analyzeReceiptImage(imageBuffer, mimeType);

    if (!analysis.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze receipt: ' + analysis.error
      });
    }

    // Save image to uploads folder
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filename = `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}.${mimeType.split('/')[1]}`;
    const imagePath = path.join(uploadsDir, filename);
    await fs.writeFile(imagePath, imageBuffer);

    // Create receipt document
    const receiptData = {
      imageUrl: `/uploads/${filename}`,
      storeName: analysis.data.storeName,
      purchaseDate: new Date(analysis.data.purchaseDate),
      warrantyExpiryDate: analysis.data.warrantyExpiryDate ? new Date(analysis.data.warrantyExpiryDate) : null,
      totalAmount: analysis.data.totalAmount,
      currency: analysis.data.currency || 'INR',
      isRecurring: analysis.data.isRecurring || false,
      recurringFrequency: analysis.data.recurringFrequency || null,
      items: analysis.data.items || [],
      tags: analysis.data.tags || [],
      rawText: analysis.rawText
    };

    const receipt = new Receipt(receiptData);
    await receipt.save();

    console.log('✅ Receipt saved:', receipt._id);

    res.status(201).json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('Process Receipt Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all receipts with optional filters
export const getReceipts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = '-purchaseDate',
      warrantyExpiring,
      isRecurring,
      search
    } = req.query;

    const query = {};

    // Filter by warranty expiring soon (within 30 days)
    if (warrantyExpiring === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query.warrantyExpiryDate = {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      };
    }

    // Filter by recurring
    if (isRecurring !== undefined) {
      query.isRecurring = isRecurring === 'true';
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const receipts = await Receipt.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Receipt.countDocuments(query);

    res.json({
      success: true,
      data: receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Receipts Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single receipt by ID
export const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('Get Receipt Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update receipt
export const updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('Update Receipt Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete receipt
export const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }

    // Optionally delete the image file
    if (receipt.imageUrl) {
      const imagePath = path.join(process.cwd(), receipt.imageUrl);
      await fs.unlink(imagePath).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });

  } catch (error) {
    console.error('Delete Receipt Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalReceipts,
      warrantyExpiringSoon,
      recurringCount,
      thisMonthSpending,
      lastMonthSpending,
      recentReceipts
    ] = await Promise.all([
      Receipt.countDocuments(),
      Receipt.countDocuments({
        warrantyExpiryDate: { $gte: now, $lte: thirtyDaysFromNow }
      }),
      Receipt.countDocuments({ isRecurring: true }),
      Receipt.aggregate([
        { $match: { purchaseDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Receipt.aggregate([
        { $match: { purchaseDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Receipt.find().sort('-createdAt').limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalReceipts,
        warrantyExpiringSoon,
        recurringCount,
        thisMonthSpending: thisMonthSpending[0]?.total || 0,
        lastMonthSpending: lastMonthSpending[0]?.total || 0,
        recentReceipts
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get warranties expiring soon
export const getExpiringWarranties = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const receipts = await Receipt.find({
      warrantyExpiryDate: {
        $gte: now,
        $lte: futureDate
      }
    }).sort('warrantyExpiryDate');

    res.json({
      success: true,
      data: receipts
    });

  } catch (error) {
    console.error('Expiring Warranties Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
