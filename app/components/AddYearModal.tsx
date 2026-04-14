'use client';

import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

interface AddYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export default function AddYearModal({ isOpen, onClose, onAdd }: AddYearModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><AddIcon sx={{ fontSize: 20 }} /> Thêm Năm Học Mới</h3>
          <button className="modal-close" onClick={onClose}><CloseIcon sx={{ fontSize: 20 }} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên năm học</label>
            <input type="text" placeholder="VD: Năm học 2023 - 2024" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary"><AddIcon sx={{ fontSize: 16 }} /> Tạo năm học</button>
          </div>
        </form>
      </div>
    </div>
  );
}
