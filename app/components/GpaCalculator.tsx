'use client';

import { useState, useCallback } from 'react';

/* ─────────── Types ─────────── */
interface Subject {
  name: string;
  credits: number;
  grade10: number;
  grade4: number;
  letter: string;
  type: string;
  formula: string;
}

interface GradeColumn {
  id: number;
  value: string;
}

/* ─────────── Helpers ─────────── */
function to4Scale(g10: number): number {
  if (g10 >= 9.0) return 4.0;
  if (g10 >= 8.5) return 3.8;
  if (g10 >= 8.0) return 3.5;
  if (g10 >= 7.0) return 3.0;
  if (g10 >= 6.5) return 2.5;
  if (g10 >= 5.5) return 2.0;
  if (g10 >= 5.0) return 1.5;
  if (g10 >= 4.0) return 1.0;
  return 0;
}

function getLetterGrade(g10: number): string {
  if (g10 >= 9.0) return 'A+';
  if (g10 >= 8.5) return 'A';
  if (g10 >= 8.0) return 'B+';
  if (g10 >= 7.0) return 'B';
  if (g10 >= 6.5) return 'C+';
  if (g10 >= 5.5) return 'C';
  if (g10 >= 5.0) return 'D+';
  if (g10 >= 4.0) return 'D';
  return 'F';
}

/* ─────────── Grade Scale Data ─────────── */
const GRADE_SCALE = [
  { range: '≥ 9.0', letter: 'A+', g4: '4.0' },
  { range: '8.5 – 8.9', letter: 'A', g4: '3.8' },
  { range: '8.0 – 8.4', letter: 'B+', g4: '3.5' },
  { range: '7.0 – 7.9', letter: 'B', g4: '3.0' },
  { range: '6.5 – 6.9', letter: 'C+', g4: '2.5' },
  { range: '5.5 – 6.4', letter: 'C', g4: '2.0' },
  { range: '5.0 – 5.4', letter: 'D+', g4: '1.5' },
  { range: '4.0 – 4.9', letter: 'D', g4: '1.0' },
  { range: '< 4.0', letter: 'F', g4: '0' },
];

/* ─────────── Component ─────────── */
let nextId = 1;

