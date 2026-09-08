import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { open, press, screenshot } from './visual-detail-check.mjs';

const output = process.env.OUTPUT_DIR || '/tmp/neural-journey';
const docs = 'https://facebookresearch.github.io/neuroai/neuralbench/auto_examples/biosignal_challenge_2026/';
const portals = [17974, 17982, 17983, 17984];
const guides = ['plot_track1_eeg_to_image.html', 'plot_track2_eeg_to_bci.html', 'plot_track3_sleep_onset.html', 'plot_track4_emg_to_pose.html'];
const routes = (process.env.JOURNEY_ROUTES || 'index.html,startkit.html,awards.html,faq.html,leaderboard.html,organizers.html,ethics.html,track-record.html,404.html').split(',');
const widths = (process.env.JOURNEY_WIDTHS || '1440,834,390,320').split(',').map(Number);
const results = [];

async function click(page, selector, navigates = false) {
  const target = await page.eval(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing link');e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  const loaded = navigates ? page.once('Page.loadEventFired') : null;
  await page.call('Input.dispatchMouseEvent', {type:'mousePressed', button:'left', clickCount:1, ...target});
  await page.call('Input.dispatchMouseEvent', {type:'mouseReleased', button:'left', clickCount:1, ...target});
  if (loaded) {
    let timer;
    try { await Promise.race([loaded, new Promise((_, reject)=>{timer=setTimeout(()=>reject(new Error(`Navigation timed out: ${selector}`)),15000)})]); }
    finally { clearTimeout(timer); }
  }
  await page.eval(`(async()=>{if(document.fonts)await document.fonts.ready;await new Promise(r=>setTimeout(r,700))})()`);
}

async function main() {
await mkdir(output, {recursive:true});
for (const width of widths) {
  for (const route of routes) {
    const label = `${route}@${width}`;
    const page = await open(route, width, 900);
    try {
      const state = await page.eval(`(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,nav:[...document.querySelectorAll('.site-menu a')].map(a=>[a.textContent.trim(),a.getAttribute('href')]),register:document.querySelector('.site-menu .primary')?.getAttribute('href')}))()`);
      assert.equal(state.scroll, width, `${label}: document overflow`);
      assert.equal(state.body, width, `${label}: body overflow`);
      assert.equal(state.register, 'startkit.html#enter', `${label}: registration detour`);
      assert.ok(state.nav.some(([text, href])=>text==='Prizes'&&href==='awards.html'), `${label}: prizes missing`);
      if (width <= 834) {
        await click(page, '.site-menu-toggle');
        assert.equal(await page.eval("document.querySelector('.site-menu-toggle').getAttribute('aria-expanded')"), 'true', `${label}: menu did not open`);
        await press(page, 'Escape', 'Escape', 27);
        assert.ok(await page.eval("document.activeElement.matches('.site-menu-toggle') && document.querySelector('.site-menu-toggle').getAttribute('aria-expanded') === 'false'"), `${label}: Escape/focus failed`);
      }
      if (route === 'startkit.html' && width <= 390) {
        const choices=await page.eval(`([...document.querySelectorAll('.track-jump a')].map(a=>{const r=a.getBoundingClientRect();return {label:a.textContent.trim(),left:r.left,right:r.right,top:r.top,bottom:r.bottom}}))`);
        assert.equal(choices.length,4,`${label}: no compact four-track choice`);
        assert.ok(choices.every(c=>c.left>=0&&c.right<=width&&c.top>=72&&c.bottom<=844),`${label}: all four choices must be visible together on entry: ${JSON.stringify(choices)}`);
      }
      if (route === 'index.html') {
        assert.ok(await page.eval("(()=>{const r=document.querySelector('.campaign-hero .primary').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()"), `${label}: entry CTA below first screen`);
        for (let i=1; i<=4; i++) assert.equal(await page.eval(`document.querySelectorAll('.track-card-footer a')[${i-1}].getAttribute('href')`), `startkit.html#enter-${i}`, `${label}: wrong track entry`);
        await click(page, '.campaign-hero .primary', true);
        assert.equal(await page.eval('location.pathname+location.hash'), '/startkit.html#enter', `${label}: homepage entry failed`);
      }
      if (route === 'startkit.html' || route === 'index.html') {
        for (let i=1; i<=4; i++) {
          const links = await page.eval(`[...document.querySelectorAll('#enter-${i} a')].map(a=>a.getAttribute('href'))`);
          assert.ok(links.includes(`${docs}${guides[i-1]}`), `${label}: track ${i} guide`);
          assert.ok(links.includes(`https://www.codabench.org/competitions/${portals[i-1]}/`), `${label}: track ${i} portal`);
          assert.ok(links.includes(`leaderboard.html#track-${i}`), `${label}: track ${i} leaderboard`);
        }
        assert.ok(await page.eval(`!!document.querySelector('a[href="${docs}index.html"]')`), `${label}: main starter-kit URL`);
        for (let i=1; i<=4; i++) {
          await click(page, `#enter-${i} a[href="leaderboard.html#track-${i}"]`, true);
          assert.equal(await page.eval('location.pathname+location.hash'), `/leaderboard.html#track-${i}`, `${label}: track ${i} leaderboard handoff`);
          assert.ok(await page.eval(`(()=>{const r=document.querySelector('#track-${i}').getBoundingClientRect();return r.bottom>72&&r.top<innerHeight})()`), `${label}: track ${i} target not visible`);
          await click(page, `#track-${i} a[href="startkit.html#enter-${i}"]`, true);
          assert.equal(await page.eval('location.pathname+location.hash'), `/startkit.html#enter-${i}`, `${label}: track ${i} context lost on return`);
        }

      }
      assert.deepEqual(page.errors, [], `${label}: browser errors`);
      results.push({route,width,status:'PASS'});
      console.log(`PASS: ${label}`);
    } finally { await page.close(); }
  }
}
// A malformed shared URL must not abort the navigation initializer.
{
  const page=await open('leaderboard.html#%E0%A4%A',390,900);
  try {
    assert.deepEqual(page.errors, [], 'Malformed fragment caused a browser error');
    await click(page,'.site-menu-toggle');
    assert.equal(await page.eval("document.querySelector('.site-menu-toggle').getAttribute('aria-expanded')"),'true','Malformed fragment disabled navigation');
  } finally { await page.close(); }
}
// Navigation must remain usable when client-side JavaScript is unavailable.
{
  const page = await open('startkit.html',320,900);
  try {
    await page.call('Emulation.setScriptExecutionDisabled', {value:true});
    const loaded=page.once('Page.loadEventFired');
    await page.call('Page.reload');
    await loaded;
    const links=await page.eval(`[...document.querySelectorAll('.site-menu a')].map(a=>{const r=a.getBoundingClientRect(),s=getComputedStyle(a);return {width:r.width,height:r.height,visible:s.visibility!=='hidden'}})`);
    assert.ok(links.length && links.every(a=>a.visible&&a.width>=44&&a.height>=44), 'No-JS mobile navigation unavailable');
    await screenshot(page, `${output}/no-js-navigation-320.png`);
    console.log('PASS: no-JS mobile navigation');
  } finally { await page.close(); }
}
for (const width of [1440,390]) for (const route of ['index.html','startkit.html#enter','awards.html#track-prizes']) {
  const page=await open(route,width,900);
  try { await screenshot(page, `${output}/${route.replace(/[.#]/g,'-')}-${width}.png`); }
  finally { await page.close(); }
}
await writeFile(`${output}/results.json`, JSON.stringify(results,null,2)+'\n');
console.log(`PASS: ${results.length} page/viewport checks, track destinations, entry handoffs, mobile menu and six screenshots`);

}
export { click };
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
