'use client';

import { useState } from 'react';
import { SubjectData } from './Dashboard';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import EditSubjectModal from './EditSubjectModal';
import ConfirmModal from './ConfirmModal';
import toast from 'react-hot-toast';
import { round2 } from '@/lib/utils';

function to4Scale(g10: number): number {
  if (g10 >= 9.0) return 4.0; if (g10 >= 8.5) return 3.8; if (g10 >= 8.0) return 3.5;
  if (g10 >= 7.0) return 3.0; if (g10 >= 6.5) return 2.5; if (g10 >= 5.5) return 2.0;
  if (g10 >= 5.0) return 1.5; if (g10 >= 4.0) return 1.0; return 0;
}
function getLetterGrade(g10: number): string {
  if (g10 >= 9.0) return 'A+'; if (g10 >= 8.5) return 'A'; if (g10 >= 8.0) return 'B+';
  if (g10 >= 7.0) return 'B'; if (g10 >= 6.5) return 'C+'; if (g10 >= 5.5) return 'C';
  if (g10 >= 5.0) return 'D+'; if (g10 >= 4.0) return 'D'; return 'F';
}

interface GradeColumn { id: number; value: string; }
let nextId = 1;

interface SemesterCardProps {
  semesterId: string; semesterName: string; targetCredits: number; subjects: SubjectData[];
  onSubjectAdded: (subject: SubjectData) => void;
  onSubjectDeleted: (subjectId: string) => void;
  onSubjectUpdated: (subjectId: string, updatedSubject: SubjectData) => void;
  onDeleteSemester: () => void;
}

