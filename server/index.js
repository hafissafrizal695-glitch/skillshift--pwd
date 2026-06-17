import process from 'node:process';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

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
}

const dbPath = join(dataDir, 'db.json');

const defaultDb = {
  lowongan: [],
  mahasiswa: [],
  riwayat_accepted: [],
  saved_jobs: [],
  nextId: {
    lowongan: 1,
    mahasiswa: 1,
    riwayat_accepted: 1,
    saved_jobs: 1
  }
};

let db;
try {
  if (existsSync(dbPath)) {
    db = JSON.parse(readFileSync(dbPath, 'utf-8'));
  } else {
    db = { ...defaultDb };
    saveDb();
  }
} catch (e) {
  db = { ...defaultDb };
  saveDb();
}

function saveDb() {
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

console.log('Database path:', dbPath);
console.log('Schema database JSON siap!');

// Seed demo mahasiswa if empty
if (db.mahasiswa.length === 0) {
  db.mahasiswa.push({
    id: db.nextId.mahasiswa++,
    nama: 'Demo Mahasiswa',
    email: 'mahasiswa@skillshift.com',
    password: '123456',
    created_at: new Date().toISOString()
  });
  saveDb();
  console.log('✅ Akun demo mahasiswa berhasil dibuat');
}

if (db.lowongan.length === 0) {
  console.log('Lowongan masih kosong. Data dapat ditambahkan manual melalui dashboard admin.');
}

// ==================== JOBS API ====================

app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.lowongan.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    const job = db.lowongan.find(j => j.id === parseInt(req.params.id));
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
    const createdAt = new Date().toISOString().split('T')[0];

    const newJob = {
      id: db.nextId.lowongan++,
      judul: title,
      perusahaan: company,
      lokasi: location,
      tipe: type,
      kategori: category,
      skill: skillsStr || '',
      jam_kerja: hours || '',
      minimal_umur: minAge || 18,
      gaji: salary || '',
      deskripsi: description || '',
      email_kontak: contactEmail || '',
      whatsapp: contactPhone || '',
      foto: image || '',
      created_at: createdAt
    };

    db.lowongan.push(newJob);
    saveDb();

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
    const idx = db.lowongan.findIndex(j => j.id === parseInt(req.params.id));

    if (idx === -1) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }

    const skillsStr = Array.isArray(skills) ? skills.join(',') : skills;

    db.lowongan[idx] = {
      ...db.lowongan[idx],
      judul: title,
      perusahaan: company,
      lokasi: location,
      tipe: type,
      kategori: category,
      skill: skillsStr || '',
      jam_kerja: hours || '',
      minimal_umur: minAge || 18,
      gaji: salary || '',
      deskripsi: description || '',
      email_kontak: contactEmail || '',
      whatsapp: contactPhone || '',
      foto: image || ''
    };
    saveDb();

    const job = db.lowongan[idx];
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
    const idx = db.lowongan.findIndex(j => j.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }

    db.lowongan.splice(idx, 1);
    db.saved_jobs = db.saved_jobs.filter(s => s.id_lowongan !== id);
    db.riwayat_accepted = db.riwayat_accepted.filter(r => r.id_lowongan !== id);
    saveDb();

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

    const existing = db.mahasiswa.find(m => m.email === email);
    if (existing) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const newUser = {
      id: db.nextId.mahasiswa++,
      nama,
      email,
      password,
      created_at: new Date().toISOString()
    };

    db.mahasiswa.push(newUser);
    saveDb();

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

    const mahasiswa = db.mahasiswa.find(m => m.email === email && m.password === password);
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
    const saved = db.saved_jobs
      .filter(s => s.id_user === id_user)
      .map(s => {
        const job = db.lowongan.find(j => j.id === s.id_lowongan);
        return job ? { ...job, tanggal_simpan: s.tanggal_simpan } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.tanggal_simpan) - new Date(a.tanggal_simpan));
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

    const exists = db.saved_jobs.find(s => s.id_user === parseInt(id_user) && s.id_lowongan === parseInt(id_lowongan));
    if (!exists) {
      db.saved_jobs.push({
        id: db.nextId.saved_jobs++,
        id_user: parseInt(id_user),
        id_lowongan: parseInt(id_lowongan),
        tanggal_simpan: new Date().toISOString()
      });
      saveDb();
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
    db.saved_jobs = db.saved_jobs.filter(s => !(s.id_user === id_user && s.id_lowongan === id_lowongan));
    saveDb();
    res.json({ message: 'Lowongan berhasil dihapus dari tersimpan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACCEPTED JOBS API ====================

app.get('/api/accepted/:id_user', (req, res) => {
  try {
    const id_user = parseInt(req.params.id_user);
    const accepted = db.riwayat_accepted
      .filter(r => r.id_user === id_user)
      .map(r => {
        const job = db.lowongan.find(j => j.id === r.id_lowongan);
        return job ? { ...job, tanggal_diterima: r.tanggal_diterima } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.tanggal_diterima) - new Date(a.tanggal_diterima));
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

    const exists = db.riwayat_accepted.find(r => r.id_user === parseInt(id_user) && r.id_lowongan === parseInt(id_lowongan));
    if (!exists) {
      db.riwayat_accepted.push({
        id: db.nextId.riwayat_accepted++,
        id_user: parseInt(id_user),
        id_lowongan: parseInt(id_lowongan),
        tanggal_diterima: new Date().toISOString()
      });
      saveDb();
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
    db.riwayat_accepted = db.riwayat_accepted.filter(r => !(r.id_user === id_user && r.id_lowongan === id_lowongan));
    saveDb();
    res.json({ message: 'Lowongan berhasil dihapus dari diterima' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN API ====================

app.get('/api/admin/accepted', (req, res) => {
  try {
    const accepted = db.riwayat_accepted
      .map(r => {
        const mahasiswa = db.mahasiswa.find(m => m.id === r.id_user);
        const lowongan = db.lowongan.find(j => j.id === r.id_lowongan);
        if (!mahasiswa || !lowongan) return null;
        return {
          userName: mahasiswa.nama,
          userEmail: mahasiswa.email,
          jobTitle: lowongan.judul,
          company: lowongan.perusahaan,
          location: lowongan.lokasi,
          salary: lowongan.gaji,
          acceptedDate: r.tanggal_diterima,
          id: r.id
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.acceptedDate) - new Date(a.acceptedDate));
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
  console.log(`Database: db.json`);
  console.log('Tabel: lowongan, mahasiswa, riwayat_accepted, saved_jobs');
});
