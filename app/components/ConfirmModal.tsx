'use client';

import React from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen, title, message, onConfirm, onCancel,
  confirmText = 'Xác nhận', cancelText = 'Hủy', isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
          <WarningAmberIcon sx={{ fontSize: 32 }} />
        </div>
        
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
          {title}
        </h3>
        
        <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1, padding: '10px' }} 
            onClick={onCancel} 
            disabled={isLoading}
          >
            {cancelText}
          </button>
          
          <button 
            className="btn btn-danger" 
            style={{ flex: 1, padding: '10px' }} 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
