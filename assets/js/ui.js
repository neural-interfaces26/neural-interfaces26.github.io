/* EEG/EMG Foundation Challenge 2026 — page interactions:
   - Animated count-up on [data-count-to] when in viewport
   - Copy-to-clipboard on [data-copy] inside .bs-code blocks
   - Responsive site menu toggle
   - Active homepage section navigation
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

  /* ---------- Campaign reveals ---------- */
  function initReveals() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
    document.documentElement.classList.add('reveal-ready');
  }

  /* ---------- Deferred track figures ---------- */
  function initDeferredImages() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;
    const load = (image) => {
      if (image.dataset.srcset) image.srcset = image.dataset.srcset;
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
      image.removeAttribute('data-srcset');
    };
    if (!('IntersectionObserver' in window)) {
      images.forEach(load);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        observer.unobserve(entry.target);
      });
    });
    images.forEach((image) => observer.observe(image));
  }

  function initFonts() {
    const fonts = document.getElementById('site-fonts');
    if (fonts) fonts.media = 'all';
  }

  function initMathJax() {
    const section = document.querySelector('[data-mathjax-src]');
    if (!section) return;
    const load = () => {
      if (document.querySelector('[data-mathjax-loader]')) return;
      const script = document.createElement('script');
      script.src = section.dataset.mathjaxSrc;
      script.defer = true;
      script.dataset.mathjaxLoader = 'true';
      document.head.appendChild(script);
    };
    if (!('IntersectionObserver' in window)) return load();
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      load();
      observer.disconnect();
    });
    observer.observe(section);
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

    const setToggleLabel = (open) => {
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    setToggleLabel(false);

    const close = ({ restoreFocus = false } = {}) => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      setToggleLabel(false);
      document.body.classList.remove('menu-open');
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) return close();
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      setToggleLabel(true);
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

  /* ---------- Native disclosures and deep links ---------- */
  function initHashDisclosures() {
    const openHashDisclosure = () => {
      let hash = window.location.hash.slice(1);
      if (!hash) return;
      try {
        hash = decodeURIComponent(hash);
      } catch (err) {
        return;
      }
      const target = document.getElementById(hash);
      let parent = target && target.closest('details');
      while (parent) {
        parent.open = true;
        parent = parent.parentElement && parent.parentElement.closest('details');
      }
    };
    openHashDisclosure();
    window.addEventListener('hashchange', openHashDisclosure);
  }

  /* ---------- Active homepage section ---------- */
  function initSectionNavigation() {
    if (!document.querySelector('.campaign-hero') || !('IntersectionObserver' in window)) return;

    const locations = new Map();
    document.querySelectorAll('nav a[href*="#"]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      const currentPath = window.location.pathname.replace(/index\.html$/, '');
      const linkPath = url.pathname.replace(/index\.html$/, '');
      if (url.origin !== window.location.origin || linkPath !== currentPath || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      const item = locations.get(target.id) || { target, links: [] };
      item.links.push(link);
      locations.set(target.id, item);
    });
    if (!locations.size) return;

    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.set(entry.target.id, entry);
        else visible.delete(entry.target.id);
      });
      const current = Array.from(visible.values())
        .sort((a, b) => Math.abs(a.boundingClientRect.top - 72) - Math.abs(b.boundingClientRect.top - 72))[0];
      locations.forEach(({ links }, id) => {
        links.forEach((link) => {
          if (link.getAttribute('aria-current') === 'page') return;
          if (current && id === current.target.id) link.setAttribute('aria-current', 'location');
          else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-72px 0px -55% 0px', threshold: 0 });

    locations.forEach(({ target }) => observer.observe(target));
  }

  /* ---------- Competition opening countdowns ---------- */
  function initCountdown() {
    document.querySelectorAll('[data-countdown-to]').forEach((root) => {
      const target = new Date(root.dataset.countdownTo).getTime();
      if (!Number.isFinite(target)) return;
      const daysEl = root.querySelector('[data-cd-days]');
      const hoursEl = root.querySelector('[data-cd-hours]');
      const minsEl = root.querySelector('[data-cd-mins]');
      const secsEl = root.querySelector('[data-cd-secs]');
      const daysUnitEl = root.querySelector('[data-cd-days-unit]');
      const labelEl = root.querySelector('[data-cd-label]');
      const pad = (n) => String(n).padStart(2, '0');

      let intervalId = null;
      const tick = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
          if (daysEl) daysEl.textContent = '0';
          if (hoursEl) hoursEl.textContent = '00';
          if (minsEl) minsEl.textContent = '00';
          if (secsEl) secsEl.textContent = '00';
          if (labelEl) labelEl.textContent = 'Competition is open';
          root.classList.add('is-open');
          root.setAttribute('aria-label', 'Competition is open');
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
          `${days} days, ${hours} hours, ${mins} minutes, ${secs} seconds until the competition opens`,
        );
        return true;
      };

      if (tick()) intervalId = setInterval(tick, 1000);
    });
  }

  /* ---------- Date-driven competition timeline ---------- */
  function initTimelineProgress() {
    const root = document.querySelector('[data-timeline-progress]');
    if (!root) return;

    const dates = [
      root.dataset.start,
      root.dataset.warmupEnd,
      root.dataset.finalEnd,
      root.dataset.ceremonyEnd,
    ].map((value) => new Date(value).getTime());
    const ceremonyStart = new Date(root.dataset.ceremonyStart).getTime();
    if (dates.some((value) => !Number.isFinite(value)) || !Number.isFinite(ceremonyStart)) return;

    const positions = [0, 25, 50, 75, 100];
    const label = root.querySelector('[data-timeline-label]');
    const update = () => {
      const now = Date.now();
      let progress = 0;
      let status = 'Registration open';

      if (now >= dates[3]) {
        progress = 100;
        status = 'Ceremony complete';
      } else if (now >= ceremonyStart) {
        progress = positions[3] + ((now - ceremonyStart) / (dates[3] - ceremonyStart)) * (positions[4] - positions[3]);
        status = 'Winners’ ceremony';
      } else if (now >= dates[2]) {
        progress = positions[2] + ((now - dates[2]) / (ceremonyStart - dates[2])) * (positions[3] - positions[2]);
        status = 'Final evaluation';
      } else if (now >= dates[1]) {
        progress = positions[1] + ((now - dates[1]) / (dates[2] - dates[1])) * (positions[2] - positions[1]);
        status = 'Sealed final now';
      } else if (now >= dates[0]) {
        progress = ((now - dates[0]) / (dates[1] - dates[0])) * positions[1];
        status = 'Warm-up now';
      }

      progress = Math.max(0, Math.min(100, progress));
      root.style.setProperty('--timeline-progress', `${progress}%`);
      root.dataset.edge = progress < 7 ? 'start' : progress > 93 ? 'end' : 'middle';
      if (label) label.textContent = status;
      root.setAttribute('aria-label', `Competition timeline progress: ${status}.`);
    };

    update();
    window.setInterval(update, 60 * 60 * 1000);
  }

  function openRuleFromHash() {
    if (!window.location.hash) return;
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (target?.matches('details.vb-rule')) target.open = true;
  }

  openRuleFromHash();
  window.addEventListener('hashchange', openRuleFromHash);

  /* ---------- Display full stop ----------
     Every headline in the 2026 artwork set closes on a violet period
     ("GET READY.", "4 TRACKS.", "WE'RE BACK."). Rather than sprinkling a
     span through eight pages of markup, wrap the trailing period of each
     display heading here. Purely decorative: without JS the heading still
     renders with a normal-coloured period. */
  const DISPLAY_HEADINGS = [
    '.campaign-hero-copy h1',
    '.challenge-thesis .campaign-section-head h2',
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
    initReveals();
    initDeferredImages();
    initFonts();
    initMathJax();
    initCopyButtons();
    initSiteMenu();
    initHashDisclosures();
    initSectionNavigation();
    initCountdown();
    initTimelineProgress();
    initLeaderboardTabs();
    initDisplayStops();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
