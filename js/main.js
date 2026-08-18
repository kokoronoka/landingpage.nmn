
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

// ---------- Ingredients pinned scroll-steps ----------
(function pinnedIngredients() {
  const wrapper = document.getElementById('ingredientsPinWrapper');
  if (!wrapper) return;

  const circle = document.getElementById('pinCircle');
  const icons = Array.from(wrapper.querySelectorAll('.pin-icon'));
  const contents = Array.from(wrapper.querySelectorAll('.pin-content'));
  const rings = Array.from(wrapper.querySelectorAll('.pin-ring-el'));
  const orbitDots = Array.from(wrapper.querySelectorAll('.pin-dot'));
  const progressDots = Array.from(wrapper.querySelectorAll('.pin-progress-dot'));
  const badge = document.getElementById('pinBadge');
  const badgeNum = document.getElementById('pinBadgeNum');
  if (!icons.length || !contents.length || !badge) return;

  const stepCount = icons.length;
  const badgeNumbers = ['01', '02', '03', '04', '05', '06'];

  // Badge rides the outermost visible ring, which grows with each step (kept in
  // sync with the CSS data-ring widths — smallest ring first, larger rings added
  // outside it). On step 1 that ring is the oversized half circle, whose centre
  // sits below the container, so the badge tracks a shallow arc across its top
  // instead of a full orbit.
  const RING_DIAMETERS = [42, 61, 80, 100]; // %, index-aligned with step/data-ring
  const HALF_RING_CENTER_X = 16;  // % of container, matches the CSS step-0 ring
  const HALF_RING_CENTER_Y = 152;
  const HALF_RING_RADIUS = 100;
  const HALF_RING_SWEEP = Math.PI / 6;
  const isWide = () => window.matchMedia('(min-width: 861px)').matches;

  let activeIndex = -1;
  let ticking = false;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;

    icons.forEach((el, i) => el.classList.toggle('is-active', i === index));
    contents.forEach((el, i) => el.classList.toggle('is-active', i === index));
    progressDots.forEach((el, i) => el.classList.toggle('is-active', i === index));

    // Layers accumulate: step N reveals rings 0..N and N orbiting dots.
    rings.forEach((el, i) => el.classList.toggle('is-shown', i <= index));
    orbitDots.forEach((el, i) => el.classList.toggle('is-shown', i < index));

    if (circle) circle.dataset.step = String(index);
    badgeNum.textContent = badgeNumbers[index] || String(index + 1).padStart(2, '0');
    badge.classList.toggle('pin-badge--gold', index === 2);
  }

  function update() {
    const rect = wrapper.getBoundingClientRect();
    const total = wrapper.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.min(1, Math.max(0, total > 0 ? scrolled / total : 0));
    const stepFloat = progress * stepCount;
    const index = Math.min(stepCount - 1, Math.floor(stepFloat));

    setActive(index);

    // Badge tracks the outermost visible ring as scroll progresses (continuous, not step-snapped)
    let centerX = 50;
    let centerY = 50;
    let radius = RING_DIAMETERS[index] / 2;
    let angle = (stepFloat / stepCount) * Math.PI * 2 - Math.PI / 2;

    if (index === 0 && isWide()) {
      centerX = HALF_RING_CENTER_X;
      centerY = HALF_RING_CENTER_Y;
      radius = HALF_RING_RADIUS;
      angle = -Math.PI / 2 + (stepFloat - 0.5) * HALF_RING_SWEEP;
    }

    badge.style.left = (centerX + radius * Math.cos(angle)) + '%';
    badge.style.top = (centerY + radius * Math.sin(angle)) + '%';

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

// ---------- Miron Glass immersive scroll-expand video ----------
(function glassScrollExpand() {
  const wrapper = document.getElementById('glassHeroWrapper');
  const bg = document.getElementById('glassHeroBg');
  const media = document.getElementById('glassHeroMedia');
  const scrim = document.getElementById('glassHeroVideoScrim');
  const wordLeft = document.getElementById('glassWordLeft');
  const wordRight = document.getElementById('glassWordRight');
  const hint = document.getElementById('glassHeroHint');
  if (!wrapper || !media) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isMobile() {
    return window.innerWidth < 768;
  }

  // Start and end sizes are both derived from the live viewport, so the growth
  // finishes exactly at progress 1. Fixed pixel growth used to blow straight
  // past the CSS max-width on small screens — the width hit its clamp around
  // 11% scroll and froze while the height carried on growing.
  function metrics() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = isMobile();
    return {
      startW: mobile ? Math.min(220, vw * 0.62) : 300,
      startH: mobile ? Math.min(300, vh * 0.38) : 400,
      endW: mobile ? vw * 0.92 : Math.min(vw * 0.95, 1150),
      endH: mobile ? vh * 0.72 : Math.min(vh * 0.85, 780),
      textShift: mobile ? 75 : 60
    };
  }

  function render(progress) {
    const { startW, startH, endW, endH, textShift } = metrics();

    media.style.width = (startW + progress * (endW - startW)) + 'px';
    media.style.height = (startH + progress * (endH - startH)) + 'px';

    if (wordLeft) wordLeft.style.transform = `translateX(${-progress * textShift}vw)`;
    if (wordRight) wordRight.style.transform = `translateX(${progress * textShift}vw)`;

    if (bg) bg.style.opacity = String(1 - progress);
    if (scrim) scrim.style.opacity = String(Math.max(0.15, 0.55 - progress * 0.4));
    if (hint) hint.style.opacity = progress > 0.12 ? '0' : '1';
  }

  if (reduceMotion) {
    render(1);
    return;
  }

  let ticking = false;

  function update() {
    const rect = wrapper.getBoundingClientRect();
    const total = wrapper.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.min(1, Math.max(0, total > 0 ? scrolled / total : 0));
    render(progress);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', update);

  update();
})();
