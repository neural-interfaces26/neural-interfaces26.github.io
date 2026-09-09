import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { open, press, screenshot } from './visual-detail-check.mjs';

const output = process.env.OUTPUT_DIR || '/tmp/neural-journey';
const docs = 'https://facebookresearch.github.io/neuroai/neuralbench/auto_examples/biosignal_challenge_2026/';
const portals = [17974, 17982, 17983, 17984];
const guides = ['plot_track1_eeg_to_image.html', 'plot_track2_eeg_to_bci.html', 'plot_track3_sleep_onset.html', 'plot_track4_emg_to_pose.html'];
const routes = (process.env.JOURNEY_ROUTES || 'index.html,tracks.html,register.html,startkit.html,awards.html,faq.html,leaderboard.html,organizers.html,ethics.html,track-record.html,404.html').split(',');
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
      const state = await page.eval(`(()=>{const client=document.documentElement.clientWidth;return {width:innerWidth,client,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,overflowers:[...document.querySelectorAll('body *')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName.toLowerCase(),class:e.className?.toString?.()||'',id:e.id,left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)}}).filter(r=>r.left<-1||r.right>client+1).slice(0,12),brand:document.querySelector('.site-brand')?.textContent.trim(),brandImages:document.querySelectorAll('.site-brand img').length,nav:[...document.querySelectorAll('.site-menu a')].map(a=>[a.textContent.trim(),a.getAttribute('href')]),register:document.querySelector('.site-menu .primary')?.getAttribute('href')}})()`);
      assert.equal(state.scroll, state.client, `${label}: document overflow ${JSON.stringify(state.overflowers)}`);
      assert.equal(state.body, state.client, `${label}: body overflow ${JSON.stringify(state.overflowers)}`);
      assert.equal(state.register, 'register.html', `${label}: registration detour`);
      assert.equal(state.brand, 'EEG/EMG Foundation Challenge · NeurIPS 2026', `${label}: incomplete masthead title`);
      assert.equal(state.brandImages, 0, `${label}: decorative masthead logo remains`);
      assert.ok(state.nav.some(([text, href])=>text==='Prizes'&&href==='awards.html'), `${label}: prizes missing`);
      if (width <= 1280) {
        await click(page, '.site-menu-toggle');
        assert.equal(await page.eval("document.querySelector('.site-menu-toggle').getAttribute('aria-expanded')"), 'true', `${label}: menu did not open`);
        await press(page, 'Escape', 'Escape', 27);
        assert.ok(await page.eval("document.activeElement.matches('.site-menu-toggle') && document.querySelector('.site-menu-toggle').getAttribute('aria-expanded') === 'false'"), `${label}: Escape/focus failed`);
      }
      if (route === 'index.html') {
        assert.deepEqual(await page.eval(`[...document.querySelectorAll('.campaign-hero .bs-hero-cta a')].map(a=>[a.textContent.trim(),a.getAttribute('href')])`),[['Explore the tracks →','tracks.html'],['Register →','register.html#enter']],`${label}: homepage hero actions`);
        assert.equal(await page.eval(`document.querySelectorAll('.journey-overview-grid a').length`),4,`${label}: homepage route summary`);
        assert.equal(await page.eval(`document.querySelectorAll('.journey-overview-intro p').length`),0,`${label}: removed route-summary paragraph remains`);
        assert.equal(await page.eval(`getComputedStyle(document.querySelector('.journey-overview-intro')).textAlign`),'center',`${label}: route-summary introduction is not centered`);
        if(width>900)assert.ok(await page.eval(`document.querySelector('.campaign-hero-lead').getBoundingClientRect().width>=${width>=1200?570:450}`),`${label}: homepage lead block is not wider`);
        assert.equal(await page.eval(`document.querySelectorAll('.timeline-progress-milestones i').length`),5,`${label}: timeline boundaries`);
        if (width > 900) assert.ok(await page.eval(`(()=>{const bars=[...document.querySelectorAll('.timeline-progress-milestones i')].map(e=>e.getBoundingClientRect().left);const cells=[...document.querySelectorAll('.timeline-panel li')];const edges=cells.map(e=>e.getBoundingClientRect().left);edges.push(cells.at(-1).getBoundingClientRect().right);return bars.length===edges.length&&bars.every((x,i)=>Math.abs(x-edges[i])<=1)})()`),`${label}: timeline bars do not align with phase ribbon`);
        const sponsors=await page.eval(`(()=>{const grids=[...document.querySelectorAll('.sponsor-groups .vb-logo-grid')],titles=[...document.querySelectorAll('#sponsors .vb-logo-mark')].map(a=>a.title).filter(t=>t!=='Amazon Web Services'),participating=[...document.querySelectorAll('.vb-logo-grid--six-up .vb-logo-mark')],alert=document.querySelector('.launch-alert'),alertRect=alert?.getBoundingClientRect(),timeline=document.querySelector('.timeline-countdown');return {unique:new Set(titles).size,tops:grids.map(g=>g.getBoundingClientRect().top),widths:grids.map(g=>g.getBoundingClientRect().width),dividers:[...document.querySelectorAll('#sponsors .vb-logo-mark')].map(e=>parseFloat(getComputedStyle(e).borderRightWidth)),participatingRules:participating.map(e=>parseFloat(getComputedStyle(e).borderBottomWidth)),countdown:alert?.getAttribute('aria-label'),countdownParts:document.querySelectorAll('[data-countdown-to] [data-cd-days],[data-countdown-to] [data-cd-hours],[data-countdown-to] [data-cd-mins],[data-countdown-to] [data-cd-secs]').length,countdownRoots:document.querySelectorAll('[data-countdown-to]').length,alertWidth:alertRect?.width,alertHeight:alertRect?.height,alertCentered:alertRect?Math.abs((alertRect.left+alertRect.width/2)-innerWidth/2)<=1:false,pulse:getComputedStyle(document.querySelector('.launch-alert-label i')).animationName,timelineInside:timeline?.closest('.timeline-panel li')===document.querySelector('.timeline-panel li'),timelineColor:timeline?getComputedStyle(timeline).color:''}})()`);
        assert.equal(sponsors.unique,17,`${label}: home sponsor wall must include the complete 17-institution organizer set`);
        assert.equal(sponsors.countdownRoots,2,`${label}: homepage needs hero and timeline countdowns`);
        assert.equal(sponsors.countdownParts,8,`${label}: competition countdowns are incomplete`);
        assert.ok(sponsors.countdown?.includes('competition'),`${label}: launch countdown is not announced accessibly`);
        assert.ok(sponsors.timelineInside&&sponsors.timelineColor==='rgb(165, 31, 45)',`${label}: red countdown is not aligned with Competition opens`);
        if(width>900){assert.ok(sponsors.alertWidth>=880&&sponsors.alertHeight>=78&&sponsors.alertCentered,`${label}: launch announcement is not large and centered`);assert.equal(sponsors.pulse,'launch-pulse',`${label}: launch indicator does not pulse`);assert.ok(sponsors.tops.every((top,i,a)=>i===0||top>a[i-1]),`${label}: sponsor role groups are not stacked clearly`);assert.ok(Math.max(...sponsors.widths)-Math.min(...sponsors.widths)<=1,`${label}: sponsor role rules are misaligned`);assert.ok(sponsors.dividers.every(n=>n===0),`${label}: sponsor logo dividers remain`);assert.ok(sponsors.participatingRules.every(n=>n===1),`${label}: participating-institution row rule is missing`);}
        assert.ok(await page.eval("(()=>{const r=document.querySelector('.campaign-hero .primary').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()"), `${label}: entry CTA below first screen`);
        await click(page, '.campaign-hero .primary', true);
        assert.equal(await page.eval('location.pathname+location.hash'), '/tracks.html', `${label}: homepage tracks entry failed`);
      }
      if (route === 'tracks.html') {
        assert.equal(await page.eval(`document.querySelectorAll('.tracks-hero-actions,.home-track-compare').length`),0,`${label}: redundant track navigation remains`);
        const expectedOrganizers=['team-eeg','team-bci','team-sleep','team-emg'];
        for (let i=1; i<=4; i++) {
          const actions=await page.eval(`[...document.querySelectorAll('#track-${i} .track-card-footer a')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href')}))`);
          assert.deepEqual(actions.map(a=>a.href),[`register.html#enter-${i}`,`startkit.html`,`#dataset-track-${i}`,`awards.html#award-track-${i}`,`organizers.html#${expectedOrganizers[i-1]}`],`${label}: wrong track ${i} links`);
          assert.deepEqual(actions.map(a=>a.text),['Register →','Prepare →','Dataset →','Prizes →','Track leaders →'],`${label}: wrong track ${i} action labels`);
          assert.ok(actions.every(a=>a.text.endsWith('→')),`${label}: track ${i} actions need directional arrows`);
          const leaderboard=await page.eval(`(()=>{const card=document.querySelector('#track-${i}');const heading=card?.querySelector('.track-card-heading');const link=card?.querySelector('.track-leaderboard-button');if(!heading||!link)return null;const h=heading.getBoundingClientRect(),l=link.getBoundingClientRect();return {href:link.getAttribute('href'),text:link.textContent.trim(),inside:l.top>=h.top-1&&l.bottom<=h.bottom+1}})()`);
          assert.equal(leaderboard?.href,`leaderboard.html#track-${i}`,`${label}: track ${i} leaderboard destination`);
          assert.ok(leaderboard?.text.includes('🏆')&&leaderboard.text.endsWith('→'),`${label}: track ${i} leaderboard needs trophy and arrow`);
          assert.ok(leaderboard?.inside,`${label}: track ${i} leaderboard is not aligned with the heading`);
          assert.equal(await page.eval(`document.querySelector('#track-${i} .track-guide-button')?.getAttribute('href')`),`${docs}${guides[i-1]}`,`${label}: track ${i} NeuralBench guide missing from description`);
          const copy=await page.eval(`document.querySelector('#track-${i} > p:not(.track-facts)')?.textContent.trim()`);
          assert.ok(copy&&copy.split(/\\s+/).length<=80,`${label}: track ${i} description exceeds 80 words`);
          assert.ok(!/\b(?:Metric|Sponsor):/.test(copy),`${label}: track ${i} retains Metric or Sponsor metadata`);
        }
        const guideHeights=await page.eval(`[...document.querySelectorAll('.track-guide-button')].map(e=>e.getBoundingClientRect().height)`);
        assert.ok(Math.max(...guideHeights)-Math.min(...guideHeights)<=1,`${label}: track guide buttons have inconsistent heights`);
        const datasets = await page.eval(`(()=>{const directory=document.querySelector('section.dataset-directory');if(!directory)return null;const rows=[...directory.querySelectorAll('.ds-table .ds-row:not(.head)')];return {visible:getComputedStyle(directory).display!=='none',disclosure:!!document.querySelector('details.dataset-directory'),anchor:!!document.querySelector('#datasets'),client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,rows:rows.length+1,releases:document.querySelectorAll('.dataset-release-card[id^="dataset-track-"]').length,modalities:[...directory.querySelectorAll('.ds-table .mod')].map(e=>e.textContent.trim()),tracks:rows.map(r=>r.querySelector('.track-tag')?.textContent.trim()),cells:rows.map(r=>r.querySelectorAll('[role="cell"]').length)}})()`);
        assert.ok(datasets?.anchor && datasets.rows >= 2, `${label}: dataset directory missing`);
        assert.ok(datasets.visible && !datasets.disclosure && datasets.releases===4, `${label}: datasets must be directly visible with four releases`);
        assert.ok(await page.eval(`!document.querySelector('.dataset-table-heading')`),`${label}: redundant dataset-table heading remains`);
        assert.ok(datasets.modalities.every(m=>m==='EEG'||m==='EMG'),`${label}: dataset modalities must be EEG or EMG`);
        assert.deepEqual([...new Set(datasets.tracks)],['Track 01','Track 02','Track 03','Track 04'],`${label}: dataset track mapping incomplete`);
        assert.ok(datasets.cells.every(n=>n===8),`${label}: dataset rows must align to eight columns`);
        assert.equal(datasets.scroll, datasets.client, `${label}: dataset directory overflows the page`);
        assert.equal(await page.eval(`document.querySelectorAll('.track-facts').length`),0,`${label}: redundant track fact rows remain`);
        const introLinks=await page.eval(`[...document.querySelectorAll('.tracks-hero .page-hero-copy > p a')].map(a=>[a.textContent.trim(),a.getAttribute('href')])`);
        assert.deepEqual(introLinks,[['register','register.html#enter'],['get prepared','startkit.html']],`${label}: track introduction must keep only the two primary handoffs`);
      }
      if (route === 'register.html') {
        assert.equal(await page.eval(`document.querySelectorAll('.register-hero .page-hero-copy > p').length`),1,`${label}: registration introduction is redundant`);
        assert.deepEqual(await page.eval(`[...document.querySelectorAll('.register-hero .page-hero-copy > p a')].map(a=>a.textContent.trim())`),['compare the tracks','prizes and conditions','track teams'],`${label}: registration decision links are incomplete`);
        for (let i=1; i<=4; i++) {
          const links = await page.eval(`[...document.querySelectorAll('#enter-${i} a')].map(a=>a.getAttribute('href'))`);
          assert.ok(links.includes(`${docs}${guides[i-1]}`), `${label}: track ${i} guide`);
          assert.ok(links.includes(`https://www.codabench.org/competitions/${portals[i-1]}/`), `${label}: track ${i} portal`);
          assert.equal(links.length,2,`${label}: track ${i} registration card has unrelated links`);
        }
        assert.equal(await page.eval(`document.querySelectorAll('.entry-track').length`),4,`${label}: register page needs four track cards`);
        assert.equal(await page.eval(`document.querySelectorAll('main a[href^="leaderboard.html"]').length`),0,`${label}: registration content links to a leaderboard`);
      }
      if (route === 'startkit.html') {
        assert.equal(await page.eval(`document.querySelector('.startkit-hero h1')?.textContent.trim()`),'Get prepared with NeuralBench.',`${label}: preparation page naming`);
        assert.ok(await page.eval(`!!document.querySelector('a[href="${docs}index.html"]')`), `${label}: NeuralBench challenge hub URL`);
        assert.equal(await page.eval(`document.querySelectorAll('.entry-track').length`),0,`${label}: registration cards remain in preparation page`);
        assert.equal(await page.eval(`document.querySelectorAll('.prepare-step-number').length`),5,`${label}: preparation flow is not numbered`);
        assert.equal(await page.eval(`document.querySelectorAll('.prepare-guide-card').length`),4,`${label}: preparation page needs four track guides`);
        assert.equal(await page.eval(`document.querySelectorAll('.startkit-hero a[href="#install"]').length`),0,`${label}: redundant step 01 hero button remains`);
        assert.ok(await page.eval(`!!document.querySelector('a[href="${docs}plot_submission_guide.html"]')`),`${label}: submission guide missing`);
        assert.equal(await page.eval(`document.querySelectorAll('.prepare-phase-card').length`),2,`${label}: preparation phases are unclear`);
        assert.ok(await page.eval(`[...document.querySelectorAll('#install .prepare-step-head p,#track-guides .prepare-step-head p,#run-baseline .prepare-step-head p')].every(p=>p.textContent.trim().split(/\\s+/).length>=24)`),`${label}: first three preparation steps need didactic guidance`);
        for (let i=1; i<=4; i++) {
          assert.ok(await page.eval(`!!document.querySelector('#baseline-track-${i} .track-tag')`),`${label}: baseline track ${i} anchor missing`);
        }
        const baselineRows=await page.eval(`[...document.querySelectorAll('#baselines .ds-row:not(.head)')].map(r=>r.querySelectorAll('[role="cell"]').length)`);
        assert.ok(baselineRows.length>=4&&baselineRows.every(n=>n===7),`${label}: baseline table columns are misaligned`);
      }
      if (route === 'faq.html') {
        assert.equal(await page.eval(`document.querySelectorAll('details.vb-rule').length`),7,`${label}: seven rule disclosures`);
        assert.equal(await page.eval(`document.querySelectorAll('details.vb-rule[open]').length`),0,`${label}: rules should start collapsed`);
        assert.equal(await page.eval(`document.querySelector('.local-nav a')?.getAttribute('href')`),'startkit.html',`${label}: prepare navigation target`);
        await click(page,'#rule-eligibility summary');
        assert.ok(await page.eval(`document.querySelector('#rule-eligibility').open`),`${label}: rule disclosure did not open`);
      }
      if (route === 'awards.html') {
        assert.ok(await page.eval(`document.querySelector('#all-round')?.textContent.includes('$2,000')`),`${label}: Yneuro all-round award`);
        assert.ok(await page.eval(`document.querySelector('main')?.textContent.includes('$20,000')`),`${label}: prize pool total`);
        assert.equal(await page.eval(`document.querySelectorAll('.award-table .award-track-identity img').length`),4,`${label}: four track sponsor logos must be inside the table`);
        assert.equal(await page.eval(`document.querySelectorAll('.award-sponsor-strip').length`),0,`${label}: redundant sponsor strip remains`);
        assert.ok(await page.eval(`document.querySelector('.award-table-shell').compareDocumentPosition(document.querySelector('#all-round'))&Node.DOCUMENT_POSITION_FOLLOWING`),`${label}: all-round prize must follow the track table`);
        assert.equal(await page.eval(`document.querySelector('#award-track-1 td[data-label="1st"] a')`),null,`${label}: San Francisco internship remains linked`);
        assert.equal(await page.eval(`document.querySelectorAll('.award-allocation-note').length`),0,`${label}: cash allocation note remains`);
        if(width>900)assert.ok(await page.eval(`(()=>{const a=document.querySelector('.award-all-round').getBoundingClientRect(),s=document.querySelector('.award-table-shell').getBoundingClientRect();return Math.abs(a.width-s.width)<=1})()`),`${label}: all-round award is not full width`);
        const logoHeights=await page.eval(`[...document.querySelectorAll('.award-track-identity img')].map(i=>parseFloat(getComputedStyle(i).height))`);
        assert.ok(Math.max(...logoHeights)-Math.min(...logoHeights)<=1,`${label}: award sponsor logo frames are inconsistent`);
        const metaTransform=await page.eval(`getComputedStyle(document.querySelector('.award-track-identity img[alt="Meta Reality Labs"]')).transform`);
        assert.ok(metaTransform!=='none'&&metaTransform.includes('1.5'),`${label}: Meta Reality Labs logo is not enlarged`);
      }
      if (route === 'organizers.html') {
        assert.equal(await page.eval(`document.querySelectorAll('main a[href^="startkit.html"]').length`),0,`${label}: prepare-a-track button remains`);
        const organization=await page.eval(`(()=>{const ids=['team-core','team-eeg','team-bci','team-sleep','team-emg','team-advisors'],logos=[...document.querySelectorAll('.org-logo-stage img')].map(i=>i.alt);return {tops:ids.map(id=>document.getElementById(id).getBoundingClientRect().top),backgrounds:ids.map(id=>getComputedStyle(document.getElementById(id)).backgroundColor),leads:document.querySelectorAll('.org-directory .lead').length,meta:document.querySelectorAll('.org-team-meta').length,links:[...document.querySelectorAll('.org-track-link')].map(a=>a.getAttribute('href')),arnault:[...document.querySelectorAll('#arnault-caillet a')].map(a=>a.getAttribute('href')),thomas:document.querySelector('.name')&&[...document.querySelectorAll('.name')].find(e=>e.textContent.trim()==='Thomas Semah')?.closest('section')?.id,logos,logoUnique:new Set(logos).size}})()`);
        assert.ok(organization.tops.every((top,index,array)=>index===0||top>array[index-1]),`${label}: organizer section order`);
        assert.ok(organization.backgrounds.every((color,index,array)=>index===0||color!==array[index-1]),`${label}: organizer section backgrounds do not alternate`);
        assert.equal(organization.leads,0,`${label}: first organizer still spans both columns`);
        assert.equal(organization.meta,0,`${label}: noisy organizer counts or all-team links remain`);
        assert.deepEqual(organization.links,['tracks.html#track-1','tracks.html#track-2','tracks.html#track-3','tracks.html#track-4'],`${label}: track team links`);
        assert.ok(organization.arnault.includes('https://cailletarnault.github.io/'),`${label}: Arnault personal site`);
        assert.equal(organization.thomas,'team-core',`${label}: Thomas Semah must be in the core team`);
        assert.deepEqual(organization.logos.slice(0,3),['Yneuro','Inria','UC San Diego'],`${label}: institutional logo order must begin with the three hosts`);
        assert.equal(organization.logoUnique,organization.logos.length,`${label}: institutional logos repeat`);
      }
      if (route === 'leaderboard.html') {
        const prepareLinks=await page.eval(`[...document.querySelectorAll('.track-next-actions .primary')].map(a=>a.getAttribute('href'))`);
        assert.deepEqual(prepareLinks,guides.map(guide=>`${docs}${guide}`),`${label}: leaderboard preparation links must open the track guides`);
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
for (const width of [1440,390]) for (const route of ['index.html','tracks.html','register.html#enter','startkit.html#baselines']) {
  const page=await open(route,width,1600);
  try { await screenshot(page, `${output}/${route.replace(/[.#]/g,'-')}-${width}.png`); }
  finally { await page.close(); }
}
await writeFile(`${output}/results.json`, JSON.stringify(results,null,2)+'\n');
console.log(`PASS: ${results.length} page/viewport checks, track destinations, entry handoffs, mobile menu and eight screenshots`);

}
export { click };
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
