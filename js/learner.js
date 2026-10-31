(async()=>{
 const db=CourseLabCloud.db, params=new URLSearchParams(location.search), test=params.get('test')==='1', courseId=params.get('course');
 const $=id=>document.getElementById(id), status=m=>$('learner-status').textContent=m;
 let user,course,version,lessons=[],index=0,completed=new Set();
 const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const progressTable=test?'instructor_test_progress':'learner_lesson_progress';
 try{
  user=await CourseLabCloud.requireUser();$('learner-account').textContent=user.email;
  if(test){$('page-title').textContent='Test Student · Instructor mode';$('join-panel').hidden=true;if(!courseId)throw Error('Choose a published course from your instructor dashboard.');}
  if(courseId){await openCourse(courseId);}else{await showCourses();}
 }catch(e){status('Unable to load: '+e.message)}
 async function showCourses(){status('Loading enrolled courses…');const {data,error}=await db.rpc('my_enrolled_courses');if(error)throw error;const list=$('learner-courses');list.replaceChildren();status('');if(!data?.length){status('No enrolled courses yet. Enter a code above to join.');return}
  for(const c of data){const el=document.createElement('article');el.className='card course-card';el.innerHTML=`<h3>${escape(c.title)}</h3><p>${escape(c.description)}</p><a class="button" href="learn.html?course=${encodeURIComponent(c.course_id)}">Open course</a>`;list.append(el)}
 }
 $('join-form').onsubmit=async e=>{e.preventDefault();status('Joining course…');const {error}=await db.rpc('join_course',{p_code:$('join-code').value.trim()});if(error){status(error.message);return}await showCourses()};
 async function openCourse(id){
  $('join-panel').hidden=true;$('learner-courses').hidden=true;$('lesson-area').hidden=false;status('Loading published lessons…');
  let versionId;
  if(test){const {data:c,error}=await db.from('courses').select('id,title,current_published_version_id').eq('id',id).single();if(error)throw error;versionId=c.current_published_version_id;}
  else{const {data,enrollError,error}=await db.rpc('my_enrolled_courses');if(error||enrollError)throw error||enrollError;const c=data?.find(x=>x.course_id===id);if(!c)throw Error('You are not enrolled in this course.');versionId=c.version_id;}
  if(!versionId)throw Error('This course is not published.');
  const {data:v,error:ve}=await db.from('course_versions').select('id,version_number,snapshot').eq('id',versionId).single();if(ve)throw ve;version=v;course=v.snapshot.course;lessons=[...(v.snapshot.lessons||[])].sort((a,b)=>a.position-b.position);
  $('course-name').textContent=course.title;$('version-label').textContent=`Published version ${v.version_number}${test?' · TEST STUDENT — excluded from official reporting':''}`;
  const {data:progress,error:pe}=await db.from(progressTable).select('lesson_id').eq('course_id',id).eq('version_id',v.id).eq(test?'instructor_id':'learner_id',user.id);if(pe)throw pe;
  completed=new Set((progress||[]).map(x=>x.lesson_id));if(!lessons.length){status('This published course has no lessons.');return}status('');
  $('mark-complete').onclick=async()=>{const l=lessons[index];const button=$('mark-complete');button.disabled=true;$('lesson-status').textContent='Saving completion…';try{const {error}=await db.from(progressTable).upsert({course_id:id,version_id:v.id,lesson_id:l.id,[test?'instructor_id':'learner_id']:user.id},{onConflict:`course_id,${test?'instructor_id':'learner_id'},lesson_id,version_id`,ignoreDuplicates:true});if(error)throw error;completed.add(l.id);if(index<lessons.length-1){index++;renderLesson();$('lesson-title').scrollIntoView({behavior:'smooth',block:'start'});}else{renderNav();$('lesson-status').textContent='Course lessons completed!';$('mark-complete').textContent='All lessons complete ✓';$('mark-complete').disabled=true;}}catch(e){$('lesson-status').textContent='Save failed: '+e.message;button.disabled=false;}};
  $('previous-lesson').onclick=()=>{if(index>0){index--;renderLesson()}};
  $('toggle-lessons').onclick=()=>{const nav=$('lesson-nav'),collapsed=nav.hidden=!nav.hidden;$('toggle-lessons').textContent=collapsed?'Show':'Hide';$('toggle-lessons').setAttribute('aria-expanded',String(!collapsed))};
  index=Math.max(0,lessons.findIndex(l=>!completed.has(l.id)));renderLesson();
 }
 function renderNav(){const nav=$('lesson-nav');nav.replaceChildren();lessons.forEach((l,i)=>{const b=document.createElement('button');b.type='button';b.className='cl-lesson-item'+(i===index?' is-active':'');b.textContent=`${completed.has(l.id)?'✓':String(i+1).padStart(2,'0')}  ${l.title}`;b.setAttribute('aria-current',i===index?'step':'false');b.onclick=()=>{index=i;renderLesson()};nav.append(b)});$('course-progress').textContent=`${completed.size} of ${lessons.length} lessons completed`}
 function renderLesson(){const l=lessons[index];renderNav();$('lesson-title').textContent=l.title;$('lesson-status').textContent=completed.has(l.id)?'Previously completed.':'In progress';$('previous-lesson').disabled=index===0;$('mark-complete').disabled=false;$('mark-complete').textContent=index===lessons.length-1?'Complete course ✓':'Continue to next lesson →';const model={...l,sections:l.content?.sections||[],brandKit:course.settings?.brandKit};CourseLabActivities.renderLesson(model,$('lesson-content'));
 }
})();
