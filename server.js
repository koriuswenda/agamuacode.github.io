// Jalankan: node server.js  →  http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const MSG_FILE = path.join(ROOT, 'data', 'messages.json');

const DB = {
  home: {
    video: 'video/agamua-intro.mp4',
    stats: [
      { value: '1.200+', label: 'Anggota aktif' },
      { value: '48', label: 'Proyek komunitas' },
      { value: '15', label: 'Mentor' },
    ],
    snippet: `const komunitas = {\n  nama: "AGAMUA CODE",\n  belajar: ["HTML", "CSS", "JavaScript"],\n  mentor: true,\n};\n\nfunction gabung(kamu) {\n  return komunitas.belajar\n    .map((b) => kamu + " belajar " + b);\n}\n\ngabung("kamu");`,
  },
  about: {
    description: 'AGAMUA CODE lahir dari sekelompok pelajar dan pekerja yang ingin belajar coding tanpa merasa sendirian. Kami mengadakan kelas mingguan, sesi review kode, dan proyek yang benar-benar dipakai orang.',
    vision: 'Menjadi tempat pertama yang dituju siapa pun di Papua dan sekitarnya untuk mulai belajar membuat perangkat lunak.',
    mission: ['Mengajar dasar pemrograman lewat proyek nyata', 'Menyediakan mentor yang mendampingi sampai selesai', 'Membangun portofolio bersama untuk anggota', 'Menjaga komunitas yang ramah dan saling membantu'],
  },
  team: [
    { name: 'Korius Wenda, S.Kom.', role: 'Founder & Developer', hue: 222, photo: 'img/avatar.jpg', bio: 'Staf dosen STTB Papua, developer, dan konsultan IT lulusan Sistem Informasi Universitas Cenderawasih.' },
    { name: 'Maria Kogoya', role: 'Mentor Front-end', hue: 340, bio: 'Suka desain antarmuka yang rapi, cepat, dan mudah diakses.' },
    { name: 'Yosua Wenda', role: 'Mentor Back-end', hue: 160, bio: 'Membimbing peserta membuat API dan database dari nol.' },
  ],
  courses: [
    { id: 1, title: 'Dasar Web', level: 'Pemula', duration: '6 minggu', price: 0, tags: ['HTML', 'CSS'], icon: 'web', hue: 215, description: 'Bangun halaman web pertamamu, dari struktur sampai tampilan responsif.' },
    { id: 2, title: 'JavaScript Interaktif', level: 'Menengah', duration: '8 minggu', price: 250000, tags: ['JS', 'DOM', 'API'], icon: 'code', hue: 205, description: 'Buat halaman dinamis yang mengambil data dari API.' },
    { id: 3, title: 'Back-end dengan Node.js', level: 'Menengah', duration: '8 minggu', price: 350000, tags: ['Node', 'REST', 'SQL'], icon: 'server', hue: 235, description: 'Rancang API, simpan data, dan rilis layananmu.' },
    { id: 4, title: 'Proyek Kolaborasi', level: 'Lanjutan', duration: '10 minggu', price: 150000, tags: ['Git', 'Tim'], icon: 'team', hue: 245, description: 'Kerjakan produk nyata bersama tim dan mentor.' },
  ],
  gallery: [
    { id: 9, title: 'Profil singkat founder', category: 'Founder', hue: 222, image: 'img/profil.jpg', thumb: 'img/th-profil.jpg', description: 'Korius Wenda, S.Kom. — staf dosen STTB Papua, developer, konsultan IT, dan founder AgamuaCode Community.' },
    { id: 10, title: 'Founder AgamuaCode', category: 'Founder', hue: 200, image: 'img/founder.jpg', thumb: 'img/th-founder.jpg', description: 'Korius Wenda, pendiri komunitas dan pengajar di AGAMUA CODE.' },
    { id: 11, title: 'Ucapan terima kasih', category: 'Poster', hue: 40, image: 'img/terimakasih.jpg', thumb: 'img/th-terimakasih.jpg', description: 'Sampai jumpa di sesi diskusi berikutnya.' },
    { id: 1, title: 'Kelas perdana', category: 'Kelas', hue: 222, description: 'Sesi pertama Dasar Web dengan 40 peserta.' },
    { id: 2, title: 'Belajar Git', category: 'Kelas', hue: 190, description: 'Latihan branch dan pull request langsung di kelas.' },
    { id: 3, title: 'Hackathon 24 jam', category: 'Acara', hue: 12, description: 'Dua belas tim membuat aplikasi untuk UMKM lokal.' },
    { id: 4, title: 'Demo proyek', category: 'Acara', hue: 300, description: 'Peserta memamerkan hasil akhir program kolaborasi.' },
    { id: 5, title: 'Toko kopi online', category: 'Proyek', hue: 30, description: 'Situs pesan kopi buatan peserta kelas JavaScript.' },
    { id: 6, title: 'Aplikasi absensi', category: 'Proyek', hue: 150, description: 'Absensi sekolah dengan Node.js dan SQLite.' },
    { id: 7, title: 'Kopi darat', category: 'Acara', hue: 260, description: 'Ngobrol santai anggota dan mentor tiap bulan.' },
    { id: 8, title: 'Review kode', category: 'Kelas', hue: 90, description: 'Mentor mengulas kode peserta secara terbuka.' },
  ],
  slides: [
    { image: 'img/profil.jpg', alt: 'Profil singkat Korius Wenda, S.Kom., founder AgamuaCode Community' },
    { image: 'img/founder.jpg', alt: 'Foto Korius Wenda, founder dan developer AgamuaCode' },
    { image: 'img/terimakasih.jpg', alt: 'Poster terima kasih atas perhatian Anda, sampai jumpa di sesi diskusi berikutnya' },
  ],
  videos: [
    { id: 1, title: 'Membuat halaman web pertama', course: 'Dasar Web', level: 'Pemula', icon: 'web', hue: 215, src: 'video/dasar-web.mp4' },
    { id: 2, title: 'Layout responsif dengan CSS', course: 'Dasar Web', level: 'Pemula', icon: 'web', hue: 225, src: 'video/css-responsif.mp4' },
    { id: 3, title: 'Mengambil data dari API dengan fetch', course: 'JavaScript Interaktif', level: 'Menengah', icon: 'code', hue: 205, src: 'video/js-fetch.mp4' },
    { id: 4, title: 'Membangun REST API dengan Node.js', course: 'Back-end dengan Node.js', level: 'Menengah', icon: 'server', hue: 235, src: 'video/node-api.mp4' },
    { id: 5, title: 'Kolaborasi dengan Git dan GitHub', course: 'Proyek Kolaborasi', level: 'Lanjutan', icon: 'git', hue: 245, src: 'video/git-github.mp4' },
  ],
  contact: [
    { label: 'Email', value: 'agamuacode@gmail.com', href: 'mailto:agamuacode@gmail.com' },
    { label: 'WhatsApp', value: '+62 852-5417-5093', href: 'https://wa.me/6285254175093', social: true },
    { label: 'Website', value: 'agamuacode.com', href: 'https://agamuacode.com', social: true },
    { label: 'Facebook', value: 'agamuacode', href: 'https://facebook.com/agamuacode', social: true },
    { label: 'Instagram', value: 'agamuacode', href: 'https://instagram.com/agamuacode', social: true },
    { label: 'LinkedIn', value: 'agamuacode', href: 'https://www.linkedin.com/company/agamuacode', social: true },
    { label: 'Lokasi', value: 'Jayapura, Papua' },
    { label: 'Jam kelas', value: 'Sabtu, 09.00–15.00 WIT' },
  ],
};

