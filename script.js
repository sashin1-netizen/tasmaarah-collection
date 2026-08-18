const isReferenceHome=document.body.classList.contains('reference-home');

// Load only the shared production polish dynamically. The homepage hero stylesheet is
// already linked in index.html; loading it again caused stale/duplicate cascade issues.
const polish=document.createElement('link');
polish.rel='stylesheet';
polish.href='final-polish.css?v=1';
document.head.appendChild(polish);
if(!isReferenceHome){
  const texture=document.createElement('link');
  texture.rel='stylesheet';
  texture.href='texture.css?v=2';
  document.head.appendChild(texture);
}

const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.site-nav');
function setMenu(open){
  if(!menuButton||!nav)return;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
  nav.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
}
menuButton?.addEventListener('click',e=>{e.stopPropagation();setMenu(menuButton.getAttribute('aria-expanded')!=='true')});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!menuButton?.contains(e.target))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open'))setMenu(false)});
window.addEventListener('resize',()=>{if(window.innerWidth>900)setMenu(false)});

const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
nav?.querySelectorAll('a').forEach(a=>{const target=(a.getAttribute('href')||'').split('#')[0].toLowerCase();if(target===current){a.classList.add('active');a.setAttribute('aria-current','page')}});

// Real search behaviour: the home search icon opens a search panel and the shop page
// filters cards from the query string or live input.
const homeSearch=document.querySelector('.ref-search');
if(homeSearch){
  homeSearch.addEventListener('click',e=>{
    e.preventDefault();
    let overlay=document.querySelector('.search-overlay');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.className='search-overlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-label','Search collection');
      overlay.innerHTML='<button class="search-close" type="button" aria-label="Close search">×</button><div class="search-panel"><h2>Search the collection</h2><p>Search trays, Perspex boxes, glass pieces, men\'s gifts, women\'s gifts or personalised pieces.</p><form class="search-row"><input name="q" type="search" autocomplete="off" placeholder="What are you looking for?" aria-label="Search collection" required><button class="btn btn-gold" type="submit">Search</button></form></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('.search-close').addEventListener('click',()=>overlay.classList.remove('open'));
      overlay.addEventListener('click',ev=>{if(ev.target===overlay)overlay.classList.remove('open')});
      overlay.querySelector('form').addEventListener('submit',ev=>{ev.preventDefault();const q=overlay.querySelector('input').value.trim();if(q)location.href=`shop.html?q=${encodeURIComponent(q)}`});
    }
    overlay.classList.add('open');
    setTimeout(()=>overlay.querySelector('input')?.focus(),0);
  });
}

const cards=[...document.querySelectorAll('.catalog-card')];
if(cards.length){
  const heading=document.querySelector('.inner-heading');
  const wrap=document.createElement('div');
  wrap.className='shop-search';
  wrap.innerHTML='<input type="search" aria-label="Filter collection" placeholder="Search the collection…"><p class="search-empty">No matching collection pieces found. Try another search.</p>';
  heading?.insertAdjacentElement('afterend',wrap);
  const input=wrap.querySelector('input');
  const empty=wrap.querySelector('.search-empty');
  const filter=()=>{
    const q=input.value.trim().toLowerCase();
    let visible=0;
    cards.forEach(card=>{const hit=!q||card.textContent.toLowerCase().includes(q);card.hidden=!hit;if(hit)visible++});
    empty.classList.toggle('show',visible===0);
  };
  const q=new URLSearchParams(location.search).get('q')||'';
  input.value=q;
  input.addEventListener('input',filter);
  filter();
}

const form=document.querySelector('#quote-form');
form?.addEventListener('submit',e=>{
  e.preventDefault();
  if(!form.reportValidity())return;
  const d=new FormData(form);
  const value=name=>String(d.get(name)||'').trim();
  const msg=`Hi Tasmaarah Collection, I'd like a quote.\n\nName: ${value('name')}\nOccasion: ${value('occasion')}\nService: ${value('service')}\nMaterial: ${value('material')}\nSize: ${value('size')}\nDetails: ${value('details')||'Not provided'}`;
  const url=`https://wa.me/27635409729?text=${encodeURIComponent(msg)}`;
  window.location.assign(url);
});

const gallery=[...document.querySelectorAll('.masonry-gallery img,.gallery-preview img')];
if(gallery.length){
  gallery.forEach(img=>{if(!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async'});
  const box=document.createElement('div');
  box.className='lightbox';
  box.setAttribute('role','dialog');
  box.setAttribute('aria-modal','true');
  box.setAttribute('aria-label','Gallery viewer');
  box.innerHTML='<button class="lightbox-close" aria-label="Close">×</button><button class="lightbox-prev" aria-label="Previous">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" aria-label="Next">›</button>';
  document.body.appendChild(box);
  const image=box.querySelector('img'),caption=box.querySelector('figcaption');
  let index=0,lastFocus=null;
  const show=i=>{index=(i+gallery.length)%gallery.length;const src=gallery[index];image.src=src.currentSrc||src.src;image.alt=src.alt||'Tasmaarah Collection';caption.textContent=src.alt||'Tasmaarah Collection'};
  const open=i=>{lastFocus=document.activeElement;show(i);box.classList.add('open');document.body.classList.add('lightbox-open');box.querySelector('.lightbox-close').focus()};
  const close=()=>{box.classList.remove('open');document.body.classList.remove('lightbox-open');lastFocus?.focus?.()};
  gallery.forEach((img,i)=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',`Open image: ${img.alt||'Tasmaarah Collection'}`);img.addEventListener('click',()=>open(i));img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(i)}})});
  box.querySelector('.lightbox-close').onclick=close;
  box.querySelector('.lightbox-prev').onclick=()=>show(index-1);
  box.querySelector('.lightbox-next').onclick=()=>show(index+1);
  box.addEventListener('click',e=>{if(e.target===box)close()});
  document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1)});
}

// Make non-critical content images lighter on first paint without affecting the hero/logo.
document.querySelectorAll('main img').forEach(img=>{if(!img.closest('.ref-hero')&&!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async'});
