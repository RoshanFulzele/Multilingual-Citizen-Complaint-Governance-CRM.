/**
 * assignment.js - NagrikConnect Authority Assignment
 * Unassigned complaints list, assign, escalate, filter, search, notify, department directory
 */

'use strict';

/* ============================================================
   MOCK UNASSIGNED COMPLAINTS (15+ entries)
============================================================ */
const UNASSIGNED_COMPLAINTS = [
  { id: 'NC-2024-0901', title: 'Manhole open on highway bridge',      category: 'Road',       priority: 'High',   date: '2024-06-07', location: 'NH-8 Overbridge, Mumbai',         citizen: 'Arjun Sharma'    },
  { id: 'NC-2024-0902', title: 'Dead animals near water reservoir',   category: 'Animals',    priority: 'High',   date: '2024-06-07', location: 'Tulsi Lake, Borivali',            citizen: 'Meena Patil'     },
  { id: 'NC-2024-0903', title: 'Garbage burning near residential',    category: 'Sanitation', priority: 'Medium', date: '2024-06-06', location: 'Sector 7, Navi Mumbai',           citizen: 'Ramesh Gupta'    },
  { id: 'NC-2024-0904', title: 'Illegal billboard blocking signal',   category: 'Road',       priority: 'Medium', date: '2024-06-06', location: 'Andheri West Junction',           citizen: 'Sita Joshi'      },
  { id: 'NC-2024-0905', title: 'Loud music from wedding hall',        category: 'Noise',      priority: 'Low',    date: '2024-06-05', location: 'Dream Palace Banquet, Pune',      citizen: 'Vikram Nair'     },
  { id: 'NC-2024-0906', title: 'Vehicles parked on cycle track',      category: 'Parking',    priority: 'Medium', date: '2024-06-05', location: 'Marine Drive, Mumbai',            citizen: 'Pooja Desai'     },
  { id: 'NC-2024-0907', title: 'Sewage leaking into garden',          category: 'Sanitation', priority: 'High',   date: '2024-06-04', location: 'Sinhagad Road, Pune',             citizen: 'Kiran Kulkarni'  },
  { id: 'NC-2024-0908', title: 'Dog bite reported near market',       category: 'Animals',    priority: 'High',   date: '2024-06-04', location: 'Dadar Market, Mumbai',            citizen: 'Anil Rao'        },
  { id: 'NC-2024-0909', title: 'Footpath encroachment by shop',       category: 'Road',       priority: 'Low',    date: '2024-06-03', location: 'FC Road, Pune',                   citizen: 'Sunita Deshpande' },
  { id: 'NC-2024-0910', title: 'Construction at 4 AM disturbing sleep',category:'Noise',      priority: 'Medium', date: '2024-06-03', location: 'Bandra Reclamation, Mumbai',      citizen: 'Prashant More'   },
  { id: 'NC-2024-0911', title: 'No streetlights for 3 blocks',        category: 'Road',       priority: 'High',   date: '2024-06-02', location: 'Hadapsar Industrial Area, Pune',  citizen: 'Lakshmi Iyer'    },
  { id: 'NC-2024-0912', title: 'Open drain causing mosquito breeding', category: 'Sanitation', priority: 'High',   date: '2024-06-02', location: 'Kurla East, Mumbai',              citizen: 'Dinesh Pawar'    },
  { id: 'NC-2024-0913', title: 'Abandoned vehicle parked for month',  category: 'Parking',    priority: 'Low',    date: '2024-06-01', location: 'Kothrud, Pune',                   citizen: 'Swati Bhosle'    },
  { id: 'NC-2024-0914', title: 'Stray pigs in public park',           category: 'Animals',    priority: 'Medium', date: '2024-06-01', location: 'Rani Bagh Park, Nagpur',          citizen: 'Rajendra Wagh'   },
  { id: 'NC-2024-0915', title: 'Broken public toilet door',           category: 'Other',      priority: 'Medium', date: '2024-05-31', location: 'Chatrapati Station, Mumbai',      citizen: 'Nirmala Singh'   },
  { id: 'NC-2024-0916', title: 'Fly-tipping near school gate',        category: 'Sanitation', priority: 'High',   date: '2024-05-31', location: 'Vidya Nagar, Pune',               citizen: 'Amol Jagtap'     },
];

