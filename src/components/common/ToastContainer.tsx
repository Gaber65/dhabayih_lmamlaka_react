import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-20 md:bottom-8 start-4 end-4 md:start-auto md:end-8 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-2 shadow-cartoon-pop bg-white ${
                isSuccess
                  ? 'border-mint-400 text-mint-900'
                  : isError
                  ? 'border-rose-400 text-rose-900'
                  : 'border-gold-400 text-charcoal-900'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-mint-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-gold-500" />}
              </div>

              <div className="flex-1 text-sm font-bold">
                {toast.title && <div className="font-extrabold mb-0.5">{toast.title}</div>}
                <div>{toast.message}</div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-charcoal-400 hover:text-charcoal-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};