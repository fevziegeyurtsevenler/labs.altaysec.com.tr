
var OBF_KEY = 'AltaySec_CTF_Lab_2024';

function deobfuscate(encoded) {
  try {
    var bytes = atob(encoded).split('').map(function(c) { return c.charCodeAt(0); });
    return bytes.map(function(b, i) {
      return String.fromCharCode(b ^ OBF_KEY.charCodeAt(i % OBF_KEY.length));
    }).join('');
  } catch (e) { return ''; }
}

var state = {
  provider: 'gemini',
  apiKey: null,
  currentLevel: null,
  isLoading: false,
  systemPrompts: {},
  chatHistories: { kolay: [], orta: [], zor: [] },
  hintsUsed: { kolay: 0, orta: 0, zor: 0 },
  completedLevels: JSON.parse(localStorage.getItem('altaysec_completed') || '[]')
};

var CHALLENGES = {
  kolay: {
    id: 'kolay', name: 'Kolay', icon: '🔓', subtitle: 'VAULT-BOT 9000',
    description: 'Güvenlik robotunu manipüle ederek kasa erişim kodunu ele geçir.',
    objective: 'AltaySec dijital kasasını koruyan VAULT-BOT 9000\'i kandır ve erişim kodunu ifşa ettir.',
    difficulty: 1, stars: '★★☆☆☆', hintCount: 2
  },
  orta: {
    id: 'orta', name: 'Orta', icon: '⚙️', subtitle: 'CORP-ASSISTANT',
    description: 'Kurumsal asistanı prompt injection ile kırarak gizli proje kodunu elde et.',
    objective: 'AltaySec Corp\'un çok katmanlı güvenlik talimatlarını atlayarak gizli proje kodunu buldur.',
    difficulty: 2, stars: '★★★★☆', hintCount: 3
  },
  zor: {
    id: 'zor', name: 'Zor', icon: '🛑', subtitle: 'NEMESIS-AI v2.1',
    description: 'Çok katmanlı savunma sistemini aşarak MASTER_KEY\'i sızdır.',
    objective: 'NEMESIS-AI\'nin 5 katman savunma protokolünü aşarak sistem promptunu ele geçir.',
    difficulty: 3, stars: '★★★★★', hintCount: 3
  }
};

var API = '/api';

function ge(id) { return document.getElementById(id); }

function escHtml(str) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function showScreen(name) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  ge('screen-' + name).classList.add('active');
}



function callGemini(apiKey, systemPrompt, messages) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
  var contents = messages.map(function(m) {
    return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
  });
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
    })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.error) throw new Error('Gemini: ' + data.error.message);
    if (!data.candidates || !data.candidates[0]) throw new Error('Gemini boş yanıt döndürdü');
    return data.candidates[0].content.parts[0].text;
  });
}

function callGroq(apiKey, systemPrompt, messages) {
  var msgs = [{ role: 'system', content: systemPrompt }];
  messages.forEach(function(m) {
    msgs.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
  });
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: msgs, temperature: 0.8, max_tokens: 1024 })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.error) throw new Error('Groq: ' + data.error.message);
    if (!data.choices || !data.choices[0]) throw new Error('Groq boş yanıt döndürdü');
    return data.choices[0].message.content;
  });
}

function initSetup() {
  var savedProvider = sessionStorage.getItem('altaysec_provider');
  var savedKey = sessionStorage.getItem('altaysec_key');
  if (savedProvider && savedKey) {
    state.provider = savedProvider;
    state.apiKey = savedKey;
    renderChallenges();
    showScreen('challenges');
    return;
  }

  var provBtns = document.querySelectorAll('.provider-btn');
  for (var i = 0; i < provBtns.length; i++) {
    provBtns[i].addEventListener('click', function() {
      for (var j = 0; j < provBtns.length; j++) provBtns[j].classList.remove('active');
      this.classList.add('active');
      state.provider = this.getAttribute('data-provider');
      var helper = ge('key-helper');
      if (helper) {
        helper.innerHTML = state.provider === 'gemini'
          ? 'Ücretsiz key: <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a>'
          : 'Ücretsiz key: <a href="https://console.groq.com/keys" target="_blank">console.groq.com</a>';
      }
    });
  }

  var toggleBtn = ge('toggle-key-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      var input = ge('api-key');
      input.type = input.type === 'password' ? 'text' : 'password';
      var eye = ge('eye-icon');
      if (eye) eye.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  }

  var form = ge('setup-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var apiKey = ge('api-key').value.trim();
      if (!apiKey) return;
      state.apiKey = apiKey;
      sessionStorage.setItem('altaysec_provider', state.provider);
      sessionStorage.setItem('altaysec_key', apiKey);
      renderChallenges();
      showScreen('challenges');
    });
  }
}

