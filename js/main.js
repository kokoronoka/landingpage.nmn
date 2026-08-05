// ---------- Hero video seamless fade-loop (ported from RAF-based React spec) ----------
(function heroVideoFade() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const FADE_MS = 500;
  const FADE_OUT_LEAD = 0.55; // seconds before end to start fading out
  let rafId = null;
  let fadingOut = false;

  function cancelFade() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function fade(target, duration, onDone) {
    cancelFade();
    const start = performance.now();
    const from = parseFloat(video.style.opacity || (target === 0 ? '1' : '0'));

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      video.style.opacity = String(from + (target - from) * t);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
        if (onDone) onDone();
      }
    }
    rafId = requestAnimationFrame(step);
  }

  function fadeIn() { fade(1, FADE_MS); }
  function fadeOut(onDone) { fade(0, FADE_MS, onDone); }

  video.addEventListener('loadeddata', fadeIn);

  video.addEventListener('timeupdate', () => {
    if (fadingOut) return;
    if (video.duration && video.duration - video.currentTime <= FADE_OUT_LEAD) {
      fadingOut = true;
      fadeOut();
    }
  });

  video.addEventListener('ended', () => {
    video.style.opacity = '0';
    fadingOut = false;
    setTimeout(() => {
      video.currentTime = 0;
      video.play();
      fadeIn();
    }, 100);
  });

  // Autoplay can be blocked before user interaction on some browsers; retry on first interaction.
  video.play().catch(() => {
    const resume = () => { video.play(); document.removeEventListener('click', resume); };
    document.addEventListener('click', resume, { once: true });
  });
})();

// ---------- Email capture (placeholder — wire up to your ESP/backend) ----------
(function emailForm() {
  const form = document.querySelector('.hero-cta');
  if (!form) return;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('.btn-circle');

  button.addEventListener('click', () => {
    const value = input.value.trim();
    if (!value || !value.includes('@')) {
      input.focus();
      return;
    }
    // TODO: replace with real submission (fetch to your API / ESP endpoint)
    console.log('Subscribe email:', value);
    input.value = '';
    input.placeholder = 'Thanks — you’re on the list!';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') button.click();
  });
})();

// ---------- Nav background on scroll ----------
(function navScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20
      ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 30px rgba(0,0,0,0.5)'
      : 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 30px rgba(0,0,0,0.35)';
  });
})();

