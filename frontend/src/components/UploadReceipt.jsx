import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Image, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Sparkles 
} from 'lucide-react';
import { useUploadReceipt } from '../hooks/useReceipts';

const UploadReceipt = ({ onSuccess }) => {
  const { upload, uploading, progress, error } = useUploadReceipt();
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const response = await upload(file);
      setResult(response.data);
      onSuccess?.(response.data);
      
      // Reset after delay
      setTimeout(() => {
        setPreview(null);
        setResult(null);
      }, 3000);
    } catch (err) {
      // Error is handled by hook
    }
  }, [upload, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) onDrop([file]);
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Scan Receipt
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-8 text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-400">{progress}%</span>
              </div>
            </div>
            
            {preview && (
              <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden">
                <img src={preview} alt="Receipt" className="w-full h-full object-cover" />
              </div>
            )}
            
            <p className="text-white font-medium">
              {progress < 30 ? 'Uploading...' : 
               progress < 70 ? 'AI is analyzing...' : 
               'Extracting data...'}
            </p>
            <p className="text-sm text-white/40 mt-1">
              Gemini Vision is reading your receipt
            </p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card border-green-500/30 bg-green-500/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-400">Receipt Processed!</p>
                <p className="text-sm text-white/60">{result.storeName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass-card p-3">
                <p className="text-white/40">Amount</p>
                <p className="font-semibold text-white">
                  ₹{result.totalAmount?.toLocaleString()}
                </p>
              </div>
              <div className="glass-card p-3">
                <p className="text-white/40">Items</p>
                <p className="font-semibold text-white">{result.items?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card border-red-500/30 bg-red-500/10 p-6 text-center"
          >
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium">Failed to process</p>
            <p className="text-sm text-white/60 mt-1">{error}</p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={`glass-card p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' : 'hover:border-white/20'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
                {isDragActive ? (
                  <Upload className="w-8 h-8 text-white animate-bounce" />
                ) : (
                  <Image className="w-8 h-8 text-white" />
                )}
              </div>
              
              <p className="text-white font-medium mb-1">
                {isDragActive ? 'Drop your receipt here' : 'Drop receipt image here'}
              </p>
              <p className="text-sm text-white/40">
                or click to browse files
              </p>
            </div>

            <button
              onClick={handleCameraCapture}
              className="w-full mt-3 glass-button-primary flex items-center justify-center gap-2 py-3"
            >
              <Camera className="w-5 h-5" />
              Take Photo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadReceipt;
