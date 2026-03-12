/**
 * login.js - NagrikConnect Login Page
 * Tab switching, form validation, password strength, remember me, redirect
 */

'use strict';

/* ============================================================
   TAB SWITCHING — CITIZEN / ADMIN
============================================================ */
const initLoginTabs = () => {
  const tabs = document.querySelectorAll('.login-tab');
  const forms = document.querySelectorAll('.login-form-panel');
  if (!tabs.length || !forms.length) return;

  const switchTab = (targetId) => {
    tabs.forEach((t) => {
      const active = t.dataset.tab === targetId;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    forms.forEach((f) => {
      const show = f.id === targetId;
      f.classList.toggle('active', show);
      f.setAttribute('aria-hidden', String(!show));
      if (show) {
        f.style.animation = 'fadeSlideIn 0.35s ease forwards';
        const firstInput = f.querySelector('input');
        setTimeout(() => firstInput?.focus(), 50);
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchTab(tab.dataset.tab); }
    });
  });

  // Activate first tab by default
  if (tabs[0]) switchTab(tabs[0].dataset.tab);
};

/* ============================================================
   INLINE ERROR HELPERS
============================================================ */
const showError = (input, message) => {
  clearError(input);
  input.classList.add('input-error');
  const err = document.createElement('p');
  err.className = 'field-error';
  err.textContent = message;
  err.setAttribute('role', 'alert');
  input.parentElement.appendChild(err);
};

const clearError = (input) => {
  input.classList.remove('input-error');
  const existing = input.parentElement.querySelector('.field-error');
  existing?.remove();
};

/* ============================================================
   EMAIL VALIDATION
============================================================ */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/* ============================================================
   PASSWORD STRENGTH INDICATOR
============================================================ */
const initPasswordStrength = () => {
  const passwordInputs = document.querySelectorAll('input[type="password"][data-strength]');
  passwordInputs.forEach((input) => {
    let indicator = input.parentElement.querySelector('.strength-bar');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'strength-bar';
      indicator.innerHTML = `
        <div class="strength-segments">
          <span class="seg" data-level="1"></span>
          <span class="seg" data-level="2"></span>
          <span class="seg" data-level="3"></span>
          <span class="seg" data-level="4"></span>
        </div>
        <p class="strength-label"></p>`;
      input.parentElement.appendChild(indicator);
    }

    const segs  = indicator.querySelectorAll('.seg');
    const label = indicator.querySelector('.strength-label');

    const LABELS  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const CLASSES = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];

    const calcStrength = (pw) => {
      let score = 0;
      if (pw.length >= 8)  score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      return score;
    };

    input.addEventListener('input', () => {
      const score = calcStrength(input.value);
      segs.forEach((seg, i) => {
        seg.className = 'seg';
        if (i < score) seg.classList.add(CLASSES[score]);
      });
      label.textContent = input.value ? LABELS[score] : '';
    });
  });
};