// ---------- Scroll progress bar ----------
(function scrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ---------- Scroll-reveal (IntersectionObserver) ----------
(function scrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Stagger grid children by DOM order (within each grid independently)
  document.querySelectorAll('.stagger-grid').forEach((grid) => {
    grid.querySelectorAll(':scope > [data-reveal]').forEach((el, i) => {
      el.style.setProperty('--i', i);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el) => observer.observe(el));
})();

// ---------- Animated stat counters ----------
(function statCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  stats.forEach((el) => observer.observe(el));
})();

// ---------- Parallax on scroll ----------
(function parallax() {
  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let ticking = false;

  function update() {
    const viewportH = window.innerHeight;
    layers.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const rect = el.closest('section')?.getBoundingClientRect() || el.getBoundingClientRect();
      const offset = (rect.top - viewportH / 2) * speed * -1;
      el.style.transform = `translate3d(0, ${offset * 0.15}px, 0)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
})();

// ---------- Cursor spotlight on liquid-glass surfaces ----------
(function cursorSpotlight() {
  const glass = document.querySelectorAll('.liquid-glass');
  if (!glass.length) return;
  glass.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
    });
  });
})();

// ---------- Circular capsule diagram interactivity ----------
(function circleDiagram() {
  const points = document.querySelectorAll('.circle-point');
  const stage = document.querySelector('.circle-stage');
  if (!points.length || !stage) return;

  function setActive(target) {
    points.forEach((p) => {
      p.classList.toggle('is-active', p === target);
      p.classList.toggle('is-dimmed', target !== null && p !== target);
    });
  }

  points.forEach((point) => {
    point.addEventListener('click', () => setActive(point));
    point.addEventListener('focus', () => setActive(point));
  });

  stage.addEventListener('mouseleave', () => setActive(null));
})();

// ---------- Sticky WhatsApp widget ----------
(function whatsappWidget() {
  const fab = document.getElementById('waFabBtn');
  const panel = document.getElementById('waPanel');
  const closeBtn = document.getElementById('waPanelClose');
  const widget = document.querySelector('.whatsapp-widget');
  if (!fab || !panel || !widget) return;

  function open() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
  }
  function close() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    panel.classList.contains('is-open') ? close() : open();
  }

  fab.addEventListener('click', toggle);
  closeBtn.addEventListener('click', close);

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

// ---------- 10 Reasons carousel ----------
(function reasonsCarousel() {
  const track = document.getElementById('reasonsTrack');
  const prevBtn = document.getElementById('reasonsPrev');
  const nextBtn = document.getElementById('reasonsNext');
  const dotsWrap = document.getElementById('reasonsDots');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.reason-card'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', 'Go to reason ' + (i + 1));
    dot.addEventListener('click', () => { scrollToIndex(i); pauseThenResume(); });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function cardStep() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }
  function currentIndex() {
    return Math.round(track.scrollLeft / cardStep());
  }
  function scrollToIndex(i) {
    track.scrollTo({ left: i * cardStep(), behavior: 'smooth' });
  }
  function updateDots() {
    const idx = Math.max(0, Math.min(cards.length - 1, currentIndex()));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }

  track.addEventListener('scroll', updateDots, { passive: true });

  function next() {
    const idx = currentIndex();
    scrollToIndex(idx >= cards.length - 1 ? 0 : idx + 1);
  }
  function prev() {
    scrollToIndex(Math.max(0, currentIndex() - 1));
  }

  let autoTimer = null;
  function startAuto() {
    if (reduceMotion) return;
    stopAuto();
    autoTimer = setInterval(next, 1500);
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }
  let resumeTimeout = null;
  function pauseThenResume() {
    stopAuto();
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(startAuto, 5000);
  }

  prevBtn?.addEventListener('click', () => { prev(); pauseThenResume(); });
  nextBtn?.addEventListener('click', () => { next(); pauseThenResume(); });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('touchstart', pauseThenResume, { passive: true });
  track.addEventListener('wheel', pauseThenResume, { passive: true });

  // Mouse-drag-to-scroll (native overflow scrolling already covers touch swipe)
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    isDragging = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
    pauseThenResume();
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });
  window.addEventListener('pointerup', () => {
    isDragging = false;
    track.classList.remove('is-dragging');
  });

  updateDots();
  startAuto();
})();

// ---------- Custom cursor (vanilla port of a GSAP dot+ring cursor) ----------
(function customCursor() {
  const cursorDot = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  if (!cursorDot || !cursorRing) return;

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  document.documentElement.classList.add('has-custom-cursor');

  let cX = -200, cY = -200;
  let rX = -200, rY = -200;

  document.addEventListener('mousemove', (e) => {
    cX = e.clientX;
    cY = e.clientY;
    cursorDot.style.left = cX + 'px';
    cursorDot.style.top = cY + 'px';
  });

  function tick() {
    rX += (cX - rX) * 0.12;
    rY += (cY - rY) * 0.12;
    cursorRing.style.left = rX + 'px';
    cursorRing.style.top = rY + 'px';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
  });
})();

// ---------- Interactive blood-cell background for "Why NMN Matters" ----------
(function scienceBloodFlow() {
  const canvas = document.getElementById('science-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const s = canvas.parentElement;
    W = canvas.width = s.offsetWidth;
    H = canvas.height = s.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse tracking (listen on section; canvas has pointer-events:none)
  let mx = -9999, my = -9999;
  const section = canvas.parentElement;
  section.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  section.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  // ── Cell factory ──────────────────────────────────────────
  const TOTAL = 28;
  const makeCell = () => {
    const bvx = (Math.random() - 0.5) * 0.38;
    const bvy = (Math.random() - 0.5) * 0.22;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      rx: 20 + Math.random() * 16,
      ry: 13 + Math.random() * 10,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.007,
      vx: bvx, vy: bvy,
      baseVx: bvx, baseVy: bvy,
      phase: Math.random() * Math.PI * 2,
      tilt: Math.random() * 0.7,
      glow: 0,
    };
  };
  const cells = Array.from({ length: TOTAL }, makeCell);

  // ── Background (vessel interior) ─────────────────────────
  function drawBg() {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    g.addColorStop(0, '#f8dcd0');
    g.addColorStop(0.38, '#f0c4b0');
    g.addColorStop(0.72, '#e4a898');
    g.addColorStop(1, '#cc8878');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    [[W * 0.88, H * 0.78, 0.11], [W * 0.66, H * 0.60, 0.09], [W * 0.44, H * 0.44, 0.07]]
      .forEach(([rx, ry, op]) => {
        ctx.beginPath();
        ctx.ellipse(W / 2, H / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(175,105,95,${op})`;
        ctx.lineWidth = Math.max(W, H) * 0.042;
        ctx.stroke();
      });
  }

  // ── Single cell draw ─────────────────────────────────────
  function drawCell(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);
    const sy = Math.max(0.18, 1 - c.tilt * 0.82);
    ctx.scale(1, sy);

    if (c.glow > 0.01) {
      ctx.beginPath();
      ctx.ellipse(0, 0, c.rx * 1.55, c.ry * 1.55, 0, 0, Math.PI * 2);
      const hg = ctx.createRadialGradient(0, 0, c.rx * 0.8, 0, 0, c.rx * 1.55);
      hg.addColorStop(0, `rgba(255,120,140,${c.glow * 0.45})`);
      hg.addColorStop(1, `rgba(255,80,100,0)`);
      ctx.fillStyle = hg;
      ctx.fill();
    }

    ctx.shadowColor = 'rgba(80,20,20,.22)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 3;

    const bright = c.glow * 28;
    const g = ctx.createRadialGradient(-c.rx * 0.15, -c.ry * 0.2, c.rx * 0.04, 0, 0, c.rx);
    g.addColorStop(0, `rgb(${216 + bright},${80 + bright},${106 + bright})`);
    g.addColorStop(0.38, `rgb(${192 + bright},${56 + bright},${85 + bright})`);
    g.addColorStop(0.75, '#8E2040');
    g.addColorStop(1, '#6A1030');
    ctx.beginPath();
    ctx.ellipse(0, 0, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    const dg = ctx.createRadialGradient(0, 0, 0, 0, 0, c.rx * 0.42);
    dg.addColorStop(0, '#78183088');
    dg.addColorStop(1, 'rgba(140,30,50,0)');
    ctx.beginPath();
    ctx.ellipse(0, 0, c.rx * 0.42, c.ry * 0.40, 0, 0, Math.PI * 2);
    ctx.fillStyle = dg;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-c.rx * 0.22, -c.ry * 0.28, c.rx * 0.27, c.ry * 0.20, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,200,200,${0.26 + c.glow * 0.22})`;
    ctx.fill();
    ctx.restore();
  }

  // ── Visibility guard (skip renders when off-screen) ───────
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 })
    .observe(section);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    drawBg();
    cells.forEach(drawCell);
    return;
  }

  // ── Physics constants ─────────────────────────────────────
  const PUSH_R = 88;
  const PUSH_F = 3.2;

  // ── Animation loop ────────────────────────────────────────
  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    t += 0.01;
    ctx.clearRect(0, 0, W, H);
    drawBg();
    cells.forEach((c) => {
      const dx = c.x - mx, dy = c.y - my;
      const dist = Math.hypot(dx, dy);
      if (dist < PUSH_R && dist > 0) {
        const f = (1 - dist / PUSH_R) * PUSH_F;
        c.vx += (dx / dist) * f;
        c.vy += (dy / dist) * f;
        c.glow = Math.min(1, c.glow + 0.14);
      } else {
        c.glow = Math.max(0, c.glow - 0.04);
      }

      c.vx = c.vx * 0.88 + c.baseVx * 0.12;
      c.vy = c.vy * 0.88 + c.baseVy * 0.12;

      c.x += c.vx + Math.sin(t * 0.45 + c.phase) * 0.14;
      c.y += c.vy + Math.cos(t * 0.38 + c.phase + 1) * 0.10;
      c.angle += c.spin;

      if (c.x > W + c.rx * 2) c.x = -c.rx * 2;
      if (c.x < -c.rx * 2) c.x = W + c.rx * 2;
      if (c.y > H + c.ry * 2) c.y = -c.ry * 2;
      if (c.y < -c.ry * 2) c.y = H + c.ry * 2;

      drawCell(c);
    });
  })();
})();
