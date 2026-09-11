// Uses the local server and Chrome CDP settings from visual-detail-check.mjs.
import assert from 'node:assert/strict';
import { open, screenshot } from './visual-detail-check.mjs';

for (const width of [1440, 834, 390, 320]) {
  const page = await open('tracks.html', width, 1000);
  try {
    const state = await page.eval(`(async () => {
      for (const figure of document.querySelectorAll('[data-track-figure]')) {
        figure.scrollIntoView();
        await Promise.all([...figure.querySelectorAll('img')].map(img => img.decode()));
      }
      return {
        count: document.querySelectorAll('[data-track-figure]').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        motion: document.body.dataset.trackMotion,
        paused: document.querySelector('svg[data-hand]').animationsPaused(),
        images: [...document.querySelectorAll('[data-track-figure] img')].every(img => img.naturalWidth > 0),
        dimensions: [...document.querySelectorAll('[data-track-figure]')].map(figure => {
          const rect = figure.getBoundingClientRect();
          return [Math.round(rect.width * 100) / 100, Math.round(rect.height * 100) / 100];
        })
      };
    })()`);
    assert.equal(state.count, 4);
    assert.equal(state.overflow, false);
    assert.equal(state.motion, 'alive');
    assert.equal(state.paused, false);
    assert.equal(state.images, true);
    const widths = state.dimensions.map(([width]) => width);
    const heights = state.dimensions.map(([, height]) => height);
    assert.ok(Math.max(...widths) - Math.min(...widths) <= 1, JSON.stringify(state.dimensions));
    assert.ok(Math.max(...heights) - Math.min(...heights) <= 1, JSON.stringify(state.dimensions));
    assert.equal(await page.eval(`document.querySelector('.track-motion-toggle')`), null);
    await page.call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await page.eval(`new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
    assert.equal(await page.eval(`document.querySelector('svg[data-hand]').animationsPaused() && document.body.dataset.trackMotion === 'still'`), true);
    assert.equal(await page.eval(`document.getAnimations().filter(a => a.playState === 'running' && a.effect?.target.closest('[data-track-figure]')).length`), 0);
    assert.equal(page.errors.length, 0, JSON.stringify(page.errors));
    await page.eval(`document.querySelector('#track-1').scrollIntoView()`);
    await screenshot(page, `/tmp/track-figures-${width}.png`);
    console.log(`PASS: track artwork, assets and reduced motion at ${width}px`);
  } finally {
    await page.close();
  }
}
