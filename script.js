(()=>{
  'use strict';

  const root=document.documentElement;
  root.classList.add('js');

  const art=document.createElement('link');
  art.rel='stylesheet';
  art.href='atelier-client-ready.css?v=6';
  art.dataset.tasmaarahArt='true';
  document.head.appendChild(art);

  const safeStorage={
    get(key){try{return localStorage.getItem(key)}catch{return null}},
    set(key,value){try{localStorage.setItem(key,value)}catch{}}
  };

  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton=document.querySelector('.motion-toggle');
  const savedMotion=safeStorage.get('tasmaarah-motion');
  const setMotion=enabled=>{
    document.body.dataset.motion=enabled?'on':'off';
    if(motionButton){
      motionButton.textContent=enabled?'Pause motion':'Play motion';
      motionButton.setAttribute('aria-pressed',String(!enabled));
      motionButton.setAttribute('aria-label',enabled?'Pause decorative motion':'Play decorative motion');
    }
    safeStorage.set('tasmaarah-motion',enabled?'on':'off');
  };
  setMotion(savedMotion?savedMotion==='on':!motionQuery.matches);
  motionButton?.addEventListener('click',()=>setMotion(document.body.dataset.motion!=='on'));

  const mobileMenu=document.querySelector('.mobile-menu');
  if(mobileMenu){
    const summary=mobileMenu.querySelector('summary');
    const panel=mobileMenu.querySelector('.mobile-panel');
    const header=document.querySelector('.site-header');
    const positionPanel=()=>{
      if(!panel||!header)return;
      const top=Math.max(0,Math.round(header.getBoundingClientRect().bottom));
      panel.style.top=`${top}px`;
      panel.style.height=`calc(100dvh - ${top}px)`;
    };
    const closeMenu=()=>{mobileMenu.open=false};
    mobileMenu.addEventListener('toggle',()=>{
      const open=mobileMenu.open;
      summary?.setAttribute('aria-expanded',String(open));
      summary?.setAttribute('aria-label',open?'Close navigation':'Open navigation');
      document.body.classList.toggle('menu-open',open);
      document.body.style.overflow=open?'hidden':'';
      if(open){positionPanel();panel?.querySelector('a')?.focus({preventScroll:true})}
    });
    panel?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileMenu.open){closeMenu();summary?.focus()}});
    document.addEventListener('pointerdown',event=>{if(mobileMenu.open&&!mobileMenu.contains(event.target))closeMenu()},{passive:true});
    window.addEventListener('resize',()=>{if(window.innerWidth>980&&mobileMenu.open)closeMenu();else if(mobileMenu.open)positionPanel()},{passive:true});
    window.addEventListener('scroll',()=>{if(mobileMenu.open)positionPanel()},{passive:true});
  }

  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.desktop-nav a,.mobile-panel a').forEach(link=>{
    const target=(link.getAttribute('href')||'').split('#')[0].toLowerCase();
    if(target===current)link.setAttribute('aria-current','page');
  });

  const catalogCards=[...document.querySelectorAll('.catalog-card')];
  const catalogSearch=document.querySelector('[data-catalog-search]');
  const emptyState=document.querySelector('.empty-state');
  if(catalogCards.length&&catalogSearch){
    const filter=()=>{
      const query=catalogSearch.value.trim().toLowerCase();
      let visible=0;
      catalogCards.forEach(card=>{
        const hit=!query||card.textContent.toLowerCase().includes(query);
        card.hidden=!hit;
        if(hit)visible++;
      });
      emptyState?.classList.toggle('show',visible===0);
    };
    catalogSearch.value=new URLSearchParams(location.search).get('q')||'';
    catalogSearch.addEventListener('input',filter);
    filter();
  }

  if(catalogCards.length){
    const quickView=document.createElement('div');
    quickView.className='quick-view';
    quickView.setAttribute('role','dialog');
    quickView.setAttribute('aria-modal','true');
    quickView.setAttribute('aria-label','Collection quick view');
    quickView.innerHTML='<div class="quick-view-panel"><button class="quick-view-close" type="button" aria-label="Close quick view">×</button><div class="quick-view-media"><img alt=""></div><div class="quick-view-copy"><p class="section-kicker">Tasmaarah Collection</p><h2></h2><p class="quick-view-description"></p><div class="quick-view-actions"><a class="btn btn-gold quick-view-whatsapp" target="_blank" rel="noopener">Request this style on WhatsApp</a><a class="btn btn-outline" href="custom-orders.html">Explore custom options</a></div><p class="quick-view-note">Available options depend on material, size, hire or purchase and custom requirements.</p></div></div>';
    document.body.appendChild(quickView);
    const closeButton=quickView.querySelector('.quick-view-close');
    const image=quickView.querySelector('img');
    const title=quickView.querySelector('h2');
    const description=quickView.querySelector('.quick-view-description');
    const whatsapp=quickView.querySelector('.quick-view-whatsapp');
    let lastFocus=null;
    const close=()=>{
      quickView.classList.remove('open');
      document.body.classList.remove('quick-view-open');
      lastFocus?.focus?.();
    };
    const open=card=>{
      const cardImage=card.querySelector('img');
      const cardTitle=card.querySelector('h2')?.textContent.trim()||'Tasmaarah presentation';
      const cardDescription=card.querySelector('p')?.textContent.trim()||'';
      lastFocus=document.activeElement;
      image.src=cardImage?.currentSrc||cardImage?.src||'';
      image.alt=cardImage?.alt||cardTitle;
      title.textContent=cardTitle;
      description.textContent=cardDescription;
      const message=`Hi Tasmaarah Collection, I'm interested in the ${cardTitle} style shown on your website. Please can you help me with options and a quote?`;
      whatsapp.href=`https://wa.me/27635409729?text=${encodeURIComponent(message)}`;
      quickView.classList.add('open');
      document.body.classList.add('quick-view-open');
      closeButton?.focus();
    };
    catalogCards.forEach(card=>{
      const actions=card.querySelector('div');
      const trigger=document.createElement('button');
      trigger.type='button';
      trigger.className='catalog-quick';
      trigger.textContent='Quick view';
      trigger.setAttribute('aria-label',`Quick view ${card.querySelector('h2')?.textContent.trim()||'collection piece'}`);
      actions?.appendChild(trigger);
      trigger.addEventListener('click',()=>open(card));
    });
    closeButton?.addEventListener('click',close);
    quickView.addEventListener('click',event=>{if(event.target===quickView)close()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&quickView.classList.contains('open'))close()});
  }

  const quoteForm=document.querySelector('#quote-form');
  if(quoteForm){
    const preview=document.createElement('div');
    preview.className='quote-preview';
    preview.setAttribute('aria-live','polite');
    quoteForm.insertBefore(preview,quoteForm.querySelector('button[type="submit"]'));
    const value=name=>String(new FormData(quoteForm).get(name)||'').trim();
    const updatePreview=()=>{
      preview.innerHTML=`<b>Occasion</b><span>${value('occasion')||'Not selected'}</span><b>Service</b><span>${value('service')||'Not selected'}</span><b>Material</b><span>${value('material')||'Not selected'}</span><b>Size</b><span>${value('size')||'Not selected'}</span>`;
    };
    quoteForm.addEventListener('input',updatePreview);
    quoteForm.addEventListener('change',updatePreview);
    updatePreview();
    quoteForm.addEventListener('submit',event=>{
      event.preventDefault();
      if(!quoteForm.reportValidity())return;
      const data=new FormData(quoteForm);
      const field=name=>String(data.get(name)||'').trim();
      const message=[
        "Hi Tasmaarah Collection, I'd like a quote.",
        '',
        `Name: ${field('name')}`,
        `Occasion: ${field('occasion')}`,
        `Service: ${field('service')}`,
        `Material: ${field('material')}`,
        `Size: ${field('size')}`,
        `Details: ${field('details')||'Not provided'}`
      ].join('\n');
      window.location.href=`https://wa.me/27635409729?text=${encodeURIComponent(message)}`;
    });
  }

  const galleryImages=[...document.querySelectorAll('.masonry-gallery img')];
  if(galleryImages.length){
    const lightbox=document.createElement('div');
    lightbox.className='lightbox';
    lightbox.setAttribute('role','dialog');
    lightbox.setAttribute('aria-modal','true');
    lightbox.setAttribute('aria-label','Gallery viewer');
    lightbox.innerHTML='<button class="lightbox-close" type="button" aria-label="Close gallery">×</button><button class="lightbox-prev" type="button" aria-label="Previous image">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" type="button" aria-label="Next image">›</button>';
    document.body.appendChild(lightbox);
    const image=lightbox.querySelector('img');
    const caption=lightbox.querySelector('figcaption');
    const closeButton=lightbox.querySelector('.lightbox-close');
    let index=0,lastFocus=null,touchStartX=0;
    const show=i=>{
      index=(i+galleryImages.length)%galleryImages.length;
      const source=galleryImages[index];
      image.src=source.currentSrc||source.src;
      image.alt=source.alt||'Tasmaarah Collection presentation';
      caption.textContent=source.alt||'Tasmaarah Collection presentation';
    };
    const open=i=>{lastFocus=document.activeElement;show(i);lightbox.classList.add('open');document.body.classList.add('lightbox-open');closeButton?.focus()};
    const close=()=>{lightbox.classList.remove('open');document.body.classList.remove('lightbox-open');lastFocus?.focus?.()};
    galleryImages.forEach((img,i)=>{
      img.tabIndex=0;
      img.setAttribute('role','button');
      img.setAttribute('aria-label',`Open image: ${img.alt||'Tasmaarah Collection presentation'}`);
      img.addEventListener('click',()=>open(i));
      img.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open(i)}});
    });
    closeButton?.addEventListener('click',close);
    lightbox.querySelector('.lightbox-prev')?.addEventListener('click',()=>show(index-1));
    lightbox.querySelector('.lightbox-next')?.addEventListener('click',()=>show(index+1));
    lightbox.addEventListener('click',event=>{if(event.target===lightbox)close()});
    lightbox.addEventListener('touchstart',event=>{touchStartX=event.touches[0]?.clientX||0},{passive:true});
    lightbox.addEventListener('touchend',event=>{const x=event.changedTouches[0]?.clientX||touchStartX;const delta=x-touchStartX;if(Math.abs(delta)>48)show(index+(delta<0?1:-1))},{passive:true});
    document.addEventListener('keydown',event=>{if(!lightbox.classList.contains('open'))return;if(event.key==='Escape')close();if(event.key==='ArrowLeft')show(index-1);if(event.key==='ArrowRight')show(index+1)});
  }

  /* Warm the small homepage campaign sets immediately at low priority so fast scrolls never expose empty frames. */
  const warmCampaign=()=>document.querySelectorAll('.occasion-grid img[loading="lazy"]').forEach(img=>{img.loading='eager';img.fetchPriority='low'});
  const warmGallery=()=>document.querySelectorAll('.gallery-tease img[loading="lazy"]').forEach(img=>{img.loading='eager';img.fetchPriority='low'});
  warmCampaign();
  warmGallery();

  /* Core content always remains visible; reveal motion enhances rather than gates access. */
  const reveals=[...document.querySelectorAll('[data-reveal]')];
  if('IntersectionObserver' in window&&!motionQuery.matches){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.querySelectorAll('img[loading="lazy"]').forEach(img=>{img.loading='eager'});
        entry.target.classList.remove('reveal-enter');
        void entry.target.offsetWidth;
        entry.target.classList.add('reveal-enter');
        observer.unobserve(entry.target);
      });
    },{threshold:.06,rootMargin:'20% 0px 20% 0px'});
    reveals.forEach(el=>observer.observe(el));
  }

  /* Desktop-only pointer work; mobile does no continuous touch styling work. */
  if(window.matchMedia('(pointer:fine)').matches){
    let pointerRaf=0;
    window.addEventListener('pointermove',event=>{
      if(document.body.dataset.motion!=='on')return;
      cancelAnimationFrame(pointerRaf);
      pointerRaf=requestAnimationFrame(()=>{
        root.style.setProperty('--pointer-x',`${Math.max(0,Math.min(100,event.clientX/window.innerWidth*100)).toFixed(0)}%`);
        root.style.setProperty('--pointer-y',`${Math.max(0,Math.min(100,event.clientY/window.innerHeight*100)).toFixed(0)}%`);
      });
    },{passive:true});
  }

  document.querySelectorAll('main img').forEach(img=>{
    if(img.classList.contains('hero-art'))return;
    img.decoding='async';
    if(!img.hasAttribute('loading'))img.loading='lazy';
  });
})();
