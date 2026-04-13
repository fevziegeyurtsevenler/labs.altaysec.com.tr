/**
 * AltaySec Phishing Farkındalık Platformu
 * main.js — Global Logic: Nav, Counters, Trap, Scroll Animations
 */

'use strict';

// ─────────────────────────────────────────
// 1. NAVBAR
// ─────────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (!navbar) return;

  // Scroll effect
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on nav link click (mobile)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();


// ─────────────────────────────────────────
// 2. READING PROGRESS BAR
// ─────────────────────────────────────────
(function initReadingProgress() {
  const bar = document.getElementById('readingProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(progress, 100) + '%';
  }, { passive: true });
})();


// ─────────────────────────────────────────
// 3. PHISHING TRAP BANNER
// ─────────────────────────────────────────
window.showTrapReveal = function () {
  const banner = document.getElementById('trapBanner');
  const reveal = document.getElementById('trapReveal');

  if (banner) {
    banner.style.animation = 'none';
    banner.style.opacity = '0';
    banner.style.transition = 'opacity 0.2s';
    setTimeout(() => { banner.style.display = 'none'; }, 200);
  }

  if (reveal) {
    reveal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    reveal.focus();
  }
};

window.closeTrap = function () {
  const banner = document.getElementById('trapBanner');
  if (banner) {
    banner.style.opacity = '0';
    banner.style.transition = 'opacity 0.3s, transform 0.3s';
    banner.style.transform = 'translateY(-100%)';
    setTimeout(() => { banner.style.display = 'none'; }, 300);
  }
};

window.closeTrapReveal = function () {
  const reveal = document.getElementById('trapReveal');
  if (reveal) {
    reveal.style.opacity = '0';
    reveal.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      reveal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
};

// Close reveal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const reveal = document.getElementById('trapReveal');
    if (reveal && reveal.style.display !== 'none') {
      window.closeTrapReveal();
    }
  }
});


// ─────────────────────────────────────────
// 4. ANIMATED STAT COUNTERS
// ─────────────────────────────────────────
const STATS = [
  { id: 'stat1', target: 11, suffix: '', prefix: '', label: 'saniye' },
  { id: 'stat2', target: 82, suffix: '%', prefix: '', label: 'insan hatası' },
  { id: 'stat3', target: 3.4, suffix: 'B', prefix: '', label: 'günlük phishing' },
  { id: 'stat4', target: 97, suffix: '%', prefix: '', label: 'ayırt edemiyor' },
];

function animateCounter(el, target, suffix, duration = 2000, isDecimal = false) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
  };
  requestAnimationFrame(update);
}

function initCounters() {
  STATS.forEach(({ id, target, suffix }) => {
    const el = document.getElementById(id);
    if (el) {
      const isDecimal = !Number.isInteger(target);
      animateCounter(el, target, suffix, 2200, isDecimal);
    }
  });
}


// ─────────────────────────────────────────
// 5. SCROLL REVEAL (Intersection Observer)
// ─────────────────────────────────────────
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  let statsTriggered = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });

    // Trigger counters when stats section is visible
    if (!statsTriggered) {
      const statEl = document.getElementById('stat1');
      if (statEl) {
        const statObs = new IntersectionObserver((statEntries) => {
          if (statEntries[0].isIntersecting && !statsTriggered) {
            statsTriggered = true;
            initCounters();
            statObs.disconnect();
          }
        }, { threshold: 0.5 });
        statObs.observe(statEl.closest('section') || statEl);
      }
    }
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
})();


// ─────────────────────────────────────────
// 6. FAQ ACCORDION
// ─────────────────────────────────────────
window.toggleFaq = function (btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Close all others
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    }
  });

  // Toggle current
  item.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', (!isOpen).toString());
};


// ─────────────────────────────────────────
// 7. SMOOTH ANCHOR SCROLLING
// ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


// ─────────────────────────────────────────
// 8. ACTIVE NAV LINK ON SCROLL
// ─────────────────────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[aria-labelledby]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Could implement active link highlighting here based on section
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();


// ─────────────────────────────────────────
// 9. PERFORMANCE: Defer non-critical
// ─────────────────────────────────────────
window.addEventListener('load', () => {
  // Mark page as interactive
  document.body.classList.add('loaded');
});


// ─────────────────────────────────────────
// 10. CONSOLE WARNING (Easter Egg)
// ─────────────────────────────────────────
console.log(
  '%c⚠️ DUR!',
  'color: #FF3B30; font-size: 40px; font-weight: 900; font-family: Inter, sans-serif;'
);
console.log(
  '%cBu bir AltaySec güvenlik uyarısıdır!\nBu konsola herhangi bir şey yapıştırmanız sosyal mühendislik saldırısı olabilir.\nBilgi için: phishing.altaysec.com.tr',
  'color: #ffffff; font-size: 14px; font-family: Inter, sans-serif; line-height: 1.6;'
);
