import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-zinc-900/95 border border-zinc-700/60 text-zinc-100 text-xs font-mono font-medium tracking-tight px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md"
          id="system-toast-pill"
        >
          <Info className="w-3.5 h-3.5 text-accent" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
