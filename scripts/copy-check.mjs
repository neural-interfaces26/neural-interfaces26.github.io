import assert from 'node:assert/strict';
import { open } from './visual-detail-check.mjs';

for (const width of [1440, 390, 320]) {
  const page = await open('get-prepared.html', width, 900);
  try {
    assert.equal(await page.eval('document.documentElement.scrollWidth === innerWidth'), true, `${width}: page overflow`);
    const result = await page.eval(`(async () => {
      const copied = [];
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async text => copied.push(text)
      }});
      const buttons = [...document.querySelectorAll('[data-copy]')];
      for (const button of buttons) {
        button.click();
        await Promise.resolve();
      }
      return { copied, feedback: buttons.every(b => b.textContent === 'copied' && b.disabled) };
    })()`);
    assert.deepEqual(result.copied, ['pip install neuralbench', 'neuralbench eeg image', 'neuralbench eeg motor_imagery', 'neuralbench eeg sleep_onset', 'neuralbench emg pose -m vemg2pose']);
    assert.equal(result.feedback, true);
    assert.equal(await page.eval(`(async () => {
      await new Promise(r => setTimeout(r, 1500));
      const button = document.querySelector('[data-copy]');
      if (button.disabled || button.textContent !== 'copy') return false;
      navigator.clipboard.writeText = async () => { throw Error('denied'); };
      button.click();
      await new Promise(r => setTimeout(r, 0));
      return button.textContent === 'Select and copy manually';
    })()`), true);
    console.log(`${width}px: layout, command text, copy feedback, reset, and clipboard failure passed`);
  } finally {
    await page.close();
  }
}
