/**
 * admin.js - NagrikConnect Admin Dashboard
 * Canvas charts (bar, line, pie, performance), heatmap, KPI counters, table, refresh
 */

'use strict';

/* ============================================================
   UTILITY — DRAW ROUNDED RECT POLYFILL
============================================================ */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

/* ============================================================
   CHART HELPER — AXES
============================================================ */
const drawAxes = (ctx, W, H, padLeft, padBottom, padTop, maxVal, xLabels) => {
  const chartH = H - padBottom - padTop;
  const chartW = W - padLeft - 20;

  // Y grid + labels
  ctx.strokeStyle = '#1e293b';
  ctx.fillStyle   = '#64748b';
  ctx.font        = '11px Inter, sans-serif';
  ctx.textAlign   = 'right';
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = padTop + chartH - (i / steps) * chartH;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(W - 20, y); ctx.stroke();
    ctx.fillText(Math.round((i / steps) * maxVal), padLeft - 6, y + 4);
  }

  // X labels
  if (xLabels) {
    const gap = chartW / xLabels.length;
    ctx.textAlign = 'center';
    xLabels.forEach((label, i) => {
      ctx.fillText(label, padLeft + i * gap + gap / 2, H - 8);
    });
  }
};

/* ============================================================
   CHART A — BAR CHART: COMPLAINTS BY CATEGORY (LAST 7 DAYS)
============================================================ */
const drawCategoryBar = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const labels = ['Noise', 'Parking', 'Sanitation', 'Animals', 'Road', 'Other'];
  const values = [18, 12, 24, 9, 21, 6];
  const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fb923c', '#f472b6', '#a78bfa'];
  const W = canvas.width, H = canvas.height;
  const padLeft = 44, padBottom = 36, padTop = 20;
  const chartW = W - padLeft - 20, chartH = H - padBottom - padTop;
  const maxVal = Math.max(...values) * 1.25;
  const barW = chartW / labels.length * 0.55;
  const gap  = chartW / labels.length;
  let progress = 0, startTime = performance.now();

  const draw = (now) => {
    progress = Math.min((now - startTime) / 800, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, W, H);
    drawAxes(ctx, W, H, padLeft, padBottom, padTop, maxVal, labels);

    values.forEach((val, i) => {
      const x  = padLeft + i * gap + gap * 0.225;
      const bH = (val / maxVal) * chartH * ease;
      const y  = padTop + chartH - bH;
      const grad = ctx.createLinearGradient(0, y, 0, padTop + chartH);
      grad.addColorStop(0, COLORS[i]);
      grad.addColorStop(1, COLORS[i] + '30');
      ctx.fillStyle = grad;
      ctx.roundRect(x, y, barW, bH, [4, 4, 0, 0]);
      ctx.fill();
      if (ease > 0.9) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barW / 2, y - 5);
      }
    });
    if (progress < 1) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
};

/* ============================================================
   CHART B — LINE CHART: RESOLUTION TREND (LAST 30 DAYS)
============================================================ */
const drawResolutionLine = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const values = [5,8,6,11,9,14,12,18,15,20,17,22,19,25,23,28,24,30,27,32,29,35,31,38,34,40,36,42,38,45];
  const W = canvas.width, H = canvas.height;
  const padLeft = 44, padBottom = 36, padTop = 20;
  const chartW = W - padLeft - 20, chartH = H - padBottom - padTop;
  const maxVal = Math.max(...values) * 1.15;
  let progress = 0, startTime = performance.now();

  const xOf = (i) => padLeft + (i / (values.length - 1)) * chartW;
  const yOf = (v) => padTop + chartH - (v / maxVal) * chartH;

  const draw = (now) => {
    progress = Math.min((now - startTime) / 1200, 1);
    ctx.clearRect(0, 0, W, H);

    const xLabels = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 30 + i * 6);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    drawAxes(ctx, W, H, padLeft, padBottom, padTop, maxVal, xLabels);

    const visible = Math.floor(values.length * progress);

    // Fill under line
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, '#38bdf840');
    grad.addColorStop(1, '#38bdf800');
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(0));
    for (let i = 1; i <= visible; i++) ctx.lineTo(xOf(i), yOf(values[i]));
    ctx.lineTo(xOf(visible), padTop + chartH);
    ctx.lineTo(xOf(0), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(values[0]));
    for (let i = 1; i <= visible; i++) ctx.lineTo(xOf(i), yOf(values[i]));
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    for (let i = 0; i <= visible; i++) {
      ctx.beginPath();
      ctx.arc(xOf(i), yOf(values[i]), 3, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }

    if (progress < 1) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
};

