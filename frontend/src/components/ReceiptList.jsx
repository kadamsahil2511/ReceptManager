import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';
import { 
  Receipt, 
  Calendar, 
  AlertTriangle, 
  RefreshCcw,
  ChevronRight,
  Tag,
  Trash2,
  X,
  ShoppingBag,
  Store
} from 'lucide-react';
import { useReceipts, useExpiringWarranties } from '../hooks/useReceipts';
import { receiptsApi } from '../api';
import toast from 'react-hot-toast';

const WarrantyBadge = ({ expiryDate }) => {
  if (!expiryDate) return null;
  
  const expiry = new Date(expiryDate);
  const daysUntil = differenceInDays(expiry, new Date());
  const isExpired = isPast(expiry);
  
  let bgColor = 'bg-green-500/20 text-green-400';
  let text = `${daysUntil}d left`;
  
  if (isExpired) {
    bgColor = 'bg-red-500/20 text-red-400';
    text = 'Expired';
  } else if (daysUntil <= 30) {
    bgColor = 'bg-amber-500/20 text-amber-400';
    text = `${daysUntil}d left`;
  }
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${bgColor}`}>
      {text}
    </span>
  );
};

const ReceiptCard = ({ receipt, onClick, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    
    setDeleting(true);
    try {
      await receiptsApi.delete(receipt._id);
      toast.success('Receipt deleted');
      onDelete?.(receipt._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      onClick={() => onClick?.(receipt)}
      className="glass-card-hover p-4 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-500/20">
          <Store className="w-5 h-5 text-purple-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-white truncate">{receipt.storeName}</h3>
            <WarrantyBadge expiryDate={receipt.warrantyExpiryDate} />
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(receipt.purchaseDate), 'MMM d, yyyy')}
            </span>
            {receipt.isRecurring && (
              <span className="flex items-center gap-1 text-blue-400">
                <RefreshCcw className="w-3 h-3" />
                Recurring
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-semibold text-white">
              ₹{receipt.totalAmount?.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              {receipt.items?.length > 0 && (
                <span className="text-xs text-white/40 px-2 py-0.5 rounded-full bg-white/5">
                  {receipt.items.length} items
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
        >
          {deleting ? (
            <RefreshCcw className="w-4 h-4 text-red-400 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-red-400" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

const ReceiptDetail = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-lg max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{receipt.storeName}</h2>
            <p className="text-sm text-white/40">
              {format(new Date(receipt.purchaseDate), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Amount */}
          <div className="text-center py-4">
            <p className="text-sm text-white/40">Total Amount</p>
            <p className="text-4xl font-bold text-gradient">
              ₹{receipt.totalAmount?.toLocaleString()}
            </p>
          </div>

          {/* Warranty */}
          {receipt.warrantyExpiryDate && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Warranty Status</span>
              </div>
              <p className="text-sm text-white/60">
                Expires {format(new Date(receipt.warrantyExpiryDate), 'MMMM d, yyyy')}
                <span className="text-white/40 ml-2">
                  ({formatDistanceToNow(new Date(receipt.warrantyExpiryDate), { addSuffix: true })})
                </span>
              </p>
            </div>
          )}

          {/* Items */}
          {receipt.items?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Items ({receipt.items.length})
              </h3>
              <div className="space-y-2">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="glass-card p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white">{item.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                      )}
                    </div>
                    {item.price && (
                      <span className="text-sm font-medium text-white">
                        ₹{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {receipt.tags?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {receipt.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SkeletonList = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="glass-card p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded shimmer" />
            <div className="h-3 w-24 rounded shimmer" />
            <div className="h-5 w-20 rounded shimmer" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ReceiptList = ({ filter, onRefreshNeeded }) => {
  const { receipts, loading, error, refetch } = useReceipts(filter);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleDelete = (id) => {
    refetch();
    onRefreshNeeded?.();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Receipts</h2>
        <SkeletonList />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-white/60 mb-4">{error}</p>
        <button onClick={refetch} className="glass-button-primary">
          <RefreshCcw className="w-4 h-4 mr-2 inline" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-purple-400" />
          Recent Receipts
        </h2>
        <button 
          onClick={refetch}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {receipts.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Receipt className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No receipts yet</p>
          <p className="text-sm text-white/40 mt-1">Upload your first receipt to get started</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <ReceiptCard
                key={receipt._id}
                receipt={receipt}
                onClick={setSelectedReceipt}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {selectedReceipt && (
          <ReceiptDetail
            receipt={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiptList;
