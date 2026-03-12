/**
 * submission.js - NagrikConnect Complaint Submission
 * Voice input, drag-drop upload, form validation, language selector,
 * step progress, priority selection, success animation, tracking ID
 */

'use strict';

/* ============================================================
   STEP PROGRESS INDICATOR
============================================================ */
let currentStep = 1;
const TOTAL_STEPS = 3;

const updateStepUI = () => {
  document.querySelectorAll('.step-item').forEach((item) => {
    const n = parseInt(item.dataset.step, 10);
    item.classList.toggle('step-active',    n === currentStep);
    item.classList.toggle('step-completed', n < currentStep);
    item.classList.toggle('step-pending',   n > currentStep);
    item.setAttribute('aria-current', n === currentStep ? 'step' : 'false');
  });

  document.querySelectorAll('.form-step').forEach((panel) => {
    const n = parseInt(panel.dataset.stepPanel, 10);
    panel.hidden = n !== currentStep;
    if (n === currentStep) panel.style.animation = 'slideStepIn 0.35s ease';
  });

  const progressBar = document.getElementById('step-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`;
  }
};

const initStepNavigation = () => {
  document.querySelectorAll('[data-step-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      if (currentStep < TOTAL_STEPS) { currentStep++; updateStepUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
  });

  document.querySelectorAll('[data-step-prev]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) { currentStep--; updateStepUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
  });

  updateStepUI();
};

/* ============================================================
   FORM VALIDATION — CURRENT STEP
============================================================ */
const REQUIRED_BY_STEP = {
  1: ['complaint-title', 'complaint-category', 'complaint-description'],
  2: ['complaint-location'],
  3: [],
};

const validateCurrentStep = () => {
  const fields = REQUIRED_BY_STEP[currentStep] || [];
  let valid = true;
  fields.forEach((name) => {
    const el = document.getElementById(name) || document.querySelector(`[name="${name}"]`);
    if (!el) return;
    const err = el.parentElement.querySelector('.field-error');
    if (!el.value.trim()) {
      el.classList.add('input-error');
      if (!err) {
        const msg = document.createElement('p');
        msg.className = 'field-error';
        msg.textContent = `${el.labels?.[0]?.textContent || 'This field'} is required.`;
        el.parentElement.appendChild(msg);
      }
      valid = false;
    } else {
      el.classList.remove('input-error');
      err?.remove();
    }
  });
  if (!valid && typeof window.showToast === 'function') {
    window.showToast('Please fill in all required fields.', 'warning');
  }
  return valid;
};

/* ============================================================
   WEB SPEECH API — VOICE INPUT
============================================================ */
const initVoiceInput = () => {
  const voiceBtn     = document.getElementById('voice-btn');
  const descField    = document.getElementById('complaint-description');
  const voiceStatus  = document.getElementById('voice-status');
  if (!voiceBtn || !descField) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.title = 'Voice input not supported in this browser.';
    voiceBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous    = true;
  recognition.interimResults = true;
  recognition.lang          = document.getElementById('lang-select')?.value || 'en-IN';

  let isRecording = false;
  let interimSpan = null;

  voiceBtn.addEventListener('click', () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.lang = document.getElementById('lang-select')?.value || 'en-IN';
      recognition.start();
    }
  });

  recognition.onstart = () => {
    isRecording = true;
    voiceBtn.classList.add('recording');
    voiceBtn.setAttribute('aria-label', 'Stop voice recording');
    voiceBtn.innerHTML = `<span class="rec-dot"></span> Stop`;
    if (voiceStatus) voiceStatus.textContent = 'Listening… speak now';
    interimSpan = document.createElement('span');
    interimSpan.className = 'interim-text';
    descField.parentElement.appendChild(interimSpan);
  };

  recognition.onresult = (event) => {
    let interim = '';
    let final   = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += transcript + ' ';
      else interim += transcript;
    }
    if (final) {
      descField.value += final;
      if (interimSpan) interimSpan.textContent = '';
    }
    if (interimSpan) interimSpan.textContent = interim;
  };

  recognition.onerror = (event) => {
    if (typeof window.showToast === 'function') window.showToast(`Voice error: ${event.error}`, 'error');
  };

  recognition.onend = () => {
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.setAttribute('aria-label', 'Start voice recording');
    voiceBtn.innerHTML = `🎤 Voice`;
    if (voiceStatus) voiceStatus.textContent = '';
    interimSpan?.remove();
    interimSpan = null;
  };
};

/* ============================================================
   DRAG & DROP + FILE INPUT IMAGE UPLOAD
============================================================ */
const MAX_IMAGES = 5;
let uploadedFiles = [];

