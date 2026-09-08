// Interaction evidence complements assertions; it does not simulate human research.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {open,press,screenshot} from './visual-detail-check.mjs';
import {click} from './journey-check.mjs';

const output=process.env.OUTPUT_DIR || '/tmp/neural-ux-audit';
const routes=(process.env.UX_ROUTES || 'index.html,startkit.html,awards.html,leaderboard.html,faq.html,organizers.html,ethics.html,track-record.html,404.html').split(',');
const widths=(process.env.UX_WIDTHS || '1440,390').split(',').map(Number);
if(widths.some(w=>!Number.isInteger(w)||w<320||w>1920))throw Error('UX_WIDTHS must contain integer widths from 320 to1920');
const report={started:new Date().toISOString(),persona:'First-time ML researcher choosing a track, preparing a model, and finding registration; returning researcher resuming a track.',scope:'Local static-site interaction audit. Forms, accounts, destructive actions, and submission uploads are not present locally.',pages:[],findings:[]};
await mkdir(output,{recursive:true});
const axeSource=process.env.AXE_SOURCE ? await readFile(process.env.AXE_SOURCE,'utf8') : await (async()=>{const r=await fetch('https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js',{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`axe download: ${r.status}`);return r.text()})();
const visibility=`e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'}`;
for (const width of widths) for (const route of routes) {
  const label=`${route}@${width}`,page=await open(route,width,900),record={route,width,steps:[]};
  const step=async(action,selector)=>{
    const path=`${output}/${route.replace('.html','')}-${width}-${record.steps.length}.png`;
    await screenshot(page,path);
    record.steps.push({at:new Date().toISOString(),action,selector,screenshot:path,state:await page.eval(`({url:location.href,title:document.title,heading:document.querySelector('h1')?.textContent,scrollY})`),consoleErrors:[...page.errors],consoleWarnings:[...page.warnings],network:[...page.responses]});
  };
  try {
    record.inventory=await page.eval(`([...document.querySelectorAll('main a,main button,main summary')].map(e=>({tag:e.tagName,label:e.textContent.trim().replace(/\\s+/g,' '),href:e.getAttribute('href')})))`);
    await step('Initial page and available actions','main');
    const headingOrder=await page.eval(`(()=>{const h1=document.querySelector('main h1'),h2=document.querySelector('main h2');return !h2||!!(h1&&h1.compareDocumentPosition(h2)&Node.DOCUMENT_POSITION_FOLLOWING)})()`);
    if(!headingOrder)report.findings.push({surface:label,type:'page-orientation',impact:'serious',message:'A secondary heading appears before the page title'});
    record.navigationGeometry=await page.eval(`([...document.querySelectorAll('.local-nav a,.track-jump a')].filter(${visibility}).map(e=>{const box=e.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);const text=range.getBoundingClientRect();return {label:e.textContent.trim(),left:box.left,right:box.right,textLeft:text.left,textRight:text.right}}))`);
    for(const n of record.navigationGeometry)if(n.textLeft<n.left-1||n.textRight>n.right+1)report.findings.push({surface:label,type:'navigation-overlap',impact:'serious',measurement:n});
    if(route==='startkit.html'&&width<=390){
      record.choiceGeometry=await page.eval(`([...document.querySelectorAll('.track-jump a')].map(e=>{const r=e.getBoundingClientRect();return {label:e.textContent.trim(),top:r.top,bottom:r.bottom,left:r.left,right:r.right}}))`);
      if(record.choiceGeometry.length!==4||record.choiceGeometry.some(c=>c.top<72||c.bottom>844||c.left<0||c.right>width))report.findings.push({surface:label,type:'first-decision',impact:'serious',message:'All four track choices must be visible together on the entry screen',measurement:record.choiceGeometry});
    }
    if(route==='awards.html'&&width<=640){
      record.prizeGeometry=await page.eval(`([...document.querySelectorAll('.award-table tbody td')].map(e=>({text:e.textContent.trim(),width:e.getBoundingClientRect().width})))`);
      for(const p of record.prizeGeometry)if(p.text.length>12&&p.width<140)report.findings.push({surface:label,type:'prize-readability',impact:'serious',measurement:p});
    }

    await page.eval(axeSource);
    record.axe=await page.eval(`(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,impact:v.impact}))}})()`);
    for(const v of record.axe.violations)report.findings.push({surface:label,type:'accessibility',...v});
    if(route==='index.html'&&width===1440){
      await page.eval(`(()=>{window.uxPerf={lcp:null,cls:0,eventDurations:[]};new PerformanceObserver(l=>{for(const e of l.getEntries())uxPerf.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)uxPerf.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.interactionId)uxPerf.eventDurations.push(e.duration)}).observe({type:'event',buffered:true,durationThreshold:16})})()`);
      await click(page,'a[href="#tracks"]');
      report.performance={route,width,throttled:false,...await page.eval('uxPerf'),note:'Local sample; event durations are an interaction-latency proxy, not field INP. No event entries means below reporting threshold or unavailable, not a measured zero.'};
      if(report.performance.lcp>4000||report.performance.cls>0.25||report.performance.eventDurations.some(n=>n>500))report.findings.push({surface:label,type:'performance',impact:'serious',measurement:report.performance});
      await step('Opened track section; recorded local rendering and interaction metrics','a[href="#tracks"]');
    }
    const action=await page.eval(`(()=>{const visible=${visibility};const links=[...document.querySelectorAll('main a')].filter(visible);const e=links.find(a=>a.matches('.primary')&&(a.getAttribute('href').startsWith('#')||!new URL(a.href).host||new URL(a.href).origin===location.origin))||links.find(a=>a.getAttribute('href').startsWith('#'))||links.find(a=>new URL(a.href).origin===location.origin);if(!e)return null;return {href:e.getAttribute('href'),label:e.textContent.trim()}})()`);
    if(!action)throw Error('No local task or recovery action in main content');
    const selector=`main a[href=${JSON.stringify(action.href)}]`;
    const before=await page.eval('location.href');
    await click(page,selector,!action.href.startsWith('#'));
    const after=await page.eval('location.href');
    if(after===before)report.findings.push({surface:label,type:'interaction',impact:'serious',message:`No destination change after ${action.label}`});
    await step(`Followed ${action.label}`,selector);
    // Return to the same page through browser history, then navigate again by keyboard.
    const history=await page.call('Page.getNavigationHistory');
    if(history.currentIndex>0)await page.call('Page.navigateToHistoryEntry',{entryId:history.entries[history.currentIndex-1].id});
    await page.eval('new Promise(r=>setTimeout(r,700))');
    await step('Returned from task using browser Back','browser-history');
    if(!(await page.eval('location.pathname')).endsWith(route))throw Error('Back did not restore original page');
    if(width<=900){
      await click(page,'.site-menu-toggle');
      await press(page,'Tab','Tab',9);
      const focused=await page.eval(`(()=>{const e=document.activeElement,s=getComputedStyle(e);return {inMenu:!!e.closest('.site-menu'),text:e.textContent.trim(),focus:e.matches(':focus-visible'),outline:s.outlineStyle,shadow:s.boxShadow}})()`);
      if(!focused.inMenu||!focused.focus)throw Error('Keyboard cannot reach mobile navigation with visible focus');
      await step('Opened navigation and tabbed to the first destination','.site-menu-toggle');
      await press(page,'Escape','Escape',27);
      if(!await page.eval(`document.activeElement.matches('.site-menu-toggle')&&document.querySelector('.site-menu-toggle').getAttribute('aria-expanded')==='false'`))throw Error('Escape failed to close navigation and restore focus');
      await step('Closed navigation and restored focus','Escape');
    }
    const details=await page.eval(`(()=>{const e=document.querySelector('main details:not([open])');if(e&&!e.id)e.id='ux-audit-disclosure';return e?{id:e.id}:null})()`);
    if(details){
      const sel=`#${details.id} > summary`;
      await click(page,sel);
      if(!await page.eval(`document.querySelector(${JSON.stringify(sel)}).parentElement.open`))throw Error('Details did not open');
      await step('Opened supporting details',sel);
      if(route==='faq.html'&&width>=1024){
        const answer=await page.eval(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}).parentElement.querySelector('.faq-answer p');return e?e.getBoundingClientRect().width:null})()`);
        if(answer!==null&&answer<500)report.findings.push({surface:label,type:'answer-readability',impact:'serious',width:answer});
      }
    }
    if(page.errors.length||page.warnings.length||page.responses.some(r=>r.status>=500))report.findings.push({surface:label,type:'runtime',impact:'serious',errors:page.errors,warnings:page.warnings,network:page.responses.filter(r=>r.status>=500)});
    record.status='completed';
  }catch(error){record.status='failed';record.error=String(error);report.findings.push({surface:label,type:'interaction',impact:'serious',message:String(error)});}
  finally{report.pages.push(record);await writeFile(`${output}/manifest.json`,JSON.stringify(report,null,2)+'\n');await page.close();}
  console.log(`${record.status}: ${label}`);
}
report.finished=new Date().toISOString();
report.blockers=report.findings.filter(f=>['critical','serious'].includes(f.impact)).length;
await writeFile(`${output}/manifest.json`,JSON.stringify(report,null,2)+'\n');
console.log(`Interaction audit: ${report.pages.length} route/viewport walks, ${report.blockers} blockers. Evidence: ${output}/manifest.json`);
if(report.blockers)process.exitCode=1;
