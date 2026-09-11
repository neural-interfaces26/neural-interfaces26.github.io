#!/usr/bin/env bun
/** Capture the four inline track animations at 2x and encode browser-safe GIFs. */

import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const port = Number(process.env.CDP_PORT || 9226);
const baseUrl = process.env.BASE_URL || 'http://localhost:8765';
const cssWidth = 640;
const cssHeight = 300;
const deviceScaleFactor = 2;
const framesPerSecond = 15;
const tracks = [
  { selector: '#track-1 [data-track-figure]', name: 'eeg-to-image', durationMs: 10800 },
  { selector: '#track-2 [data-track-figure]', name: 'bci-decoding', durationMs: 10800 },
  { selector: '#track-3 [data-track-figure]', name: 'sleep-onset', durationMs: 14400 },
  { selector: '#track-4 [data-track-figure]', name: 'emg-to-pose', durationMs: 14000 },
];

class Cdp {
  constructor(target, socket) {
    this.target = target;
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
        return;
      }
      for (const resolve of this.events.get(message.method) || []) resolve(message.params);
      this.events.delete(message.method);
    };
  }

  call(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method) {
    return new Promise(resolve => {
      this.events.set(method, [...(this.events.get(method) || []), resolve]);
    });
  }

  async eval(expression) {
    const result = await this.call('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }

  async close() {
    this.socket.close();
    await fetch(`http://127.0.0.1:${port}/json/close/${this.target.id}`);
  }
}

async function openPage() {
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`, { method: 'PUT' })
  ).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  const page = new Cdp(target, socket);
  await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(method => page.call(method)));
  await page.call('Network.setCacheDisabled', { cacheDisabled: true });
  await page.call('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor,
    mobile: false,
  });
  const loaded = page.once('Page.loadEventFired');
  await page.call('Page.navigate', { url: `${baseUrl}/tracks.html` });
  await loaded;
  await page.eval(`(async () => {
    if (document.fonts) await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return true;
  })()`);
  return page;
}

async function prepareTrack(page, selector) {
  const dimensions = await page.eval(`(() => {
    const figure = document.querySelector(${JSON.stringify(selector)});
    if (!figure) throw new Error('Missing track figure');
    document.body.innerHTML = '';
    document.body.appendChild(figure);
    document.documentElement.style.cssText = 'margin:0;width:${cssWidth}px;height:${cssHeight}px;overflow:hidden;background:#fff';
    document.body.style.cssText = 'margin:0;width:${cssWidth}px;height:${cssHeight}px;overflow:hidden;background:#fff';
    document.body.dataset.trackMotion = 'alive';
    figure.style.cssText = 'width:${cssWidth}px;height:${cssHeight}px;aspect-ratio:auto;margin:0;position:absolute;inset:0';
    const animations = figure.getAnimations({ subtree: true });
    animations.forEach(animation => animation.pause());
    const hand = figure.querySelector('svg[data-hand]');
    if (hand) {
      hand.querySelectorAll('animate').forEach(animation => {
        try { animation.beginElement(); } catch {}
      });
      hand.pauseAnimations();
    }
    window.setExportTime = milliseconds => {
      animations.forEach(animation => { animation.currentTime = milliseconds; });
      if (hand) hand.setCurrentTime(milliseconds / 1000);
    };
    const rect = figure.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  })()`);
  if (dimensions.width !== cssWidth || dimensions.height !== cssHeight) {
    throw new Error(`Unexpected capture dimensions: ${JSON.stringify(dimensions)}`);
  }
}

async function captureTrack(track, workingDirectory) {
  const page = await openPage();
  const frameDirectory = join(workingDirectory, track.name);
  await mkdir(frameDirectory, { recursive: true });
  try {
    await prepareTrack(page, track.selector);
    const frameCount = Math.round(track.durationMs * framesPerSecond / 1000);
    for (let index = 0; index < frameCount; index += 1) {
      await page.eval(`(async () => {
        window.setExportTime(${index * 1000 / framesPerSecond});
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return true;
      })()`);
      const capture = await page.call('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: cssWidth, height: cssHeight, scale: 1 },
      });
      await writeFile(join(frameDirectory, `${String(index).padStart(4, '0')}.png`), Buffer.from(capture.data, 'base64'));
    }
  } finally {
    await page.close();
  }

  const destination = join(process.cwd(), 'exports', `${track.name}.gif`);
  const result = spawnSync('python3', [
    join(process.cwd(), 'scripts', 'encode-track-gif.py'),
    frameDirectory,
    destination,
    '--duration-ms',
    String(track.durationMs),
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`GIF encoding failed for ${track.name}`);
  process.stdout.write(`Exported ${track.name}.gif\n`);
}

const workingDirectory = await mkdtemp(join(tmpdir(), 'ni26-track-gifs-'));
process.stdout.write(`Capturing high-resolution frames in ${workingDirectory}\n`);
for (const track of tracks) await captureTrack(track, workingDirectory);
