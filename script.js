// =========================================================
// vitæLIK — interactions
// =========================================================

// Lumière qui suit la souris (avec lissage)
(() => {
  const glow   = document.getElementById('cursorLightGlow');
  const shadow = document.getElementById('cursorLightShadow');
  if (!glow && !shadow) return;
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;

  window.addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
  }, { passive: true });

  function loop() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    const t = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    if (glow)   glow.style.transform   = t;
    if (shadow) shadow.style.transform = t;
    requestAnimationFrame(loop);
  }
  loop();
})();

// Header au scroll
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Menu burger mobile
(() => {
  const burger = document.getElementById('navBurger');
  const nav = document.querySelector('.site-nav');
  if (!burger || !nav) return;
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
    });
  });
})();

// Reveal au scroll (IntersectionObserver)
(() => {
  const targets = document.querySelectorAll(
    '.reveal, .section-title, .section-lede, .lede, .pillars, .col-portrait, ' +
    '.remedy, .ateliers, .pack, .gallery-item, .contact-card, .hand-line, ' +
    '.cabinet-address, .disclaimer'
  );

  targets.forEach(el => {
    if (!el.classList.contains('reveal') && !el.classList.contains('hand-line')) {
      el.classList.add('fade-up');
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in', 'in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(t => io.observe(t));

  // Stagger pour les cartes
  document.querySelectorAll('.remedies .remedy, .packs .pack, .contact-cards .contact-card, .gallery .gallery-item')
    .forEach((el, i) => {
      el.style.transitionDelay = `${i * 90}ms`;
    });
})();

// Parallax léger sur le portrait et les feuilles
(() => {
  const portrait = document.querySelector('.portrait-frame img');
  const leaves = document.querySelectorAll('.leaves-bg .leaf');
  let mouseX = 0, mouseY = 0;

  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    if (portrait) {
      portrait.style.transform = `scale(1.04) translate(${mouseX * 6}px, ${mouseY * 6}px)`;
    }
    leaves.forEach((l, i) => {
      const f = (i + 1) * 6;
      l.style.translate = `${mouseX * f}px ${mouseY * f}px`;
    });
  }, { passive: true });
})();

// Année footer
document.getElementById('year').textContent = new Date().getFullYear();

// Anti-spam clic sur les liens mailto (évite d'ouvrir 10 fenêtres mail)
(() => {
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    let locked = false;
    link.addEventListener('click', (e) => {
      if (locked) { e.preventDefault(); return; }
      locked = true;
      link.style.pointerEvents = 'none';
      link.style.opacity = '.6';
      setTimeout(() => {
        locked = false;
        link.style.pointerEvents = '';
        link.style.opacity = '';
      }, 2500);
    });
  });
})();

// =========================================================
// Pollen flottant — particules dorées lentes
// =========================================================
(() => {
  const canvas = document.getElementById('pollenCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 28000); // ~50 sur 1440x900
    particles = Array.from({ length: Math.min(count, 70) }, () => makeParticle(true));
  }

  function makeParticle(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + Math.random() * 40,
      r: 1 + Math.random() * 2.2,
      vy: -(0.12 + Math.random() * 0.35),
      sway: 0.3 + Math.random() * 0.8,
      swaySpeed: 0.0008 + Math.random() * 0.0014,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.5
    };
  }

  function step(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.y += p.vy;
      p.x += Math.sin(t * p.swaySpeed + p.phase) * p.sway * 0.4;

      if (p.y < -10 || p.x < -20 || p.x > w + 20) {
        Object.assign(p, makeParticle(false));
      }

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(244, 210, 130, ${p.alpha})`);
      g.addColorStop(0.4, `rgba(236, 201, 131, ${p.alpha * 0.45})`);
      g.addColorStop(1, 'rgba(236, 201, 131, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(step);
})();
