import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Wallet, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../hooks/useReceipts';

const StatCard = ({ icon: Icon, label, value, subValue, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card p-4 flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white/60 truncate">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && (
        <div className="flex items-center gap-1 mt-0.5">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
          <span className={`text-xs ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 'text-white/40'
          }`}>
            {subValue}
          </span>
        </div>
      )}
    </div>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="glass-card p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl shimmer" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-20 rounded shimmer" />
      <div className="h-6 w-16 rounded shimmer" />
    </div>
  </div>
);

const Dashboard = ({ onViewReceipts }) => {
  const { stats, loading, error, refetch } = useDashboard();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTrend = () => {
    if (!stats) return { trend: null, text: '' };
    const diff = stats.thisMonthSpending - stats.lastMonthSpending;
    const percent = stats.lastMonthSpending > 0 
      ? Math.abs((diff / stats.lastMonthSpending) * 100).toFixed(0) 
      : 0;
    
    if (diff > 0) return { trend: 'up', text: `+${percent}% vs last month` };
    if (diff < 0) return { trend: 'down', text: `-${percent}% vs last month` };
    return { trend: null, text: 'Same as last month' };
  };

  const spendingTrend = calculateTrend();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Dashboard</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">Dashboard</h2>
        <button 
          onClick={refetch}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Receipt}
          label="Total Receipts"
          value={stats?.totalReceipts || 0}
          delay={0}
          color="from-purple-600 to-violet-600"
        />
        
        <StatCard
          icon={Wallet}
          label="This Month"
          value={formatCurrency(stats?.thisMonthSpending || 0)}
          subValue={spendingTrend.text}
          trend={spendingTrend.trend}
          delay={0.1}
          color="from-emerald-600 to-teal-600"
        />
        
        <StatCard
          icon={AlertTriangle}
          label="Expiring Soon"
          value={stats?.warrantyExpiringSoon || 0}
          subValue="Warranties"
          delay={0.2}
          color="from-amber-600 to-orange-600"
        />
        
        <StatCard
          icon={RefreshCcw}
          label="Recurring"
          value={stats?.recurringCount || 0}
          subValue="Subscriptions"
          delay={0.3}
          color="from-blue-600 to-cyan-600"
        />
      </div>

      {/* Warranty Alert */}
      <AnimatePresence>
        {stats?.warrantyExpiringSoon > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card border-red-500/30 bg-red-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-400">Warranty Alert</h3>
                <p className="text-sm text-white/60 mt-1">
                  {stats.warrantyExpiringSoon} item{stats.warrantyExpiringSoon !== 1 ? 's' : ''} with 
                  warranties expiring in the next 30 days.
                </p>
                <button 
                  onClick={() => onViewReceipts?.({ warrantyExpiring: true })}
                  className="text-sm text-red-400 mt-2 hover:underline"
                >
                  View items →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
