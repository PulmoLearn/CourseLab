/* Publishing controls. Draft editor remains unchanged; only RPC publishes a snapshot. */
(() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const courseId = params.get('course');
  if (!courseId || !$('publish-course')) return;
  const db = CourseLabCloud.db;
  const status = msg => { $('publication-note').textContent = msg; };
  async function load() {
    const {data:c,error} = await db.from('courses').select('enrollment_code,current_published_version_id,published_at').eq('id',courseId).single();
    if(error) throw error;
    $('publication-state').textContent = c.current_published_version_id ? 'Published course (draft editing)' : 'Unpublished draft';
    $('enrollment-code-wrap').hidden = !c.enrollment_code;
    $('enrollment-code').value = c.enrollment_code || '';
    const {data:versions,error:ve} = await db.from('course_versions').select('id,version_number,published_at').eq('course_id',courseId).order('version_number',{ascending:false});
    if(ve) throw ve;
    const history = $('version-history'); history.replaceChildren();
    const heading=document.createElement('h3'); heading.textContent='Published versions'; history.append(heading);
    if(!versions.length){const p=document.createElement('p');p.textContent='No published versions yet.';history.append(p);}
    for(const v of versions){const p=document.createElement('p');p.textContent=`Version ${v.version_number} · ${new Date(v.published_at).toLocaleString()}${v.id===c.current_published_version_id?' · Live':''}`;history.append(p);}
  }
  $('publish-course').addEventListener('click',async()=>{
    if(!confirm('Publish the currently saved draft as a new course version? Check that all lesson changes have finished saving first.')) return;
    const button=$('publish-course');button.disabled=true;status('Publishing…');
    try {
      // The editor autosaves asynchronously. A short delay is not a substitute for flush;
      // require the editor save indicator to report completion before publishing.
      const editorStatus=document.getElementById('status')?.textContent||'';
      if(/unsaved|saving|save failed/i.test(editorStatus)) throw Error('Wait until the editor reports “Saved to cloud,” then publish.');
      const {data,error}=await db.rpc('publish_course',{p_course_id:courseId});
      if(error)throw error;
      const result=Array.isArray(data)?data[0]:data;
      status(`Version ${result?.version_number ?? ''} published. Future draft edits will not change this release.`);
      await load();
    }catch(e){status('Publish failed: '+e.message)}finally{button.disabled=false}
  });
  $('show-versions').addEventListener('click',()=>{$('version-history').hidden=!$('version-history').hidden;});
  $('copy-enrollment-code').addEventListener('click',async()=>{
    const code=$('enrollment-code').value;
    try{await navigator.clipboard.writeText(code);status('Enrollment code copied.')}catch(e){$('enrollment-code').select();status('Select and copy the code shown above.');}
  });
  CourseLabCloud.requireUser().then(load).catch(e=>status('Publishing information unavailable: '+e.message));
})();
