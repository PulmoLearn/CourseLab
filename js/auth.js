(async()=>{
  const {db}=CourseLabCloud;
  const status=document.querySelector('#auth-status');
  const form=document.querySelector('#auth-form');
  const setStatus=(message,error=false)=>{status.textContent=message;status.style.color=error?'#9d2335':''};
  const params=new URLSearchParams(location.search);
  const next=params.get('next');
  const safeNext=next && /^(dashboard|editor|preview)\.html(?:\?[^#]*)?$/.test(next)?next:'dashboard.html';
  const {data:{session}}=await db.auth.getSession();
  if(session){location.replace(safeNext);return}
  form.addEventListener('submit',async e=>{
    e.preventDefault();const submit=form.querySelector('[type=submit]');submit.disabled=true;
    const email=document.querySelector('#email').value.trim(),password=document.querySelector('#password').value;
    const mode=document.querySelector('input[name=mode]:checked').value;
    setStatus('Working…');
    try{
      if(mode==='signup'){
        const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+'/login.html'}});
        if(error)throw error;
        if(data.session) location.replace(safeNext);
        else {setStatus('Check your email to confirm your account. If you open the link on another device, return here and choose Sign in.');document.querySelector('input[name=mode][value=signin]').checked=true;}
      }else{
        const {error}=await db.auth.signInWithPassword({email,password});if(error)throw error;location.replace(safeNext);
      }
    }catch(err){setStatus(err.message||'Authentication failed.',true)}finally{submit.disabled=false}
  });
  document.querySelector('#reset-password').onclick=async()=>{
    const email=document.querySelector('#email').value.trim();if(!email){setStatus('Enter your email address first.',true);return}
    const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/reset-password.html'});
    setStatus(error?error.message:'If that address has an account, a password-reset email is on its way.',!!error);
  };
})();
