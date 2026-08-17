const isReferenceHome=document.body.classList.contains('reference-home');
if(!isReferenceHome){
  const texture=document.createElement('link');
  texture.rel='stylesheet';
  texture.href='texture.css?v=2';
  document.head.appendChild(texture);
}else{
  const mobile=document.createElement('link');
  mobile.rel='stylesheet';
  mobile.href='mobile-reference-fix.css?v=2';
  document.head.appendChild(mobile);
}

const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.site-nav');
function setMenu(open){
  if(!menuButton||!nav)return;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
  nav.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open&&window.innerWidth<=760);
}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!menuButton?.contains(e.target))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open'))setMenu(false)});
window.addEventListener('resize',()=>{if(window.innerWidth>760)setMenu(false)});

const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
nav?.querySelectorAll('a').forEach(a=>{const target=(a.getAttribute('href')||'').split('#')[0].toLowerCase();if(target===current){a.classList.add('active');a.setAttribute('aria-current','page')}});

const form=document.querySelector('#quote-form');
form?.addEventListener('submit',e=>{
  e.preventDefault();
  if(!form.reportValidity())return;
  const d=new FormData(form);
  const msg=`Hi Tasmaarah Collection, I'd like a quote.\n\nName: ${d.get('name')}\nOccasion: ${d.get('occasion')}\nService: ${d.get('service')}\nMaterial: ${d.get('material')}\nSize: ${d.get('size')}\nDetails: ${d.get('details')||'Not provided'}`;
  location.href=`https://wa.me/27635409729?text=${encodeURIComponent(msg)}`;
});

const gallery=[...document.querySelectorAll('.masonry-gallery img,.gallery-preview img')];
if(gallery.length){
  const box=document.createElement('div');
  box.className='lightbox';
  box.setAttribute('role','dialog');
  box.setAttribute('aria-modal','true');
  box.innerHTML='<button class="lightbox-close" aria-label="Close">×</button><button class="lightbox-prev" aria-label="Previous">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" aria-label="Next">›</button>';
  document.body.appendChild(box);
  const image=box.querySelector('img'),caption=box.querySelector('figcaption');
  let index=0;
  const show=i=>{index=(i+gallery.length)%gallery.length;const src=gallery[index];image.src=src.currentSrc||src.src;image.alt=src.alt||'Tasmaarah Collection';caption.textContent=src.alt||'Tasmaarah Collection'};
  const open=i=>{show(i);box.classList.add('open');document.body.classList.add('lightbox-open')};
  const close=()=>{box.classList.remove('open');document.body.classList.remove('lightbox-open')};
  gallery.forEach((img,i)=>img.addEventListener('click',()=>open(i)));
  box.querySelector('.lightbox-close').onclick=close;
  box.querySelector('.lightbox-prev').onclick=()=>show(index-1);
  box.querySelector('.lightbox-next').onclick=()=>show(index+1);
  box.addEventListener('click',e=>{if(e.target===box)close()});
  document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1)});
}
