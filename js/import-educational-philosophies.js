(async()=>{
 const db=CourseLabCloud.db, button=document.getElementById('import-course'),status=document.getElementById('import-status');let user;
 try{user=await CourseLabCloud.requireUser();document.getElementById('import-account').textContent='Signed in as '+user.email;button.disabled=false}catch(e){status.textContent='Sign in to an instructor account first: '+e.message;return}
 button.onclick=async()=>{
  if(!confirm('Create and publish a NEW course under '+user.email+'? This will add 12 lessons. Do not run twice.'))return;
  button.disabled=true;let id;
  const say=m=>status.textContent=m;
  try{
   const input=document.getElementById('course-file');if(!input.files?.[0])throw Error('Select the private Educational_Philosophies_Import_Data.json file first.');const source=JSON.parse(await input.files[0].text());
   if(source.lessons?.length!==12)throw Error('Expected 12 lessons. Aborting incomplete import.');
   const description=new DOMParser().parseFromString(source.descriptionHtml||'','text/html').body.textContent.trim().slice(0,4000);
   say('Creating draft course…');const {data:course,error:ce}=await db.from('courses').insert({owner_id:user.id,title:source.title,description,settings:{source:'rise-converted',riseAssetPath:'imported/educational-philosophies/'}}).select('id').single();if(ce)throw ce;id=course.id;
   for(let i=0;i<source.lessons.length;i++){
    const l=source.lessons[i];say(`Adding lesson ${i+1} of ${source.lessons.length}: ${l.title}`);
    const {error}=await db.from('lessons').insert({course_id:id,title:l.title,position:i,content:{lessonType:'rise-import',riseBlocks:l.blocks,sections:[],assessmentSettings:{showScore:true,showAnswers:false,includeInGrade:false,includeInAnalytics:false}}});if(error)throw error;
   }
   say('Publishing 12 lessons…');const {error:pe}=await db.rpc('publish_course',{p_course_id:id});if(pe)throw pe;
   say('Course installed and published. Add the 15 YouTube URLs before enrolling students, and test the entire course.');
   document.getElementById('import-result').hidden=false;document.getElementById('edit-link').href='editor.html?course='+encodeURIComponent(id);
   document.getElementById('test-link').href='learn.html?course='+encodeURIComponent(id)+'&test=1';
  }catch(e){say('Import stopped: '+e.message+(id?' A partial draft may exist in your Studio (course '+id+'). Do not rerun without checking and removing the incomplete copy.':''));button.disabled=false}
 };
})();
