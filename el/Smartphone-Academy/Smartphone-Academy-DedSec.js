document.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('academy-module-filter');
  if(!input)return;
  const cards=[...document.querySelectorAll('[data-academy-card]')];
  const empty=document.getElementById('academy-empty-state');
  const apply=()=>{const q=input.value.trim().toLocaleLowerCase();let shown=0;cards.forEach(card=>{const hay=(card.dataset.search||card.textContent||'').toLocaleLowerCase();const visible=!q||hay.includes(q);card.hidden=!visible;if(visible)shown++;});if(empty)empty.hidden=shown!==0;};
  input.addEventListener('input',apply);
  window.addEventListener('dedsec:languagechange',e=>{const gr=e.detail?.language==='gr';input.placeholder=gr?(input.dataset.grPlaceholder||'Φιλτράρισμα ενοτήτων…'):(input.dataset.enPlaceholder||'Filter modules…');apply();});
});
