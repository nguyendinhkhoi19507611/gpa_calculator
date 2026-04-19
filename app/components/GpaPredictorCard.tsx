'use client';

import { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { round2 } from '@/lib/utils';

function gpa4ToMinGrade10(g4: number): string {
    if (g4 >= 4.0) return '9.00';
    if (g4 >= 3.8) return '8.50';
    if (g4 >= 3.5) return '8.00';
    if (g4 >= 3.0) return '7.00';
    if (g4 >= 2.5) return '6.50';
    if (g4 >= 2.0) return '5.50';
    if (g4 >= 1.5) return '5.00';
    if (g4 >= 1.0) return '4.00';
    return '0.00';
}

function getClassification(g4: number): string {
    if (g4 >= 3.6) return 'Xuất sắc';
    if (g4 >= 3.2) return 'Giỏi';
    if (g4 >= 2.5) return 'Khá';
    if (g4 >= 2.0) return 'Trung bình';
    if (g4 >= 1.0) return 'Yếu';
    return 'Kém';
}

interface GpaPredictorCardProps {
    currentGpa4: number | string;
    currentGpa10: number | string;
    totalCredits: number;
}

export default function GpaPredictorCard({ currentGpa4, currentGpa10, totalCredits }: GpaPredictorCardProps) {
    const [targetGpa4, setTargetGpa4] = useState('');
    const [nextCredits, setNextCredits] = useState('');
    const [result, setResult] = useState<{
        neededGpa4: number;
        neededGpa10: string;
        isPossible: boolean;
        classification: string;
    } | null>(null);

    const curG4 = typeof currentGpa4 === 'string' ? parseFloat(currentGpa4) : currentGpa4;
    const curG10 = typeof currentGpa10 === 'string' ? parseFloat(currentGpa10) : currentGpa10;
    const hasData = !isNaN(curG4) && totalCredits > 0;

    useEffect(() => {
        setResult(null);
    }, [targetGpa4, nextCredits]);

    const calculate = () => {
        const target = parseFloat(targetGpa4);
        const nextC = parseFloat(nextCredits);

        if (isNaN(target) || isNaN(nextC) || nextC <= 0 || target <= 0 || target > 4) return;

        // Formula: needed = (target × (totalC + nextC) - current × totalC) / nextC
        const neededGpa4 = (target * (totalCredits + nextC) - curG4 * totalCredits) / nextC;
        const roundedNeeded = Math.round((neededGpa4 + Number.EPSILON) * 100) / 100;

        // Also calculate for scale 10
        const neededGpa10Raw = (target * (totalCredits + nextC) - curG4 * totalCredits) / nextC;

        const isPossible = roundedNeeded <= 4.0 && roundedNeeded >= 0;

        setResult({
            neededGpa4: roundedNeeded,
            neededGpa10: gpa4ToMinGrade10(roundedNeeded),
            isPossible,
            classification: isPossible ? getClassification(roundedNeeded) : '',
        });
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
                        Bạn cần có ít nhất <strong>1 học kỳ hoàn thành</strong> để sử dụng công cụ dự đoán.
                    </div>
                ) : (
                    <>
                        {/* Current GPA display */}
                        <div className="predictor-current">
                            <div className="predictor-current-item">
                                <span className="predictor-current-label">GPA hiện tại (Hệ 4)</span>
                                <span className="predictor-current-value">{round2(curG4)}</span>
                            </div>
                            <div className="predictor-current-item">
                                <span className="predictor-current-label">GPA hiện tại (Hệ 10)</span>
                                <span className="predictor-current-value">{round2(curG10)}</span>
                            </div>
                            <div className="predictor-current-item">
                                <span className="predictor-current-label">Tổng TC tích lũy</span>
                                <span className="predictor-current-value">{totalCredits}</span>
                            </div>
                        </div>

                        {/* Input form */}
                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                            <div className="form-group">
                                <label>GPA mục tiêu (Hệ 4)</label>
                                <input
                                    type="number" placeholder="VD: 3.6" min={0} max={4} step={0.01}
                                    value={targetGpa4} onChange={e => setTargetGpa4(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Số TC kỳ sau (dự kiến)</label>
                                <input
                                    type="number" placeholder="VD: 18" min={1} max={30}
                                    value={nextCredits} onChange={e => setNextCredits(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="btn-row" style={{ marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={calculate}
                                disabled={!targetGpa4 || !nextCredits}>
                                <CalculateIcon sx={{ fontSize: 16 }} /> Tính toán
                            </button>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className={`predictor-result ${result.isPossible ? 'success' : 'impossible'}`}>
                                {result.isPossible ? (
                                    <>
                                        <div className="predictor-result-header">
                                            <CheckCircleIcon sx={{ fontSize: 22, color: '#10b981' }} />
                                            <span>Có thể đạt được!</span>
                                        </div>
                                        <p className="predictor-result-desc">
                                            Để nâng GPA tích lũy lên <strong>{targetGpa4}</strong>, bạn cần đạt tối thiểu:
                                        </p>
                                        <div className="predictor-result-grades">
                                            <div className="predictor-result-item">
                                                <span className="predictor-result-label">GPA kỳ sau (Hệ 4)</span>
                                                <span className="predictor-result-value">{result.neededGpa4.toFixed(2)}</span>
                                                <span className="predictor-result-class">{result.classification}</span>
                                            </div>
                                            <div className="predictor-result-item">
                                                <span className="predictor-result-label">Điểm TB (Hệ 10) ≥</span>
                                                <span className="predictor-result-value">{result.neededGpa10}</span>
                                            </div>
                                        </div>
                                        <div className="predictor-formula">
                                            <strong>Công thức:</strong> ({targetGpa4} × ({totalCredits} + {nextCredits}) − {round2(curG4)} × {totalCredits}) ÷ {nextCredits} = <strong>{result.neededGpa4.toFixed(2)}</strong>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="predictor-result-header">
                                            <ErrorOutlineIcon sx={{ fontSize: 22, color: '#ef4444' }} />
                                            <span>Không khả thi!</span>
                                        </div>
                                        <p className="predictor-result-desc">
                                            Cần GPA kỳ sau đạt <strong>{result.neededGpa4.toFixed(2)}</strong> (Hệ 4) — vượt quá giới hạn tối đa <strong>4.0</strong>.
                                            {result.neededGpa4 < 0 && ' (GPA mục tiêu thấp hơn hiện tại, bạn đã đạt rồi!)'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            💡 Hãy thử <strong>hạ mục tiêu</strong> hoặc <strong>tăng số tín chỉ</strong> kỳ sau để tìm mức khả thi hơn.
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
