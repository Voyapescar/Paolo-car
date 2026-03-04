import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

function Notification({ show, onClose, type = 'success', title, message, duration = 5000 }) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const configs = {
    success: { Icon: CheckCircle, border: 'border-gold-500/30', iconColor: 'text-gold-400', titleColor: 'text-stone-900' },
    error:   { Icon: XCircle,     border: 'border-red-500/30',  iconColor: 'text-red-400',  titleColor: 'text-stone-900' },
    warning: { Icon: AlertCircle, border: 'border-gold-500/40', iconColor: 'text-gold-500', titleColor: 'text-stone-900' },
  };

  const c = configs[type] || configs.success;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className={`bg-white border ${c.border} max-w-md w-full p-8 relative`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <c.Icon className={`w-6 h-6 ${c.iconColor} flex-shrink-0 mt-0.5`} />
              <div>
                <h3 className={`font-display text-lg font-semibold ${c.titleColor} mb-2`}>{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{message}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full btn-gold justify-center py-3"
            >
              <span>Entendido</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Notification;
