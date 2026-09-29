/* Galeri modern: mosaik tanpa kartu, filter + pencarian, jendela detail lengkap.
   Butuh script.js (helper $, esc, api, ico, fail). */
(() => {
  const grid = $('#gal-grid'); if (!grid) return;
  const chips = $('#gal-chips'), q = $('#gal-q'), count = $('#gal-count'), empty = $('#gal-empty'), dlg = $('#viewer');
  const stage = $('#v-stage');
  const CAT_ICON = { Kelas: 'code', Acara: 'team', Proyek: 'web', Founder: 'team', Poster: 'play' };
  let all = [], view = [], cat = 'Semua', term = '', cur = 0, timer;

  const byId = (id) => all.find((x) => String(x.id) === String(id));
  const iconOf = (it) => ico(CAT_ICON[it.category] || 'code');
  const art = (it) => `<span class="g-art" aria-hidden="true">${iconOf(it)}</span>`;
  const norm = (s) => String(s || '').toLowerCase();

  /* ---------- Mosaik ---------- */
  const tile = (it, n) => {
    const pos = n % 7 === 0 ? ' big' : n % 7 === 3 ? ' wide' : '';
    const src = pos === ' big' ? (it.image || it.thumb) : (it.thumb || it.image);
    return `<button type="button" class="g-item${pos}${src ? '' : ' no-img'}" style="--h:${it.hue};--i:${Math.min(n, 14)}" data-id="${it.id}" aria-label="${esc(it.title)}, ${esc(it.category)}. Buka detail">${src ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">` : art(it)}<span class="g-cap"><small>${esc(it.category)}</small><b>${esc(it.title)}</b></span></button>`;
  };
  const apply = () => {
    const t = norm(term).trim();
    view = all.filter((it) => (cat === 'Semua' || it.category === cat) && (!t || norm([it.title, it.description, it.detail, it.category, it.place, ...(it.tags || [])].join(' ')).includes(t)));
    grid.innerHTML = view.map(tile).join('');
    grid.setAttribute('aria-busy', 'false');
    empty.hidden = view.length > 0;
    count.textContent = view.length === all.length ? `${all.length} dokumentasi` : `Menampilkan ${view.length} dari ${all.length} dokumentasi`;
  };
  const drawChips = () => {
    const cats = ['Semua', ...new Set(all.map((i) => i.category))];
    chips.innerHTML = cats.map((c) => `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}<em>${c === 'Semua' ? all.length : all.filter((i) => i.category === c).length}</em></button>`).join('');
  };
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    cat = b.dataset.cat; drawChips(); apply();
  });
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { term = q.value; apply(); }, 120); });
  grid.addEventListener('click', (e) => { const t = e.target.closest('.g-item'); if (t) open(t.dataset.id); });
  grid.addEventListener('error', (e) => { /* gambar gagal dimuat -> pakai ilustrasi */
    const im = e.target; if (im.tagName !== 'IMG') return;
    const b = im.closest('.g-item'), it = b && byId(b.dataset.id);
    if (it) { im.outerHTML = art(it); b.classList.add('no-img'); }
  }, true);

  /* ---------- Jendela detail ---------- */
  const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>` : '';
  const fmtDate = (d) => { const x = new Date(d); return isNaN(x) ? d : x.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); };
  const show = (idx) => {
    if (!view.length) return;
    cur = (idx + view.length) % view.length;
    const it = view[cur];
    const artBox = `<div class="v-art" style="--h:${it.hue}">${iconOf(it)}<p>${esc(it.category)}</p></div>`;
    stage.innerHTML = it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">` : artBox;
    const im = $('img', stage); if (im) im.onerror = () => { stage.innerHTML = artBox; };
    $('#v-count').textContent = `${cur + 1} dari ${view.length}`;
    $('#v-cat').textContent = it.category;
    $('#v-title').textContent = it.title;
    $('#v-desc').innerHTML = `<p>${esc(it.description)}</p>` + (it.detail ? String(it.detail).split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join('') : '');
    const meta = row('Tanggal', it.date && fmtDate(it.date)) + row('Lokasi', it.place);
    $('#v-meta').innerHTML = meta; $('#v-meta').hidden = !meta;
    $('#v-tags').innerHTML = (it.tags || []).map((t) => `<span>${esc(t)}</span>`).join('');
    const open_ = $('#v-open'); open_.hidden = !it.image; if (it.image) open_.href = it.image;
    const rel = all.filter((x) => x.category === it.category && x.id !== it.id).slice(0, 6);
    $('#v-rel-wrap').hidden = !rel.length;
    $('#v-rel').innerHTML = rel.map((x) => `<button type="button" data-id="${x.id}" style="--h:${x.hue}" aria-label="${esc(x.title)}">${x.thumb || x.image ? `<img src="${esc(x.thumb || x.image)}" alt="" loading="lazy">` : ico(CAT_ICON[x.category] || 'code')}<span>${esc(x.title)}</span></button>`).join('');
    $('.v-info', dlg).scrollTop = 0;
    history.replaceState(null, '', '#g-' + it.id);
  };
  function open(id) {
    let idx = view.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) { cat = 'Semua'; term = ''; q.value = ''; drawChips(); apply(); idx = view.findIndex((x) => String(x.id) === String(id)); }
    if (idx < 0) return;
    show(idx);
    if (!dlg.open) { dlg.showModal(); document.documentElement.classList.add('no-scroll'); }
  }
  $('.v-prev', dlg).onclick = () => show(cur - 1);
  $('.v-next', dlg).onclick = () => show(cur + 1);
  $('#v-rel').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) open(b.dataset.id); });
  $('#v-copy').onclick = async (e) => {
    const b = e.currentTarget, old = b.textContent;
    try { await navigator.clipboard.writeText(location.href); b.textContent = 'Tautan disalin ✓'; }
    catch { window.prompt('Salin tautan ini:', location.href); }
    setTimeout(() => { b.textContent = old; }, 1800);
  };
  dlg.addEventListener('click', (e) => {
    const t = e.target;
    if (t === dlg || t.id === 'v-stage' || t.classList.contains('v-media') || t.closest('.v-close')) dlg.close();
  });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('no-scroll');
    history.replaceState(null, '', location.pathname + location.search);
  });
  let x0 = null;  /* geser jari untuk pindah foto */
  const media = $('.v-media', dlg);
  media.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  media.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 60) show(cur + (e.clientX < x0 ? 1 : -1)); x0 = null; });

  /* ---------- Mulai ---------- */
  const fromHash = () => { const m = location.hash.match(/^#g-(\d+)$/); if (m && all.length && byId(m[1])) open(m[1]); };
  window.addEventListener('hashchange', fromHash);
  (async () => {
    try {
      all = await api('gallery');
      drawChips(); apply(); fromHash();
    } catch { fail(grid); grid.setAttribute('aria-busy', 'false'); }
  })();
})();