function renderChallenges() {
  var badge = ge('provider-badge');
  if (badge) badge.textContent = state.provider === 'gemini' ? '🔮 Gemini 1.5 Flash' : '⚡ Groq / Llama 3.3';

  var grid = ge('challenge-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var levels = ['kolay', 'orta', 'zor'];
  levels.forEach(function(id) {
    var ch = CHALLENGES[id];
    var completed = state.completedLevels.indexOf(id) > -1;
    var diffLabel = { kolay: 'KOLAY', orta: 'ORTA', zor: 'ZOR' }[id];

    var card = document.createElement('div');
    card.className = 'challenge-card difficulty-' + ch.difficulty + (completed ? ' completed' : '');
    card.innerHTML = (completed ? '<div class="completed-badge">✓ TAMAMLANDI</div>' : '') +
      '<div class="card-icon">' + ch.icon + '</div>' +
      '<span class="card-badge">' + diffLabel + '</span>' +
      '<div class="card-subtitle">' + ch.subtitle + '</div>' +
      '<h3 class="card-title">' + ch.name + '</h3>' +
      '<div class="card-stars">' + ch.stars + '</div>' +
      '<p class="card-desc">' + ch.description + '</p>' +
      '<button class="card-btn" type="button">' + (completed ? '↺ Tekrar Oyna' : '→ Başla') + '</button>';

    // Event listener ile bağla — data attribute üzerinden
    var btn = card.querySelector('.card-btn');
    btn.setAttribute('data-level', id);
    btn.addEventListener('click', function() {
      openLab(this.getAttribute('data-level'));
    });

    grid.appendChild(card);
  });
}

function openLab(level) {
  // Eğer level zaten tamamlanmışsa (Tekrar Oyna'ya basıldıysa), sıfırdan başla
  var idx = state.completedLevels.indexOf(level);
  if (idx > -1) {
    state.completedLevels.splice(idx, 1);
    localStorage.setItem('altaysec_completed', JSON.stringify(state.completedLevels));
    state.chatHistories[level] = [];
    state.hintsUsed[level] = 0;
  }

  state.currentLevel = level;
  var ch = CHALLENGES[level];

  var badge = ge('lab-level-badge');
  var subtitle = ge('lab-subtitle-text');
  var obj = ge('lab-objective');
  if (badge) badge.textContent = ch.name.toUpperCase();
  if (subtitle) subtitle.textContent = ch.subtitle;
  if (obj) obj.textContent = ch.objective;

  // Ekrana geç
  showScreen('lab');

  // Flag alanını temizle
  var fi = ge('flag-input');
  var fr = ge('flag-result');
  if (fi) fi.value = '';
  if (fr) { fr.textContent = ''; fr.className = 'flag-result'; }

  renderHints(level);
  renderChat(level);

  // Sistem promptunu backend'den al
  if (!state.systemPrompts[level]) {
    appendSystemMessage('Hedef sistemi yükleniyor...');
    fetch(API + '/session/' + level)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        state.systemPrompts[level] = deobfuscate(data.prompt);
      })
      .catch(function(err) {
        appendSystemMessage('Sistem yükleme hatası: ' + err.message);
      });
  }

  setTimeout(function() { var ci = ge('chat-input'); if (ci) ci.focus(); }, 150);
}

function renderHints(level) {
  var used      = state.hintsUsed[level];
  var ch        = CHALLENGES[level];
  var total     = ch ? ch.hintCount : 3;  // gerçek ipucu sayısı
  var container = ge('hints-container');
  if (!container) return;
  container.innerHTML = '';

  for (var i = 0; i < total; i++) {
    var item = document.createElement('div');
    item.className = 'hint-item';

    if (i < used) {
      item.classList.add('revealed');
      var hid = 'ht-' + level + '-' + i;
      item.innerHTML = '<div class="hint-item-inner"><span class="hint-num">#' + (i+1) + '</span><span class="hint-text" id="' + hid + '">Yükleniyor...</span></div>';
      loadHint(level, i, hid);
    } else if (i === used) {
      item.classList.add('available');
      var btn = document.createElement('button');
      btn.className = 'hint-reveal-btn';
      btn.textContent = '💡 İpucu #' + (i+1) + '\'i Göster';
      (function(lvl) {
        btn.addEventListener('click', function() {
          state.hintsUsed[lvl]++;
          renderHints(lvl);
        });
      })(level);
      item.appendChild(btn);
    } else {
      item.classList.add('locked');
      item.innerHTML = '<div class="hint-item-inner"><span class="hint-num">#' + (i+1) + '</span><span class="hint-locked-text">🔒 Önceki ipucunu kullan</span></div>';
    }

    container.appendChild(item);
  }
}

