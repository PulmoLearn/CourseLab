(async()=>{
 const db=CourseLabCloud.db,$=id=>document.getElementById(id),id=new URLSearchParams(location.search).get('course');
 const status=$('research-status');let rows=[],lessons=[];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const plain=html=>{const el=document.createElement('div');el.innerHTML=String(html||'');return (el.textContent||'').replace(/\s+/g,' ').trim()};
 const table=(headers,data)=>{const t=document.createElement('table');t.style.cssText='width:100%;border-collapse:collapse';const thead=t.createTHead(),tr=thead.insertRow();headers.forEach(h=>{const th=document.createElement('th');th.textContent=h;th.style.padding='10px';tr.append(th)});
  const body=t.createTBody();data.forEach(row=>{const tr=body.insertRow();row.forEach(c=>{const td=tr.insertCell();td.style.padding='9px';td.textContent=c??'—'})});return t};
 const add=(parent,tag,text)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el};
 const pcts=(n,d)=>d?`${Math.round(n/d*100)}%`:'—';const avg=x=>x.length?(x.reduce((a,b)=>a+b,0)/x.length):null;
 const f=x=>x===null?'—':x.toFixed(2);const blocks=lesson=>lesson?.content?.riseBlocks||[];
 const findLesson=r=>lessons.find(l=>l.id===r.lesson_id);
 const questions=r=>{const block=blocks(findLesson(r))[r.block_index];return block?.type==='quiz'?block.questions||[]:block?.items||[]};
 const rowsFor=key=>rows.filter(r=>r.lesson_title.toLowerCase().includes(key));
 const cellContainer=(parent)=>{const d=document.createElement('div');d.style.overflowX='auto';parent.append(d);return d};
 const byParticipant=()=>[...new Set(rows.map(r=>r.participant_code))].sort();
 function overview(){const root=$('overview');root.replaceChildren();const participants=byParticipant(),pre=rowsFor('pre-course self-reflection'),post=rowsFor('post-course confidence'),quiz=rows.filter(r=>r.kind==='quiz');
  add(root,'p',`${participants.length} participants with recorded responses · ${pre.length} pre-course · ${post.length} post-course · ${quiz.length} assessment submissions.`);
  add(root,'p','Research responses are locked after initial submission. Instructor Test Student records are excluded.');}
 function confidence(){const root=$('confidence');root.replaceChildren();const pre=rowsFor('pre-course self-reflection'),post=rowsFor('post-course confidence');
  const preBy=new Map(pre.map(r=>[r.participant_code,r])),postBy=new Map(post.map(r=>[r.participant_code,r]));
  const pair=[...preBy.keys()].filter(k=>postBy.has(k));if(!pair.length){add(root,'p','No matched pre/post participant responses yet.');return}
  const qs=questions(pre[0]);const lines=qs.map((q,i)=>{const vals=pair.map(id=>[Number(preBy.get(id).answers[i]),Number(postBy.get(id).answers[i])]).filter(v=>v.every(Number.isFinite));return [plain(q.question),vals.length,f(avg(vals.map(v=>v[0]))),f(avg(vals.map(v=>v[1]))),f(avg(vals.map(v=>v[1]-v[0])))]});
  cellContainer(root).append(table(['Confidence question','Paired n','Pre mean','Post mean','Mean change'],lines));
  const meanPerPerson=pair.map(code=>{const x=preBy.get(code).answers.map(Number),y=postBy.get(code).answers.map(Number);return [code, f(avg(x)),f(avg(y)),f(avg(y.map((z,i)=>z-x[i])))]});
  add(root,'h3','Paired confidence change by participant');cellContainer(root).append(table(['Participant','Pre mean','Post mean','Change'],meanPerPerson));
  const changes=meanPerPerson.map(x=>Number(x[3]));add(root,'p',`Paired participants: ${pair.length}. Improved: ${changes.filter(x=>x>0).length}; unchanged: ${changes.filter(x=>x===0).length}; decreased: ${changes.filter(x=>x<0).length}.`);
 }
 function assessment(){const root=$('assessment');root.replaceChildren();const quiz=rows.filter(r=>r.kind==='quiz');if(!quiz.length){add(root,'p','No assessment submissions yet.');return}
  const scores=quiz.map(r=>({code:r.participant_code,score:r.score,total:r.max_score,percent:Math.round(100*r.score/Math.max(1,r.max_score))}));
  add(root,'p',`Mean score: ${f(avg(scores.map(x=>x.percent)))}% · ${scores.length} submitted.`);
  cellContainer(root).append(table(['Participant','Correct','Questions','Score'],scores.map(x=>[x.code,x.score,x.total,x.percent+'%'])));
  const qs=questions(quiz[0]);qs.forEach((q,i)=>{add(root,'h3',`Question ${i+1}: ${plain(q.title)}`);const n=quiz.length;const rowsByAnswer=(q.answers||[]).map(a=>{const cnt=quiz.filter(r=>(r.answers?.[i]||[]).includes(a.id)).length;return [plain(a.title),cnt,pcts(cnt,n),a.id===q.correct||(q.corrects||[]).includes(a.id)?'Correct':'']});
   cellContainer(root).append(table(['Answer option','Selected','% of submissions','Key'],rowsByAnswer));
  });
 }
 function participants(){const root=$('participants');root.replaceChildren();const codes=byParticipant();if(!codes.length){add(root,'p','No participant submissions yet.');return}
  const pre=new Map(rowsFor('pre-course self-reflection').map(r=>[r.participant_code,r]));const post=new Map(rowsFor('post-course confidence').map(r=>[r.participant_code,r]));
  const lines=codes.map(code=>{const a=pre.get(code)?.answers,b=post.get(code)?.answers,score=rows.find(r=>r.kind==='quiz'&&r.participant_code===code),change=a&&b?f(avg(b.map((v,i)=>Number(v)-Number(a[i])))):'—';return [code,a?'Yes':'No',b?'Yes':'No',change,score?`${score.score}/${score.max_score}`:'—',rows.filter(r=>r.participant_code===code).length]});
  cellContainer(root).append(table(['Participant','Pre','Post','Mean confidence change','Assessment','Activities submitted'],lines));
 }
 function reflections(){const root=$('reflections');root.replaceChildren();const other=rows.filter(r=>r.kind==='survey'&&!/pre-course self-reflection|post-course confidence/i.test(r.lesson_title));
  if(!other.length){add(root,'p','No reflection or feedback submissions yet.');return}
  for(const r of other){const section=document.createElement('details');section.style.margin='12px 0';const summary=document.createElement('summary');summary.textContent=`${r.lesson_title} · ${r.participant_code}`;section.append(summary);
   const qs=questions(r);(r.answers||[]).forEach((ans,i)=>{add(section,'strong',plain(qs[i]?.question||`Question ${i+1}`));add(section,'p',Array.isArray(ans)?ans.join(', '):String(ans))});root.append(section)}
 }
 function exportData(){const head=['participant_code','lesson','question_number','question_text','question_type','response','score','max_score'];const data=[head];
  for(const r of rows){questions(r).forEach((q,i)=>data.push([r.participant_code,r.lesson_title,i+1,plain(q.question||q.title),q.questionType||q.type,JSON.stringify(r.answers?.[i]??null),r.score??'',r.max_score??'']))}
  const csv=data.map(line=>line.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='courselab-research-deidentified.csv';a.click();URL.revokeObjectURL(url)}
 async function load(){status.textContent='Loading research results…';const {data,error}=await db.rpc('courselab_research_report',{p_course:id});if(error)throw error;rows=data||[];
  overview();confidence();assessment();participants();reflections();status.textContent=`Loaded ${rows.length} activity submission(s).`}
 try{await CourseLabCloud.requireUser();if(!id)throw Error('Course parameter is missing');$('back-gradebook').href='gradebook.html?course='+encodeURIComponent(id);
  const {data:c,error:ce}=await db.from('courses').select('title,current_published_version_id').eq('id',id).single();if(ce)throw ce;$('title').textContent=c.title+' · Research results';
  if(!c.current_published_version_id)throw Error('Course is not published');const {data:v,error:ve}=await db.from('course_versions').select('snapshot').eq('id',c.current_published_version_id).single();if(ve)throw ve;lessons=v.snapshot?.lessons||[];
  $('refresh').onclick=()=>load().catch(e=>status.textContent=e.message);$('export').onclick=exportData;await load();
 }catch(err){status.textContent='Research dashboard unavailable: '+err.message}
})();
