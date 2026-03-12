/**
 * support.js - NagrikConnect Support Page
 * Chat interface, bot responses, typing indicator, FAQ accordion,
 * contact form validation, knowledge base search, sessionStorage persistence, emoji
 */

'use strict';

/* ============================================================
   BOT RESPONSE KNOWLEDGE BASE
============================================================ */
const BOT_RESPONSES = [
  {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'नमस्कार'],
    reply: '👋 Hello! Welcome to NagrikConnect Support. How can I help you today?\n\nI can assist you with:\n• Submitting a complaint\n• Tracking your complaint status\n• Account & login help\n• General information',
  },
  {
    keywords: ['submit', 'file', 'report', 'new complaint', 'register', 'how to complain'],
    reply: '📝 To submit a complaint:\n1. Log in to your citizen account\n2. Click <strong>"File a Complaint"</strong> in the dashboard\n3. Fill in the details (title, category, description)\n4. Upload photos (optional)\n5. Submit and note your <strong>Tracking ID</strong>\n\n<a href="submission.html" class="chat-link">→ Go to Complaint Submission</a>',
  },
  {
    keywords: ['track', 'tracking', 'status', 'check', 'where', 'update', 'progress'],
    reply: '🔍 To track your complaint:\n1. Visit the <strong>Track Complaint</strong> page\n2. Enter your Tracking ID (format: NC-YYYY-XXXXX)\n3. View real-time status and timeline\n\n<a href="tracking.html" class="chat-link">→ Go to Tracking Page</a>\n\nYou can also find past complaints in your <a href="history.html" class="chat-link">Complaint History</a>.',
  },
  {
    keywords: ['login', 'sign in', 'password', 'forgot', 'credentials', 'access', 'account'],
    reply: '🔐 For login issues:\n• Demo citizen credentials: <code>citizen@nagrik.gov</code> / <code>demo123</code>\n• Demo admin credentials: <code>admin@nagrik.gov</code> / <code>admin123</code>\n\nIf you forgot your password, use the <strong>"Forgot Password"</strong> link on the login page.\n\n<a href="login.html" class="chat-link">→ Go to Login</a>',
  },
  {
    keywords: ['help', 'support', 'guide', 'how', 'assist', 'FAQ', 'problem', 'issue'],
    reply: '🆘 I\'m here to help! Common topics:\n• 📋 <strong>Submit complaint</strong> — type "submit"\n• 🔍 <strong>Track complaint</strong> — type "track"\n• 🔐 <strong>Login help</strong> — type "login"\n• 🏢 <strong>Departments</strong> — type "department"\n• 📞 <strong>Contact</strong> — type "contact"\n\nOr scroll down to see our <strong>FAQ section</strong>.',
  },
  {
    keywords: ['department', 'officer', 'who handles', 'assigned', 'which dept', 'authority'],
    reply: '🏢 NagrikConnect routes complaints to these departments:\n• 🛣️ <strong>Roads</strong> — Potholes, streetlights, footpaths\n• 🗑️ <strong>Sanitation</strong> — Garbage, sewage, drains\n• 🐾 <strong>Animals</strong> — Stray animals, dog bites\n• 🔊 <strong>Noise</strong> — Noise pollution, illegal events\n• 🚗 <strong>Parking</strong> — Illegal parking, abandoned vehicles\n\nFor escalations, contact the District Collector office.',
  },
  {
    keywords: ['contact', 'phone', 'email', 'address', 'reach', 'call', 'helpline'],
    reply: '📞 Contact NagrikConnect:\n• <strong>Helpline:</strong> 1800-XXX-NAGRIK (toll-free)\n• <strong>Email:</strong> support@nagrikconnect.gov.in\n• <strong>WhatsApp:</strong> +91 98765 43210\n• <strong>Office Hours:</strong> Mon–Sat, 9 AM – 6 PM\n\nOr use the <strong>Contact Form</strong> below for written queries.',
  },
  {
    keywords: ['language', 'hindi', 'marathi', 'english', 'translation', 'भाषा'],
    reply: '🌐 NagrikConnect supports:\n• 🇬🇧 English\n• 🇮🇳 हिंदी (Hindi)\n• महाराष्ट्र मराठी (Marathi)\n\nSwitch language on the complaint submission page using the language selector. Voice input also works in Hindi & Marathi!',
  },
  {
    keywords: ['resolved', 'closed', 'done', 'completed', 'fixed', 'solution'],
    reply: '✅ If your complaint is marked resolved but the issue persists:\n1. Open the complaint from your History page\n2. Click <strong>"Reopen Complaint"</strong>\n3. Add a note explaining the issue continues\n\nRepeated non-resolution will auto-escalate after 3 reopens.',
  },
  {
    keywords: ['time', 'how long', 'days', 'response', 'sla', 'deadline', 'eta'],
    reply: '⏱️ Expected Resolution Times (SLA):\n• 🔴 <strong>High Priority:</strong> 24–48 hours\n• 🟡 <strong>Medium Priority:</strong> 3–5 working days\n• 🟢 <strong>Low Priority:</strong> 7–10 working days\n\nYou will receive SMS/email updates at each stage.',
  },
];

