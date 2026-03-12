/**
 * tracking.js - NagrikConnect Complaint Tracking
 * Search, timeline animation, progress bar, mock data, accordion, auto-refresh, copy ID
 */

'use strict';

/* ============================================================
   MOCK COMPLAINT DATA
============================================================ */
const MOCK_TRACKING_DATA = {
  'NC-2024-10234': {
    id: 'NC-2024-10234',
    title: 'Broken streetlight near Nehru Park',
    category: 'Road',
    priority: 'Medium',
    status: 'In Progress',
    submittedOn: '2024-06-01',
    updatedOn: '2024-06-07',
    department: 'Municipal Roads Dept.',
    assignedOfficer: 'Rajesh Sharma',
    location: 'Nehru Park, Sector 14, Mumbai',
    description: 'The streetlight pole on the east side of Nehru Park has been non-functional for 3 weeks causing safety concerns at night.',
    stages: [
      { label: 'Submitted',    date: '2024-06-01', done: true,  detail: 'Your complaint was successfully registered in the system.' },
      { label: 'Acknowledged', date: '2024-06-02', done: true,  detail: 'Municipal office acknowledged receipt. Assigned to Roads Department.' },
      { label: 'Assigned',     date: '2024-06-03', done: true,  detail: 'Officer Rajesh Sharma assigned to inspect the site.' },
      { label: 'In Progress',  date: '2024-06-07', done: true,  detail: 'Inspection completed. Replacement bulb ordered. ETA: 2 days.' },
      { label: 'Resolved',     date: null,         done: false, detail: 'Awaiting resolution confirmation.' },
    ],
  },
  'NC-2024-20891': {
    id: 'NC-2024-20891',
    title: 'Uncollected garbage on MG Road',
    category: 'Sanitation',
    priority: 'High',
    status: 'Resolved',
    submittedOn: '2024-05-25',
    updatedOn: '2024-06-02',
    department: 'Sanitation Division',
    assignedOfficer: 'Priya Mehta',
    location: 'MG Road, Andheri West, Mumbai',
    description: 'Garbage has not been collected for 5 days. Large pile blocking the footpath.',
    stages: [
      { label: 'Submitted',    date: '2024-05-25', done: true, detail: 'Complaint registered successfully.' },
      { label: 'Acknowledged', date: '2024-05-26', done: true, detail: 'Acknowledged by Sanitation Division.' },
      { label: 'Assigned',     date: '2024-05-27', done: true, detail: 'Officer Priya Mehta assigned for immediate action.' },
      { label: 'In Progress',  date: '2024-05-29', done: true, detail: 'Cleanup crew dispatched to the location.' },
      { label: 'Resolved',     date: '2024-06-02', done: true, detail: 'Garbage cleared. Regular collection schedule restored.' },
    ],
  },
  'NC-2024-33012': {
    id: 'NC-2024-33012',
    title: 'Stray dogs near primary school',
    category: 'Animals',
    priority: 'High',
    status: 'Pending',
    submittedOn: '2024-06-05',
    updatedOn: '2024-06-05',
    department: 'Animal Control Unit',
    assignedOfficer: 'Unassigned',
    location: 'Vidya Nagar Primary School, Pune',
    description: 'Pack of 6 stray dogs creating fear among students. Incident of dog bite reported yesterday.',
    stages: [
      { label: 'Submitted',    date: '2024-06-05', done: true,  detail: 'Complaint registered. Marked as high priority.' },
      { label: 'Acknowledged', date: null,         done: false, detail: 'Pending acknowledgement from Animal Control Unit.' },
      { label: 'Assigned',     date: null,         done: false, detail: 'Not yet assigned.' },
      { label: 'In Progress',  date: null,         done: false, detail: 'Awaiting action.' },
      { label: 'Resolved',     date: null,         done: false, detail: 'Awaiting resolution.' },
    ],
  },
};

/* ============================================================
   SEARCH FUNCTIONALITY
============================================================ */
let activeComplaint = null;

const initSearch = () => {
  const searchInput = document.getElementById('track-search-input');
  const searchBtn   = document.getElementById('track-search-btn');
  const resultArea  = document.getElementById('track-result');
  const errorArea   = document.getElementById('track-error');
  if (!searchInput || !searchBtn) return;

  // Pre-fill from session if user just submitted
  const lastId = sessionStorage.getItem('last_track_id');
  if (lastId && searchInput) searchInput.value = lastId;

  const performSearch = () => {
    const query = searchInput.value.trim().toUpperCase();
    if (!query) {
      if (typeof window.showToast === 'function') window.showToast('Please enter a tracking ID.', 'warning');
      return;
    }

    if (errorArea) errorArea.hidden = true;
    if (resultArea) resultArea.hidden = true;

    searchBtn.disabled = true;
    searchBtn.innerHTML = `<span class="btn-spinner"></span> Searching…`;

    setTimeout(() => {
      searchBtn.disabled = false;
      searchBtn.innerHTML = 'Track';

      const complaint = MOCK_TRACKING_DATA[query];
      if (complaint) {
        activeComplaint = complaint;
        renderComplaintResult(complaint);
        if (resultArea) { resultArea.hidden = false; resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      } else {
        if (errorArea) {
          errorArea.hidden = false;
          errorArea.textContent = `No complaint found for ID "${query}". Try NC-2024-10234, NC-2024-20891, or NC-2024-33012.`;
        }
        if (typeof window.showToast === 'function') window.showToast('Complaint ID not found.', 'error');
      }
    }, 900);
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(); });
};

