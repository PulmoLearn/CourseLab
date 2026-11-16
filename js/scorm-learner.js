/* Student-side SCORM 1.2 host. Only accepts messages from our fixed R2 host and the launched iframe. */
window.CourseLabScorm=(()=>{'use strict';const R2_ORIGIN='https://pub-f447bd8682fb472ebdaa62d4fa514ca6.r2.dev';const $=(t,c)=>{const el=document.createElement(t);if(c)el.className=c;return el};
async function open({db,user,courseId,versionId,course,lessonArea,status}){
 const url=new URL(course.settings.scorm12.launchUrl);if(url.origin!==R2_ORIGIN||url.pathname!=='/educational-philosophies/courselab-launch.html')throw Error('Unsupported SCORM launch URL.');
 const {data:attempt,error:ae}=await db.from('courselab_scorm12_attempts').select('cmi').eq('course_id',courseId).eq('version_id',versionId).eq('learner_id',user.id).maybeSingle();if(ae)throw ae;
 const wrapper=$('section','panel'),heading=$('h2');heading.textContent='Original Rise course';const intro=$('p');intro.textContent='Your progress is saved when the course commits it to CourseLab. Use the Rise navigation and Exit control when finished.';const state=$('p');state.setAttribute('role','status');state.textContent='Preparing SCORM player…';const frame=$('iframe');frame.title=`${course.title} — Rise course`;frame.style.cssText='display:block;width:100%;height:min(78vh,950px);min-height:560px;border:1px solid #cbd5e1;border-radius:8px';frame.setAttribute('allow','fullscreen; autoplay');frame.src=url.href;const toolbar=$('div','actions'),reload=$('button','secondary');reload.type='button';reload.textContent='Reload Rise course';reload.onclick=()=>location.reload();toolbar.append(reload);wrapper.append(heading,intro,state,frame,toolbar);lessonArea.replaceChildren(wrapper);status('');
 let data=attempt?.cmi&&typeof attempt.cmi==='object'?attempt.cmi:{},dirty=false,saving=Promise.resolve(),lastSave=0;const send=(message)=>frame.contentWindow?.postMessage({source:'courselab-scorm-host',...message},R2_ORIGIN);
 async function persist(){if(!dirty)return saving;dirty=false;const snapshot=structuredClone(data);saving=saving.catch(()=>{}).then(async()=>{const {error}=await db.rpc('courselab_scorm12_save',{p_course:courseId,p_version:versionId,p_cmi:snapshot});if(error){dirty=true;throw error;}lastSave=Date.now();state.textContent='Rise progress saved.';});try{await saving;}catch(e){state.textContent='SCORM progress save failed: '+e.message;}}
 let flushTimer;const flush=()=>{clearTimeout(flushTimer);flushTimer=setTimeout(()=>persist(),800)};
 const onMessage=e=>{if(e.origin!==R2_ORIGIN||e.source!==frame.contentWindow)return;const msg=e.data;if(!msg||msg.source!=='courselab-scorm-bridge')return;
 if(msg.type==='ready'){send({type:'initialize',cmi:data,learnerId:user.id,learnerName:'Learner'});state.textContent='Opening Rise course…';}
 if(msg.type==='commit'){if(msg.cmi&&typeof msg.cmi==='object'&&!Array.isArray(msg.cmi)){data=msg.cmi;dirty=true;state.textContent='Saving Rise progress…';flush();}}
 if(msg.type==='finish'){if(msg.cmi&&typeof msg.cmi==='object'&&!Array.isArray(msg.cmi)){data=msg.cmi;dirty=true;clearTimeout(flushTimer);persist();}state.textContent='Rise session finished; saving progress…';}
 if(msg.type==='diagnostic'){state.textContent=String(msg.message||'SCORM player reported an issue.').slice(0,350);}
 };
 window.addEventListener('message',onMessage);
 const visibility=()=>{if(document.visibilityState==='hidden'&&dirty)persist();};document.addEventListener('visibilitychange',visibility);
 window.addEventListener('pagehide',()=>{if(dirty)persist();});
 return {frame};
 }
 return {open};})();