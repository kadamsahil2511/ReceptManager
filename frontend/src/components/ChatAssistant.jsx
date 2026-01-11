import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User,
  Sparkles,
  AlertCircle,
  RefreshCcw,
  FileText,
  Clock
} from 'lucide-react';
import { useChat } from '../hooks/useReceipts';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`p-2 rounded-xl h-fit ${
        isUser 
          ? 'bg-gradient-to-br from-purple-600 to-violet-600' 
          : 'bg-white/10'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-purple-400" />
        )}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white' 
            : 'glass-card text-white/90'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 
               hover:bg-white/10 hover:border-white/20 transition-all text-sm text-white/70"
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, loading, clearChat } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: AlertCircle, label: 'Expiring warranties', query: 'Which warranties are expiring soon?' },
    { icon: FileText, label: 'This month spending', query: 'How much have I spent this month?' },
    { icon: RefreshCcw, label: 'Recurring bills', query: 'Show me my recurring bills and subscriptions' },
    { icon: Clock, label: 'Recent purchases', query: 'What were my recent purchases?' },
  ];

  return (
    <>
      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 
                   shadow-lg shadow-purple-500/30 text-white"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#050505]" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg h-[85vh] sm:h-[600px] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">AI Assistant</h2>
                    <p className="text-xs text-white/40">Powered by Gemini</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={clearChat}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Clear chat"
                  >
                    <RefreshCcw className="w-4 h-4 text-white/60" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 mb-4">
                      <Bot className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Hi! I'm your receipt assistant 👋
                    </h3>
                    <p className="text-sm text-white/60 mb-6">
                      I can help you find receipts, track warranties, and answer questions about your spending.
                    </p>
                    
                    <div className="w-full space-y-2">
                      <p className="text-xs text-white/40 uppercase tracking-wide">Quick Actions</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickActions.map((action, idx) => (
                          <QuickAction
                            key={idx}
                            icon={action.icon}
                            label={action.label}
                            onClick={() => sendMessage(action.query)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <ChatMessage key={idx} message={msg} />
                    ))}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="p-2 rounded-xl bg-white/10 h-fit">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="glass-card p-3 rounded-2xl">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="glass-input flex-1"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 
                             text-white disabled:opacity-50 disabled:cursor-not-allowed
                             hover:from-purple-500 hover:to-violet-500 transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
