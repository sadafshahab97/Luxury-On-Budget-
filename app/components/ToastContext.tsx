"use client"; // Client-side hooks aur animations ke liye zaroori hai

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion"; // motion/react ki jagah standard framer-motion
import { CheckCircle2 } from "lucide-react";

interface ToastContextType {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);

  const toast = useCallback((msg: string) => {
    setMessage(msg);

    // Timer ko cleanup ke saath handle karna behtar hai
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Portal - Fixed positioning Next.js layouts mein sahi kaam karti hai */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-100 flex items-center gap-3 bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-100 min-w-70"
          >
            <div className="bg-green-100 p-1 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Success</span>
              <span className="text-xs text-slate-500">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
