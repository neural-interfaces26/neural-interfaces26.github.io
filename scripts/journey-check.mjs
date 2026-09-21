import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { open, press, screenshot } from './visual-detail-check.mjs';

const output = process.env.OUTPUT_DIR || '/tmp/neural-journey';
const docs = 'https://facebookresearch.github.io/neuroai/neuralbench/auto_examples/biosignal_challenge_2026/';
const portals = [17974, 17982, 17983, 17984];
const guides = ['plot_track1_eeg_to_image.html', 'plot_track2_eeg_to_bci.html', 'plot_track3_sleep_onset.html', 'plot_track4_emg_to_pose.html'];
const routes = (process.env.JOURNEY_ROUTES || 'index.html,tracks.html,register.html,participant-guide.html,prizes.html,rules.html,leaderboard.html,organizers.html,ethics.html,track-record.html,404.html').split(',');
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
      assert.equal(state.brand, 'EEG/EMG Foundation Challenge 2026', `${label}: incomplete masthead title`);
      assert.equal(state.brandImages, 0, `${label}: decorative masthead logo remains`);
      assert.ok(state.nav.some(([text, href])=>text==='Prizes'&&href==='prizes.html'), `${label}: prizes missing`);
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
        const sponsors=await page.eval(`(()=>{const grids=[...document.querySelectorAll('.sponsor-groups .vb-logo-grid')],titles=[...document.querySelectorAll('#sponsors .vb-logo-mark')].map(a=>a.title).filter(t=>t!=='Amazon Web Services'),participating=[...document.querySelectorAll('.vb-logo-grid--six-up .vb-logo-mark')],alert=document.querySelector('.launch-alert'),alertRect=alert?.getBoundingClientRect(),heroRect=document.querySelector('.campaign-hero-copy')?.getBoundingClientRect(),timeline=document.querySelector('.timeline-countdown');return {unique:new Set(titles).size,tops:grids.map(g=>g.getBoundingClientRect().top),bottoms:grids.map(g=>g.getBoundingClientRect().bottom),dividers:[...document.querySelectorAll('#sponsors .vb-logo-mark')].map(e=>parseFloat(getComputedStyle(e).borderRightWidth)),participatingRules:participating.map(e=>parseFloat(getComputedStyle(e).borderBottomWidth)),countdown:alert?.getAttribute('aria-label'),countdownParts:document.querySelectorAll('[data-countdown-to] [data-cd-days],[data-countdown-to] [data-cd-hours],[data-countdown-to] [data-cd-mins],[data-countdown-to] [data-cd-secs]').length,countdownRoots:document.querySelectorAll('[data-countdown-to]').length,alertWidth:alertRect?.width,alertHeight:alertRect?.height,alertLeftAligned:alertRect&&heroRect?Math.abs(alertRect.left-heroRect.left)<=1:false,alertRight:alertRect?.right,pulse:getComputedStyle(document.querySelector('.launch-alert-label i')).animationName,timelineInside:timeline?.closest('.timeline-panel li')===document.querySelector('.timeline-panel li'),timelineColor:timeline?getComputedStyle(timeline).color:''}})()`);
        assert.equal(sponsors.unique,17,`${label}: home sponsor wall must include the complete 17-institution organizer set`);
        assert.equal(sponsors.countdownRoots,2,`${label}: homepage needs hero and timeline countdowns`);
        assert.equal(sponsors.countdownParts,8,`${label}: competition countdowns are incomplete`);
        assert.ok(sponsors.countdown?.toLowerCase().includes('competition'),`${label}: launch status is not announced accessibly`);
        assert.ok(sponsors.countdown?.includes('October 24'),`${label}: registration deadline is missing from the launch announcement`);
        assert.ok(await page.eval(`document.querySelector('.timeline-panel li:nth-child(2) p')?.textContent.includes('Oct 24')`),`${label}: warm-up phase does not mention continued registration`);
        assert.ok(await page.eval(`document.querySelector('.timeline-panel li:nth-child(3)')?.textContent.includes('Oct 28')`),`${label}: sealed phase start is incorrect`);
        assert.ok(sponsors.timelineInside,`${label}: competition status is not aligned with Competition opens`);
        if(width>900){assert.ok(sponsors.alertWidth>=(width>=1200?780:600),`${label}: launch announcement is too small`);assert.ok(sponsors.alertHeight>=78&&sponsors.alertLeftAligned&&sponsors.alertRight<width*.8,`${label}: launch announcement is not aligned within the text side`);assert.ok(Math.max(...sponsors.tops)-Math.min(...sponsors.tops)<=1&&Math.max(...sponsors.bottoms)-Math.min(...sponsors.bottoms)<=1,`${label}: sponsor role groups are not aligned on one row`);assert.ok(sponsors.dividers.every(n=>n===0),`${label}: sponsor logo dividers remain`);assert.ok(sponsors.participatingRules.every(n=>n===1),`${label}: participating-institution row rule is missing`);}
        assert.ok(await page.eval("(()=>{const r=document.querySelector('.campaign-hero .primary').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()"), `${label}: entry CTA below first screen`);
        await click(page, '.campaign-hero .primary', true);
        assert.equal(await page.eval('location.pathname+location.hash'), '/tracks.html', `${label}: homepage tracks entry failed`);
      }
      if (route === 'tracks.html') {
        assert.equal(await page.eval(`document.querySelectorAll('.tracks-hero-actions,.home-track-compare').length`),0,`${label}: redundant track navigation remains`);
        assert.deepEqual(await page.eval(`[...document.querySelectorAll('.tracks-page-index a')].map(a=>[a.textContent.trim(),a.getAttribute('href')])`),[['Compare tracks ↓','#track-details'],['Jump to data ↓','#datasets']],`${label}: tracks and data shortcuts are incomplete`);
        const expectedOrganizers=['team-eeg','team-bci','team-sleep','team-emg'];
        for (let i=1; i<=4; i++) {
          const actions=await page.eval(`[...document.querySelectorAll('#track-${i} .track-card-footer a')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href')}))`);
          assert.deepEqual(actions.map(a=>a.href),[`register.html#enter-${i}`,`participant-guide.html`,`#dataset-track-${i}`,`prizes.html#award-track-${i}`,`organizers.html#${expectedOrganizers[i-1]}`],`${label}: wrong track ${i} links`);
          assert.deepEqual(actions.map(a=>a.text),['Register →','Guide →','Dataset →','Prizes →','Track leaders →'],`${label}: wrong track ${i} action labels`);
          assert.ok(actions.every(a=>a.text.endsWith('→')),`${label}: track ${i} actions need directional arrows`);
          const leaderboard=await page.eval(`(()=>{const card=document.querySelector('#track-${i}');const heading=card?.querySelector('.track-card-heading');const link=card?.querySelector('.track-leaderboard-button');if(!heading||!link)return null;const h=heading.getBoundingClientRect(),l=link.getBoundingClientRect();return {href:link.getAttribute('href'),text:link.textContent.trim(),inside:l.top>=h.top-1&&l.bottom<=h.bottom+1}})()`);
          assert.equal(leaderboard?.href,`leaderboard.html#track-${i}`,`${label}: track ${i} leaderboard destination`);
          assert.ok(leaderboard?.text.includes('🏆')&&leaderboard.text.endsWith('→'),`${label}: track ${i} leaderboard needs trophy and arrow`);
          assert.ok(leaderboard?.inside,`${label}: track ${i} leaderboard is not aligned with the heading`);
          assert.equal(await page.eval(`document.querySelector('#track-${i} .track-guide-button')?.getAttribute('href')`),`${docs}${guides[i-1]}`,`${label}: track ${i} NeuralBench guide missing from description`);
          const copy=await page.eval(`document.querySelector('#track-${i} > p:not(.track-facts)')?.textContent.trim()`);
          assert.ok(copy&&/\bMetric:/.test(copy),`${label}: track ${i} description is missing its metric`);
          assert.ok(await page.eval(`(()=>{const meta=document.querySelector('#track-${i} .track-data-meta');return meta&&getComputedStyle(meta).display==='block'&&parseFloat(getComputedStyle(meta).fontSize)===13})()`),`${label}: track ${i} metadata must use its compact block`);
          assert.ok(!/\bSponsor:/.test(copy),`${label}: track ${i} retains Sponsor metadata`);
        }
        const guideHeights=await page.eval(`[...document.querySelectorAll('.track-guide-button')].map(e=>e.getBoundingClientRect().height)`);
        assert.ok(Math.max(...guideHeights)-Math.min(...guideHeights)<=1,`${label}: track guide buttons have inconsistent heights`);
        const datasets = await page.eval(`(()=>{const directory=document.querySelector('section.dataset-directory');if(!directory)return null;const rows=[...directory.querySelectorAll('.ds-table .ds-row:not(.head)')];return {visible:getComputedStyle(directory).display!=='none',disclosure:!!document.querySelector('details.dataset-directory'),anchor:!!document.querySelector('#datasets'),client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,rows:rows.length+1,releases:document.querySelectorAll('.dataset-release-card[id^="dataset-track-"]').length,modalities:[...directory.querySelectorAll('.ds-table .mod')].map(e=>e.textContent.trim()),tracks:rows.map(r=>r.querySelector('.track-tag')?.textContent.trim()),cells:rows.map(r=>r.querySelectorAll('[role="cell"]').length)}})()`);
        assert.ok(datasets?.anchor && datasets.rows >= 2, `${label}: dataset directory missing`);
        assert.ok(datasets.visible && !datasets.disclosure && datasets.releases===4, `${label}: datasets must be directly visible with four releases`);
        assert.ok(await page.eval(`!document.querySelector('.dataset-table-heading')`),`${label}: redundant dataset-table heading remains`);
        assert.ok(datasets.modalities.every(m=>m==='EEG'||m==='EMG'),`${label}: dataset modalities must be EEG or EMG`);
        assert.deepEqual([...new Set(datasets.tracks)],['Track 01','Track 02','Track 03','Track 04'],`${label}: dataset track mapping incomplete`);
        assert.ok(datasets.cells.every(n=>n===9),`${label}: dataset rows must align to nine columns`);
        assert.equal(datasets.scroll, datasets.client, `${label}: dataset directory overflows the page`);
        assert.equal(await page.eval(`document.querySelectorAll('.track-facts').length`),0,`${label}: redundant track fact rows remain`);
        const introLinks=await page.eval(`[...document.querySelectorAll('.tracks-hero .page-hero-copy > p a')].map(a=>[a.textContent.trim(),a.getAttribute('href')])`);
        assert.deepEqual(introLinks,[['registering','register.html#enter']],`${label}: track introduction should route readers to registration only after comparison`);
        await click(page,'.tracks-page-index .data-link');
        assert.equal(await page.eval(`location.hash`),'#datasets',`${label}: data shortcut does not target the dataset directory`);
        assert.equal(await page.eval(`getComputedStyle(document.documentElement).scrollBehavior`),'smooth',`${label}: section shortcuts should scroll smoothly`);
      }
      if (route === 'register.html') {
        assert.equal(await page.eval(`document.querySelectorAll('.register-hero .page-hero-copy > p').length`),1,`${label}: registration introduction is redundant`);
        assert.ok(await page.eval(`document.querySelector('.register-hero .page-hero-copy > p')?.textContent.includes('through October 24')`),`${label}: registration page deadline missing`);
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
      if (route === 'participant-guide.html') {
        assert.equal(await page.eval(`document.querySelector('.startkit-hero h1')?.textContent.trim()`),'Your participant guide.',`${label}: participant guide naming`);
        assert.ok(await page.eval(`document.querySelector('.startkit-hero p')?.textContent.includes('you may use your own pipeline')`),`${label}: independent training path is unclear`);
        assert.ok(await page.eval(`!!document.querySelector('a[href="${docs}index.html"]')`), `${label}: NeuralBench challenge hub URL`);
        assert.equal(await page.eval(`document.querySelectorAll('.entry-track').length`),0,`${label}: registration cards remain in preparation page`);
        assert.equal(await page.eval(`document.querySelectorAll('.prepare-step-number').length`),4,`${label}: preparation flow should contain four numbered steps`);
        assert.equal(await page.eval(`document.querySelectorAll('.prepare-role-card').length`),3,`${label}: platform roles are unclear`);
        assert.equal(await page.eval(`document.querySelectorAll('#track-guides .prepare-guide-card').length`),4,`${label}: preparation page needs four optional start kits`);
        assert.equal(await page.eval(`document.querySelectorAll('#submit .prepare-portal-card').length`),4,`${label}: preparation page needs four Codabench portals`);
        assert.equal(await page.eval(`document.querySelectorAll('#submit .prepare-portal-card img[src^="exports/"][src*=".gif"]').length`),4,`${label}: Codabench portals need four track animations`);
        assert.equal(await page.eval(`document.querySelectorAll('#track-guides .prepare-guide-card .bs-code').length`),4,`${label}: each track needs its own quick-start commands`);
        assert.equal(await page.eval(`document.querySelectorAll('#track-guides .prepare-track-disclosure').length`),8,`${label}: each track needs quick-start and baseline disclosures`);
        assert.equal(await page.eval(`document.querySelectorAll('#track-guides .prepare-track-disclosure[open]').length`),0,`${label}: track tools should start collapsed`);
        assert.ok(await page.eval(`[...document.querySelectorAll('#track-guides .prepare-guide-card')].every(card=>card.querySelectorAll('.prepare-track-disclosure').length===2)`),`${label}: track tools are not contained in their matching cards`);
        assert.equal(await page.eval(`document.querySelectorAll('#track-guides .prepare-track-table-row:not(.head)').length`),10,`${label}: original public baseline results are incomplete`);
        assert.equal(await page.eval(`document.querySelectorAll('#track-guides .prepare-track-table-row.head [role="columnheader"]').length`),24,`${label}: track-specific baseline metadata is incomplete`);
        assert.equal(await page.eval(`document.querySelectorAll('#track-guides .prepare-track-reference').length`),4,`${label}: baseline sources must live inside each track disclosure`);
        assert.ok(await page.eval(`document.querySelector('#baseline-track-3 .prepare-track-reference')?.textContent.includes('unweighted mean')`),`${label}: sleep proxy metric definition is missing from its baseline disclosure`);
        assert.ok(await page.eval(`[...document.querySelectorAll('#track-guides .prepare-guide-card > a')].every(link=>{const box=link.getBoundingClientRect(),style=getComputedStyle(link);return box.height>=42&&style.backgroundColor!=='rgba(0, 0, 0, 0)'})`),`${label}: NeuralBench links must remain visually prominent buttons`);
        if (width > 900) {
          const portalSizes=await page.eval(`[...document.querySelectorAll('#submit .prepare-portal-card')].map(card=>({card:card.getBoundingClientRect().height,visual:card.querySelector('.prepare-portal-visual').getBoundingClientRect().height}))`);
          assert.ok(portalSizes.every(({card,visual})=>card<=240&&visual<=120),`${label}: Codabench animations dominate the compact portal cards`);
          assert.ok(await page.eval(`(()=>{const cards=[...document.querySelectorAll('#track-guides .prepare-guide-card')].map(card=>card.getBoundingClientRect());return cards[1].left-cards[0].right>=12})()`),`${label}: track quadrants need visible separation`);
        }
        await click(page, '#prepare-track-1 .prepare-track-disclosure:first-child > summary');
        assert.ok(await page.eval(`document.querySelector('#prepare-track-1 .prepare-track-disclosure:first-child')?.open`),`${label}: track quick start does not open`);
        await click(page, '#prepare-track-1 .prepare-track-disclosure:first-child > summary');
        await click(page, '#baseline-track-1 > summary');
        assert.ok(await page.eval(`document.querySelector('#baseline-track-1')?.open`),`${label}: track baseline results do not open`);
        assert.equal(await page.eval(`document.documentElement.scrollWidth`),await page.eval(`document.documentElement.clientWidth`),`${label}: opened track baseline causes page overflow`);
        if (width > 900) {
          assert.ok(await page.eval(`(()=>{const card=document.querySelector('#prepare-track-1').getBoundingClientRect(),panel=document.querySelector('#baseline-track-1').getBoundingClientRect(),grid=document.querySelector('.prepare-guide-grid').getBoundingClientRect();return panel.left-card.left>=12&&card.right-panel.right>=12&&card.width<grid.width*.6})()`),`${label}: opened tools must be inset inside their track quadrant`);
        }
        await click(page, '#baseline-track-1 > summary');
        assert.equal(await page.eval(`document.querySelectorAll('a[href$="plot_submission_guide.html"]').length`),0,`${label}: obsolete NeuralBench packaging guide remains`);
        assert.equal(await page.eval(`document.querySelectorAll('#build .prepare-phase-card').length`),2,`${label}: two training paths are unclear`);
        assert.ok(await page.eval(`(()=>{const text=document.querySelector('#submit')?.textContent||'';return text.includes('Submission Guide')&&text.includes('submission contract')&&text.includes('Get Started')})()`),`${label}: Codabench contract location is unclear`);
        for (let i=1; i<=4; i++) {
          assert.ok(await page.eval(`!!document.querySelector('#baseline-track-${i}')`),`${label}: baseline track ${i} anchor missing`);
          assert.ok(await page.eval(`!!document.querySelector('#submit a[href="https://www.codabench.org/competitions/${portals[i-1]}/#/participate-tab"]')`),`${label}: track ${i} Codabench Participation page missing`);
        }
      }
      if (route === 'rules.html') {
        assert.equal(await page.eval(`document.querySelectorAll('details.vb-rule').length`),8,`${label}: eight rule disclosures`);
        assert.ok(await page.eval(`document.querySelector('#faq-submit .faq-answer')?.textContent.includes('October 24')`),`${label}: registration FAQ deadline missing`);
        assert.equal(await page.eval(`document.querySelectorAll('details.vb-rule[open]').length`),0,`${label}: rules should start collapsed`);
        assert.equal(await page.eval(`document.querySelector('.local-nav a')?.getAttribute('href')`),'participant-guide.html',`${label}: prepare navigation target`);
        await click(page,'#rule-eligibility summary');
        assert.ok(await page.eval(`document.querySelector('#rule-eligibility').open`),`${label}: rule disclosure did not open`);
      }
      if (route === 'prizes.html') {
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
        assert.equal(await page.eval(`document.querySelectorAll('main a[href^="participant-guide.html"]').length`),0,`${label}: prepare-a-track button remains`);
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
  const page = await open('participant-guide.html',320,900);
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
for (const width of [1440,390]) for (const route of ['index.html','tracks.html','register.html#enter','participant-guide.html']) {
  const page=await open(route,width,1600);
  try { await screenshot(page, `${output}/${route.replace(/[.#]/g,'-')}-${width}.png`); }
  finally { await page.close(); }
}
await writeFile(`${output}/results.json`, JSON.stringify(results,null,2)+'\n');
console.log(`PASS: ${results.length} page/viewport checks, track destinations, entry handoffs, mobile menu and eight screenshots`);

}
export { click };
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
