/* CourseLab private image library; all operations use the signed-in user's RLS session. */
const CourseLabMedia=(()=>{
 const db=CourseLabCloud.db,bucket=db.storage.from('courselab-images');
 const accepted=['image/jpeg','image/png','image/webp','image/gif'];
 async function user(){return CourseLabCloud.requireUser()}
 async function list(){const {data,error}=await db.from('media_assets').select('id,title,current_version_id,created_at').order('created_at',{ascending:false});if(error)throw error;return data||[]}
 async function upload(file,title){const u=await user();if(!accepted.includes(file.type)||file.size>10485760||!file.size)throw Error('Choose a JPG, PNG, WebP, or GIF image under 10 MB.');
  const assetId=crypto.randomUUID(),versionId=crypto.randomUUID();const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[file.type];const path=`${u.id}/${assetId}/${versionId}.${ext}`;
  const up=await bucket.upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;
  try{let r=await db.from('media_assets').insert({id:assetId,owner_id:u.id,title:title||file.name}).select('id').single();if(r.error)throw r.error;
   r=await db.from('media_versions').insert({id:versionId,asset_id:assetId,owner_id:u.id,version_number:1,storage_path:path,mime_type:file.type,file_size:file.size});if(r.error)throw r.error;
   r=await db.from('media_assets').update({current_version_id:versionId}).eq('id',assetId);if(r.error)throw r.error;
   return assetId;
  }catch(e){await bucket.remove([path]);throw e}
 }
 async function version(assetId){const {data:a,error:e}=await db.from('media_assets').select('current_version_id').eq('id',assetId).single();if(e)throw e;if(!a.current_version_id)throw Error('Image has no active version');const {data:v,error}=await db.from('media_versions').select('storage_path').eq('id',a.current_version_id).single();if(error)throw error;return v}
 async function signedUrl(assetId){const v=await version(assetId);const {data,error}=await bucket.createSignedUrl(v.storage_path,3600);if(error)throw error;return data.signedUrl}
 async function replaceEverywhere(assetId,file){const u=await user();if(!accepted.includes(file.type)||file.size>10485760||!file.size)throw Error('Invalid image or image exceeds 10 MB');const {data:versions,error:e}=await db.from('media_versions').select('version_number').eq('asset_id',assetId).order('version_number',{ascending:false}).limit(1);if(e)throw e;const number=(versions?.[0]?.version_number||0)+1;const vid=crypto.randomUUID(),ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[file.type],path=`${u.id}/${assetId}/${vid}.${ext}`;
  const up=await bucket.upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;
  const ins=await db.from('media_versions').insert({id:vid,asset_id:assetId,owner_id:u.id,version_number:number,storage_path:path,mime_type:file.type,file_size:file.size});if(ins.error){await bucket.remove([path]);throw ins.error}
  const upd=await db.from('media_assets').update({current_version_id:vid,updated_at:new Date().toISOString()}).eq('id',assetId);if(upd.error)throw upd.error;return vid;
 }
 async function usage(assetId){const {data,error}=await db.from('media_usage').select('course_id,lesson_id,block_id').eq('asset_id',assetId);if(error)throw error;return data||[]}
 async function syncLesson(courseId,lesson){const u=await user();const rows=[];for(const s of lesson.sections||[])for(const b of s.blocks||[])if(b.type==='image'&&b.assetId)rows.push({asset_id:b.assetId,owner_id:u.id,course_id:courseId,lesson_id:lesson.id,block_id:b.id});const del=await db.from('media_usage').delete().eq('lesson_id',lesson.id);if(del.error)throw del.error;if(rows.length){const ins=await db.from('media_usage').insert(rows);if(ins.error)throw ins.error}}
 return {list,upload,signedUrl,replaceEverywhere,usage,syncLesson};
})();