const DEFAULT_BOT_REPLY = '🤔 I didn\'t quite understand that. Could you rephrase? Try typing <strong>"help"</strong> to see what I can assist with, or scroll down to the FAQ section!';

/* ============================================================
   GET BOT REPLY
============================================================ */
const getBotReply = (userMessage) => {
  const lower = userMessage.toLowerCase();
  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.reply;
    }
  }
  return DEFAULT_BOT_REPLY;
};

/* ============================================================
   CHAT STATE + SESSION STORAGE
============================================================ */
const CHAT_STORAGE_KEY = 'nagrik_chat_history';

const loadChatHistory = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY)) || [];
  } catch { return []; }
};

const saveChatHistory = (messages) => {
  try { sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-60))); }
  catch { /* storage full */ }
};

/* ============================================================
   RENDER CHAT MESSAGES
============================================================ */
const renderMessage = (role, html, timestamp = new Date()) => {
  const messagesEl = document.getElementById('chat-messages');
  if (!messagesEl) return;

  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${role === 'bot' ? 'msg-bot' : 'msg-user'}`;
  wrapper.innerHTML = `
    <div class="msg-bubble">
      ${role === 'bot' ? '<span class="bot-avatar">🤖</span>' : ''}
      <div class="msg-content">${html}</div>
    </div>
    <time class="msg-time">${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>`;

  wrapper.style.opacity  = '0';
  wrapper.style.transform = role === 'bot' ? 'translateX(-12px)' : 'translateX(12px)';
  messagesEl.appendChild(wrapper);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      wrapper.style.opacity    = '1';
      wrapper.style.transform  = 'translateX(0)';
    });
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
};

/* ============================================================
   TYPING INDICATOR
============================================================ */
let typingEl = null;

const showTyping = () => {
  const messagesEl = document.getElementById('chat-messages');
  if (!messagesEl || typingEl) return;

  typingEl = document.createElement('div');
  typingEl.className = 'chat-message msg-bot typing-indicator';
  typingEl.innerHTML = `
    <div class="msg-bubble">
      <span class="bot-avatar">🤖</span>
      <div class="msg-content">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </div>`;
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const hideTyping = () => {
  typingEl?.remove();
  typingEl = null;
};

/* ============================================================
   SEND MESSAGE
============================================================ */
const chatHistory = loadChatHistory();

const sendMessage = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Render user message
  renderMessage('user', escapeHtml(trimmed));
  chatHistory.push({ role: 'user', text: trimmed, time: new Date().toISOString() });
  saveChatHistory(chatHistory);

  // Show typing
  showTyping();

  const delay = 800 + Math.random() * 800;
  setTimeout(() => {
    hideTyping();
    const reply = getBotReply(trimmed);
    renderMessage('bot', reply);
    chatHistory.push({ role: 'bot', text: reply, time: new Date().toISOString() });
    saveChatHistory(chatHistory);
  }, delay);
};

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ============================================================
   EMOJI PICKER (SIMPLE)
============================================================ */
const EMOJI_LIST = ['😊','😢','😡','👍','👎','🙏','❓','❗','💬','🔍','📋','✅','❌','⚠️','📞','📱'];

const initEmojiPicker = () => {
  const btn     = document.getElementById('emoji-btn');
  const picker  = document.getElementById('emoji-picker');
  const input   = document.getElementById('chat-input');
  if (!btn || !picker || !input) return;

  picker.innerHTML = EMOJI_LIST.map((e) =>
    `<button type="button" class="emoji-item" aria-label="${e}">${e}</button>`
  ).join('');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    picker.classList.toggle('open');
  });

  picker.addEventListener('click', (e) => {
    const emojiBtn = e.target.closest('.emoji-item');
    if (!emojiBtn) return;
    const pos = input.selectionStart || input.value.length;
    input.value = input.value.slice(0, pos) + emojiBtn.textContent + input.value.slice(pos);
    input.focus();
    picker.classList.remove('open');
  });

  document.addEventListener('click', () => picker.classList.remove('open'));
};

/* ============================================================
   INIT CHAT INTERFACE
============================================================ */
const initChat = () => {
  const input   = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const clearBtn = document.getElementById('chat-clear-btn');
  if (!input || !sendBtn) return;

  // Restore history
  if (chatHistory.length) {
    chatHistory.forEach((msg) => {
      renderMessage(msg.role, msg.role === 'user' ? escapeHtml(msg.text) : msg.text, new Date(msg.time));
    });
  } else {
    // Welcome message
    setTimeout(() => {
      renderMessage('bot', BOT_RESPONSES[0].reply + '\n\n💡 <em>Tip: Try typing "help" to get started.</em>');
    }, 600);
  }

  const submit = () => {
    const val = input.value;
    input.value = '';
    autoResizeInput(input);
    sendMessage(val);
  };

  sendBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });
  input.addEventListener('input', () => autoResizeInput(input));

  clearBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    chatHistory.length = 0;
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.innerHTML = '';
    setTimeout(() => renderMessage('bot', '🗑️ Chat cleared. How can I help you today?'), 200);
  });

  initEmojiPicker();
};

const autoResizeInput = (el) => {
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
};

/* ============================================================
   FAQ ACCORDION
============================================================ */
const FAQ_DATA = [
  {
    q: 'How do I track my complaint?',
    a: 'Go to the <strong>Track Complaint</strong> page and enter your Tracking ID (NC-YYYY-XXXXX). You\'ll see real-time updates on all stages of resolution.',
  },
  {
    q: 'What is the expected resolution time?',
    a: '<strong>High Priority:</strong> 24–48 hours &nbsp;|&nbsp; <strong>Medium:</strong> 3–5 days &nbsp;|&nbsp; <strong>Low:</strong> 7–10 days. You\'ll receive SMS & email at each milestone.',
  },
  {
    q: 'Can I submit a complaint in Hindi or Marathi?',
    a: 'Yes! NagrikConnect supports English, हिंदी, and मराठी. Use the language selector on the complaint form. Voice input also works in all three languages.',
  },
  {
    q: 'My complaint is resolved but the issue persists. What do I do?',
    a: 'Open the complaint from your History page and click <strong>"Reopen Complaint"</strong>. Add a note explaining the situation. Three reopens trigger an automatic escalation.',
  },
  {
    q: 'How can I attach photos to my complaint?',
    a: 'On the complaint submission form, drag and drop images into the upload zone, or click to browse. You can attach up to <strong>5 images</strong> (JPG/PNG).',
  },
  {
    q: 'Who receives my complaint after submission?',
    a: 'Complaints are auto-routed to the relevant municipal department based on category. Admins can reassign via the Assignment panel.',
  },
  {
    q: 'Is my personal information kept private?',
    a: 'Yes. Your personal details are only shared with the assigned government officer. Public view shows only complaint category and location.',
  },
  {
    q: 'Can I use voice input to describe my complaint?',
    a: 'Yes! Click the <strong>🎤 Voice</strong> button on the complaint form. It uses your device\'s microphone to transcribe speech to text in real-time.',
  },
];

const initFAQAccordion = () => {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.innerHTML = FAQ_DATA.map((item, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${i}">
        <span>${item.q}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer" id="faq-answer-${i}" hidden>
        <p>${item.a}</p>
      </div>
    </div>`).join('');

  container.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded  = btn.getAttribute('aria-expanded') === 'true';
      const answerId  = btn.getAttribute('aria-controls');
      const answerEl  = document.getElementById(answerId);
      const icon      = btn.querySelector('.faq-icon');

      // Close all others
      container.querySelectorAll('.faq-question[aria-expanded="true"]').forEach((other) => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
          if (otherAnswer) { otherAnswer.hidden = true; otherAnswer.style.maxHeight = '0'; }
          const otherIcon = other.querySelector('.faq-icon');
          if (otherIcon) otherIcon.textContent = '+';
        }
      });

      btn.setAttribute('aria-expanded', String(!expanded));
      if (answerEl) {
        answerEl.hidden = expanded;
        answerEl.style.maxHeight = expanded ? '0' : `${answerEl.scrollHeight + 20}px`;
      }
      if (icon) icon.textContent = expanded ? '+' : '−';
    });
  });
};

