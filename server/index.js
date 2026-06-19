import process from 'node:process';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'node:fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database path - support environment variable untuk Railway persistent storage
const dataDir = process.env.DATA_DIR || join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'skillshift.db');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

console.log('Database path:', dbPath);

// Initialize SQLite database
const db = new Database(dbPath);

// Create tables if not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS mahasiswa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lowongan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    perusahaan TEXT NOT NULL,
    lokasi TEXT,
    tipe TEXT,
    kategori TEXT,
    skill TEXT,
    jam_kerja TEXT,
    minimal_umur INTEGER DEFAULT 18,
    gaji TEXT,
    deskripsi TEXT,
    email_kontak TEXT,
    whatsapp TEXT,
    foto TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saved_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    id_lowongan INTEGER NOT NULL,
    tanggal_simpan TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_user) REFERENCES mahasiswa(id),
    FOREIGN KEY (id_lowongan) REFERENCES lowongan(id)
  );

  CREATE TABLE IF NOT EXISTS riwayat_accepted (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    id_lowongan INTEGER NOT NULL,
    tanggal_diterima TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_user) REFERENCES mahasiswa(id),
    FOREIGN KEY (id_lowongan) REFERENCES lowongan(id)
  );
`);

console.log('✅ Database SQLite siap!');

// Seed demo mahasiswa if empty
const studentCount = db.prepare('SELECT COUNT(*) as count FROM mahasiswa').get();
if (studentCount.count === 0) {
  db.prepare(`
    INSERT INTO mahasiswa (nama, email, password, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run('Demo Mahasiswa', 'mahasiswa@skillshift.com', '123456');
  console.log('✅ Akun demo mahasiswa berhasil dibuat');
}

// ==================== JOBS API ====================

