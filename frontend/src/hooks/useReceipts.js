import { useState, useEffect, useCallback } from 'react';
import { receiptsApi, chatApi } from '../api';

// Hook for fetching receipts
export const useReceipts = (initialParams = {}) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchReceipts = useCallback(async (params = initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await receiptsApi.getAll(params);
      setReceipts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  return { receipts, loading, error, pagination, refetch: fetchReceipts };
};

// Hook for dashboard stats
export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await receiptsApi.getDashboard();
      setStats(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Hook for expiring warranties
export const useExpiringWarranties = (days = 30) => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarranties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await receiptsApi.getExpiringWarranties(days);
      setWarranties(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchWarranties();
  }, [fetchWarranties]);

  return { warranties, loading, error, refetch: fetchWarranties };
};

// Hook for uploading receipt
export const useUploadReceipt = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(10);
      
      // Simulate progress during API call
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await receiptsApi.processReceipt(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  return { upload, uploading, progress, error };
};

// Hook for chat
export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message, receiptId = null) => {
    try {
      setLoading(true);
      setError(null);

      // Add user message
      const userMessage = { role: 'user', content: message };
      setMessages((prev) => [...prev, userMessage]);

      // Get conversation history for context
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatApi.sendMessage(message, receiptId, history);

      // Add AI response
      const aiMessage = { role: 'model', content: response.message };
      setMessages((prev) => [...prev, aiMessage]);

      return response;
    } catch (err) {
      setError(err.message);
      // Add error message
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: `Sorry, I encountered an error: ${err.message}` },
      ]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, sendMessage, loading, error, clearChat };
};