/* ============================================================
   DEPARTMENT DIRECTORY
============================================================ */
const DEPARTMENTS = [
  { id: 'roads',    name: 'Municipal Roads Department',  head: 'Er. Sunil Kale',    contact: '022-2456-7890', categories: ['Road']             },
  { id: 'sanit',    name: 'Sanitation & Waste Division', head: 'Smt. Anita Shinde', contact: '022-2456-7891', categories: ['Sanitation']       },
  { id: 'animals',  name: 'Animal Control Unit',         head: 'Dr. Praveen Kamble',contact: '022-2456-7892', categories: ['Animals']          },
  { id: 'noise',    name: 'Noise Pollution Cell',        head: 'Insp. Ravi Gadge',  contact: '022-2456-7893', categories: ['Noise']            },
  { id: 'parking',  name: 'Traffic & Parking Authority', head: 'Mr. Ashish Thosar', contact: '022-2456-7894', categories: ['Parking']          },
  { id: 'general',  name: 'General Administration Cell', head: 'Mrs. Sheela Bapat', contact: '022-2456-7895', categories: ['Other', 'General'] },
];

/* ============================================================
   STATE
============================================================ */
let assignmentState = {
  complaints:     [...UNASSIGNED_COMPLAINTS],
  filtered:       [...UNASSIGNED_COMPLAINTS],
  selected:       null,
  searchQuery:    '',
  filterCategory: 'all',
  filterPriority: 'all',
};

/* ============================================================
   RENDER COMPLAINTS LIST
============================================================ */
const PRIO_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

const renderComplaintList = () => {
  const container = document.getElementById('unassigned-list');
  if (!container) return;

  if (!assignmentState.filtered.length) {
    container.innerHTML = `<div class="empty-state">No complaints match the filters.</div>`;
    return;
  }

  container.innerHTML = assignmentState.filtered.map((c) => `
    <div class="complaint-card ${assignmentState.selected?.id === c.id ? 'selected' : ''}"
         data-id="${c.id}" tabindex="0" role="button" aria-label="Select complaint ${c.id}">
      <div class="card-header">
        <code class="complaint-id">${c.id}</code>
        <span class="priority-dot" style="background:${PRIO_COLOR[c.priority]}" title="${c.priority} priority"></span>
      </div>
      <p class="card-title">${c.title}</p>
      <div class="card-meta">
        <span class="chip">${c.category}</span>
        <span class="chip">${c.date}</span>
      </div>
      <p class="card-citizen">👤 ${c.citizen}</p>
    </div>`).join('');

  container.querySelectorAll('.complaint-card').forEach((card) => {
    const select = () => selectComplaint(card.dataset.id);
    card.addEventListener('click', select);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
  });
};

/* ============================================================
   SELECT COMPLAINT
============================================================ */
const selectComplaint = (id) => {
  assignmentState.selected = assignmentState.complaints.find((c) => c.id === id) || null;
  renderComplaintList();
  renderAssignPanel();
};

/* ============================================================
   RENDER ASSIGN PANEL
============================================================ */
const renderAssignPanel = () => {
  const panel   = document.getElementById('assign-panel');
  const noSel   = document.getElementById('no-selection-msg');
  if (!panel) return;

  if (!assignmentState.selected) {
    panel.hidden   = true;
    if (noSel) noSel.hidden = false;
    return;
  }

  if (noSel) noSel.hidden = true;
  panel.hidden = false;

  const c = assignmentState.selected;

  const fields = {
    'ap-id':       c.id,
    'ap-title':    c.title,
    'ap-category': c.category,
    'ap-priority': c.priority,
    'ap-date':     c.date,
    'ap-location': c.location,
    'ap-citizen':  c.citizen,
  };
  Object.entries(fields).forEach(([elId, val]) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = val;
  });

  // Suggest department
  const deptSelect = document.getElementById('dept-select');
  if (deptSelect) {
    const suggested = DEPARTMENTS.find((d) => d.categories.includes(c.category));
    if (suggested) deptSelect.value = suggested.id;
  }

  panel.style.animation = 'fadeSlideIn 0.3s ease';
};

/* ============================================================
   FILTER & SEARCH PIPELINE
============================================================ */
const applyAssignmentFilters = () => {
  let data = [...assignmentState.complaints];

  if (assignmentState.filterCategory !== 'all') {
    data = data.filter((c) => c.category === assignmentState.filterCategory);
  }
  if (assignmentState.filterPriority !== 'all') {
    data = data.filter((c) => c.priority === assignmentState.filterPriority);
  }
  if (assignmentState.searchQuery) {
    const q = assignmentState.searchQuery.toLowerCase();
    data = data.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.citizen.toLowerCase().includes(q)
    );
  }

  assignmentState.filtered = data;
  renderComplaintList();
};