// Data tambahan galeri (opsional). Kolom yang bisa kamu isi per item galeri:
//   date: '2026-03-14'   place: 'Jayapura'   detail: 'Cerita lengkap kegiatan...'
// Kolom yang kosong otomatis disembunyikan di jendela detail galeri.
const TAGS = {
  9: ['Founder', 'STTB Papua', 'Developer'], 10: ['Founder', 'Pengajar'], 11: ['Poster', 'Diskusi'],
  1: ['Dasar Web', '40 peserta'], 2: ['Git', 'Branch', 'Pull request'], 3: ['Hackathon', 'UMKM', '12 tim'],
  4: ['Demo', 'Program kolaborasi'], 5: ['JavaScript', 'Situs web'], 6: ['Node.js', 'SQLite'],
  7: ['Komunitas', 'Bulanan'], 8: ['Review kode', 'Mentor'],
};
DB.gallery.forEach((g) => { g.tags = TAGS[g.id] || [g.category]; });

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 10000) { reject(new Error('Pesan terlalu besar.')); req.destroy(); } });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Format data tidak valid.')); } });
  });
}

const hits = new Map(); // pembatas sederhana: 5 pesan / 10 menit / IP
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 600000);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

async function api(req, res, parts, url) {
  const [name, id] = parts;
  if (req.method === 'GET') {
    if (name === 'gallery') {
      const cat = url.searchParams.get('category');
      return json(res, 200, cat ? DB.gallery.filter((g) => g.category === cat) : DB.gallery);
    }
    if (name === 'courses' && id) {
      const c = DB.courses.find((x) => String(x.id) === id);
      return c ? json(res, 200, c) : json(res, 404, { error: 'Kursus tidak ditemukan.' });
    }
    if (DB[name]) return json(res, 200, DB[name]);
    return json(res, 404, { error: 'Endpoint tidak ada.' });
  }
  if (req.method === 'POST' && name === 'contact') {
    if (limited(req.socket.remoteAddress)) return json(res, 429, { error: 'Terlalu banyak pesan. Coba lagi nanti.' });
    let b;
    try { b = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const name_ = String(b.name || '').trim(), email = String(b.email || '').trim(), message = String(b.message || '').trim();
    if (name_.length < 2) return json(res, 422, { error: 'Nama minimal 2 karakter.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 422, { error: 'Format email tidak valid.' });
    if (message.length < 10) return json(res, 422, { error: 'Pesan minimal 10 karakter.' });
    fs.mkdirSync(path.dirname(MSG_FILE), { recursive: true });
    const all = fs.existsSync(MSG_FILE) ? JSON.parse(fs.readFileSync(MSG_FILE, 'utf8')) : [];
    all.push({ name: name_, email, message, at: new Date().toISOString() });
    fs.writeFileSync(MSG_FILE, JSON.stringify(all, null, 2));
    return json(res, 201, { message: 'Terima kasih! Pesanmu sudah kami terima dan akan dibalas maksimal 2 hari kerja.' });
  }
  json(res, 405, { error: 'Metode tidak diizinkan.' });
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) {
    return api(req, res, url.pathname.slice(5).split('/').filter(Boolean), url).catch(() => json(res, 500, { error: 'Kesalahan server.' }));
  }
  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.join(ROOT, rel);
  const allowed = file.startsWith(ROOT + path.sep) && !file.startsWith(path.join(ROOT, 'data')) && !/server\.js$|package\.json$/.test(file);
  fs.stat(file, (err, st) => {
    if (err || !st.isFile() || !allowed) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 Tidak ditemukan'); }
    const type = MIME[path.extname(file)] || 'application/octet-stream', m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (m) { // dukung Range agar video bisa di-seek
      const a = +m[1] || 0, b = m[2] ? +m[2] : st.size - 1;
      if (a > b || b >= st.size) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Content-Length': b - a + 1 });
      return fs.createReadStream(file, { start: a, end: b }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => console.log(`AGAMUA CODE berjalan di http://localhost:${PORT}`));
