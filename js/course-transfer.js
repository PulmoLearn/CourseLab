/* Instructor-to-instructor published course handoff.
 * All Supabase operations run using the currently signed-in user's session.
 * Export includes published content only; no learner or research tables are read.
 */
(async () => {
  'use strict';
  const db = CourseLabCloud.db;
  const $ = id => document.getElementById(id);
  const status = message => { $('transfer-status').textContent = message; };
  const plainObject = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const MAX_SIZE = 15 * 1024 * 1024;
  let user, loadedFile;

  function cleanPublishedSnapshot(snapshot) {
    if (!plainObject(snapshot) || !plainObject(snapshot.course) || !Array.isArray(snapshot.lessons)) {
      throw Error('The published version does not contain a valid course snapshot.');
    }
    const course = snapshot.course;
    if (typeof course.title !== 'string' || !course.title.trim()) throw Error('Published course has no title.');
    if (!snapshot.lessons.length || snapshot.lessons.length > 300) throw Error('Expected between 1 and 300 published lessons.');
    const lessons = snapshot.lessons.slice().sort((a,b) => Number(a.position || 0) - Number(b.position || 0)).map((lesson,i) => {
      if (typeof lesson.title !== 'string' || !plainObject(lesson.content)) throw Error(`Lesson ${i + 1} has invalid content.`);
      // Deliberately omit original lesson IDs and any learner-specific properties.
      return {title: lesson.title, position: i, content: lesson.content};
    });
    return {
      format: 'courselab-published-handoff',
      formatVersion: 1,
      course: {
        title: course.title.trim(),
        description: typeof course.description === 'string' ? course.description : '',
        settings: plainObject(course.settings) ? course.settings : {}
      },
      lessons
    };
  }

  function validateTransfer(payload) {
    if (!plainObject(payload) || payload.format !== 'courselab-published-handoff' || payload.formatVersion !== 1) {
      throw Error('Select a CourseLab published course handoff file exported from this page.');
    }
    if (!plainObject(payload.course) || typeof payload.course.title !== 'string' || !payload.course.title.trim() || payload.course.title.length > 120) {
      throw Error('Invalid course title in transfer file.');
    }
    if (!Array.isArray(payload.lessons) || !payload.lessons.length || payload.lessons.length > 300) {
      throw Error('The transfer file must contain 1–300 lessons.');
    }
    payload.lessons.forEach((lesson,i) => {
      if (!plainObject(lesson) || typeof lesson.title !== 'string' || !lesson.title.trim() || !plainObject(lesson.content)) {
        throw Error(`Lesson ${i+1} is missing its title or content.`);
      }
    });
    return payload;
  }

  function presentSummary(file) {
    const summary = $('import-summary');
    summary.replaceChildren();
    const p = document.createElement('p');
    p.textContent = `${file.course.title} — ${file.lessons.length} lessons. Only course content will be copied.`;
    summary.append(p);
  }

  function safeFilename(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'courselab';
  }

  try {
    user = await CourseLabCloud.requireUser();
    $('transfer-account').textContent = user.email || 'Instructor';
    const {data, error} = await db.from('courses')
      .select('id,title,current_published_version_id')
      .eq('owner_id',user.id)
      .order('created_at',{ascending:false});
    if (error) throw error;
    const select = $('source-course');
    select.replaceChildren();
    const placeholder = document.createElement('option');placeholder.value='';placeholder.textContent='Choose a published course';select.append(placeholder);
    for (const course of data || []) {
      if (!course.current_published_version_id) continue;
      const option = document.createElement('option');option.value=course.id;option.textContent=course.title;select.append(option);
    }
    $('export-course').disabled = !select.value;
    select.addEventListener('change', () => { $('export-course').disabled = !select.value; });
    status('Ready. Export from the original account, then sign into the receiving account to import.');

    $('export-course').addEventListener('click',async () => {
      const button=$('export-course');button.disabled=true;status('Reading current published version…');
      try {
        const selectedId=$('source-course').value;
        // Check current ownership and live published version again when exporting.
        const {data:course,error:ce}=await db.from('courses')
          .select('id,title,current_published_version_id')
          .eq('id',selectedId).eq('owner_id',user.id).single();
        if(ce)throw ce;
        if(!course.current_published_version_id)throw Error('This course has not been published.');
        const {data:version,error:ve}=await db.from('course_versions')
          .select('snapshot').eq('course_id',course.id)
          .eq('id',course.current_published_version_id).single();
        if(ve)throw ve;
        const transfer=cleanPublishedSnapshot(version.snapshot);
        const blob=new Blob([JSON.stringify(transfer,null,2)],{type:'application/json'});
        const url=URL.createObjectURL(blob), link=document.createElement('a');
        link.href=url;link.download=safeFilename(course.title)+'-published-handoff.json';
        document.body.append(link);link.click();link.remove();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
        status('Published course file downloaded. Send it privately to the receiving instructor.');
      } catch(e) { status('Export failed: '+e.message); }
      finally {button.disabled=false;}
    });

    $('course-transfer-file').addEventListener('change',async () => {
      loadedFile=undefined;$('import-course').disabled=true;$('import-summary').replaceChildren();
      const file=$('course-transfer-file').files?.[0];if(!file)return;
      try {
        if(file.size>MAX_SIZE)throw Error('Course file is too large (15 MB maximum).');
        loadedFile=validateTransfer(JSON.parse(await file.text()));
        presentSummary(loadedFile);$('import-course').disabled=false;
        status('Transfer file is valid. Verify that you are signed into the correct receiving instructor account.');
      } catch(e) {status('Unable to read transfer file: '+e.message);}
    });

    $('import-course').addEventListener('click',async () => {
      if(!loadedFile)return;
      const message=`Create and publish “${loadedFile.course.title}” under ${user.email}? This creates a NEW course and will not transfer student or research records.`;
      if(!confirm(message))return;
      const button=$('import-course');button.disabled=true;let newCourseId;
      try {
        const current=await db.auth.getUser();
        if(current.error || current.data.user?.id!==user.id)throw Error('Account changed. Reload and sign into the intended instructor account.');
        status('Creating separate course…');
        const {data:created,error:ce}=await db.from('courses').insert({
          owner_id:user.id,
          title:loadedFile.course.title,
          description:loadedFile.course.description,
          settings:plainObject(loadedFile.course.settings)?loadedFile.course.settings:{}
        }).select('id').single();
        if(ce)throw ce;
        newCourseId=created.id;
        for(let i=0;i<loadedFile.lessons.length;i++) {
          const lesson=loadedFile.lessons[i];
          status(`Copying lesson ${i+1} of ${loadedFile.lessons.length}: ${lesson.title}`);
          // Database supplies fresh lesson IDs; complete content preserves rich text, activities, media URLs and styling.
          const {error}=await db.from('lessons').insert({course_id:newCourseId,title:lesson.title,position:i,content:lesson.content});
          if(error)throw error;
        }
        status('Publishing the copied course…');
        const {error:pe}=await db.rpc('publish_course',{p_course_id:newCourseId});
        if(pe)throw pe;
        $('transfer-result').hidden=false;
        $('transfer-edit').href='editor.html?course='+encodeURIComponent(newCourseId);
        $('transfer-research').href='research.html?course='+encodeURIComponent(newCourseId);
        $('transfer-gradebook').href='gradebook.html?course='+encodeURIComponent(newCourseId);
        status('Transfer complete! The receiving instructor now owns a separate published course with fresh enrollment and research records.');
      } catch(e) {
        status('Transfer interrupted: '+e.message+(newCourseId?` A partial course (${newCourseId}) may appear in Studio. Review it before trying again to avoid duplicates.`:''));
        button.disabled=false;
      }
    });
  } catch(e) { status('Unable to initialize course transfer: '+e.message); }
})();
