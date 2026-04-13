/**
 * AltaySec Phishing Farkındalık Testi
 * quiz.js — 10 Soruluk Quiz Motoru
 */

'use strict';

/* ─────────────────────────────────────────
   SORU VERİTABANI
───────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 1,
    type: 'email',
    question: 'Aşağıdaki e-postayı inceleyin. Bu bir phishing maili mi?',
    preview: `
      <div style="background:#111; border-radius:12px; overflow:hidden; border:1px solid #222;">
        <div style="background:#0d0d0d; padding:10px 16px; display:flex; align-items:center; gap:8px; border-bottom:1px solid #222;">
          <div style="display:flex;gap:5px;"><div style="width:10px;height:10px;border-radius:50%;background:#ff5f57;"></div><div style="width:10px;height:10px;border-radius:50%;background:#febc2e;"></div><div style="width:10px;height:10px;border-radius:50%;background:#28c840;"></div></div>
          <span style="font-family:monospace;font-size:0.75rem;color:#666;">Gelen Kutusu</span>
        </div>
        <div style="padding:16px 20px;">
          <div style="font-weight:700;margin-bottom:8px;">[URGENT] Your Apple ID has been suspended</div>
          <div style="font-size:0.78rem;color:#888;margin-bottom:12px;font-family:monospace;">Kimden: noreply@apple-id-verify.com</div>
          <div style="font-size:0.875rem;line-height:1.7;color:#ccc;">
            Dear Customer,<br>Your Apple ID has been suspended due to unusual activity. 
            To restore access, please verify your information within 24 hours.<br><br>
            <span style="background:rgba(255,59,48,0.15);color:#ff6b63;padding:8px 20px;border-radius:6px;display:inline-block;font-weight:700;">Verify Now</span>
          </div>
        </div>
      </div>`,
    answer: 'phishing',
    feedback: {
      correct: '✅ Doğru! Gönderen domain "apple-id-verify.com" — Apple\'ın resmi domaini "apple.com"dur. Ayrıca "Dear Customer" genel hitap ve "24 hours" acele ifadesi klasik phishing göstergeleridir.',
      wrong: '❌ Bu bir phishing! "apple-id-verify.com" domaini Apple\'a ait değil. Apple her zaman "apple.com" domainden mail gönderir. Genel hitap ("Dear Customer") ve yapay acelecilik de şüphe işaretidir.'
    }
  },
  {
    id: 2,
    type: 'sms',
    question: 'Bu SMS mesajını inceleyin. Phishing mi, yoksa güvenli mi?',
    preview: `
      <div style="max-width:340px;margin:0 auto;background:#1c1c1e;border-radius:16px;overflow:hidden;border:1px solid #333;">
        <div style="background:#2c2c2e;padding:12px;text-align:center;font-size:0.85rem;font-weight:600;border-bottom:1px solid #333;">GARANTI</div>
        <div style="padding:16px;">
          <div style="font-size:0.75rem;color:#888;text-align:center;margin-bottom:8px;">GARANTI</div>
          <div style="background:#1e3a5f;border-radius:16px 16px 4px 16px;padding:12px 14px;margin-left:auto;max-width:90%;font-size:0.85rem;line-height:1.6;color:#fff;">
            Garanti Bankası: Kartınız 12.04.2026 tarihinde 4.850 TL tutarında işlemde kullanıldı. 
            Siz değilseniz 0212 318 18 18 numaralı hattı arayın.
          </div>
        </div>
      </div>`,
    answer: 'safe',
    feedback: {
      correct: '✅ Doğru! Bu güvenli bir SMS\'tir. Dikkat edin: link içermiyor, sadece resmi telefon numarası var (444 ya da 0212 Garanti numarası), acelecilik yok. Banka bildirimi SMS\'lerinde link olmaz.',
      wrong: '❌ Bu aslında güvenli bir bildirim! İçinde link yok — sadece resmi bir telefon numarası var. Phishing SMS\'leri genellikle link içerir ve acil eylem ister.'
    }
  },
  {
    id: 3,
    type: 'dm',
    question: 'Bu Instagram DM\'ini görüyorsunuz. Phishing mi?',
    preview: `
      <div style="max-width:360px;margin:0 auto;background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #333;">
        <div style="background:linear-gradient(135deg,#1a0830,#0d0010);padding:12px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #222;">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#833ab4,#fd1d1d);display:flex;align-items:center;justify-content:center;font-size:1rem;">📸</div>
          <div><div style="font-size:0.85rem;font-weight:700;">natgeo</div><div style="font-size:0.72rem;color:rgba(255,255,255,0.5);">✓ Doğrulanmış · 19,2M takipçi</div></div>
        </div>
        <div style="padding:16px;">
          <div style="background:#222;border-radius:14px 14px 14px 4px;padding:12px 14px;font-size:0.85rem;line-height:1.6;color:#ccc;">
            Merhaba! 📸 Fotoğrafınız National Geographic editörleri tarafından seçildi. 
            Profilinizi onaylatmak için lütfen aşağıdaki linki ziyaret edin.
            <br><br><span style="color:#4fc3f7;">ng-photo-award.com/onayla</span>
          </div>
        </div>
      </div>`,
    answer: 'phishing',
    feedback: {
      correct: '✅ Doğru! "ng-photo-award.com" National Geographic\'in resmi domaini değil. Resmi domain "nationalgeographic.com"dur. Büyük markalar ödül bildirimi için DM göndermez, link içeriyorsa kesinlikle şüphelidir.',
      wrong: '❌ Bu bir phishing! "ng-photo-award.com" sahte bir domain. National Geographic resmi olarak DM ile ödül bildirimi yapmaz. Resmi domain "nationalgeographic.com" olurdu.'
    }
  },
  {
    id: 4,
    type: 'email',
    question: 'Bu e-postayı değerlendirin:',
    preview: `
      <div style="background:#111; border-radius:12px; overflow:hidden; border:1px solid #222;">
        <div style="background:#0d0d0d; padding:10px 16px; border-bottom:1px solid #222;">
          <span style="font-family:monospace;font-size:0.75rem;color:#666;">Gelen Kutusu</span>
        </div>
        <div style="padding:16px 20px;">
          <div style="font-weight:700;margin-bottom:8px;">Siparişiniz Yola Çıktı 🚚 — Kargo Takip No: TR48291</div>
          <div style="font-size:0.78rem;color:#888;margin-bottom:12px;font-family:monospace;">Kimden: bildirim@trendyol.com</div>
          <div style="font-size:0.875rem;line-height:1.7;color:#ccc;">
            Merhaba Ahmet,<br><br>
            Siparişiniz (No: #8472918) kargoya verilmiştir. İstanbul'a tahmini varış: 14 Nisan 2026.<br><br>
            Kargo takibi: trendyol.com/siparislerim üzerinden yapabilirsiniz.
          </div>
        </div>
      </div>`,
    answer: 'safe',
    feedback: {
      correct: '✅ Doğru! Bu güvenli. "trendyol.com" domaini doğru, isim ile hitap edilmiş (Ahmet), link trendyol.com\'a yönlendiriyor ve acelecilik yok. İsim bazlı hitap ve doğru domain önemli güven işaretleridir.',
      wrong: '❌ Bu aslında güvenli bir e-posta! "bildirim@trendyol.com" resmi domain, isim (Ahmet) ile hitap edilmiş, ve link trendyol.com\'da. Phishing olmadığının işaretleri bunlar.'
    }
  },
  {
    id: 5,
    type: 'sms',
    question: 'Bu SMS\'i inceleyerek karar verin:',
    preview: `
      <div style="max-width:340px;margin:0 auto;background:#1c1c1e;border-radius:16px;overflow:hidden;border:1px solid #333;">
        <div style="background:#2c2c2e;padding:12px;text-align:center;font-size:0.85rem;font-weight:600;border-bottom:1px solid #333;">PTT KARGO</div>
        <div style="padding:16px;">
          <div style="font-size:0.75rem;color:#888;text-align:center;margin-bottom:8px;">PTT KARGO</div>
          <div style="background:#1e3a5f;border-radius:16px 16px 4px 16px;padding:12px 14px;margin-left:auto;max-width:90%;font-size:0.85rem;line-height:1.6;color:#fff;">
            Kargonum.com: Paketiniz gümrükte beklemektedir. 
            18 TL ödemeniz için: bit.ly/ptt-gumruk-odeme 
            Ödeme yapılmazsa paket iade edilecektir.
          </div>
        </div>
      </div>`,
    answer: 'phishing',
    feedback: {
      correct: '✅ Doğru! Bu bir phishing SMS\'tir ("smishing"). Gönderen "kargonum.com" — PTT\'nin resmi domaini "ptt.gov.tr"dir. Ayrıca kısaltılmış link (bit.ly) şüpheli, PTT resmi bildirimlerde bit.ly kullanmaz.',
      wrong: '❌ Bu bir phishing! "kargonum.com" PTT\'ye ait değil. PTT\'nin domaini "ptt.gov.tr"dir. Kısaltılmış link (bit.ly) kullanımı ve ödeme talebi klasik smishing göstergesidir.'
    }
  },
  {
    id: 6,
    type: 'whatsapp',
    question: 'Bu WhatsApp mesajını değerlendirin:',
    preview: `
      <div style="max-width:360px;margin:0 auto;background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid #333;">
        <div style="background:#111;padding:12px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #222;">
          <div style="width:36px;height:36px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;font-size:1rem;">👤</div>
          <div><div style="font-size:0.85rem;font-weight:700;">+90 532 841 ** **</div><div style="font-size:0.72rem;color:rgba(255,255,255,0.4);">Bilinmeyen numara</div></div>
        </div>
        <div style="padding:16px;background:#0d1117;">
          <div style="background:#1f2d1f;border-radius:14px 14px 14px 4px;padding:12px 14px;font-size:0.85rem;line-height:1.6;color:#ccc;">
            Merhaba! Annen yeni telefon aldı, bu numara. Eski numarası artık geçerli değil. 
            Kaydına günceller misin? 😊
          </div>
          <div style="font-size:0.7rem;color:#555;margin-top:4px;">14:22 ✓</div>
        </div>
      </div>`,
    answer: 'phishing',
    feedback: {
      correct: '✅ Doğru! Bu tipik bir "aile üyesi" sosyal mühendislik taktiğidir. Bilinmeyen numara, kimlik doğrulaması yok. Bu tür mesajlar daha sonra para/bilgi talep etmek için zemin hazırlar. Annenizi arayarak doğrulayın.',
      wrong: '❌ Bu sosyal mühendislik içeren bir phishing girişimidir! Bilinmeyen bir numara kendini yakınınız olarak tanıtıyor. Sonraki mesajlarda para veya kişisel bilgi talep edilebilir. Çağrı veya bilinen kanaldan doğrulayın.'
    }
  },
  {
    id: 7,
    type: 'email',
    question: 'Aşağıdaki iş e-postasını inceleyin:',
    preview: `
      <div style="background:#111; border-radius:12px; overflow:hidden; border:1px solid #222;">
        <div style="background:#0d0d0d; padding:10px 16px; border-bottom:1px solid #222;">
          <span style="font-family:monospace;font-size:0.75rem;color:#666;">Gelen Kutusu — Şirket Maili</span>
        </div>
        <div style="padding:16px 20px;">
          <div style="font-weight:700;margin-bottom:8px;">Re: Proje teklifi — toplantı saati</div>
          <div style="font-size:0.78rem;color:#888;margin-bottom:12px;font-family:monospace;">Kimden: mehmet.yilmaz@sirketiniz.com</div>
          <div style="font-size:0.875rem;line-height:1.7;color:#ccc;">
            Merhaba,<br><br>Toplantıyı Çarşamba 14:00\'a alalım. Google Meet linki: meet.google.com/abc-defg-hij<br><br>Görüşmek üzere,<br>Mehmet Yılmaz<br>Proje Müdürü
          </div>
        </div>
      </div>`,
    answer: 'safe',
    feedback: {
      correct: '✅ Doğru! Güvenli görünüyor. Domain şirketin kendi domaini, Google Meet linki resmi "meet.google.com" domaini, acelecilik yok, link içeriği anlamlı. Bu tür mailler genellikle güvenlidir.',
      wrong: '❌ Bu aslında güvenli görünen bir mail! Tüm domain\'ler doğru (şirket domaini, meet.google.com), içerik mantıklı, acelecilik yok. Phishing belirtisi taşımıyor.'
    }
  },
  {
    id: 8,
    type: 'email',
    question: 'Bu e-postayı dikkatli inceleyin:',
    preview: `
      <div style="background:#111; border-radius:12px; overflow:hidden; border:1px solid #222;">
        <div style="background:#0d0d0d; padding:10px 16px; border-bottom:1px solid #222;">
          <span style="font-family:monospace;font-size:0.75rem;color:#666;">Gelen Kutusu</span>
        </div>
        <div style="padding:16px 20px;">
          <div style="font-weight:700;margin-bottom:8px;">Hesabınızda Oturum Açıldı — Google Güvenlik Bildirimi</div>
          <div style="font-size:0.78rem;color:#888;margin-bottom:12px;font-family:monospace;">Kimden: security@goog1e.com</div>
          <div style="font-size:0.875rem;line-height:1.7;color:#ccc;">
            Hesabınıza yeni bir cihazdan giriş yapıldı.<br>
            Cihaz: iPhone 15, Ankara TR<br><br>
            Siz değilseniz hesabınızı hemen güvenli hale getirin:
            <span style="background:rgba(66,133,244,0.15);color:#64b5f6;padding:6px 16px;border-radius:6px;display:inline-block;font-weight:600;margin-top:8px;">Güvenliği Sağla</span>
          </div>
        </div>
      </div>`,
    answer: 'phishing',
    feedback: {
      correct: '✅ Doğru! "goog1e.com" — dikkat: Google değil, "l" harfi yerine "1" rakamı kullanılmış. Bu "typosquatting" denilen bir taktiktir. Google\'dan gelen mailler yalnızca "google.com" domainden gelir.',
      wrong: '❌ Bu bir phishing! "goog1e.com" — Google\'a benziyor ama değil. "l" yerine "1" kullanılmış. Bu "typosquatting" denilen bir taktik. Google\'ın maili "google.com"dan gelir.'
    }
  },
  {
    id: 9,
    type: 'sms',
    question: 'Bu SMS phishing mi?',
    preview: `
      <div style="max-width:340px;margin:0 auto;background:#1c1c1e;border-radius:16px;overflow:hidden;border:1px solid #333;">
        <div style="background:#2c2c2e;padding:12px;text-align:center;font-size:0.85rem;font-weight:600;border-bottom:1px solid #333;">e-Devlet</div>
        <div style="padding:16px;">
          <div style="font-size:0.75rem;color:#888;text-align:center;margin-bottom:8px;">e-Devlet</div>
          <div style="background:#1e3a5f;border-radius:16px 16px 4px 16px;padding:12px 14px;margin-left:auto;max-width:90%;font-size:0.85rem;line-height:1.6;color:#fff;">
            e-Devlet: Giriş işleminiz için doğrulama kodunuz: <strong>847293</strong>. Bu kodu kimseyle paylaşmayın. Kod 3 dakika geçerlidir.
          </div>
        </div>
      </div>`,
    answer: 'safe',
    feedback: {
      correct: '✅ Doğru! Bu güvenli bir OTP SMSidir. Sadece kod içeriyor, link yok, "kimseyle paylaşmayın" uyarısı var (gerçek sistemler bunu yazar), 3 dakika geçerlilik süresi makul. Şüphe işareti taşımıyor.',
      wrong: '❌ Bu aslında güvenli bir OTP SMS\'idir! İçinde link yok, sadece kod var. "Kimseyle paylaşmayın" uyarısı gerçek sistemlerin yazdığı bir uyarıdır. Kısa geçerlilik süresi de güvenli bir işaret.'
    }
  },
  {
    id: 10,
    type: 'email',
    question: 'Son soru! Bu e-postayı değerlendirin:',
    preview: `
      <div style="background:#111; border-radius:12px; overflow:hidden; border:1px solid #222;">
        <div style="background:#0d0d0d; padding:10px 16px; border-bottom:1px solid #222;">
          <span style="font-family:monospace;font-size:0.75rem;color:#666;">Gelen Kutusu</span>
        </div>
        <div style="padding:16px 20px;">
          <div style="font-weight:700;margin-bottom:8px;">Kazandınız! 50.000 TL Çekim Hakkı</div>
          <div style="font-size:0.78rem;color:#888;margin-bottom:12px;font-family:monospace;">Kimden: cekilissonuclari@milli-piyango-idaresi.com</div>
          <div style="font-size:0.875rem;line-height:1.7;color:#ccc;">
            Sayın Kazanan,<br><br>
            Bu yıl düzenlenen çekilişimizde biletiniz büyük ikramiyeyi kazanmıştır!
            Ödülünüzü almak için 48 saat içinde kimlik bilgilerinizi ve banka hesap numaranızı belirtin.<br><br>
            <span style="color:#f59e0b;font-weight:700;">⚠️ Yanıt vermezseniz ödülünüz iptal edilecektir!</span>
          </div>
        </div>
      </div>`,
    answer: 'phishing',
    feedback: {
      correct: '✅ Doğru! Klasik phishing: "milli-piyango-idaresi.com" sahte domain (gerçek: milli-piyango.gov.tr), kimlik + banka bilgisi talep ediyor, 48 saat baskısı, genel hitap ("Sayın Kazanan"), katılmadığınız çekilişten kazanmak imkansız.',
      wrong: '❌ Bu bir phishing! "milli-piyango-idaresi.com" sahte. Gerçek Milli Piyango "milli-piyango.gov.tr" kullanır (.gov.tr). Kimlik + banka bilgisi talep etmesi, 48 saat baskısı ve katılmadığınız çekilişten kazanma ifadesi klasik dolandırıcılık işaretidir.'
    }
  }
];

/* ─────────────────────────────────────────
   QUIZ STATE
───────────────────────────────────────── */
let currentQ = 0;
let score = 0;
let answered = false;

