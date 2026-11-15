/* Static, first-party CourseLab rendering for one imported instructor-owned course.
 * Uses normal CourseLab published versions and enrollment; no Rise player or license bypass.
 */
const CourseLabRise = (()=>{
 const BASE='imported/educational-philosophies/';
 let videoMapPromise;
 const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const announce=(node,message)=>{node.textContent=message};
 const textOnly=html=>{const x=document.createElement('div');x.append(rich(html));return x.textContent.trim()};
 function rich(raw){const root=e('div','rise-rich');const template=document.createElement('template');template.innerHTML=String(raw||'');const allow=new Set(['P','DIV','SPAN','STRONG','B','EM','I','U','BR','H1','H2','H3','H4','UL','OL','LI','A','BLOCKQUOTE','SUP','SUB']);
  const clean=n=>{for(const child of [...n.childNodes]){if(child.nodeType===8){child.remove();continue}if(child.nodeType!==1)continue;if(!allow.has(child.tagName)){const fragment=document.createDocumentFragment();while(child.firstChild)fragment.append(child.firstChild);clean(fragment);child.replaceWith(fragment);continue}const href=child.tagName==='A'?child.getAttribute('href'):null;for(const attr of [...child.attributes])child.removeAttribute(attr.name);if(href&&/^(https:\/\/|mailto:)/i.test(href)){child.setAttribute('href',href);if(href.startsWith('https://')){child.setAttribute('target','_blank');child.setAttribute('rel','noopener noreferrer')}}clean(child)}};
 clean(template.content);root.append(template.content);return root}
 function imagePath(file){return BASE+'assets/'+encodeURIComponent(file)}
 function embedUrl(value){try{const u=new URL(value);let id='';if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(u.hostname)){id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).at(-1)}else if(u.hostname==='youtu.be')id=u.pathname.slice(1);if(/^[\w-]{11}$/.test(id))return 'https://www.youtube-nocookie.com/embed/'+id}catch{}return null}
 async function getVideoMap(){if(!videoMapPromise)videoMapPromise=fetch(BASE+'video-urls.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Video map missing');return r.json()}).catch(()=>({}));return videoMapPromise}
 function render(lesson,container,onChange,research={}){container.replaceChildren();const blocks=lesson.content?.riseBlocks||[];const required=[];const completed=new Set();let live=true;
  const inform=()=>{if(live&&typeof onChange==='function')onChange({ready:required.every(k=>completed.has(k)),completed:completed.size,total:required.length})};
  const requirement=(key)=>{required.push(key);return ()=>{completed.add(key);inform()}};
  blocks.forEach((b,bi)=>{const wrapper=e('section','rise-import-block');wrapper.setAttribute('aria-label',`Lesson content section ${bi+1}`);container.append(wrapper);
   if(b.appearance && Object.keys(b.appearance).length){
    const a=b.appearance;
    const defaults={text:'#243447',background:'#ffffff',accent1:'#087f78',accent2:'#4b83cc',accent3:'#e6a33d'};
    const palette=(typeof window!=='undefined' && window.CourseLabBrandKit)||defaults;
    const color=(choice,fallback)=>{const v=choice?.mode==='custom'?choice.hex:palette[choice?.key||fallback];return /^#[0-9a-f]{6}$/i.test(v||'')?v:null};
    const text=color(a.textChoice,'text'),bg=color(a.backgroundChoice,'background'),border=color(a.borderChoice,'accent1');
    if(text)wrapper.style.color=text;if(bg)wrapper.style.backgroundColor=bg;
    if(a.borderEnabled){wrapper.style.border=`${Math.max(1,Math.min(8,Number(a.borderWidth)||1))}px solid ${border||defaults.accent1}`}
    if(a.rounded)wrapper.style.borderRadius=Math.max(0,Math.min(32,Number(a.radius)||12))+'px';
    if(a.fontFamily&&['Arial','Verdana','Georgia','Trebuchet MS','Tahoma','Montserrat','Atkinson Hyperlegible'].includes(a.fontFamily))wrapper.style.fontFamily=a.fontFamily;
    if(a.fontSize)wrapper.style.fontSize=Math.max(10,Math.min(64,Number(a.fontSize)))+'px';
    if(a.bold)wrapper.style.fontWeight='700';if(a.italic)wrapper.style.fontStyle='italic';
    if(['left','center','right'].includes(a.textAlign))wrapper.style.textAlign=a.textAlign;
    if(['top','middle','bottom'].includes(a.verticalAlign)){wrapper.style.display='flex';wrapper.style.flexDirection='column';wrapper.style.justifyContent={top:'flex-start',middle:'center',bottom:'flex-end'}[a.verticalAlign]}
    wrapper.style.padding=Math.max(6,Math.min(48,Number(a.padding)||16))+'px';
   }
   if(b.type==='text'){
    for(const item of b.items||[]){if(item.heading)wrapper.append(rich(item.heading));if(item.paragraph)wrapper.append(rich(item.paragraph));if(item.text)wrapper.append(rich(item.text));if(item.title)wrapper.append(rich(item.title))}
   }else if(b.type==='list'){
    const list=e(b.variant==='numbered'?'ol':'ul');for(const t of b.items||[]){const li=e('li');li.append(rich(t));list.append(li)}wrapper.append(list);
   }else if(b.type==='media'){
    for(const media of b.items||[]){if(media.type==='video'){
      const area=e('div','rise-video-area'),heading=e('p','small','Video · '+(media.duration||'?')+' seconds');area.append(heading);wrapper.append(area);
      getVideoMap().then(map=>{if(!live)return;const url=embedUrl(media.youtubeUrl||map[media.file]);if(url){const frame=e('iframe');frame.src=url;frame.title=`${lesson.title || 'Educational philosophies'} — video ${bi+1}${media.title ? ': '+textOnly(media.title) : ''}`;frame.setAttribute('allow','fullscreen; picture-in-picture; encrypted-media');frame.setAttribute('allowfullscreen','');frame.loading='lazy';area.append(frame)}else{const placeholder=e('div','rise-video-placeholder');if(media.poster){const img=e('img');img.src=imagePath(media.poster);img.alt='';placeholder.append(img)}placeholder.append(e('p','','Video awaiting instructor’s unlisted YouTube link.'));area.append(placeholder)}if(media.transcript){const details=e('details');details.append(e('summary','','Read video transcript'),e('p','rise-transcript',media.transcript));area.append(details)}});
    }else if(media.type==='image'){const key=media.media?.key||media.media?.src; if(key&&/\.(jpg|png|webp)$/i.test(key)){const img=e('img');img.src=imagePath(key);img.alt=media.media?.alt||'';wrapper.append(img)}}}
   }else if(b.type==='survey'){
    wrapper.append(e('h3','','Reflection / survey'));
    const saved=(research.saved||[]).find(x=>x.block_index===bi),fields=[];
    (b.items||[]).forEach((q,qi)=>{
     const key='survey-'+bi+'-'+qi,field=e('fieldset','rise-question'),legend=e('legend');legend.append(rich(q.question));field.append(legend);
     const type=q.questionType,choices=[];
     if(type==='LINEAR_SCALE'){
      const row=e('div','rise-scale');row.append(e('span','',q.startLabel||''));
      for(let i=1;i<=Math.min(10,q.scaleMax||5);i++){const lbl=e('label'),inp=e('input');inp.type='radio';inp.name=key;inp.value=String(i);lbl.append(inp,document.createTextNode(' '+i));row.append(lbl);choices.push(inp)}
      row.append(e('span','',q.endLabel||''));field.append(row);
     }else if(type==='LONG_RESPONSE'||type==='SHORT_RESPONSE'){
      const input=e('textarea');input.setAttribute('aria-label',textOnly(q.question)||`Written response ${qi+1}`);input.rows=type==='LONG_RESPONSE'?5:2;input.maxLength=q.maxLength||10000;
      input.placeholder='Type your response (avoid names or identifying details)';choices.push(input);field.append(input);
     }else if(type==='MULTIPLE_CHOICE'){
      for(const option of q.choices||[]){const label=e('label','rise-option'),input=e('input');input.type='radio';input.name=key;input.value=option.title||'';label.append(input,document.createTextNode(' '+(option.title||'')));field.append(label);choices.push(input)}
     }else{field.append(e('p','','Unsupported survey type: '+type))}
     fields.push({type,choices});wrapper.append(field);
    });
    const key='survey-'+bi,mark=requirement(key),msg=e('p','small'),button=e('button','secondary','Submit responses');button.type='button';msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');msg.setAttribute('aria-atomic','true');
    const getAnswers=()=>fields.map(({type,choices})=>type==='LONG_RESPONSE'||type==='SHORT_RESPONSE'?(choices[0]?.value||'').trim():type==='LINEAR_SCALE'?Number(choices.find(x=>x.checked)?.value||0):(choices.find(x=>x.checked)?.value||''));
    if(saved){(saved.answers||[]).forEach((a,i)=>{const f=fields[i];if(!f)return;if(['LONG_RESPONSE','SHORT_RESPONSE'].includes(f.type)){if(f.choices[0])f.choices[0].value=a;}else f.choices.forEach(x=>{x.checked=x.value===String(a)})});fields.flatMap(x=>x.choices).forEach(x=>x.disabled=true);mark();msg.textContent='Responses saved for research. This submission is locked.';}
    button.hidden=!!saved;button.onclick=async()=>{
     const answers=getAnswers();if(answers.some(x=>x===0||x==='')){announce(msg,'Please respond to every question before submitting.');const missing=answers.findIndex(x=>x===0||x==='');const first=fields[missing]?.choices?.[0];first?.focus();return}
     button.disabled=true;msg.textContent='Saving research responses…';
     try{const result=research.save?await research.save(bi,answers):{preview:true};
      fields.flatMap(x=>x.choices).forEach(x=>x.disabled=true);button.hidden=true;msg.textContent=result.preview?'Preview only — responses are not recorded.':'Responses saved under your confidential study participant ID.';mark();
     }catch(err){button.disabled=false;msg.textContent='Could not save. Your responses remain here; please retry. '+err.message}
    };wrapper.append(button,msg);
   }else if(b.type==='sorting'){
    wrapper.append(e('h3','','Sorting activity'));const pileTitles=new Map((b.piles||[]).map(p=>[String(p.id),p.title]));const selects=[];for(const [i,item] of (b.items||[]).entries()){const row=e('label','rise-sort-row');row.append(e('span','',item.title));const select=e('select');select.setAttribute('aria-label',`Category for ${item.title}`);select.append(new Option('Select a category',''));for(const [id,title] of pileTitles)select.append(new Option(title,id));selects.push(select);row.append(select);wrapper.append(row)}const msg=e('p','','');msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');const check=e('button','secondary','Check my answers');check.type='button';const mark=requirement('sort-'+bi);check.onclick=()=>{const all=selects.every(s=>s.value);if(!all){msg.textContent='Choose a category for every statement.';selects.find(s=>!s.value)?.focus();return}const count=selects.filter((s,i)=>s.value===String(b.items[i].pileId)).length;msg.textContent=`${count} of ${selects.length} correctly sorted.`;if(count===selects.length){mark();check.disabled=true}};wrapper.append(check,msg)
   }else if(b.type==='quiz'){
    wrapper.append(e('h3','','Educational Philosophies Assessment'));
    const saved=(research.saved||[]).find(x=>x.block_index===bi),questions=b.questions||[],selections=[];
    questions.forEach((q,qi)=>{const field=e('fieldset','rise-question'),legend=e('legend');legend.append(rich(q.title));field.append(legend);const opts=[];
     for(const answer of q.answers||[]){const label=e('label','rise-option'),input=e('input');input.type=q.type==='MULTIPLE_RESPONSE'?'checkbox':'radio';input.name='quiz-'+bi+'-'+qi;input.value=answer.id;label.append(input,rich(answer.title));field.append(label);opts.push(input)}
     selections.push({q,opts});wrapper.append(field)});
    const msg=e('p','',''),check=e('button','secondary','Submit assessment');msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');msg.setAttribute('aria-atomic','true');check.type='button',mark=requirement('quiz-'+bi);
    if(saved){selections.forEach(({opts},i)=>opts.forEach(x=>{x.checked=(saved.answers?.[i]||[]).includes(x.value);x.disabled=true}));
     msg.textContent=`Assessment submitted: ${saved.score} of ${saved.max_score} (${Math.round(100*saved.score/Math.max(1,saved.max_score))}%).`;mark()}
    check.hidden=!!saved;
    check.onclick=async()=>{
     const answers=selections.map(({opts})=>opts.filter(x=>x.checked).map(x=>x.value));
     if(answers.some(x=>!x.length)){msg.textContent='Answer every question before submitting.';const missing=answers.findIndex(x=>!x.length);selections[missing]?.opts?.[0]?.focus();return}
     check.disabled=true;msg.textContent='Saving assessment…';
     try{const result=research.save?await research.save(bi,answers):null;
      let correct=0;for(const {q,opts} of selections){const chosen=opts.filter(x=>x.checked).map(x=>x.value),expected=q.type==='MULTIPLE_RESPONSE'?(q.corrects||[]):[q.correct];if(chosen.length===expected.length&&chosen.every(x=>expected.includes(x)))correct++}
      const score=result&&!result.preview?result.score:correct,max=result&&!result.preview?result.max_score:questions.length;
      msg.textContent=`${result?.preview||!research.save?'Preview only · ':''}Assessment result: ${score} of ${max} (${Math.round(100*score/Math.max(1,max))}%).`;
      selections.flatMap(x=>x.opts).forEach(x=>x.disabled=true);mark();check.hidden=true;
     }catch(err){check.disabled=false;msg.textContent='Save failed; please retry. '+err.message}
    };wrapper.append(check,msg)
   }else if(b.type==='links'){for(const x of b.items||[]){const href=x.url||x.link||x.href;if(typeof href==='string'&&/^https:\/\//i.test(href)){const a=e('a','button secondary',x.title||'Open resource');a.href=href;a.target='_blank';a.rel='noopener noreferrer';wrapper.append(a)}}}
  });inform();return {isReady:()=>required.every(k=>completed.has(k)),dispose:()=>{live=false}};
 }
 return {render};
})();

// Expose the imported lesson renderer to the learner and preview pages.
if (typeof window !== "undefined") window.CourseLabRise = CourseLabRise;
