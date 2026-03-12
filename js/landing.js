/**
 * landing.js - NagrikConnect Landing Page
 * Particle system, hero animations, counters, parallax, typewriter
 */

'use strict';

/* ============================================================
   CANVAS PARTICLE SYSTEM
============================================================ */
const initParticleSystem = () => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 120;
  const CONNECTION_DISTANCE = 130;
  const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#a78bfa', '#22d3ee'];

  let particles = [];
  let animId;
  let W, H;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() > 0.5 ? -10 : H + 10);
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.r  = Math.random() * 2.5 + 1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.6 + 0.3;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.02;
      this.alpha = 0.3 + Math.sin(this.pulse) * 0.25;
      if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  const init = () => {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  };

  const connectParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.4;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => { p.update(); p.draw(); });
    connectParticles();
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(animate);
  };

  resize();
  init();
  animate();

  const resizeObserver = new ResizeObserver(() => {
    resize();
    particles.forEach((p) => { p.x = Math.min(p.x, W); p.y = Math.min(p.y, H); });
  });
  resizeObserver.observe(canvas);

  // Pause when tab hidden to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animate();
  });
};

/* ============================================================
   ANIMATED TEXT REVEAL — HERO HEADLINE (WORD BY WORD)
============================================================ */
const initHeroTextReveal = () => {
  const headline = document.querySelector('.hero-headline');
  if (!headline) return;

  const originalText = headline.textContent.trim();
  const words = originalText.split(' ');
  headline.innerHTML = words
    .map((w, i) => `<span class="word-reveal" style="--i:${i}">${w}</span>`)
    .join(' ');

  // Trigger after a short delay so the curtain fade finishes first
  setTimeout(() => {
    headline.querySelectorAll('.word-reveal').forEach((span, i) => {
      setTimeout(() => span.classList.add('visible'), i * 120);
    });
  }, 300);
};

/* ============================================================
   COUNTER ANIMATION FOR STATS
============================================================ */
const animateCounter = (el) => {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  if (isNaN(target)) return;
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const startTime = performance.now();

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(easeOutQuart(progress) * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + suffix;
  };

  requestAnimationFrame(step);
};

const initCounters = () => {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
};

/* ============================================================
   SCROLL-BASED STORYTELLING
============================================================ */
const initScrollStorytelling = () => {
  const sections = document.querySelectorAll('[data-story-section]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = entry.target.dataset.storySection;
        if (entry.isIntersecting) {
          entry.target.classList.add('story-active');
          document.querySelectorAll(`.story-indicator [data-idx="${idx}"]`)
            .forEach((dot) => dot.classList.add('active'));
        } else {
          document.querySelectorAll(`.story-indicator [data-idx="${idx}"]`)
            .forEach((dot) => dot.classList.remove('active'));
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((sec) => observer.observe(sec));
};

/* ============================================================
   FLOATING ICON ANIMATIONS
============================================================ */
const initFloatingIcons = () => {
  document.querySelectorAll('.floating-icon').forEach((icon, i) => {
    // Staggered float animation via CSS custom properties
    icon.style.setProperty('--float-delay', `${i * 0.4}s`);
    icon.style.setProperty('--float-duration', `${3 + Math.random() * 2}s`);
    icon.style.setProperty('--float-distance', `${10 + Math.random() * 10}px`);
    icon.style.setProperty('--float-rotate', `${(Math.random() - 0.5) * 20}deg`);
  });
};

/* ============================================================
   TYPEWRITER EFFECT FOR TAGLINE
============================================================ */
const initTypewriter = () => {
  const el = document.querySelector('.typewriter-text');
  if (!el) return;

  const phrases = el.dataset.phrases
    ? JSON.parse(el.dataset.phrases)
    : [
        'Report. Track. Resolve.',
        'आपकी आवाज़, सरकार तक।',
        'तुमची तक्रार, आमची जबाबदारी.',
        'Your Voice. Government Action.',
      ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const type = () => {
    const current = phrases[phraseIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.substring(0, charIdx);
    } else {
      charIdx++;
      el.textContent = current.substring(0, charIdx);
    }

    let delay = deleting ? 50 : 90;

    if (!deleting && charIdx === current.length) {
      delay = 2200;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(type, delay);
  };

  setTimeout(type, 800);
};

/* ============================================================
   PARALLAX EFFECT ON HERO
============================================================ */
const initParallax = () => {
  const hero = document.querySelector('.hero-section');
  const layers = document.querySelectorAll('[data-parallax-speed]');
  if (!hero || !layers.length) return;

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || 0.3;
      layer.style.transform = `translateY(${scrollY * speed}px)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
};

/* ============================================================
   PROBLEM CARDS STAGGERED ANIMATION
============================================================ */
const initProblemCards = () => {
  const cards = document.querySelectorAll('.problem-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(cards).indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('card-visible');
          }, idx * 150);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  cards.forEach((card) => {
    card.classList.add('card-hidden');
    observer.observe(card);
  });
};

/* ============================================================
   FEATURE CARDS HOVER TILT
============================================================ */
const initCardTilt = () => {
  document.querySelectorAll('.feature-card, .problem-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
};

/* ============================================================
   SCROLL PROGRESS BAR
============================================================ */
const initScrollProgress = () => {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${(window.scrollY / total) * 100}%`;
  }, { passive: true });
};

/* ============================================================
   NAV HIDE ON SCROLL DOWN / SHOW ON SCROLL UP
============================================================ */
const initNavBehavior = () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    if (curr > lastScroll && curr > 80) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    nav.classList.toggle('nav-scrolled', curr > 40);
    lastScroll = curr;
  }, { passive: true });
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initParticleSystem();
  initHeroTextReveal();
  initCounters();
  initScrollStorytelling();
  initFloatingIcons();
  initTypewriter();
  initParallax();
  initProblemCards();
  initCardTilt();
  initScrollProgress();
  initNavBehavior();
});