/* ============================================================
   RENDER COMPLAINT RESULT
============================================================ */
const renderComplaintResult = (complaint) => {
  const titleEl    = document.getElementById('result-title');
  const idEl       = document.getElementById('result-id');
  const statusEl   = document.getElementById('result-status');
  const deptEl     = document.getElementById('result-dept');
  const officerEl  = document.getElementById('result-officer');
  const updatedEl  = document.getElementById('result-updated');

  if (titleEl)   titleEl.textContent   = complaint.title;
  if (idEl)      idEl.textContent      = complaint.id;
  if (statusEl)  statusEl.textContent  = complaint.status;
  if (deptEl)    deptEl.textContent    = complaint.department;
  if (officerEl) officerEl.textContent = complaint.assignedOfficer;
  if (updatedEl) updatedEl.textContent = complaint.updatedOn;

  renderTimeline(complaint.stages);
  renderProgressBar(complaint.stages);
};

/* ============================================================
   TIMELINE STAGE ANIMATION
============================================================ */
const renderTimeline = (stages) => {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = stages.map((stage, i) => `
    <div class="timeline-stage ${stage.done ? 'stage-done' : 'stage-pending'}" data-stage="${i}">
      <div class="stage-icon">
        ${stage.done ? '✔' : `<span>${i + 1}</span>`}
      </div>
      <div class="stage-body">
        <div class="stage-header" role="button" tabindex="0" aria-expanded="false" data-accordion="${i}">
          <span class="stage-label">${stage.label}</span>
          <span class="stage-date">${stage.date || '—'}</span>
          <span class="accordion-arrow">▾</span>
        </div>
        <div class="stage-detail" id="stage-detail-${i}" hidden>${stage.detail}</div>
      </div>
    </div>`).join('');

  // Stagger animation for done stages
  const doneStages = container.querySelectorAll('.stage-done');
  doneStages.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    }, i * 200 + 100);
  });

  // Accordion
  container.querySelectorAll('[data-accordion]').forEach((header) => {
    header.addEventListener('click', () => toggleAccordion(header));
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion(header); }
    });
  });
};

const toggleAccordion = (header) => {
  const idx    = header.dataset.accordion;
  const detail = document.getElementById(`stage-detail-${idx}`);
  const arrow  = header.querySelector('.accordion-arrow');
  if (!detail) return;
  const isOpen = !detail.hidden;
  detail.hidden = isOpen;
  header.setAttribute('aria-expanded', String(!isOpen));
  if (arrow) arrow.textContent = isOpen ? '▾' : '▴';
};

/* ============================================================
   PROGRESS BAR ANIMATION
============================================================ */
const renderProgressBar = (stages) => {
  const bar   = document.getElementById('track-progress-bar');
  const label = document.getElementById('track-progress-label');
  if (!bar) return;

  const doneCount = stages.filter((s) => s.done).length;
  const pct       = Math.round((doneCount / stages.length) * 100);

  bar.style.width = '0%';
  setTimeout(() => {
    bar.style.transition = 'width 0.8s ease';
    bar.style.width = `${pct}%`;
  }, 50);

  if (label) label.textContent = `${pct}% Complete (${doneCount}/${stages.length} stages)`;
};

/* ============================================================
   COPY TRACKING ID TO CLIPBOARD
============================================================ */
const initCopyId = () => {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy-id]');
    if (!btn) return;
    const id = btn.dataset.copyId || document.getElementById('result-id')?.textContent;
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✔ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
      if (typeof window.showToast === 'function') window.showToast('Tracking ID copied!', 'info', 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = id; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    });
  });
};

/* ============================================================
   AUTO-REFRESH SIMULATION (EVERY 30 SECONDS)
============================================================ */
const initAutoRefresh = () => {
  const indicator = document.getElementById('auto-refresh-indicator');
  let countdown   = 30;

  const tick = () => {
    countdown--;
    if (indicator) indicator.textContent = `Auto-refresh in ${countdown}s`;
    if (countdown <= 0) {
      countdown = 30;
      if (activeComplaint) {
        simulateStatusUpdate(activeComplaint);
      }
    }
  };

  setInterval(tick, 1000);
};

const simulateStatusUpdate = (complaint) => {
  // Simulate a minor update — e.g. updated timestamp
  complaint.updatedOn = new Date().toISOString().split('T')[0];
  const updatedEl = document.getElementById('result-updated');
  if (updatedEl) {
    updatedEl.textContent = complaint.updatedOn;
    updatedEl.classList.add('flash-update');
    setTimeout(() => updatedEl.classList.remove('flash-update'), 1000);
  }
  if (typeof window.showToast === 'function') {
    window.showToast('Status refreshed — no new updates.', 'info', 2500);
  }
};

/* ============================================================
   QUICK-LINKS FOR SAMPLE IDs
============================================================ */
const initSampleLinks = () => {
  document.querySelectorAll('[data-sample-id]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const input = document.getElementById('track-search-input');
      if (input) {
        input.value = link.dataset.sampleId;
        document.getElementById('track-search-btn')?.click();
      }
    });
  });
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initCopyId();
  initAutoRefresh();
  initSampleLinks();

  // Auto-search if tracking ID in URL params
  const params = new URLSearchParams(window.location.search);
  const paramId = params.get('id');
  if (paramId) {
    const input = document.getElementById('track-search-input');
    if (input) {
      input.value = paramId;
      setTimeout(() => document.getElementById('track-search-btn')?.click(), 400);
    }
  }
});
