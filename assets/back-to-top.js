/* back-to-top button: create if missing, wire scroll + click */
(function(){
  var btn=document.getElementById('back-to-top');
  if(!btn){
    btn=document.createElement('button');
    btn.id='back-to-top';
    btn.type='button';
    btn.setAttribute('aria-label','回到顶部');
    btn.className='fixed bottom-6 right-6 z-40 w-11 h-11 rounded-lg opacity-0 pointer-events-none transition-all duration-300';
    btn.style.cssText='background-color: var(--genshin-primary); color: var(--genshin-primary-foreground); box-shadow: 0 4px 20px rgba(0,0,0,0.4);';
    btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto;display:block;"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btn);
  }
  if(!btn){ return; }
  window.addEventListener('scroll',function(){
    if(window.scrollY>500){ btn.classList.remove('opacity-0','pointer-events-none'); }
    else{ btn.classList.add('opacity-0','pointer-events-none'); }
  },{passive:true});
  btn.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
})();