function loadHint(level, index, elementId) {
  fetch(API + '/hint/' + level + '/' + index)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var el = ge(elementId);
      if (el) el.textContent = data.hint;
    })
    .catch(function() {
      var el = ge(elementId);
      if (el) el.textContent = 'İpucu yüklenemedi.';
    });
}

function renderChat(level) {
  var container = ge('chat-messages');
  if (!container) return;
  container.innerHTML = '';
  var history = state.chatHistories[level];

  if (history.length === 0) {
    appendSystemMessage('[' + CHALLENGES[level].subtitle + '] Bağlantı kuruldu. Hedef hazır.\nBayrağı ele geçirmek için sistemi manipüle et.');
  } else {
    history.forEach(function(m) { appendMessage(m.role, m.content, false); });
  }

  updateMsgCount(level);
  scrollBottom();
}

function appendMessage(role, content, save) {
  if (save === undefined) save = true;
  var level = state.currentLevel;
  var highlighted = escHtml(content).replace(/AltaySec\{[^}]+\}/g, function(match) {
    return '<span class="flag-highlight" title="Tıkla → kopyala">' + match + '</span>';
  });
  var labels = { user: '[ SEN ]', assistant: '[ HEDEF ]', system: '[ SİSTEM ]' };

  var div = document.createElement('div');
  div.className = 'chat-message ' + role;
  div.innerHTML = '<div class="msg-role">' + (labels[role] || '[ ? ]') + '</div><div class="msg-bubble">' + highlighted + '</div>';

  // Flag highlight click
  var spans = div.querySelectorAll('.flag-highlight');
  spans.forEach(function(span) {
    span.addEventListener('click', function() {
      var fi = ge('flag-input');
      if (fi) fi.value = span.textContent;
      showFlagToast();
    });
  });

  ge('chat-messages').appendChild(div);

  if (save && level) {
    state.chatHistories[level].push({ role: role, content: content });
    updateMsgCount(level);
  }

  if (role === 'assistant') {
    var m = content.match(/AltaySec\{[^}]+\}/);
    if (m) {
      var fi2 = ge('flag-input');
      if (fi2) fi2.value = m[0];
      showFlagToast();
    }
  }

  scrollBottom();
}

function appendSystemMessage(text) {
  var div = document.createElement('div');
  div.className = 'chat-message system';
  div.innerHTML = '<div class="msg-role">[ SİSTEM ]</div><div class="msg-bubble">' + escHtml(text) + '</div>';
  var container = ge('chat-messages');
  if (container) container.appendChild(div);
  scrollBottom();
}

function showTyping() {
  var div = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'chat-message assistant typing';
  div.innerHTML = '<div class="msg-role">[ HEDEF ]</div><div class="msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
  var container = ge('chat-messages');
  if (container) container.appendChild(div);
  scrollBottom();
}

function removeTyping() { var el = ge('typing-indicator'); if (el) el.remove(); }
function scrollBottom() { var c = ge('chat-messages'); if (c) c.scrollTop = c.scrollHeight; }
function updateMsgCount(level) {
  var el = ge('chat-msg-count');
  if (el) el.textContent = state.chatHistories[level].length + ' mesaj';
}