/* ============================================================
   SHOW / HIDE PASSWORD TOGGLE
============================================================ */
const initPasswordToggle = () => {
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    const input = document.getElementById(btn.dataset.target) ||
                  btn.parentElement.querySelector('input[type="password"], input[type="text"]');
    if (!input) return;

    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.innerHTML = isHidden
        ? `<svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
};

/* ============================================================
   REMEMBER ME — PERSIST EMAIL IN LOCALSTORAGE
============================================================ */
const REMEMBER_KEY = 'nagrik_remember_email';

const initRememberMe = () => {
  const citizenForm = document.getElementById('citizen-form');
  if (!citizenForm) return;

  const emailInput  = citizenForm.querySelector('input[type="email"]');
  const rememberBox = citizenForm.querySelector('input[name="remember"]');
  if (!emailInput || !rememberBox) return;

  // Restore saved email
  const saved = localStorage.getItem(REMEMBER_KEY);
  if (saved) {
    emailInput.value = saved;
    rememberBox.checked = true;
  }

  citizenForm.addEventListener('submit', () => {
    if (rememberBox.checked) {
      localStorage.setItem(REMEMBER_KEY, emailInput.value.trim());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  });
};

/* ============================================================
   FORM VALIDATION
============================================================ */
const validateLoginForm = (form) => {
  let valid = true;
  const email    = form.querySelector('input[type="email"]');
  const password = form.querySelector('input[type="password"]') || form.querySelector('input[name="password"]');

  if (email) {
    clearError(email);
    if (!email.value.trim()) {
      showError(email, 'Email address is required.');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    }
  }

  if (password) {
    clearError(password);
    if (!password.value) {
      showError(password, 'Password is required.');
      valid = false;
    } else if (password.value.length < 6) {
      showError(password, 'Password must be at least 6 characters.');
      valid = false;
    }
  }

  return valid;
};

/* ============================================================
   ANIMATED FORM SUBMISSION + REDIRECT SIMULATION
============================================================ */
const MOCK_CREDENTIALS = {
  citizen: { email: 'citizen@nagrik.gov', password: 'demo123', redirect: 'dashboard.html' },
  admin:   { email: 'admin@nagrik.gov',   password: 'admin123', redirect: 'admin.html' },
};

const handleFormSubmit = (form, role) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateLoginForm(form)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const email     = form.querySelector('input[type="email"]')?.value.trim();
    const password  = (form.querySelector('input[type="password"]') || form.querySelector('input[name="password"]'))?.value;

    // Loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="btn-spinner"></span> Authenticating…`;

    await new Promise((r) => setTimeout(r, 1400));

    const creds = MOCK_CREDENTIALS[role];
    if (email === creds.email && password === creds.password) {
      submitBtn.innerHTML = `✔ Success! Redirecting…`;
      submitBtn.classList.add('btn-success');
      if (typeof window.showToast === 'function') {
        window.showToast(`Welcome back! Redirecting to your dashboard.`, 'success');
      }
      // Save session flag
      sessionStorage.setItem('nagrik_logged_in', role);
      sessionStorage.setItem('nagrik_user_email', email);
      setTimeout(() => {
        window.location.href = creds.redirect;
      }, 1200);
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      // Shake animation
      form.classList.add('shake');
      form.addEventListener('animationend', () => form.classList.remove('shake'), { once: true });

      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput) showError(emailInput, 'Invalid email or password. Try demo credentials.');
      if (typeof window.showToast === 'function') {
        window.showToast('Login failed. Check credentials and try again.', 'error');
      }
    }
  });
};

/* ============================================================
   REAL-TIME VALIDATION ON BLUR
============================================================ */
const initRealtimeValidation = () => {
  document.querySelectorAll('.login-form-panel input').forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.type === 'email' && input.value) {
        if (!isValidEmail(input.value)) showError(input, 'Invalid email format.');
        else clearError(input);
      }
      if ((input.type === 'password' || input.name === 'password') && input.value) {
        if (input.value.length < 6) showError(input, 'Minimum 6 characters required.');
        else clearError(input);
      }
    });
    input.addEventListener('input', () => clearError(input));
  });
};

/* ============================================================
   DEMO CREDENTIAL HINTS
============================================================ */
const initDemoHints = () => {
  document.querySelectorAll('[data-fill-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const role  = btn.dataset.fillDemo;
      const panel = document.getElementById(`${role}-form`);
      if (!panel) return;
      const emailInput = panel.querySelector('input[type="email"]');
      const passInput  = panel.querySelector('input[type="password"]') || panel.querySelector('input[name="password"]');
      if (emailInput) emailInput.value = MOCK_CREDENTIALS[role]?.email || '';
      if (passInput)  passInput.value  = MOCK_CREDENTIALS[role]?.password || '';
      if (typeof window.showToast === 'function') {
        window.showToast('Demo credentials filled in!', 'info', 2500);
      }
    });
  });
};

/* ============================================================
   BACKGROUND FLOATING SHAPES
============================================================ */
const initLoginBg = () => {
  const bg = document.querySelector('.login-bg-shapes');
  if (!bg) return;
  const SHAPE_COUNT = 8;
  for (let i = 0; i < SHAPE_COUNT; i++) {
    const shape = document.createElement('div');
    shape.className = 'bg-shape';
    const size = 60 + Math.random() * 120;
    Object.assign(shape.style, {
      width: `${size}px`,
      height: `${size}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${10 + Math.random() * 12}s`,
      opacity: String(0.04 + Math.random() * 0.08),
    });
    bg.appendChild(shape);
  }
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLoginTabs();
  initPasswordStrength();
  initPasswordToggle();
  initRememberMe();
  initRealtimeValidation();
  initDemoHints();
  initLoginBg();

  const citizenForm = document.getElementById('citizen-form');
  const adminForm   = document.getElementById('admin-form');
  if (citizenForm) handleFormSubmit(citizenForm, 'citizen');
  if (adminForm)   handleFormSubmit(adminForm,   'admin');
});
