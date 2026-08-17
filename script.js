const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.site-nav');

function setMenu(open){
  if(!menuButton||!nav)return;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
  nav.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open&&window.innerWidth<=700);
}

menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',event=>{
  if(nav?.classList.contains('open')&&!nav.contains(event.target)&&!menuButton?.contains(event.target))setMenu(false);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){
    setMenu(false);menuButton.focus();
  }
});
window.addEventListener('resize',()=>{if(window.innerWidth>700)document.body.classList.remove('menu-open')});

const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
nav?.querySelectorAll('a').forEach(link=>{
  const target=(link.getAttribute('href')||'').split('#')[0].toLowerCase();
  if(target===current){link.classList.add('active');link.setAttribute('aria-current','page')}
});

const form=document.querySelector('#quote-form');
form?.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const msg=`Hi Tasmaarah Collection, I'd like a quote.\n\nName: ${data.get('name')}\nOccasion: ${data.get('occasion')}\nService: ${data.get('service')}\nMaterial: ${data.get('material')}\nSize: ${data.get('size')}\nDetails: ${data.get('details')||'Not provided'}`;
  const url=`https://wa.me/27635409729?text=${encodeURIComponent(msg)}`;
  const popup=window.open(url,'_blank','noopener');
  if(!popup)location.href=url;
});

const galleryImages=[...document.querySelectorAll('.masonry-gallery img,.gallery-preview img')];
if(galleryImages.length){
  const overlay=document.createElement('div');
  overlay.className='lightbox';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Tasmaarah gallery image');
  overlay.innerHTML='<button class="lightbox-close" type="button" aria-label="Close image">×</button><button class="lightbox-prev" type="button" aria-label="Previous image">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" type="button" aria-label="Next image">›</button>';
  document.body.appendChild(overlay);
  const view=overlay.querySelector('img');
  const caption=overlay.querySelector('figcaption');
  let index=0,lastFocus=null;
  function show(i){
    index=(i+galleryImages.length)%galleryImages.length;
    const source=galleryImages[index];
    view.src=source.currentSrc||source.src;
    view.alt=source.alt||'Tasmaarah Collection presentation';
    caption.textContent=source.alt||'Tasmaarah Collection';
  }
  function open(i,focus){index=i;lastFocus=focus;show(index);overlay.classList.add('open');document.body.classList.add('lightbox-open');overlay.querySelector('.lightbox-close').focus()}
  function close(){overlay.classList.remove('open');document.body.classList.remove('lightbox-open');lastFocus?.focus()}
  galleryImages.forEach((image,i)=>{image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',`${image.alt||'Gallery image'} — open larger view`);image.addEventListener('click',()=>open(i,image));image.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(i,image)}})});
  overlay.querySelector('.lightbox-close').addEventListener('click',close);
  overlay.querySelector('.lightbox-prev').addEventListener('click',()=>show(index-1));
  overlay.querySelector('.lightbox-next').addEventListener('click',()=>show(index+1));
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',e=>{if(!overlay.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1)});
}

if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){
  const targets=document.querySelectorAll('.occasion-card,.catalog-card,.custom-grid article,.feature-grid article,.occasion-detail article,.gallery-preview figure');
  targets.forEach(el=>el.classList.add('reveal'));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});
  targets.forEach(el=>observer.observe(el));
}
