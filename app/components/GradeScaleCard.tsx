'use client';

import BarChartIcon from '@mui/icons-material/BarChart';

export default function GradeScaleCard() {
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

  return (
    <div className="card">
      <div className="card-header">
        <div className="icon"><BarChartIcon sx={{ fontSize: 18 }} /></div>
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
              <strong>Môn lý thuyết:</strong><br />
              Điểm = (ĐTK × Hệ số TK + ĐGK × Hệ số GK + ĐCK × Hệ số CK) ÷ Tổng hệ số<br /><br />
              <strong>Ví dụ:</strong> TK: 3 cột (7,8,9) hệ số 2, GK: 9 hệ số 3, CK: 10 hệ số 5<br />
              = (((7+8+9)/3)×2 + 9×3 + 10×5) ÷ 10
            </div>
            <div className="info-box" style={{ marginTop: 10 }}>
              <strong>Môn có thực hành:</strong><br />
              Điểm = (ĐTH × TC_TH + ĐLT × TC_LT) ÷ (TC_TH + TC_LT)<br /><br />
              Trong đó ĐTH = trung bình các cột thực hành, ĐLT = điểm lý thuyết
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