/* ============================================================
   CHART C — PIE/DOUGHNUT: COMPLAINTS BY STATUS
============================================================ */
const drawStatusDoughnut = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const data = { labels: ['Resolved', 'Active', 'Pending', 'Escalated'],
                 values: [42, 28, 18, 12],
                 colors: ['#34d399', '#38bdf8', '#f59e0b', '#ef4444'] };
  const total = data.values.reduce((a, b) => a + b, 0);
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 20;
  let progress = 0, startTime = performance.now();

  const draw = (now) => {
    progress = Math.min((now - startTime) / 900, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let angle = -Math.PI / 2;
    data.values.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2 * ease;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = data.colors[i]; ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.stroke();
      angle += slice;
    });

    ctx.beginPath(); ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a'; ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `bold ${radius * 0.2}px Inter, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Status', cx, cy - 8);
    ctx.font = `${radius * 0.14}px Inter, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Distribution', cx, cy + 12);

    if (progress < 1) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  // Legend
  const legend = document.getElementById(`${canvasId}-legend`);
  if (legend) {
    legend.innerHTML = data.labels.map((l, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${data.colors[i]}"></span>
        <span>${l}</span><span>${data.values[i]}%</span>
      </div>`).join('');
  }
};

/* ============================================================
   CHART D — BAR CHART: DEPARTMENT PERFORMANCE
============================================================ */
const drawDeptPerformance = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const depts  = ['Roads', 'Sanit.', 'Animals', 'Parking', 'Other'];
  const rates  = [78, 65, 82, 55, 70]; // resolution rate %
  const COLORS = ['#38bdf8', '#34d399', '#f472b6', '#fb923c', '#a78bfa'];
  const W = canvas.width, H = canvas.height;
  const padLeft = 44, padBottom = 36, padTop = 20;
  const chartW = W - padLeft - 20, chartH = H - padBottom - padTop;
  const maxVal = 100;
  const barW = chartW / depts.length * 0.55;
  const gap  = chartW / depts.length;
  let progress = 0, startTime = performance.now();

  const draw = (now) => {
    progress = Math.min((now - startTime) / 800, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, W, H);
    drawAxes(ctx, W, H, padLeft, padBottom, padTop, maxVal, depts);

    rates.forEach((val, i) => {
      const x  = padLeft + i * gap + gap * 0.225;
      const bH = (val / maxVal) * chartH * ease;
      const y  = padTop + chartH - bH;
      const grad = ctx.createLinearGradient(0, y, 0, padTop + chartH);
      grad.addColorStop(0, COLORS[i]);
      grad.addColorStop(1, COLORS[i] + '30');
      ctx.fillStyle = grad;
      ctx.roundRect(x, y, barW, bH, [4, 4, 0, 0]);
      ctx.fill();
      if (ease > 0.9) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${val}%`, x + barW / 2, y - 5);
      }
    });
    if (progress < 1) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
};

/* ============================================================
   CSS GRID HEATMAP (COMPLAINTS BY HOUR × DAY)
============================================================ */
const initHeatmap = () => {
  const container = document.getElementById('heatmap-container');
  if (!container) return;

  const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Generate mock data
  const data = {};
  DAYS.forEach((day) => {
    HOURS.forEach((h) => {
      const hour = parseInt(h, 10);
      let base = 2;
      if (hour >= 9 && hour <= 18) base = 8;
      if (hour >= 18 && hour <= 22) base = 12;
      data[`${day}-${h}`] = Math.floor(base + Math.random() * 6);
    });
  });

  const maxVal = Math.max(...Object.values(data));

  // Build grid
  let html = `<div class="heatmap-grid">`;
  // Corner cell
  html += `<div class="hm-corner"></div>`;
  // Hour headers
  HOURS.forEach((h, i) => {
    if (i % 3 === 0) html += `<div class="hm-hour-label">${h}</div>`;
    else html += `<div class="hm-hour-label"></div>`;
  });
  // Rows
  DAYS.forEach((day) => {
    html += `<div class="hm-day-label">${day}</div>`;
    HOURS.forEach((h) => {
      const val = data[`${day}-${h}`];
      const intensity = val / maxVal;
      const opacity   = 0.1 + intensity * 0.9;
      const color     = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : '#38bdf8';
      html += `<div class="hm-cell" title="${day} ${h}: ${val} complaints"
                    style="background:${color};opacity:${opacity.toFixed(2)}" data-val="${val}"></div>`;
    });
  });
  html += `</div>`;
  container.innerHTML = html;

  // Tooltips
  container.querySelectorAll('.hm-cell').forEach((cell) => {
    cell.addEventListener('mouseenter', (e) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'hm-tooltip';
      tooltip.textContent = `${cell.getAttribute('title')}`;
      document.body.appendChild(tooltip);
      const rect = cell.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top  = `${rect.top - 34}px`;
      cell._tooltip = tooltip;
    });
    cell.addEventListener('mouseleave', () => {
      cell._tooltip?.remove();
      cell._tooltip = null;
    });
  });
};

/* ============================================================
   KPI COUNTER ANIMATIONS
============================================================ */
const initKPICounters = () => {
  document.querySelectorAll('.kpi-number[data-target]').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const dur    = 1400;
        const start  = performance.now();
        const step   = (now) => {
          const t   = Math.min((now - start) / dur, 1);
          const val = Math.floor((1 - Math.pow(1 - t, 4)) * target);
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
   RECENT COMPLAINTS TABLE (MOCK)
============================================================ */
const RECENT_COMPLAINTS = [
  { id: 'NC-2024-0891', title: 'Manhole open on bridge',        category: 'Road',       dept: 'Roads',    priority: 'High',   status: 'active'   },
  { id: 'NC-2024-0890', title: 'Garbage dump near school',      category: 'Sanitation', dept: 'Sanit.',   priority: 'High',   status: 'pending'  },
  { id: 'NC-2024-0889', title: 'Stray cattle near highway',     category: 'Animals',    dept: 'Animals',  priority: 'Medium', status: 'active'   },
  { id: 'NC-2024-0888', title: 'Loud party at 3 AM',            category: 'Noise',      dept: 'Police',   priority: 'Medium', status: 'resolved' },
  { id: 'NC-2024-0887', title: 'Vehicle blocking fire exit',    category: 'Parking',    dept: 'Parking',  priority: 'High',   status: 'active'   },
  { id: 'NC-2024-0886', title: 'Footpath encroachment',         category: 'Road',       dept: 'Roads',    priority: 'Low',    status: 'pending'  },
  { id: 'NC-2024-0885', title: 'Water leakage on main road',    category: 'Other',      dept: 'Water',    priority: 'High',   status: 'active'   },
  { id: 'NC-2024-0884', title: 'Fly-tipping in residential area',category:'Sanitation', dept: 'Sanit.',   priority: 'Medium', status: 'pending'  },
];

const initRecentTable = () => {
  const tbody = document.getElementById('admin-recent-tbody');
  if (!tbody) return;

  const STATUS_CLASS = { active: 'badge-active', resolved: 'badge-resolved', pending: 'badge-pending' };
  const PRIO_CLASS   = { High: 'prio-high', Medium: 'prio-medium', Low: 'prio-low' };

  tbody.innerHTML = RECENT_COMPLAINTS.map((c) => `
    <tr>
      <td><code>${c.id}</code></td>
      <td>${c.title}</td>
      <td>${c.category}</td>
      <td>${c.dept}</td>
      <td><span class="priority-chip ${PRIO_CLASS[c.priority]}">${c.priority}</span></td>
      <td><span class="badge ${STATUS_CLASS[c.status]}">${c.status}</span></td>
      <td>
        <button class="btn-sm btn-assign" data-id="${c.id}">Assign</button>
        <button class="btn-sm btn-view"   data-id="${c.id}">View</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('.btn-assign').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof window.showToast === 'function') window.showToast(`Redirecting to assignment for ${btn.dataset.id}…`, 'info');
      setTimeout(() => { window.location.href = `assignment.html?id=${btn.dataset.id}`; }, 1200);
    });
  });
};

