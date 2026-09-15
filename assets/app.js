
document.querySelectorAll('.dropbtn').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    btn.closest('.dropdown').classList.toggle('open');
  });
});
document.addEventListener('click',()=>document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open')));
const mb=document.querySelector('.mobilebtn');
if(mb) mb.addEventListener('click',()=>document.querySelector('.navlinks')?.classList.toggle('mobileopen'));

document.querySelectorAll('form[data-demo]').forEach(form=>{
  form.addEventListener('submit',e=>{
    const action=form.getAttribute('action')||'';
    if(action.includes('FORM_ACTION_HIER_EINTRAGEN')){
      e.preventDefault();
      alert('Formular ist gestaltet. Trage vor Veröffentlichung deinen bestehenden Formulardienst als action im HTML ein.');
    }
  });
});
