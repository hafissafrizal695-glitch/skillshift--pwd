import process from 'node:process';
import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'node:fs';

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

const dataDir = join(__dirname, '..', 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
}

const dbPath = join(dataDir, 'skillshift.db');
const db = new Database(dbPath);
console.log('Database path:', dbPath);
db.pragma('foreign_keys = OFF');

db.exec(`
  CREATE TABLE IF NOT EXISTS lowongan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    perusahaan TEXT,
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
    created_at TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS mahasiswa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS riwayat_accepted (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER,
    id_lowongan INTEGER,
    tanggal_diterima TEXT,
    FOREIGN KEY (id_user) REFERENCES mahasiswa(id),
    FOREIGN KEY (id_lowongan) REFERENCES lowongan(id)
  )
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_riwayat_accepted_user_lowongan
  ON riwayat_accepted (id_user, id_lowongan)
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS saved_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER,
    id_lowongan INTEGER,
    tanggal_simpan TEXT,
    FOREIGN KEY (id_user) REFERENCES mahasiswa(id),
    FOREIGN KEY (id_lowongan) REFERENCES lowongan(id),
    UNIQUE(id_user, id_lowongan)
  )
`);

console.log('Schema database baru siap!');

const mahasiswaCount = db.prepare('SELECT COUNT(*) AS total FROM mahasiswa').get().total;

if (mahasiswaCount === 0) {
  db.prepare(
    `
    INSERT INTO mahasiswa (nama, email, password, created_at)
    VALUES (?, ?, ?, ?)
  `
  ).run('Demo Mahasiswa', 'mahasiswa@skillshift.com', '123456', new Date().toISOString());

  console.log('✅ Akun demo mahasiswa berhasil dibuat');
}

const count = db.prepare('SELECT COUNT(*) as count FROM lowongan').get();
if (count.count === 0) {
  console.log('Lowongan masih kosong. Data dapat ditambahkan manual melalui dashboard admin.');
}