export default function SemesterCard({ semesterId, semesterName, targetCredits, subjects, onSubjectAdded, onSubjectDeleted, onSubjectUpdated, onDeleteSemester }: SemesterCardProps) {
  const [activeTab, setActiveTab] = useState<'mode1' | 'mode2'>('mode1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [m1Name, setM1Name] = useState(''); const [m1Credits, setM1Credits] = useState('');
  const [m1Grade10, setM1Grade10] = useState(''); const [m1Error, setM1Error] = useState('');

  const [m2Name, setM2Name] = useState(''); const [m2TheoryCredits, setM2TheoryCredits] = useState('');
  const [m2RegularCoeff, setM2RegularCoeff] = useState('2'); const [m2MidtermCoeff, setM2MidtermCoeff] = useState('3');
  const [m2FinalCoeff, setM2FinalCoeff] = useState('5'); const [m2HasPractice, setM2HasPractice] = useState(false);
  const [m2PracticeCredits, setM2PracticeCredits] = useState('');
  const [m2Midterm, setM2Midterm] = useState(''); const [m2Final, setM2Final] = useState('');
  const [m2Error, setM2Error] = useState('');
  const [showFormula, setShowFormula] = useState(false); const [formulaPreview, setFormulaPreview] = useState('');

  const [regularGrades, setRegularGrades] = useState<GradeColumn[]>([{ id: nextId++, value: '' }]);
  const [practiceGrades, setPracticeGrades] = useState<GradeColumn[]>([{ id: nextId++, value: '' }]);
  const [saving, setSaving] = useState(false);

  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);

  const calcGpa = () => {
    let sumC = 0, sum10 = 0, sum4 = 0;
    subjects.forEach((s) => { sumC += s.credits; sum10 += s.grade10 * s.credits; sum4 += s.grade4 * s.credits; });
    if (sumC === 0 || sumC !== targetCredits) return { g10: '—', g4: '—', currentCredits: sumC };
    return { g10: round2(sum10 / targetCredits), g4: round2(sum4 / targetCredits), currentCredits: sumC };
  };
  const gpa = calcGpa();
  const isCreditMismatch = gpa.currentCredits !== targetCredits;

  const saveSubject = async (data: { name: string; credits: number; grade10: number; grade4: number; letter: string; type: string; formula: string; rawInputs?: any; }) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/semesters/${semesterId}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (res.ok) {
        onSubjectAdded(result.subject);
        toast.success(`Thêm môn ${data.name} thành công!`);
      } else {
        console.error('Server error:', result);
        toast.error('Lỗi lưu môn học: ' + JSON.stringify(result.error || result));
      }
    } catch (e) {
      console.error(e);
      toast.error('Đã xảy ra lỗi mạng');
    } finally { setSaving(false); }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      const res = await fetch(`/api/semesters/${semesterId}/subjects/${subjectId}`, { method: 'DELETE' });
      if (res.ok) {
        onSubjectDeleted(subjectId);
        toast.success('Đã xóa môn học!');
      } else {
        toast.error('Lỗi khi xóa môn học');
      }
    } catch (e) { 
      console.error(e); 
      toast.error('Đã xảy ra lỗi mạng');
    } finally {
      setSubjectToDelete(null);
    }
  };

  const updateSubject = async (subjectId: string, data: any) => {
    try {
      const res = await fetch(`/api/semesters/${semesterId}/subjects/${subjectId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (res.ok) onSubjectUpdated(subjectId, result.subject);
    } catch (e) { console.error(e); }
  };

  const addSubjectMode1 = () => {
    const name = m1Name.trim(); const credits = parseFloat(m1Credits); const grade10 = parseFloat(m1Grade10);
    if (!name || isNaN(credits) || credits <= 0 || isNaN(grade10) || grade10 < 0 || grade10 > 10) { setM1Error('Vui lòng điền thông tin hợp lệ!'); return; }
    if (gpa.currentCredits + credits > targetCredits) { setM1Error(`Nhập quá số tín chỉ tổng! Tối đa thêm được: ${targetCredits - gpa.currentCredits} TC`); return; }
    setM1Error('');
    saveSubject({ 
      name, credits, grade10: +round2(grade10), grade4: to4Scale(grade10), letter: getLetterGrade(grade10), type: 'Nhập trực tiếp', formula: `Nhập trực tiếp: ${round2(grade10)}/10`,
      rawInputs: { mode: 'mode1', name, credits, grade10 }
    });
    setM1Name(''); setM1Credits(''); setM1Grade10('');
  };

  const addSubjectMode2 = () => {
    const name = m2Name.trim(); const rc = parseInt(m2RegularCoeff), mc = parseInt(m2MidtermCoeff), fc = parseInt(m2FinalCoeff);
    const totalCoeff = rc + mc + fc; const mid = parseFloat(m2Midterm), fin = parseFloat(m2Final);
    const rg = regularGrades.map(g => parseFloat(g.value));
    if (!name || isNaN(mid) || isNaN(fin) || rg.some(isNaN) || rg.length === 0) { setM2Error('Vui lòng điền thông tin hợp lệ!'); return; }
    const avgR = rg.reduce((a, b) => a + b, 0) / rg.length;
    const ltGrade = (avgR * rc + mid * mc + fin * fc) / totalCoeff;
    let grade10: number, credits: number, formula: string, type: string;
    if (m2HasPractice) {
      const pg = practiceGrades.map(g => parseFloat(g.value));
      const thc = parseFloat(m2PracticeCredits), ltc = parseFloat(m2TheoryCredits);
      if (pg.some(isNaN) || pg.length === 0 || isNaN(thc) || isNaN(ltc)) { setM2Error('Xem lại tín chỉ và điểm thực hành!'); return; }
      credits = thc + ltc; const avgP = pg.reduce((a, b) => a + b, 0) / pg.length;
      grade10 = (avgP * thc + ltGrade * ltc) / credits; type = 'LT + TH'; formula = `LT=${round2(ltGrade)}, TH=${round2(avgP)}`;
    } else {
      credits = parseFloat(m2TheoryCredits);
      if (isNaN(credits) || credits <= 0) { setM2Error('Tín chỉ lý thuyết không hợp lệ!'); return; }
      grade10 = ltGrade; type = 'Lý thuyết'; formula = `ĐTK=${round2(avgR)}, GK=${mid}, CK=${fin}`;
    }
    if (gpa.currentCredits + credits > targetCredits) { setM2Error(`Vượt tín chỉ dự kiến! Chỉ còn thiếu: ${targetCredits - gpa.currentCredits} TC`); return; }
    grade10 = Math.min(10, Math.max(0, grade10)); setM2Error('');
    saveSubject({ 
      name, credits, grade10: +round2(grade10), grade4: to4Scale(grade10), letter: getLetterGrade(grade10), type, formula,
      rawInputs: { 
        mode: 'mode2', name, theoryCredits: parseFloat(m2TheoryCredits), regularCoeff: rc, midtermCoeff: mc, finalCoeff: fc,
        hasPractice: m2HasPractice, practiceCredits: parseFloat(m2PracticeCredits),
        midterm: mid, final: fin, regularGrades: rg, practiceGrades: practiceGrades.map(g => parseFloat(g.value))
      }
    });
    setM2Name(''); setM2Midterm(''); setM2Final(''); setM2HasPractice(false); setShowFormula(false);
    setRegularGrades([{ id: nextId++, value: '' }]); setPracticeGrades([{ id: nextId++, value: '' }]);
  };

  const handlePreviewFormula = () => {
    const rc = parseInt(m2RegularCoeff), mc = parseInt(m2MidtermCoeff), fc = parseInt(m2FinalCoeff);
    const total = rc + mc + fc;
    const rg = regularGrades.map(g => parseFloat(g.value)).filter(v => !isNaN(v));
    const mid = parseFloat(m2Midterm), fin = parseFloat(m2Final);
    let formula = '';
    
    if (rg.length > 0) { const avgR = rg.reduce((a, b) => a + b, 0) / rg.length; formula += `ĐTK = (${rg.join(' + ')})\/${rg.length} = <strong>${round2(avgR)}</strong><br>`; }
    formula += `<strong>Lý thuyết:</strong> (ĐTK×${rc} + ĐGK×${mc} + ĐCK×${fc}) ÷ ${total}<br>`;
    
    let lt = NaN;
    if (!isNaN(mid) && !isNaN(fin) && rg.length > 0) {
      const avgR = rg.reduce((a, b) => a + b, 0) / rg.length;
      lt = (avgR * rc + mid * mc + fin * fc) / total;
      formula += `= (${round2(avgR)}×${rc} + ${mid}×${mc} + ${fin}×${fc}) ÷ ${total}<br>`;
      formula += `= <strong>${round2(lt)}</strong><br>`;
    }

    if (m2HasPractice) {
      const pg = practiceGrades.map(g => parseFloat(g.value)).filter(v => !isNaN(v));
      const thc = parseFloat(m2PracticeCredits), ltc = parseFloat(m2TheoryCredits);
      let avgP = NaN;
      if (pg.length > 0) {
        avgP = pg.reduce((a, b) => a + b, 0) / pg.length;
        formula += `<strong>Thực hành:</strong> (${pg.join(' + ')})\/${pg.length} = <strong>${round2(avgP)}</strong><br>`;
      }
      
      if (!isNaN(lt) && !isNaN(avgP) && !isNaN(thc) && !isNaN(ltc)) {
        const totalC = ltc + thc;
        const finalGrade = (lt * ltc + avgP * thc) / totalC;
        formula += `<strong>Tổng kết:</strong> (Lý thuyết×${ltc} + Thực hành×${thc}) ÷ ${totalC}<br>`;
        formula += `= (${round2(lt)}×${ltc} + ${round2(avgP)}×${thc}) ÷ ${totalC}<br>`;
        formula += `= <strong><span style="font-size: 1.1em">${round2(finalGrade)} / 10</span></strong>`;
      }
    } else if (!isNaN(lt)) {
       formula += `<br><strong>Tổng kết: <span style="font-size: 1.1em">${round2(lt)} / 10</span></strong>`;
    }

    setFormulaPreview(formula || 'Nhập các điểm để xem công thức...'); setShowFormula(true);
  };

  return (
    <div>
      {/* WARNING BANNER */}
      {isCreditMismatch && (
        <div className="bg-orange-50 border-l-4 border-orange-500 overflow-hidden rounded-r-lg p-4 mb-5 flex items-start gap-3 shadow-sm transition-all">
          <WarningAmberIcon sx={{ color: '#f97316', mt: 0.2 }} />
          <div>
            <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-1">Cảnh báo tín chỉ không khớp</h4>
            <p className="text-sm text-orange-900">
              Tổng số tín chỉ các môn học bạn đã nhập (<strong>{gpa.currentCredits}</strong>) không khớp với số tín chỉ dự kiến của hệ thống đăng ký cho kỳ này (<strong>{targetCredits}</strong>). 
              {gpa.currentCredits > targetCredits ? ' Vui lòng kiểm tra lại coi chừng nhập dư.' : ' Vui lòng nhập thêm môn hoặc kiểm tra lại đăng ký.'}
            </p>
          </div>
        </div>
      )}

      {/* Semester GPA Summary */}
      <div className="gpa-summary semester-gpa">
        <div className="gpa-item">
          <div className="gpa-label">Học kỳ</div>
          <div className="gpa-value" style={{ fontSize: '1.1rem' }}>{semesterName}</div>
        </div>
        <div className="gpa-item">
          <div className="gpa-label">Tín chỉ (Hiệu / Dự kiến)</div>
          <div className={`gpa-value large ${isCreditMismatch ? 'text-orange-400' : 'text-green-400'}`}>
            {gpa.currentCredits} <span className="text-xl text-gray-400">/ {targetCredits}</span>
          </div>
          <div className="gpa-sub">{subjects.length} môn</div>
        </div>
        <div className="gpa-item">
          <div className="gpa-label">Điểm TB (Hệ 10)</div>
          <div className="gpa-value large">{gpa.g10}</div>
        </div>
        <div className="gpa-item">
          <div className="gpa-label">GPA (Hệ 4)</div>
          <div className="gpa-value large">{gpa.g4}</div>
        </div>
      </div>

      {/* Add Subject */}
      <div className="card">
        <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setShowAddForm(!showAddForm)}>
          <div className="icon"><AddIcon sx={{ fontSize: 18, transform: showAddForm ? 'rotate(45deg)' : 'none', transition: '0.2s' }} /></div>
          <h2>Thêm Môn Học</h2>
        </div>
        {showAddForm && (
          <div className="card-body">
          {gpa.currentCredits >= targetCredits ? (
            <div className="empty-state" style={{ minHeight: '120px', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', margin: '0 0 1rem 0' }}>
              <div className="empty-icon px-3 py-1 bg-green-100 rounded-full mb-3" style={{ display: 'inline-block' }}><span style={{fontSize:24, color:'#10b981'}}>✓</span></div>
              <p style={{ color: '#059669', fontWeight: 600, fontSize: '15px' }}>Đã hoàn tất nhập điểm ({targetCredits}/{targetCredits} TC)</p>
              <p className="text-gray-500 text-sm mt-1">Học kỳ đã đủ tín chỉ dự kiến. Bạn không thể thêm môn mới nữa.</p>
            </div>
          ) : (
            <>
              <div className="tabs">
                <button className={`tab-btn ${activeTab === 'mode1' ? 'active' : ''}`} onClick={() => setActiveTab('mode1')}>Nhập điểm hệ 10</button>
                <button className={`tab-btn ${activeTab === 'mode2' ? 'active' : ''}`} onClick={() => setActiveTab('mode2')}>Tính từ cột điểm</button>
              </div>

          {/* MODE 1 */}
          <div className={`tab-panel ${activeTab === 'mode1' ? 'active' : ''}`}>
            <div className="form-grid three">
              <div className="form-group"><label>Tên môn học</label><input type="text" placeholder="VD: Giải tích 1" value={m1Name} onChange={e => setM1Name(e.target.value)} /></div>
              <div className="form-group"><label>Số tín chỉ</label><input type="number" placeholder="3" min={1} max={10} value={m1Credits} onChange={e => setM1Credits(e.target.value)} /></div>
              <div className="form-group"><label>Điểm hệ 10</label><input type="number" placeholder="8.5" min={0} max={10} step={0.1} value={m1Grade10} onChange={e => setM1Grade10(e.target.value)} /></div>
            </div>
            <span className={`error-msg ${m1Error ? 'show' : ''}`}>{m1Error}</span>
            <div className="btn-row"><button className="btn btn-primary" onClick={addSubjectMode1} disabled={saving}><SaveIcon sx={{ fontSize: 16 }} /> {saving ? 'Đang lưu...' : 'Lưu môn học'}</button></div>
          </div>

          {/* MODE 2 */}
          <div className={`tab-panel ${activeTab === 'mode2' ? 'active' : ''}`}>
            {/* Mode 2 Content identical */}
            <div className="form-grid three" style={{ marginBottom: 14 }}>
              <div className="form-group"><label>Tên môn học</label><input type="text" placeholder="VD: Lập trình C" value={m2Name} onChange={e => setM2Name(e.target.value)} /></div>
              <div className="form-group"><label>{m2HasPractice ? 'TC lý thuyết' : 'Số tín chỉ'}</label><input type="number" placeholder="3" min={1} max={10} value={m2TheoryCredits} onChange={e => setM2TheoryCredits(e.target.value)} /></div>
              <div className="form-group"><label>Hệ số TK</label><select value={m2RegularCoeff} onChange={e => setM2RegularCoeff(e.target.value)}><option value="2">Hệ số 2</option><option value="3">Hệ số 3</option><option value="1">Hệ số 1</option></select></div>
            </div>
            <div className="form-grid" style={{ marginBottom: 14 }}>
              <div className="form-group"><label>Hệ số GK</label><select value={m2MidtermCoeff} onChange={e => setM2MidtermCoeff(e.target.value)}><option value="3">Hệ số 3</option><option value="2">Hệ số 2</option><option value="4">Hệ số 4</option></select></div>
              <div className="form-group"><label>Hệ số CK</label><select value={m2FinalCoeff} onChange={e => setM2FinalCoeff(e.target.value)}><option value="5">Hệ số 5</option><option value="4">Hệ số 4</option><option value="6">Hệ số 6</option></select></div>
            </div>

            <label className="practice-toggle">
              <input type="checkbox" checked={m2HasPractice} onChange={e => setM2HasPractice(e.target.checked)} />
              <span>Môn có thực hành</span>
            </label>

            {m2HasPractice && (
              <div className="practice-section">
                <div className="practice-section-title">Phần thực hành</div>
                <div className="form-grid" style={{ marginBottom: 12 }}>
                  <div className="form-group"><label>TC thực hành</label><input type="number" placeholder="1" min={1} max={5} value={m2PracticeCredits} onChange={e => setM2PracticeCredits(e.target.value)} /></div>
                  <div></div>
                </div>
                <div className="grades-group">
                  <div className="grades-label"><span>Điểm thực hành</span></div>
                  <div className="grades-row">
                    {practiceGrades.map((g, idx) => (
                      <div key={g.id} style={{ display: 'contents' }}>
                        <div className="grade-input-wrap"><span>TH {idx + 1}</span><input type="number" placeholder="0" min={0} max={10} step={0.1} value={g.value} onChange={e => setPracticeGrades(prev => prev.map(x => x.id === g.id ? { ...x, value: e.target.value } : x))} /></div>
                        {idx > 0 && <button className="remove-grade-btn" onClick={() => setPracticeGrades(prev => prev.filter(x => x.id !== g.id))}><RemoveIcon sx={{ fontSize: 14 }} /></button>}
                      </div>
                    ))}
                    <button className="add-grade-btn" onClick={() => setPracticeGrades(prev => [...prev, { id: nextId++, value: '' }])}><AddIcon sx={{ fontSize: 16 }} /></button>
                  </div>
                </div>
              </div>
            )}

            <div className="grades-group">
              <div className="grades-label"><span>Điểm thường kỳ</span></div>
              <div className="grades-row">
                {regularGrades.map((g, idx) => (
                  <div key={g.id} style={{ display: 'contents' }}>
                    <div className="grade-input-wrap"><span>TK {idx + 1}</span><input type="number" placeholder="0" min={0} max={10} step={0.1} value={g.value} onChange={e => setRegularGrades(prev => prev.map(x => x.id === g.id ? { ...x, value: e.target.value } : x))} /></div>
                    {idx > 0 && <button className="remove-grade-btn" onClick={() => setRegularGrades(prev => prev.filter(x => x.id !== g.id))}><RemoveIcon sx={{ fontSize: 14 }} /></button>}
                  </div>
                ))}
                <button className="add-grade-btn" onClick={() => setRegularGrades(prev => [...prev, { id: nextId++, value: '' }])}><AddIcon sx={{ fontSize: 16 }} /></button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group"><label>Điểm giữa kỳ</label><input type="number" placeholder="0" min={0} max={10} step={0.1} value={m2Midterm} onChange={e => setM2Midterm(e.target.value)} /></div>
              <div className="form-group"><label>Điểm cuối kỳ</label><input type="number" placeholder="0" min={0} max={10} step={0.1} value={m2Final} onChange={e => setM2Final(e.target.value)} /></div>
            </div>

            {showFormula && <div className="info-box" style={{ marginTop: 14 }} dangerouslySetInnerHTML={{ __html: formulaPreview }} />}
            <span className={`error-msg ${m2Error ? 'show' : ''}`}>{m2Error}</span>
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={handlePreviewFormula}><CalculateIcon sx={{ fontSize: 16 }} /> Tính điểm</button>
              <button className="btn btn-primary" onClick={addSubjectMode2} disabled={saving}><SaveIcon sx={{ fontSize: 16 }} /> {saving ? 'Đang xử lý...' : 'Lưu môn học'}</button>
            </div>
          </div>
          </>
          )}
        </div>
        )}
      </div>

      {/* Subjects Table */}
      <div className="card">
        <div className="card-header">
          <div className="icon"><ListAltIcon sx={{ fontSize: 18 }} /></div>
          <h2>Danh Sách Môn Học</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><ListAltIcon sx={{ fontSize: 48, color: '#d1d5db' }} /></div>
              <p>Chưa có môn học. Thêm môn ở phía trên!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="subjects-table">
                <thead><tr>
                  <th style={{ minWidth: 160 }}>Tên môn</th><th style={{ textAlign: 'center' }}>TC</th>
                  <th style={{ textAlign: 'center' }}>Điểm /10</th><th style={{ textAlign: 'center' }}>Điểm /4</th>
                  <th style={{ textAlign: 'center' }}>Chữ</th><th style={{ textAlign: 'center' }}>Loại</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Tác vụ</th>
                </tr></thead>
                <tbody>
                  {subjects.map((s) => {
                    const isFail = s.grade10 < 4.0;
                    return (
                      <tr key={s._id} className="subject-row">
                        <td><strong className="text-gray-900">{s.name}</strong></td>
                        <td style={{ textAlign: 'center' }}>{s.credits}</td>
                        <td style={{ textAlign: 'center' }}><span className={`badge ${isFail ? 'badge-fail' : 'badge-grade-10'}`}>{round2(s.grade10)}</span></td>
                        <td style={{ textAlign: 'center' }}><strong>{s.grade4}</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={`badge badge-letter-${s.letter.charAt(0)}`}>{s.letter}</span></td>
                        <td style={{ textAlign: 'center' }}><span className="badge badge-type">{s.type}</span></td>
                        <td style={{ textAlign: 'center', padding: '12px 6px' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', marginRight: 4 }} title="Sửa/Xem" onClick={() => setEditingSubject(s)}><EditIcon sx={{ fontSize: 16 }} /></button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px' }} title="Xoá" onClick={() => setSubjectToDelete(s._id)}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px' }} onClick={onDeleteSemester}>
          <DeleteIcon sx={{ fontSize: 18, marginRight: 1 }} /> Xóa toàn bộ học kỳ này
        </button>
      </div>

      <EditSubjectModal 
        isOpen={!!editingSubject} 
        onClose={() => setEditingSubject(null)} 
        subject={editingSubject} 
        onUpdate={updateSubject} 
        availableCredits={editingSubject ? targetCredits - (gpa.currentCredits - editingSubject.credits) : 0} 
      />

      <ConfirmModal
        isOpen={!!subjectToDelete}
        title="Xoá môn học"
        message="Bạn có chắc chắn muốn xoá môn học này không? Hệ số GPA tích lũy sẽ bị thay đổi."
        confirmText="Xoá môn học"
        onConfirm={() => subjectToDelete && deleteSubject(subjectToDelete)}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
}
