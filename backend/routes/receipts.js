import express from 'express';
import multer from 'multer';
import {
  processReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  getDashboardStats,
  getExpiringWarranties
} from '../controllers/receiptController.js';

const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and HEIC are allowed.'));
    }
  }
});

// Routes
router.post('/process-receipt', upload.single('image'), processReceipt);
router.get('/dashboard', getDashboardStats);
router.get('/expiring-warranties', getExpiringWarranties);
router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.put('/:id', updateReceipt);
router.delete('/:id', deleteReceipt);

export default router;
