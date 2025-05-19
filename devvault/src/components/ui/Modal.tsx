import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle, FiEdit2, FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value?: string) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'input';
  defaultValue?: string;
  inputPlaceholder?: string;
  icon?: 'alert' | 'edit';
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'confirm',
  defaultValue = '',
  inputPlaceholder = '',
  icon = 'alert'
}: ModalProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && type === 'input' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen, type]);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'input') {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] md:w-[85%] lg:w-[75%] max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] p-4 sm:p-6 !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 px-4 sm:px-6">
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  icon === 'alert' 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {icon === 'alert' ? (
                    <FiAlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
                  ) : (
                    <FiEdit2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 sm:py-6">
              {description && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 break-words">
                  {description}
                </p>
              )}

              {type === 'input' && (
                <div className="mb-6">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={inputPlaceholder}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 -mx-4 sm:-mx-6 px-4 sm:px-6">
              <button
                onClick={onClose}
                className="px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[80px] sm:min-w-[100px]"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2.5 sm:py-3 text-sm font-medium text-white rounded-lg transition-colors min-w-[80px] sm:min-w-[100px] ${
                  type === 'confirm' 
                    ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                    : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 