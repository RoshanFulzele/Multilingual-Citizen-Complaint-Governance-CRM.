/**
 * dashboard.js - NagrikConnect Citizen Dashboard
 * Sidebar, Canvas charts, counters, filters, notifications, status animations
 */

'use strict';

/* ============================================================
   SIDEBAR TOGGLE (MOBILE)
============================================================ */
const initSidebar = () => {
  const toggleBtn  = document.getElementById('sidebar-toggle');
  const sidebar    = document.getElementById('dashboard-sidebar');
  const overlay    = document.getElementById('sidebar-overlay') || createSidebarOverlay();
  if (!toggleBtn || !sidebar) return;

  const open  = () => { sidebar.classList.add('open'); overlay.classList.add('visible'); document.body.style.overflow = 'hidden'; };
  const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); document.body.style.overflow = ''; };

  toggleBtn.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  function createSidebarOverlay() {
    const el = document.createElement('div');
    el.id = 'sidebar-overlay';
    Object.assign(el.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.5)',
      zIndex: '199', opacity: '0', transition: 'opacity 0.3s',
    });
    el.addEventListener('transitionend', () => {
      if (!el.classList.contains('visible')) el.style.pointerEvents = 'none';
    });
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    return el;
  }
};

// Override classList.add/remove to toggle opacity on overlay
(function patchOverlay() {
  const orig = document.addEventListener;
})();

/* ============================================================
   PIE CHART — COMPLAINT CATEGORIES
============================================================ */
const drawPieChart = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const data = {
    labels: ['Noise', 'Parking', 'Sanitation', 'Animals', 'Road', 'Other'],
    values: [28, 19, 22, 11, 14, 6],
    colors: ['#38bdf8', '#818cf8', '#34d399', '#fb923c', '#f472b6', '#a78bfa'],
  };

  const total = data.values.reduce((a, b) => a + b, 0);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 20;
  let currentAngle = -Math.PI / 2;
  let progress = 0;  // 0 → 1 for animation
  const duration = 900;
  const startTime = performance.now();

  // Legend
  const legendContainer = document.getElementById(`${canvasId}-legend`);
  if (legendContainer) {
    legendContainer.innerHTML = data.labels.map((label, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${data.colors[i]}"></span>
        <span class="legend-label">${label}</span>
        <span class="legend-value">${data.values[i]}%</span>
      </div>`).join('');
  }

  const animate = (now) => {
    progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let angle = -Math.PI / 2;
    data.values.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2 * ease;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = data.colors[i];
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();
      angle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = `bold ${radius * 0.22}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Complaints', cx, cy - 10);
    ctx.font = `${radius * 0.16}px Inter, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('by category', cx, cy + 14);

    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

/* ============================================================
   BAR CHART — MONTHLY COMPLAINTS
============================================================ */
const drawBarChart = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const values = [42, 58, 35, 71, 63, 89, 54];
  const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fb923c', '#f472b6', '#a78bfa', '#38bdf8'];

  const W = canvas.width;
  const H = canvas.height;
  const padLeft = 44;
  const padBottom = 36;
  const padTop = 20;
  const chartW = W - padLeft - 20;
  const chartH = H - padBottom - padTop;
  const maxVal = Math.max(...values) * 1.2;
  const barW = chartW / values.length * 0.55;
  const gap  = chartW / values.length;

  let progress = 0;
  const startTime = performance.now();

  const draw = (now) => {
    progress = Math.min((now - startTime) / 800, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    const steps = 5;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= steps; i++) {
      const y = padTop + chartH - (i / steps) * chartH;
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(W - 20, y); ctx.stroke();
      ctx.fillText(Math.round((i / steps) * maxVal), padLeft - 6, y + 4);
    }

    // Bars
    values.forEach((val, i) => {
      const x   = padLeft + i * gap + gap * 0.225;
      const bH  = (val / maxVal) * chartH * ease;
      const y   = padTop + chartH - bH;

      // Gradient bar
      const grad = ctx.createLinearGradient(0, y, 0, padTop + chartH);
      grad.addColorStop(0, COLORS[i]);
      grad.addColorStop(1, COLORS[i] + '40');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, bH, [4, 4, 0, 0]);
      ctx.fill();

      // Month label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(months[i], x + barW / 2, H - 8);

      // Value label on top of bar
      if (ease > 0.9) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(val, x + barW / 2, y - 5);
      }
    });

    if (progress < 1) requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};

/* ============================================================
   ANIMATED STAT COUNTERS
============================================================ */
const initDashboardCounters = () => {
  document.querySelectorAll('.dash-stat-number[data-target]').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const val = Math.floor((1 - Math.pow(1 - t, 3)) * target);
          el.textContent = val.toLocaleString() + suffix;
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString() + suffix;
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
};

/* ============================================================
   COMPLAINT STATUS FILTER TABS
============================================================ */
const MOCK_COMPLAINTS = [
  { id: 'NC-2024-001', title: 'Broken streetlight on MG Road', category: 'Road',       status: 'active',   date: '2024-06-01' },
  { id: 'NC-2024-002', title: 'Garbage not collected',         category: 'Sanitation', status: 'resolved', date: '2024-05-28' },
  { id: 'NC-2024-003', title: 'Stray dogs near school',        category: 'Animals',    status: 'pending',  date: '2024-06-03' },
  { id: 'NC-2024-004', title: 'Loud music past midnight',      category: 'Noise',      status: 'active',   date: '2024-06-04' },
  { id: 'NC-2024-005', title: 'Pothole on Linking Road',       category: 'Road',       status: 'resolved', date: '2024-05-20' },
  { id: 'NC-2024-006', title: 'Illegal parking blocking gate', category: 'Parking',    status: 'pending',  date: '2024-06-05' },
  { id: 'NC-2024-007', title: 'Sewage overflow near park',     category: 'Sanitation', status: 'active',   date: '2024-06-06' },
];

const renderComplaintRows = (filter = 'all') => {
  const tbody = document.getElementById('complaints-tbody');
  if (!tbody) return;

  const filtered = filter === 'all'
    ? MOCK_COMPLAINTS
    : MOCK_COMPLAINTS.filter((c) => c.status === filter);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No complaints found.</td></tr>`;
    return;
  }

  const STATUS_BADGE = {
    active:   '<span class="badge badge-active"><span class="pulse-dot"></span>Active</span>',
    resolved: '<span class="badge badge-resolved">✔ Resolved</span>',
    pending:  '<span class="badge badge-pending">⏳ Pending</span>',
  };

  tbody.innerHTML = filtered.map((c) => `
    <tr class="complaint-row" data-id="${c.id}">
      <td><code>${c.id}</code></td>
      <td>${c.title}</td>
      <td><span class="category-chip">${c.category}</span></td>
      <td>${STATUS_BADGE[c.status] || c.status}</td>
      <td>${c.date}</td>
    </tr>`).join('');
};

const initComplaintFilter = () => {
  const tabs = document.querySelectorAll('[data-filter-tab]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderComplaintRows(tab.dataset.filterTab);
    });
  });
  renderComplaintRows('all');
};

