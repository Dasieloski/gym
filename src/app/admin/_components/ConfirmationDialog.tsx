"use client";

import GlassCard from "@/components/ui/glass-card";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <GlassCard className="max-w-md w-full mx-4">
        <p className="mb-6 text-lg text-white/90 font-sans">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-sans"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white font-semibold hover:opacity-90 transition-opacity font-sans"
          >
            Confirmar
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
