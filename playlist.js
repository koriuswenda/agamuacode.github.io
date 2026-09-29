/* Video playlist: pemutar + daftar putar, filter, putar otomatis, riwayat tonton.
   Butuh script.js (helper $, esc, api, ico, fail). */
(async () => {
  const list = $('#pl-list'); if (!list) return;
  const screen = $('#pl-screen');
  let videos, courses;
  try { [videos, courses] = await Promise.all([api('videos'), api('courses')]); }
  catch { screen.innerHTML = ''; $('#pl-title').textContent = 'Video belum bisa dimuat'; fail(list); return; }
  if (!videos.length) { screen.innerHTML = ''; $('#pl-title').textContent = 'Belum ada video'; return; }

  /* Riwayat tersimpan di perangkat ini */
  const KEY = 'agamua-playlist-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const st = Object.assign({ seen: [], auto: true, last: null }, read());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* abaikan */ } };

  let cat = 'Semua', term = '', view = [], cur = null;
  const norm = (s) => String(s || '').toLowerCase();
  const seen = (id) => st.seen.includes(id);

  /* ---------- Daftar putar ---------- */
  const item = (v, n) => `<li><button type="button" class="pl-item" data-id="${v.id}" style="--h:${v.hue}">
    <span class="pl-th">${ico(v.icon)}<i class="pl-num">${String(videos.indexOf(v) + 1).padStart(2, '0')}</i><span class="pl-eq" aria-hidden="true"><b></b><b></b><b></b></span></span>
    <span class="pl-txt"><b>${esc(v.title)}</b><small>${esc(v.course)} · ${esc(v.level)}</small><em class="pl-seen">✓ Sudah ditonton</em></span></button></li>`;
  const paint = () => {
    list.querySelectorAll('.pl-item').forEach((b) => {
      const id = +b.dataset.id;
      b.setAttribute('aria-current', !!cur && cur.id === id);
      b.classList.toggle('seen', seen(id));
    });
    const n = videos.filter((v) => seen(v.id)).length;
    $('#pl-prog-text').textContent = `${n} dari ${videos.length} video sudah ditonton`;
    $('#pl-bar').style.width = (n / videos.length * 100) + '%';
    $('#pl-reset').hidden = !n;
  };
  const draw = () => {
    const t = norm(term).trim();
    view = videos.filter((v) => (cat === 'Semua' || v.course === cat) && (!t || norm(v.title + ' ' + v.course + ' ' + v.level).includes(t)));
    list.innerHTML = view.map(item).join('') || '<li class="pl-none">Tidak ada video yang cocok.</li>';
    paint();
  };
  const drawChips = () => {
    const cs = ['Semua', ...new Set(videos.map((v) => v.course))];
    $('#pl-chips').innerHTML = cs.map((c) => `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join('');
  };

  /* ---------- Pemutar ---------- */
  const mark = (id) => { if (!seen(id)) { st.seen.push(id); save(); paint(); } };
  const missing = (v) => `<div class="pl-miss" style="--h:${v.hue}">${ico(v.icon)}<p><b>Video belum tersedia</b><br>Simpan file di <code>${esc(v.src || '')}</code>, lalu muat ulang halaman.</p></div>`;
  function step(d, autoplay) {
    if (!view.length) return;
    const i = view.indexOf(cur);
    play(view[i < 0 ? 0 : (i + d + view.length) % view.length], autoplay);
  }
  function play(v, autoplay = false) {
    cur = v; st.last = v.id; save();
    const course = courses.find((c) => c.title === v.course);
    $('#pl-kicker').textContent = `${v.course} · ${v.level}`;
    $('#pl-title').textContent = v.title;
    $('#pl-sub').textContent = `Video ${videos.indexOf(v) + 1} dari ${videos.length}`;
    $('#pl-about').textContent = course ? course.description : '';
    const link = $('#pl-course'); link.hidden = !course;
    if (course) link.href = 'kontak.html?kursus=' + encodeURIComponent(course.title);
    if (course) link.textContent = 'Daftar kelas ' + course.title;
    if (v.youtube) {
      screen.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(v.youtube)}${autoplay ? '?autoplay=1' : ''}" allow="autoplay; fullscreen" allowfullscreen title="${esc(v.title)}"></iframe>`;
      if (autoplay) mark(v.id);
    } else {
      const el = document.createElement('video');
      el.controls = true; el.playsInline = true; el.preload = 'metadata'; el.autoplay = autoplay; el.src = v.src;
      el.addEventListener('play', () => mark(v.id));
      el.addEventListener('ended', () => { mark(v.id); if (st.auto) step(1, true); });
      el.addEventListener('error', () => { screen.innerHTML = missing(v); });
      screen.replaceChildren(el);
    }
    history.replaceState(null, '', '?v=' + v.id);
    document.title = `${v.title} – Video Playlist – AGAMUA CODE`;
    paint();
  }

  /* ---------- Kontrol ---------- */
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.pl-item'); if (!b) return;
    play(videos.find((v) => v.id === +b.dataset.id), true);
    if (matchMedia('(max-width:1000px)').matches) screen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#pl-chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.cat; drawChips(); draw(); });
  let timer;
  $('#pl-q').addEventListener('input', (e) => { clearTimeout(timer); timer = setTimeout(() => { term = e.target.value; draw(); }, 120); });
  $('#pl-prev').onclick = () => step(-1, true);
  $('#pl-next').onclick = () => step(1, true);
  const auto = $('#pl-auto');
  const syncAuto = () => auto.setAttribute('aria-checked', st.auto);
  auto.onclick = () => { st.auto = !st.auto; save(); syncAuto(); };
  $('#pl-reset').onclick = () => { st.seen = []; save(); paint(); };

  /* ---------- Mulai ---------- */
  syncAuto(); drawChips(); draw();
  const wanted = +new URLSearchParams(location.search).get('v') || st.last;
  play(videos.find((v) => v.id === wanted) || videos[0], false);
})();
