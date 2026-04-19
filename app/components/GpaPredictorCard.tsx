'use client';

import { useState } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { round2 } from '@/lib/utils';

function getLetterGrade(g10: number): string {
  if (g10 >= 9.0) return 'A+'; if (g10 >= 8.5) return 'A'; if (g10 >= 8.0) return 'B+';
  if (g10 >= 7.0) return 'B'; if (g10 >= 6.5) return 'C+'; if (g10 >= 5.5) return 'C';
  if (g10 >= 5.0) return 'D+'; if (g10 >= 4.0) return 'D'; return 'F';
}

function gpa4ToGpa10(g4: number): number {
  if (g4 >= 4.0) return 9.0;
  if (g4 >= 3.8) return 8.5;
  if (g4 >= 3.5) return 8.0;
  if (g4 >= 3.0) return 7.0;
  if (g4 >= 2.5) return 6.5;
  if (g4 >= 2.0) return 5.5;
  if (g4 >= 1.5) return 5.0;
  if (g4 >= 1.0) return 4.0;
  return 0;
}

function getClassification(g4: number): string {
  if (g4 >= 3.6) return 'Xuất sắc';
  if (g4 >= 3.2) return 'Giỏi';
  if (g4 >= 2.5) return 'Khá';
  if (g4 >= 2.0) return 'Trung bình';
  if (g4 >= 1.0) return 'Yếu';
  return 'Kém';
}

interface Props {
  currentGpa4: number | string;
  currentGpa10: number | string;
  totalCredits: number;
  /** Tổng gốc Σ(điểm4 × TC) chưa chia, dùng để tính chính xác */
  rawSum4: number;
  /** Tổng gốc Σ(điểm10 × TC) chưa chia */
  rawSum10: number;
}

