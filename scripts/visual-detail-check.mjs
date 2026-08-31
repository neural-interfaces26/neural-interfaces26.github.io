import { mkdir, writeFile } from 'node:fs/promises';

const port = Number(process.env.CDP_PORT || 9226);
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const output = process.env.OUTPUT_DIR || '/tmp/round-two-final';
const routes = ['index.html', 'awards.html', 'ethics.html', 'faq.html', 'leaderboard.html', 'organizers.html', 'startkit.html', 'track-record.html', '404.html'];
const secondary = new Set(routes.slice(1, -1));
const sizes = [[1440, 1100], [834, 1080], [390, 844], [320, 720]];

class Cdp {
  constructor(target, socket) {
    this.target = target;
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.errors = [];
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        return message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown' || (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') || (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error')) this.errors.push(message);
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
    return new Promise(resolve => this.events.set(method, [...(this.events.get(method) || []), resolve]));
  }
  async eval(expression) {
    const result = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async close() {
    this.socket.close();
    await fetch(`http://127.0.0.1:${port}/json/close/${this.target.id}`);
  }
}

async function open(route, width, height) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`, { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const page = new Cdp(target, socket);
  await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map(method => page.call(method)));
  await page.call('Network.setCacheDisabled', { cacheDisabled: true });
  await page.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const loaded = page.once('Page.loadEventFired');
  await page.call('Page.navigate', { url: `${base}/${route}` });
  await loaded;
  await page.eval(`(async()=>{if(document.fonts)await document.fonts.ready;scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await new Promise(r=>setTimeout(r,550));return true})()`);
  return page;
}

await mkdir(output, { recursive: true });
for (const route of routes) {
  for (const [width, height] of sizes) {
    const page = await open(route, width, height);
    try {
      const state = await page.eval(`(()=>{
        const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
        const rect=e=>e?(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}})():null;
        const small=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&e.childElementCount===0&&e.textContent.trim()&&!e.closest('pre,code')).map(e=>({tag:e.tagName,className:e.className,text:e.textContent.trim().slice(0,40),size:parseFloat(getComputedStyle(e).fontSize)})).filter(e=>e.size<10);
        const buttons=[...document.querySelectorAll('button,.bs-btn')].filter(visible).map(rect).filter(r=>r.width<44||r.height<44);
        const hero=document.querySelector('.page-hero');
        const proof=document.querySelector('.page-proof');
        const challenge=document.querySelector('.challenge-state');
        const local=document.querySelector('.local-nav');
        const brand=document.querySelector('.site-brand');
        const seal=document.querySelector('img.site-brand-mark');
        const stack=hero?Math.max(hero.getBoundingClientRect().bottom,challenge?.getBoundingClientRect().bottom||0,local?.getBoundingClientRect().bottom||0)-hero.getBoundingClientRect().top:0;
        return {innerWidth,clientWidth:document.documentElement.clientWidth,rootWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,small,buttons,hero:rect(hero),proof:rect(proof),challenge:rect(challenge),stack,brandName:brand?.textContent.trim(),seal:seal?{...rect(seal),complete:seal.complete,naturalWidth:seal.naturalWidth,naturalHeight:seal.naturalHeight,src:seal.getAttribute('src'),alt:seal.getAttribute('alt')}:null};
      })()`);
      if (state.innerWidth !== width || state.clientWidth !== width || state.rootWidth !== width || state.bodyWidth !== width) throw new Error(`overflow ${route} ${width}: ${JSON.stringify(state)}`);
      if (state.small.length) throw new Error(`microtype ${route} ${width}: ${JSON.stringify(state.small)}`);
      if (state.buttons.length) throw new Error(`targets ${route} ${width}: ${JSON.stringify(state.buttons)}`);
      if (state.brandName !== 'EEG/EMG Foundation' || !state.seal || !state.seal.complete || state.seal.naturalWidth !== 256 || state.seal.naturalHeight !== 256 || state.seal.width !== 32 || state.seal.height !== 32 || state.seal.src !== 'assets/img/brand/trophy-seal.webp' || state.seal.alt !== '') throw new Error(`header seal ${route} ${width}: ${JSON.stringify(state.seal)}`);
      if (secondary.has(route) && (!state.proof || !state.challenge)) throw new Error(`first-fold components ${route} ${width}`);
      if (secondary.has(route) && width <= 390 && state.stack > 640) throw new Error(`first-fold stack ${route} ${width}: ${state.stack}`);
      if (secondary.has(route) && width <= 390 && state.challenge.height > 108) throw new Error(`state height ${route} ${width}: ${state.challenge.height}`);
      if (page.errors.length) throw new Error(`console ${route} ${width}: ${JSON.stringify(page.errors)}`);
      const shot = await page.call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
      await writeFile(`${output}/${route.replace('.html','')}-${width}x${height}.png`, Buffer.from(shot.data, 'base64'));
    } finally {
      await page.close();
    }
  }
}
console.log(`PASS: ${routes.length * sizes.length} visual detail captures`);
