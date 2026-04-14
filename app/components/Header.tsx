'use client';

import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
  userName: string;
  onToggleSidebar: () => void;
}

export default function Header({ userName, onToggleSidebar }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <MenuIcon sx={{ fontSize: 24, color: '#374151' }} />
        </button>
        <h1 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="GPA Calculator Logo" width="28" height="28" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          GPA Calculator
        </h1>
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
          <span className="user-name">{userName}</span>
        </div>
        <button className="btn btn-danger header-logout" onClick={handleLogout}>
          <LogoutIcon sx={{ fontSize: 16 }} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
