/**
 * history.js - NagrikConnect Complaint History
 * Filter, search, sort, pagination, modal, export CSV, date range
 */

'use strict';

/* ============================================================
   MOCK COMPLAINT HISTORY (22 entries)
============================================================ */
const ALL_COMPLAINTS = [
  { id: 'NC-2024-001', title: 'Broken streetlight on MG Road',          category: 'Road',       status: 'resolved', date: '2024-01-15', priority: 'Medium', description: 'Streetlight non-functional for 2 weeks.' },
  { id: 'NC-2024-002', title: 'Garbage not collected for 5 days',        category: 'Sanitation', status: 'resolved', date: '2024-01-22', priority: 'High',   description: 'Garbage pile blocking footpath.' },
  { id: 'NC-2024-003', title: 'Stray dogs near school',                  category: 'Animals',    status: 'pending',  date: '2024-02-03', priority: 'High',   description: 'Pack of stray dogs threatening children.' },
  { id: 'NC-2024-004', title: 'Loud music past midnight',                category: 'Noise',      status: 'active',   date: '2024-02-14', priority: 'Low',    description: 'Repeated noise complaints at night.' },
  { id: 'NC-2024-005', title: 'Pothole on Linking Road',                 category: 'Road',       status: 'resolved', date: '2024-02-20', priority: 'High',   description: 'Large pothole causing accidents.' },
  { id: 'NC-2024-006', title: 'Illegal parking blocking entrance',       category: 'Parking',    status: 'pending',  date: '2024-03-01', priority: 'Medium', description: 'Vehicle blocking society gate daily.' },
  { id: 'NC-2024-007', title: 'Sewage overflow near park',               category: 'Sanitation', status: 'active',   date: '2024-03-10', priority: 'High',   description: 'Open sewage drain overflowing onto road.' },
  { id: 'NC-2024-008', title: 'Dead tree posing danger on footpath',     category: 'Other',      status: 'resolved', date: '2024-03-18', priority: 'Medium', description: 'Dead tree could fall on pedestrians.' },
  { id: 'NC-2024-009', title: 'Water supply disruption for 3 days',      category: 'Other',      status: 'resolved', date: '2024-04-05', priority: 'High',   description: 'No water supply for entire wing B.' },
  { id: 'NC-2024-010', title: 'Noise from construction at 5 AM',         category: 'Noise',      status: 'pending',  date: '2024-04-12', priority: 'Medium', description: 'Construction work begins before permitted hours.' },
  { id: 'NC-2024-011', title: 'Abandoned vehicle on roadside',           category: 'Parking',    status: 'resolved', date: '2024-04-20', priority: 'Low',    description: 'Rusty vehicle abandoned for over a month.' },
  { id: 'NC-2024-012', title: 'Public toilet not cleaned',               category: 'Sanitation', status: 'active',   date: '2024-04-28', priority: 'Medium', description: 'Municipal toilet in deplorable condition.' },
  { id: 'NC-2024-013', title: 'Loose electric wire dangling',            category: 'Road',       status: 'resolved', date: '2024-05-03', priority: 'High',   description: 'Electric wire hanging near bus stop.' },
  { id: 'NC-2024-014', title: 'Dog bite incident reported',              category: 'Animals',    status: 'active',   date: '2024-05-10', priority: 'High',   description: 'Resident bitten by stray dog near market.' },
  { id: 'NC-2024-015', title: 'Broken footpath tiles',                   category: 'Road',       status: 'pending',  date: '2024-05-17', priority: 'Low',    description: 'Cracked tiles on footpath causing injuries.' },
  { id: 'NC-2024-016', title: 'Street food vendor blocking exit',        category: 'Parking',    status: 'resolved', date: '2024-05-22', priority: 'Low',    description: 'Unlicensed vendor blocking fire exit.' },
  { id: 'NC-2024-017', title: 'Flooding after rain on main road',        category: 'Road',       status: 'active',   date: '2024-05-28', priority: 'High',   description: 'Road waterlogged after every rain.' },
  { id: 'NC-2024-018', title: 'Garbage dumping in open ground',          category: 'Sanitation', status: 'pending',  date: '2024-06-01', priority: 'Medium', description: 'Illegal dumping of construction waste.' },
  { id: 'NC-2024-019', title: 'Playground equipment broken',             category: 'Other',      status: 'pending',  date: '2024-06-03', priority: 'Low',    description: 'Swing and slide in public park damaged.' },
  { id: 'NC-2024-020', title: 'Night market noise disturbing residents', category: 'Noise',      status: 'active',   date: '2024-06-05', priority: 'Medium', description: 'Weekly market runs till 2 AM with loud music.' },
  { id: 'NC-2024-021', title: 'Manhole cover missing on bridge',         category: 'Road',       status: 'active',   date: '2024-06-06', priority: 'High',   description: 'Open manhole is dangerous at night.' },
  { id: 'NC-2024-022', title: 'Dead animals near water body',            category: 'Animals',    status: 'pending',  date: '2024-06-07', priority: 'High',   description: 'Dead cattle near the lake causing hygiene issues.' },
];

