'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginIcon from '@mui/icons-material/Login';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Đăng nhập thất bại'); return; }
      router.push('/'); router.refresh();
    } catch { setError('Đã xảy ra lỗi kết nối'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page-wrapper">
    <div className="auth-card">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <img src="/logo.png" alt="GPA Calculator Logo" width="64" height="64" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
      </div>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Email</label><input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="form-group"><label>Mật khẩu</label><input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
          <LoginIcon sx={{ fontSize: 18 }} /> {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="auth-link">Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link></p>
    </div>
    </div>
  );
}