// ─── Send Message ────────────────────────────────────────────
function sendMessage() {
  if (state.isLoading) return;

  var textarea = ge('chat-input');
  var message = textarea ? textarea.value.trim() : '';
  if (!message) return;

  var systemPrompt = state.systemPrompts[state.currentLevel];
  if (!systemPrompt) {
    appendSystemMessage('Sistem promptu henüz yüklenmedi. Birkaç saniye bekle ve tekrar dene.');
    return;
  }

  if (textarea) { textarea.value = ''; textarea.style.height = ''; }
  state.isLoading = true;
  var sendBtn = ge('chat-send-btn');
  if (sendBtn) sendBtn.disabled = true;

  appendMessage('user', message);
  showTyping();

  var messages = state.chatHistories[state.currentLevel];
  var promise = state.provider === 'gemini'
    ? callGemini(state.apiKey, systemPrompt, messages)
    : callGroq(state.apiKey, systemPrompt, messages);

  promise.then(function(response) {
    removeTyping();
    appendMessage('assistant', response);
  }).catch(function(err) {
    removeTyping();
    appendSystemMessage('HATA: ' + err.message);
  }).finally(function() {
    state.isLoading = false;
    if (sendBtn) sendBtn.disabled = false;
    if (textarea) textarea.focus();
  });
}

// ─── Flag ────────────────────────────────────────────────────
var toastTimer;
function showFlagToast() {
  var t = ge('flag-toast');
  if (!t) return;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('visible'); }, 3500);
}

function validateFlag() {
  var fi = ge('flag-input');
  var result = ge('flag-result');
  var flag = fi ? fi.value.trim() : '';
  if (!flag || !result) return;

  fetch(API + '/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level: state.currentLevel, flag: flag })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.success) {
      result.textContent = '✓ BAYRAK DOĞRULANDI! Tebrikler!';
      result.className = 'flag-result success';
      if (state.completedLevels.indexOf(state.currentLevel) === -1) {
        state.completedLevels.push(state.currentLevel);
        localStorage.setItem('altaysec_completed', JSON.stringify(state.completedLevels));
      }
      showSuccessModal(state.currentLevel, flag);
    } else {
      result.textContent = '✗ Yanlış bayrak. Tekrar dene!';
      result.className = 'flag-result error';
      if (fi) { fi.classList.add('shake'); setTimeout(function() { fi.classList.remove('shake'); }, 600); }
    }
  }).catch(function(err) {
    if (result) result.textContent = '✗ Doğrulama hatası: ' + err.message;
  });
}

function showSuccessModal(level, flag) {
  var sln = ge('success-level-name');
  var mfd = ge('modal-flag-display');
  var sm = ge('success-modal');
  var contBtn = ge('modal-continue-btn');
  if (sln) sln.textContent = CHALLENGES[level].name;
  if (mfd) mfd.textContent = flag;
  if (contBtn) contBtn.textContent = level === 'zor' ? 'Bitir' : 'Sıradaki Seviye →';
  if (sm) sm.classList.add('visible');
}

// ─── Event Binding ───────────────────────────────────────────
function bindEvents() {
  var chatInput = ge('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    chatInput.addEventListener('input', function() {
      this.style.height = '';
      this.style.height = Math.min(this.scrollHeight, 160) + 'px';
    });
  }

  var sendBtn = ge('chat-send-btn');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  var flagSubmit = ge('flag-submit-btn');
  if (flagSubmit) flagSubmit.addEventListener('click', validateFlag);

  var flagInput = ge('flag-input');
  if (flagInput) flagInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') validateFlag(); });

  var backBtn = ge('back-btn');
  if (backBtn) backBtn.addEventListener('click', function() { renderChallenges(); showScreen('challenges'); });

  var clearBtn = ge('clear-chat-btn');
  if (clearBtn) clearBtn.addEventListener('click', function() {
    state.chatHistories[state.currentLevel] = [];
    renderChat(state.currentLevel);
  });

  var logoutBtn = ge('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function() {
    sessionStorage.clear();
    state.provider = 'gemini'; state.apiKey = null;
    showScreen('setup');
  });

  var modalBack = ge('modal-back-btn');
  if (modalBack) modalBack.addEventListener('click', function() {
    ge('success-modal').classList.remove('visible');
    renderChallenges(); showScreen('challenges');
  });

  var modalContinue = ge('modal-continue-btn');
  if (modalContinue) modalContinue.addEventListener('click', function() {
    ge('success-modal').classList.remove('visible');
    var levels = ['kolay', 'orta', 'zor'];
    var currIdx = levels.indexOf(state.currentLevel);
    if (currIdx > -1 && currIdx < levels.length - 1) {
      openLab(levels[currIdx + 1]);
    } else {
      renderChallenges(); showScreen('challenges');
    }
  });

  var modal = ge('success-modal');
  if (modal) modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.classList.remove('visible');
  });
}

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  bindEvents();
  initSetup();
});
