import SchoolIcon from '@mui/icons-material/School';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1><SchoolIcon sx={{ fontSize: 32 }} /> GPA Calculator</h1>
          <p>Tính điểm trung bình tích lũy</p>
        </div>
        {children}
      </div>
    </div>
  );
}
