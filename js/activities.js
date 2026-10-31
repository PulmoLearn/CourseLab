/* CourseLab learner-preview activity engine. Local preview progress only. */
const CourseLabActivities=(()=>{
 const done=new Set();let update=()=>{};
 function element(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el}
 function mount(block){const root=element('div');root.className='activity-panel';const status=element('p');status.setAttribute('role','status');const finish=()=>{done.add(block.id);status.textContent+=' Completed.';update()};
 if(block.type==='button'){
  const b=element('button',block.label||'Continue');b.className='lesson-reveal-button';
  b.onclick=()=>{const action=block.buttonAction||(block.target?'external':'reveal');const target=(block.target||'').trim();
   if(action==='reveal'){b.disabled=true;b.setAttribute('aria-pressed','true');status.textContent='Content unlocked.';finish();return}
   if(action==='internal'||target.startsWith('#')){const node=document.getElementById(target.replace(/^#/,''));if(node)node.scrollIntoView({behavior:'smooth'});else status.textContent='Destination not found.'}
   else if(action==='external'&&/^https:\/\//i.test(target))window.open(target,'_blank','noopener,noreferrer');
   else status.textContent='Enter a valid destination in the editor.'};root.append(b,status);return root}

 let attempts=0,scores=[];const max=block.maxAttempts==='unlimited'?Infinity:Math.max(1,Number(block.maxAttempts)||3);const mode=block.completionMode||'correct';
 function record(correct){attempts++;scores.push(correct?100:0);const grade=block.gradeMode==='first'?scores[0]:block.gradeMode==='latest'?scores.at(-1):Math.max(...scores);const exhausted=attempts>=max;status.textContent=(correct?'Correct. ':'Try again. ')+`Attempt ${attempts}${Number.isFinite(max)?' of '+max:''}. ${mode==='graded'?'Recorded preview score: '+grade+'%. ':''}`;
 if(correct||mode==='participation'||(mode==='graded'&&exhausted)){finish();return true}
 if(exhausted){status.textContent+=' Attempts used; review the answer and continue.';finish();return true}return false}
 if(block.type==='flashcards'){
  const cards=Array.isArray(block.cards)?block.cards:[];let index=0,flipped=false;const scene=element('div');scene.className='flashcard-scene';const nav=element('div');nav.className='flashcard-nav';
  const previous=element('button','Previous');previous.className='secondary';const count=element('span');const next=element('button','Next');next.className='secondary';
  const viewed=new Set();
  function show(){scene.replaceChildren();const card=cards[index]||{};const flipper=element('button');flipper.type='button';flipper.className='flashcard-flipper'+(flipped?' is-flipped':'');flipper.setAttribute('aria-label',flipped?'Show front of flashcard':'Show back of flashcard');
   for(const side of ['front','back']){const face=element('span');face.className='flashcard-face flashcard-'+side;const asset=card[side+'ImageAssetId'];const url=card[side+'Image'];if(asset||url){const img=element('img');img.alt=card[side+'Alt']||'';face.append(img);if(asset)CourseLabMedia.signedUrl(asset).then(src=>img.src=src).catch(()=>{img.alt='Image unavailable'});else if(/^https:\/\//i.test(url))img.src=url}
    const text=element('span',card[side]||'');face.append(text);const arrow=element('span','↻');arrow.className='flashcard-turn-icon';arrow.setAttribute('aria-hidden','true');face.append(arrow);flipper.append(face)}
   flipper.onclick=()=>{flipped=!flipped;flipper.classList.toggle('is-flipped',flipped);flipper.setAttribute('aria-label',flipped?'Show front of flashcard':'Show back of flashcard');if(flipped){viewed.add(index);if(viewed.size===cards.length&&cards.length)finish()}};
   scene.append(flipper);count.textContent=cards.length?`${index+1} of ${cards.length}`:'No cards added';previous.disabled=index===0;next.disabled=index>=cards.length-1;
  }
  previous.onclick=()=>{index--;flipped=false;show()};next.onclick=()=>{index++;flipped=false;show()};nav.append(previous,count,next);root.append(scene,nav,status);show();return root;
 }
 if(block.type==='multiple-choice'){
  const question=element('div');question.append(element('p',block.question||'Question'));root.append(question);
  function addImage(parent,assetId,url,alt){if(!assetId&&!url)return;const img=document.createElement('img');img.className='mc-image';img.alt=alt||'';parent.append(img);if(assetId)CourseLabMedia.signedUrl(assetId).then(src=>img.src=src).catch(()=>{img.alt='Image unavailable'});else if(/^https:\/\//i.test(url))img.src=url}
  addImage(question,block.questionImageAssetId,block.questionImage,block.questionImageAlt);
  const group=element('div');const name='q-'+block.id;const options=block.choices||[];let picked=-1;const submit=element('button','Check answer');
  const shuffle=(arr)=>{for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
  function draw(){group.replaceChildren();picked=-1;const order=options.map((_,i)=>i);if(block.shuffleAnswers)shuffle(order);order.forEach(i=>{
   const label=element('label');label.className='choice';const radio=document.createElement('input');radio.type='radio';radio.name=name;radio.value=i;radio.onchange=()=>picked=i;
   const content=element('span',options[i]||'');addImage(content,block.choiceImageAssetIds?.[i],block.choiceImages?.[i],block.choiceAlts?.[i]);
   label.append(radio,content);group.append(label);
  })}
  submit.onclick=()=>{if(picked<0){status.textContent='Choose an answer first.';return}const correct=picked===Number(block.correct||0);const complete=record(correct);if(complete){submit.disabled=true;group.querySelectorAll('input').forEach(x=>x.disabled=true);if(!correct)status.textContent+=' Correct answer: '+(options[Number(block.correct||0)]||'not configured')}else draw()};
  draw();root.append(group,submit,status);return root
 }

 return root}
 function renderLesson(lesson,container){done.clear();container.replaceChildren();const blocks=(lesson.sections||[]).flatMap(s=>s.blocks||[]);const nodes=[];for(const b of blocks){const holder=element('section');holder.className='preview-block';holder.id=b.id;nodes.push(holder);container.append(holder)};
 update=()=>{let locked=false;blocks.forEach((b,i)=>{const holder=nodes[i];holder.hidden=locked;if(!locked&&!holder.dataset.ready){holder.dataset.ready='yes';if(['flashcards','multiple-choice','button'].includes(b.type))holder.append(mount(b));else if(b.type==='text')holder.append(element('p',b.text||''));else if(b.type==='image'){const img=document.createElement('img');img.alt=b.decorative?'':(b.alt||'');holder.append(img);if(b.assetId)CourseLabMedia.signedUrl(b.assetId).then(url=>img.src=url).catch(()=>holder.append(element('p','Image unavailable')));else if((b.url||'').startsWith('https://'))img.src=b.url}else if(b.type==='video'){const frame=document.createElement('iframe');let src='';try{const u=new URL(b.url);if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))src='https://www.youtube-nocookie.com/embed/'+u.searchParams.get('v');else if(u.hostname==='youtu.be')src='https://www.youtube-nocookie.com/embed/'+u.pathname.slice(1);else if(['vimeo.com','www.vimeo.com'].includes(u.hostname))src='https://player.vimeo.com/video/'+u.pathname.split('/').filter(Boolean)[0]}catch{}if(src){frame.src=src;frame.title='Instructional video';frame.allow='fullscreen; picture-in-picture';frame.style.cssText='width:100%;aspect-ratio:16/9;border:0';holder.append(frame)}else holder.append(element('p','Video URL unavailable'))}else holder.append(element('p','Activity not yet supported'))}if((b.requireCompletion||(b.type==='button'&&(b.buttonAction||(!b.target?'reveal':'external'))==='reveal'))&&!done.has(b.id))locked=true});};update();return {completed:done}}
 return {renderLesson};})();