const initFiltersAndSearch = () => {
  const catFilter  = document.getElementById('filter-category');
  const prioFilter = document.getElementById('filter-priority');
  const searchBox  = document.getElementById('assign-search');

  catFilter?.addEventListener('change', () => {
    assignmentState.filterCategory = catFilter.value;
    applyAssignmentFilters();
  });
  prioFilter?.addEventListener('change', () => {
    assignmentState.filterPriority = prioFilter.value;
    applyAssignmentFilters();
  });

  let debounce;
  searchBox?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      assignmentState.searchQuery = searchBox.value.trim();
      applyAssignmentFilters();
    }, 250);
  });
};

/* ============================================================
   ASSIGN COMPLAINT
============================================================ */
const initAssignAction = () => {
  const btn = document.getElementById('assign-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!assignmentState.selected) return;
    const deptId   = document.getElementById('dept-select')?.value;
    const noteText = document.getElementById('assign-note')?.value.trim();

    if (!deptId) {
      if (typeof window.showToast === 'function') window.showToast('Please select a department.', 'warning');
      return;
    }

    const dept = DEPARTMENTS.find((d) => d.id === deptId);
    btn.disabled  = true;
    btn.innerHTML = `<span class="btn-spinner"></span> Assigning…`;

    await new Promise((r) => setTimeout(r, 1000));

    // Remove from list
    assignmentState.complaints = assignmentState.complaints.filter(
      (c) => c.id !== assignmentState.selected.id
    );
    const assignedId = assignmentState.selected.id;
    assignmentState.selected = null;
    applyAssignmentFilters();

    const panel = document.getElementById('assign-panel');
    if (panel) panel.hidden = true;
    document.getElementById('no-selection-msg') && (document.getElementById('no-selection-msg').hidden = false);

    btn.disabled  = false;
    btn.innerHTML = 'Assign Complaint';

    if (typeof window.showToast === 'function') {
      window.showToast(
        `✔ ${assignedId} assigned to ${dept?.name || deptId}.`,
        'success', 5000
      );
    }

    // Show notification simulation
    simulateCitizenNotification(assignedId);
  });
};

/* ============================================================
   ESCALATE COMPLAINT
============================================================ */
const initEscalateAction = () => {
  const btn = document.getElementById('escalate-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!assignmentState.selected) return;
    const id = assignmentState.selected.id;

    if (!confirm(`Escalate complaint ${id} to senior authorities? This will flag it as urgent.`)) return;

    if (typeof window.showToast === 'function') {
      window.showToast(`⚠ Complaint ${id} has been escalated to District Collector.`, 'warning', 5000);
    }

    // Visual feedback on the card
    const card = document.querySelector(`.complaint-card[data-id="${id}"]`);
    if (card) {
      card.classList.add('escalated');
      card.innerHTML += `<span class="escalated-badge">ESCALATED</span>`;
    }
  });
};

/* ============================================================
   SEND NOTIFICATION TO CITIZEN (SIMULATED)
============================================================ */
const simulateCitizenNotification = (complaintId) => {
  const log = document.getElementById('notification-log');
  if (!log) return;

  const item = document.createElement('div');
  item.className = 'notif-log-item';
  item.innerHTML = `
    <span class="notif-icon">📱</span>
    <div>
      <p><strong>${complaintId}</strong> — SMS & email sent to citizen.</p>
      <small>${new Date().toLocaleTimeString()}</small>
    </div>`;
  item.style.animation = 'fadeSlideIn 0.3s ease';
  log.prepend(item);
};

/* ============================================================
   DEPARTMENT DIRECTORY RENDER
============================================================ */
const renderDepartmentDirectory = () => {
  const container = document.getElementById('dept-directory');
  if (!container) return;

  container.innerHTML = DEPARTMENTS.map((d) => `
    <div class="dept-card">
      <h4>${d.name}</h4>
      <p><strong>Head:</strong> ${d.head}</p>
      <p><strong>Contact:</strong> ${d.contact}</p>
      <p><strong>Handles:</strong> ${d.categories.join(', ')}</p>
    </div>`).join('');
};

/* ============================================================
   POPULATE DEPT SELECT
============================================================ */
const populateDeptSelect = () => {
  const select = document.getElementById('dept-select');
  if (!select) return;
  select.innerHTML = `<option value="">— Select Department —</option>` +
    DEPARTMENTS.map((d) => `<option value="${d.id}">${d.name}</option>`).join('');
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  populateDeptSelect();
  renderComplaintList();
  renderDepartmentDirectory();
  initFiltersAndSearch();
  initAssignAction();
  initEscalateAction();

  // Pre-select complaint from URL param
  const params = new URLSearchParams(window.location.search);
  const paramId = params.get('id');
  if (paramId) {
    setTimeout(() => selectComplaint(paramId), 300);
  }
});
