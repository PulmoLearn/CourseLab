/* Research dashboard for original Rise SCORM 1.2 course. Read-only and instructor-scoped. */
(async () => {
  'use strict';
  const db = CourseLabCloud.db;
  const $ = id => document.getElementById(id);
  const courseId = new URLSearchParams(location.search).get('course');
  const labels = [
    'Explain Waldorf education to coworkers or parents',
    'Explain Montessori education to coworkers or parents',
    'Explain Charlotte Mason education to coworkers or parents',
    'Explain Classical education to coworkers or parents',
    'Explain Unschooling / Self-Directed Education to coworkers or parents',
    'Recommend curriculum, materials, or instructional strategies aligned with a family’s philosophy',
    'Help families document learning and meet charter school requirements without compromising their philosophy'
  ];
  const itemPrompts = [
    'Which philosophy nurtures “head, heart, and hands”?',
    'Which philosophy uses self-correcting manipulatives?',
    'Which philosophy embraces the parent as co-learner and mentor?',
    'How can teachers support families who do not require written work in early grades? (Select all)',
    'Which philosophy organizes learning into grammar, logic, and rhetoric?',
    'Which philosophy emphasizes living books by passionate subject experts?'
  ];
  const feedbackPrompts = [
    'How well did the course explain the five educational philosophies?',
    'How comfortable was the navigation and visual layout?',
    'Was the content clear and easy to understand?',
    'Would you recommend this course?'
  ];
  const els = ['overview','confidence','assessment','participants','reflections','feedback'];
  const div = (className, text) => { const x=document.createElement('div'); if(className)x.className=className; if(text!==undefined)x.textContent=text; return x; };
  const tag = (name, text) => {const x=document.createElement(name);if(text!==undefined)x.textContent=text;return x;};
  const appendText = (parent,name,text)=>{const x=tag(name,text);parent.append(x);return x;};
  const pct = (n,d)=> d ? `${Math.round(n/d*100)}%`:'—';
  const mean = v => v.length ? v.reduce((a,b)=>a+b,0)/v.length : null;
  const fmt = v => v===null || !Number.isFinite(v) ? '—' : v.toFixed(2);
  const numeric = v => { if(v==null || String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const readable = v => String(v??'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
  const t = (headers,rows) => { const scroll=div('scorm-table-scroll');const table=tag('table');table.className='scorm-data-table';const thead=table.createTHead().insertRow();headers.forEach(h=>appendText(thead,'th',h));const body=table.createTBody();for(const cells of rows){const tr=body.insertRow();for(const c of cells)appendText(tr,'td',String(c??'—'));}scroll.append(table);return scroll;};
  const bar = (value,max=5) => {const shell=div('scorm-bar');const fill=div('scorm-bar-fill');fill.style.width=`${Math.min(100,Math.max(0,(value/max)*100))}%`;shell.append(fill);return shell;};
  const cohort = [];
  const groupKey = (id,index) => {
    if(/^Pre-Course_Self-Refl_/i.test(id))return {group:'pre',order: index};
    if(/^Post-Course_Confiden_/i.test(id))return {group:'post',order:index};
    if(/^Educational_Philosop_/i.test(id))return {group:'assessment',order:index};
    if(/^_Select_two_educational/i.test(id))return {group:'reflection',order:index};
    if(/^_How_well_did|^_How_comfortable_was|^_Was_the_content|^_Would_you_recommend/i.test(id))return {group:'feedback',order:index};
    return {group:'other',order:index};
  };
  const parse = cmi => {
    const map = new Map();
    for(const [key,val] of Object.entries(cmi||{})){
      const match=/^cmi\.interactions\.(\d+)\.(.+)$/.exec(key);if(!match)continue;
      const n=Number(match[1]);if(!map.has(n))map.set(n,{index:n});map.get(n)[match[2]]=val;
    }
    const groups={pre:[],post:[],assessment:[],reflection:[],feedback:[],other:[]};
    [...map.values()].sort((a,b)=>a.index-b.index).forEach(x=>{
      if(!x.id)return;const cls=groupKey(x.id,x.index);groups[cls.group].push(x);
    });return groups;
  };
  const hasResponse = x => x && x.student_response!==undefined && x.student_response!==null && String(x.student_response).trim()!=='';
  const isCorrect = x => /^(correct|right)$/i.test(String(x?.result||''));
  const countScore = r=> {const q=r.groups.assessment.filter(hasResponse);return {correct:q.filter(isCorrect).length,answered:q.length,total:r.groups.assessment.length,explicit:numeric(r.score)};};
  function sectionEmpty(id,message){$(id).replaceChildren(tag('p',message));}
  function summary(){const el=$('overview');el.replaceChildren();const done=cohort.filter(x=>/^(completed|passed)$/i.test(x.status));const paired=cohort.filter(x=>x.groups.pre.filter(hasResponse).length===7 && x.groups.post.filter(hasResponse).length===7);
    const cards=div('scorm-kpis');for(const [value,label] of [[cohort.length,'Participants with SCORM records'],[done.length,'Completed'],[paired.length,'Paired confidence surveys'],[cohort.filter(x=>x.groups.assessment.some(hasResponse)).length,'Assessment submissions']]){const item=div('scorm-kpi');appendText(item,'strong',String(value));appendText(item,'span',label);cards.append(item);}el.append(cards);
    appendText(el,'p','Records reflect SCORM data reported by the original course. No scores or missing survey responses are invented.');
  }
  function confidence(){const el=$('confidence');el.replaceChildren();const rows=[];const personRows=[];const allDiffs=[];
    for(let i=0;i<7;i++){
      const pairs=cohort.map(r=>[numeric(r.groups.pre[i]?.student_response),numeric(r.groups.post[i]?.student_response)]).filter(([a,b])=>a!==null&&b!==null&&a>=1&&a<=5&&b>=1&&b<=5);
      const a=mean(pairs.map(z=>z[0])),b=mean(pairs.map(z=>z[1]));rows.push([labels[i],String(pairs.length),fmt(a),fmt(b),fmt(a===null?null:b-a)]);
    }
    for(const r of cohort){const pairs=labels.map((_,i)=>[numeric(r.groups.pre[i]?.student_response),numeric(r.groups.post[i]?.student_response)]).filter(([a,b])=>a!==null&&b!==null&&a>=1&&a<=5&&b>=1&&b<=5);if(!pairs.length)continue;
      const pre=mean(pairs.map(z=>z[0])),post=mean(pairs.map(z=>z[1])),diff=post-pre; if(pairs.length===7)allDiffs.push(diff);personRows.push([r.code,String(pairs.length)+' / 7',fmt(pre),fmt(post),fmt(diff)]);
    }
    if(!personRows.length){appendText(el,'p','No matched pre/post confidence answers are available yet.');return;}
    const full=cohort.filter(r=>r.groups.pre.filter(hasResponse).length===7&&r.groups.post.filter(hasResponse).length===7);
    const d=mean(allDiffs);const highlight=div('scorm-confidence-highlight');appendText(highlight,'strong',d===null?'—':`${d>=0?'+':''}${fmt(d)}`);appendText(highlight,'span',`Mean paired confidence change (1–5 scale; ${full.length} complete pairs)`);el.append(highlight);
    appendText(el,'h3','Confidence change by question');el.append(t(['Confidence item','Paired n','Pre mean','Post mean','Change'],rows));
    appendText(el,'h3','Pre / post confidence averages');const bars=div('scorm-comparison');for(let i=0;i<7;i++){const pts=cohort.map(r=>[numeric(r.groups.pre[i]?.student_response),numeric(r.groups.post[i]?.student_response)]).filter(z=>z.every(v=>v!==null&&v>=1&&v<=5));if(!pts.length)continue;const row=div('scorm-comparison-item');appendText(row,'strong',labels[i]);for(const [label,value] of [['Pre',mean(pts.map(z=>z[0]))],['Post',mean(pts.map(z=>z[1]))]]){const line=div('scorm-comparison-line');appendText(line,'span',label);line.append(bar(value));appendText(line,'span',fmt(value));row.append(line);}bars.append(row);}el.append(bars);
    appendText(el,'h3','Pseudonymous participant comparisons');el.append(t(['Participant','Matched items','Pre mean','Post mean','Change'],personRows));
    if(allDiffs.length)appendText(el,'p',`${allDiffs.filter(v=>v>0).length} improved · ${allDiffs.filter(v=>v===0).length} unchanged · ${allDiffs.filter(v=>v<0).length} decreased (complete paired surveys only).`);
  }
  const selectedOptions = x => String(x.student_response??'').split(',').map(s=>s.trim()).filter(Boolean);
  function assessment(){const el=$('assessment');el.replaceChildren();const users=cohort.filter(r=>r.groups.assessment.some(hasResponse));if(!users.length){appendText(el,'p','No assessment answers recorded yet.');return;}
    appendText(el,'p',`Assessment contains six scored interactions. Scores below are calculated from SCORM question-level correct/incorrect results, because the example report did not provide a course-level raw score.`);
    const scores=users.map(r=>{const s=countScore(r);return [r.code,`${s.correct}/${s.total}`,pct(s.correct,s.total),s.answered===s.total?'Complete':`${s.answered} answered`];});el.append(t(['Participant','Correct','Score','Response status'],scores));
    const distribution=users.map(r=>countScore(r)).filter(s=>s.answered===s.total);if(distribution.length){const avg=mean(distribution.map(x=>x.correct/x.total*100));const kpi=div('scorm-confidence-highlight');appendText(kpi,'strong',`${Math.round(avg)}%`);appendText(kpi,'span',`Mean assessment score (${distribution.length} complete submissions)`);el.append(kpi);}
    appendText(el,'h3','Question performance and answer selections');
    for(let i=0;i<6;i++){
      const obs=users.map(r=>r.groups.assessment[i]).filter(hasResponse);const box=div('scorm-question');appendText(box,'h4',`Q${i+1}. ${itemPrompts[i]}`);appendText(box,'p',`Answered: ${obs.length} · Correct: ${obs.filter(isCorrect).length} (${pct(obs.filter(isCorrect).length,obs.length)})`);
      const choices=new Set();for(const q of obs){selectedOptions(q).forEach(v=>choices.add(v));String(q.correct_responses?.['0']||q['correct_responses.0.pattern']||'').split(',').map(z=>z.trim()).filter(Boolean).forEach(z=>choices.add(z));}
      const rows=[...choices].sort((a,b)=>a.localeCompare(b)).map(v=>[readable(v),obs.filter(x=>selectedOptions(x).includes(v)).length,pct(obs.filter(x=>selectedOptions(x).includes(v)).length,obs.length)]);
      if(rows.length)box.append(t(['Reported answer option','Selected','% of respondents'],rows));
      appendText(box,'p',i===3?'Multi-select: percentages may sum to more than 100%.':'Only answer options present in reported selections or correct-answer patterns can be shown; unreported distractors may be absent.');el.append(box);
    }
  }
  function participants(){
    const el=$('participants');el.replaceChildren();
    if(!cohort.length){appendText(el,'p','No learner records yet.');return;}
    appendText(el,'p','Pre/post values are mean confidence ratings on a 1–5 scale. Change compares only questions answered at both time points. Expand a participant to view each recorded answer.');
    const rows=[];
    for(const r of cohort){
      const s=countScore(r);
      const pre=labels.map((_,i)=>numeric(r.groups.pre[i]?.student_response));
      const post=labels.map((_,i)=>numeric(r.groups.post[i]?.student_response));
      const valid=v=>v!==null&&v>=1&&v<=5;
      const preValid=pre.filter(valid),postValid=post.filter(valid);
      const paired=pre.map((v,i)=>[v,post[i]]).filter(([a,b])=>valid(a)&&valid(b));
      const preMean=mean(preValid),postMean=mean(postValid);
      const delta=paired.length?mean(paired.map(([a,b])=>b-a)):null;
      rows.push([r.code,fmt(preMean),fmt(postMean),delta===null?'—':(delta>0?'+':'')+fmt(delta),s.answered?`${s.correct}/${s.total} (${pct(s.correct,s.total)})`:'—',r.status]);
      const details=tag('details');details.className='scorm-participant-details';
      const summary=tag('summary',`View ${r.code} — individual confidence answers`);details.append(summary);
      appendText(details,'p',`Questions answered: pre ${preValid.length}/7 · post ${postValid.length}/7 · paired ${paired.length}/7. Missing answers are excluded from averages.`);
      const answerRows=labels.map((name,i)=>{
        const a=valid(pre[i])?pre[i]:null,b=valid(post[i])?post[i]:null;
        const change=a!==null&&b!==null?b-a:null;
        return [name,a===null?'Not answered':`${a}/5`,b===null?'Not answered':`${b}/5`,change===null?'—':`${change>0?'+':''}${change}`];
      });
      details.append(t(['Confidence question','Before','After','Change'],answerRows));
      appendText(details,'p',`Last saved: ${r.updated}`);
      el.append(details);
    }
    const list=t(['Participant','Pre mean /5','Post mean /5','Change','Assessment','Completion'],rows);
    el.insertBefore(list,el.querySelector('details'));
  }
  function reflection(){const el=$('reflections');el.replaceChildren();const samples=cohort.flatMap(r=>r.groups.reflection.filter(hasResponse).map(x=>({code:r.code,answer:String(x.student_response)})));if(!samples.length){appendText(el,'p','No written reflections recorded yet.');return;}
    for(const s of samples){const item=div('scorm-response-card');appendText(item,'h4',s.code);appendText(item,'p',s.answer);el.append(item);}appendText(el,'p','Free-text answers may contain identifying details. Review and redact before sharing research exports.');
  }
  function feedback(){const el=$('feedback');el.replaceChildren();for(let i=0;i<4;i++){const answers=cohort.map(r=>r.groups.feedback[i]).filter(hasResponse);const block=div('scorm-question');appendText(block,'h4',feedbackPrompts[i]);appendText(block,'p',`${answers.length} response(s)`);if(answers.length){const tally=new Map();answers.forEach(x=>{const v=String(x.student_response).trim();tally.set(v,(tally.get(v)||0)+1);});block.append(t(['Response','Count','%'],[...tally].map(([value,n])=>[readable(value),n,pct(n,answers.length)])));}el.append(block);}
  }
  function exportCsv(){const rows=[['participant','status','section','question','response','result','saved_at']];for(const r of cohort){for(const [section,items] of Object.entries(r.groups)){for(let i=0;i<items.length;i++){const x=items[i];rows.push([r.code,r.status,section,section==='pre'||section==='post'?labels[i]:section==='assessment'?itemPrompts[i]:section==='feedback'?feedbackPrompts[i]:(x.id||''),x.student_response??'',x.result??'',r.updated]);}}}
    const csv=rows.map(x=>x.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\r\n');const a=tag('a');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.href=url;a.download='educational-philosophies-scorm-research.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  async function stableCode(course,learner){const data=new TextEncoder().encode(course+':'+learner);const digest=await crypto.subtle.digest('SHA-256',data);const hex=[...new Uint8Array(digest)].slice(0,6).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();return `P-${hex}`;}
  async function load(){const status=$('status');status.textContent='Loading SCORM results…';try{
      const user=await CourseLabCloud.requireUser();if(!courseId)throw Error('Missing course ID');
      const {data:course,error:ce}=await db.from('courses').select('title,owner_id,current_published_version_id,settings').eq('id',courseId).single();if(ce)throw ce;if(course.owner_id!==user.id)throw Error('Only this course’s instructor can view the report.');if(!course.settings?.scorm12)throw Error('This course is not a hosted SCORM course.');
      $('course-title').textContent=course.title+' · Research results';
      const {data,error}=await db.from('courselab_scorm12_attempts').select('learner_id,version_id,cmi,status,score,updated_at').eq('course_id',courseId).order('updated_at',{ascending:false});if(error)throw error;
      const attempts=(data||[]).filter(r=>r.version_id===course.current_published_version_id);
      cohort.length=0;for(const r of attempts){cohort.push({code:await stableCode(courseId,r.learner_id),status:r.status||'unknown',groups:parse(r.cmi),score:r.score,updated:new Date(r.updated_at).toLocaleString()});}
      cohort.sort((a,b)=>a.code.localeCompare(b.code));summary();confidence();assessment();participants();reflection();feedback();status.textContent=`Loaded ${cohort.length} participant record(s) from current published course version.`;
      if((data||[]).length>attempts.length)appendText($('overview'),'p',`${(data||[]).length-attempts.length} older-version attempt(s) excluded for comparable research reporting.`);
    }catch(e){status.textContent='Dashboard unavailable: '+(e.message||String(e));for(const id of els)sectionEmpty(id,'No data loaded.');}
  }
  $('refresh').addEventListener('click',load);$('export').addEventListener('click',exportCsv);await load();
})();
