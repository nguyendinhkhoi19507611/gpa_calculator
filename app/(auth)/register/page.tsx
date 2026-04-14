'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setFieldErrors({}); setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && typeof data.error === 'object') setFieldErrors(data.error);
        else setError(typeof data.error === 'string' ? data.error : 'Đăng ký thất bại');
        return;
      }
      router.push('/'); router.refresh();
    } catch { setError('Đã xảy ra lỗi kết nối'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-card">
      <h2>Đăng Ký</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Họ và tên</label><input type="text" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} required />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name[0]}</span>}</div>
        <div className="form-group"><label>Email</label><input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}</div>
        <div className="form-group"><label>Mật khẩu</label><input type="password" placeholder="Ít nhất 6 ký tự" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password[0]}</span>}</div>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
          <PersonAddIcon sx={{ fontSize: 18 }} /> {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="auth-link">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p>
    </div>
  );
}