/* ============================================================
   STATE
============================================================ */
let state = {
  filtered:    [...ALL_COMPLAINTS],
  page:        1,
  perPage:     10,
  sortField:   'date',
  sortDir:     'desc',
  statusFilter: 'all',
  searchQuery:  '',
  dateFrom:     '',
  dateTo:       '',
};

/* ============================================================
   FILTER + SORT + SEARCH PIPELINE
============================================================ */
const applyFilters = () => {
  let data = [...ALL_COMPLAINTS];

  // Status filter
  if (state.statusFilter !== 'all') data = data.filter((c) => c.status === state.statusFilter);

  // Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    data = data.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }

  // Date range
  if (state.dateFrom) data = data.filter((c) => c.date >= state.dateFrom);
  if (state.dateTo)   data = data.filter((c) => c.date <= state.dateTo);

  // Sort
  data.sort((a, b) => {
    let va = a[state.sortField] || '';
    let vb = b[state.sortField] || '';
    if (state.sortField === 'date') { va = new Date(va); vb = new Date(vb); }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return state.sortDir === 'asc' ? cmp : -cmp;
  });

  state.filtered = data;
  state.page     = 1;
  renderTable();
  renderPagination();
};

/* ============================================================
   RENDER TABLE
============================================================ */
const STATUS_BADGE = {
  active:   `<span class="badge badge-active"><span class="pulse-dot"></span>Active</span>`,
  resolved: `<span class="badge badge-resolved">✔ Resolved</span>`,
  pending:  `<span class="badge badge-pending">⏳ Pending</span>`,
};

const PRIORITY_BADGE = {
  High:   `<span class="priority-chip prio-high">High</span>`,
  Medium: `<span class="priority-chip prio-medium">Medium</span>`,
  Low:    `<span class="priority-chip prio-low">Low</span>`,
};

const renderTable = () => {
  const tbody       = document.getElementById('history-tbody');
  const countLabel  = document.getElementById('result-count');
  if (!tbody) return;

  const start = (state.page - 1) * state.perPage;
  const slice = state.filtered.slice(start, start + state.perPage);

  if (countLabel) countLabel.textContent = `${state.filtered.length} complaints found`;

  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No complaints match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = slice.map((c) => `
    <tr class="history-row" data-id="${c.id}" tabindex="0" role="button" aria-label="View ${c.title}">
      <td><code>${c.id}</code></td>
      <td class="title-cell">${c.title}</td>
      <td><span class="category-chip">${c.category}</span></td>
      <td>${STATUS_BADGE[c.status] || c.status}</td>
      <td>${PRIORITY_BADGE[c.priority] || c.priority}</td>
      <td>${c.date}</td>
    </tr>`).join('');

  // Row click → modal
  tbody.querySelectorAll('.history-row').forEach((row) => {
    const open = () => openDetailModal(row.dataset.id);
    row.addEventListener('click', open);
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
  });
};

