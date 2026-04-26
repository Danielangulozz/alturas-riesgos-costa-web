import React from "react";
import { FaExclamationTriangle, FaTrash, FaSignOutAlt, FaCheckCircle, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export function ConfirmModal({
  isOpen, onClose, onConfirm, title, message,
  confirmText = "Confirmar", cancelText = "Cancelar",
  type = 'warning'
}: ConfirmModalProps) {
  
  const getStyles = () => {
    switch (type) {
      case 'danger': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', btn: 'bg-red-600 hover:bg-red-700 shadow-red-500/30', icon: <FaTrash size={28} /> };
      case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30', icon: <FaCheckCircle size={28} /> };
      case 'info': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30', icon: <FaSignOutAlt size={28} /> };
      default: return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', btn: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30', icon: <FaExclamationTriangle size={28} /> };
    }
  };

  const styles = getStyles();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#0F172A]/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-white/20 relative overflow-hidden"
        >
          {/* Decoración superior */}
          <div className={`absolute top-0 left-0 w-full h-1.5 ${type === 'danger' ? 'bg-red-500' : type === 'success' ? 'bg-emerald-500' : type === 'info' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <FaTimes size={14} />
          </button>

          <div className="text-center mb-8 mt-2">
            <div className={`${styles.bg} ${styles.text} w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-inner border ${styles.border}`}>
              {styles.icon}
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight">
              {title}
            </h3>
            
            <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 py-4 ${styles.btn} text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
