/* =========================================================================
   Focus pull: scrolling turns the focus ring.

   Each stop (title, nine projects, the end) sits one step deeper in the
   scene. The camera moves so the stop being focused on is always at the
   focus distance; everything nearer or farther blurs by how far it is out
   of focus (worked out in dioptres, like a real lens), and the background
   lights shrink from bokeh discs to points as focus reaches infinity.

   Plain script (no modules), so index.html also opens straight from the folder.
   ========================================================================= */

(function () {
  'use strict';

  const DATA = window.FOCUS;
  const $ = (s, root = document) => root.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = false; // the "Pause motion" button stops the grain and the drifting lights

  const pauseBtn = document.querySelector('[data-pause]');
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    document.body.classList.toggle('is-paused', paused);
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.textContent = paused ? 'Play motion' : 'Pause motion';
  });

  const scroller = $('[data-scroller]');
  const stage = $('[data-stage]');
  const planesEl = $('[data-planes]');
  const captionsEl = $('[data-captions]');
  const af = $('[data-af]');
  const marksEl = $('[data-scale-marks]');
  const cue = $('[data-cue]');
  const readDist = $('[data-readout-dist]');
  const readF = $('[data-readout-f]');

  /* ------------------------------------------------------------ stops */

  const cvUrl = DATA.categories[0].projects[0].url;
  const stops = [{ kind: 'title', cat: -1, fstop: 'f/1.4', label: 'the title' }];
  DATA.categories.forEach((c, ci) =>
    c.projects.forEach((p) => stops.push({ kind: 'shot', cat: ci, fstop: c.fstop, category: c.name, label: p.name, ...p })),
  );
  stops.push({ kind: 'end', cat: 99, fstop: 'f/8', label: 'infinity' });
  const N = stops.length;

  // Build a plane (and, for projects, a caption) for every stop.
  let projectNo = 0;
  stops.forEach((st, i) => {
    const el = document.createElement('div');
    el.className = `plane plane--${st.kind === 'shot' ? 'shot' : 'text'}`;

    if (st.kind === 'title') {
      el.innerHTML = `
        <h1 class="plane__title">Bryce<br>de Bruyn</h1>
        <p class="plane__sub">Websites and games, brought into focus</p>`;
    } else if (st.kind === 'end') {
      el.innerHTML = `
        <p class="plane__title">∞</p>
        <p class="plane__sub">Everything in focus</p>
        <p class="plane__links">
          <a class="button button--solid" href="${cvUrl}" target="_blank" rel="noopener">Open my CV ↗</a>
          <a class="button" href="#work">See all work ↓</a>
        </p>`;
    } else {
      st.side = projectNo % 2 === 0 ? 1 : -1; // plane right, caption left; then the other way round
      st.row = (projectNo % 3) - 1;
      projectNo += 1;
      el.innerHTML = `<img src="${st.image}" alt="${st.name}: the opening screen" width="800" height="500" decoding="async">`;

      const cap = document.createElement('article');
      cap.className = `caption caption--${st.side > 0 ? 'left' : 'right'}`;
      cap.innerHTML = `
        <p class="caption__kicker">${String(projectNo).padStart(2, '0')} · ${st.category} · ${DATA.distances[i]}</p>
        <h2 class="caption__name">${st.name}</h2>
        <p class="caption__type">${st.type}</p>
        <p class="caption__text">${st.text}</p>
        ${st.note ? `<p class="caption__note">${st.note}</p>` : ''}
        <a class="button" href="${st.url}" target="_blank" rel="noopener">Open ${st.name} ↗</a>`;
      captionsEl.append(cap);
      st.caption = cap;
      st.link = $('a', cap);
      st.link.tabIndex = -1;
    }

    el.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (Math.abs(s - i) > 0.12) goTo(i);
      else if (st.kind === 'shot') window.open(st.url, '_blank', 'noopener');
    });

    planesEl.append(el);
    st.el = el;
  });

  // The lens distance scale.
  stops.forEach((st, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" aria-label="Focus on ${st.label} (${DATA.distances[i]})">${DATA.distances[i]}</button>`;
    $('button', li).addEventListener('click', () => goTo(i));
    marksEl.append(li);
    st.mark = $('button', li);
  });

  // The plain list at the bottom.
  $('[data-work-list]').innerHTML = DATA.categories
    .map(
      (c) => `
      <h3>${c.name}</h3>
      <ul>${c.projects
        .map((p) => `<li><a href="${p.url}" target="_blank" rel="noopener">${p.name} ↗</a><span>${p.type}</span></li>`)
        .join('')}</ul>`,
    )
    .join('');

  /* ------------------------------------------------------------ sizes */

  let W = 0;
  let H = 0;
  let mobile = false;
  let shotW = 0;
  const SEG = 1; // screen heights of scrolling per stop

  function measure() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    mobile = W < 900; // matches the CSS breakpoint
    shotW = mobile ? W * 0.86 : Math.min(W * 0.5, 860);
    scroller.style.height = `${(N - 1) * SEG * H + H}px`;

    stops.forEach((st) => {
      if (st.kind === 'shot') {
        st.el.style.width = `${shotW}px`;
        st.w = shotW;
        st.h = (shotW * 10) / 16;
        st.ox = mobile ? 0 : st.side * W * 0.17;
        st.oy = mobile ? -H * 0.17 : st.row * H * 0.035;
      } else {
        st.el.style.width = `${Math.min(W * 0.92, 1000)}px`;
        st.w = st.el.offsetWidth;
        st.h = st.el.offsetHeight;
        st.ox = 0;
        st.oy = mobile ? -H * 0.04 : 0;
      }
    });

    bokehCanvas.width = Math.round(W * dpr);
    bokehCanvas.height = Math.round(H * dpr);
    irisCanvas.width = Math.round(W * dpr);
    irisCanvas.height = Math.round(H * dpr);
    dirty = true;
  }

  /* ------------------------------------------------------------ scroll → focus */

  let s = 0; // where focus is now, in stops (0 = title, N-1 = infinity)
  let target = 0;
  let dirty = true;

  function readScroll() {
    const top = scroller.getBoundingClientRect().top;
    const raw = clamp(-top / (SEG * H), 0, N - 1);
    const k = Math.min(Math.floor(raw), N - 2);
    const f = raw - k;
    // Hold focus on each stop for a while, then rack quickly to the next.
    target = k + smooth(0.28, 0.82, f);
  }

  function goTo(i) {
    const top = scroller.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + i * SEG * H + 2, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ------------------------------------------------------------ render the planes */

  const BLUR = () => (mobile ? 12 : 18);

  function renderPlanes() {
    const k = BLUR();
    let nearest = Math.round(s);

    stops.forEach((st, i) => {
      if (st.caption) {
        const lock = 1 - smooth(0.06, 0.42, Math.abs(s - i));
        st.caption.style.opacity = lock.toFixed(3);
        st.caption.style.visibility = lock > 0.005 ? 'visible' : 'hidden';
        const shift = ((1 - lock) * 18).toFixed(1);
        st.caption.style.transform = mobile ? `translateY(${shift}px)` : `translateY(calc(-50% + ${shift}px))`;
        const live = lock > 0.7;
        st.caption.classList.toggle('is-live', live);
        st.link.tabIndex = live ? 0 : -1;
      }

      const dist = 1 + (i - s); // 1 = in focus; 2 = twice as far; 0.5 = halfway to the camera
      const near = clamp((dist - 0.45) / 0.3, 0, 1); // fades as it passes the camera
      const far = clamp(1 - (dist - 1) * 0.42, 0, 1); // only the next two stops show behind
      const op = Math.min(near, far);
      if (op <= 0.01 || dist <= 0.05) {
        st.el.style.visibility = 'hidden';
        return;
      }
      const sc = 1 / dist;
      const cx = W / 2 + st.ox * sc;
      const cy = H / 2 + st.oy * sc;
      const outOfFocus = Math.abs(1 / dist - 1); // in dioptres, relative to the focus distance
      const blur = Math.min(outOfFocus * k, 34) / sc; // the element is scaled after it's blurred

      st.el.style.visibility = 'visible';
      st.el.style.opacity = op.toFixed(3);
      st.el.style.zIndex = String(Math.round(1000 - dist * 100));
      st.el.style.transform = `translate(${(cx - st.w / 2).toFixed(1)}px, ${(cy - st.h / 2).toFixed(1)}px) scale(${sc.toFixed(4)})`;
      st.el.style.filter = blur > 0.25 ? `blur(${blur.toFixed(2)}px)` : 'none';
    });

    // Autofocus frame around the project in (or nearly in) focus.
    const st = stops[nearest];
    if (st && st.kind === 'shot') {
      const off = Math.abs(s - nearest);
      const sc = 1 / (1 + (nearest - s));
      const w = st.w * sc;
      const h = st.h * sc;
      const cx = W / 2 + st.ox * sc;
      const cy = H / 2 + st.oy * sc;
      af.style.width = `${w}px`;
      af.style.height = `${h}px`;
      af.style.transform = `translate(${cx - w / 2}px, ${cy - h / 2}px)`;
      af.style.opacity = (1 - smooth(0.02, 0.3, off)).toFixed(3);
      af.classList.toggle('is-locked', off < 0.03);
    } else {
      af.style.opacity = '0';
    }

    // Readouts.
    const kk = Math.min(Math.floor(s), N - 2);
    const f = s - kk;
    const d0 = 1 / DATA.metres[kk];
    const d1 = 1 / DATA.metres[kk + 1];
    const dioptres = d0 + (d1 - d0) * f;
    const m = 1 / dioptres;
    readDist.textContent = dioptres < 0.05 ? '∞' : m < 1 ? `${m.toFixed(2)} m` : m < 10 ? `${m.toFixed(1)} m` : `${Math.round(m)} m`;
    readF.textContent = stops[nearest].fstop;

    marksEl.style.transform = `translateY(${(-s * 72).toFixed(1)}px)`;
    stops.forEach((x, i) => x.mark.classList.toggle('is-current', i === nearest));

    cue.style.opacity = String(1 - clamp(s * 4, 0, 1));
  }

  /* ------------------------------------------------------------ aperture between categories */

  const irisCanvas = $('[data-iris]');
  const ictx = irisCanvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function renderIris() {
    const k = Math.min(Math.floor(s), N - 2);
    const f = s - k;
    const changes = stops[k].cat !== stops[k + 1].cat;
    const amount = changes ? Math.pow(Math.sin(Math.PI * f), 1.4) : 0;

    ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ictx.clearRect(0, 0, W, H);
    if (amount < 0.004) return;

    const blades = 7;
    const rMax = Math.hypot(W, H) / 2 + 40;
    const r = rMax * (1 - amount * 0.84);
    const rot = amount * 0.7 + k * 0.4;
    const cx = W / 2;
    const cy = H / 2;
    const pts = [];
    for (let b = 0; b < blades; b++) {
      const a = rot + (b / blades) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }

    // The blades: everything outside the opening.
    ictx.fillStyle = 'rgba(6, 6, 7, 0.985)';
    ictx.beginPath();
    ictx.rect(0, 0, W, H);
    ictx.moveTo(pts[0][0], pts[0][1]);
    for (let b = blades - 1; b >= 0; b--) ictx.lineTo(pts[b][0], pts[b][1]);
    ictx.closePath();
    ictx.fill('evenodd');

    // Blade edges: each edge of the opening carries on as the edge of a blade.
    ictx.strokeStyle = 'rgba(236, 235, 230, 0.09)';
    ictx.lineWidth = 1;
    for (let b = 0; b < blades; b++) {
      const [x1, y1] = pts[b];
      const [x0, y0] = pts[(b + blades - 1) % blades];
      const len = Math.hypot(x1 - x0, y1 - y0) || 1;
      ictx.beginPath();
      ictx.moveTo(x1, y1);
      ictx.lineTo(x1 + ((x1 - x0) / len) * rMax * 2, y1 + ((y1 - y0) / len) * rMax * 2);
      ictx.stroke();
    }
  }

  /* ------------------------------------------------------------ bokeh lights */

  const bokehCanvas = $('[data-bokeh]');
  const bctx = bokehCanvas.getContext('2d');
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const lights = Array.from({ length: 44 }, () => ({
    x: rand(),
    y: rand() * 0.9 + 0.05,
    size: 0.35 + rand() * 0.65,
    warm: rand() < 0.62,
    base: 0.55 + rand() * 0.45,
    phase: rand() * Math.PI * 2,
    drift: (rand() - 0.5) * 0.02,
  }));

  let driftTime = 0;
  function renderBokeh(time) {
    const q = s / (N - 1); // 0 close up → 1 at infinity
    const open = Math.pow(1 - q, 1.35);
    const maxR = (mobile ? 30 : 50) * open;
    const count = mobile ? 26 : lights.length;

    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, W, H);
    bctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < count; i++) {
      const L = lights[i];
      if (!paused) driftTime = time;
      const t = reduceMotion ? 0 : driftTime * 0.00008;
      const x = (L.x + Math.sin(t + L.phase) * 0.012 + L.drift * s) * W;
      const y = (L.y + Math.cos(t * 0.8 + L.phase) * 0.01) * H;
      const r = 1.1 + maxR * L.size;
      const sharp = 1 - clamp((r - 1.1) / 30, 0, 1); // 1 when it's a point
      const a = L.base * (0.07 + 0.83 * Math.pow(sharp, 3));
      const col = L.warm ? '255, 178, 102' : '120, 205, 230';

      if (r < 3) {
        const g = bctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
        g.addColorStop(0, `rgba(255, 246, 228, ${a})`);
        g.addColorStop(0.3, `rgba(${col}, ${a * 0.5})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        bctx.fillStyle = g;
        bctx.beginPath();
        bctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
        bctx.fill();
      } else {
        // An out-of-focus point light: a flat disc with a brighter rim.
        const g = bctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${col}, ${a * 0.55})`);
        g.addColorStop(0.82, `rgba(${col}, ${a * 0.7})`);
        g.addColorStop(0.95, `rgba(${col}, ${a})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        bctx.fillStyle = g;
        bctx.beginPath();
        bctx.arc(x, y, r, 0, Math.PI * 2);
        bctx.fill();
      }
    }
    bctx.globalCompositeOperation = 'source-over';
  }

  /* ------------------------------------------------------------ loop */

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(now - last, 64);
    last = now;
    readScroll();
    const before = s;
    s = reduceMotion ? target : s + (target - s) * (1 - Math.exp(-dt / 110));
    if (Math.abs(target - s) < 0.0004) s = target;
    if (dirty || Math.abs(s - before) > 0.00001) {
      renderPlanes();
      renderIris();
      dirty = false;
    }
    renderBokeh(now);
    requestAnimationFrame(frame);
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 120);
  });

  function start() {
    measure();
    readScroll();
    s = target;
    requestAnimationFrame(frame);
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else window.addEventListener('load', start);
})();
