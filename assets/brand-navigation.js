(() => {
 const header=document.querySelector('.sk-global-header'); if(!header)return;
 const dropdowns=[...header.querySelectorAll('details')];
 const closeDropdowns=(except)=>dropdowns.forEach(d=>{if(d!==except)d.open=false;});
 dropdowns.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)closeDropdowns(d);}));
 document.addEventListener('click',e=>{dropdowns.forEach(d=>{if(!d.contains(e.target))d.open=false;});});
 const openDialog=(id,trigger)=>{const d=document.getElementById(id);if(!d||d.open)return;closeDropdowns();d.showModal();d.addEventListener('close',()=>trigger?.focus(),{once:true});(d.querySelector('input') || d.querySelector('button'))?.focus();};
 header.querySelectorAll('[data-sk-open]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.skOpen,b)));
 document.querySelectorAll('.sk-nav-dialog').forEach(d=>{d.querySelector('[data-sk-close]').addEventListener('click',()=>d.close());d.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>d.close()));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const active=dropdowns.find(d=>d.open);if(active){closeDropdowns();active.querySelector('summary').focus();}}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){e.preventDefault();openDialog('sk-search',header.querySelector('[data-sk-open="sk-search"]'));}});
 const input=document.getElementById('sk-search-input'), results=[...document.querySelectorAll('#sk-search nav a')], count=document.querySelector('[data-sk-count]');
 const filter=()=>{const q=input.value.trim().toLowerCase();results.forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(q));count.textContent=results.filter(a=>!a.hidden).length+' destinations';};input.addEventListener('input',filter);filter();
 const theme=header.querySelector('[data-sk-theme]');theme.addEventListener('click',()=>{const root=document.documentElement;const dark=root.dataset.theme==='dark'||(root.dataset.theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);const next=dark?'light':'dark';root.dataset.theme=next;try{localStorage.setItem('skunkworks-theme',next);document.cookie='skunkworks-theme='+next+'; Path=/; Max-Age=31536000; SameSite=Lax; Secure';}catch(_){}});
 matchMedia('(min-width: 901px)').addEventListener('change',e=>{const d=document.getElementById('sk-navigation');if(e.matches&&d.open)d.close();});
})();