/* ============================================================
   PAGINATION
============================================================ */
const renderPagination = () => {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(state.filtered.length / state.perPage);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  container.innerHTML = `
    <button class="page-btn" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>&#8249;</button>
    ${pages.map((p) => `<button class="page-btn ${p === state.page ? 'active' : ''}" data-page="${p}">${p}</button>`).join('')}
    <button class="page-btn" data-page="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''}>&#8250;</button>`;

  container.querySelectorAll('.page-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.page, 10);
      renderTable();
      renderPagination();
      document.getElementById('history-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

/* ============================================================
   STATUS FILTER TABS
============================================================ */
const initStatusTabs = () => {
  document.querySelectorAll('[data-status-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-status-tab]').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.statusFilter = tab.dataset.statusTab;
      applyFilters();
    });
  });
};

/* ============================================================
   SEARCH
============================================================ */
const initSearchBox = () => {
  const input = document.getElementById('history-search');
  if (!input) return;
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchQuery = input.value.trim();
      applyFilters();
    }, 300);
  });
};

/* ============================================================
   SORT HEADERS
============================================================ */
const initSortHeaders = () => {
  document.querySelectorAll('[data-sort]').forEach((th) => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (state.sortField === field) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortDir = 'desc';
      }
      document.querySelectorAll('[data-sort]').forEach((h) => h.classList.remove('sort-active'));
      th.classList.add('sort-active');
      th.dataset.sortDir = state.sortDir;
      applyFilters();
    });
  });
};

/* ============================================================
   DATE RANGE FILTER
============================================================ */
const initDateFilter = () => {
  const fromInput = document.getElementById('date-from');
  const toInput   = document.getElementById('date-to');
  const clearBtn  = document.getElementById('clear-date-filter');
  if (!fromInput || !toInput) return;

  fromInput.addEventListener('change', () => { state.dateFrom = fromInput.value; applyFilters(); });
  toInput.addEventListener('change',   () => { state.dateTo   = toInput.value;   applyFilters(); });
  clearBtn?.addEventListener('click',  () => {
    state.dateFrom = ''; state.dateTo = '';
    fromInput.value = ''; toInput.value = '';
    applyFilters();
  });
};

/* ============================================================
   MODAL — COMPLAINT DETAIL
============================================================ */
const openDetailModal = (id) => {
  const complaint = ALL_COMPLAINTS.find((c) => c.id === id);
  if (!complaint) return;

  const modal = document.getElementById('complaint-detail-modal');
  if (!modal) return;

  modal.querySelector('#modal-id')?.setAttribute('textContent', complaint.id) ||
    (modal.querySelector('#modal-id') ? (modal.querySelector('#modal-id').textContent = complaint.id) : null);

  const fields = { 'modal-id': complaint.id, 'modal-title': complaint.title,
    'modal-category': complaint.category, 'modal-status': complaint.status,
    'modal-priority': complaint.priority, 'modal-date': complaint.date,
    'modal-desc': complaint.description };

  Object.entries(fields).forEach(([elId, val]) => {
    const el = modal.querySelector(`#${elId}`);
    if (el) el.textContent = val;
  });

  if (typeof window.openModal === 'function') window.openModal('complaint-detail-modal');
  else { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
};

/* ============================================================
   EXPORT TO CSV (SIMULATION)
============================================================ */
const initExportCSV = () => {
  const btn = document.getElementById('export-csv-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Date'];
    const rows    = state.filtered.map((c) =>
      [c.id, `"${c.title}"`, c.category, c.status, c.priority, c.date].join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `NagrikConnect_Complaints_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof window.showToast === 'function') window.showToast('CSV exported successfully!', 'success');
  });
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyFilters();
  initStatusTabs();
  initSearchBox();
  initSortHeaders();
  initDateFilter();
  initExportCSV();
});
