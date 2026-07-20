"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  selectedTier?: string | null;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  size?: "default" | "large";
  layout?: "default" | "fixed-header-footer";
};

type ModalHeaderProps = {
  children: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
};

type ModalBodyProps = {
  children: ReactNode;
};

type ModalFooterProps = {
  children: ReactNode;
};

export function ModalHeader({ children, onClose, showCloseButton = true }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 md:px-8 md:py-6">
      {children}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-auto rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function ModalBody({ children }: ModalBodyProps) {
  return (
    <div className="overflow-y-auto px-6 py-5 md:px-8 md:py-6">
      {children}
    </div>
  );
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="border-t border-slate-200 px-6 py-4 md:px-8 md:py-5">
      {children}
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  size = "default",
  layout = "default",
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (closeOnEscape) {
        window.addEventListener("keydown", handleEscape);
      }
    }
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  const maxWidthClass = size === "large" ? "max-w-[900px]" : "max-w-2xl";
  const heightClass = size === "large" ? "max-h-[90vh]" : "max-h-screen";
  const contentClass = layout === "fixed-header-footer" ? "flex flex-col" : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`fixed left-1/2 top-1/2 z-[70] w-[95%] ${maxWidthClass} ${heightClass} -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl ${contentClass} md:rounded-3xl`}
          >
            {layout === "default" && (
              <div className="flex flex-col overflow-y-auto p-6 md:p-8">
                <div className="mb-6 flex items-start justify-between">
                  {title && <h2 className="text-3xl font-bold text-slate-900">{title}</h2>}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 flex-shrink-0"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {children}
              </div>
            )}
            {layout === "fixed-header-footer" && children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
