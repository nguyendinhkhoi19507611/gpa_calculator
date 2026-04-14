'use client';

import { YearData, SemesterData } from './Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import { round2 } from '@/lib/utils';

interface SidebarProps {
  years: YearData[];
  activeView: { type: 'overview' | 'year' | 'semester', id: string | null };
  onSelectView: (type: 'overview' | 'year' | 'semester', id: string | null) => void;
  onAddYear: () => void;
  onAddSemester: (preselectedYearId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  overallGpa10: string;
  overallGpa4: string;
}

export default function Sidebar({
  years, activeView, onSelectView, onAddYear, onAddSemester,
  isOpen, onClose, overallGpa10, overallGpa4,
}: SidebarProps) {
  const getSemesterGpa = (sem: SemesterData) => {
    let sum10 = 0, sum4 = 0;
    sem.subjects.forEach((s) => { sum10 += s.grade10 * s.credits; sum4 += s.grade4 * s.credits; });
    const isComplete = sem.targetCredits > 0 && sem.subjects.reduce((a, b) => a + b.credits, 0) === sem.targetCredits;
    if (!isComplete) return { g4: '—' };
    return { g4: round2(sum4 / sem.targetCredits) };
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2><FolderIcon sx={{ fontSize: 16 }} /> Điều Hướng</h2>
          <button className="sidebar-close" onClick={onClose}><CloseIcon sx={{ fontSize: 20 }} /></button>
        </div>

        <div className="sidebar-gpa-mini">
          <div className="sidebar-gpa-row">
            <span>GPA Tích lũy (Hệ 10)</span>
            <strong>{overallGpa10}</strong>
          </div>
          <div className="sidebar-gpa-row">
            <span>GPA Tích lũy (Hệ 4)</span>
            <strong>{overallGpa4}</strong>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeView.type === 'overview' ? 'active' : ''}`}
            onClick={() => { onSelectView('overview', null); onClose(); }}
          >
            <span className="sidebar-item-icon"><HomeIcon sx={{ fontSize: 18 }} /></span>
            <span>Tổng quan toàn khoá</span>
          </button>

          {years.map((year) => (
            <div key={year._id} className="mt-2">
              <div className="flex items-center justify-between px-3 py-1 text-xs font-bold text-gray-400 uppercase">
                <div 
                  className={`flex items-center gap-2 cursor-pointer hover:text-gray-600 w-full ${activeView.type === 'year' && activeView.id === year._id ? 'text-gray-900' : ''}`}
                  onClick={() => { onSelectView('year', year._id); onClose(); }}
                >
                  <InsertInvitationIcon sx={{ fontSize: 14 }} /> {year.name}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mt-1 pl-2 border-l border-gray-100 ml-4">
                {year.semesters.map(sem => {
                  const gpa = getSemesterGpa(sem);
                  return (
                    <div key={sem._id} className="relative group flex items-center">
                      <button
                        className={`sidebar-item w-full ${activeView.type === 'semester' && activeView.id === sem._id ? 'active' : ''}`}
                        onClick={() => { onSelectView('semester', sem._id); onClose(); }}
                        style={{ padding: '6px 10px' }}
                      >
                        <span className="sidebar-item-icon"><MenuBookIcon sx={{ fontSize: 16 }} /></span>
                        <div className="sidebar-item-content text-left w-full">
                          <span className="sidebar-item-name text-[13px]">{sem.name}</span>
                          <span className="sidebar-item-gpa">{sem.subjects.length} môn • GPA: {gpa.g4}</span>
                        </div>
                      </button>
                    </div>
                  );
                })}
                {year.semesters.length === 0 && (
                  <div className="px-3 py-1 text-xs text-gray-400 italic">Chưa có học kỳ</div>
                )}
              </div>
            </div>
          ))}
        </nav>

        <button className="btn btn-primary sidebar-add-btn" onClick={onAddYear}>
          <AddIcon sx={{ fontSize: 18 }} /> Thêm năm học
        </button>
      </aside>
    </>
  );
}
