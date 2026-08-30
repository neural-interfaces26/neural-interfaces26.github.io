/* EEG/EMG Foundation Challenge 2026 — page interactions:
   - Animated count-up on [data-count-to] when in viewport
   - Copy-to-clipboard on [data-copy] inside .bs-code blocks
   - Responsive site menu toggle
   - Leaderboard tab toggling
   - Violet full stop on display headings (artwork identity motif) */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Animated counts ---------- */
  function formatCount(value, suffix) {
    const v = Math.round(value);
    return v.toLocaleString('en-US') + (suffix || '');
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || '';
    if (!Number.isFinite(target)) return;

    if (prefersReducedMotion) {
      el.textContent = formatCount(target, suffix);
      return;
    }

    const duration = 280;
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = formatCount(target * eased, suffix);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const els = document.querySelectorAll('[data-count-to]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(animateCount);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Copy buttons ---------- */
  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const code = btn.closest('.bs-code');
        if (!code) return;
        const pre = code.querySelector('pre');
        if (!pre) return;

        // Strip line numbers, keep code text only
        const lines = Array.from(pre.querySelectorAll('.line code'))
          .map((c) => c.textContent.replace(/ /g, ' '))
          .join('\n');

        try {
          await navigator.clipboard.writeText(lines);
          const original = btn.textContent;
          btn.textContent = 'copied';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
          }, 1400);
        } catch (err) {
          btn.textContent = 'press ⌘C';
          setTimeout(() => { btn.textContent = 'copy'; }, 1600);
        }
      });
    });
  }

  /* ---------- Responsive site menu ---------- */
  function initSiteMenu() {
    const toggle = document.querySelector('.site-menu-toggle');
    const menu = document.getElementById('site-menu');
    if (!toggle || !menu) return;

    const close = ({ restoreFocus = false } = {}) => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) return close();
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        close({ restoreFocus: true });
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', close);
  }

  /* ---------- Countdown to warm-up ---------- */
  function initCountdown() {
    const root = document.querySelector('[data-countdown-to]');
    if (!root) return;
    const target = new Date(root.dataset.countdownTo).getTime();
    if (!Number.isFinite(target)) return;
    const daysEl = root.querySelector('[data-cd-days]');
    const hoursEl = root.querySelector('[data-cd-hours]');
    const minsEl = root.querySelector('[data-cd-mins]');
    const secsEl = root.querySelector('[data-cd-secs]');
    const daysUnitEl = root.querySelector('[data-cd-days-unit]');
    const pad = (n) => String(n).padStart(2, '0');

    let intervalId = null;
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '0';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        root.setAttribute('aria-label', 'Warm-up phase is open');
        if (intervalId) clearInterval(intervalId);
        return false;
      }
      const totalSecs = Math.floor(diff / 1000);
      const days = Math.floor(totalSecs / 86400);
      const hours = Math.floor((totalSecs % 86400) / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      if (daysEl) daysEl.textContent = String(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minsEl) minsEl.textContent = pad(mins);
      if (secsEl) secsEl.textContent = pad(secs);
      if (daysUnitEl) daysUnitEl.textContent = days === 1 ? 'day' : 'days';
      root.setAttribute(
        'aria-label',
        `${days} days, ${hours} hours, ${mins} minutes, ${secs} seconds until warm-up phase opens`,
      );
      return true;
    };

    if (tick()) intervalId = setInterval(tick, 1000);
  }

  /* ---------- Display full stop ----------
     Every headline in the 2026 artwork set closes on a violet period
     ("GET READY.", "4 TRACKS.", "WE'RE BACK."). Rather than sprinkling a
     span through eight pages of markup, wrap the trailing period of each
     display heading here. Purely decorative: without JS the heading still
     renders with a normal-coloured period. */
  const DISPLAY_HEADINGS = [
    '.vb-hero-text h1',
    '.org-hero h1',
    '.vb-section-head h2',
    '.org-section-head h2',
    '.vb-cta h2',
    '.vb-sponsors-side h2',
  ].join(', ');

  function initDisplayStops() {
    document.querySelectorAll(DISPLAY_HEADINGS).forEach((el) => {
      const last = el.lastChild;
      if (!last || last.nodeType !== 3) return;
      const text = last.nodeValue.replace(/\s+$/, '');
      if (!text.endsWith('.') || text.endsWith('..')) return;
      last.nodeValue = text.slice(0, -1);
      const stop = document.createElement('span');
      stop.className = 'bs-stop';
      stop.setAttribute('aria-hidden', 'false');
      stop.textContent = '.';
      el.appendChild(stop);
    });
  }

  /* ---------- Leaderboard tabs ---------- */
  function initLeaderboardTabs() {
    const tabs = document.querySelectorAll('.vb-leader-tabs [role="tab"]');
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.toggle('solid', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });
      });
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initCounters();
    initCopyButtons();
    initSiteMenu();
    initCountdown();
    initLeaderboardTabs();
    initDisplayStops();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
