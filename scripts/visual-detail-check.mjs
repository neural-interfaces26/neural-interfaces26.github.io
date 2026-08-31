import { mkdir, writeFile } from 'node:fs/promises';

const port = Number(process.env.CDP_PORT || 9226);
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const output = process.env.OUTPUT_DIR || '/tmp/round-two-final';
const routes = ['index.html', 'awards.html', 'ethics.html', 'faq.html', 'leaderboard.html', 'organizers.html', 'startkit.html', 'track-record.html', '404.html'];
const secondary = new Set(routes.slice(1, -1));
const substantive = routes.filter(route => route !== '404.html');
const sizes = [[1440, 1100], [834, 1080], [390, 844], [320, 720]];
const blockedFonts = ['*://fonts.googleapis.com/*', '*://fonts.gstatic.com/*'];

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

async function open(route, width, height, blockedURLs = []) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`, { method: 'PUT' })).json();
  let page;
  try {
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    page = new Cdp(target, socket);
    await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map(method => page.call(method)));
    await page.call('Network.setCacheDisabled', { cacheDisabled: true });
    if (blockedURLs.length) await page.call('Network.setBlockedURLs', { urls: blockedURLs });
    await page.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    const loaded = page.once('Page.loadEventFired');
    await page.call('Page.navigate', { url: `${base}/${route}` });
    await loaded;
    await page.eval(`(async()=>{if(document.fonts)await document.fonts.ready;scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await new Promise(r=>setTimeout(r,550));return true})()`);
    return page;
  } catch (error) {
    if (page) await page.close();
    else await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
    throw error;
  }
}

const measure = `(()=>{
  const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
  const rect=e=>e?(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}})():null;
  const type=e=>({size:parseFloat(getComputedStyle(e).fontSize),family:getComputedStyle(e).fontFamily});
  const rgb=value=>(value.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
  const luminance=value=>rgb(value).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05)};
  const small=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&e.childElementCount===0&&e.textContent.trim()&&!e.closest('pre,code')).map(e=>({tag:e.tagName,className:e.className,text:e.textContent.trim().slice(0,40),size:parseFloat(getComputedStyle(e).fontSize)})).filter(e=>e.size<10);
  const buttons=[...document.querySelectorAll('button,.bs-btn')].filter(visible).map(rect).filter(r=>r.width<44||r.height<44);
  const hero=document.querySelector('.page-hero');
  const proof=document.querySelector('.page-proof');
  const challenge=document.querySelector('.challenge-state');
  const local=document.querySelector('.local-nav');
  const brand=document.querySelector('.site-brand');
  const seal=document.querySelector('img.site-brand-mark');
  const line=document.querySelector('.bs-code .ln');
  const code=line?.closest('.bs-code');
  const stack=hero?Math.max(hero.getBoundingClientRect().bottom,challenge?.getBoundingClientRect().bottom||0,local?.getBoundingClientRect().bottom||0)-hero.getBoundingClientRect().top:0;
  return {innerWidth,clientWidth:document.documentElement.clientWidth,rootWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,small,buttons,hero:rect(hero),proof:rect(proof),challenge:rect(challenge),stack,proofType:[...document.querySelectorAll('.page-proof strong')].map(type),stateType:[...document.querySelectorAll('.challenge-state strong')].map(type),brandText:brand?.querySelector('span')?.textContent.trim(),brandAriaLabel:brand?.getAttribute('aria-label'),seal:seal?{...rect(seal),complete:seal.complete,naturalWidth:seal.naturalWidth,naturalHeight:seal.naturalHeight,src:seal.getAttribute('src'),alt:seal.getAttribute('alt')}:null,lineContrast:line&&code?contrast(getComputedStyle(line).color,getComputedStyle(code).backgroundColor):null,fontFaceCount:document.fonts?[...document.fonts].filter(face=>/Noto Sans|IBM Plex Mono/.test(face.family)).length:null};
})()`;

function assertState(state, route, width) {
  if (state.innerWidth !== width || state.clientWidth !== width || state.rootWidth !== width || state.bodyWidth !== width) throw new Error(`overflow ${route} ${width}: ${JSON.stringify(state)}`);
  if (state.small.length) throw new Error(`microtype ${route} ${width}: ${JSON.stringify(state.small)}`);
  if (state.buttons.length) throw new Error(`targets ${route} ${width}: ${JSON.stringify(state.buttons)}`);
  if (state.brandText !== 'EEG/EMG Foundation' || !state.seal || !state.seal.complete || state.seal.naturalWidth !== 256 || state.seal.naturalHeight !== 256 || state.seal.width !== 40 || state.seal.height !== 40 || state.seal.src !== 'assets/img/brand/trophy-seal.webp' || state.seal.alt !== '') throw new Error(`header seal/name inputs ${route} ${width}: ${JSON.stringify(state.seal)}`);
  if (secondary.has(route) && (!state.proof || !state.challenge)) throw new Error(`first-fold components ${route} ${width}`);
  if (secondary.has(route) && (!state.proofType.length || state.proofType.some(type => type.size < 16 || !type.family.includes('IBM Plex Mono')))) throw new Error(`proof typography ${route} ${width}: ${JSON.stringify(state.proofType)}`);
  if (secondary.has(route) && (!state.stateType.length || state.stateType.some(type => type.size !== 12 || !type.family.includes('IBM Plex Mono')))) throw new Error(`state typography ${route} ${width}: ${JSON.stringify(state.stateType)}`);
  if (secondary.has(route) && width <= 390 && state.stack > 640) throw new Error(`first-fold stack ${route} ${width}: ${state.stack}`);
  if (secondary.has(route) && width <= 390 && state.challenge.height > 108) throw new Error(`state height ${route} ${width}: ${state.challenge.height}`);
  if (state.lineContrast !== null && state.lineContrast < 4.5) throw new Error(`code line-number contrast ${route} ${width}: ${state.lineContrast}`);
}

async function press(page, key, code, virtualKeyCode) {
  const params = { key, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode };
  await page.call('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
  await page.call('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
}

async function checkCodeScrollers(page, route) {
  const expected = await page.eval(`([...document.querySelectorAll('.bs-code pre')].map(pre=>pre.getAttribute('aria-label')))`);
  const count = route === 'startkit.html' ? 2 : 4;
  if (expected.length !== count || expected.some(label => !label) || new Set(expected).size !== count) throw new Error(`code scroller labels ${route}: ${JSON.stringify(expected)}`);
  const seen = [];
  for (let step = 0; step < 160 && seen.length < count; step += 1) {
    await press(page, 'Tab', 'Tab', 9);
    const active = await page.eval(`(()=>{const e=document.activeElement;if(!e?.matches('.bs-code pre'))return null;const s=getComputedStyle(e);return {label:e.getAttribute('aria-label'),tabIndex:e.tabIndex,scrollLeft:e.scrollLeft,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,boxShadow:s.boxShadow}})()`);
    if (!active) continue;
    if (active.label !== expected[seen.length] || active.tabIndex !== 0 || active.scrollWidth <= active.clientWidth || active.boxShadow === 'none') throw new Error(`code scroller focus ${route}: ${JSON.stringify({ expected, seen, active })}`);
    await press(page, 'ArrowRight', 'ArrowRight', 39);
    await new Promise(resolve => setTimeout(resolve, 120));
    const scrollLeft = await page.eval('document.activeElement.scrollLeft');
    if (scrollLeft <= active.scrollLeft) throw new Error(`code scroller ArrowRight ${route}: ${active.scrollLeft} -> ${scrollLeft}`);
    seen.push(active.label);
  }
  if (seen.length !== count) throw new Error(`code scroller tab order ${route}: ${JSON.stringify(seen)}`);
  const contained = await page.eval('document.documentElement.scrollWidth===innerWidth&&document.body.scrollWidth===innerWidth');
  if (!contained) throw new Error(`code scroller document overflow ${route}`);
  return seen;
}

async function screenshot(page, path, options = {}) {
  const shot = await page.call('Page.captureScreenshot', { format: 'png', fromSurface: true, ...options });
  await writeFile(path, Buffer.from(shot.data, 'base64'));
}

async function prepareFullPage(page) {
  return page.eval(`(async()=>{
    const frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    for(let y=0;y<document.documentElement.scrollHeight;y+=Math.max(240,Math.floor(innerHeight/2))){scrollTo(0,y);await frame()}
    scrollTo(0,document.documentElement.scrollHeight);await frame();await new Promise(r=>setTimeout(r,700));
    await Promise.all([...document.images].map(img=>img.complete?true:new Promise(resolve=>{const done=()=>resolve(true);img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});setTimeout(done,3000)})));
    const hiddenReveals=[...document.querySelectorAll('.reveal')].filter(e=>{const s=getComputedStyle(e);return s.opacity==='0'||s.visibility==='hidden'}).length;
    const incompleteImages=[...document.images].filter(img=>(img.currentSrc||img.getAttribute('src'))&&(!img.complete||!img.naturalWidth)).map(img=>img.currentSrc||img.getAttribute('src'));
    const auto=[...document.querySelectorAll('body *')].filter(e=>getComputedStyle(e).contentVisibility==='auto');
    auto.forEach(e=>e.style.setProperty('content-visibility','visible','important'));
    const stickyHeader=document.querySelector('.site-header');
    if(stickyHeader)stickyHeader.style.setProperty('position','static','important');
    scrollTo(0,0);await frame();
    return {hiddenReveals,incompleteImages,contentVisibilityOverrides:auto.length,stickyHeaderNeutralized:!!stickyHeader,height:document.documentElement.scrollHeight};
  })()`);
}

await mkdir(output, { recursive: true });
const summary = { viewportCaptures: 0, fullPageCaptures: 0, fontFallbackCaptures: 0, viewports: {}, codeScrollers: {}, fullPages: {}, fontFallback: {} };
const brandOverrides = [];

for (const route of routes) {
  for (const [width, height] of sizes) {
    const page = await open(route, width, height);
    try {
      const state = await page.eval(measure);
      assertState(state, route, width);
      if (secondary.has(route) && width <= 390) summary.viewports[`${route}@${width}`] = { stack: state.stack, stateHeight: state.challenge.height, proofType: state.proofType[0], stateType: state.stateType[0] };
      if (state.lineContrast !== null) summary.viewports[`${route}@${width}`] = { ...(summary.viewports[`${route}@${width}`] || {}), lineContrast: state.lineContrast };
      if (state.brandAriaLabel !== null) brandOverrides.push(`${route}@${width}`);
      if (width === 320 && (route === 'startkit.html' || route === 'leaderboard.html')) summary.codeScrollers[route] = await checkCodeScrollers(page, route);
      if (page.errors.length) throw new Error(`console ${route} ${width}: ${JSON.stringify(page.errors)}`);
      await screenshot(page, `${output}/${route.replace('.html','')}-${width}x${height}.png`, { captureBeyondViewport: false });
      summary.viewportCaptures += 1;
    } finally {
      await page.close();
    }
  }
}
if (brandOverrides.length) throw new Error(`site-brand aria-label overrides remain: ${brandOverrides.join(', ')}`);

for (const route of substantive) {
  const page = await open(route, 1440, 1100);
  try {
    const prepared = await prepareFullPage(page);
    if (prepared.hiddenReveals || prepared.incompleteImages.length) throw new Error(`full-page readiness ${route}: ${JSON.stringify(prepared)}`);
    if (page.errors.length) throw new Error(`console full-page ${route}: ${JSON.stringify(page.errors)}`);
    const { cssContentSize } = await page.call('Page.getLayoutMetrics');
    await screenshot(page, `${output}/${route.replace('.html','')}-full-1440.png`, { captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: Math.ceil(cssContentSize.height), scale: 1 } });
    summary.fullPages[route] = prepared;
    summary.fullPageCaptures += 1;
  } finally {
    await page.close();
  }
}

for (const route of routes) {
  const page = await open(route, 320, 720, blockedFonts);
  try {
    const state = await page.eval(measure);
    assertState(state, route, 320);
    if (state.brandAriaLabel !== null || state.fontFaceCount !== 0) throw new Error(`font fallback/brand inputs ${route}: ${JSON.stringify({ ariaLabel: state.brandAriaLabel, fontFaceCount: state.fontFaceCount })}`);
    if (page.errors.length) throw new Error(`console font fallback ${route}: ${JSON.stringify(page.errors)}`);
    await screenshot(page, `${output}/${route.replace('.html','')}-font-fallback-320x720.png`, { captureBeyondViewport: false });
    summary.fontFallback[route] = { stack: state.stack, stateHeight: state.challenge?.height || 0 };
    summary.fontFallbackCaptures += 1;
  } finally {
    await page.close();
  }
}

await writeFile(`${output}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`PASS: ${summary.viewportCaptures} visual detail captures`);
console.log(`PASS: ${summary.fullPageCaptures} full-page captures`);
console.log(`PASS: ${summary.fontFallbackCaptures} font-fallback captures`);