app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM lowongan ORDER BY created_at DESC').all();
    
    const parsed = jobs.map((job) => ({
      id: job.id,
      title: job.judul,
      company: job.perusahaan,
      location: job.lokasi,
      type: job.tipe,
      category: job.kategori,
      skills: job.skill ? job.skill.split(',').map((s) => s.trim()) : [],
      hours: job.jam_kerja,
      minAge: job.minimal_umur,
      salary: job.gaji,
      description: job.deskripsi,
      contactEmail: job.email_kontak,
      contactPhone: job.whatsapp,
      image: job.foto,
      createdAt: job.created_at,
    }));
    res.json(parsed);
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
    const parsed = {
      id: job.id,
      title: job.judul,
      company: job.perusahaan,
      location: job.lokasi,
      type: job.tipe,
      category: job.kategori,
      skills: job.skill ? job.skill.split(',').map((s) => s.trim()) : [],
      hours: job.jam_kerja,
      minAge: job.minimal_umur,
      salary: job.gaji,
      description: job.deskripsi,
      contactEmail: job.email_kontak,
      contactPhone: job.whatsapp,
      image: job.foto,
      createdAt: job.created_at,
    };
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      category,
      skills,
      hours,
      minAge,
      salary,
      description,
      contactEmail,
      contactPhone,
      image,
    } = req.body;

    const skillsStr = Array.isArray(skills) ? skills.join(',') : skills;
    const createdAt = new Date().toISOString().split('T')[0];

    const result = db
      .prepare(
        `
      INSERT INTO lowongan (judul, perusahaan, lokasi, tipe, kategori, skill, jam_kerja, minimal_umur, gaji, deskripsi, email_kontak, whatsapp, foto, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        title,
        company,
        location,
        type,
        category,
        skillsStr,
        hours || '',
        minAge || 18,
        salary,
        description || '',
        contactEmail || '',
        contactPhone || '',
        image || '',
        createdAt
      );

    const newJob = db.prepare('SELECT * FROM lowongan WHERE id = ?').get(result.lastInsertRowid);
    const parsed = {
      id: newJob.id,
      title: newJob.judul,
      company: newJob.perusahaan,
      location: newJob.lokasi,
      type: newJob.tipe,
      category: newJob.kategori,
      skills: newJob.skill ? newJob.skill.split(',').map((s) => s.trim()) : [],
      hours: newJob.jam_kerja,
      minAge: newJob.minimal_umur,
      salary: newJob.gaji,
      description: newJob.deskripsi,
      contactEmail: newJob.email_kontak,
      contactPhone: newJob.whatsapp,
      image: newJob.foto,
      createdAt: newJob.created_at,
    };

    res.status(201).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      category,
      skills,
      hours,
      minAge,
      salary,
      description,
      contactEmail,
      contactPhone,
      image,
    } = req.body;

    const skillsStr = Array.isArray(skills) ? skills.join(',') : skills;

    db.prepare(
      `
      UPDATE lowongan SET
        judul = ?, perusahaan = ?, lokasi = ?, tipe = ?, kategori = ?,
        skill = ?, jam_kerja = ?, minimal_umur = ?, gaji = ?, deskripsi = ?,
        email_kontak = ?, whatsapp = ?, foto = ?
      WHERE id = ?
    `
    ).run(
      title,
      company,
      location,
      type,
      category,
      skillsStr,
      hours || '',
      minAge || 18,
      salary,
      description || '',
      contactEmail || '',
      contactPhone || '',
      image || '',
      req.params.id
    );

    const updatedJob = db.prepare('SELECT * FROM lowongan WHERE id = ?').get(req.params.id);
    const parsed = {
      id: updatedJob.id,
      title: updatedJob.judul,
      company: updatedJob.perusahaan,
      location: updatedJob.lokasi,
      type: updatedJob.tipe,
      category: updatedJob.kategori,
      skills: updatedJob.skill ? updatedJob.skill.split(',').map((s) => s.trim()) : [],
      hours: updatedJob.jam_kerja,
      minAge: updatedJob.minimal_umur,
      salary: updatedJob.gaji,
      description: updatedJob.deskripsi,
      contactEmail: updatedJob.email_kontak,
      contactPhone: updatedJob.whatsapp,
      image: updatedJob.foto,
      createdAt: updatedJob.created_at,
    };

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    db.pragma('foreign_keys = OFF');
    db.prepare('DELETE FROM saved_jobs WHERE id_lowongan = ?').run(req.params.id);
    db.prepare('DELETE FROM riwayat_accepted WHERE id_lowongan = ?').run(req.params.id);
    const result = db.prepare('DELETE FROM lowongan WHERE id = ?').run(req.params.id);
    db.pragma('foreign_keys = ON');
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }
    res.json({ message: 'Lowongan berhasil dihapus' });
  } catch (error) {
    db.pragma('foreign_keys = ON');
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/register', (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const existingUser = db.prepare('SELECT id FROM mahasiswa WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const createdAt = new Date().toISOString();

    const result = db
      .prepare(
        `
        INSERT INTO mahasiswa (nama, email, password, created_at)
        VALUES (?, ?, ?, ?)
      `
      )
      .run(nama, email, password, createdAt);

    res.status(201).json({
      message: 'Akun berhasil dibuat',
      user: {
        id: result.lastInsertRowid,
        nama,
        email,
        role: 'mahasiswa',
        created_at: createdAt,
      },
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
          user: {
            id: 0,
            nama: 'Admin SkillShift',
            email,
            role: 'admin',
          },
        });
      }

      return res.status(401).json({ error: 'Email atau password admin salah' });
    }

    
    const mahasiswa = db
      .prepare(
        `
        SELECT id, nama, email, created_at
        FROM mahasiswa
        WHERE email = ? AND password = ?
      `
      )
      .get(email, password);

    if (!mahasiswa) {
      return res.status(401).json({ error: 'Email atau password mahasiswa salah' });
    }

    res.json({
      message: 'Login mahasiswa berhasil',
      user: {
        ...mahasiswa,
        role: 'mahasiswa',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/accepted/:id_user', (req, res) => {
  try {
    const { id_user } = req.params;

    const acceptedJobs = db
      .prepare(
        `
      SELECT lowongan.*
      FROM riwayat_accepted
      JOIN lowongan ON riwayat_accepted.id_lowongan = lowongan.id
      WHERE riwayat_accepted.id_user = ?
      ORDER BY riwayat_accepted.id DESC
    `
      )
      .all(id_user);

    res.json(acceptedJobs);
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

    const tanggal_diterima = new Date().toISOString();

    db.prepare(
      `
      INSERT OR IGNORE INTO riwayat_accepted (id_user, id_lowongan, tanggal_diterima)
      VALUES (?, ?, ?)
    `
    ).run(id_user, id_lowongan, tanggal_diterima);

    res.json({ message: 'Lowongan berhasil ditandai diterima' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/accepted/:id_user/:id_lowongan', (req, res) => {
  try {
    const { id_user, id_lowongan } = req.params;

    db.prepare(
      `
      DELETE FROM riwayat_accepted
      WHERE id_user = ? AND id_lowongan = ?
    `
    ).run(id_user, id_lowongan);

    res.json({ message: 'Lowongan berhasil dihapus dari diterima' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/saved/:id_user', (req, res) => {
  try {
    const { id_user } = req.params;

    const savedJobs = db
      .prepare(
        `
      SELECT lowongan.*
      FROM saved_jobs
      JOIN lowongan ON saved_jobs.id_lowongan = lowongan.id
      WHERE saved_jobs.id_user = ?
      ORDER BY saved_jobs.id DESC
    `
      )
      .all(id_user);

    res.json(savedJobs);
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

    const tanggal_simpan = new Date().toISOString();

    db.prepare(
      `
      INSERT OR IGNORE INTO saved_jobs (id_user, id_lowongan, tanggal_simpan)
      VALUES (?, ?, ?)
    `
    ).run(id_user, id_lowongan, tanggal_simpan);

    res.json({ message: 'Lowongan berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/saved/:id_user/:id_lowongan', (req, res) => {
  try {
    const { id_user, id_lowongan } = req.params;

    db.prepare(
      `
      DELETE FROM saved_jobs
      WHERE id_user = ? AND id_lowongan = ?
    `
    ).run(id_user, id_lowongan);

    res.json({ message: 'Lowongan berhasil dihapus dari tersimpan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/admin/accepted', (req, res) => {
  try {
    const accepted = db
      .prepare(
        `
      SELECT
  mahasiswa.nama AS userName,
  mahasiswa.email AS userEmail,
  lowongan.judul AS jobTitle,
  lowongan.perusahaan AS company,
  lowongan.lokasi AS location,
  lowongan.gaji AS salary,
  riwayat_accepted.tanggal_diterima AS acceptedDate,
  riwayat_accepted.id
FROM riwayat_accepted
JOIN mahasiswa
  ON riwayat_accepted.id_user = mahasiswa.id
JOIN lowongan
  ON riwayat_accepted.id_lowongan = lowongan.id
ORDER BY riwayat_accepted.tanggal_diterima DESC
    `
      )
      .all();

    res.json(accepted);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nSkillShift API Server running on http://localhost:${PORT}`);
  console.log(`Database: skillshift.db (schema baru)`);
  console.log('Tabel: lowongan, mahasiswa, riwayat_accepted, saved_jobs');
});
