const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(path, opts) {
  const res = await fetch('/api/' + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Permintaan gagal. Coba lagi.');
  return data;
}
const fail = (el, msg = 'Data belum bisa dimuat. Muat ulang halaman.') => { el.innerHTML = `<p class="error">${msg}</p>`; };

/* Layout bersama: header & footer disisipkan di setiap halaman */
const PAGES = [['index.html', 'Home', 'home'], ['tentang.html', 'Tentang Kami', 'tentang'], ['programkursus.html', 'Program Kursus', 'kursus'], ['galeri.html', 'Galeri', 'galeri'], ['kontak.html', 'Kontak', 'kontak']];
const cur = document.body.dataset.page;
document.body.insertAdjacentHTML('afterbegin', `<header class="nav"><a href="index.html" class="logo"><img src="logo.png" width="38" height="38" alt="">agamua<span>.code</span></a>
<button class="burger" id="burger" aria-label="Buka menu" aria-expanded="false">☰</button>
<nav id="menu">${PAGES.map((p) => `<a href="${p[0]}"${p[2] === cur ? ' class="active" aria-current="page"' : ''}>${p[1]}</a>`).join('')}</nav></header>`);
document.body.insertAdjacentHTML('beforeend', `<footer><div class="social" id="social"></div><p>© ${new Date().getFullYear()} AGAMUA CODE. Dibuat oleh komunitas, untuk komunitas.</p></footer>`);
api('contact').then((c) => { $('#social').innerHTML = c.filter((x) => x.social).map((x) => `<a href="${esc(x.href)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join(''); }).catch(() => {});
const burger = $('#burger'), menu = $('#menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});

/* Ikon */
const ICONS = {
  web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
  team: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 1.8 4 4"/>',
  git: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10c0 4-6 3-10 6"/>',
  play: '<path d="M8 5v14l11-7z"/>',
};
const ico = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.code}</svg>`;

/* Video pembuka (animasi SVG; otomatis diganti video asli bila file ada) */
async function initStage() {
  const st = $('#stage'); if (!st) return;
  const pp = $('#stage-pp'); let vid = null;
  pp.onclick = () => {
    const p = st.classList.toggle('paused');
    pp.textContent = p ? '▶ Putar' : '❚❚ Jeda'; pp.setAttribute('aria-pressed', p);
    if (vid) (p ? vid.pause() : vid.play());
  };
  try {
    const d = await api('home');
    if (!d.video || !(await fetch(d.video, { method: 'HEAD' })).ok) return;
    vid = document.createElement('video');
    vid.className = 'stage-video'; vid.src = d.video; vid.poster = 'img/profil.jpg';
    vid.muted = true; vid.loop = true; vid.autoplay = true; vid.playsInline = true; vid.setAttribute('aria-hidden', 'true');
    st.prepend(vid);
  } catch { /* tetap pakai animasi */ }
}

/* Video belajar */
function openVideo(v) {
  let m = $('#vmodal');
  if (!m) {
    document.body.insertAdjacentHTML('beforeend', '<div class="lightbox" id="vmodal" hidden><button aria-label="Tutup">✕</button><div id="vbody"></div></div>');
    m = $('#vmodal');
    const close = () => { m.hidden = true; $('#vbody').innerHTML = ''; };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.matches('button')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !m.hidden) close(); });
  }
  const body = $('#vbody');
  body.innerHTML = v.youtube
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${esc(v.youtube)}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen title="${esc(v.title)}"></iframe>`
    : `<video controls autoplay playsinline src="${esc(v.src)}"></video>`;
  const vid = $('video', body);
  if (vid) vid.addEventListener('error', () => { body.innerHTML = `<p class="vmiss">Video "${esc(v.title)}" belum tersedia. Simpan file di <code>${esc(v.src)}</code>, lalu coba lagi.</p>`; });
  m.hidden = false;
}
async function loadVideos() {
  const box = $('#videos'); if (!box) return;
  try {
    const list = await api('videos');
    box.innerHTML = list.map((x) => `<button class="vcard" data-id="${x.id}"><span class="thumb" style="--h:${x.hue}">${ico(x.icon)}<span class="level">${esc(x.level)}</span><i class="playbtn">${ico('play')}</i></span><b>${esc(x.title)}</b><small>${esc(x.course)}</small></button>`).join('');
    box.onclick = (e) => { const b = e.target.closest('.vcard'); if (b) openVideo(list.find((x) => String(x.id) === b.dataset.id)); };
  } catch { fail(box); }
}

/* Home */
function typeText(el, text) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
  let i = 0;
  (function tick() { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 28); })();
}
async function loadHome() {
  try {
    const d = await api('home');
    $('#stats').innerHTML = d.stats.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join('');
    typeText($('#typed'), d.snippet);
  } catch { $('#typed').textContent = '// server belum aktif'; }
}

/* Tentang */
const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('');
async function loadAbout() {
  try {
    const [a, team] = await Promise.all([api('about'), api('team')]);
    $('#about-desc').textContent = a.description;
    $('#about-visi').textContent = a.vision;
    $('#about-misi').innerHTML = a.mission.map((m) => `<li>${esc(m)}</li>`).join('');
    $('#team').innerHTML = team.map((t) => `
      <article class="card"><div class="avatar" style="--h:${t.hue}">${t.photo ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}">` : esc(initials(t.name))}</div>
      <h3>${esc(t.name)}</h3><span class="role">${esc(t.role)}</span><p>${esc(t.bio)}</p></article>`).join('');
  } catch { fail($('#about-desc')); }
}

/* Kursus */
const rupiah = (n) => (n === 0 ? 'Gratis' : 'Rp ' + n.toLocaleString('id-ID'));
async function loadCourses() {
  const box = $('#courses'); if (!box) return;
  box.innerHTML = '<div class="skeleton"></div>'.repeat(3);
  try {
    const all = await api('courses'), max = +box.dataset.limit || all.length, fb = $('#course-filters');
    const draw = (lv) => {
      const list = all.filter((c) => !lv || lv === 'Semua' || c.level === lv).slice(0, max);
      box.innerHTML = list.map((c) => `
        <article class="card course"><div class="c-cover" style="--h:${c.hue}">${ico(c.icon)}<span class="level">${esc(c.level)}</span></div><div class="c-body">
        <h3>${esc(c.title)}</h3><p>${esc(c.description)}</p>
        <div class="tags">${c.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="price">${rupiah(c.price)} <small>/ ${esc(c.duration)}</small></div>
        <a class="btn primary" href="kontak.html?kursus=${encodeURIComponent(c.title)}">Daftar kelas ini</a></div></article>`).join('') || '<p>Belum ada kursus di level ini.</p>';
    };
    if (fb) {
      fb.innerHTML = ['Semua', ...new Set(all.map((c) => c.level))].map((l, i) => `<button type="button" aria-pressed="${i === 0}">${esc(l)}</button>`).join('');
      fb.onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return;
        fb.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
        draw(b.textContent);
      };
    }
    draw();
  } catch { fail(box); }
}
const kursus = new URLSearchParams(location.search).get('kursus');
if (kursus && $('textarea[name=message]')) $('textarea[name=message]').value = `Halo, saya tertarik dengan kelas "${kursus}". Bagaimana cara mendaftarnya?`;

/* Slideshow otomatis */
function initSlider(box, slides) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.setAttribute('role', 'region'); box.setAttribute('aria-roledescription', 'carousel'); box.setAttribute('aria-label', 'Slideshow AGAMUA CODE'); box.tabIndex = 0;
  box.innerHTML = `<div class="track">${slides.map((s, i) => `<figure class="slide" style="--bg:url('${esc(s.image)}')" aria-label="Slide ${i + 1} dari ${slides.length}"><img src="${esc(s.image)}" alt="${esc(s.alt)}"${i ? ' loading="lazy"' : ''}></figure>`).join('')}</div>
    <button class="nv prev" aria-label="Slide sebelumnya">‹</button><button class="nv next" aria-label="Slide berikutnya">›</button>
    <button class="nv pp" aria-label="Jeda slideshow">❚❚</button>
    <div class="dots">${slides.map((_, i) => `<button aria-label="Ke slide ${i + 1}"></button>`).join('')}</div>`;
  const track = $('.track', box), dots = [...box.querySelectorAll('.dots button')], pp = $('.pp', box);
  let i = 0, timer, paused = reduce, hover = false;
  const go = (n) => { i = (n + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, k) => d.setAttribute('aria-current', k === i)); };
  const run = () => { clearInterval(timer); if (!paused && !hover && !document.hidden) timer = setInterval(() => go(i + 1), 5000); };
  const step = (n) => { go(n); run(); };
  const label = () => { pp.textContent = paused ? '▶' : '❚❚'; pp.setAttribute('aria-label', paused ? 'Putar slideshow' : 'Jeda slideshow'); };
  $('.prev', box).onclick = () => step(i - 1);
  $('.next', box).onclick = () => step(i + 1);
  dots.forEach((d, k) => { d.onclick = () => step(k); });
  pp.onclick = () => { paused = !paused; label(); run(); };
  box.addEventListener('mouseenter', () => { hover = true; run(); });
  box.addEventListener('mouseleave', () => { hover = false; run(); });
  box.addEventListener('focusin', () => { hover = true; run(); });
  box.addEventListener('focusout', () => { hover = false; run(); });
  box.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(i - 1); if (e.key === 'ArrowRight') step(i + 1); });
  let x0 = null;
  box.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  box.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) step(i + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  document.addEventListener('visibilitychange', run);
  label(); go(0); run();
}
async function loadSlides() {
  const box = $('#slider');
  try { initSlider(box, await api('slides')); } catch { box.closest('.slider-wrap').remove(); }
}

/* Galeri */
let items = [];
async function loadGallery() {
  try {
    items = await api('gallery');
    const cats = ['Semua', ...new Set(items.map((i) => i.category))];
    $('#filters').innerHTML = cats.map((c, i) => `<button type="button" aria-pressed="${i === 0}">${esc(c)}</button>`).join('');
    $('#gallery').innerHTML = items.map((i) => `
      <button class="tile${i.thumb ? ' has-img' : ''}" style="--h:${i.hue}" data-id="${i.id}" data-cat="${esc(i.category)}">${i.thumb ? `<img src="${esc(i.thumb)}" alt="" loading="lazy">` : ''}<span>${esc(i.title)}<small>${esc(i.category)}</small></span></button>`).join('');
  } catch { fail($('#gallery')); }
}
$('#filters')?.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $('#filters').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  document.querySelectorAll('.tile').forEach((t) => { t.hidden = b.textContent !== 'Semua' && t.dataset.cat !== b.textContent; });
});
const lb = $('#lightbox');
let lastFocus;
const closeLb = () => { lb.hidden = true; lastFocus && lastFocus.focus(); };
$('#gallery')?.addEventListener('click', (e) => {
  const t = e.target.closest('.tile'); if (!t) return;
  const it = items.find((i) => String(i.id) === t.dataset.id);
  lastFocus = t;
  $('#lb-content').innerHTML = `${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">` : `<div class="art" style="--h:${it.hue}"></div>`}<div class="txt"><h3>${esc(it.title)}</h3><p>${esc(it.description)}</p></div>`;
  lb.hidden = false; $('button', lb).focus();
});
lb?.addEventListener('click', (e) => { if (e.target === lb || e.target.matches('button')) closeLb(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb && !lb.hidden) closeLb(); });

/* Kontak */
async function loadContact() {
  try {
    const c = await api('contact');
    $('#contact-info').innerHTML = c.map((x) => `<li><b>${esc(x.label)}</b>${x.href ? `<a href="${esc(x.href)}"${x.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(x.value)}</a>` : esc(x.value)}</li>`).join('');
  } catch { fail($('#contact-info')); }
}
const form = $('#contact-form'), status = $('#form-status');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = ''; status.textContent = '';
  let valid = true;
  form.querySelectorAll('input,textarea').forEach((f) => {
    const bad = !f.checkValidity(); f.classList.toggle('bad', bad); valid = valid && !bad;
  });
  if (!valid) { status.className = 'err'; status.textContent = 'Periksa kembali isian yang ditandai merah.'; return; }
  const btn = $('button', form); btn.disabled = true; btn.textContent = 'Mengirim...';
  try {
    const r = await api('contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    status.className = 'ok'; status.textContent = r.message; form.reset();
  } catch (err) { status.className = 'err'; status.textContent = err.message; }
  btn.disabled = false; btn.textContent = 'Kirim pesan';
});

initStage();
loadVideos();
if ($('#slider')) loadSlides();
if ($('#stats')) loadHome();
if ($('#about-desc')) loadAbout();
loadCourses();
if ($('#gallery')) loadGallery();
if ($('#contact-info')) loadContact();
