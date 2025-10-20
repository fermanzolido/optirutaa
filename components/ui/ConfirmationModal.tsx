import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.tsx';
import { X, AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  variant?: 'primary' | 'destructive';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText,
  variant = 'destructive' 
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDestructive = variant === 'destructive';
  const Icon = isDestructive ? AlertTriangle : HelpCircle;
  const titleColor = isDestructive ? 'text-red-500' : 'text-[var(--color-primary)]';
  const finalConfirmText = confirmText || (isDestructive ? 'Eliminar' : 'Confirmar');
  const confirmButtonClasses = isDestructive 
    ? 'bg-red-600 hover:bg-red-700' 
    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]';

  const titleId = "confirmation-modal-title";
  const messageId = "confirmation-modal-message";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] w-full max-w-md scale-95 opacity-0 animate-scale-in border border-[var(--color-shadow-light)]"
        style={{ animation: 'scaleIn 0.3s forwards' }}
        onClick={e => e.stopPropagation()}
      >
        <CardHeader className="flex justify-between items-center relative">
          <CardTitle id={titleId} className={`flex items-center ${titleColor}`}>
             <Icon className="mr-3" />
            {title}
          </CardTitle>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] transition rounded-full hover:bg-[var(--color-bg)]"
            aria-label="Cerrar modal de confirmación"
          >
            <X size={24} />
          </button>
        </CardHeader>
        <CardContent className="py-6">
          <div id={messageId} className="text-[var(--color-text-main)]">{message}</div>
          <div className="flex justify-end pt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-[var(--color-text-strong)] font-semibold rounded-lg bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:shadow-[2px_2px_5px_var(--color-shadow-dark),_-2px_-2px_5px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2 text-white font-semibold rounded-lg shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all ${confirmButtonClasses}`}
            >
              {finalConfirmText}
            </button>
          </div>
        </CardContent>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};