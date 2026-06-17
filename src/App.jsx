import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://skillshift-pwd-production-49ae.up.railway.app/api';

function AnimatedCounter({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(target);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count}</span>;
}

function SkillShiftLogo({ onClick, small }) {
  return (
    <div
      className={`flex items-center ${small ? 'gap-2.5' : 'gap-3'} cursor-pointer group`}
      onClick={onClick}
    >
      <div
        className={`${small ? 'w-10 h-10' : 'w-12 h-12'} relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a0a15" />
              <stop offset="100%" stopColor="#6b1020" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8c97a" />
              <stop offset="100%" stopColor="#8B1538" />
            </linearGradient>
          </defs>

          <rect width="48" height="48" rx="13" fill="url(#bgGrad)" />

          <rect
            x="1.5"
            y="1.5"
            width="45"
            height="45"
            rx="12"
            stroke="url(#goldGrad)"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />

          <line
            x1="8"
            y1="40"
            x2="20"
            y2="8"
            stroke="#8B1538"
            strokeWidth="0.6"
            strokeOpacity="0.25"
          />

          <path
            d="M15.5 18.5C15.5 15.5 17.8 13.5 21 13.5H27.5C30.2 13.5 32.5 15.5 32.5 18C32.5 20.8 30.2 22.5 27 22.5H21C17.8 22.5 15.5 24.8 15.5 27.5C15.5 30.5 17.8 32.5 21 32.5H28C30.8 32.5 33 30.5 33 27.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <circle cx="37" cy="11" r="2.5" fill="url(#goldGrad)" />

          <line
            x1="16"
            y1="38"
            x2="32"
            y2="38"
            stroke="url(#goldGrad)"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      <div className="group-hover:translate-x-0.5 transition-transform duration-300">
        <div className="flex flex-col items-center">
          <div
            className={`${small ? 'text-[20px]' : 'text-[21px]'} leading-none tracking-tight flex items-baseline gap-[1px]`}
          >
            <span className="font-black" style={{ color: '#6b1020' }}>
              Skill
            </span>
            <span className="font-black text-gray-900">Shift</span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="h-[1px] w-4 bg-gradient-to-r from-[#c99042] to-transparent" />
            <span
              className="text-[7px] uppercase tracking-[.4em] font-black"
              style={{ color: '#c99042' }}
            >
              career portal
            </span>
            <div className="h-[1px] w-4 bg-gradient-to-l from-[#c99042] to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumDropdown({ label, options, selected, onSelect, multi = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (!options) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && options[activeIndex]) {
            handleSelect(options[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, options]);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.premium-dropdown-item');
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const isSelected = (opt) => {
    if (multi) {
      return selected.includes(opt);
    }
    return selected === opt;
  };

  const handleSelect = (opt) => {
    if (!multi) {
      onSelect(opt);
      setIsOpen(false);
    } else {
      if (opt === 'Semua') {
        onSelect(['Semua']);
        return;
      }
      const current = selected.filter((s) => s !== 'Semua');
      if (current.includes(opt)) {
        const next = current.filter((s) => s !== opt);
        onSelect(next.length === 0 ? ['Semua'] : next);
      } else {
        onSelect([...current, opt]);
      }
    }
  };

  const getDisplayLabel = () => {
    if (multi) {
      if (selected[0] === 'Semua' || selected.length === 0) return label;
      return selected.join(', ');
    }
    return selected === 'Semua' ? label : selected;
  };

  const isActive = multi
    ? selected.length > 0 && !(selected.length === 1 && selected[0] === 'Semua')
    : selected !== 'Semua';

  return (
    <div className="premium-dropdown" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`premium-dropdown-trigger ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="premium-dropdown-value">{getDisplayLabel()}</span>
        <svg
          className={`premium-dropdown-chevron ${isOpen ? 'rotated' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={`premium-dropdown-menu ${isOpen ? 'open' : ''}`} role="listbox">
        <div className="premium-dropdown-inner" ref={listRef}>
          {options?.map((opt, index) => {
            const selected = isSelected(opt);
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`premium-dropdown-item ${selected ? 'selected' : ''} ${activeIndex === index ? 'highlighted' : ''}`}
              >
                <span className="premium-dropdown-item-text">{opt}</span>
                {selected && (
                  <svg
                    className="premium-dropdown-check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const DropdownFilter = PremiumDropdown;

const getWorkTypeBadgeClass = (type) => {
  const styles = {
    Hybrid: 'bg-[#8B1538] text-white border-[#8B1538]',
    Onsite: 'bg-[#FFFBF5] text-[#8A6A3B] border-[#E8D5B0]',
    Remote: 'bg-[#9A5A2E] text-white border-[#B88746]',
  };

  return styles[type] || 'bg-[#FFFBF5] text-[#8A6A3B] border-[#E8D5B0]';
};
function JobCard({ job, savedJobs, onSave, onSelect }) {
  const isSaved = savedJobs.some((s) => s.id === job.id);

  const catIcon = {
    Kreatif: '/images/kreatif.png',
    IT: '/images/it.png',
    'F&B': '/images/fnb.png',
    Pendidikan: '/images/pendidikan.png',
    Logistik: '/images/logistik.png',
    Kesehatan: '/images/kesehatan.png',
    Lainnya: '/images/lainnya.png',
  };

  const typeColor = {
    Hybrid: 'bg-[#8B1538] text-white',
    Onsite: 'bg-[#F4E4C8] text-[#8A5A22] border border-[#E8D5B0]',
    Remote: 'bg-[#9A5A2E] text-white',
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className="bg-white rounded-[28px] overflow-hidden border-2 border-transparent hover:border-[#8B1538]/70 shadow-[0_10px_28px_rgba(139,24,42,0.10)] hover:shadow-[0_12px_32px_rgba(139,24,42,0.14)] hover:border-[#8B1538]/20 transition-all duration-300 flex flex-col cursor-pointer group relative"
    >
      <div className="relative h-[220px] overflow-hidden flex-shrink-0">
        {job.image ? (
          <img
            src={job.image}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#8B1538]/20 to-[#8B1538]/5 flex items-center justify-center">
            <img
              src={catIcon[job.category] || '/images/lainnya.png'}
              alt={job.category}
              className="w-16 h-16 opacity-40 object-contain"
            />
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${typeColor[job.type] || 'bg-white text-gray-600'}`}
        >
          {job.type}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(job);
          }}
          className={`absolute top-3 right-3 w-[38px] h-[38px] rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            isSaved ? 'bg-[#8B1538] text-white' : 'bg-white text-gray-400 hover:text-[#8B1538]'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={isSaved ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-3">
          <img
            src={catIcon[job.category] || '/images/lainnya.png'}
            alt={job.category}
            className="w-5 h-5 object-contain"
          />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            {job.category}
          </span>
        </div>

        <h3 className="font-black text-gray-900 text-[21px] leading-tight group-hover:text-[#8B1538] transition-colors mb-2">
          {job.title}
        </h3>
        <p className="text-gray-500 text-[13px] font-bold flex items-center gap-1.5 mb-3">
          <img src="/images/icon-gedung.png" alt="building" className="w-3 h-3 object-contain" />
          {job.company}
        </p>

        <div className="flex flex-wrap gap-8 mb-3">
          <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
            <img
              src="/images/icon-location.png"
              alt="location"
              className="w-3.5 h-3.5 object-contain"
            />
            {job.location}
          </span>
          <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
            <img src="/images/jam.png" alt="jam" className="w-3.5 h-3.5 object-contain" />
            {job.hours}
          </span>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {job.skills.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                Gaji Mulai Dari
              </p>
              <p className="font-black text-[#8B1538] text-[15px] flex items-center gap-1">
                <img
                  src="/images/icon-gaji.png"
                  alt="gaji"
                  className="w-3.5 h-3.5 object-contain"
                />
                {job.salary}
              </p>
              {job.minAge && (
                <p className="text-[12px] text-gray-500 font-semibold mt-1 flex items-center gap-1.5">
                  <img src="/images/icon-usia.png" alt="usia" className="w-3 h-3 object-contain" />
                  Min. {job.minAge} Tahun
                </p>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(job);
              }}
              className="w-11 h-11 rounded-[14px] bg-[#8B1538] text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPasswordModal({ onSuccess, onClose }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  const handle = () => {
    if (pwd === 'WebAdor') onSuccess();
    else {
      setErr(true);
      setPwd('');
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="bg-white p-10 max-w-sm w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-[32px] border border-white">
        <div className="w-16 h-16 bg-maroon/10 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-inner">
          🔐
        </div>
        <h3 className="text-3xl font-black serif mb-2 text-gray-900">Admin Access</h3>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-8 font-semibold">
          Masukkan password admin
        </p>
        <input
          type="password"
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setErr(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handle()}
          placeholder="••••••••"
          autoFocus
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none p-4 text-center text-xl tracking-widest mb-4 transition-all shadow-inner"
        />
        {err && (
          <p className="text-red-500 text-xs text-center mb-4 font-bold bg-red-50 py-3 rounded-xl border border-red-100">
            Password salah. Coba lagi.
          </p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handle}
            className="flex-1 bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white py-4 text-xs font-black uppercase tracking-widest hover:shadow-[0_8px_20px_rgba(61,10,20,0.4)] hover:-translate-y-1 transition-all rounded-xl"
          >
            Masuk
          </button>
          <button
            onClick={onClose}
            className="px-6 border-2 border-gray-200 text-xs font-bold uppercase hover:bg-gray-50 transition-all rounded-xl text-gray-600 hover:border-gray-300"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

function JobDetailModal({ job, savedJobs, onToggleSave, onClose, onMarkAccepted, acceptedJobs }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  if (!job) return null;
  const isSaved = savedJobs.some((s) => s.id === job.id);
  const isAccepted = acceptedJobs.some((a) => a.id === job.id);

  const handleWhatsApp = () => {
    const text = `Halo Tim ${job.company}, saya berminat melamar posisi ${job.title} yang saya lihat di SkillShift. Mohon informasinya, terima kasih.`;
    let phone = job.contactPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  const handleEmail = () => {
    const subject = encodeURIComponent(`Lamaran: ${job.title} — via SkillShift`);
    const body = encodeURIComponent(
      `Halo Tim ${job.company},
Saya berminat melamar posisi ${job.title} yang saya temukan di platform SkillShift.
Terima kasih.`
    );
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${job.contactEmail}&su=${subject}&body=${body}`;
    window.open(url, '_blank');
  };

  const typeColor = {
    Hybrid: 'bg-[#8B1538]/90 text-white border-[#A32238]',
    Onsite: 'bg-[#F4E4C8]/95 text-[#8A5A22] border-[#E8D5B0]',
    Remote: 'bg-[#9A5A2E]/90 text-white border-[#B88746]',
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center backdrop-blur-md p-6"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl w-full max-w-2xl max-h-[calc(100vh-50px)] overflow-y-auto animate-slide-up shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-t-[32px] md:rounded-[32px] border border-white"
        onClick={(e) => e.stopPropagation()}
      >
        {job.image ? (
          <div className="h-72 overflow-hidden relative flex-shrink-0 rounded-t-[32px]">
            <img
              src={job.image}
              alt={job.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

            <div className="absolute inset-0 pt-8 px-8 pb-2 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border rounded-full backdrop-blur-md shadow-sm ${
                      typeColor[job.type] || 'bg-gray-800/90 text-white border-gray-700'
                    }`}
                  >
                    {job.type}
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white/90 text-gray-900 border border-white rounded-full shadow-sm">
                    {job.category}
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="w-11 h-11 bg-[#8B1538] rounded-full flex items-center justify-center text-white hover:bg-[#6b1020] transition-all text-xl border border-white/40 shadow-[0_8px_22px_rgba(139,21,56,0.45)]"
                >
                  ✕
                </button>
              </div>
              <h2 className="mt-24 text-3xl md:text-4xl font-black text-white serif leading-none drop-shadow-md">
                {job.title}
              </h2>
              <p className="text-gray-300 text-sm font-semibold mt-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  <img src="/images/icon-gedung.png" alt="company" className="w-4 h-4" />
                </span>
                {job.company}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#8b182a] to-[#5a0d1a] px-8 pt-12 pb-10 relative rounded-t-[32px] shadow-inner">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all text-lg border border-white/20"
            >
              ✕
            </button>
            <div className="flex gap-2 mb-8 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white/20 text-white border border-white/30 rounded-full">
                {job.type}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white/20 text-white border border-white/30 rounded-full">
                {job.category}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white serif leading-tight drop-shadow-md">
              {job.title}
            </h2>
            <p className="text-[#d7bc9d] text-sm font-bold mt-3 flex items-center gap-2">
              <img src="/images/icon-gedung.png" alt="company" className="w-4 h-4" /> {job.company}
            </p>
          </div>
        )}

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Lokasi',
                value: job.location,
                iconImg: '/images/icon-stats-kota.png',
                iconAlt: 'kota',
                iconSize: 'w-5 h-5',
              },
              {
                label: 'Gaji / Bulan',
                value: job.salary,
                iconImg: '/images/icon-gaji.png',
                iconAlt: 'salary',
                iconSize: 'w-5 h-5',
              },
              {
                label: 'Jam Kerja',
                value: job.hours,
                iconImg: '/images/jam.png',
                iconAlt: 'jam',
                iconSize: 'w-5 h-5',
              },
              {
                label: 'Min. Usia',
                value: `${job.minAge} Tahun`,
                iconImg: '/images/icon-usia.png',
                iconAlt: 'age',
                iconSize: 'w-5 h-5',
              },
            ].map(({ label, value, iconImg, iconAlt, iconEmoji, iconSize }) => (
              <div
                key={label}
                className="bg-white border border-gray-100/80 rounded-2xl px-4 py-5 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                  {iconImg ? (
                    <img src={iconImg} alt={iconAlt} className={iconSize} />
                  ) : (
                    <span className={iconSize}>{iconEmoji}</span>
                  )}
                  {label}
                </p>
                <p className="font-black text-gray-900 text-[15px] leading-tight">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 -ml-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-maroon/10 text-maroon flex items-center justify-center text-sm flex-shrink-0">
                <img src="/images/icon-skills.png" alt="skills" className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                Skills Dibutuhkan
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).map((s) => (
                <span
                  key={s}
                  className="bg-white text-maroon text-xs font-black uppercase tracking-wider px-5 py-2 border border-maroon/10 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-maroon/10 text-maroon flex items-center justify-center text-sm">
                <img src="/images/icon-deskripsi.png" alt="description" className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                Deskripsi Pekerjaan
              </p>
            </div>
            <p className="text-gray-600 text-[14px] leading-relaxed bg-white border border-gray-100/80 rounded-3xl p-6 font-medium shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {job.description}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-maroon/10 text-maroon flex items-center justify-center text-sm">
                <img src="/images/icon-kontak.png" alt="contact" className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                Hubungi Rekruter
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {job.contactPhone && (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-6 py-4 text-xs font-black uppercase tracking-widest hover:shadow-lg hover:-translate-y-1 transition-all rounded-2xl"
                >
                  <span className="text-lg">
                    <img src="/images/icon-whatsapp.png" alt="whatsapp" className="w-4 h-4" />
                  </span>{' '}
                  WhatsApp
                </button>
              )}
              {job.contactEmail && (
                <button
                  onClick={handleEmail}
                  className="flex items-center justify-center gap-3 bg-white border-2 border-maroon text-maroon px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-maroon hover:text-white transition-all rounded-2xl shadow-sm hover:shadow-lg"
                >
                  <span className="text-lg">
                    <img src="/images/icon-email.png" alt="email" className="w-4 h-4" />
                  </span>{' '}
                  Email
                </button>
              )}
            </div>
          </div>

          {!isAccepted ? (
            <div className="w-full rounded-2xl border border-[#E8D5B0]/70 bg-[#FFFBF5] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_8px_24px_rgba(201,144,66,0.08)]">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-white border border-[#E8D5B0] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#8B1538]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-[13px] font-black uppercase tracking-[0.14em] text-gray-900">
                    Sudah Diterima?
                  </p>
                  <p className="text-[12px] text-gray-500 font-medium mt-1">
                    Tandai lowongan ini sebagai diterima.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onMarkAccepted(job);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#8B1538] text-white text-[11px] font-black uppercase tracking-[0.14em] hover:bg-[#6b1020] transition-all shadow-[0_8px_20px_rgba(139,21,56,0.22)]"
              >
                Tandai Diterima
              </button>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-[#E8D5B0]/70 bg-[#FFFBF5] px-5 py-4 flex items-center gap-4 shadow-[0_8px_24px_rgba(201,144,66,0.08)]">
              <div className="w-10 h-10 rounded-full bg-[#FFF8EF] border border-[#E8D5B0] flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-[#9A6A2F]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[13px] font-black uppercase tracking-[0.14em] text-[#8A6A3B]">
                  Sudah Ditandai Diterima
                </p>
                <p className="text-[12px] text-[#9A6A2F]/80 font-medium mt-1">
                  Progres tersimpan di tab Diterima.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => onToggleSave(job)}
              className={`w-full py-4 text-xs font-black uppercase tracking-widest border-2 transition-all rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 ${isSaved ? 'bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white border-maroon' : 'bg-white text-maroon border-maroon hover:bg-maroon hover:text-white'}`}
            >
              {isSaved ? (
                <>
                  <img
                    src="/images/icon-save.png"
                    alt="save"
                    className="w-4 h-4 inline-block mr-2"
                  />{' '}
                  Lowongan Tersimpan
                </>
              ) : (
                <>
                  <img
                    src="/images/icon-save.png"
                    alt="save"
                    className="w-4 h-4 inline-block mr-2"
                  />{' '}
                  Simpan Lowongan Ini
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AcceptedCard({ job, onRemove }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-2xl">
      <div className="flex">
        <div className="w-1.5 bg-gradient-to-b from-[#F3E2C3] to-[#C99042] flex-shrink-0" />
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <img
                src="/icon/icon-gedung.png"
                alt="perusahaan"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-[#FFF8EF] text-[#9A6A2F] border border-[#E8D5B0] px-2 py-0.5 rounded-full">
                <svg
                  className="w-2.5 h-2.5 text-[#9A6A2F]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Accepted
              </span>
              <span className="text-[10px] text-gray-400 font-bold">{job.acceptedDate}</span>
            </div>
            <button
              onClick={onRemove}
              className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-black text-gray-900 text-base leading-tight">{job.title}</h3>

              <p className="text-sm text-gray-500 font-medium mt-0.5">{job.company}</p>
            </div>

            <div className="flex items-center gap-1 text-[#8B1538] font-black text-sm md:text-base md:text-right md:ml-4 flex-shrink-0">
              <img src="/icon/icon-gaji.png" alt="gaji" className="w-3 h-3" />
              {job.salary}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] bg-[#FFFBF5] px-3 py-1 rounded-lg text-[#8A6A3B] font-semibold border border-[#E8D5B0]/60 flex items-center gap-1.5">
              <img
                src="/images/icon-stats-kota.png"
                alt="lokasi"
                className="w-3.5 h-3.5 object-contain flex-shrink-0 opacity-80"
              />
              {job.location}
            </span>

            {job.type && (
              <span className="text-[11px] bg-[#FFFBF5] px-3 py-1 rounded-lg text-[#8A6A3B] font-semibold border border-[#E8D5B0]/60">
                {job.type}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col">
      <div className="relative h-[260px] overflow-hidden flex-shrink-0">
        <div className="w-full h-full bg-gray-200 skeleton" />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="h-3 w-20 bg-gray-200 rounded mb-1 skeleton" />
        <div className="h-5 bg-gray-200 rounded-lg mb-2 skeleton w-3/4" />
        <div className="flex gap-1 mb-2">
          <div className="h-4 w-12 bg-gray-200 rounded skeleton" />
          <div className="h-4 w-14 bg-gray-200 rounded skeleton" />
          <div className="h-4 w-12 bg-gray-200 rounded skeleton" />
        </div>
        <div className="h-4 bg-gray-200 rounded mb-auto skeleton w-full" />
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div>
              <div className="h-2 w-16 bg-gray-200 rounded skeleton mb-1" />
              <div className="h-4 w-20 bg-gray-200 rounded skeleton" />
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-[14px] skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SlimGlassFrame({ children }) {
  return (
    <div className="slim-glass-wrapper">
      <div className="ambient-haze">
        <div className="haze haze-1" />
        <div className="haze haze-2" />
      </div>

      <div className="acrylic-layer-back">
        <div className="layer-fill" />
        <div className="layer-shine-top" />
        <div className="layer-shine-left" />
      </div>

      <div className="acrylic-layer-mid">
        <div className="layer-fill" />
        <div className="layer-shine-top" />
        <div className="layer-shine-left" />
      </div>

      <div className="acrylic-layer-front">
        <div className="layer-fill" />
        <div className="layer-shine-top" />
        <div className="layer-shine-left" />
      </div>

      <div className="slim-frame">
        <div className="slim-border">
          <div className="bd-top" />
          <div className="bd-bottom" />
          <div className="bd-left" />
          <div className="bd-right" />
        </div>

        <div className="inner-glow" />
        <div className="inner-shine" />

        <div className="frame-inner">{children}</div>
      </div>

      <div className="light-accent">
        <div className="accent-streak as-1" />
        <div className="accent-streak as-2" />
        <div className="accent-streak as-3" />
      </div>

      <div className="mini-sparkle">
        <div className="spark sp-1">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M8 0L9 5.6L14.4 8L9 10.4L8 16L7 10.4L1.6 8L7 5.6L8 0Z" fill="currentColor" />
          </svg>
        </div>
        <div className="spark sp-2">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M8 0L9 5.6L14.4 8L9 10.4L8 16L7 10.4L1.6 8L7 5.6L8 0Z" fill="currentColor" />
          </svg>
        </div>
        <div className="spark sp-3">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M8 0L9 5.6L14.4 8L9 10.4L8 16L7 10.4L1.6 8L7 5.6L8 0Z" fill="currentColor" />
          </svg>
        </div>
        <div className="spark sp-4">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M8 0L9 5.6L14.4 8L9 10.4L8 16L7 10.4L1.6 8L7 5.6L8 0Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="soft-shadow">
        <div className="shade shade-1" />
      </div>
    </div>
  );
}

function HeroDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#8b182a]/5 to-transparent" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#c99042]/5 to-transparent" />
    </div>
  );
}

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [allAcceptedJobs, setAllAcceptedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/jobs`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.map(normalizeJob));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const normalizeJob = useCallback(
    (job) => ({
      ...job,

      title: job.title || job.judul || 'Judul lowongan belum tersedia',

      company: job.company || job.perusahaan || 'Perusahaan belum tersedia',

      location: job.location || job.lokasi || 'Lokasi belum tersedia',

      type: job.type || job.tipe || 'Part-time',

      category: job.category || job.kategori || 'Umum',

      skills: Array.isArray(job.skills)
        ? job.skills
        : (job.skills || job.skill || job.skill_required || 'Tidak disebutkan')
            .toString()
            .split(','),

      hours: job.hours || job.jam_kerja || job.jamKerja || 'Jam kerja belum tersedia',

      minAge: job.minAge || job.minimal_umur || job.usia_minimal || 18,

      salary: job.salary || job.gaji || 'Gaji belum tersedia',

      description: job.description || job.deskripsi || 'Deskripsi belum tersedia',

      contactEmail: job.contactEmail || job.email_kontak || job.email || '',
      contactPhone: job.contactPhone || job.whatsapp || job.no_wa || '',
      image:
        job.image ||
        job.foto ||
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
      createdAt: job.createdAt || job.created_at || '',
    }),
    []
  );

  const fetchSavedJobs = useCallback(async () => {
    const storedUser = JSON.parse(localStorage.getItem('skillshift_user') || 'null');
    const userId = storedUser?.id;
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/saved/${userId}`);
      if (!res.ok) throw new Error('Gagal mengambil data tersimpan');

      const data = await res.json();
      setSavedJobs(data.map(normalizeJob));
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  }, [normalizeJob]);

  const fetchAcceptedJobs = useCallback(async () => {
    const storedUser = JSON.parse(localStorage.getItem('skillshift_user') || 'null');

    const userId = storedUser?.id;

    if (!userId) {
      setAcceptedJobs([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/accepted/${userId}`);

      if (!res.ok) throw new Error('Gagal mengambil data diterima');

      const data = await res.json();

      setAcceptedJobs(
        data.map((job) => ({
          ...normalizeJob(job),
          acceptedDate: new Date().toLocaleDateString('id-ID'),
          currentStep: 0,
        }))
      );
    } catch (err) {
      console.error('Error fetching accepted jobs:', err);
    }
  }, [normalizeJob]);
  const fetchAllAcceptedJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/accepted`);
      if (!res.ok) throw new Error('Gagal mengambil data accepted');
      const data = await res.json();
      setAllAcceptedJobs(data);
    } catch (err) {
      console.error('Error fetching all accepted jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchAcceptedJobs();
    fetchAllAcceptedJobs();
  }, [fetchJobs, fetchSavedJobs, fetchAcceptedJobs, fetchAllAcceptedJobs]);

  const [activeTab, setActiveTab] = useState('home');
  const jobsRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy] = useState('newest');
  const [filterType, setFilterType] = useState('Semua');
  const [filterHours, setFilterHours] = useState('Semua');
  const [filterCategory, setFilterCategory] = useState(['Semua']);
  const [filterLocation, setFilterLocation] = useState(['Semua']);
  const [filterSkill, setFilterSkill] = useState(['Semua']);
  const [filterPosition, setFilterPosition] = useState(['Semua']);

  const [selectedJob, setSelectedJob] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [showAdminPwd, setShowAdminPwd] = useState(false);

  const [adminImagePreview, setAdminImagePreview] = useState(null);
  const adminImageInputRef = useRef(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [adminForm, setAdminForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Onsite',
    category: 'F&B',
    skills: '',
    hours: '',
    minAge: 18,
    salary: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    image: '',
  });

  const [profile, setProfile] = useState({
    name: 'Pengguna SkillShift',
    universitas: 'Belum diisi',
    jurusan: 'Belum diisi',
    email: '',
    phone: 'Belum diisi',
    linkedin: 'Belum diisi',
    lokasi: 'Belum diisi',
    tanggalLahir: '',
    bahasa: 'Bahasa Indonesia',
    tentang: 'Belum ada deskripsi profil.',
    skills: [],
    pendidikan: [],
    pengalaman: [],
    foto: null,
    tersedia: true,
  });

  const [editSection, setEditSection] = useState(null);
  const [editTemp, setEditTemp] = useState({});

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInputVal, setSearchInputVal] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const savedUser = localStorage.getItem('skillshift_user');

    if (!savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser);
      const finalType = parsedUser.role === 'admin' ? 'admin' : 'user';

      const savedProfile = localStorage.getItem(`skillshift_profile_${parsedUser.email}`);

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);

        setProfile((prev) => ({
          ...prev,
          ...parsedProfile,
          name: parsedProfile.name || parsedUser.nama || 'Pengguna SkillShift',
          email: parsedUser.email || parsedProfile.email || '',
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          name: parsedUser.nama || 'Pengguna SkillShift',
          email: parsedUser.email || '',
        }));
      }

      setIsLoggedIn(true);
      setUserType(finalType);
      setCurrentUser(parsedUser);
      setIsAdminAuth(finalType === 'admin');

      setActiveTab(finalType === 'admin' ? 'admin' : 'home');
    } catch (err) {
      console.error('Gagal membaca data login:', err);
      localStorage.removeItem('skillshift_user');
    }
  }, []);
  useEffect(() => {
    if (!isLoggedIn || !profile.email) return;

    localStorage.setItem(`skillshift_profile_${profile.email}`, JSON.stringify(profile));
  }, [profile, isLoggedIn]);

  const handleLoginSuccess = (type) => {
    const storedUser = JSON.parse(localStorage.getItem('skillshift_user') || 'null');

    if (!storedUser || !storedUser.role) {
      setIsLoggedIn(false);
      setUserType(null);
      setActiveTab('login');
      return;
    }

    const finalType = storedUser.role === 'admin' ? 'admin' : 'user';

    if (type !== finalType) {
      setIsLoggedIn(false);
      setUserType(null);
      setActiveTab('login');
      return;
    }

    const savedProfile = localStorage.getItem(`skillshift_profile_${storedUser.email}`);

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);

      setProfile((prev) => ({
        ...prev,
        ...parsedProfile,
        name: parsedProfile.name || storedUser.nama || 'Pengguna SkillShift',
        email: storedUser.email || parsedProfile.email || '',
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        name: storedUser.nama || 'Pengguna SkillShift',
        email: storedUser.email || '',
      }));
    }

    setIsLoggedIn(true);
    setUserType(finalType);
    setCurrentUser(storedUser);
    setIsAdminAuth(finalType === 'admin');

    setActiveTab(finalType === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    localStorage.removeItem('skillshift_user');

    setProfile({
      name: 'Pengguna SkillShift',
      universitas: 'Belum diisi',
      jurusan: 'Belum diisi',
      email: '',
      phone: 'Belum diisi',
      linkedin: 'Belum diisi',
      lokasi: 'Belum diisi',
      tanggalLahir: '',
      bahasa: 'Bahasa Indonesia',
      tentang: 'Belum ada deskripsi profil.',
      skills: [],
      pendidikan: [],
      pengalaman: [],
      foto: null,
      tersedia: true,
    });

    setIsLoggedIn(false);
    setUserType(null);
    setCurrentUser(null);
    setIsAdminAuth(false);
    setActiveTab('login');
  };

  const allTypes = useMemo(
    () => ['Semua', ...new Set(jobs.map((j) => j.type).filter(Boolean))],
    [jobs]
  );
  const allCategories = useMemo(
    () => ['Semua', ...new Set(jobs.map((j) => j.category).filter(Boolean))],
    [jobs]
  );
  const allLocations = useMemo(
    () => ['Semua', ...new Set(jobs.map((j) => j.location).filter(Boolean))],
    [jobs]
  );
  const allSkills = useMemo(
    () => [
      'Semua',
      ...new Set(
        jobs.flatMap((j) =>
          (Array.isArray(j.skills) ? j.skills : j.skills.split(',').map((s) => s.trim())).filter(
            Boolean
          )
        )
      ),
    ],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    let list = jobs.filter((j) => {
      const skillArr = Array.isArray(j.skills)
        ? j.skills
        : j.skills.split(',').map((s) => s.trim());

      const keyword = searchTerm.toLowerCase();

      return (
        (j.title.toLowerCase().includes(keyword) ||
          j.company.toLowerCase().includes(keyword) ||
          j.category.toLowerCase().includes(keyword) ||
          j.type.toLowerCase().includes(keyword) ||
          j.location.toLowerCase().includes(keyword) ||
          skillArr.some((skill) => skill.toLowerCase().includes(keyword))) &&
        (filterType === 'Semua' || j.type === filterType) &&
        (filterHours === 'Semua' || j.hours === filterHours) &&
        (filterCategory[0] === 'Semua' || filterCategory.includes(j.category)) &&
        (filterLocation[0] === 'Semua' || filterLocation.includes(j.location)) &&
        (filterSkill[0] === 'Semua' || filterSkill.some((fs) => skillArr.includes(fs))) &&
        (filterPosition[0] === 'Semua' || filterPosition.includes(j.title))
      );
    });

    return list;
  }, [
    jobs,
    searchTerm,
    filterType,
    filterHours,
    filterCategory,
    filterLocation,
    filterSkill,
    filterPosition,
  ]);

  const handleAdminImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1200;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);

          console.log('Original size:', (file.size / 1024).toFixed(2), 'KB');
          console.log('Compressed size:', (compressedDataUrl.length / 1024).toFixed(2), 'KB');

          setAdminImagePreview(compressedDataUrl);
          setAdminForm((f) => ({ ...f, image: compressedDataUrl }));
        };
        img.onerror = () => {
          console.log('Compression failed, using original');
          setAdminImagePreview(ev.target.result);
          setAdminForm((f) => ({ ...f, image: ev.target.result }));
        };
        img.src = ev.target.result;
      } catch (err) {
        console.error('Image processing error:', err);
        alert('Gagal memproses gambar. Coba gunakan foto lain.');
      }
    };
    reader.onerror = () => {
      alert('Gagal membaca file. Coba gunakan foto lain.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdminJob = async (e) => {
    e.preventDefault();

    if (!adminForm.title?.trim()) {
      alert('Judul posisi wajib diisi!');
      return;
    }
    if (!adminForm.company?.trim()) {
      alert('Nama perusahaan wajib diisi!');
      return;
    }
    if (!adminForm.location?.trim()) {
      alert('Lokasi wajib diisi!');
      return;
    }

    try {
      const method = editingJobId ? 'PUT' : 'POST';
      const url = editingJobId ? `${API_URL}/jobs/${editingJobId}` : `${API_URL}/jobs`;

      let skillsArray = [];
      if (Array.isArray(adminForm.skills)) {
        skillsArray = adminForm.skills;
      } else if (typeof adminForm.skills === 'string') {
        skillsArray = adminForm.skills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      const payload = {
        title: adminForm.title?.trim() || '',
        company: adminForm.company?.trim() || '',
        location: adminForm.location?.trim() || '',
        type: adminForm.type || 'Onsite',
        category: adminForm.category || 'F&B',
        skills: skillsArray,
        hours: adminForm.hours?.trim() || '',
        minAge: parseInt(adminForm.minAge) || 18,
        salary: adminForm.salary?.trim() || '',
        description: adminForm.description?.trim() || '',
        contactEmail: adminForm.contactEmail?.trim() || '',
        contactPhone: adminForm.contactPhone?.trim() || '',
        image:
          adminForm.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      };

      console.log('Saving job to:', url);
      console.log('Payload:', payload);

      await fetch(`${API_URL}/jobs`).catch(() => {});
      await new Promise((r) => setTimeout(r, 500));

      const fetchWithRetry = async (fetchUrl, options, retries = 3) => {
        let lastError;
        for (let i = 0; i < retries; i++) {
          try {
            const res = await fetch(fetchUrl, options);
            return res;
          } catch (err) {
            lastError = err;
            console.log(`Attempt ${i + 1} failed, retrying...`);
            if (i < retries - 1) await new Promise((r) => setTimeout(r, 1500));
          }
        }
        throw lastError;
      };

      const res = await fetchWithRetry(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let responseData;
      try {
        responseData = await res.json();
      } catch (e) {
        responseData = { error: `Server returned status ${res.status}` };
      }

      if (!res.ok) {
        const errorMessage =
          responseData?.error || (editingJobId ? 'Failed to update job' : 'Failed to save job');
        console.error('Server error:', responseData);
        throw new Error(errorMessage);
      }

      const responseJob = responseData;

      if (editingJobId) {
        setJobs(jobs.map((j) => (j.id === editingJobId ? responseJob : j)));
      } else {
        setJobs([responseJob, ...jobs]);
      }

      setIsAdminModalOpen(false);
      setAdminImagePreview(null);
      setEditingJobId(null);
      setAdminForm({
        title: '',
        company: '',
        location: '',
        type: 'Onsite',
        category: 'F&B',
        skills: '',
        hours: '',
        minAge: 18,
        salary: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        image: '',
      });

      alert(editingJobId ? 'Lowongan berhasil diupdate!' : 'Lowongan berhasil disimpan!');
    } catch (err) {
      console.error('Error saving job:', err);
      alert(
        editingJobId
          ? 'Gagal mengupdate lowongan: ' + err.message
          : 'Gagal menyimpan lowongan: ' + err.message
      );
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete job');
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Gagal menghapus lowongan: ' + err.message);
    }
  };

  const handleEditJob = (job) => {
    setEditingJobId(job.id);
    setAdminForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'Onsite',
      category: job.category || 'F&B',
      skills: job.skills || '',
      hours: job.hours || '',
      minAge: job.minAge || 18,
      salary: job.salary || '',
      description: job.description || '',
      contactEmail: job.contactEmail || '',
      contactPhone: job.contactPhone || '',
      image: job.image || '',
    });
    setAdminImagePreview(job.image || null);
    setIsAdminModalOpen(true);
  };

  const toggleSave = async (job) => {
    const storedUser = JSON.parse(localStorage.getItem('skillshift_user') || 'null');
    const userId = storedUser?.id;
    if (!userId) {
      alert('Login dulu untuk menyimpan lowongan!');
      setActiveTab('login');
      return;
    }
    const isSaved = savedJobs.some((s) => s.id === job.id);

    try {
      if (isSaved) {
        const res = await fetch(`${API_URL}/saved/${userId}/${job.id}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Gagal menghapus lowongan dari tersimpan');

        setSavedJobs((prev) => prev.filter((s) => s.id !== job.id));
      } else {
        const res = await fetch(`${API_URL}/saved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_user: userId,
            id_lowongan: job.id,
          }),
        });

        if (!res.ok) throw new Error('Gagal menyimpan lowongan');

        const savedRes = await fetch(`${API_URL}/saved/${userId}`);
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedJobs(savedData.map(normalizeJob));
        } else {
          setSavedJobs((prev) => [...prev, job]);
        }
      }
    } catch (err) {
      console.error('Error toggle saved job:', err);
      alert(err.message);
    }
  };

  const handleMarkAccepted = async (job) => {
    const storedUser = JSON.parse(localStorage.getItem('skillshift_user') || 'null');
    const userId = currentUser?.id || storedUser?.id;
    if (!userId) {
      alert('Login dulu untuk menyimpan lowongan!');
      setActiveTab('login');
      return;
    }
    const isAccepted = acceptedJobs.some((a) => a.id === job.id);

    try {
      if (!isAccepted) {
        const res = await fetch(`${API_URL}/accepted`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_user: userId,
            id_lowongan: job.id,
          }),
        });

        if (!res.ok) throw new Error('Gagal menandai lowongan sebagai diterima');

        setAcceptedJobs((prev) => [
          ...prev,
          {
            ...job,
            acceptedDate: new Date().toLocaleDateString('id-ID'),
            currentStep: 0,
          },
        ]);
      }

      setActiveTab('history');
    } catch (err) {
      console.error('Error mark accepted job:', err);
      alert(err.message);
    }
  };

  const handleNavClick = (key) => {
    if (key === 'jobs') {
      setActiveTab('jobs');
      setSearchOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (key === 'admin') {
      if (isAdminAuth) setActiveTab('admin');
      else setShowAdminPwd(true);
    } else if (key === 'login') {
      setActiveTab('login');
    } else if (key === 'profile') {
      setActiveTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab(key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const typeColor = {
    Hybrid: 'bg-[#8B1538] text-white border-[#8B1538]',
    Onsite: 'bg-[#FFFBF5] text-[#8A6A3B] border-[#E8D5B0]',
    Remote: 'bg-[#9A5A2E] text-white border-[#B88746]',
  };
  const hasActiveFilter =
    filterType !== 'Semua' ||
    filterHours !== 'Semua' ||
    filterCategory[0] !== 'Semua' ||
    filterLocation[0] !== 'Semua' ||
    filterSkill[0] !== 'Semua' ||
    filterPosition[0] !== 'Semua';

  return (
    <div className="min-h-screen flex flex-col app-root relative pt18">
      {activeTab === 'login' && !isLoggedIn && <LoginPage onLoginSuccess={handleLoginSuccess} />}

      {!(activeTab === 'login' && !isLoggedIn) && (
        <nav className="nav-bar py-3 px-6 md:px-10 flex justify-between items-center fixed top-0 left-0 right-0 z-[100] bg-white shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-b border-gray-100">
          <SkillShiftLogo onClick={() => setActiveTab('home')} small />

          <div className="hidden md:flex items-center gap-9">
            {!isLoggedIn ? (
              <>
                {[
                  { key: 'home', label: 'Beranda' },
                  { key: 'jobs', label: 'Lowongan' },
                  ...(userType !== 'admin' ? [{ key: 'saved', label: 'Tersimpan' }] : []),
                  ...(userType !== 'admin' ? [{ key: 'history', label: 'Diterima' }] : []),
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`pb-1.5 pt-1.5 transition-all relative hover:text-maroon ${activeTab === item.key ? 'nav-active text-maroon' : 'nav-inactive text-gray-500'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { key: 'home', label: 'Beranda' },
                  { key: 'jobs', label: 'Lowongan' },
                  ...(userType !== 'admin' ? [{ key: 'saved', label: 'Tersimpan' }] : []),
                  ...(userType !== 'admin' ? [{ key: 'history', label: 'Diterima' }] : []),
                  ...(userType === 'admin'
                    ? [
                        { key: 'admin-diterima', label: 'Diterima' },
                        { key: 'admin', label: 'Admin Panel' },
                        { key: 'admin-akun', label: 'Akun' },
                      ]
                    : []),
                  ...(userType !== 'admin' ? [{ key: 'profile', label: 'Akun' }] : []),
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`pb-1.5 pt-1.5 transition-all relative hover:text-maroon ${activeTab === item.key ? 'nav-active text-maroon' : 'nav-inactive text-gray-500'}`}
                  >
                    {item.label}
                    {activeTab === item.key && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-gradient-to-r from-maroon to-maroon-light rounded-full shadow-[0_2px_8px_rgba(61,10,20,0.5)]" />
                    )}
                  </button>
                ))}
                <div className="hidden md:flex items-center gap-4">
                  {!isLoggedIn ? (
                    <button
                      onClick={() => handleNavClick('login')}
                      className="bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_14px_rgba(61,10,20,0.4)] hover:shadow-[0_6px_20px_rgba(61,10,20,0.5)] hover:-translate-y-0.5 transition-all"
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-[0_4px_14px_rgba(61,10,20,0.4)] hover:shadow-[0_6px_20px_rgba(61,10,20,0.5)] hover:-translate-y-0.5 transition-all"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn && (
              <button
                onClick={() => handleNavClick('login')}
                className="bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_14px_rgba(61,10,20,0.4)] hover:shadow-[0_6px_20px_rgba(61,10,20,0.5)] hover:-translate-y-0.5 transition-all"
              >
                Login
              </button>
            )}
          </div>

          <button
            className="md:hidden text-2xl text-gray-700 bg-white shadow-sm w-10 h-10 rounded-xl flex items-center justify-center border border-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </nav>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-4 flex flex-col gap-2 z-40 shadow-xl absolute w-full left-0 top-[72px] max-h-[80vh] overflow-y-auto">
          {[
            { key: 'home', label: 'Beranda' },
            { key: 'jobs', label: 'Lowongan' },
            ...(userType !== 'admin' ? [{ key: 'saved', label: 'Tersimpan' }] : []),
            ...(userType !== 'admin' ? [{ key: 'history', label: 'Diterima' }] : []),
            ...(userType === 'admin'
              ? [
                  { key: 'admin-diterima', label: 'Diterima' },
                  { key: 'admin', label: 'Admin Panel' },
                  { key: 'admin-akun', label: 'Akun' },
                ]
              : []),
            ...(userType !== 'admin' ? [{ key: 'profile', label: 'Akun' }] : []),
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`text-left text-sm font-semibold uppercase tracking-wider py-3 border-b border-gray-100 transition-all duration-200 hover:text-maroon ${activeTab === item.key ? 'text-maroon font-bold' : 'text-gray-600'}`}
            >
              {item.label}
            </button>
          ))}
          {!isLoggedIn ? (
            <button
              onClick={() => handleNavClick('login')}
              className="text-left text-sm font-semibold uppercase tracking-wider py-3 text-white bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] rounded-xl px-4 flex items-center gap-2 shadow-[0_4px_14px_rgba(61,10,20,0.4)] hover:shadow-[0_6px_20px_rgba(61,10,20,0.5)] transition-all mt-2"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="text-left text-sm font-semibold uppercase tracking-wider py-3 text-white bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] rounded-xl px-4 flex items-center gap-2 shadow-[0_4px_14px_rgba(61,10,20,0.4)] hover:shadow-[0_6px_20px_rgba(61,10,20,0.5)] transition-all mt-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          )}
        </div>
      )}

      {showAdminPwd && (
        <AdminPasswordModal
          onSuccess={() => {
            setIsAdminAuth(true);
            setShowAdminPwd(false);
            setActiveTab('admin');
            setCurrentUser({ id: 1, nama: 'Admin SkillShift', email: 'admin@skillshift.com' });
          }}
          onClose={() => setShowAdminPwd(false)}
        />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          profile={profile}
          savedJobs={savedJobs}
          acceptedJobs={acceptedJobs}
          onToggleSave={toggleSave}
          onClose={() => setSelectedJob(null)}
          onMarkAccepted={handleMarkAccepted}
        />
      )}

      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-lg overflow-y-auto py-10 p-4">
          <div className="bg-white p-8 md:p-10 max-w-2xl w-full mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-slide-up max-h-[90vh] overflow-y-auto rounded-[32px] border border-white">
            <h3 className="text-3xl font-black serif mb-8 text-gray-900 border-b border-gray-100 pb-4">
              {editingJobId ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}
            </h3>
            <form onSubmit={handleSaveAdminJob} className="grid grid-cols-2 gap-5">
              <div className="col-span-2 mb-2">
                <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">
                  Foto Lowongan
                </label>
                <div
                  onClick={() => adminImageInputRef.current?.click()}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 hover:border-maroon hover:bg-maroon/5 transition-all cursor-pointer rounded-2xl overflow-hidden flex items-center justify-center shadow-inner"
                  style={{ minHeight: 140 }}
                >
                  {adminImagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={adminImagePreview}
                        alt="preview"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                        <span className="text-white text-xs font-black uppercase tracking-widest bg-black/50 px-5 py-2.5 rounded-xl backdrop-blur-sm">
                          Ganti Foto
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-8">
                      <svg
                        className="w-10 h-10 text-gray-300 drop-shadow-sm"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Klik untuk upload foto
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={adminImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAdminImageUpload}
                />
              </div>

              {[
                {
                  key: 'title',
                  label: 'Judul Posisi',
                  full: true,
                  place: 'Contoh: UI/UX Designer',
                },
                { key: 'company', label: 'Nama Perusahaan', place: 'Contoh: TechNova' },
                { key: 'location', label: 'Lokasi', place: 'Contoh: Jakarta Pusat' },
                { key: 'hours', label: 'Jam Kerja', place: 'Contoh: 20 Jam / Minggu' },
                { key: 'salary', label: 'Gaji', place: 'Contoh: Rp 3.000.000' },
                { key: 'contactEmail', label: 'Email Kontak', place: 'hr@perusahaan.com' },
                { key: 'contactPhone', label: 'WhatsApp', place: '628123...' },
              ].map(({ key, label, full, place }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">
                    {label}
                  </label>
                  <input
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all font-bold text-gray-800 shadow-sm"
                    placeholder={place}
                    value={adminForm[key]}
                    onChange={(e) => setAdminForm({ ...adminForm, [key]: e.target.value })}
                    required={['title', 'company', 'location'].includes(key)}
                  />
                </div>
              ))}

              {[
                { key: 'type', label: 'Tipe Kerja', opts: ['Onsite', 'Remote', 'Hybrid'] },
                {
                  key: 'category',
                  label: 'Kategori',
                  opts: ['F&B', 'IT', 'Kreatif', 'Pendidikan', 'Logistik', 'Kesehatan', 'Lainnya'],
                },
              ].map(({ key, label, opts }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">
                    {label}
                  </label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all font-bold text-gray-800 appearance-none shadow-sm"
                    value={adminForm[key]}
                    onChange={(e) => setAdminForm({ ...adminForm, [key]: e.target.value })}
                  >
                    {opts.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">
                  Min. Usia
                </label>
                <input
                  type="number"
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all font-bold text-gray-800 shadow-sm"
                  value={adminForm.minAge}
                  onChange={(e) => setAdminForm({ ...adminForm, minAge: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">
                  Skills (pisah koma)
                </label>
                <input
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all font-bold text-gray-800 shadow-sm"
                  value={adminForm.skills}
                  onChange={(e) => setAdminForm({ ...adminForm, skills: e.target.value })}
                  placeholder="Figma, Canva, dll"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">
                  Deskripsi Pekerjaan
                </label>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all resize-none font-medium text-gray-800 shadow-sm"
                  rows={4}
                  value={adminForm.description}
                  onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
                  placeholder="Deskripsikan pekerjaan secara detail..."
                />
              </div>
              <div className="col-span-2 flex gap-4 pt-6 border-t border-gray-100 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white py-3 text-xs font-black uppercase tracking-widest hover:shadow-[0_8px_20px_rgba(61,10,20,0.4)] hover:-translate-y-1 transition-all rounded-lg"
                >
                  {editingJobId ? 'Update Lowongan' : 'Simpan Lowongan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setAdminImagePreview(null);
                    setEditingJobId(null);
                  }}
                  className="px-8 border-2 border-gray-200 text-xs font-bold uppercase hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'home' && (
        <main className="animate-fade-in flex-1 pt-0">
          <section className="hero-section relative overflow-hidden pt-3 pb-8 px-6 md:px-10">
            <HeroDecoration />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
                <div className="w-full lg:w-1/2 relative z-20">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md shadow-sm border border-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#c99042] mb-8">
                    <span>✦</span> Temukan peluang terbaik untuk karirmu
                  </div>
                  <h1 className="hero-title font-black leading-[1.1] mb-6 text-gray-900 drop-shadow-sm">
                    Temukan Lowongan
                    <br />
                    Kerja yang <em className="hero-italic text-maroon drop-shadow-md">Tepat</em>
                  </h1>
                  <p className="text-gray-600 text-[16px] leading-relaxed max-w-lg mb-10 font-medium drop-shadow-sm">
                    Platform terpercaya untuk mahasiswa menemukan peluang kerja dan part-time
                    terbaik guna membangun karir cemerlang.
                  </p>
                  <button
                    onClick={() => handleNavClick('jobs')}
                    className="cta-btn inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-9 py-4 rounded-2xl font-black text-[14px] shadow-[0_4px_14px_rgba(139,24,42,0.4)] hover:shadow-[0_8px_24px_rgba(139,24,42,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Cari Lowongan Sekarang
                    <span className="text-xl">›</span>
                  </button>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col items-center">
                  <SlimGlassFrame>
                    <img
                      src="/icon/foto-utama.jpeg"
                      className="w-full h-[200px] md:h-[360px] object-cover rounded-[24px]"
                    />
                  </SlimGlassFrame>

                  <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white shadow-[0_10px_40px_rgba(0,0,0,.06)] rounded-[20px] grid grid-cols-3 mt-4 relative z-20 overflow-hidden min-h-[88px]">
                    {[
                      {
                        icon: '/images/icon-stats-lowongan.png',
                        v: jobs.length,
                        t: 'Lowongan Aktif',
                      },
                      {
                        icon: '/images/terima.png',
                        v: allAcceptedJobs.length,
                        t: 'User Diterima',
                      },
                      {
                        icon: '/images/icon-stats-kota.png',
                        v: allLocations.length - 1,
                        t: 'Kota Tersedia',
                      },
                    ].map((i, idx) => (
                      <div
                        key={i.t}
                        className="py-3 px-2 text-center border-r last:border-r-0 border-gray-100"
                      >
                        <div className="mb-1 flex items-center justify-center h-5">
                          <img src={i.icon} alt={i.t} className="w-5 h-5 object-contain" />
                        </div>

                        <div className="h-8 flex items-center justify-center">
                          {jobs.length === 0 && !jobs.length ? (
                            <div className="bg-gray-200 rounded animate-pulse w-8 h-6" />
                          ) : (
                            <span className="text-[28px] font-black text-maroon leading-none tabular-nums">
                              {i.v}
                            </span>
                          )}
                        </div>

                        <div className="text-[9px] uppercase tracking-[.18em] text-gray-400 font-bold mt-1">
                          {i.t}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="jobs-section" ref={jobsRef} className="px-6 md:px-10">
            <div className="max-w-7xl mx-auto scroll-mt-28">
              <div className="ref-filter-card">
                <div className="ref-filter-row">
                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Tipe Pekerjaan</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allTypes}
                        selected={filterType}
                        onSelect={setFilterType}
                      />
                    </div>
                    <div className="ref-filter-separator" />
                  </div>

                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Kategori</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allCategories}
                        selected={filterCategory[0] === 'Semua' ? 'Semua' : filterCategory[0]}
                        onSelect={(v) => setFilterCategory([v])}
                      />
                    </div>
                    <div className="ref-filter-separator" />
                  </div>

                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Lokasi</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allLocations}
                        selected={filterLocation[0] === 'Semua' ? 'Semua' : filterLocation[0]}
                        onSelect={(v) => setFilterLocation([v])}
                      />
                    </div>
                    <div className="ref-filter-separator" />
                  </div>

                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Skill</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allSkills}
                        selected={filterSkill[0] === 'Semua' ? 'Semua' : filterSkill[0]}
                        onSelect={(v) => setFilterSkill([v])}
                      />
                    </div>
                  </div>

                  <div className="ref-filter-search">
                    <button onClick={() => handleNavClick('jobs')} className="ref-search-btn">
                      <svg
                        className="ref-search-icon"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Cari Lowongan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 md:px-10 pb-20 relative z-0 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-gray-200/50 pb-6 gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                    <img
                      src="/images/lowongan terbaru.png"
                      alt="Lowongan"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-3xl drop-shadow-sm serif">
                      Lowongan Terbaru
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      Menampilkan {filteredJobs.length} lowongan yang sesuai dengan kriteria.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasActiveFilter && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('Semua');
                        setFilterHours('Semua');
                        setFilterCategory(['Semua']);
                        setFilterLocation(['Semua']);
                        setFilterSkill(['Semua']);
                        setFilterPosition(['Semua']);
                      }}
                      className="text-[11px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 bg-red-50 px-5 py-3 rounded-xl transition-all shadow-sm"
                    >
                      Reset Filter ✕
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick('jobs')}
                    className="text-sm font-black text-maroon border-2 border-maroon px-5 py-2.5 rounded-xl hover:bg-maroon hover:text-white transition-all"
                  >
                    Lihat Semua →
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      savedJobs={savedJobs}
                      onSave={toggleSave}
                      onSelect={setSelectedJob}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white/60 rounded-[32px] border border-white shadow-inner backdrop-blur-md">
                  <img
                    src="/images/search.png"
                    alt="search"
                    className="w-20 h-20 mx-auto mb-6 drop-shadow-md"
                  />
                  <p className="text-gray-800 text-xl font-black mb-2">
                    Tidak ada lowongan yang ditemukan.
                  </p>
                  <p className="text-gray-500 text-sm font-medium">
                    Coba ubah kriteria filter kamu untuk melihat hasil lain.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {activeTab === 'jobs' && (
        <main className="animate-fade-in flex-1">
          <section className="px-6 md:px-10 pt-10 pb-16">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10">
                <span className="text-[18px] font-black uppercase tracking-[0.28em] text-maroon">
                  Direktori
                </span>
                <h2 className="text-4xl md:text-5xl font-black serif text-gray-900 mt-1 drop-shadow-sm">
                  Semua Lowongan
                </h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">
                  Menampilkan {filteredJobs.length} lowongan yang sesuai dengan kriteria.
                </p>
              </div>

              <div className="ref-filter-card mb-10">
                <div className="ref-filter-row">
                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Tipe Pekerjaan</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allTypes}
                        selected={filterType}
                        onSelect={setFilterType}
                      />
                    </div>
                    <div className="ref-filter-separator" />
                  </div>

                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Kategori</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allCategories}
                        selected={filterCategory[0] === 'Semua' ? 'Semua' : filterCategory[0]}
                        onSelect={(v) => setFilterCategory([v])}
                      />
                    </div>
                    <div className="ref-filter-separator" />
                  </div>

                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Lokasi</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allLocations}
                        selected={filterLocation[0] === 'Semua' ? 'Semua' : filterLocation[0]}
                        onSelect={(v) => setFilterLocation([v])}
                      />
                    </div>
                    <div className="ref-filter-separator" />
                  </div>

                  <div className="ref-filter-item">
                    <div className="ref-filter-content">
                      <p className="ref-filter-label">Skill</p>
                      <PremiumDropdown
                        label="Semua"
                        options={allSkills}
                        selected={filterSkill[0] === 'Semua' ? 'Semua' : filterSkill[0]}
                        onSelect={(v) => setFilterSkill([v])}
                      />
                    </div>
                  </div>

                  <div className="flex-1 w-full mt-3 ml-6">
                    <div className="relative group">
                      <svg
                        className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b182a]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>

                      <input
                        type="text"
                        placeholder="Cari lowongan impianmu..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setSearchInputVal(e.target.value);
                        }}
                        className="
        w-full
        h-12
        pl-14
        pr-5
        rounded-full
        bg-white
        border-2
        border-[#8b182a]
        text-gray-800
        placeholder:text-gray-400
        shadow-md
        transition-all
        duration-300
        focus:outline-none
        focus:ring-4
        focus:ring-[#8b182a]/20
        focus:border-[#8b182a]
      "
                      />
                    </div>
                  </div>
                </div>
              </div>

              {(searchTerm || hasActiveFilter) && (
                <div className="flex items-center justify-between mb-8 bg-white/70 rounded-2xl px-5 py-3 border border-white shadow-sm backdrop-blur-md">
                  <p className="text-sm text-gray-600 font-bold">
                    {filteredJobs.length} hasil ditemukan
                    {searchTerm && (
                      <>
                        {' '}
                        untuk <span className="text-maroon font-black">"{searchTerm}"</span>
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchInputVal('');
                      setFilterType('Semua');
                      setFilterHours('Semua');
                      setFilterCategory(['Semua']);
                      setFilterLocation(['Semua']);
                      setFilterSkill(['Semua']);
                      setFilterPosition(['Semua']);
                      setSearchOpen(false);
                    }}
                    className="text-[11px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 bg-red-50 px-4 py-2 rounded-xl transition-all"
                  >
                    Reset ✕
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      savedJobs={savedJobs}
                      onSave={toggleSave}
                      onSelect={setSelectedJob}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white/60 rounded-[32px] border border-white shadow-inner backdrop-blur-md">
                  <img
                    src="/images/search.png"
                    alt="search"
                    className="w-20 h-20 mx-auto mb-6 drop-shadow-md"
                  />
                  <p className="text-gray-800 text-xl font-black mb-2">
                    Tidak ada lowongan yang ditemukan.
                  </p>
                  <p className="text-gray-500 text-sm font-medium mb-8">
                    Coba ubah keyword atau filter untuk melihat hasil lain.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchInputVal('');
                      setFilterType('Semua');
                      setFilterCategory(['Semua']);
                      setFilterLocation(['Semua']);
                      setFilterSkill(['Semua']);
                      setSearchOpen(false);
                    }}
                    className="bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-8 py-4 text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {activeTab === 'profile' && (
        <div className="animate-fade-in px-4 py-6 sm:px-6 md:py-8 md:px-10 max-w-6xl mx-auto w-full max-w-full overflow-hidden">
          <div className="mb-6 sm:mb-8 border-b border-gray-200/50 pb-4 sm:pb-6">
            <span className="text-xs sm:text-sm md:text-[18px] font-black uppercase tracking-[0.2em] sm:tracking-[0.28em] text-maroon">
              Akun Saya
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black serif text-gray-900 mt-1 leading-tight">
              Profil Saya
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
              <div className="relative bg-white rounded-2xl sm:rounded-[28px] overflow-hidden border border-gray-100 shadow-sm">
                <div className="h-1 sm:h-[3px] bg-gradient-to-r from-[#6b1020] via-[#c99042] to-[#6b1020]" />
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    <label className="relative flex-shrink-0 cursor-pointer self-center sm:self-start">
                      <div
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center"
                        style={{
                          boxShadow:
                            '0 0 0 3px rgba(201,144,66,0.3), 0 8px 24px rgba(107,16,32,0.15)',
                        }}
                      >
                        {profile.foto ? (
                          <img
                            src={profile.foto}
                            alt="foto"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src="/icon/icon-profile.png"
                            alt="profile"
                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                          />
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#c99042] rounded-full border-2 border-white flex items-center justify-center shadow-md">
                        <img
                          src="/icon/icon-edit.png"
                          alt="edit"
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 object-contain"
                        />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onload = (ev) => setProfile((p) => ({ ...p, foto: ev.target.result }));
                          r.readAsDataURL(f);
                        }}
                      />
                    </label>

                    <div className="flex-1 w-full min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                      <div className="min-w-0 text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight break-words">
                          {profile.name}
                        </h2>

                        <p className="text-gray-400 text-sm font-medium mt-1 break-words">
                          {profile.universitas}
                        </p>

                        <p className="text-[#c99042] text-sm font-black break-words">
                          {profile.jurusan}
                        </p>
                      </div>

                      <div className="flex items-center justify-center sm:justify-end gap-3 sm:pt-1">
                        <button
                          onClick={() => setProfile((p) => ({ ...p, tersedia: !p.tersedia }))}
                          className={`flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
                            profile.tersedia
                              ? 'bg-[#FFFBF5] text-[#8A6A3B] border-[#E8D5B0]'
                              : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              profile.tersedia ? 'bg-[#C99042]' : 'bg-gray-400'
                            }`}
                          />
                          {profile.tersedia ? 'Siap Bekerja' : 'Tidak Tersedia'}
                        </button>

                        <button
                          onClick={() => {
                            setEditSection('mainProfile');
                            setEditTemp({
                              name: profile.name,
                              universitas: profile.universitas,
                              jurusan: profile.jurusan,
                              phone: profile.phone,
                              linkedin: profile.linkedin,
                              lokasi: profile.lokasi,
                              tanggalLahir: profile.tanggalLahir,
                              bahasa: profile.bahasa,
                            });
                          }}
                          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-100 text-[#c99042] text-[11px] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                        >
                          <img
                            src="/icon/icon-edit.png"
                            alt="edit"
                            className="w-3 h-3 object-contain"
                          />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  {editSection === 'mainProfile' && (
                    <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                      {[
                        ['name', 'Nama Lengkap'],
                        ['universitas', 'Universitas'],
                        ['jurusan', 'Jurusan'],
                        ['phone', 'Nomor Telepon'],
                        ['linkedin', 'LinkedIn'],
                        ['lokasi', 'Lokasi'],
                      ].map(([key, label]) => (
                        <div key={key} className="col-span-1 sm:col-span-1">
                          <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 sm:mb-2 block">
                            {label}
                          </label>
                          <input
                            value={editTemp[key] || ''}
                            onChange={(e) =>
                              setEditTemp((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none focus:border-[#6b1020] bg-white"
                          />
                        </div>
                      ))}
                      <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                          onClick={() => {
                            setProfile((prev) => ({
                              ...prev,
                              name: editTemp.name || 'Pengguna SkillShift',
                              universitas: editTemp.universitas || 'Belum diisi',
                              jurusan: editTemp.jurusan || 'Belum diisi',
                              phone: editTemp.phone || 'Belum diisi',
                              linkedin: editTemp.linkedin || 'Belum diisi',
                              lokasi: editTemp.lokasi || 'Belum diisi',
                              tersedia: editTemp.tersedia,
                            }));
                            setEditTemp({});
                            setEditSection(null);
                          }}
                          className="flex-1 bg-[#6b1020] text-white px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-black uppercase min-h-[44px]"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditTemp({});
                            setEditSection(null);
                          }}
                          className="flex-1 border border-gray-200 px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-black text-gray-500 uppercase min-h-[44px]"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {[
                {
                  section: 'tentang',
                  icon: '/icon/icon-description.png',
                  iconAlt: 'description',
                  title: 'Tentang Saya',
                  value: profile.tentang,
                  editTempKey: 'tentang',
                  type: 'textarea',
                  rows: 4,
                },
                {
                  section: 'kontak',
                  icon: '/icon/icon-informasi.png',
                  iconAlt: 'informasi',
                  title: 'Informasi Kontak',
                  type: 'contact-grid',
                  items: [
                    ['email', 'Email', '/icon/icon-email.png', profile.email],
                    ['phone', 'Telepon', '/icon/icon-kontak.png', profile.phone],
                    ['linkedin', 'LinkedIn', '/icon/icon-link.png', profile.linkedin],
                  ],
                },
                {
                  section: 'tambahan',
                  icon: '/icon/lainnya.png',
                  iconAlt: 'informasi',
                  title: 'Informasi Tambahan',
                  type: 'info-list',
                  items: [
                    ['/icon/icon-stats-kota.png', 'Lokasi', profile.lokasi],
                    ['/icon/icon-kalender.png', 'Tanggal Lahir', profile.tanggalLahir],
                    ['/icon/icon-bahasa.png', 'Bahasa', profile.bahasa],
                  ],
                },
              ].map(({ section, icon, iconAlt, title, type, value, editTempKey, rows, items }) => (
                <div
                  key={section}
                  className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-sm p-4 sm:p-5 md:p-6"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#6b1020]/10 flex items-center justify-center">
                        <img
                          src={icon}
                          alt={iconAlt}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain"
                        />
                      </div>
                      <h3 className="font-black text-gray-900 text-sm sm:text-[15px]">{title}</h3>
                    </div>
                    <button
                      onClick={() => {
                        setEditSection(section);
                        if (editTempKey) setEditTemp({ [editTempKey]: value });
                        else if (type === 'contact-grid') {
                          setEditTemp({
                            email: profile.email,
                            phone: profile.phone,
                            linkedin: profile.linkedin,
                          });
                        } else if (type === 'info-list') {
                          setEditTemp({
                            lokasi: profile.lokasi,
                            tanggalLahir: profile.tanggalLahir,
                            bahasa: profile.bahasa,
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-[#c99042] border border-[#c99042]/20 rounded-lg px-2 sm:px-3 py-1.5 hover:bg-[#c99042]/10 transition-all min-w-[44px] min-h-[36px] justify-center"
                    >
                      <img
                        src="/icon/icon-edit.png"
                        alt="edit"
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 object-contain"
                      />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </div>

                  {editSection === section && (
                    <div className="flex flex-col gap-3">
                      {type === 'textarea' && (
                        <textarea
                          rows={rows}
                          value={editTemp[editTempKey] || ''}
                          onChange={(e) =>
                            setEditTemp((t) => ({ ...t, [editTempKey]: e.target.value }))
                          }
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:border-[#6b1020] resize-none bg-gray-50"
                        />
                      )}
                      {type === 'contact-grid' &&
                        items?.map(([k, l, ico]) => (
                          <div key={k}>
                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                              <img src={ico} alt={l} className="w-3 h-3 object-contain" />
                              {l}
                            </label>
                            <input
                              value={editTemp[k] || ''}
                              onChange={(e) => setEditTemp((t) => ({ ...t, [k]: e.target.value }))}
                              className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium outline-none focus:border-[#6b1020] bg-gray-50"
                            />
                          </div>
                        ))}
                      {type === 'info-list' &&
                        items?.map(([k, l, ico]) => (
                          <div key={k}>
                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                              <img src={ico} alt={l} className="w-3 h-3 object-contain" />
                              {l}
                            </label>
                            <input
                              value={editTemp[k] || ''}
                              onChange={(e) => setEditTemp((t) => ({ ...t, [k]: e.target.value }))}
                              className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium outline-none focus:border-[#6b1020] bg-gray-50"
                            />
                          </div>
                        ))}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => {
                            if (editTempKey)
                              setProfile((p) => ({ ...p, [editTempKey]: editTemp[editTempKey] }));
                            else setProfile((p) => ({ ...p, ...editTemp }));
                            setEditSection(null);
                          }}
                          className="flex-1 bg-[#6b1020] text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-sm min-h-[44px]"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditSection(null)}
                          className="flex-1 border border-gray-200 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase text-gray-500 min-h-[44px]"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {editSection !== section && (
                    <>
                      {type === 'textarea' && (
                        <p className="text-gray-500 text-sm leading-relaxed font-medium break-words">
                          {value}
                        </p>
                      )}
                      {type === 'contact-grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {items?.map(([_, label, ico, val]) => (
                            <div
                              key={label}
                              className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100"
                            >
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                                <img src={ico} alt={label} className="w-3 h-3 object-contain" />
                                {label}
                              </p>
                              <p className="text-[12px] sm:text-[13px] font-bold text-gray-700 break-words truncate">
                                {val || '-'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {type === 'info-list' && (
                        <div className="flex flex-col">
                          {items?.map(([icon, label, val], idx, arr) => (
                            <div
                              key={label}
                              className={`flex items-start gap-3 sm:gap-4 py-2.5 sm:py-3 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                              <img
                                src={icon}
                                alt={label}
                                className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0 mt-0.5"
                              />
                              <span className="w-24 sm:w-32 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-400 flex-shrink-0">
                                {label}
                              </span>
                              <span className="text-[12px] sm:text-[13px] font-semibold text-gray-700 break-words">
                                {val || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-sm p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#c99042]/15 flex items-center justify-center">
                    <img
                      src="/icon/icon-skills.png"
                      alt="skills"
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain"
                    />
                  </div>
                  <h3 className="font-black text-gray-900 text-sm sm:text-[15px]">Keahlian</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s, i) => (
                    <div key={i} className="group relative">
                      <span className="bg-[#fdf8f0] border border-[#e8d5b0] text-[#7a5020] text-[10px] sm:text-[11px] font-black px-2.5 sm:px-3 py-1.5 rounded-xl block break-words">
                        {s}
                      </span>
                      <button
                        onClick={() =>
                          setProfile((p) => ({
                            ...p,
                            skills: p.skills.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] hidden group-hover:flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {editSection === 'skill' ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      autoFocus
                      value={editTemp.skill || ''}
                      onChange={(e) => setEditTemp((t) => ({ ...t, skill: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editTemp.skill) {
                          setProfile((p) => ({ ...p, skills: [...p.skills, editTemp.skill] }));
                          setEditTemp({});
                          setEditSection(null);
                        }
                        if (e.key === 'Escape') setEditSection(null);
                      }}
                      placeholder="Ketik skill..."
                      className="flex-1 border border-[#c99042] rounded-xl px-3 py-2 text-sm outline-none bg-gray-50 min-h-[44px]"
                    />
                    <button
                      onClick={() => {
                        if (editTemp.skill) {
                          setProfile((p) => ({ ...p, skills: [...p.skills, editTemp.skill] }));
                          setEditTemp({});
                          setEditSection(null);
                        }
                      }}
                      className="bg-[#6b1020] text-white px-4 py-2 rounded-xl text-xs font-black min-h-[44px]"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditSection('skill')}
                    className="mt-3 w-full border border-dashed border-[#c99042]/50 text-[#c99042] text-[10px] sm:text-[11px] font-black py-2.5 sm:py-2 rounded-xl hover:bg-[#fdf8f0] transition-all uppercase tracking-wider min-h-[44px]"
                  >
                    + Tambah Skill
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-sm p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#c99042]/15 flex items-center justify-center shadow-sm">
                    <img
                      src="/icon/pendidikan.png"
                      alt="pendidikan"
                      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                    />
                  </div>
                  <h3 className="font-black text-gray-900 text-sm sm:text-[15px]">
                    Riwayat Pendidikan
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {profile.pendidikan.map((p, i) => (
                    <div
                      key={i}
                      className="relative bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 pb-14 sm:pb-16 border border-gray-100 overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6b1020] to-[#c99042] rounded-l-xl sm:rounded-l-2xl" />
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex gap-1.5 sm:gap-2">
                        <button
                          onClick={() => {
                            setEditSection('pendidikan');
                            setEditTemp({
                              index: i,
                              institusi: p.institusi,
                              jurusan: p.jurusan,
                              tahun: p.tahun,
                            });
                          }}
                          className="text-[9px] sm:text-[10px] font-black text-[#c99042] bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-[#c99042] hover:text-white transition-all min-h-[32px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              pendidikan: prev.pendidikan.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="text-[9px] sm:text-[10px] font-black text-red-500 bg-white border border-red-100 px-2 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all min-h-[32px]"
                        >
                          Hapus
                        </button>
                      </div>
                      <p className="font-black text-gray-900 text-[12px] sm:text-[13px] pl-3 break-words">
                        {p.institusi}
                      </p>
                      <p className="text-gray-400 text-[11px] sm:text-[12px] font-medium mt-0.5 pl-3 break-words">
                        {p.jurusan}
                      </p>
                      <p className="text-[#c99042] text-[10px] sm:text-[11px] font-black mt-0.5 pl-3">
                        {p.tahun}
                      </p>
                    </div>
                  ))}
                </div>
                {editSection === 'pendidikan' ? (
                  <div className="mt-3 flex flex-col gap-2">
                    {[
                      ['institusi', 'Nama Institusi'],
                      ['jurusan', 'Jurusan'],
                      ['tahun', 'Tahun'],
                    ]?.map(([k, pl]) => (
                      <input
                        key={k}
                        placeholder={pl}
                        value={editTemp[k] || ''}
                        onChange={(e) => setEditTemp((t) => ({ ...t, [k]: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6b1020] bg-gray-50"
                      />
                    ))}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (editTemp.institusi) {
                            const dataPendidikan = {
                              institusi: editTemp.institusi,
                              jurusan: editTemp.jurusan || '',
                              tahun: editTemp.tahun || '',
                            };
                            const pendidikanBaru =
                              editTemp.index !== undefined
                                ? profile.pendidikan.map((item, idx) =>
                                    idx === editTemp.index ? dataPendidikan : item
                                  )
                                : [...profile.pendidikan, dataPendidikan];
                            setProfile((p) => ({ ...p, pendidikan: pendidikanBaru }));
                            setEditTemp({});
                            setEditSection(null);
                          }
                        }}
                        className="flex-1 bg-[#6b1020] text-white px-4 py-2 rounded-xl text-xs font-black min-h-[44px]"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditSection(null)}
                        className="flex-1 border border-gray-200 px-4 py-2 rounded-xl text-xs font-black text-gray-500 min-h-[44px]"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditSection('pendidikan')}
                    className="mt-3 w-full border border-dashed border-[#c99042]/50 text-[#c99042] text-[10px] sm:text-[11px] font-black py-2.5 sm:py-2 rounded-xl hover:bg-[#fdf8f0] transition-all uppercase tracking-wider min-h-[44px]"
                  >
                    + Tambah Pendidikan
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-sm p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#c99042]/15 flex items-center justify-center shadow-sm">
                    <img
                      src="/icon/icon-deskripsi.png"
                      alt="pengalaman"
                      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                    />
                  </div>
                  <h3 className="font-black text-gray-900 text-sm sm:text-[15px]">Pengalaman</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {profile.pengalaman.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#fdf8f0] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#e8d5b0]/40"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#e8d5b0] flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-[12px] sm:text-[13px] break-words">
                          {p.posisi}
                        </p>
                        <p className="text-gray-500 text-[11px] sm:text-[12px] font-medium break-words">
                          {p.tempat}
                        </p>
                        <p className="text-[#c99042] text-[10px] sm:text-[11px] font-black">
                          {p.tahun}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setProfile((p2) => ({
                            ...p2,
                            pengalaman: p2.pengalaman.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="text-gray-300 hover:text-red-400 transition-colors text-sm flex-shrink-0 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {editSection === 'pengalaman' ? (
                  <div className="mt-3 flex flex-col gap-2">
                    {[
                      ['posisi', 'Posisi/Jabatan'],
                      ['tempat', 'Tempat'],
                      ['tahun', 'Tahun'],
                    ]?.map(([k, pl]) => (
                      <input
                        key={k}
                        placeholder={pl}
                        value={editTemp[k] || ''}
                        onChange={(e) => setEditTemp((t) => ({ ...t, [k]: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6b1020] bg-gray-50"
                      />
                    ))}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (editTemp.posisi) {
                            setProfile((p) => ({
                              ...p,
                              pengalaman: [
                                ...p.pengalaman,
                                {
                                  posisi: editTemp.posisi,
                                  tempat: editTemp.tempat || '',
                                  tahun: editTemp.tahun || '',
                                  icon: '💼',
                                },
                              ],
                            }));
                            setEditTemp({});
                            setEditSection(null);
                          }
                        }}
                        className="flex-1 bg-[#6b1020] text-white px-4 py-2 rounded-xl text-xs font-black min-h-[44px]"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditSection(null)}
                        className="flex-1 border border-gray-200 px-4 py-2 rounded-xl text-xs font-black text-gray-500 min-h-[44px]"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditSection('pengalaman')}
                    className="mt-3 w-full border border-dashed border-[#c99042]/50 text-[#c99042] text-[10px] sm:text-[11px] font-black py-2.5 sm:py-2 rounded-xl hover:bg-[#fdf8f0] transition-all uppercase tracking-wider min-h-[44px]"
                  >
                    + Tambah Pengalaman
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'saved' && !isAdminAuth && (
        <div className="animate-fade-in p-6 md:p-10 max-w-5xl mx-auto w-full pt-0">
          <div className="flex items-end justify-between mb-10 border-b border-gray-200/50 pb-6">
            <div>
              <span className="text-[18px] font-black uppercase tracking-[0.28em] text-maroon">
                Bookmark
              </span>
              <h2 className="text-4xl md:text-5xl font-black serif text-gray-900 mt-2 drop-shadow-sm">
                Loker Disimpan
              </h2>
              <p className="text-gray-500 text-sm mt-3 font-medium">
                Kamu memiliki {savedJobs.length} lowongan tersimpan menunggu untuk dilamar.
              </p>
            </div>
          </div>
          {savedJobs.length === 0 ? (
            <div className="text-center py-28 bg-white/60 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-sm">
              <p className="mb-6">
                <img src="/images/icon-bookmark.png" alt="bookmark" className="w-20 h-20 mx-auto" />
              </p>
              <p className="text-gray-800 text-xl font-black mb-2">
                Belum ada loker yang disimpan.
              </p>
              <p className="text-gray-500 text-sm font-medium mb-8">
                Eksplorasi direktori untuk menemukan pekerjaan impianmu.
              </p>
              <button
                onClick={() => handleNavClick('jobs')}
                className="bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-10 py-4 text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_8px_20px_rgba(61,10,20,0.4)] hover:-translate-y-1 transition-all"
              >
                Jelajahi Lowongan
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {savedJobs.map((j) => (
                <div
                  key={j.id}
                  className="bg-white/80 backdrop-blur-md p-6 border border-gray-100 hover:shadow-[0_16px_40px_rgba(139,24,42,0.08)] hover:border-maroon/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[24px] shadow-sm group"
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 hidden sm:block relative">
                      <img
                        src={
                          j.image ||
                          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400'
                        }
                        alt="img"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg sm:text-xl truncate sm:block text-gray-900 leading-tight mb-1 break-words hyphens-auto">
                        {j.title}
                      </h3>
                      <div className="flex flex-col mt-1">
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                          <img src="/images/icon-gedung.png" alt="gedung" className="w-4 h-4" />
                          {j.company}
                        </p>
                        <p className="text-sm text-gray-900 font-black flex items-center gap-1 mt-0.5">
                          <img src="/images/icon-gaji.png" alt="gaji" className="w-4 h-4" />
                          {j.salary}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() => setSelectedJob(j)}
                      className="flex-1 md:flex-none text-xs font-black uppercase tracking-widest px-8 py-4 border-2 border-gray-200 text-gray-600 hover:border-maroon hover:text-maroon transition-all rounded-xl"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => toggleSave(j)}
                      className="flex-1 md:flex-none text-xs font-black uppercase tracking-widest px-8 py-4 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all rounded-xl shadow-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-fade-in p-6 md:p-10 max-w-5xl mx-auto w-full pt-0">
          <div className="border-b border-gray-200/50 pb-6 mb-10">
            <span className="text-[18px] font-black uppercase tracking-[0.28em] text-[#8B1538]">
              Riwayat Karir
            </span>
            <h2 className="text-4xl md:text-5xl font-black serif text-gray-900 mt-2 drop-shadow-sm">
              Diterima
            </h2>
            <p className="text-gray-500 text-sm mt-3 font-medium">
              Selamat! {acceptedJobs.length} perusahaan telah menerima kamu.
            </p>
          </div>
          {acceptedJobs.length === 0 ? (
            <div className="relative overflow-hidden rounded-[32px] border border-[#e8d5b0]/40 bg-white py-20 px-10 text-center shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8B1538] to-transparent" />

              <div className="relative z-10 mx-auto mb-8 w-20 h-20">
                <svg
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A32238" />
                      <stop offset="100%" stopColor="#8B1538" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    stroke="url(#trophyGold)"
                    strokeWidth="0.8"
                    strokeOpacity="0.4"
                  />
                  <circle cx="40" cy="40" r="32" fill="#FCE8EB" />
                  <path
                    d="M28 24h24v16c0 8.8-5.4 13-12 13s-12-4.2-12-13V24z"
                    stroke="#8B1538"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M28 30c-4 0-6 2-6 6s2 6 6 6M52 30c4 0 6 2 6 6s-2 6-6 6"
                    stroke="#8B1538"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M34 53h12M40 53v6"
                    stroke="#8B1538"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path d="M32 59h16" stroke="#8B1538" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>

              <div className="relative z-10">
                <p className="text-[18px] font-black uppercase tracking-[0.35em] text-[#8B1538] mb-3">
                  Riwayat Karir
                </p>
                <h3 className="font-black text-gray-900 text-2xl serif mb-3">
                  Belum Ada Pencapaian
                </h3>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#8B1538] to-transparent mx-auto mb-4" />
                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed font-medium mb-8">
                  Lamar lowongan impianmu, lalu tandai sebagai{' '}
                  <span className="text-[#8B1538] font-black">Diterima</span> untuk mencatat
                  perjalanan karirmu di sini.
                </p>
                <button
                  onClick={() => handleNavClick('jobs')}
                  className="bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Jelajahi Lowongan →
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedJobs.map((j) => (
                <AcceptedCard
                  key={j.id}
                  job={j}
                  onRemove={() => setAcceptedJobs((prev) => prev.filter((a) => a.id !== j.id))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && isAdminAuth && (
        <div className="animate-fade-in p-6 md:p-10 max-w-6xl mx-auto w-full pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200/60 pb-6 mb-10 gap-4">
            <div>
              <span className="text-[18px] font-black uppercase tracking-[0.28em] text-maroon flex items-center gap-2">
                <img
                  src="/images/gembok.png"
                  alt="admin"
                  className="w-5 h-5 align-middle -mt-0.5"
                />
                Mode Administrator
              </span>
              <h2 className="text-4xl md:text-5xl font-black serif text-gray-900 mt-2 drop-shadow-sm">
                Dashboard
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="bg-gradient-to-r from-[#6b1020] to-[#8b1a2e] text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:shadow-[0_8px_20px_rgba(61,10,20,0.4)] hover:-translate-y-1 transition-all rounded-xl shadow-md"
              >
                + Tambah Lowongan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Lowongan',
                value: jobs.length,
                accent: '#8b182a',
                iconImg: '/images/icon-deskripsi.png',
                iconAlt: 'description',
              },
              {
                label: 'User Diterima',
                value: allAcceptedJobs.length,
                accent: '#1e293b',
                iconImg: '/images/terima.png',
                iconAlt: 'diterima',
              },
              {
                label: 'Kota Jangkauan',
                value: allLocations.length - 1,
                accent: '#c99042',
                iconImg: '/images/icon-stats-kota.png',
                iconAlt: 'kota',
              },
              {
                label: 'Kategori Aktif',
                value: allCategories.length - 1,
                accent: '#059669',
                iconImg: '/images/icon-user-admin.png',
                iconAlt: 'kategori',
              },
            ].map(({ label, value, accent, iconImg, iconAlt, iconEmoji }) => (
              <div
                key={label}
                className="bg-white/70 backdrop-blur-sm border border-gray-200/50 p-2 relative overflow-hidden hover:bg-white/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all rounded-2xl shadow-sm hover:scale-[1.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/40 to-transparent" />
                <div className="flex flex-col items-center justify-center text-center gap-0.5 py-2">
                  <div className="text-xl drop-shadow-sm">
                    {iconImg ? (
                      <img
                        src={iconImg}
                        alt={iconAlt}
                        className="w-5 h-5 object-contain opacity-80"
                      />
                    ) : (
                      iconEmoji
                    )}
                  </div>
                  <p
                    className="text-xl font-bold text-gray-800 tabular-nums"
                    style={{
                      color: accent,
                    }}
                  >
                    {value}
                  </p>
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <h3 className="text-2xl font-black serif mb-6 text-gray-900 flex items-center gap-3 drop-shadow-sm">
            <span className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-xl text-lg">
              <img src="/images/icon-deskripsi.png" alt="description" className="w-4 h-4" />
            </span>{' '}
            Manajemen Lowongan
          </h3>
          <div className="flex flex-col gap-4">
            {jobs.map((job) => {
              const jobAcceptedBy = allAcceptedJobs.filter((a) => a.jobId === job.id);
              return (
                <div key={job.id} className="w-full">
                  <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-[0_12px_30px_rgba(139,24,42,0.06)] hover:border-maroon/20 transition-all rounded-2xl shadow-sm group w-full overflow-hidden">
                    <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                      {job.image && (
                        <img
                          src={job.image}
                          alt={job.title}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover flex-shrink-0 rounded-xl shadow-inner group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span
                            className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-1 border rounded-md shadow-sm ${typeColor[job.type] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                          >
                            {job.type}
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-white border border-gray-100 px-2 md:px-3 py-1 rounded-md">
                            {job.category}
                          </span>
                        </div>
                        <h4 className="font-black text-base md:text-xl text-gray-900 leading-tight mb-1 truncate w-full">
                          {job.title}
                        </h4>
                        <div className="flex flex-col gap-1 text-xs md:text-sm font-medium">
                          <span className="flex items-center gap-2 text-gray-600">
                            <img
                              src="/images/icon-gedung.png"
                              alt="perusahaan"
                              className="w-3 h-3 md:w-4 md:h-4"
                            />
                            <span className="truncate">{job.company}</span>
                          </span>

                          <span className="flex items-center gap-2 text-gray-800 font-bold">
                            <img
                              src="/images/icon-location.png"
                              alt="lokasi"
                              className="w-3 h-3 md:w-4 md:h-4"
                            />
                            <span className="truncate">{job.location}</span>
                          </span>

                          <span className="flex items-center gap-2 text-maroon font-black">
                            <img
                              src="/images/icon-gaji.png"
                              alt="gaji"
                              className="w-3 h-3 md:w-4 md:h-4"
                            />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center flex-shrink-0 self-center">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-[10px] md:text-xs font-semibold uppercase tracking-wider px-3 md:px-4 py-2 bg-white border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F9FAFB] transition-all duration-300 rounded-lg shadow-sm"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="text-[10px] md:text-xs font-semibold uppercase tracking-wider px-3 md:px-4 py-2 bg-white border border-[#C8A2A2] text-[#8B4A4A] hover:bg-[#FDF2F2] transition-all duration-300 rounded-lg shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-[10px] md:text-xs font-semibold uppercase tracking-wider px-3 md:px-4 py-2 bg-white border border-[#D8B4B4] text-[#A44A4A] hover:bg-[#FEF2F2] transition-all duration-300 rounded-lg shadow-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  {jobAcceptedBy.length > 0 && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-[16px] p-4 ml-0 md:ml-6 mt-3">
                      <p className="text-[12px] font-black uppercase tracking-widest text-emerald-700 mb-3">
                        Diterima oleh ({jobAcceptedBy.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {jobAcceptedBy.map((accepted) => (
                          <div
                            key={accepted.id}
                            className="bg-white border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2"
                          >
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-gray-800">
                                {accepted.userName}
                              </p>
                              <p className="text-[10px] text-gray-500">{accepted.userEmail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'admin-diterima' && isAdminAuth && (
        <div className="animate-fade-in p-6 md:p-10 max-w-6xl mx-auto w-full pt-0">
          <div className="mb-10 border-b border-gray-200/60 pb-6">
            <span className="text-[18px] font-black uppercase tracking-[0.28em] text-maroon flex items-center gap-2">
              <img src="/images/gembok.png" alt="admin" className="w-5 h-5 align-middle -mt-0.5" />
              Administrator
            </span>
            <h2 className="text-4xl md:text-5xl font-black serif text-gray-900 mt-2 drop-shadow-sm">
              Pengguna yang Diterima
            </h2>
            <p className="text-gray-500 font-medium mt-2">
              List semua mahasiswa yang sudah menandai diterima untuk lowongan
            </p>
          </div>

          {allAcceptedJobs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {allAcceptedJobs.map((accepted) => (
                <div
                  key={accepted.id}
                  className="bg-white/80 backdrop-blur-md p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[0_12px_30px_rgba(139,24,42,0.06)] hover:border-maroon/20 transition-all rounded-[24px] shadow-sm group"
                >
                  <div className="flex items-start gap-6 flex-1">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <img
                        src="/icon/icon-accepted.png"
                        alt="accepted"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="text-[18px] font-black text-gray-800">
                          {new Date(accepted.acceptedDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h4 className="font-black text-lg text-gray-900 mb-1">{accepted.jobTitle}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-3">
                        <img src="/images/icon-gedung.png" alt="company" className="w-4 h-4" />
                        <span>{accepted.company}</span>

                        <span className="mx-1">·</span>

                        <img src="/images/icon-location.png" alt="location" className="w-4 h-4" />
                        <span className="font-bold">{accepted.location}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                          <img
                            src="/icon/icon-profile.png"
                            alt="user"
                            className="w-4 h-4 object-contain"
                          />
                          {accepted.userName}
                        </span>

                        <span className="text-sm text-gray-500">{accepted.userEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      Gaji
                    </p>

                    <div className="flex items-center justify-end gap-2">
                      <img
                        src="/images/icon-gaji.png"
                        alt="salary"
                        className="w-5 h-5 object-contain"
                      />

                      <p className="text-[18px] font-black text-maroon">{accepted.salary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-bold text-lg">
                Belum ada mahasiswa yang menandai diterima
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Data akan muncul ketika ada mahasiswa yang menandai lowongan
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin-akun' && isAdminAuth && (
        <div className="animate-fade-in p-6 md:p-10 max-w-6xl mx-auto w-full pt-0">
          <div className="mb-8 border-b border-gray-200/50 pb-6">
            <span className="text-[18px] font-black uppercase tracking-[0.28em] text-maroon flex items-center gap-2">
              <img src="/icon/gembok.png" alt="admin" className="w-5 h-5" />
              Administrator
            </span>
            <h2 className="text-4xl font-black serif text-gray-900 mt-1">Akun Admin</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="relative bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-sm">
                <div className="h-[3px] bg-gradient-to-r from-[#6b1020] via-[#c99042] to-[#6b1020]" />
                <div className="p-8 flex items-center gap-6">
                  <div
                    className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden"
                    style={{
                      boxShadow: '0 0 0 3px rgba(201,144,66,0.3), 0 8px 24px rgba(107,16,32,0.15)',
                    }}
                  >
                    <img
                      src="/icon/icon-profile.png"
                      alt="profile"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 leading-tight">
                        {currentUser?.nama || 'Administrator'}
                      </h2>
                      <p className="text-gray-400 text-sm font-medium mt-0.5">
                        {currentUser?.email || 'admin@skillshift.com'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#6b1020]/10 flex items-center justify-center">
                    <img src="/icon/icon-informasi.png" alt="info" className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-gray-900 text-[15px]">Informasi Akun</h3>
                </div>
                <div className="flex flex-col divide-y divide-gray-100">
                  {[
                    [
                      'Administrator',
                      currentUser?.nama || 'Admin SkillShift',
                      '/icon/icon-profile.png',
                    ],
                    [
                      'Email Admin',
                      currentUser?.email || 'admin@skillshift.com',
                      '/icon/icon-email.png',
                    ],
                    ['Peran', 'Administrator', '/icon/gembok.png'],
                    ['Status Akun', 'Aktif & Terverifikasi', '/icon/icon-status.png'],
                    ['Sistem Dikembangkan Sejak', '21 Mei 2026', '/icon/concept.png'],
                  ].map(([label, val, icon]) => (
                    <div key={label} className="flex items-center gap-4 py-4">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <img src={icon} alt={label} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                          {label}
                        </p>
                        <p className="text-[14px] font-bold text-gray-800">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-[#c99042]/15 flex items-center justify-center">
                    <img src="/icon/icon-pengelola.png" alt="stats" className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-gray-900 text-[15px]">Statistik Pengelolaan</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      label: 'Total Lowongan',
                      value: jobs.length,
                      color: '#6b1020',
                      icon: '/icon/icon-deskripsi.png',
                    },
                    {
                      label: 'Kota Dijangkau',
                      value: allLocations.length - 1,
                      color: '#c99042',
                      icon: '/icon/icon-stats-kota.png',
                    },
                    {
                      label: 'Kategori Aktif',
                      value: allCategories.length - 1,
                      color: '#059669',
                      icon: '/icon/icon-user-admin.png',
                    },
                    {
                      label: 'User Diterima',
                      value: allAcceptedJobs.length,
                      color: '#6366f1',
                      icon: '/images/terima.png',
                    },
                  ].map(({ label, value, color, icon }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                          <img src={icon} alt={label} className="w-4 h-4" />
                        </div>
                        <span className="text-[12px] font-bold text-gray-600">{label}</span>
                      </div>
                      <span className="text-[20px] font-black" style={{ color }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-[#6b1020]/10 flex items-center justify-center">
                    <img src="/icon/icon-akses.png" alt="akses" className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-gray-900 text-[15px]">Hak Akses</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    'Tambah Lowongan',
                    'Hapus Lowongan',
                    'Kelola Dashboard',
                    'Lihat Semua Data',
                  ].map((akses) => (
                    <div
                      key={akses}
                      className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                    >
                      <img
                        src="/icon/security.png"
                        alt="akses"
                        className="w-5 h-5 object-contain flex-shrink-0"
                      />
                      <span className="text-[12px] font-bold text-gray-700">{akses}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-3">
              <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6 w-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#6b1020]/10 flex items-center justify-center">
                    <img src="/icon/icon-team.png" alt="team" className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-gray-900 text-[15px]">Tim Pengembang</h3>
                </div>
                <div className="hidden md:grid md:grid-cols-2 pb-3 border-b border-gray-200">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    Nama
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 text-right">
                    Email / Username
                  </div>
                </div>
                {[
                  ['Khaisya Rizky Amanda', 'khaisyarizkyamanda14@gmail.com'],
                  ['Wahda Alya Sadira Siregar', 'wahdasiregar10@gmail.com'],
                  ['Hafis Safrizal', 'hafissafrizal34@gmail.com'],
                  ['Putri Kalerin Harahap', 'putrikalerinharahap11@gmail.com'],
                ].map(([nama, user]) => (
                  <div
                    key={nama}
                    className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4 py-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-black text-gray-900 text-[13px]">{nama}</div>
                    <div className="md:text-right text-gray-500 text-[12px] md:text-[13px] break-words min-w-0">
                      {user}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-12 text-center border-t border-gray-200/30 bg-white/40 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 mb-5">
          <SkillShiftLogo onClick={() => {}} small />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">
          © 2026 SkillShift — Official Platform Mahasiswa
        </p>
      </footer>
    </div>
  );
}
