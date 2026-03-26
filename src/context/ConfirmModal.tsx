import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            className="relative w-full max-w-xs bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5">
            <div className="p-6 text-center">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{message}</p>
              <div className="space-y-2">
                <button onClick={onConfirm}
                  className={`w-full py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 ${isDanger ? 'bg-red-500' : 'bg-blue-500'}`}>
                  {confirmText}
                </button>
                <button onClick={onCancel}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 transition-all active:scale-95">
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
