'use client';

import { useState, useEffect, useCallback } from 'react';
import { round2 } from '@/lib/utils';
import Header from './Header';
import Sidebar from './Sidebar';
import SemesterCard from './SemesterCard';
import AddSemesterModal from './AddSemesterModal';
import AddYearModal from './AddYearModal';
import GradeScaleCard from './GradeScaleCard';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ConfirmModal from './ConfirmModal';
import toast from 'react-hot-toast';

export interface SubjectData {
  _id: string; semesterId: string; userId: string; name: string;
  credits: number; grade10: number; grade4: number; letter: string;
  type: string; formula: string;
  rawInputs?: any;
}
export interface SemesterData {
  _id: string; yearId: string; userId: string; name: string;
  targetCredits: number; order: number; createdAt: string; subjects: SubjectData[];
}
export interface YearData {
  _id: string; userId: string; name: string; order: number; createdAt: string;
  semesters: SemesterData[];
}

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [years, setYears] = useState<YearData[]>([]);
  
  const [activeView, setActiveView] = useState<{ type: 'overview' | 'year' | 'semester', id: string | null }>({ type: 'overview', id: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [preselectedYearId, setPreselectedYearId] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, confirmText: string} | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, yearsRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/years')]);
        const userData = await userRes.json();
        const yearsData = await yearsRes.json();
        if (userData.user) setUserName(userData.user.name);
        if (yearsData.years) setYears(yearsData.years);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const calculateGpaFromSemesters = (semesters: SemesterData[]) => {
    let sumC = 0, sum10 = 0, sum4 = 0;
    semesters.forEach(sem => {
      let semSumC = 0, semSum10 = 0, semSum4 = 0;
      sem.subjects.forEach(s => {
        semSumC += s.credits;
        semSum10 += s.grade10 * s.credits;
        semSum4 += s.grade4 * s.credits;
      });
      // Chỉ cộng vào tổng nếu học kỳ đã nhập đủ tín chỉ
      if (semSumC === sem.targetCredits && sem.targetCredits > 0) {
        sumC += semSumC;
        sum10 += semSum10;
        sum4 += semSum4;
      }
    });
    if (sumC === 0) return { g10: '—', g4: '—', totalC: 0 };
    return { g10: round2(sum10 / sumC), g4: round2(sum4 / sumC), totalC: sumC };
  };

  const calcOverallGpa = useCallback(() => {
    const allSemesters = years.flatMap(y => y.semesters);
    return calculateGpaFromSemesters(allSemesters);
  }, [years]);
  const overallGpa = calcOverallGpa();

  const addYear = async (name: string) => {
    try {
      const res = await fetch('/api/years', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (res.ok && data.year) {
        setYears(prev => [...prev, data.year]);
        setActiveView({ type: 'year', id: data.year._id });
      }
    } catch (e) { console.error(e); }
  };

  const addSemester = async (yearId: string, name: string, targetCredits: number) => {
    try {
      const res = await fetch('/api/semesters', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ yearId, name, targetCredits }) 
      });
      const data = await res.json();
      if (res.ok && data.semester) {
        setYears(prev => prev.map(y => y._id === yearId ? { ...y, semesters: [...y.semesters, data.semester] } : y));
        setActiveView({ type: 'semester', id: data.semester._id });
      }
    } catch (e) { console.error(e); }
  };

  const confirmDeleteYear = (yearId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Năm Học',
      message: 'Bạn có chắc xoá toàn bộ năm học này cùng các học kỳ và môn học bên trong?',
      confirmText: 'Xóa năm học',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          const res = await fetch(`/api/years/${yearId}`, { method: 'DELETE' });
          if (res.ok) {
            setYears(prev => prev.filter(y => y._id !== yearId));
            if (activeView.id === yearId || (activeView.type === 'semester' && years.find(y => y._id === yearId)?.semesters.some(s => s._id === activeView.id))) {
              setActiveView({ type: 'overview', id: null });
            }
            toast.success('Đã xóa năm học thành công!');
          } else {
            toast.error('Lỗi xóa năm học');
          }
        } catch (e) {
          console.error(e);
          toast.error('Đã xảy ra lỗi mạng');
        }
      }
    });
  };

  const confirmDeleteSemester = (yearId: string, semId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Học Kỳ',
      message: 'Xóa học kỳ này và tất cả môn học trong đó?',
      confirmText: 'Xóa học kỳ',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          const res = await fetch(`/api/semesters/${semId}`, { method: 'DELETE' });
          if (res.ok) {
            setYears(prev => prev.map(y => y._id === yearId ? { ...y, semesters: y.semesters.filter(s => s._id !== semId) } : y));
            if (activeView.id === semId) setActiveView({ type: 'year', id: yearId });
            toast.success('Đã xóa học kỳ!');
          } else {
            toast.error('Lỗi khi xóa học kỳ');
          }
        } catch (e) {
          console.error(e);
          toast.error('Đã xảy ra lỗi mạng');
        }
      }
    });
  };

  const onSubjectAdded = (yearId: string, semId: string, subject: SubjectData) => {
    setYears(prev => prev.map(y => y._id === yearId ? { 
      ...y, 
      semesters: y.semesters.map(s => s._id === semId ? { ...s, subjects: [...s.subjects, subject] } : s) 
    } : y));
  };

  const onSubjectDeleted = (yearId: string, semId: string, subjectId: string) => {
    setYears(prev => prev.map(y => y._id === yearId ? { 
      ...y, 
      semesters: y.semesters.map(s => s._id === semId ? { ...s, subjects: s.subjects.filter(sub => sub._id !== subjectId) } : s) 
    } : y));
  };

  const onSubjectUpdated = (yearId: string, semId: string, subjectId: string, updatedSubject: SubjectData) => {
    setYears(prev => prev.map(y => y._id === yearId ? { 
      ...y, 
      semesters: y.semesters.map(s => s._id === semId ? { ...s, subjects: s.subjects.map(sub => sub._id === subjectId ? updatedSubject : sub) } : s) 
    } : y));
  };


  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header userName="..." onToggleSidebar={() => {}} />
        <div className="dashboard-body"><div className="dashboard-main"><div className="container">
          <div className="empty-state">
            <div className="empty-icon"><HourglassEmptyIcon sx={{ fontSize: 48, color: '#d1d5db' }} /></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div></div></div>
      </div>
    );
  }

  const renderContent = () => {
    // Removed duplicated overview block

    if (activeView.type === 'semester' && activeView.id) {
      const foundSem = years.flatMap(y => y.semesters).find(s => s._id === activeView.id) || null;
      const parentYear = years.find(y => y.semesters.some(s => s._id === activeView.id)) || null;
      
      if (foundSem && parentYear) {
        return (
          <SemesterCard key={foundSem._id} semesterId={foundSem._id}
            semesterName={`${parentYear.name} - ${foundSem.name}`} targetCredits={foundSem.targetCredits} subjects={foundSem.subjects}
            onSubjectAdded={(sub) => onSubjectAdded(parentYear!._id, foundSem!._id, sub)}
            onSubjectDeleted={(subId) => onSubjectDeleted(parentYear!._id, foundSem!._id, subId)}
            onSubjectUpdated={(subId, updated) => onSubjectUpdated(parentYear!._id, foundSem!._id, subId, updated)}
            onDeleteSemester={() => confirmDeleteSemester(parentYear!._id, foundSem!._id)} />
        );
      }
    }

    if (activeView.type === 'year' && activeView.id) {
      const year = years.find(y => y._id === activeView.id);
      if (year) {
        const yearGpa = calculateGpaFromSemesters(year.semesters);
        
        let formula10 = '';
        let formula4 = '';
        
        const validSemesters = year.semesters.filter(sem => {
          let semSumC = 0;
          sem.subjects.forEach(s => semSumC += s.credits);
          return semSumC === sem.targetCredits && sem.targetCredits > 0;
        });

        if (validSemesters.length > 0) {
          const parts10: string[] = [];
          const parts4: string[] = [];
          
          validSemesters.forEach(sem => {
            sem.subjects.forEach(s => {
              parts10.push(`${round2(s.grade10)}×${s.credits}`);
              parts4.push(`${s.grade4}×${s.credits}`);
            });
          });
          
          if (parts10.length > 0) {
            formula10 = `(${parts10.join(' + ')}) ÷ ${yearGpa.totalC} = <strong>${yearGpa.g10}</strong>`;
            formula4 = `(${parts4.join(' + ')}) ÷ ${yearGpa.totalC} = <strong>${yearGpa.g4}</strong>`;
          }
        }

        return (
           <>
              <div className="gpa-summary">
                <div className="gpa-item">
                  <div className="gpa-label">Năm học</div>
                  <div className="gpa-value" style={{ fontSize: '1.25rem' }}>{year.name}</div>
                </div>
                <div className="gpa-item">
                  <div className="gpa-label">Số Học kỳ</div>
                  <div className="gpa-value large">{year.semesters.length}</div>
                </div>
                <div className="gpa-item">
                  <div className="gpa-label">GPA (Hệ 10)</div>
                  <div className="gpa-value large">{yearGpa.g10}</div>
                </div>
                <div className="gpa-item">
                  <div className="gpa-label">GPA (Hệ 4)</div>
                  <div className="gpa-value large">{yearGpa.g4}</div>
                </div>
              </div>

              {formula10 && (
                <div className="info-box" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', fontSize: '14px' }}>
                  <div style={{ marginBottom: 6 }}><strong>Chi tiết tính GPA Năm học:</strong></div>
                  <div style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: `<strong>Hệ 10:</strong> ${formula10}` }} />
                  <div dangerouslySetInnerHTML={{ __html: `<strong>Hệ 4:</strong> ${formula4}` }} />
                  <span className="text-[11.5px] text-gray-500 mt-2 block italic" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
                    * Chỉ các Học kỳ đã <strong>hoàn thành đủ số tín chỉ dự kiến</strong> mới được hệ thống tính gộp vào GPA chung.
                  </span>
                </div>
              )}

              {year.semesters.length === 0 ? (
                <div className="card"><div className="card-body">
                  <div className="empty-state">
                    <div className="empty-icon"><SchoolIcon sx={{ fontSize: 48, color: '#d1d5db' }} /></div>
                    <p>Chưa có học kỳ nào trong năm này.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setPreselectedYearId(year._id); setShowAddSemesterModal(true); }}>
                      <AddIcon sx={{ fontSize: 16 }} /> Tạo học kỳ
                    </button>
                  </div>
                </div></div>
              ) : (
                <div className="semesters-overview">
                  {year.semesters.map((sem) => {
                    let semSumC = 0, semSum10 = 0, semSum4 = 0;
                    sem.subjects.forEach(s => { semSumC += s.credits; semSum10 += s.grade10 * s.credits; semSum4 += s.grade4 * s.credits; });
                    const isComplete = semSumC === sem.targetCredits && sem.targetCredits > 0;
                    const g10 = isComplete ? round2(semSum10 / semSumC) : '—';
                    const g4 = isComplete ? round2(semSum4 / semSumC) : '—';
                    
                    return (
                      <div className="semester-overview-card" key={sem._id} onClick={() => setActiveView({ type: 'semester', id: sem._id })}>
                        <div className="semester-overview-header">
                          <h3><MenuBookIcon sx={{ fontSize: 16 }} /> {sem.name}</h3>
                          <span className="semester-overview-count">{sem.subjects.length} môn • {semSumC}/{sem.targetCredits} TC</span>
                        </div>
                        <div className="semester-overview-grades">
                          <div className="semester-overview-grade"><span className="grade-label">Hệ 10</span><span className="grade-value">{g10}</span></div>
                          <div className="semester-overview-grade"><span className="grade-label">Hệ 4</span><span className="grade-value">{g4}</span></div>
                        </div>
                        {!isComplete && (
                          <div className="text-[10px] text-orange-600 mt-3 font-semibold bg-orange-50 p-1.5 rounded text-center">
                            ⚠️ Tín chỉ không khớp ({semSumC}/{sem.targetCredits})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="year-actions">
                <button className="btn btn-primary" onClick={() => { setPreselectedYearId(year._id); setShowAddSemesterModal(true); }}>
                  <AddIcon sx={{ fontSize: 18 }} /> Thêm học kỳ mới
                </button>
                {years.length > 0 && (
                  <button className="btn btn-danger" onClick={() => confirmDeleteYear(year._id)}>
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} /> Xóa toàn bộ năm học này
                  </button>
                )}
              </div>
           </>
        );
      }
    }

    // Default Overview
    let overallFormula10 = '';
    let overallFormula4 = '';
    
    const allSemesters = years.flatMap(y => y.semesters);
    const validSemesters = allSemesters.filter(sem => {
      let semSumC = 0;
      sem.subjects.forEach(s => semSumC += s.credits);
      return semSumC === sem.targetCredits && sem.targetCredits > 0;
    });

    if (validSemesters.length > 0) {
      const parts10: string[] = [];
      const parts4: string[] = [];
      
      validSemesters.forEach(sem => {
        sem.subjects.forEach(s => {
          parts10.push(`${round2(s.grade10)}×${s.credits}`);
          parts4.push(`${s.grade4}×${s.credits}`);
        });
      });
      
      if (parts10.length > 0) {
        overallFormula10 = `(${parts10.join(' + ')}) ÷ ${overallGpa.totalC} = <strong>${overallGpa.g10}</strong>`;
        overallFormula4 = `(${parts4.join(' + ')}) ÷ ${overallGpa.totalC} = <strong>${overallGpa.g4}</strong>`;
      }
    }

    return (
      <>
        <div className="gpa-summary">
          <div className="gpa-item">
            <div className="gpa-label">Tổng số</div>
            <div className="gpa-value large">{years.length}</div>
            <div className="gpa-sub">năm học</div>
          </div>
          <div className="gpa-item">
            <div className="gpa-label">GPA Tích lũy (Hệ 10)</div>
            <div className="gpa-value large">{overallGpa.g10}</div>
            <div className="gpa-sub">toàn khoá</div>
          </div>
          <div className="gpa-item">
            <div className="gpa-label">GPA Tích lũy (Hệ 4)</div>
            <div className="gpa-value large">{overallGpa.g4}</div>
            <div className="gpa-sub">toàn khoá</div>
          </div>
        </div>

        {overallFormula10 && (
          <div className="info-box" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', fontSize: '14px' }}>
            <div style={{ marginBottom: 6 }}><strong>Chi tiết tính GPA Toàn khoá:</strong></div>
            <div style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: `<strong>Hệ 10:</strong> ${overallFormula10}` }} />
            <div dangerouslySetInnerHTML={{ __html: `<strong>Hệ 4:</strong> ${overallFormula4}` }} />
            <span className="text-[11.5px] text-gray-500 mt-2 block italic" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
              * Chỉ các Học kỳ đã <strong>hoàn thành đủ số tín chỉ dự kiến</strong> mới được hệ thống tính gộp vào GPA chung.
            </span>
          </div>
        )}

        {years.length === 0 ? (
          <div className="card"><div className="card-body">
            <div className="empty-state">
              <div className="empty-icon"><SchoolIcon sx={{ fontSize: 48, color: '#d1d5db' }} /></div>
              <p>Chưa có dữ liệu. Hãy tạo năm học đầu tiên!</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddYearModal(true)}>
                <AddIcon sx={{ fontSize: 16 }} /> Tạo năm học
              </button>
            </div>
          </div></div>
        ) : (
          <div className="card">
            <div className="card-header"><h2>Tổng Quan Từng Năm</h2></div>
            <div className="card-body" style={{ padding: 0 }}>
              {/* Desktop: Table */}
              <div className="table-scroll-wrapper">
                <table className="subjects-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Năm học</th>
                      <th style={{ textAlign: 'center' }}>Số Kỳ</th>
                      <th style={{ textAlign: 'center' }}>Tổng TC</th>
                      <th style={{ textAlign: 'center' }}>GPA (10)</th>
                      <th style={{ textAlign: 'center' }}>GPA (4)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {years.map(y => {
                      const g = calculateGpaFromSemesters(y.semesters);
                      return (
                        <tr key={y._id} onClick={() => setActiveView({ type: 'year', id: y._id })} style={{ cursor: 'pointer' }}>
                          <td><strong className="text-gray-900">{y.name}</strong></td>
                          <td style={{ textAlign: 'center' }}>{y.semesters.length}</td>
                          <td style={{ textAlign: 'center' }}>{g.totalC}</td>
                          <td style={{ textAlign: 'center' }}><strong>{g.g10}</strong></td>
                          <td style={{ textAlign: 'center' }}><strong>{g.g4}</strong></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Year Cards */}
              <div className="subject-card-list">
                {years.map(y => {
                  const g = calculateGpaFromSemesters(y.semesters);
                  return (
                    <div key={y._id} className="subject-card" onClick={() => setActiveView({ type: 'year', id: y._id })} style={{ cursor: 'pointer' }}>
                      <div className="subject-card-header">
                        <span className="subject-card-name">{y.name}</span>
                        <span className="badge badge-type">{y.semesters.length} kỳ</span>
                      </div>
                      <div className="subject-card-grades" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="subject-card-grade"><span className="label">Tín chỉ</span><span className="value">{g.totalC}</span></div>
                        <div className="subject-card-grade"><span className="label">GPA (10)</span><span className="value">{g.g10}</span></div>
                        <div className="subject-card-grade"><span className="label">GPA (4)</span><span className="value">{g.g4}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <GradeScaleCard />
      </>
    );
  };

  return (
    <div className="dashboard-layout">
      <Header userName={userName} onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="dashboard-body">
        <Sidebar years={years} activeView={activeView}
          onSelectView={(type, id) => setActiveView({ type, id })} onAddYear={() => setShowAddYearModal(true)}
          onAddSemester={(yearId) => { setPreselectedYearId(yearId); setShowAddSemesterModal(true); }}
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
          overallGpa10={overallGpa.g10} overallGpa4={overallGpa.g4} />
        <main className="dashboard-main">
          <div className="container">
            {renderContent()}
          </div>
        </main>
      </div>
      <AddYearModal isOpen={showAddYearModal} onClose={() => setShowAddYearModal(false)} onAdd={addYear} />
      <AddSemesterModal isOpen={showAddSemesterModal} onClose={() => setShowAddSemesterModal(false)} 
        years={years} onAdd={addSemester} preselectedYearId={preselectedYearId} />
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
}