const initImageUpload = () => {
  const dropZone   = document.getElementById('drop-zone');
  const fileInput  = document.getElementById('image-input');
  const previewGrid = document.getElementById('image-preview-grid');
  if (!dropZone || !fileInput || !previewGrid) return;

  const handleFiles = (files) => {
    const remaining = MAX_IMAGES - uploadedFiles.length;
    if (remaining <= 0) {
      if (typeof window.showToast === 'function') window.showToast(`Max ${MAX_IMAGES} images allowed.`, 'warning');
      return;
    }
    const toAdd = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, remaining);
    toAdd.forEach((file) => {
      uploadedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e) => addPreview(e.target.result, file.name, uploadedFiles.length - 1);
      reader.readAsDataURL(file);
    });
    if (typeof window.showToast === 'function' && toAdd.length) {
      window.showToast(`${toAdd.length} image(s) added.`, 'success', 2000);
    }
  };

  const addPreview = (src, name, idx) => {
    const item = document.createElement('div');
    item.className = 'preview-item';
    item.dataset.idx = idx;
    item.innerHTML = `
      <img src="${src}" alt="${name}" loading="lazy"/>
      <button type="button" class="remove-img" aria-label="Remove image" data-idx="${idx}">✕</button>
      <p class="img-name">${name.length > 14 ? name.substring(0, 12) + '…' : name}</p>`;
    previewGrid.appendChild(item);

    item.querySelector('.remove-img').addEventListener('click', () => {
      uploadedFiles.splice(idx, 1);
      item.remove();
      // Re-index remaining items
      previewGrid.querySelectorAll('.preview-item').forEach((el, i) => {
        el.dataset.idx = i;
        el.querySelector('.remove-img').dataset.idx = i;
      });
    });
  };

  // Drag events
  ['dragenter', 'dragover'].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  });
  ['dragleave', 'dragend', 'drop'].forEach((ev) => {
    dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over'));
  });
  dropZone.addEventListener('drop', (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { handleFiles(fileInput.files); fileInput.value = ''; });
};

/* ============================================================
   LANGUAGE SELECTOR
============================================================ */
const LANG_PLACEHOLDERS = {
  'en-IN': {
    title:       'e.g. Broken streetlight near park',
    description: 'Describe the issue in detail…',
    location:    'Enter address or landmark',
  },
  'hi-IN': {
    title:       'उदा. पार्क के पास टूटी स्ट्रीटलाइट',
    description: 'समस्या का विस्तार से वर्णन करें…',
    location:    'पता या लैंडमार्क दर्ज करें',
  },
  'mr-IN': {
    title:       'उदा. उद्यानाजवळ तुटलेला दिवा',
    description: 'समस्येचे सविस्तर वर्णन करा…',
    location:    'पत्ता किंवा खूण प्रविष्ट करा',
  },
};

const initLanguageSelector = () => {
  const langSelect = document.getElementById('lang-select');
  if (!langSelect) return;

  const applyLanguage = (lang) => {
    const ph = LANG_PLACEHOLDERS[lang] || LANG_PLACEHOLDERS['en-IN'];
    const titleEl = document.getElementById('complaint-title');
    const descEl  = document.getElementById('complaint-description');
    const locEl   = document.getElementById('complaint-location');
    if (titleEl) titleEl.placeholder = ph.title;
    if (descEl)  descEl.placeholder  = ph.description;
    if (locEl)   locEl.placeholder   = ph.location;

    // Update voice recognition language
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) voiceBtn.title = `Voice input in ${lang}`;
    sessionStorage.setItem('submission_lang', lang);
  };

  langSelect.addEventListener('change', () => applyLanguage(langSelect.value));

  // Restore last selection
  const saved = sessionStorage.getItem('submission_lang');
  if (saved) { langSelect.value = saved; applyLanguage(saved); }
  else applyLanguage(langSelect.value || 'en-IN');
};

/* ============================================================
   PRIORITY SELECTION
============================================================ */
const initPrioritySelection = () => {
  const cards = document.querySelectorAll('.priority-card');
  const hiddenInput = document.getElementById('complaint-priority');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      if (hiddenInput) hiddenInput.value = card.dataset.priority;
      // Visual pulse
      card.style.transform = 'scale(1.05)';
      setTimeout(() => { card.style.transform = ''; }, 200);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
};

/* ============================================================
   TRACKING ID GENERATOR
============================================================ */
const generateTrackingId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `NC-${year}-${rand}`;
};

/* ============================================================
   FORM SUBMISSION + SUCCESS ANIMATION
============================================================ */
const initFormSubmission = () => {
  const form      = document.getElementById('complaint-form');
  const successEl = document.getElementById('submission-success');
  const trackIdEl = document.getElementById('generated-track-id');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="btn-spinner"></span> Submitting…`;
    }

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));

    const trackId = generateTrackingId();
    sessionStorage.setItem('last_track_id', trackId);

    if (trackIdEl) trackIdEl.textContent = trackId;
    if (successEl) {
      successEl.hidden = false;
      successEl.classList.add('success-animate');
      form.style.display = 'none';
    }

    if (typeof window.showToast === 'function') {
      window.showToast(`Complaint submitted! ID: ${trackId}`, 'success', 6000);
    }

    // Trigger confetti if available
    if (typeof window.launchConfetti === 'function') window.launchConfetti();
  });

  // Copy tracking ID
  document.getElementById('copy-track-id')?.addEventListener('click', () => {
    const id = trackIdEl?.textContent;
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      if (typeof window.showToast === 'function') window.showToast('Tracking ID copied!', 'info', 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = id; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
      if (typeof window.showToast === 'function') window.showToast('Tracking ID copied!', 'info', 2000);
    });
  });
};

/* ============================================================
   CHAR COUNT FOR DESCRIPTION
============================================================ */
const initCharCount = () => {
  const desc    = document.getElementById('complaint-description');
  const counter = document.getElementById('desc-char-count');
  const MAX     = 1000;
  if (!desc || !counter) return;

  const update = () => {
    const len = desc.value.length;
    counter.textContent = `${len} / ${MAX}`;
    counter.style.color = len > MAX * 0.9 ? '#ef4444' : '#94a3b8';
    if (len > MAX) desc.value = desc.value.substring(0, MAX);
  };
  desc.addEventListener('input', update);
  update();
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initStepNavigation();
  initVoiceInput();
  initImageUpload();
  initLanguageSelector();
  initPrioritySelection();
  initFormSubmission();
  initCharCount();
});
