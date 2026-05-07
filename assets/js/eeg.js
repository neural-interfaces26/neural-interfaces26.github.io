/* The Neural Interface Foundation Challenge — EEG SVG generators (vanilla port
   of primitives.jsx). Hydrates [data-eeg-host] containers with multi-channel
   scrolling EEG SVGs and [data-matrix-seed] containers with a small
   spectrogram-like grid. */

(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CHANNEL_LABELS = ['Fp1', 'Fp2', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2', 'F7', 'F8', 'T3', 'T4', 'T5', 'T6', 'Fz', 'Cz'];

  function rand(s) {
    const x = Math.sin(s) * 1e4;
    return x - Math.floor(x);
  }

  function eegPath(width, height, seed, points, amp, smoothness) {
    const pts = [];
    const baseY = height / 2;
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const x = t * width;
      let y = 0;
      y += Math.sin(t * 12 * smoothness + seed * 1.7) * 0.35;
      y += Math.sin(t * 28 * smoothness + seed * 4.3) * 0.18;
      y += Math.sin(t * 52 * smoothness + seed * 7.9) * 0.10;
      y += (rand(seed * 31 + i) - 0.5) * 0.16;
      if (rand(seed * 13 + Math.floor(i / 7)) > 0.92) {
        y += Math.sin((t - 0.05) * 60) * 0.6 * Math.exp(-Math.pow((t - ((seed * 0.37) % 1)) * 14, 2));
      }
      pts.push([x, baseY + y * baseY * amp]);
    }
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` Q ${cx.toFixed(1)} ${y0.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  }

  // Render one strip at a measured pixel width. The SVG width attribute is set
  // to exactly 2x the strip pixel width so that two identical paths tile
  // seamlessly and the CSS animation `translateX(-50%)` advances by one strip
  // width per loop. This avoids the cross-browser gotcha where `width: 200%`
  // on inline SVG sometimes resolves to the parent's width instead.
  function renderChannel(strip, channelIdx) {
    const rect = strip.getBoundingClientRect();
    const w = Math.max(200, Math.round(rect.width));
    const h = strip._rowHeight || 18;

    const seed = channelIdx + 11;
    const points = Math.max(28, Math.round(w / 6));
    const amp = 0.62 + (channelIdx % 3) * 0.06;
    const smoothness = 1.4 + (channelIdx % 2) * 0.4;
    const d = eegPath(w, h, seed, points, amp, smoothness);

    strip.innerHTML = '';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', String(w * 2));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', `0 0 ${w * 2} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    const p1 = document.createElementNS(SVG_NS, 'path');
    p1.setAttribute('d', d);
    const p2 = document.createElementNS(SVG_NS, 'path');
    p2.setAttribute('d', d);
    p2.setAttribute('transform', `translate(${w} 0)`);
    svg.appendChild(p1);
    svg.appendChild(p2);
    strip.appendChild(svg);
  }

  function buildScrollingEeg(host) {
    const channels = parseInt(host.dataset.channels, 10) || 6;
    const speed = parseFloat(host.dataset.speed) || 1;
    const rowHeight = parseInt(host.dataset.rowHeight, 10) || 18;

    host.style.setProperty('--bs-eeg-speed', `${10 / speed}s`);
    host.innerHTML = '';

    const strips = [];
    for (let i = 0; i < channels; i++) {
      const row = document.createElement('div');
      row.className = 'bs-eeg-channel';

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = CHANNEL_LABELS[i] || `Ch${i + 1}`;
      row.appendChild(label);

      const strip = document.createElement('div');
      strip.className = 'strip';
      strip._rowHeight = rowHeight;
      row.appendChild(strip);
      host.appendChild(row);
      strips.push(strip);
    }

    // Render once layout has settled.
    requestAnimationFrame(() => {
      strips.forEach((strip, i) => renderChannel(strip, i));
    });

    // Re-render on viewport changes so the path always tiles the strip width.
    let resizeId = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(() => {
        strips.forEach((strip, i) => renderChannel(strip, i));
      }, 200);
    });
  }

  function buildMatrix(host) {
    const seed = parseInt(host.dataset.matrixSeed, 10) || 1;
    const rows = 3;
    const cols = 10;
    host.style.gridTemplateColumns = `repeat(${cols}, 4px)`;

    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let v = Math.sin(c * 0.18 + r * 0.32 + seed) * 0.5 + 0.5;
        v += rand(r * 41 + c * 7 + seed) * 0.3;
        v = Math.min(1, v / 1.3);

        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.opacity = 0.08 + v * 0.78;
        cell.style.animation = `bs-glow calc(${2 + ((r * cols + c) % 5) * 0.4}s / var(--bs-anim-speed, 1)) ease-in-out ${(((r * cols + c) % 17) * 0.03).toFixed(2)}s infinite`;
        frag.appendChild(cell);
      }
    }
    host.appendChild(frag);
  }

  function init() {
    document.querySelectorAll('[data-eeg-host]').forEach(buildScrollingEeg);
    document.querySelectorAll('[data-matrix-seed]').forEach(buildMatrix);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