/* ============================================================
   NOTIFICATION BADGE
============================================================ */
const initNotificationBadge = () => {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  let count = parseInt(badge.textContent, 10) || 3;

  const notifBtn = document.getElementById('notif-btn');
  const dropdown = document.getElementById('notif-dropdown');
  if (!notifBtn || !dropdown) return;

  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    if (isOpen) {
      count = 0;
      badge.textContent = '0';
      badge.style.display = 'none';
    }
  });

  document.addEventListener('click', () => dropdown.classList.remove('open'));
};

/* ============================================================
   QUICK COMPLAINT MINI-FORM VALIDATION
============================================================ */
const initQuickForm = () => {
  const form = document.getElementById('quick-complaint-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title    = form.querySelector('[name="quick-title"]');
    const category = form.querySelector('[name="quick-category"]');
    let valid = true;

    [title, category].forEach((el) => {
      if (!el) return;
      if (!el.value.trim()) {
        el.classList.add('input-error');
        valid = false;
      } else {
        el.classList.remove('input-error');
      }
    });

    if (!valid) {
      if (typeof window.showToast === 'function') window.showToast('Please fill all required fields.', 'warning');
      return;
    }

    if (typeof window.showToast === 'function') window.showToast('Complaint submitted! Redirecting…', 'success');
    setTimeout(() => { window.location.href = 'submission.html'; }, 1500);
  });
};

/* ============================================================
   STATUS PULSING DOTS
============================================================ */
const initPulsingDots = () => {
  document.querySelectorAll('.pulse-dot').forEach((dot, i) => {
    dot.style.animationDelay = `${i * 0.3}s`;
  });
};

/* ============================================================
   CHARTS INTERSECTION TRIGGER
============================================================ */
const initCharts = () => {
  const pieCanvas = document.getElementById('pie-chart');
  const barCanvas = document.getElementById('bar-chart');

  const launchCharts = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (entry.target.id === 'pie-chart') drawPieChart('pie-chart');
      if (entry.target.id === 'bar-chart') drawBarChart('bar-chart');
      observer.unobserve(entry.target);
    });
  };

  const obs = new IntersectionObserver(launchCharts, { threshold: 0.3 });
  if (pieCanvas) obs.observe(pieCanvas);
  if (barCanvas) obs.observe(barCanvas);
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initCharts();
  initDashboardCounters();
  initComplaintFilter();
  initNotificationBadge();
  initQuickForm();
  initPulsingDots();
});
