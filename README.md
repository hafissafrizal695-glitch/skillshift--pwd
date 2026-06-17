# SkillShift

Career Portal untuk Mahasiswa - Platform pencarian kerja dan magang.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Express.js + SQLite
- **Deploy:** Vercel (Frontend) + Railway (Backend)

## Struktur Project

```
├── server/          # Backend API (Express + SQLite)
├── src/              # Frontend React
├── public/          # Static assets
└── vercel.json      # Vercel config
```

## Setup Local

```bash
# Install dependencies
npm install

# Backend (port 3001)
npm run server

# Frontend (port 5173)
npm run dev
```

## Deploy

- **Frontend:** Push ke Vercel dari repo ini
- **Backend:** Push folder `server/` ke Railway

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillshift.com | admin123 |
| Mahasiswa | mahasiswa@skillshift.com | 123456 |
