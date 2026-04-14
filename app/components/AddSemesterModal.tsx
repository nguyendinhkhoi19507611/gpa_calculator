'use client';

import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { YearData } from './Dashboard';

interface AddSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  years: YearData[];
  onAdd: (yearId: string, name: string, targetCredits: number) => void;
  preselectedYearId: string | null;
}

export default function AddSemesterModal({ isOpen, onClose, years, onAdd, preselectedYearId }: AddSemesterModalProps) {
  const [yearId, setYearId] = useState('');
  const [name, setName] = useState('');
  const [targetCredits, setTargetCredits] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setYearId(preselectedYearId || (years.length > 0 ? years[0]._id : ''));
    }
  }, [isOpen, preselectedYearId, years]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const credits = parseFloat(targetCredits);
    if (!name.trim() || !yearId || isNaN(credits) || credits <= 0) return;
    onAdd(yearId, name.trim(), credits);
    setName('');
    setTargetCredits('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><AddIcon sx={{ fontSize: 20 }} /> Thêm Học Kỳ Mới</h3>
          <button className="modal-close" onClick={onClose}><CloseIcon sx={{ fontSize: 20 }} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label>Năm học</label>
            <select value={yearId} onChange={(e) => setYearId(e.target.value)} required>
              {years.map(y => (
                <option key={y._id} value={y._id}>{y.name}</option>
              ))}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group mb-4">
              <label>Tên học kỳ</label>
              <input type="text" placeholder="VD: Học kỳ 1" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
            </div>
            <div className="form-group mb-4">
              <label>Tín chỉ của kỳ</label>
              <input type="number" placeholder="VD: 15" min={1} value={targetCredits} onChange={(e) => setTargetCredits(e.target.value)} required />
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary"><AddIcon sx={{ fontSize: 16 }} /> Tạo học kỳ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