/* ─────────────────────────────────────────
   QUIZ BAŞLATMA
───────────────────────────────────────── */
window.startQuiz = function () {
  currentQ = 0;
  score = 0;
  answered = false;

  document.getElementById('quiz-intro').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';

  renderQuestion();
};

/* ─────────────────────────────────────────
   SORU RENDER
───────────────────────────────────────── */
function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const container = document.getElementById('quiz-question-container');
  const progressText = document.getElementById('quiz-progress-text');
  const scoreLive = document.getElementById('quiz-score-live');
  const progressFill = document.getElementById('quizProgressFill');
  const progressBar = document.querySelector('.quiz-progress-bar');
  const nextBtn = document.getElementById('nextBtn');

  // Progress
  progressText.textContent = `Soru ${currentQ + 1} / ${QUESTIONS.length}`;
  scoreLive.textContent = `✓ ${score} doğru`;
  const pct = (currentQ / QUESTIONS.length) * 100;
  progressFill.style.width = pct + '%';
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', currentQ);
  }

  // Next button gizle
  nextBtn.style.display = 'none';
  nextBtn.disabled = true;

  answered = false;

  // Soru HTML
  const typeIcon = { email:'📧', sms:'💬', dm:'📱', whatsapp:'📱' };

  container.innerHTML = `
    <div class="quiz-card" id="qcard-${q.id}">
      <div class="quiz-q-header">
        <div class="quiz-q-number" aria-hidden="true">${q.id}</div>
        <div class="quiz-q-text">${q.question}</div>
        <span class="badge badge-muted" aria-label="${q.type} türü">${typeIcon[q.type] || '📋'}</span>
      </div>
      <div class="quiz-preview">
        ${q.preview}
      </div>
      <div class="quiz-options">
        <button
          class="quiz-opt phishing-opt"
          onclick="answer('phishing')"
          id="opt-phishing"
          aria-label="Phishing seç">
          🎣 Phishing!
        </button>
        <button
          class="quiz-opt safe-opt"
          onclick="answer('safe')"
          id="opt-safe"
          aria-label="Güvenli seç">
          ✅ Güvenli
        </button>
      </div>
      <div class="quiz-feedback" id="quiz-feedback-${q.id}"></div>
    </div>
  `;
}

