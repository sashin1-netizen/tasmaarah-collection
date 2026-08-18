(()=>{
  'use strict';
  const root=document.documentElement;
  root.classList.add('js');

  const addCss=(href,key)=>{
    if(document.querySelector(`[data-${key}]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.dataset[key]='true';
    document.head.appendChild(link);
  };
  addCss('atelier-client-ready.css?v=10','tasmaarahArt');
  addCss('mobile-recovery-v2.css?v=2','tasmaarahMobile');

  const safeStorage={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}}};
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton=document.querySelector('.motion-toggle');
  const setMotion=enabled=>{
    document.body.dataset.motion=enabled?'on':'off';
    if(motionButton){motionButton.textContent=enabled?'Pause motion':'Play motion';motionButton.setAttribute('aria-pressed',String(!enabled));motionButton.setAttribute('aria-label',enabled?'Pause decorative motion':'Play decorative motion')}
    safeStorage.set('tasmaarah-motion',enabled?'on':'off');
  };
  const saved=safeStorage.get('tasmaarah-motion');
  setMotion(saved?saved==='on':!reduce.matches);
  motionButton?.addEventListener('click',()=>setMotion(document.body.dataset.motion!=='on'));

  const progress=document.createElement('div');
  progress.className='page-progress';progress.setAttribute('aria-hidden','true');
  document.body.appendChild(progress);
  let scrollRaf=0;
  const updateScrollState=()=>{
    cancelAnimationFrame(scrollRaf);
    scrollRaf=requestAnimationFrame(()=>{
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      progress.style.transform=`scaleX(${Math.min(1,scrollY/max)})`;
      document.body.classList.toggle('has-scrolled',scrollY>24);
    });
  };
  addEventListener('scroll',updateScrollState,{passive:true});updateScrollState();

  const menu=document.querySelector('.mobile-menu');
  if(menu){
    const summary=menu.querySelector('summary'),panel=menu.querySelector('.mobile-panel'),header=document.querySelector('.site-header');
    const position=()=>{if(!panel||!header)return;const top=Math.max(0,Math.round(header.getBoundingClientRect().bottom));panel.style.top=`${top}px`;panel.style.height=`calc(100dvh - ${top}px)`};
    const close=()=>{menu.open=false};
    menu.addEventListener('toggle',()=>{const open=menu.open;summary?.setAttribute('aria-expanded',String(open));summary?.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.body.classList.toggle('menu-open',open);document.body.style.overflow=open?'hidden':'';if(open){position();panel?.querySelector('a')?.focus({preventScroll:true})}});
    panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){close();summary?.focus()}});
    document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))close()},{passive:true});
    addEventListener('resize',()=>{if(innerWidth>980&&menu.open)close();else if(menu.open)position()},{passive:true});
  }

  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.desktop-nav a,.mobile-panel a').forEach(a=>{const target=(a.getAttribute('href')||'').split('#')[0].toLowerCase();if(target===current)a.setAttribute('aria-current','page')});

  const hero=document.querySelector('.hero-art');
  if(hero){hero.loading='eager';hero.fetchPriority='high';hero.decoding='sync'}
  const images=[...document.querySelectorAll('main img')];
  images.forEach(img=>{
    if(img!==hero){img.decoding='async';if(!img.hasAttribute('loading'))img.loading='lazy'}
    const ready=()=>img.classList.add('image-ready');
    if(img.complete)ready();else img.addEventListener('load',ready,{once:true});
  });
  const lazy=images.filter(img=>img!==hero&&img.loading==='lazy');
  if('IntersectionObserver'in window){
    const imageObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const img=entry.target;img.loading='eager';img.fetchPriority='low';imageObserver.unobserve(img)}),{rootMargin:'140% 0px 140% 0px',threshold:0});
    lazy.forEach(img=>imageObserver.observe(img));
  }

  if('IntersectionObserver'in window&&!reduce.matches){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('reveal-enter');revealObserver.unobserve(entry.target)}),{rootMargin:'15% 0px',threshold:.04});
    document.querySelectorAll('[data-reveal]').forEach(el=>revealObserver.observe(el));
  }

  const focusable='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const trap=(e,box)=>{if(e.key!=='Tab')return;const all=[...box.querySelectorAll(focusable)].filter(el=>el.offsetParent!==null);if(!all.length)return;const first=all[0],last=all[all.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};

  const cards=[...document.querySelectorAll('.catalog-card')];
  const search=document.querySelector('[data-catalog-search]');
  const empty=document.querySelector('.empty-state');
  if(cards.length&&search){
    const toolbar=search.closest('.catalog-toolbar');
    const filters=document.createElement('div');filters.className='catalog-filters';filters.setAttribute('aria-label','Filter collection');
    const options=['All',...cards.map(c=>c.querySelector('h2')?.textContent.trim()).filter(Boolean)];
    let active='All';
    const apply=()=>{const q=search.value.trim().toLowerCase();let visible=0;cards.forEach(card=>{const title=card.querySelector('h2')?.textContent.trim()||'';const hitText=!q||card.textContent.toLowerCase().includes(q);const hitFilter=active==='All'||title===active;card.hidden=!(hitText&&hitFilter);if(!card.hidden)visible++});empty?.classList.toggle('show',visible===0)};
    [...new Set(options)].forEach(label=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.className='catalog-filter';if(label==='All')b.classList.add('active');b.addEventListener('click',()=>{active=label;filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));apply()});filters.appendChild(b)});
    toolbar?.appendChild(filters);
    search.value=new URLSearchParams(location.search).get('q')||'';
    search.addEventListener('input',apply);apply();
  }

  if(cards.length){
    const dialog=document.createElement('div');dialog.className='quick-view';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Collection quick view');
    dialog.innerHTML='<div class="quick-view-panel"><button class="quick-view-close" type="button" aria-label="Close quick view">×</button><div class="quick-view-media"><img alt=""></div><div class="quick-view-copy"><p class="section-kicker">Tasmaarah Collection</p><h2></h2><p class="quick-view-description"></p><div class="quick-view-actions"><a class="btn btn-gold quick-view-whatsapp" target="_blank" rel="noopener">Request this style on WhatsApp</a><a class="btn btn-outline" href="custom-orders.html">Explore custom options</a></div><p class="quick-view-note">Available options depend on material, size, hire or purchase and custom requirements.</p></div></div>';
    document.body.appendChild(dialog);
    const closeBtn=dialog.querySelector('.quick-view-close'),img=dialog.querySelector('img'),title=dialog.querySelector('h2'),desc=dialog.querySelector('.quick-view-description'),wa=dialog.querySelector('.quick-view-whatsapp');let last=null;
    const close=()=>{dialog.classList.remove('open');document.body.classList.remove('quick-view-open');last?.focus?.()};
    const open=card=>{const source=card.querySelector('img'),name=card.querySelector('h2')?.textContent.trim()||'Tasmaarah presentation';last=document.activeElement;img.src=source?.currentSrc||source?.src||'';img.alt=source?.alt||name;title.textContent=name;desc.textContent=card.querySelector('p')?.textContent.trim()||'';wa.href=`https://wa.me/27635409729?text=${encodeURIComponent(`Hi Tasmaarah Collection, I'm interested in the ${name} style shown on your website. Please can you help me with options and a quote?`)}`;dialog.classList.add('open');document.body.classList.add('quick-view-open');closeBtn?.focus()};
    cards.forEach(card=>{const area=card.querySelector('div');const b=document.createElement('button');b.type='button';b.className='catalog-quick';b.textContent='Quick view';b.setAttribute('aria-label',`Quick view ${card.querySelector('h2')?.textContent.trim()||'collection piece'}`);area?.appendChild(b);b.addEventListener('click',()=>open(card))});
    closeBtn?.addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog)close()});document.addEventListener('keydown',e=>{if(!dialog.classList.contains('open'))return;if(e.key==='Escape')close();else trap(e,dialog)});
  }

  const form=document.querySelector('#quote-form');
  if(form){
    const preview=document.createElement('div');preview.className='quote-preview';preview.setAttribute('aria-live','polite');form.insertBefore(preview,form.querySelector('button[type="submit"]'));
    const val=name=>String(new FormData(form).get(name)||'').trim();
    const render=()=>{preview.innerHTML=`<b>Occasion</b><span>${val('occasion')||'Not selected'}</span><b>Service</b><span>${val('service')||'Not selected'}</span><b>Material</b><span>${val('material')||'Not selected'}</span><b>Size</b><span>${val('size')||'Not selected'}</span>`};
    form.addEventListener('input',render);form.addEventListener('change',render);render();
    form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form),f=n=>String(d.get(n)||'').trim();const msg=["Hi Tasmaarah Collection, I'd like a quote.",'',`Name: ${f('name')}`,`Occasion: ${f('occasion')}`,`Service: ${f('service')}`,`Material: ${f('material')}`,`Size: ${f('size')}`,`Details: ${f('details')||'Not provided'}`].join('\n');location.href=`https://wa.me/27635409729?text=${encodeURIComponent(msg)}`});
  }

  const gallery=[...document.querySelectorAll('.masonry-gallery img')];
  if(gallery.length){
    const box=document.createElement('div');box.className='lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Gallery viewer');box.innerHTML='<button class="lightbox-close" type="button" aria-label="Close gallery">×</button><button class="lightbox-prev" type="button" aria-label="Previous image">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" type="button" aria-label="Next image">›</button>';document.body.appendChild(box);
    const img=box.querySelector('img'),cap=box.querySelector('figcaption'),closeBtn=box.querySelector('.lightbox-close');let index=0,last=null,touchX=0;
    const show=i=>{index=(i+gallery.length)%gallery.length;const s=gallery[index];img.src=s.currentSrc||s.src;img.alt=s.alt||'Tasmaarah Collection presentation';cap.textContent=s.alt||'Tasmaarah Collection presentation'};
    const open=i=>{last=document.activeElement;show(i);box.classList.add('open');document.body.classList.add('lightbox-open');closeBtn?.focus()};
    const close=()=>{box.classList.remove('open');document.body.classList.remove('lightbox-open');last?.focus?.()};
    gallery.forEach((image,i)=>{image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',`Open image: ${image.alt||'Tasmaarah Collection presentation'}`);image.addEventListener('click',()=>open(i));image.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(i)}})});
    closeBtn?.addEventListener('click',close);box.querySelector('.lightbox-prev')?.addEventListener('click',()=>show(index-1));box.querySelector('.lightbox-next')?.addEventListener('click',()=>show(index+1));box.addEventListener('click',e=>{if(e.target===box)close()});box.addEventListener('touchstart',e=>touchX=e.touches[0]?.clientX||0,{passive:true});box.addEventListener('touchend',e=>{const delta=(e.changedTouches[0]?.clientX||touchX)-touchX;if(Math.abs(delta)>48)show(index+(delta<0?1:-1))},{passive:true});document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(index-1);else if(e.key==='ArrowRight')show(index+1);else trap(e,box)});
  }

  if(matchMedia('(pointer:fine)').matches){let raf=0;addEventListener('pointermove',e=>{if(document.body.dataset.motion!=='on')return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{root.style.setProperty('--pointer-x',`${Math.max(0,Math.min(100,e.clientX/innerWidth*100)).toFixed(0)}%`);root.style.setProperty('--pointer-y',`${Math.max(0,Math.min(100,e.clientY/innerHeight*100)).toFixed(0)}%`)})},{passive:true})}
})();
