import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Receipt, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import UploadReceipt from './components/UploadReceipt';
import ReceiptList from './components/ReceiptList';
import ChatAssistant from './components/ChatAssistant';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState({});

  const handleUploadSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleViewReceipts = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Main content */}
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg shadow-purple-500/30">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
                Smart Receipts
                <Sparkles className="w-5 h-5 text-purple-400" />
              </h1>
              <p className="text-sm text-white/40">Track • Manage • Protect</p>
            </div>
          </div>
        </motion.header>

        {/* Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Dashboard key={`dashboard-${refreshKey}`} onViewReceipts={handleViewReceipts} />
        </motion.section>

        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <UploadReceipt onSuccess={handleUploadSuccess} />
        </motion.section>

        {/* Receipt List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ReceiptList 
            key={`receipts-${refreshKey}`} 
            filter={filter}
            onRefreshNeeded={() => setRefreshKey((k) => k + 1)}
          />
        </motion.section>
      </div>

      {/* Chat FAB */}
      <ChatAssistant />
    </div>
  );
}

export default App;