/* ============================================================
   CHART REFRESH
============================================================ */
const initChartRefresh = () => {
  document.getElementById('refresh-charts')?.addEventListener('click', () => {
    ['admin-category-bar', 'admin-resolution-line', 'admin-status-pie', 'admin-dept-bar'].forEach((id) => {
      const canvas = document.getElementById(id);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    setTimeout(() => {
      drawCategoryBar('admin-category-bar');
      drawResolutionLine('admin-resolution-line');
      drawStatusDoughnut('admin-status-pie');
      drawDeptPerformance('admin-dept-bar');
    }, 100);
    if (typeof window.showToast === 'function') window.showToast('Charts refreshed!', 'success', 2000);
  });
};

/* ============================================================
   INTERSECTION-TRIGGERED CHART DRAW
============================================================ */
const initAdminCharts = () => {
  const chartMap = {
    'admin-category-bar':   drawCategoryBar,
    'admin-resolution-line': drawResolutionLine,
    'admin-status-pie':     drawStatusDoughnut,
    'admin-dept-bar':       drawDeptPerformance,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const fn = chartMap[entry.target.id];
      if (fn) fn(entry.target.id);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  Object.keys(chartMap).forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAdminCharts();
  initHeatmap();
  initKPICounters();
  initRecentTable();
  initChartRefresh();
});