export default function GpaPredictorCard({ currentGpa4, currentGpa10, totalCredits, rawSum4, rawSum10 }: Props) {
  const [targetGpa, setTargetGpa] = useState('');
  const [nextCredits, setNextCredits] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    neededGpa4: number;
    neededGpa10: number;
    letter: string;
    classification: string;
    isPossible: boolean;
    isAlreadyAchieved: boolean;
    formulaDetail: string;
  } | null>(null);

  const curG4 = typeof currentGpa4 === 'string' ? parseFloat(currentGpa4) : currentGpa4;
  const curG10 = typeof currentGpa10 === 'string' ? parseFloat(currentGpa10) : currentGpa10;
  const hasData = !isNaN(curG4) && totalCredits > 0;

  const calculate = () => {
    setError('');
    setResult(null);
    const target = parseFloat(targetGpa);
    const nextC = parseFloat(nextCredits);

    if (isNaN(target) || target <= 0 || target > 4) { setError('GPA mục tiêu phải từ 0.01 đến 4.0'); return; }
    if (isNaN(nextC) || nextC <= 0 || nextC > 30) { setError('Số tín chỉ phải từ 1 đến 30'); return; }

    /*
     * Cách tính GPA hệ thống:
     *   GPA = Σ(điểm_môn × TC_môn) / Σ(TC_môn)
     *   rawSum4 = Σ(điểm4_môn × TC_môn)  ← tổng gốc hiện tại
     *
     * Mục tiêu:
     *   target = (rawSum4 + neededSum4) / (totalC + nextC)
     *   → neededSum4 = target × (totalC + nextC) − rawSum4
     *   → neededGpa4 = neededSum4 / nextC
     */
    const neededSum4 = target * (totalCredits + nextC) - rawSum4;
    const neededGpa4 = neededSum4 / nextC;
    const rounded = Math.round((neededGpa4 + Number.EPSILON) * 100) / 100;

    // Tương tự cho hệ 10: tính target hệ 10 tương ứng
    const targetG10 = gpa4ToGpa10(target);
    const neededSum10 = targetG10 * (totalCredits + nextC) - rawSum10;
    const neededGpa10 = neededSum10 / nextC;
    const rounded10 = Math.round((neededGpa10 + Number.EPSILON) * 100) / 100;

    const formulaDetail = `Σ(điểm×TC) hiện tại = ${round2(rawSum4)}, Tổng TC = ${totalCredits}\n` +
      `Cần Σ(điểm×TC) kỳ sau = ${round2(target)} × (${totalCredits} + ${nextC}) − ${round2(rawSum4)} = ${round2(neededSum4)}\n` +
      `GPA kỳ sau = ${round2(neededSum4)} ÷ ${nextC} = ${round2(rounded)}`;

    if (rounded <= 0) {
      setResult({ neededGpa4: rounded, neededGpa10: rounded10, letter: '', classification: '', isPossible: true, isAlreadyAchieved: true, formulaDetail });
      return;
    }

    const letter = getLetterGrade(rounded10);
    const classification = getClassification(rounded);

    setResult({
      neededGpa4: rounded,
      neededGpa10: rounded10,
      letter,
      classification,
      isPossible: rounded <= 4.0,
      isAlreadyAchieved: false,
      formulaDetail,
    });
  };

  // Inline styles (zero CSS file changes)
  const s = {
    statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' } as React.CSSProperties,
    statBox: { background: '#f9fafb', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' as const },
    statLabel: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 600 },
    statValue: { fontSize: '20px', fontWeight: 700, color: '#111827', marginTop: '2px' },
    resultBox: (ok: boolean) => ({
      marginTop: '16px', borderRadius: '12px', padding: '20px',
      border: `1px solid ${ok ? '#a7f3d0' : '#fecaca'}`,
      background: ok ? '#ecfdf5' : '#fef2f2',
    }),
    resultHeader: (ok: boolean) => ({
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '15px', fontWeight: 700, marginBottom: '8px',
      color: ok ? '#065f46' : '#991b1b',
    }),
    resultDesc: { fontSize: '14px', color: '#4b5563', lineHeight: 1.6, marginBottom: '16px' },
    gradeCards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' },
    gradeCard: { background: '#fff', borderRadius: '10px', padding: '14px 8px', textAlign: 'center' as const, border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
    gradeLabel: { fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 600 },
    gradeValue: { fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '4px' },
    badge: (ok: boolean) => ({
      display: 'inline-block', marginTop: '6px', fontSize: '11px', fontWeight: 600,
      padding: '2px 10px', borderRadius: '999px',
      background: ok ? '#d1fae5' : '#fee2e2',
      color: ok ? '#065f46' : '#991b1b',
    }),
    formula: {
      fontSize: '12px', color: '#6b7280', background: '#fff', borderRadius: '8px',
      padding: '10px 12px', border: '1px solid #f3f4f6', lineHeight: 1.8,
      wordBreak: 'break-word' as const, whiteSpace: 'pre-line' as const,
    },
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="icon"><TrendingUpIcon sx={{ fontSize: 18 }} /></div>
        <h2>Dự Đoán GPA Kỳ Sau</h2>
      </div>
      <div className="card-body">
        {!hasData ? (
          <div className="info-box">
            Bạn cần có ít nhất <strong>1 học kỳ hoàn thành</strong> (đủ tín chỉ dự kiến) để sử dụng công cụ dự đoán.
          </div>
        ) : (
          <>
            {/* Current stats */}
            <div style={s.statsRow}>
              <div style={s.statBox}>
                <div style={s.statLabel}>GPA hiện tại (Hệ 4)</div>
                <div style={s.statValue}>{round2(curG4)}</div>
              </div>
              <div style={s.statBox}>
                <div style={s.statLabel}>GPA hiện tại (Hệ 10)</div>
                <div style={s.statValue}>{round2(curG10)}</div>
              </div>
              <div style={s.statBox}>
                <div style={s.statLabel}>Tổng TC tích lũy</div>
                <div style={s.statValue}>{totalCredits}</div>
              </div>
            </div>

            {/* Input */}
            <div className="form-grid">
              <div className="form-group">
                <label>GPA mục tiêu (Hệ 4)</label>
                <input type="number" placeholder="VD: 3.6" min={0} max={4} step={0.01}
                  value={targetGpa} onChange={e => { setTargetGpa(e.target.value); setResult(null); }} />
              </div>
              <div className="form-group">
                <label>Số tín chỉ kỳ sau (dự kiến)</label>
                <input type="number" placeholder="VD: 18" min={1} max={30}
                  value={nextCredits} onChange={e => { setNextCredits(e.target.value); setResult(null); }} />
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>}

            <div className="btn-row" style={{ marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={calculate} disabled={!targetGpa || !nextCredits}>
                <CalculateIcon sx={{ fontSize: 16 }} /> Tính toán
              </button>
            </div>

            {/* Result */}
            {result && (
              <div style={s.resultBox(result.isPossible)}>
                {result.isAlreadyAchieved ? (
                  <>
                    <div style={s.resultHeader(true)}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 22 }} /> Bạn đã đạt rồi!
                    </div>
                    <p style={s.resultDesc}>
                      GPA hiện tại của bạn (<strong>{round2(curG4)}</strong>) đã đạt hoặc vượt mục tiêu <strong>{targetGpa}</strong>. 🎉
                    </p>
                  </>
                ) : result.isPossible ? (
                  <>
                    <div style={s.resultHeader(true)}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 22 }} /> Có thể đạt được!
                    </div>
                    <p style={s.resultDesc}>
                      Để GPA tích lũy lên <strong>{targetGpa}</strong>, kỳ sau ({nextCredits} TC) bạn cần đạt tối thiểu:
                    </p>
                    <div style={s.gradeCards}>
                      <div style={s.gradeCard}>
                        <div style={s.gradeLabel}>GPA kỳ sau (Hệ 4)</div>
                        <div style={s.gradeValue}>{result.neededGpa4.toFixed(2)}</div>
                        <span style={s.badge(true)}>{result.classification}</span>
                      </div>
                      <div style={s.gradeCard}>
                        <div style={s.gradeLabel}>Điểm TB kỳ sau (Hệ 10)</div>
                        <div style={s.gradeValue}>{result.neededGpa10.toFixed(2)}</div>
                        <span style={s.badge(true)}>Xếp loại {result.letter}</span>
                      </div>
                    </div>
                    <div style={s.formula}>
                      {result.formulaDetail}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={s.resultHeader(false)}>
                      <WarningAmberIcon sx={{ fontSize: 22 }} /> Không khả thi!
                    </div>
                    <p style={s.resultDesc}>
                      Cần GPA kỳ sau đạt <strong>{result.neededGpa4.toFixed(2)}</strong> (Hệ 4) — vượt quá tối đa <strong>4.0</strong>.
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                      💡 Hãy thử <strong>hạ mục tiêu</strong> hoặc <strong>tăng số tín chỉ</strong> kỳ sau.
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
