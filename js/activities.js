
/* Shared non-destructive four-edge image crop. Percentages are relative to the original image. */
const CourseLabImage={
 clamp(v,lo,hi,def){const n=Number(v);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):def},
 style(img,model){if(!img||!model)return;const x=model.imageStyle||{};let l=this.clamp(x.cropLeft,0,90,0),r=this.clamp(x.cropRight,0,90,0),t=this.clamp(x.cropTop,0,90,0),b=this.clamp(x.cropBottom,0,90,0);if(l+r>95)r=95-l;if(t+b>95)b=95-t;const w=100-l-r,h=100-t-b;
 let frame=img.parentElement?.classList.contains('cl-image-frame')?img.parentElement:null;if(!frame){frame=document.createElement('span');frame.className='cl-image-frame';img.parentNode?.insertBefore(frame,img);frame.append(img)}
 const width=this.clamp(x.width,10,100,100),border=this.clamp(x.borderWidth,0,12,0),radius=this.clamp(x.radius,0,80,0);frame.style.width=width+'%';frame.style.maxWidth='100%';frame.style.display='block';frame.style.position='relative';frame.style.overflow='hidden';frame.style.boxSizing='border-box';frame.style.border=border+'px solid '+(/^#[0-9a-f]{6}$/i.test(x.borderColor||'')?x.borderColor:'#087f78');frame.style.borderRadius=radius+'px';frame.style.marginLeft=x.position==='right'||x.position!=='left'&&x.position!=='center'?'auto':x.position==='center'?'auto':'0';frame.style.marginRight=x.position==='left'||x.position!=='left'&&x.position!=='center'?'auto':x.position==='center'?'auto':'0';
 const updateRatio=()=>{if(img.naturalWidth&&img.naturalHeight)frame.style.aspectRatio=`${img.naturalWidth*w}/${img.naturalHeight*h}`;else frame.style.aspectRatio='4/3'};img.addEventListener('load',updateRatio);updateRatio();img.style.position='absolute';img.style.maxWidth='none';img.style.width=(10000/w)+'%';img.style.height=(10000/h)+'%';img.style.left=-(l/w*100)+'%';img.style.top=-(t/h*100)+'%';img.style.margin='0';img.style.objectFit='fill';img.style.border='none';img.style.borderRadius='0';img.style.display='block';
 },
};
function applyImageSettings(img,b){CourseLabImage.style(img,b)}
function safeRichPreview(html){const t=document.createElement('template');t.innerHTML=html||'';const allowed=new Set(['STRONG','B','EM','I','U','SPAN','BR','DIV','P']);const walk=n=>{for(const c of [...n.childNodes]){if(c.nodeType===8){c.remove();continue}if(c.nodeType!==1)continue;if(!allowed.has(c.tagName)){const f=document.createDocumentFragment();while(c.firstChild)f.append(c.firstChild);c.replaceWith(f);walk(n);continue}const color=c.style.color,size=c.style.fontSize;for(const a of [...c.attributes])c.removeAttribute(a.name);if(c.tagName==='SPAN'){if(/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color))c.style.color=color;if(/^(?:1[0-9]|[2-5][0-9]|6[0-4])px$/.test(size))c.style.fontSize=size}walk(c)}};walk(t.content);return t.innerHTML}
function applyCourseLabAppearance(node,model,brand){const a=model?.appearance||{};const palette={text:'#243447',background:'#ffffff',accent1:'#087f78',accent2:'#4b83cc',accent3:'#e6a33d',...(brand||{})};const color=(choice,key)=>choice?.mode==='custom'?choice.hex:(palette[choice?.key]||palette[key]);const valid=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);const bg=color(a.backgroundChoice,'background'),border=color(a.borderChoice,'accent1'),fg=color(a.textChoice,'text');if(valid(bg))node.style.backgroundColor=bg;if(valid(border))node.style.borderColor=border;if(valid(fg))node.style.color=fg;node.style.borderStyle=a.borderEnabled?'solid':'none';node.style.borderWidth=a.borderEnabled?`${Math.max(1,Math.min(8,Number(a.borderWidth)||1))}px`:'0';node.style.borderRadius=a.rounded?`${Math.max(0,Math.min(32,Number(a.radius)||12))}px`:'0';node.style.fontFamily=['Arial','Verdana','Georgia','Trebuchet MS','Tahoma','Montserrat','Atkinson Hyperlegible'].includes(a.fontFamily||palette.fontBody)?(a.fontFamily||palette.fontBody):'Arial';node.style.fontSize=`${Math.max(10,Math.min(64,Number(a.fontSize)||16))}px`;node.style.fontWeight=a.bold?'700':'400';node.style.fontStyle=a.italic?'italic':'normal';node.style.textAlign=['left','center','right'].includes(a.textAlign)?a.textAlign:'left';node.style.padding=`${Math.max(6,Math.min(48,Number(a.padding)||16))}px`;}
/* CourseLab learner-preview activity engine. Local preview progress only. */
const CourseLabActivities=(()=>{
 const done=new Set();let update=()=>{};
 function element(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el}
 function mount(block){const root=element('div');root.className='activity-panel';const status=element('p');status.setAttribute('role','status');const finish=()=>{done.add(block.id);if(block.type!=='button')status.textContent+=' Completed.';update()};
 if(block.type==='button'){
  const b=element('button',block.label||'Continue');b.className='lesson-reveal-button';
  b.onclick=()=>{const action=block.buttonAction||(block.target?'external':'reveal');const target=(block.target||'').trim();
   if(action==='reveal'){b.disabled=true;b.setAttribute('aria-pressed','true');status.textContent='';finish();return}
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
   for(const side of ['front','back']){const face=element('span');face.className='flashcard-face flashcard-'+side;const asset=card[side+'ImageAssetId'];const url=card[side+'Image'];if(asset||url){const img=element('img');img.alt=card[side+'Alt']||'';face.append(img);CourseLabImage.style(img,{imageStyle:card[side+'ImageStyle']?.imageStyle});if(asset)CourseLabMedia.signedUrl(asset).then(src=>img.src=src).catch(()=>{img.alt='Image unavailable'});else if(/^https:\/\//i.test(url))img.src=url}
    const text=element('span',card[side]||'');face.append(text);const arrow=element('span','↻');arrow.className='flashcard-turn-icon';arrow.setAttribute('aria-hidden','true');face.append(arrow);flipper.append(face)}
   flipper.onclick=()=>{flipped=!flipped;flipper.classList.toggle('is-flipped',flipped);flipper.setAttribute('aria-label',flipped?'Show front of flashcard':'Show back of flashcard');if(flipped){viewed.add(index);if(viewed.size===cards.length&&cards.length)finish()}};
   scene.append(flipper);count.textContent=cards.length?`${index+1} of ${cards.length}`:'No cards added';previous.disabled=index===0;next.disabled=index>=cards.length-1;
  }
  previous.onclick=()=>{index--;flipped=false;show()};next.onclick=()=>{index++;flipped=false;show()};nav.append(previous,count,next);root.append(scene,nav,status);show();return root;
 }
 if(block.type==='multiple-choice'){
  const question=element('div');question.append(element('p',block.question||'Question'));root.append(question);
  function addImage(parent,assetId,url,alt,style){if(!assetId&&!url)return;const img=document.createElement('img');img.className='mc-image';img.alt=alt||'';parent.append(img);CourseLabImage.style(img,{imageStyle:style||{}});if(assetId)CourseLabMedia.signedUrl(assetId).then(src=>img.src=src).catch(()=>{img.alt='Image unavailable'});else if(/^https:\/\//i.test(url))img.src=url}
  addImage(question,block.questionImageAssetId,block.questionImage,block.questionImageAlt,block.questionImageStyle?.imageStyle);
  const group=element('div');const name='q-'+block.id;const options=block.choices||[];let picked=-1;const submit=element('button','Check answer');
  const shuffle=(arr)=>{for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
  function draw(){group.replaceChildren();picked=-1;const order=options.map((_,i)=>i);if(block.shuffleAnswers)shuffle(order);order.forEach(i=>{
   const label=element('label');label.className='choice';const radio=document.createElement('input');radio.type='radio';radio.name=name;radio.value=i;radio.onchange=()=>picked=i;
   const content=element('span',options[i]||'');addImage(content,block.choiceImageAssetIds?.[i],block.choiceImages?.[i],block.choiceAlts?.[i],block.choiceImageStyles?.[i]?.imageStyle);
   label.append(radio,content);group.append(label);
  })}
  submit.onclick=()=>{if(picked<0){status.textContent='Choose an answer first.';return}const correct=picked===Number(block.correct||0);const complete=record(correct);if(complete){submit.disabled=true;group.querySelectorAll('input').forEach(x=>x.disabled=true);if(!correct)status.textContent+=' Correct answer: '+(options[Number(block.correct||0)]||'not configured')}else draw()};
  draw();root.append(group,submit,status);return root
 }

 return root}
 function renderLesson(lesson,container){done.clear();container.replaceChildren();const blocks=[];const nodes=[];
 for(const section of lesson.sections||[]){
  const row=element('div');row.className='block-grid preview-row';row.dataset.cols=String(Math.min(3,Math.max(1,Number(section.cols)||1)));applyCourseLabAppearance(row,section,lesson.brandKit);
  for(const b of section.blocks||[]){
   const holder=element('section');holder.className='preview-block';holder.id=b.id;applyCourseLabAppearance(holder,b,lesson.brandKit);
   blocks.push(b);nodes.push(holder);row.append(holder);
  }
  container.append(row);
 };

 update=()=>{let locked=false;blocks.forEach((b,i)=>{const holder=nodes[i];holder.hidden=locked;if(!locked&&!holder.dataset.ready){holder.dataset.ready='yes';if(['flashcards','multiple-choice','button'].includes(b.type))holder.append(mount(b));else if(b.type==='text'){const rich=element('p');if(b.richHtml)rich.innerHTML=safeRichPreview(b.richHtml);else rich.textContent=b.text||'';holder.append(rich)}else if(b.type==='image'){const img=document.createElement('img');img.alt=b.decorative?'':(b.alt||'');holder.append(img);applyImageSettings(img,b);if(b.assetId)CourseLabMedia.signedUrl(b.assetId).then(url=>img.src=url).catch(()=>holder.append(element('p','Image unavailable')));else if((b.url||'').startsWith('https://'))img.src=b.url}else if(b.type==='video'){const frame=document.createElement('iframe');let src='';try{const u=new URL(b.url);if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))src='https://www.youtube-nocookie.com/embed/'+u.searchParams.get('v');else if(u.hostname==='youtu.be')src='https://www.youtube-nocookie.com/embed/'+u.pathname.slice(1);else if(['vimeo.com','www.vimeo.com'].includes(u.hostname))src='https://player.vimeo.com/video/'+u.pathname.split('/').filter(Boolean)[0]}catch{}if(src){frame.src=src;frame.title='Instructional video';frame.allow='fullscreen; picture-in-picture';frame.style.cssText='width:100%;aspect-ratio:16/9;border:0';holder.append(frame)}else holder.append(element('p','Video URL unavailable'))}else holder.append(element('p','Activity not yet supported'))}if((b.requireCompletion||(b.type==='button'&&(b.buttonAction||(!b.target?'reveal':'external'))==='reveal'))&&!done.has(b.id))locked=true});};update();return {completed:done}}
 return {renderLesson};})();
