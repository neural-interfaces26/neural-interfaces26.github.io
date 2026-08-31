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
  const type=e=>e?(()=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {size:parseFloat(s.fontSize),lineHeight:parseFloat(s.lineHeight),weight:Number(s.fontWeight),tracking:s.letterSpacing,family:s.fontFamily,lines:Math.round(r.height/parseFloat(s.lineHeight))}})():null;
  const rgb=value=>(value.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
  const luminance=value=>rgb(value).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05)};
  const types=selector=>[...document.querySelectorAll(selector)].filter(visible).map(e=>({tag:e.tagName,className:typeof e.className==='string'?e.className:'',text:e.textContent.trim().slice(0,80),...type(e)}));
  const small=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&e.childElementCount===0&&e.textContent.trim()&&!e.closest('pre,code')).map(e=>({tag:e.tagName,className:e.className,text:e.textContent.trim().slice(0,40),size:parseFloat(getComputedStyle(e).fontSize)})).filter(e=>e.size<10);
  const buttons=[...document.querySelectorAll('button,.bs-btn')].filter(visible).map(rect).filter(r=>r.width<44||r.height<44);
  const hero=document.querySelector('.page-hero');
  const proof=document.querySelector('.page-proof');
  const challenge=document.querySelector('.challenge-state');
  const local=document.querySelector('.local-nav');
  const brand=document.querySelector('.site-brand');
  const seal=document.querySelector('img.site-brand-mark');
  const heroArt=document.querySelector('.campaign-hero-art');
  const line=document.querySelector('.bs-code .ln');
  const code=line?.closest('.bs-code');
  const trackFigures=[...document.querySelectorAll('.track-card > img')].map(img=>{const card=img.closest('.track-card'),r=img.getBoundingClientRect(),s=getComputedStyle(card);return {width:r.width,available:card.getBoundingClientRect().width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),currentSrc:img.currentSrc,naturalWidth:img.naturalWidth}});
  const stack=hero?Math.max(hero.getBoundingClientRect().bottom,challenge?.getBoundingClientRect().bottom||0,local?.getBoundingClientRect().bottom||0)-hero.getBoundingClientRect().top:0;
  const typography={
    body:type(document.body),
    brand:type(document.querySelector('.site-brand')),
    nav:type(document.querySelector('.site-menu > a:not(.bs-btn), .site-menu > .bs-btn')),
    localNav:type(document.querySelector('.local-nav a')),
    button:type(document.querySelector('.bs-btn')),
    homeHero:type(document.querySelector('.campaign-hero-copy h1')),
    pageHero:type(document.querySelector('.page-hero h1, .error-page h1')),
    lead:type(document.querySelector('.campaign-hero-copy > p:not(.bs-eyebrow), .page-hero p, .error-copy > p:not(.bs-eyebrow)')),
    section:type(document.querySelector('.campaign-section-head h2, .vb-section-head h2, .org-section-head h2')),
    headings:types('h2:not(.award-total)'),
    features:types('.track-card h3, .timeline-panel h3, .vb-track h3, .phase-card h3, .model-card h4, .formal-block h3, .commitment-list h3, .methodology-item h3, .vb-rule-body h3, .faq-question, .org-card .name'),
    technicalCopy:types('.technical-page .vb-section-head p, .technical-page .phase-desc, .technical-page .formal-block p, .technical-page .faq-answer p, .technical-page .vb-rule-body p, .technical-page .technical-intro-copy > p:first-child, .technical-page .leaderboard-overview > p:first-child, .technical-page .faq-intro > p, .technical-page .methodology-item p'),
    sectionCadence:[...document.querySelectorAll('.technical-page .vb-section, .narrative-page .vb-section, .narrative-page .vb-sponsors, .narrative-page .vb-cta, .narrative-page .award-field, .organizers-page .org-section')].filter(visible).map(e=>{const s=getComputedStyle(e);return {tag:e.tagName,className:e.className,paddingTop:parseFloat(s.paddingTop),paddingBottom:parseFloat(s.paddingBottom)}}),
    headingCadence:[...document.querySelectorAll('.technical-page .vb-section-head, .narrative-page .vb-section-head, .organizers-page .org-section-head')].filter(visible).map(e=>({className:e.className,marginBottom:parseFloat(getComputedStyle(e).marginBottom)})),
  };
  return {innerWidth,clientWidth:document.documentElement.clientWidth,rootWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,small,buttons,hero:rect(hero),proof:rect(proof),challenge:rect(challenge),stack,proofType:[...document.querySelectorAll('.page-proof strong')].map(type),stateType:[...document.querySelectorAll('.challenge-state strong')].map(type),brandText:brand?.querySelector('span')?.textContent.trim(),brandAriaLabel:brand?.getAttribute('aria-label'),seal:seal?{...rect(seal),complete:seal.complete,naturalWidth:seal.naturalWidth,naturalHeight:seal.naturalHeight,src:seal.getAttribute('src'),alt:seal.getAttribute('alt')}:null,lineContrast:line&&code?contrast(getComputedStyle(line).color,getComputedStyle(code).backgroundColor):null,fontFaceCount:document.fonts?[...document.fonts].filter(face=>/Noto Sans|IBM Plex Mono/.test(face.family)).length:null,trackFigures,heroArtMask:heroArt?getComputedStyle(heroArt).maskImage:null,typography};
})()`;

function assertState(state, route, width) {
  if (state.innerWidth !== width || state.clientWidth !== width || state.rootWidth !== width || state.bodyWidth !== width) throw new Error(`overflow ${route} ${width}: ${JSON.stringify(state)}`);
  if (state.small.length) throw new Error(`microtype ${route} ${width}: ${JSON.stringify(state.small)}`);
  if (state.buttons.length) throw new Error(`targets ${route} ${width}: ${JSON.stringify(state.buttons)}`);
  const t=state.typography;
  if (t.body.size!==16||t.body.lineHeight!==24) throw new Error(`body typography ${route} ${width}: ${JSON.stringify(t.body)}`);
  if (t.brand.size!==16) throw new Error(`brand typography ${route} ${width}: ${JSON.stringify(t.brand)}`);
  if (width>900&&t.nav?.size!==16) throw new Error(`navigation typography ${route} ${width}: ${JSON.stringify(t.nav)}`);
  if (t.localNav&&t.localNav.size!==16) throw new Error(`local navigation typography ${route} ${width}: ${JSON.stringify(t.localNav)}`);
  if (t.button&&t.button.size!==16) throw new Error(`button typography ${route} ${width}: ${JSON.stringify(t.button)}`);
  if (t.homeHero&&(t.homeHero.size<42||t.homeHero.size>64||t.homeHero.weight!==800||(width>900&&t.homeHero.lines>2))) throw new Error(`homepage hero typography ${route} ${width}: ${JSON.stringify(t.homeHero)}`);
  if (t.pageHero&&(t.pageHero.size<40||t.pageHero.size>56||t.pageHero.weight!==700)) throw new Error(`page hero typography ${route} ${width}: ${JSON.stringify(t.pageHero)}`);
  if (t.lead&&(t.lead.size<18||t.lead.size>20||Math.abs(t.lead.lineHeight/t.lead.size-1.6)>.01)) throw new Error(`lead typography ${route} ${width}: ${JSON.stringify(t.lead)}`);
  if (t.section&&(t.section.size<32||t.section.size>48||t.section.weight!==700)) throw new Error(`section typography ${route} ${width}: ${JSON.stringify(t.section)}`);
  if (t.headings.some(type=>type.size<32||type.size>48||type.weight!==700)) throw new Error(`semantic H2 typography ${route} ${width}: ${JSON.stringify(t.headings)}`);
  if (t.features.some(type=>type.size<20||type.size>30||type.weight<600||type.weight>700||type.lineHeight/type.size<1.24||type.lineHeight/type.size>1.51)) throw new Error(`feature typography ${route} ${width}: ${JSON.stringify(t.features)}`);
  if (t.technicalCopy.some(type=>type.size!==16||type.lineHeight!==24)) throw new Error(`technical prose typography ${route} ${width}: ${JSON.stringify(t.technicalCopy)}`);
  const cadence=width>768?type=>type.paddingTop===80&&type.paddingBottom===80:type=>type.paddingTop>=56&&type.paddingTop<=64&&type.paddingBottom>=56&&type.paddingBottom<=64;
  if (secondary.has(route)&&(!t.sectionCadence.length||t.sectionCadence.some(type=>!cadence(type)))) throw new Error(`section cadence ${route} ${width}: ${JSON.stringify(t.sectionCadence)}`);
  const headingMargin=width>768?48:36;
  if (secondary.has(route)&&(!t.headingCadence.length||t.headingCadence.some(type=>type.marginBottom!==headingMargin))) throw new Error(`heading cadence ${route} ${width}: ${JSON.stringify(t.headingCadence)}`);
  if (state.brandText !== 'EEG/EMG Foundation' || !state.seal || !state.seal.complete || state.seal.naturalWidth !== 256 || state.seal.naturalHeight !== 256 || state.seal.width !== 40 || state.seal.height !== 40 || state.seal.src !== 'assets/img/brand/trophy-seal.webp' || state.seal.alt !== '') throw new Error(`header seal/name inputs ${route} ${width}: ${JSON.stringify(state.seal)}`);
  if (secondary.has(route) && (!state.proof || !state.challenge)) throw new Error(`first-fold components ${route} ${width}`);
  if (secondary.has(route) && (!state.proofType.length || state.proofType.some(type => type.size < 16 || !type.family.includes('IBM Plex Mono')))) throw new Error(`proof typography ${route} ${width}: ${JSON.stringify(state.proofType)}`);
  if (secondary.has(route) && (!state.stateType.length || state.stateType.some(type => type.size !== 12 || !type.family.includes('IBM Plex Mono')))) throw new Error(`state typography ${route} ${width}: ${JSON.stringify(state.stateType)}`);
  if (secondary.has(route) && width <= 390 && state.stack > 640) throw new Error(`first-fold stack ${route} ${width}: ${state.stack}`);
  if (secondary.has(route) && width <= 390 && state.challenge.height > 108) throw new Error(`state height ${route} ${width}: ${state.challenge.height}`);
  if (state.lineContrast !== null && state.lineContrast < 4.5) throw new Error(`code line-number contrast ${route} ${width}: ${state.lineContrast}`);
  if (route === 'index.html' && width > 900 && (!state.heroArtMask || state.heroArtMask === 'none')) throw new Error(`desktop hero artwork has a hard background edge at ${width}px`);
  if (route === 'index.html' && width <= 900 && state.heroArtMask !== 'none') throw new Error(`stacked hero retains a desktop mask at ${width}px`);
  if (route === 'index.html' && (state.trackFigures.length !== 4 || state.trackFigures.some(figure => figure.width < figure.available - 1))) throw new Error(`homepage figures do not span their panels at ${width}px: ${JSON.stringify(state.trackFigures)}`);
}

async function press(page, key, code, virtualKeyCode) {
  const params = { key, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode };
  await page.call('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
  await page.call('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
}

async function checkButtonHoverFocus(page, route, width) {
  const target = await page.eval(`(()=>{const e=document.querySelector('.campaign-hero .bs-btn.primary'),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await page.call('Input.dispatchMouseEvent', { type: 'mouseMoved', ...target });
  await press(page, 'Tab', 'Tab', 9);
  const state = await page.eval(`(async()=>{const e=document.querySelector('.campaign-hero .bs-btn.primary');e.focus({focusVisible:true});await new Promise(r=>setTimeout(r,250));const s=getComputedStyle(e);return {focusVisible:e.matches(':focus-visible'),hover:e.matches(':hover'),outline:s.outline,boxShadow:s.boxShadow}})()`);
  if (!state.focusVisible || !state.hover || !state.boxShadow.includes('0px 0px 0px 3px')) throw new Error(`button hover focus ${route} ${width}: ${JSON.stringify(state)}`);
  return state;
}

async function checkDesktopNavigation() {
  const page = await open('index.html', 1024, 900);
  try {
    const state = await page.eval(`(()=>{
      const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
      const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
      const header=document.querySelector('.site-header'),brand=document.querySelector('.site-brand'),menu=document.querySelector('.site-menu');
      const items=[...document.querySelectorAll('.site-menu > a')].filter(visible).map(rect);
      const targets=[...document.querySelectorAll('.site-header a, .site-header button')].filter(visible).map(rect);
      return {header:rect(header),brand:rect(brand),menu:rect(menu),menuFlexWrap:getComputedStyle(menu).flexWrap,items,targets,rootWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,innerWidth};
    })()`);
    const overlap=state.brand.right>state.menu.left&&state.brand.left<state.menu.right&&state.brand.bottom>state.menu.top&&state.brand.top<state.menu.bottom;
    const tops=state.items.map(item=>item.top);
    const contained=state.rootWidth===1024&&state.bodyWidth===1024&&state.header.left>=-1&&state.header.right<=1025;
    if (overlap||state.menuFlexWrap!=='nowrap'||!state.items.length||Math.max(...tops)-Math.min(...tops)>1||!contained||state.targets.some(target=>target.height<44)) throw new Error(`desktop navigation 1024: ${JSON.stringify({...state,overlap,contained})}`);
    if (page.errors.length) throw new Error(`console index.html 1024: ${JSON.stringify(page.errors)}`);
    return state;
  } finally {
    await page.close();
  }
}

async function checkOrganizerCadence768() {
  const page = await open('organizers.html', 768, 900);
  try {
    const state = await page.eval(`(()=>{
      const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
      const sections=[...document.querySelectorAll('.organizers-page .org-section')].filter(visible).map(e=>{const s=getComputedStyle(e);return {paddingTop:parseFloat(s.paddingTop),paddingBottom:parseFloat(s.paddingBottom)}});
      const headings=[...document.querySelectorAll('.organizers-page .org-section-head')].filter(visible).map(e=>parseFloat(getComputedStyle(e).marginBottom));
      return {sections,headings,rootWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,innerWidth};
    })()`);
    if (!state.sections.length||state.sections.some(section=>section.paddingTop!==64||section.paddingBottom!==64)||!state.headings.length||state.headings.some(margin=>margin!==36)||state.rootWidth!==768||state.bodyWidth!==768||state.innerWidth!==768) throw new Error(`organizer cadence 768: ${JSON.stringify(state)}`);
    if (page.errors.length) throw new Error(`console organizers.html 768: ${JSON.stringify(page.errors)}`);
    return state;
  } finally {
    await page.close();
  }
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
    const trackFigures=[...document.querySelectorAll('.track-card > img')].map(img=>({width:img.getBoundingClientRect().width,naturalWidth:img.naturalWidth,currentSrc:img.currentSrc}));
    return {hiddenReveals,incompleteImages,contentVisibilityOverrides:auto.length,stickyHeaderNeutralized:!!stickyHeader,height:document.documentElement.scrollHeight,trackFigures};
  })()`);
}

await mkdir(output, { recursive: true });
const summary = { viewportCaptures: 0, fullPageCaptures: 0, fontFallbackCaptures: 0, navigation1024: await checkDesktopNavigation(), organizer768: await checkOrganizerCadence768(), viewports: {}, buttonHoverFocus: null, codeScrollers: {}, fullPages: {}, fontFallback: {} };
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
      if (route === 'index.html' && width === 1440) summary.buttonHoverFocus = await checkButtonHoverFocus(page, route, width);
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
    if (route === 'index.html' && (prepared.trackFigures.length !== 4 || prepared.trackFigures.some(figure => figure.naturalWidth < figure.width))) throw new Error(`homepage figure source too small: ${JSON.stringify(prepared.trackFigures)}`);
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
