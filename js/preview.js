const backLink=document.querySelector('#back-to-editor');const previewParams=new URLSearchParams(location.search);if(backLink&&previewParams.get('course'))backLink.href='editor.html?course='+encodeURIComponent(previewParams.get('course'))+(previewParams.get('lesson')?'&lesson='+encodeURIComponent(previewParams.get('lesson')):'');
const p=new URLSearchParams(location.search),root=document.querySelector('#preview');
(async()=>{try{await CourseLabCloud.requireUser();const course=await CourseLabCloud.loadCourse(p.get('course'));const lessons=course.lessons;const requested=p.get('lesson');const firstIndex=Math.max(0,lessons.findIndex(l=>l.id===requested));const showLesson=async(index)=>{root.replaceChildren();const courseHeading=document.createElement('h1');courseHeading.textContent=course.title;root.append(courseHeading);const lesson=lessons[index];if(!lesson)return;const heading=document.createElement('h2');heading.textContent=lesson.title;root.append(heading);const content=document.createElement('div');root.append(content);lesson.brandKit=course.settings?.brandKit;
if(lesson.lessonType==='completion'){
  const settings=lesson.completionSettings||{};
  const card=document.createElement('section');
  card.className='cl-completion-card';
  card.style.cssText='padding:clamp(24px,5vw,56px);border-radius:20px;background:#fff;text-align:center;box-shadow:0 8px 28px rgba(11,31,51,.08);';
  const symbol=document.createElement('div');
  symbol.textContent='✓';
  symbol.setAttribute('aria-hidden','true');
  symbol.style.cssText='width:68px;height:68px;margin:0 auto 20px;border-radius:50%;background:#e4f7f1;color:#087e70;font-size:42px;line-height:68px;';
  const title=document.createElement('h3');
  title.textContent=settings.heading||'Congratulations!';
  title.style.cssText='font-size:clamp(28px,4vw,42px);margin:0 0 14px;';
  const message=document.createElement('p');
  message.textContent=settings.message||'You have completed this course.';
  message.style.cssText='font-size:18px;white-space:pre-wrap;line-height:1.6;';
  card.append(symbol,title,message);
  if(settings.showGrades){
    const note=document.createElement('p');
    note.textContent='Permitted grades will appear here when assessment scoring is available.';
    note.style.cssText='font-size:13px;opacity:.7;margin-top:24px;';
    card.append(note);
  }
  content.append(card);
}else{
  const note=document.createElement('p');note.className='small';note.setAttribute('role','status');
  const next=document.createElement('button');next.type='button';next.className='button';next.textContent='Continue to next lesson →';next.hidden=true;next.disabled=true;
  next.onclick=()=>{if(next.disabled||next.hidden)return;if(index<lessons.length-1){showLesson(index+1);root.scrollIntoView({behavior:'smooth',block:'start'});}else{next.disabled=true;next.textContent='Course preview complete ✓';note.textContent='Preview finished. Learner completion is saved only in the published course.'}};
  content.after(next,note);
  CourseLabActivities.renderLesson(lesson,content,state=>{next.hidden=!state.ready;next.disabled=!state.ready;note.textContent=state.ready?'All required blocks complete.':'Complete the required activities to continue.'});
}};await showLesson(firstIndex);}catch(err){root.textContent='Unable to load preview: '+err.message}})();