app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM lowongan ORDER BY created_at DESC').all();
    res.json(jobs.map(job => ({
      id: job.id,
      title: job.judul,
      company: job.perusahaan,
      location: job.lokasi,
      type: job.tipe,
      category: job.kategori,
      skills: job.skill ? job.skill.split(',').map(s => s.trim()) : [],
      hours: job.jam_kerja,
      minAge: job.minimal_umur,
      salary: job.gaji,
      description: job.deskripsi,
      contactEmail: job.email_kontak,
      contactPhone: job.whatsapp,
      image: job.foto,
      createdAt: job.created_at,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  try {
    const job = db.prepare('SELECT * FROM lowongan WHERE id = ?').get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }
    res.json({
      id: job.id,
      title: job.judul,
      company: job.perusahaan,
      location: job.lokasi,
      type: job.tipe,
      category: job.kategori,
      skills: job.skill ? job.skill.split(',').map(s => s.trim()) : [],
      hours: job.jam_kerja,
      minAge: job.minimal_umur,
      salary: job.gaji,
      description: job.deskripsi,
      contactEmail: job.email_kontak,
      contactPhone: job.whatsapp,
      image: job.foto,
      createdAt: job.created_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const { title, company, location, type, category, skills, hours, minAge, salary, description, contactEmail, contactPhone, image } = req.body;
    const skillsStr = Array.isArray(skills) ? skills.join(',') : skills;

    const result = db.prepare(`
      INSERT INTO lowongan (judul, perusahaan, lokasi, tipe, kategori, skill, jam_kerja, minimal_umur, gaji, deskripsi, email_kontak, whatsapp, foto, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(title, company, location, type, category, skillsStr, hours, minAge || 18, salary, description, contactEmail, contactPhone, image);

    const newJob = db.prepare('SELECT * FROM lowongan WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      id: newJob.id,
      title: newJob.judul,
      company: newJob.perusahaan,
      location: newJob.lokasi,
      type: newJob.tipe,
      category: newJob.kategori,
      skills: newJob.skill ? newJob.skill.split(',').map(s => s.trim()) : [],
      hours: newJob.jam_kerja,
      minAge: newJob.minimal_umur,
      salary: newJob.gaji,
      description: newJob.deskripsi,
      contactEmail: newJob.email_kontak,
      contactPhone: newJob.whatsapp,
      image: newJob.foto,
      createdAt: newJob.created_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  try {
    const { title, company, location, type, category, skills, hours, minAge, salary, description, contactEmail, contactPhone, image } = req.body;
    const skillsStr = Array.isArray(skills) ? skills.join(',') : skills;

    const existing = db.prepare('SELECT * FROM lowongan WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }

    db.prepare(`
      UPDATE lowongan SET
        judul = ?, perusahaan = ?, lokasi = ?, tipe = ?, kategori = ?,
        skill = ?, jam_kerja = ?, minimal_umur = ?, gaji = ?,
        deskripsi = ?, email_kontak = ?, whatsapp = ?, foto = ?
      WHERE id = ?
    `).run(title, company, location, type, category, skillsStr, hours, minAge || 18, salary, description, contactEmail, contactPhone, image, req.params.id);

    const job = db.prepare('SELECT * FROM lowongan WHERE id = ?').get(req.params.id);
    res.json({
      id: job.id,
      title: job.judul,
      company: job.perusahaan,
      location: job.lokasi,
      type: job.tipe,
      category: job.kategori,
      skills: job.skill ? job.skill.split(',').map(s => s.trim()) : [],
      hours: job.jam_kerja,
      minAge: job.minimal_umur,
      salary: job.gaji,
      description: job.deskripsi,
      contactEmail: job.email_kontak,
      contactPhone: job.whatsapp,
      image: job.foto,
      createdAt: job.created_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = db.prepare('SELECT * FROM lowongan WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }

    db.prepare('DELETE FROM saved_jobs WHERE id_lowongan = ?').run(id);
    db.prepare('DELETE FROM riwayat_accepted WHERE id_lowongan = ?').run(id);
    db.prepare('DELETE FROM lowongan WHERE id = ?').run(id);

    res.json({ message: 'Lowongan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== AUTH API ====================

app.post('/api/register', (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const existing = db.prepare('SELECT * FROM mahasiswa WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const result = db.prepare(`
      INSERT INTO mahasiswa (nama, email, password, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(nama, email, password);

    const newUser = db.prepare('SELECT * FROM mahasiswa WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Akun berhasil dibuat',
      user: {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
        role: 'mahasiswa',
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    if (role === 'admin') {
      if (email === 'admin@skillshift.com' && password === 'admin123') {
        return res.json({
          message: 'Login admin berhasil',
          user: { id: 0, nama: 'Admin SkillShift', email, role: 'admin' }
        });
      }
      return res.status(401).json({ error: 'Email atau password admin salah' });
    }

    const mahasiswa = db.prepare('SELECT * FROM mahasiswa WHERE email = ? AND password = ?').get(email, password);
    if (!mahasiswa) {
      return res.status(401).json({ error: 'Email atau password mahasiswa salah' });
    }

    res.json({
      message: 'Login mahasiswa berhasil',
      user: { id: mahasiswa.id, nama: mahasiswa.nama, email: mahasiswa.email, created_at: mahasiswa.created_at, role: 'mahasiswa' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SAVED JOBS API ====================

app.get('/api/saved/:id_user', (req, res) => {
  try {
    const id_user = parseInt(req.params.id_user);
    const saved = db.prepare(`
      SELECT l.*, sj.tanggal_simpan
      FROM saved_jobs sj
      JOIN lowongan l ON sj.id_lowongan = l.id
      WHERE sj.id_user = ?
      ORDER BY sj.tanggal_simpan DESC
    `).all(id_user);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/saved', (req, res) => {
  try {
    const { id_user, id_lowongan } = req.body;
    if (!id_user || !id_lowongan) {
      return res.status(400).json({ error: 'id_user dan id_lowongan wajib diisi' });
    }

    const exists = db.prepare('SELECT * FROM saved_jobs WHERE id_user = ? AND id_lowongan = ?').get(id_user, id_lowongan);
    if (!exists) {
      db.prepare(`
        INSERT INTO saved_jobs (id_user, id_lowongan, tanggal_simpan)
        VALUES (?, ?, datetime('now'))
      `).run(id_user, id_lowongan);
    }
    res.json({ message: 'Lowongan berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/saved/:id_user/:id_lowongan', (req, res) => {
  try {
    const id_user = parseInt(req.params.id_user);
    const id_lowongan = parseInt(req.params.id_lowongan);
    db.prepare('DELETE FROM saved_jobs WHERE id_user = ? AND id_lowongan = ?').run(id_user, id_lowongan);
    res.json({ message: 'Lowongan berhasil dihapus dari tersimpan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACCEPTED JOBS API ====================

app.get('/api/accepted/:id_user', (req, res) => {
  try {
    const id_user = parseInt(req.params.id_user);
    const accepted = db.prepare(`
      SELECT l.*, ra.tanggal_diterima
      FROM riwayat_accepted ra
      JOIN lowongan l ON ra.id_lowongan = l.id
      WHERE ra.id_user = ?
      ORDER BY ra.tanggal_diterima DESC
    `).all(id_user);
    res.json(accepted);
  } catch (error) {
 res.status(500).json({ error: error.message });
  }
});

app.post('/api/accepted', (req, res) => {
  try {
    const { id_user, id_lowongan } = req.body;
    if (!id_user || !id_lowongan) {
      return res.status(400).json({ error: 'id_user dan id_lowongan wajib diisi' });
    }

    const exists = db.prepare('SELECT * FROM riwayat_accepted WHERE id_user = ? AND id_lowongan = ?').get(id_user, id_lowongan);
    if (!exists) {
      db.prepare(`
        INSERT INTO riwayat_accepted (id_user, id_lowongan, tanggal_diterima)
        VALUES (?, ?, datetime('now'))
      `).run(id_user, id_lowongan);
    }
    res.json({ message: 'Lowongan berhasil ditandai diterima' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/accepted/:id_user/:id_lowongan', (req, res) => {
  try {
    const id_user = parseInt(req.params.id_user);
    const id_lowongan = parseInt(req.params.id_lowongan);
    db.prepare('DELETE FROM riwayat_accepted WHERE id_user = ? AND id_lowongan = ?').run(id_user, id_lowongan);
    res.json({ message: 'Lowongan berhasil dihapus dari diterima' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN API ====================

app.get('/api/admin/accepted', (req, res) => {
  try {
    const accepted = db.prepare(`
      SELECT m.nama as userName, m.email as userEmail, l.judul as jobTitle,
             l.perusahaan as company, l.lokasi as location, l.gaji as salary,
             ra.tanggal_diterima as acceptedDate, ra.id
      FROM riwayat_accepted ra
      JOIN mahasiswa m ON ra.id_user = m.id
      JOIN lowongan l ON ra.id_lowongan = l.id
      ORDER BY ra.tanggal_diterima DESC
    `).all();
    res.json(accepted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nSkillShift API Server running on http://0.0.0.0:${PORT}`);
  console.log(`Database: skillshift.db`);
  console.log('Tables: mahasiswa, lowongan, saved_jobs, riwayat_accepted');
});
