/**
 * AltaySec Phishing Simülatörü
 * simulator.js — Senaryo Motoru
 */

'use strict';

const activeScenarios = new Set();

/**
 * Belirli bir senaryoyu başlatır
 */
window.startScenario = function (scenarioId) {
  const selectEl = document.getElementById('scenarioSelect');
  const introEl  = document.getElementById('sim-intro');
  const simEl    = document.getElementById('sim-' + scenarioId);

  if (!simEl) return;

  // Seçim ekranını gizle
  if (selectEl) selectEl.style.display = 'none';
  if (introEl)  introEl.style.display  = 'none';

  // Diğer aktif containerları kapat
  document.querySelectorAll('.sim-container.active').forEach(c => {
    c.classList.remove('active');
  });

  // Hedef senaryoyu aç
  simEl.classList.add('active');
  simEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  activeScenarios.add(scenarioId);

  // Önceki cevap + sonucu temizle
  resetScenario(scenarioId);
};

/**
 * Senaryo seçim ekranına geri döner
 */
window.backToSelect = function () {
  const selectEl = document.getElementById('scenarioSelect');
  const introEl  = document.getElementById('sim-intro');

  document.querySelectorAll('.sim-container.active').forEach(c => {
    c.classList.remove('active');
  });

  if (selectEl) { selectEl.style.display = ''; }
  if (introEl)  { introEl.style.display  = ''; }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Kullanıcı cevabını işler
 * @param {string} scenarioId - Senaryo kimliği
 * @param {string} choice - 'phishing' | 'safe' | 'clicked-link'
 */
window.handleSimChoice = function (scenarioId, choice) {
  const resultEl = document.getElementById(scenarioId + '-result');
  const step2El  = document.getElementById(scenarioId.replace('sim-', '') + '-step2') ||
                   document.getElementById(scenarioId + '-step2');

  // Tüm senaryolar phishingdir ancak farklı feedback veriyoruz
  if (choice === 'clicked-link') {
    showLinkTrap(scenarioId);
    return;
  }

  const isPhishing = choice === 'phishing';

  // Butonları devre dışı bırak
  disableActionButtons(scenarioId, choice);

  // Adım göstergesini güncelle
  const step2 = document.getElementById(getStep2Id(scenarioId));
  if (step2) step2.classList.add('done');

  // Sonuç panelini göster (tüm senaryolar gerçek phishing olduğu için)
  if (resultEl) {
    resultEl.classList.add('show');

    // Doğru cevap ise header'ı güncelle
    if (!isPhishing) {
      const header = resultEl.querySelector('.sim-result-header div:first-child');
      if (header) {
        header.style.color = 'var(--amber)';
        header.textContent = '😬 Neredeyse doğruydu, ama hayır — bu bir Phishing!';
      }
    }

    // Smooth scroll
    setTimeout(() => {
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
};

/**
 * Kullanıcı sahte linke tıkladığında göster
 */
function showLinkTrap(scenarioId) {
  // Anlık modal göster
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9000;
    background: rgba(0,0,0,0.95);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="background:#111; border:1px solid rgba(255,59,48,0.4); border-radius:24px; padding:48px 40px; max-width:520px; width:100%; text-align:center; box-shadow:0 0 80px rgba(255,59,48,0.2); animation:slideUp 0.4s ease;">
      <div style="font-size:4rem; margin-bottom:24px;" aria-hidden="true">🎣</div>
      <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,59,48,0.1); border:1px solid rgba(255,59,48,0.2); border-radius:999px; padding:6px 16px; font-size:0.75rem; font-weight:700; color:#ff6b63; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:24px;">
        <span style="width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 2s ease infinite;"></span>
        Tuzağa Düştünüz!
      </div>
      <h2 style="font-size:1.6rem; font-weight:900; letter-spacing:-0.03em; margin-bottom:16px; color:#fff;">
        Linke tıkladınız.
      </h2>
      <p style="color:#a0a0a8; font-size:0.95rem; line-height:1.7; margin-bottom:32px;">
        Gerçek bir saldırıda bu tıklama sizi sahte bir giriş sayfasına götürür ve kimlik bilgileriniz çalınırdı. Ama bu güvenli bir simülasyon — asıl önemli olan <strong style="color:#fff;">şimdi öğrenmek</strong>.
      </p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <button 
          onclick="this.closest('[style*=fixed]').remove(); handleSimChoice('${scenarioId}', 'phishing');"
          style="background:var(--red,#FF3B30); color:#fff; border:none; padding:14px 28px; border-radius:12px; font-weight:700; font-size:0.9rem; cursor:pointer; font-family:inherit; transition:opacity 0.2s;"
          onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
          Phishing Göstergelerini Öğren →
        </button>
        <button 
          onclick="this.closest('[style*=fixed]').remove(); backToSelect();"
          style="background:transparent; color:#a0a0a8; border:1px solid rgba(255,255,255,0.1); padding:14px 28px; border-radius:12px; font-weight:600; font-size:0.9rem; cursor:pointer; font-family:inherit; transition:all 0.2s;"
          onmouseover="this.style.borderColor='rgba(255,255,255,0.3)'; this.style.color='#fff';"
          onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='#a0a0a8';">
          Diğer Senaryolara Dön
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });
}

/**
 * Aksiyon butonlarını devre dışı bırakır ve seçilen durumu gösterir
 */
function disableActionButtons(scenarioId, choice) {
  const phishingBtn = document.querySelector(`#sim-${scenarioId} .sim-action-phishing`);
  const safeBtn     = document.querySelector(`#sim-${scenarioId} .sim-action-safe`);

  [phishingBtn, safeBtn].forEach(btn => {
    if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'default'; }
  });

  // Seçilen butona stil ver
  if (choice === 'phishing' && phishingBtn) {
    phishingBtn.style.opacity = '1';
    phishingBtn.style.borderColor = 'var(--red)';
    phishingBtn.style.background = 'rgba(255,59,48,0.2)';
  } else if (choice === 'safe' && safeBtn) {
    safeBtn.style.opacity = '1';
  }
}

/**
 * Step 2 element ID'sini döner
 */
function getStep2Id(scenarioId) {
  const map = {
    email: 'email-step2',
    instagram: 'insta-step2',
    sms: 'sms-step2',
    whatsapp: 'wp-step2'
  };
  return map[scenarioId] || '';
}

/**
 * Senaryoyu başlangıç durumuna sıfırlar
 */
function resetScenario(scenarioId) {
  const resultEl = document.getElementById(scenarioId + '-result');
  if (resultEl) resultEl.classList.remove('show');

  const step2 = document.getElementById(getStep2Id(scenarioId));
  if (step2) { step2.classList.remove('done'); step2.classList.add('active'); }

  // Butonları etkinleştir
  const phishingBtn = document.querySelector(`#sim-${scenarioId} .sim-action-phishing`);
  const safeBtn     = document.querySelector(`#sim-${scenarioId} .sim-action-safe`);

  [phishingBtn, safeBtn].forEach(btn => {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.style.borderColor = '';
      btn.style.background = '';
    }
  });

  // Header rengini sıfırla
  const header = resultEl ? resultEl.querySelector('.sim-result-header div:first-child') : null;
  if (header) {
    header.style.color = '';
    header.textContent = 'Evet, bu bir Phishing!';
  }
}

// URL'den senaryo açmak için (deep link desteği)
(function checkDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const scenario = params.get('senaryo');
  if (scenario && ['email', 'instagram', 'sms', 'whatsapp'].includes(scenario)) {
    window.startScenario(scenario);
  }
})();
