const KEY='courselab-demo-v1';
const CourseLab={
  get(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return []}},
  save(courses){localStorage.setItem(KEY,JSON.stringify(courses))},
  id(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2)},
  escape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
  newCourse(title){return {id:this.id(),title,description:'',lessons:[{id:this.id(),title:'Welcome',sections:[{id:this.id(),cols:1,blocks:[{id:this.id(),type:'text',text:'Welcome to your new lesson.'}]}]}]}}
};
