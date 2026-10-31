/* Public browser configuration. Never put a Supabase secret/service-role key here. */
const CourseLabCloud = (() => {
  const url = 'https://euzurasgjugkornkxgbc.supabase.co';
  const key = 'sb_publishable_Tb_qly5Pm4MJmviZ1DXCeg_rthvDfQE';
  if (!window.supabase?.createClient) throw new Error('Supabase library did not load.');
  const db = window.supabase.createClient(url, key, {auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
  const redirect = (path='login.html') => location.replace(`${path}?next=${encodeURIComponent(location.pathname.split('/').pop()+location.search)}`);
  async function requireUser(){const {data:{user},error}=await db.auth.getUser();if(error||!user){redirect();throw new Error('Sign in required')}return user}
  async function loadCourse(id){
    const {data:course,error}=await db.from('courses').select('id,title,description,settings').eq('id',id).single();if(error)throw error;
    const {data:rows,error:le}=await db.from('lessons').select('id,title,position,content').eq('course_id',id).order('position');if(le)throw le;
    return {...course,lessons:rows.map(r=>({id:r.id,title:r.title,sections:r.content?.sections||[],lessonType:r.content?.lessonType||'standard',assessmentSettings:r.content?.assessmentSettings||{},completionSettings:r.content?.completionSettings||{},position:r.position}))};
  }
  async function createLesson(courseId,title='Welcome',position=0,sections,lessonType='standard'){
    const content={lessonType,assessmentSettings:{showScore:false,showAnswers:false,includeInGrade:false,includeInAnalytics:true},completionSettings:{heading:"Congratulations!",message:"You have completed this course.",showGrades:false},sections:sections||[{id:CourseLab.id(),cols:1,blocks:[{id:CourseLab.id(),type:'text',text:'Welcome to your new lesson.'}]}]};
    const {data,error}=await db.from('lessons').insert({course_id:courseId,title,position,content}).select('id,title,position,content').single();if(error)throw error;
    return {id:data.id,title:data.title,position:data.position,sections:data.content.sections,lessonType:data.content.lessonType,assessmentSettings:data.content.assessmentSettings,completionSettings:data.content.completionSettings};
  }
  return {db,requireUser,loadCourse,createLesson,redirect};
})();