/* ============================================================
   KNOWLEDGE BASE SEARCH
============================================================ */
const initKnowledgeSearch = () => {
  const searchInput = document.getElementById('kb-search');
  const resultsArea = document.getElementById('kb-results');
  if (!searchInput || !resultsArea) return;

  let debounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { resultsArea.innerHTML = ''; return; }

      const matches = FAQ_DATA.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );

      if (!matches.length) {
        resultsArea.innerHTML = `<p class="kb-no-results">No results found for "<strong>${escapeHtml(q)}</strong>". Try the chat for more help.</p>`;
        return;
      }

      resultsArea.innerHTML = matches.map((item) => `
        <div class="kb-result-item">
          <p class="kb-result-q">${item.q}</p>
          <p class="kb-result-a">${item.a}</p>
        </div>`).join('');
    }, 300);
  });
};

/* ============================================================
   CONTACT FORM VALIDATION & SUBMISSION
============================================================ */
const initContactForm = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  const showFieldError = (input, message) => {
    clearFieldError(input);
    input.classList.add('input-error');
    const err = document.createElement('p');
    err.className = 'field-error';
    err.textContent = message;
    input.parentElement.appendChild(err);
  };

  const clearFieldError = (input) => {
    input.classList.remove('input-error');
    input.parentElement.querySelector('.field-error')?.remove();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = form.querySelector('[name="contact-name"]');
    const email   = form.querySelector('[name="contact-email"]');
    const subject = form.querySelector('[name="contact-subject"]');
    const message = form.querySelector('[name="contact-message"]');
    let valid = true;

    [name, email, subject, message].forEach((el) => el && clearFieldError(el));

    if (!name?.value.trim())    { showFieldError(name, 'Name is required.'); valid = false; }
    if (!email?.value.trim())   { showFieldError(email, 'Email is required.'); valid = false; }
    else if (!isValidEmail(email.value)) { showFieldError(email, 'Invalid email format.'); valid = false; }
    if (!subject?.value.trim()) { showFieldError(subject, 'Subject is required.'); valid = false; }
    if (!message?.value.trim() || message.value.trim().length < 20) {
      showFieldError(message, 'Message must be at least 20 characters.'); valid = false;
    }

    if (!valid) {
      if (typeof window.showToast === 'function') window.showToast('Please fix the errors above.', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner"></span> Sending…`;

    await new Promise((r) => setTimeout(r, 1500));

    submitBtn.disabled = false;
    submitBtn.innerHTML = '✔ Message Sent!';
    submitBtn.classList.add('btn-success');
    form.reset();

    if (typeof window.showToast === 'function') {
      window.showToast('Your message has been sent. We\'ll respond within 24 hours.', 'success', 5000);
    }

    setTimeout(() => {
      submitBtn.innerHTML = 'Send Message';
      submitBtn.classList.remove('btn-success');
    }, 4000);
  });

  // Real-time clear on input
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => clearFieldError(el));
  });
};

/* ============================================================
   QUICK-REPLY SUGGESTION CHIPS
============================================================ */
const initQuickReplies = () => {
  const container = document.getElementById('quick-replies');
  if (!container) return;

  const chips = ['Track complaint', 'Submit complaint', 'Login help', 'Contact info', 'Departments', 'Response time'];
  container.innerHTML = chips.map((chip) =>
    `<button type="button" class="quick-chip" data-query="${chip}">${chip}</button>`
  ).join('');

  container.querySelectorAll('.quick-chip').forEach((chip) => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.query));
  });
};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initChat();
  initFAQAccordion();
  initKnowledgeSearch();
  initContactForm();
  initQuickReplies();
});
