import Receipt from '../models/Receipt.js';
import { chatWithContext, searchForSupport } from '../services/geminiService.js';

// Chat with AI assistant
export const chat = async (req, res) => {
  try {
    const { message, receiptId, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    let context = null;

    // Check for support-related queries
    const supportKeywords = ['support', 'help', 'contact', 'customer service', 'complaint', 'return', 'refund'];
    const isAskingForSupport = supportKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    // Get context based on receipt ID or search query
    if (receiptId) {
      const receipt = await Receipt.findById(receiptId);
      if (receipt) {
        context = receipt.toObject();
        
        // If asking for support, search for it
        if (isAskingForSupport) {
          const supportInfo = await searchForSupport(receipt.storeName);
          if (supportInfo.success) {
            context.supportInfo = supportInfo;
          }
        }
      }
    } else {
      // Try to find relevant receipts based on the message
      const relevantReceipts = await Receipt.find({
        $text: { $search: message }
      }).limit(3);

      if (relevantReceipts.length > 0) {
        context = {
          relevantReceipts: relevantReceipts.map(r => r.toObject())
        };
      } else {
        // Get recent receipts as context
        const recentReceipts = await Receipt.find()
          .sort('-purchaseDate')
          .limit(5);
        
        context = {
          recentReceipts: recentReceipts.map(r => ({
            storeName: r.storeName,
            purchaseDate: r.purchaseDate,
            totalAmount: r.totalAmount,
            warrantyExpiryDate: r.warrantyExpiryDate,
            items: r.items.map(i => i.name)
          }))
        };
      }
    }

    // Get warranty summary for context
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringWarranties = await Receipt.find({
      warrantyExpiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    }).select('storeName warrantyExpiryDate items');

    if (expiringWarranties.length > 0) {
      context = {
        ...context,
        expiringWarranties: expiringWarranties.map(r => ({
          storeName: r.storeName,
          warrantyExpiryDate: r.warrantyExpiryDate,
          items: r.items.map(i => i.name)
        }))
      };
    }

    // Chat with Gemini
    const response = await chatWithContext(message, context, conversationHistory);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        error: response.error
      });
    }

    res.json({
      success: true,
      message: response.message,
      context: context ? true : false
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Quick actions based on natural language
export const quickAction = async (req, res) => {
  try {
    const { action } = req.body;

    const actions = {
      'expiring-warranties': async () => {
        const now = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);
        
        return Receipt.find({
          warrantyExpiryDate: { $gte: now, $lte: thirtyDays }
        }).sort('warrantyExpiryDate');
      },
      'this-month-spending': async () => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const result = await Receipt.aggregate([
          { $match: { purchaseDate: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);
        
        return result[0] || { total: 0, count: 0 };
      },
      'recurring-bills': async () => {
        return Receipt.find({ isRecurring: true }).sort('-purchaseDate');
      },
      'recent': async () => {
        return Receipt.find().sort('-createdAt').limit(10);
      }
    };

    if (!actions[action]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    const data = await actions[action]();
    
    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Quick Action Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
