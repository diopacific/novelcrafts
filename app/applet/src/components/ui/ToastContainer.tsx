import React from 'react';
import { useToastListener } from '../../lib/toast';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const bgColors = {
  success: 'bg-white border-emerald-100',
  error: 'bg-white border-red-100',
  info: 'bg-white border-blue-100'
};

export function ToastContainer() {
  const toasts = useToastListener();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-lg ${bgColors[t.type]} pointer-events-auto min-w-[300px]`}
          >
            {icons[t.type]}
            <span className="text-[14px] font-bold text-slate-700">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
