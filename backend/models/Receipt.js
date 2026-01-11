import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number },
  category: { type: String }
});

const receiptSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: true 
  },
  storeName: { 
    type: String, 
    required: true,
    index: true
  },
  purchaseDate: { 
    type: Date, 
    required: true,
    index: true
  },
  warrantyExpiryDate: { 
    type: Date,
    index: true
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', null],
    default: null
  },
  items: [itemSchema],
  rawText: {
    type: String // Store OCR text for RAG
  },
  embedding: {
    type: [Number] // Vector embedding for semantic search (future RAG)
  },
  tags: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for warranty status
receiptSchema.virtual('warrantyStatus').get(function() {
  if (!this.warrantyExpiryDate) return 'none';
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.warrantyExpiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  return 'active';
});

// Index for text search
receiptSchema.index({ storeName: 'text', rawText: 'text', 'items.name': 'text' });

// Ensure virtuals are included in JSON
receiptSchema.set('toJSON', { virtuals: true });
receiptSchema.set('toObject', { virtuals: true });

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;