/* ─────────────────────────────────────────
   CEVAP İŞLEME
───────────────────────────────────────── */
window.answer = function (choice) {
  if (answered) return;
  answered = true;

  const q = QUESTIONS[currentQ];
  const isCorrect = choice === q.answer;

  if (isCorrect) score++;

  // Butonları kilitle ve renklendir
  const phishingBtn = document.getElementById('opt-phishing');
  const safeBtn = document.getElementById('opt-safe');

  [phishingBtn, safeBtn].forEach(btn => {
    if (btn) btn.disabled = true;
  });

  const correctBtn = q.answer === 'phishing' ? phishingBtn : safeBtn;
  const wrongBtn   = q.answer === 'phishing' ? safeBtn : phishingBtn;

  if (correctBtn) correctBtn.classList.add('correct');
  if (!isCorrect && wrongBtn) wrongBtn.classList.add('wrong');
  if (!isCorrect && choice === 'phishing' && phishingBtn) phishingBtn.classList.add('wrong');
  if (!isCorrect && choice === 'safe' && safeBtn) safeBtn.classList.add('wrong');

  // Feedback göster
  const feedbackEl = document.getElementById(`quiz-feedback-${q.id}`);
  if (feedbackEl) {
    feedbackEl.className = `quiz-feedback show ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
    feedbackEl.innerHTML = `<strong>${isCorrect ? '✅ Doğru!' : '❌ Yanlış!'}</strong><br>${isCorrect ? q.feedback.correct : q.feedback.wrong}`;
  }

  // Canlı skor güncelle
  const scoreLive = document.getElementById('quiz-score-live');
  if (scoreLive) {
    scoreLive.textContent = `✓ ${score} doğru`;
    scoreLive.style.color = score > currentQ / 2 ? 'var(--green)' : 'var(--amber)';
  }

  // Next button göster
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.style.display = 'inline-flex';
    nextBtn.disabled = false;
    if (currentQ === QUESTIONS.length - 1) {
      nextBtn.textContent = '📊 Sonuçları Gör →';
    }
  }
};

/* ─────────────────────────────────────────
   SONRAKİ SORU
───────────────────────────────────────── */
window.nextQuestion = function () {
  currentQ++;
  if (currentQ >= QUESTIONS.length) {
    showResult();
  } else {
    renderQuestion();
    window.scrollTo({ top: document.getElementById('quiz-area').offsetTop - 80, behavior: 'smooth' });
  }
};

/* ─────────────────────────────────────────
   SONUÇ EKRANI
───────────────────────────────────────── */
function showResult() {
  document.getElementById('quiz-area').style.display = 'none';
  const resultEl = document.getElementById('quiz-result');
  resultEl.style.display = 'block';

  // Progress full
  const progressFill = document.getElementById('quizProgressFill');
  if (progressFill) progressFill.style.width = '100%';

  const pct = Math.round((score / QUESTIONS.length) * 100);

  // Animate score
  const scoreNumEl = document.getElementById('resultScoreNum');
  let count = 0;
  const interval = setInterval(() => {
    count++;
    scoreNumEl.textContent = count;
    if (count >= score) clearInterval(interval);
  }, 120);

  // Badge + Title + Description
  const badgeEl   = document.getElementById('resultBadge');
  const titleEl   = document.getElementById('resultTitle');
  const descEl    = document.getElementById('resultDesc');
  const ringEl    = document.getElementById('scoreRing');
  const bgEl      = document.getElementById('result-bg-glow');

  let level, badgeClass, color, title, desc;

  if (score <= 4) {
    level = '🔴 Tehlikede';
    badgeClass = 'badge-red';
    color = 'var(--red)';
    title = 'Risk Altındasınız';
    desc = `${score}/10 soru doğru. Phishing saldırılarını tanımak için daha fazla pratik yapmalısınız. Simülatörümüzdeki senaryolar ve blog yazılarımız size yardımcı olacak. Hemen başlayın!`;
  } else if (score <= 7) {
    level = '🟡 Dikkatli Olun';
    badgeClass = 'badge-amber';
    color = 'var(--amber)';
    title = 'İyi Ama Yeterli Değil';
    desc = `${score}/10 soru doğru. Temel farkındalığı geliştirdiniz ancak bazı gelişmiş saldırı türlerinde tuzağa düşebilirsiniz. Blog yazılarımızla bilginizi pekiştirin.`;
  } else {
    level = '🟢 Farkındasınız!';
    badgeClass = 'badge-green';
    color = 'var(--green)';
    title = 'Tebrikler!';
    desc = `${score}/10 — Mükemmel! Phishing saldırılarını başarıyla tanıyabiliyorsunuz. Bu farkındalığı çevrenizle de paylaşın — bir paylaşım binlerce kişiyi koruyabilir.`;
  }

  badgeEl.className = `badge ${badgeClass}`;
  badgeEl.style.margin = '0 auto var(--space-md)';
  badgeEl.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;margin-right:4px;"></span>${level}`;

  titleEl.textContent = title;
  descEl.textContent = desc;
  scoreNumEl.style.color = color;
  ringEl.style.boxShadow = `0 0 40px ${color}33`;
  bgEl.style.background = `radial-gradient(ellipse at center top, ${color}10, transparent 60%)`;

  // Ring border
  ringEl.style.setProperty('--ring-color', color);
  const style = document.createElement('style');
  style.textContent = `#scoreRing::before { border-color: ${color}55 !important; }`;
  document.head.appendChild(style);

  // Share text
  const shareEl = document.getElementById('shareText');
  if (shareEl) {
    shareEl.textContent = `AltaySec Phishing Farkındalık Testi sonucum:\n${level} — ${score}/10 🎯\n\nSen de test et: phishing.altaysec.com.tr/test.html\n#AltaySec #SiberGüvenlik #PhishingFarkındalık`;
  }

  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─────────────────────────────────────────
   PAYLAŞIM METNİ KOPYALA
───────────────────────────────────────── */
window.copyShareText = function () {
  const shareEl = document.getElementById('shareText');
  if (!shareEl) return;

  const text = shareEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const after = shareEl.getAttribute('data-original-after') || '📋 Kopyala';
    shareEl.style.setProperty('--after-content', '"✅ Kopyalandı!"');
    shareEl.style.borderColor = 'var(--green)';

    // Override ::after with a temp element
    const copied = document.createElement('span');
    copied.style.cssText = `position:absolute;top:12px;right:12px;font-size:0.75rem;color:var(--green);font-family:Inter,sans-serif;`;
    copied.textContent = '✅ Kopyalandı!';
    shareEl.style.position = 'relative';
    shareEl.appendChild(copied);

    setTimeout(() => {
      copied.remove();
      shareEl.style.borderColor = '';
    }, 2000);
  }).catch(() => {
    // Fallback
    const range = document.createRange();
    range.selectNode(shareEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
};

/* ─────────────────────────────────────────
   QUIZ YENİDEN BAŞLAT
───────────────────────────────────────── */
window.restartQuiz = function () {
  startQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
