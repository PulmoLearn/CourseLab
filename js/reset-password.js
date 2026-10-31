(async()=>{
 const {db}=CourseLabCloud,form=document.querySelector('#reset-form'),status=document.querySelector('#status');
 const {data:{session}}=await db.auth.getSession();
 if(!session){status.textContent='Open the password-reset link from your email to continue.';form.hidden=true;return}
 form.onsubmit=async e=>{e.preventDefault();const password=document.querySelector('#password').value;const {error}=await db.auth.updateUser({password});status.textContent=error?error.message:'Password updated. You can return to the studio.';if(!error)form.hidden=true};
})();
