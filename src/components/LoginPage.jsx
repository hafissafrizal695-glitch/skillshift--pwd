import { useState, useEffect, useCallback } from 'react';
import './LoginPage.css';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const symbol = {
    success: '✓',
    error: '!',
    info: 'i',
  };

  return (
    <div className={`login-toast login-toast-minimal ${type}`}>
      <span className={`login-toast-symbol ${type}`}>{symbol[type] || 'i'}</span>
      <span className="login-toast-message">{message}</span>
    </div>
  );
}

const ADMIN_CREDENTIALS = {
  email: 'admin@skillshift.com',
  password: 'admin123',
};

export default function LoginPage({ onLoginSuccess }) {
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleAdminLogin = useCallback(
    (e) => {
      e.preventDefault();

      if (adminEmail === ADMIN_CREDENTIALS.email && adminPassword === ADMIN_CREDENTIALS.password) {
        const adminUser = {
          id: 0,
          role: 'admin',
          email: adminEmail,
          nama: 'Administrator',
        };
        localStorage.setItem('skillshift_user', JSON.stringify(adminUser));

        setToast({
          message: `Berhasil masuk ke Dashboard Admin (${adminEmail})!`,
          type: 'success',
        });
        setTimeout(() => onLoginSuccess('admin'), 500);
      } else {
        setToast({ message: 'Email atau password admin salah!', type: 'error' });
      }
    },
    [adminEmail, adminPassword, onLoginSuccess]
  );

  const handleUserLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (!userEmail || !userPassword) {
        setToast({ message: 'Email dan password harus diisi!', type: 'error' });
        return;
      }

      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://skillshift-pwd-production-49ae.up.railway.app/api';
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, password: userPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          setToast({ message: data.error || 'Login gagal!', type: 'error' });
          return;
        }

        localStorage.setItem('skillshift_user', JSON.stringify(data.user));

        setToast({ message: `Berhasil masuk!`, type: 'success' });
        setTimeout(() => onLoginSuccess('user'), 500);
      } catch (err) {
        setToast({ message: 'Terjadi kesalahan. Pastikan server berjalan.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [userEmail, userPassword, onLoginSuccess]
  );

  const handleUserRegister = useCallback(
    async (e) => {
      e.preventDefault();

      if (!registerName || !registerEmail || !registerPassword) {
        setToast({ message: 'Semua field harus diisi!', type: 'error' });
        return;
      }

      if (registerPassword.length < 6) {
        setToast({ message: 'Password minimal 6 karakter!', type: 'error' });
        return;
      }

      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://skillshift-pwd-production-49ae.up.railway.app/api';
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: registerName,
            email: registerEmail,
            password: registerPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setToast({ message: data.error || 'Registrasi gagal!', type: 'error' });
          return;
        }

        const loginRes = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registerEmail, password: registerPassword }),
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem('skillshift_user', JSON.stringify(loginData.user));
          setToast({ message: 'Akun berhasil dibuat! Selamat datang!', type: 'success' });
          setTimeout(() => onLoginSuccess('user'), 500);
        } else {
          setToast({ message: 'Akun berhasil dibuat. Silakan login.', type: 'success' });
          setIsRegisterMode(false);
          setUserEmail(registerEmail);

          setRegisterName('');
          setRegisterEmail('');
          setRegisterPassword('');
        }
      } catch (err) {
        setToast({ message: 'Terjadi kesalahan. Pastikan server berjalan.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [registerName, registerEmail, registerPassword, onLoginSuccess]
  );

  const togglePanel = (isAdmin) => {
    setIsAdminActive(isAdmin);
    setIsRegisterMode(false);
  };

  const toggleRegisterMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setUserEmail('');
    setUserPassword('');
  };

  const showInfo = (msg) => setToast({ message: msg, type: 'info' });

  return (
    <div className="login-page-bg">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div
        className={`login-container ${isAdminActive ? 'admin-panel-active' : ''} ${isRegisterMode ? 'register-mode' : ''}`}
      >
        <div className="login-form-container admin-container">
          <form onSubmit={handleAdminLogin}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-[#901d31] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                S
              </div>
              <span className="font-extrabold text-[#901d31] tracking-wide text-lg">
                Skill<span className="text-[#f5a623]">Shift</span>
              </span>
              <span className="text-[10px] bg-red-100 text-[#901d31] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Admin
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#2d1b1f] mb-1">Akses Administrator</h1>
            <p className="text-gray-400 text-xs mb-6">
              Masuk untuk mengelola lowongan dan meninjau pelamar kerja.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email Admin
              </label>
              <input
                type="email"
                placeholder="admin@skillshift.com"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#faf8f6] border border-gray-100 focus:border-[#901d31] rounded-xl text-sm focus:outline-none transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#faf8f6] border border-gray-100 focus:border-[#901d31] rounded-xl text-sm focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={() => showInfo('Portal pemulihan admin sedang disiapkan.')}
                className="text-xs text-gray-400 hover:text-[#901d31] transition-colors cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#4c0519] hover:bg-[#901d31] text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-300 active:scale-[0.98]"
            >
              Masuk Dasbor Admin
            </button>

            <p className="text-center text-xs text-gray-500 mt-6 md:hidden">
              Bukan administrator?
              <button
                type="button"
                onClick={() => togglePanel(false)}
                className="text-[#901d31] font-semibold underline ml-1"
              >
                Portal User
              </button>
            </p>
          </form>
        </div>

        <div className="login-form-container user-container">
          {!isRegisterMode ? (
            <form onSubmit={handleUserLogin}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-lg bg-[#901d31] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  S
                </div>
                <span className="font-extrabold text-[#901d31] tracking-wide text-lg">
                  Skill<span className="text-[#f5a623]">Shift</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Talent
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#2d1b1f] mb-1">Cari Kerja Impianmu</h1>
              <p className="text-gray-400 text-xs mb-6">
                Masuk untuk melamar pekerjaan kreatif dan magang terbaik.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#faf8f6] border border-gray-100 focus:border-[#901d31] rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#faf8f6] border border-gray-100 focus:border-[#901d31] rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={() => showInfo('Portal pemulihan akun user akan segera hadir.')}
                  className="text-xs text-gray-400 hover:text-[#901d31] transition-colors cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#901d31] hover:bg-[#b0273f] disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-300 active:scale-[0.98]"
              >
                {isLoading ? 'Memuat...' : 'Masuk Sekarang'}
              </button>

              <p className="text-center text-xs text-gray-500 mt-6">
                Belum punya akun?
                <button
                  type="button"
                  onClick={toggleRegisterMode}
                  className="text-[#901d31] font-semibold underline ml-1"
                >
                  Daftar Akun
                </button>
              </p>

              <p className="text-center text-xs text-gray-500 mt-4 md:hidden">
                Memiliki akun Admin?
                <button
                  type="button"
                  onClick={() => togglePanel(true)}
                  className="text-[#901d31] font-semibold underline ml-1"
                >
                  Portal Admin
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleUserRegister}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-lg bg-[#901d31] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  S
                </div>
                <span className="font-extrabold text-[#901d31] tracking-wide text-lg">
                  Skill<span className="text-[#f5a623]">Shift</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Talent
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#2d1b1f] mb-1">Buat Akun Baru</h1>
              <p className="text-gray-400 text-xs mb-6">
                Daftar untuk melamar pekerjaan dan membangun profil karirmu.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#faf8f6] border border-gray-100 focus:border-[#901d31] rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#faf8f6] border border-gray-100 focus:border-[#901d31] rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#faf8f6] border border-gray-100 focus:border-[#901d31] rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#901d31] hover:bg-[#b0273f] disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-300 active:scale-[0.98]"
              >
                {isLoading ? 'Memuat...' : 'Daftar Sekarang'}
              </button>

              <p className="text-center text-xs text-gray-500 mt-6">
                Sudah punya akun?
                <button
                  type="button"
                  onClick={toggleRegisterMode}
                  className="text-[#901d31] font-semibold underline ml-1"
                >
                  Masuk
                </button>
              </p>

              <p className="text-center text-xs text-gray-500 mt-4 md:hidden">
                Memiliki akun Admin?
                <button
                  type="button"
                  onClick={() => togglePanel(true)}
                  className="text-[#901d31] font-semibold underline ml-1"
                >
                  Portal Admin
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="text-3xl font-extrabold mb-3">Kembali ke User</h1>
              <p className="text-sm text-red-100 font-light mb-8 max-w-[280px]">
                Ingin melamar pekerjaan terbaru atau mengelola resume pribadi Anda?
              </p>
              <button
                onClick={() => togglePanel(false)}
                className="px-10 py-3 border-2 border-white text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-[#901d31] transition-all duration-300 shadow-md"
              >
                Portal User
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1 className="text-3xl font-extrabold mb-3">Portal Admin</h1>
              <p className="text-sm text-red-100 font-light mb-8 max-w-[280px]">
                Gunakan dashboard admin khusus untuk mempublikasikan dan menyaring lowongan kerja.
              </p>
              <button
                onClick={() => togglePanel(true)}
                className="px-10 py-3 border-2 border-white text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-[#901d31] transition-all duration-300 shadow-md"
              >
                Portal Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
