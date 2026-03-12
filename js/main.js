/**
 * main.js - NagrikConnect Shared Utilities
 * Multilingual Citizen Complaint & Governance CRM
 */

'use strict';

/* ============================================================
   MOBILE HAMBURGER MENU
============================================================ */
const initHamburgerMenu = () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navOverlay = document.querySelector('.nav-overlay') || createNavOverlay();

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('active');
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    navOverlay.classList.toggle('visible');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
  });

  navOverlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function createNavOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    return overlay;
  }
};

/* ============================================================
   ACTIVE NAV LINK DETECTION
============================================================ */
const initActiveNav = () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || href.endsWith(currentPath))) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
};

/* ============================================================
   INTERSECTION OBSERVER — SCROLL ANIMATIONS
============================================================ */
const initScrollAnimations = () => {
  const targets = document.querySelectorAll('.animate-on-scroll');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
};

/* ============================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
============================================================ */
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};

/* ============================================================
   TOAST NOTIFICATION SYSTEM
============================================================ */
let toastContainer = null;

const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.setAttribute('role', 'region');
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-label', 'Notifications');
    Object.assign(toastContainer.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    });
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const TOAST_ICONS = {
  success: '✔',
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
};

const TOAST_COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms before auto-dismiss (default 4000)
 */
window.showToast = (message, type = 'info', duration = 4000) => {
  const container = getToastContainer();
  const toast = document.createElement('div');
  const color = TOAST_COLORS[type] || TOAST_COLORS.info;
  const icon = TOAST_ICONS[type] || TOAST_ICONS.info;

  toast.setAttribute('role', 'alert');
  Object.assign(toast.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    borderRadius: '10px',
    background: '#1e293b',
    color: '#f1f5f9',
    boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 2px ${color}40`,
    borderLeft: `4px solid ${color}`,
    fontSize: '14px',
    maxWidth: '340px',
    pointerEvents: 'auto',
    cursor: 'pointer',
    opacity: '0',
    transform: 'translateX(60px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  });

  toast.innerHTML = `<span style="color:${color};font-size:16px;font-weight:700;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
  });

  const dismiss = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(60px)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  toast.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
};

/* ============================================================
   LOADING OVERLAY
============================================================ */
const createLoadingOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="loader-ring">
      <div></div><div></div><div></div><div></div>
    </div>
    <p class="loader-text">Loading…</p>`;
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(10,15,28,0.85)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', zIndex: '10000', opacity: '0',
    transition: 'opacity 0.3s ease', pointerEvents: 'none',
  });
  document.body.appendChild(overlay);
  return overlay;
};

window.showLoading = (text = 'Loading…') => {
  let overlay = document.getElementById('loading-overlay') || createLoadingOverlay();
  const label = overlay.querySelector('.loader-text');
  if (label) label.textContent = text;
  overlay.style.pointerEvents = 'all';
  overlay.style.opacity = '1';
  overlay.setAttribute('aria-hidden', 'false');
};

window.hideLoading = () => {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.setAttribute('aria-hidden', 'true');
};

/* ============================================================
   GENERIC MODAL OPEN / CLOSE
============================================================ */
window.openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Focus first focusable element
  const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  focusable?.focus();
  trapFocus(modal);
};

window.closeModal = (modalId) => {
  const modal = modalId ? document.getElementById(modalId) : document.querySelector('.modal.open');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// Close modal on backdrop click or Escape
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal') && e.target.classList.contains('open')) {
    window.closeModal(e.target.id);
  }
  if (e.target.dataset.closeModal) {
    window.closeModal(e.target.dataset.closeModal);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModal = document.querySelector('.modal.open');
    if (openModal) window.closeModal(openModal.id);
  }
});

// Focus trap inside modal
const trapFocus = (modal) => {
  const focusables = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const handler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (!modal.classList.contains('open')) modal.removeEventListener('keydown', handler);
  };
  modal.addEventListener('keydown', handler);
};

/* ============================================================
   PAGE TRANSITION EFFECT
============================================================ */
const initPageTransitions = () => {
  const curtain = document.createElement('div');
  curtain.id = 'page-curtain';
  Object.assign(curtain.style, {
    position: 'fixed', inset: '0', background: 'linear-gradient(135deg,#0d1b2a,#1a0533)',
    zIndex: '99999', pointerEvents: 'none', opacity: '1',
    transition: 'opacity 0.5s ease',
  });
  document.body.appendChild(curtain);
  // Fade in on load
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { curtain.style.opacity = '0'; });
  });

  // Fade out on navigation
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return;
    link.addEventListener('click', (e) => {
      if (link.target === '_blank' || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      curtain.style.opacity = '1';
      curtain.style.pointerEvents = 'all';
      setTimeout(() => { window.location.href = href; }, 450);
    });
  });
};

/* ============================================================
   SCROLL-TO-TOP BUTTON
============================================================ */
const initScrollToTop = () => {
  const btn = document.getElementById('scroll-top') || (() => {
    const b = document.createElement('button');
    b.id = 'scroll-top';
    b.innerHTML = '↑';
    b.setAttribute('aria-label', 'Scroll to top');
    Object.assign(b.style, {
      position: 'fixed', bottom: '80px', right: '24px',
      width: '44px', height: '44px', borderRadius: '50%',
      background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
      color: '#fff', border: 'none', cursor: 'pointer',
      fontSize: '20px', zIndex: '999', opacity: '0',
      transform: 'translateY(20px)', transition: 'opacity 0.3s, transform 0.3s',
    });
    document.body.appendChild(b);
    return b;
  })();

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.style.opacity = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(20px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

/* ============================================================
   KEYBOARD NAVIGATION SUPPORT
============================================================ */
const initKeyboardNav = () => {
  // Show focus rings only when navigating by keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

  // Arrow-key navigation inside nav menus
  document.querySelectorAll('[role="menu"]').forEach((menu) => {
    const items = () => Array.from(menu.querySelectorAll('[role="menuitem"]'));
    menu.addEventListener('keydown', (e) => {
      const list = items();
      const idx = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(idx + 1) % list.length]?.focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); list[(idx - 1 + list.length) % list.length]?.focus(); }
      if (e.key === 'Home')      { e.preventDefault(); list[0]?.focus(); }
      if (e.key === 'End')       { e.preventDefault(); list[list.length - 1]?.focus(); }
    });
  });
};

/* ============================================================
   INIT ON DOM READY
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initActiveNav();
  initScrollAnimations();
  initSmoothScroll();
  initScrollToTop();
  initKeyboardNav();
  initPageTransitions();
});
