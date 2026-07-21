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

  // Stagger pillar cards by DOM order
  document.querySelectorAll('.pillar-grid [data-reveal]').forEach((el, i) => {
    el.style.setProperty('--i', i);
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