export default function GpaCalculator() {
  // Subjects list
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'mode1' | 'mode2'>('mode1');

  // Mode 1 fields
  const [m1Name, setM1Name] = useState('');
  const [m1Credits, setM1Credits] = useState('');
  const [m1Grade10, setM1Grade10] = useState('');
  const [m1Error, setM1Error] = useState(false);

  // Mode 2 fields
  const [m2Name, setM2Name] = useState('');
  const [m2TheoryCredits, setM2TheoryCredits] = useState('');
  const [m2RegularCoeff, setM2RegularCoeff] = useState('2');
  const [m2MidtermCoeff, setM2MidtermCoeff] = useState('3');
  const [m2FinalCoeff, setM2FinalCoeff] = useState('5');
  const [m2HasPractice, setM2HasPractice] = useState(false);
  const [m2PracticeCredits, setM2PracticeCredits] = useState('');
  const [m2Midterm, setM2Midterm] = useState('');
  const [m2Final, setM2Final] = useState('');
  const [m2Error, setM2Error] = useState(false);
  const [formulaPreview, setFormulaPreview] = useState('');
  const [showFormula, setShowFormula] = useState(false);

  // Grade columns
  const [regularGrades, setRegularGrades] = useState<GradeColumn[]>([
    { id: nextId++, value: '' },
  ]);
  const [practiceGrades, setPracticeGrades] = useState<GradeColumn[]>([
    { id: nextId++, value: '' },
  ]);

  /* ─── GPA Calculation ─── */
  const calcGPA = useCallback(
    (subs: Subject[]) => {
      if (subs.length === 0)
        return { total: 0, avg10: '—', avg4: '—' };
      let sumCredits = 0,
        sum10 = 0,
        sum4 = 0;
      subs.forEach((s) => {
        sumCredits += s.credits;
        sum10 += s.grade10 * s.credits;
        sum4 += s.grade4 * s.credits;
      });
      return {
        total: subs.length,
        avg10: (sum10 / sumCredits).toFixed(2),
        avg4: (sum4 / sumCredits).toFixed(2),
      };
    },
    [],
  );

  const gpa = calcGPA(subjects);

  /* ─── Grade column helpers ─── */
  const addRegularGrade = () => {
    setRegularGrades((prev) => [...prev, { id: nextId++, value: '' }]);
  };
  const removeRegularGrade = (id: number) => {
    setRegularGrades((prev) => prev.filter((g) => g.id !== id));
  };
  const updateRegularGrade = (id: number, value: string) => {
    setRegularGrades((prev) =>
      prev.map((g) => (g.id === id ? { ...g, value } : g)),
    );
  };

  const addPracticeGrade = () => {
    setPracticeGrades((prev) => [...prev, { id: nextId++, value: '' }]);
  };
  const removePracticeGrade = (id: number) => {
    setPracticeGrades((prev) => prev.filter((g) => g.id !== id));
  };
  const updatePracticeGrade = (id: number, value: string) => {
    setPracticeGrades((prev) =>
      prev.map((g) => (g.id === id ? { ...g, value } : g)),
    );
  };

  /* ─── Mode 1: Add subject ─── */
  const addSubjectMode1 = () => {
    const name = m1Name.trim();
    const credits = parseFloat(m1Credits);
    const grade10 = parseFloat(m1Grade10);

    if (
      !name ||
      isNaN(credits) ||
      credits <= 0 ||
      isNaN(grade10) ||
      grade10 < 0 ||
      grade10 > 10
    ) {
      setM1Error(true);
      return;
    }
    setM1Error(false);

    const grade4 = to4Scale(grade10);
    setSubjects((prev) => [
      ...prev,
      {
        name,
        credits,
        grade10: +grade10.toFixed(2),
        grade4,
        letter: getLetterGrade(grade10),
        type: 'Nhập trực tiếp',
        formula: `Nhập trực tiếp: ${grade10.toFixed(2)}/10`,
      },
    ]);

    setM1Name('');
    setM1Credits('');
    setM1Grade10('');
  };

  /* ─── Mode 2: Preview formula ─── */
  const handlePreviewFormula = () => {
    const rc = parseInt(m2RegularCoeff);
    const mc = parseInt(m2MidtermCoeff);
    const fc = parseInt(m2FinalCoeff);
    const total = rc + mc + fc;
    const rg = regularGrades
      .map((g) => parseFloat(g.value))
      .filter((v) => !isNaN(v));
    const mid = parseFloat(m2Midterm);
    const fin = parseFloat(m2Final);

    let formula = '';
    if (rg.length > 0) {
      const avgR = rg.reduce((a, b) => a + b, 0) / rg.length;
      const rgStr = rg.join('+');
      formula += `ĐTK = (${rgStr})/${rg.length} = <strong>${avgR.toFixed(2)}</strong><br>`;
    }

    const rcoeffText = `(ĐTK×${rc} + ĐGK×${mc} + ĐCK×${fc}) ÷ ${total}`;
    formula += `<strong>Công thức LT:</strong> ${rcoeffText}<br>`;

    if (!isNaN(mid) && !isNaN(fin) && rg.length > 0) {
      const avgR = rg.reduce((a, b) => a + b, 0) / rg.length;
      const lt = (avgR * rc + mid * mc + fin * fc) / total;
      formula += `= (${avgR.toFixed(2)}×${rc} + ${mid}×${mc} + ${fin}×${fc}) ÷ ${total} = <strong>${lt.toFixed(2)}</strong><br>`;
      if (m2HasPractice) {
        const pg = practiceGrades
          .map((g) => parseFloat(g.value))
          .filter((v) => !isNaN(v));
        const thc = parseFloat(m2PracticeCredits);
        const ltc = parseFloat(m2TheoryCredits);
        if (pg.length > 0 && !isNaN(thc) && !isNaN(ltc)) {
          const avgP = pg.reduce((a, b) => a + b, 0) / pg.length;
          const final10 = (avgP * thc + lt * ltc) / (thc + ltc);
          formula += `<strong>Điểm cuối (thực hành + LT):</strong> (${avgP.toFixed(2)}×${thc} + ${lt.toFixed(2)}×${ltc}) ÷ ${thc + ltc} = <strong>${final10.toFixed(2)}</strong>`;
        }
      }
    }

    setFormulaPreview(formula || 'Nhập các điểm để xem công thức...');
    setShowFormula(true);
  };

  /* ─── Mode 2: Add subject ─── */
  const addSubjectMode2 = () => {
    const name = m2Name.trim();
    const rc = parseInt(m2RegularCoeff);
    const mc = parseInt(m2MidtermCoeff);
    const fc = parseInt(m2FinalCoeff);
    const totalCoeff = rc + mc + fc;
    const mid = parseFloat(m2Midterm);
    const fin = parseFloat(m2Final);
    const rg = regularGrades.map((g) => parseFloat(g.value));

    if (
      !name ||
      isNaN(mid) ||
      isNaN(fin) ||
      rg.some(isNaN) ||
      rg.length === 0
    ) {
      setM2Error(true);
      return;
    }

    const avgR = rg.reduce((a, b) => a + b, 0) / rg.length;
    const ltGrade = (avgR * rc + mid * mc + fin * fc) / totalCoeff;

    let grade10: number;
    let credits: number;
    let formula: string;
    let type: string;

    if (m2HasPractice) {
      const pg = practiceGrades.map((g) => parseFloat(g.value));
      const thc = parseFloat(m2PracticeCredits);
      const ltc = parseFloat(m2TheoryCredits);
      if (
        pg.some(isNaN) ||
        pg.length === 0 ||
        isNaN(thc) ||
        isNaN(ltc)
      ) {
        setM2Error(true);
        return;
      }
      credits = thc + ltc;
      const avgP = pg.reduce((a, b) => a + b, 0) / pg.length;
      grade10 = (avgP * thc + ltGrade * ltc) / credits;
      type = 'Lý thuyết + Thực hành';
      formula = `ĐTK=(${rg.join('+')})/${rg.length}=${avgR.toFixed(2)}, LT=${ltGrade.toFixed(2)}, TH=${avgP.toFixed(2)} → (${avgP.toFixed(2)}×${thc}+${ltGrade.toFixed(2)}×${ltc})/${credits}`;
    } else {
      credits = parseFloat(m2TheoryCredits);
      if (isNaN(credits) || credits <= 0) {
        setM2Error(true);
        return;
      }
      grade10 = ltGrade;
      type = 'Lý thuyết';
      formula = `ĐTK=(${rg.join('+')})/${rg.length}=${avgR.toFixed(2)} → (${avgR.toFixed(2)}×${rc}+${mid}×${mc}+${fin}×${fc})/${totalCoeff}`;
    }

    grade10 = Math.min(10, Math.max(0, grade10));
    setM2Error(false);

    setSubjects((prev) => [
      ...prev,
      {
        name,
        credits,
        grade10: +grade10.toFixed(2),
        grade4: to4Scale(grade10),
        letter: getLetterGrade(grade10),
        type,
        formula,
      },
    ]);

    // Reset form
    setM2Name('');
    setM2Midterm('');
    setM2Final('');
    setM2HasPractice(false);
    setShowFormula(false);
    setFormulaPreview('');
    setRegularGrades([{ id: nextId++, value: '' }]);
    setPracticeGrades([{ id: nextId++, value: '' }]);
  };

  /* ─── Delete subject ─── */
  const deleteSubject = (idx: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ─────────── RENDER ─────────── */
  return (
    <>
      {/* Header */}
      <div className="page-header">
        <h1>📚 Bảng Tính Điểm GPA</h1>
        <p>Tính điểm trung bình tích lũy theo thang điểm 4 và thang điểm 10</p>
      </div>

      <div className="container">
        {/* GPA Summary */}
        <div className="gpa-summary" id="gpaSummary">
          <div className="gpa-item">
            <div className="gpa-label">Tổng số môn</div>
            <div className="gpa-value large">{gpa.total}</div>
            <div className="gpa-sub">môn học</div>
          </div>
          <div className="gpa-item">
            <div className="gpa-label">Điểm TB (Hệ 10)</div>
            <div className="gpa-value large">{gpa.avg10}</div>
            <div className="gpa-sub">thang điểm 10</div>
          </div>
          <div className="gpa-item">
            <div className="gpa-label">GPA (Hệ 4)</div>
            <div className="gpa-value large">{gpa.avg4}</div>
            <div className="gpa-sub">thang điểm 4</div>
          </div>
        </div>

        {/* ──── Add Subject Form ──── */}
        <div className="card">
          <div className="card-header">
            <div className="icon">➕</div>
            <h2>Thêm Môn Học</h2>
          </div>
          <div className="card-body">
            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'mode1' ? 'active' : ''}`}
                onClick={() => setActiveTab('mode1')}
              >
                Nhập điểm hệ 10
              </button>
              <button
                className={`tab-btn ${activeTab === 'mode2' ? 'active' : ''}`}
                onClick={() => setActiveTab('mode2')}
              >
                Tính từ các cột điểm
              </button>
            </div>

            {/* ── MODE 1 ── */}
            <div
              className={`tab-panel ${activeTab === 'mode1' ? 'active' : ''}`}
            >
              <div className="form-grid three">
                <div className="form-group">
                  <label>Tên môn học</label>
                  <input
                    type="text"
                    placeholder="VD: Giải tích 1"
                    value={m1Name}
                    onChange={(e) => setM1Name(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Số tín chỉ</label>
                  <input
                    type="number"
                    placeholder="3"
                    min={1}
                    max={10}
                    value={m1Credits}
                    onChange={(e) => setM1Credits(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Điểm hệ 10</label>
                  <input
                    type="number"
                    placeholder="8.5"
                    min={0}
                    max={10}
                    step={0.1}
                    value={m1Grade10}
                    onChange={(e) => setM1Grade10(e.target.value)}
                  />
                </div>
              </div>
              <span className={`error-msg ${m1Error ? 'show' : ''}`}>
                Vui lòng điền đầy đủ thông tin hợp lệ!
              </span>
              <div className="btn-row">
                <button className="btn btn-primary" onClick={addSubjectMode1}>
                  ✚ Thêm môn
                </button>
              </div>
            </div>

            {/* ── MODE 2 ── */}
            <div
              className={`tab-panel ${activeTab === 'mode2' ? 'active' : ''}`}
            >
              <div className="form-grid three" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label>Tên môn học</label>
                  <input
                    type="text"
                    placeholder="VD: Lập trình C"
                    value={m2Name}
                    onChange={(e) => setM2Name(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    {m2HasPractice
                      ? 'Số tín chỉ lý thuyết'
                      : 'Số tín chỉ'}
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    min={1}
                    max={10}
                    value={m2TheoryCredits}
                    onChange={(e) => setM2TheoryCredits(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hệ số thường kỳ</label>
                  <select
                    value={m2RegularCoeff}
                    onChange={(e) => setM2RegularCoeff(e.target.value)}
                  >
                    <option value="2">Hệ số 2 (20%)</option>
                    <option value="3">Hệ số 3 (30%)</option>
                    <option value="1">Hệ số 1 (10%)</option>
                  </select>
                </div>
              </div>
              <div className="form-grid" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label>Hệ số giữa kỳ</label>
                  <select
                    value={m2MidtermCoeff}
                    onChange={(e) => setM2MidtermCoeff(e.target.value)}
                  >
                    <option value="3">Hệ số 3 (30%)</option>
                    <option value="2">Hệ số 2 (20%)</option>
                    <option value="4">Hệ số 4 (40%)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hệ số cuối kỳ</label>
                  <select
                    value={m2FinalCoeff}
                    onChange={(e) => setM2FinalCoeff(e.target.value)}
                  >
                    <option value="5">Hệ số 5 (50%)</option>
                    <option value="4">Hệ số 4 (40%)</option>
                    <option value="6">Hệ số 6 (60%)</option>
                  </select>
                </div>
              </div>

              {/* Practice toggle */}
              <label className="practice-toggle">
                <input
                  type="checkbox"
                  checked={m2HasPractice}
                  onChange={(e) => setM2HasPractice(e.target.checked)}
                />
                <span>Môn có điểm thực hành</span>
              </label>

              {/* Practice section */}
              <div
                className={`practice-section ${m2HasPractice ? 'show' : ''}`}
              >
                <div className="practice-section-title">Phần thực hành</div>
                <div className="form-grid" style={{ marginBottom: 12 }}>
                  <div className="form-group">
                    <label>Số tín chỉ thực hành</label>
                    <input
                      type="number"
                      placeholder="1"
                      min={1}
                      max={5}
                      value={m2PracticeCredits}
                      onChange={(e) => setM2PracticeCredits(e.target.value)}
                    />
                  </div>
                  <div></div>
                </div>
                <div className="grades-group">
                  <div className="grades-label">
                    <span>Các cột điểm thực hành</span>
                  </div>
                  <div className="grades-row">
                    {practiceGrades.map((g, idx) => (
                      <div key={g.id} style={{ display: 'contents' }}>
                        <div className="grade-input-wrap">
                          <span>TH {idx + 1}</span>
                          <input
                            type="number"
                            placeholder="0"
                            min={0}
                            max={10}
                            step={0.1}
                            value={g.value}
                            onChange={(e) =>
                              updatePracticeGrade(g.id, e.target.value)
                            }
                          />
                        </div>
                        {idx > 0 && (
                          <button
                            className="remove-grade-btn"
                            onClick={() => removePracticeGrade(g.id)}
                          >
                            −
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      className="add-grade-btn"
                      onClick={addPracticeGrade}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Theory grades */}
              <div className="grades-group">
                <div className="grades-label">
                  <span>Các cột điểm thường kỳ (lý thuyết)</span>
                </div>
                <div className="grades-row">
                  {regularGrades.map((g, idx) => (
                    <div key={g.id} style={{ display: 'contents' }}>
                      <div className="grade-input-wrap">
                        <span>TK {idx + 1}</span>
                        <input
                          type="number"
                          placeholder="0"
                          min={0}
                          max={10}
                          step={0.1}
                          value={g.value}
                          onChange={(e) =>
                            updateRegularGrade(g.id, e.target.value)
                          }
                        />
                      </div>
                      {idx > 0 && (
                        <button
                          className="remove-grade-btn"
                          onClick={() => removeRegularGrade(g.id)}
                        >
                          −
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="add-grade-btn"
                    onClick={addRegularGrade}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Điểm giữa kỳ</label>
                  <input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={10}
                    step={0.1}
                    value={m2Midterm}
                    onChange={(e) => setM2Midterm(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Điểm cuối kỳ</label>
                  <input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={10}
                    step={0.1}
                    value={m2Final}
                    onChange={(e) => setM2Final(e.target.value)}
                  />
                </div>
              </div>

              {showFormula && (
                <div
                  className="info-box"
                  style={{ marginTop: 14 }}
                  dangerouslySetInnerHTML={{ __html: formulaPreview }}
                />
              )}

              <span className={`error-msg ${m2Error ? 'show' : ''}`}>
                Vui lòng điền đầy đủ thông tin hợp lệ!
              </span>
              <div className="btn-row">
                <button
                  className="btn btn-secondary"
                  onClick={handlePreviewFormula}
                >
                  👁 Xem công thức
                </button>
                <button
                  className="btn btn-primary"
                  onClick={addSubjectMode2}
                >
                  ✚ Thêm môn
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ──── Subjects List ──── */}
        <div className="card">
          <div className="card-header">
            <div className="icon">📋</div>
            <h2>Danh Sách Môn Học</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {subjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <p>Chưa có môn học nào. Hãy thêm môn học ở phía trên!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 200 }}>Tên môn</th>
                      <th style={{ textAlign: 'center' }}>TC</th>
                      <th style={{ textAlign: 'center' }}>Điểm /10</th>
                      <th style={{ textAlign: 'center' }}>Điểm /4</th>
                      <th style={{ textAlign: 'center' }}>Chữ</th>
                      <th style={{ textAlign: 'center' }}>Loại</th>
                      <th style={{ textAlign: 'center' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, i) => {
                      const isFail = s.grade10 < 4.0;
                      return (
                        <tr key={i}>
                          <td>
                            <strong>{s.name}</strong>
                            <br />
                            <span
                              style={{
                                fontSize: 11,
                                color: 'var(--text-light)',
                              }}
                            >
                              {s.formula}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {s.credits}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${isFail ? 'badge-fail' : 'badge-grade-10'}`}
                            >
                              {s.grade10.toFixed(2)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${isFail ? 'badge-fail' : 'badge-grade-4'}`}
                            >
                              {s.grade4.toFixed(1)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-type">
                              {s.letter}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-type">{s.type}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteSubject(i)}
                            >
                              🗑 Xóa
                            </button>
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

        {/* ──── Grade Scale Reference ──── */}
        <div className="card">
          <div className="card-header">
            <div className="icon">📊</div>
            <h2>Bảng Quy Đổi Điểm</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div>
                <div className="section-title">Thang điểm quy đổi</div>
                <div className="grade-scale-card">
                  {GRADE_SCALE.map((row, i) => (
                    <div className="grade-scale-row" key={i}>
                      <span className="g10">{row.range}</span>
                      <span className="letter">{row.letter}</span>
                      <span className="g4">{row.g4}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="section-title">Công thức tính điểm</div>
                <div className="info-box">
                  <strong>Môn lý thuyết:</strong>
                  <br />
                  Điểm = (ĐTK × Hệ số TK + ĐGK × Hệ số GK + ĐCK × Hệ số CK)
                  ÷ Tổng hệ số
                  <br />
                  <br />
                  <strong>Ví dụ:</strong> TK: 3 cột (7,8,9) hệ số 2, GK: 9 hệ
                  số 3, CK: 10 hệ số 5
                  <br />
                  = (((7+8+9)/3)×2 + 9×3 + 10×5) ÷ 10
                </div>
                <div className="info-box" style={{ marginTop: 10 }}>
                  <strong>Môn có thực hành:</strong>
                  <br />
                  Điểm = (ĐTH × TC_TH + ĐLT × TC_LT) ÷ (TC_TH + TC_LT)
                  <br />
                  <br />
                  Trong đó ĐTH = trung bình các cột thực hành, ĐLT = điểm lý
                  thuyết tính theo công thức trên
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
