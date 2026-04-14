'use client';

import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RemoveIcon from '@mui/icons-material/Remove';
import CalculateIcon from '@mui/icons-material/Calculate';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SubjectData } from './Dashboard';
import { round2 } from '@/lib/utils';

interface GradeColumn { id: number; value: string; }

// Use same scaling functions
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

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectData | null;
  onUpdate: (subjectId: string, data: any) => void;
  availableCredits: number; // targetCredits - (currentCredits - old_subject_credits)
}

let nextId = 100;

export default function EditSubjectModal({ isOpen, onClose, subject, onUpdate, availableCredits }: EditSubjectModalProps) {
  const [activeTab, setActiveTab] = useState<'mode1' | 'mode2'>('mode1');
  
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

  useEffect(() => {
    if (isOpen && subject) {
      if (subject.rawInputs) {
        // Hydrate from rawInputs
        const raw = subject.rawInputs;
        setActiveTab(raw.mode || 'mode2');
        if (raw.mode === 'mode1') {
          setM1Name(raw.name); setM1Credits(String(raw.credits)); setM1Grade10(String(raw.grade10));
        } else {
          setM2Name(raw.name); setM2TheoryCredits(String(raw.theoryCredits || raw.credits));
          setM2RegularCoeff(String(raw.regularCoeff || '2')); setM2MidtermCoeff(String(raw.midtermCoeff || '3')); setM2FinalCoeff(String(raw.finalCoeff || '5'));
          setM2Midterm(String(raw.midterm)); setM2Final(String(raw.final));
          setM2HasPractice(raw.hasPractice || false); setM2PracticeCredits(raw.practiceCredits ? String(raw.practiceCredits) : '');
          if (raw.regularGrades && Array.isArray(raw.regularGrades)) setRegularGrades(raw.regularGrades.map((v: string) => ({ id: nextId++, value: v })));
          else setRegularGrades([{ id: nextId++, value: '' }]);
          if (raw.practiceGrades && Array.isArray(raw.practiceGrades)) setPracticeGrades(raw.practiceGrades.map((v: string) => ({ id: nextId++, value: v })));
          else setPracticeGrades([{ id: nextId++, value: '' }]);
        }
      } else {
        // Fallback for old subjects lacking rawInputs
        setActiveTab('mode1');
        setM1Name(subject.name);
        setM1Credits(String(subject.credits));
        setM1Grade10(String(subject.grade10));
      }
    }
  }, [isOpen, subject]);

  if (!isOpen || !subject) return null;

  const handleUpdateMode1 = () => {
    const name = m1Name.trim(); const credits = parseFloat(m1Credits); const grade10 = parseFloat(m1Grade10);
    if (!name || isNaN(credits) || credits <= 0 || isNaN(grade10) || grade10 < 0 || grade10 > 10) { setM1Error('Vui lòng điền thông tin hợp lệ!'); return; }
    if (credits > availableCredits) { setM1Error(`Nhập quá tín chỉ! Tối đa môn này chỉ được: ${availableCredits} TC`); return; }
    setM1Error(''); setSaving(true);
    
    const rounded10 = +round2(grade10);
    const data = {
      name, credits, grade10: rounded10, grade4: to4Scale(rounded10), letter: getLetterGrade(rounded10), type: 'Nhập trực tiếp', formula: `Nhập trực tiếp: ${round2(grade10)}/10`,
      rawInputs: { mode: 'mode1', name, credits, grade10 }
    };
    onUpdate(subject._id, data);
    setSaving(false); onClose();
  };

  const handleUpdateMode2 = () => {
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
    if (credits > availableCredits) { setM2Error(`Vượt quá tín chỉ dự kiến! Chỉ có thể là: ${availableCredits} TC`); return; }
    
    grade10 = Math.min(10, Math.max(0, grade10)); setM2Error(''); setSaving(true);
    const rounded10 = +round2(grade10);
    const data = {
      name, credits, grade10: rounded10, grade4: to4Scale(rounded10), letter: getLetterGrade(rounded10), type, formula,
      rawInputs: { 
        mode: 'mode2', name, theoryCredits: parseFloat(m2TheoryCredits), regularCoeff: rc, midtermCoeff: mc, finalCoeff: fc,
        hasPractice: m2HasPractice, practiceCredits: parseFloat(m2PracticeCredits),
        midterm: mid, final: fin, regularGrades: rg, practiceGrades: practiceGrades.map(g => parseFloat(g.value))
      }
    };
    onUpdate(subject._id, data);
    setSaving(false); onClose();
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><EditIcon sx={{ fontSize: 20 }} /> Sửa Môn Học</h3>
          <button className="modal-close" onClick={onClose}><CloseIcon sx={{ fontSize: 20 }} /></button>
        </div>
        
        <div className="card-body" style={{ padding: '4px 0 0 0' }}>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'mode1' ? 'active' : ''}`} onClick={() => setActiveTab('mode1')}>Nhập điểm hệ 10</button>
            <button className={`tab-btn ${activeTab === 'mode2' ? 'active' : ''}`} onClick={() => setActiveTab('mode2')}>Tính từ cột điểm</button>
          </div>

          <div className={`tab-panel ${activeTab === 'mode1' ? 'active' : ''}`}>
            <div className="form-grid three">
              <div className="form-group"><label>Tên môn học</label><input type="text" value={m1Name} onChange={e => setM1Name(e.target.value)} /></div>
              <div className="form-group"><label>Số tín chỉ</label><input type="number" min={1} max={10} value={m1Credits} onChange={e => setM1Credits(e.target.value)} /></div>
              <div className="form-group"><label>Điểm hệ 10</label><input type="number" min={0} max={10} step={0.1} value={m1Grade10} onChange={e => setM1Grade10(e.target.value)} /></div>
            </div>
            <span className={`error-msg ${m1Error ? 'show' : ''}`}>{m1Error}</span>
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={onClose}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleUpdateMode1} disabled={saving}><SaveIcon sx={{ fontSize: 16 }} /> Cập nhật</button>
            </div>
          </div>

          <div className={`tab-panel ${activeTab === 'mode2' ? 'active' : ''}`}>
            <div className="form-grid three" style={{ marginBottom: 14 }}>
              <div className="form-group"><label>Tên môn học</label><input type="text" value={m2Name} onChange={e => setM2Name(e.target.value)} /></div>
              <div className="form-group"><label>{m2HasPractice ? 'TC lý thuyết' : 'Số tín chỉ'}</label><input type="number" min={1} max={10} value={m2TheoryCredits} onChange={e => setM2TheoryCredits(e.target.value)} /></div>
              <div className="form-group"><label>Hệ số TK</label>
                <select value={m2RegularCoeff} onChange={e => setM2RegularCoeff(e.target.value)}><option value="2">Hệ số 2</option><option value="3">Hệ số 3</option><option value="1">Hệ số 1</option></select>
              </div>
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
              <button className="btn btn-primary" onClick={handleUpdateMode2} disabled={saving}><SaveIcon sx={{ fontSize: 16 }} /> Cập nhật Môn học</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
