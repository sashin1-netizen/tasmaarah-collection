document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('.ref-hero');
  if(!hero||!window.TASMAARAH_HERO_TINY)return;
  hero.style.backgroundImage=`url(data:image/webp;base64,${window.TASMAARAH_HERO_TINY})`;
  hero.classList.add('approved-hero-loaded');
});
