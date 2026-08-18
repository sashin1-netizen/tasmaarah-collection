(()=>{
  'use strict';

  const root=document.documentElement;
  root.classList.add('js');

  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton=document.querySelector('.motion-toggle');
  const savedMotion=localStorage.getItem('tasmaarah-motion');
  const setMotion=enabled=>{
    document.body.dataset.motion=enabled?'on':'off';
    if(motionButton){
      motionButton.textContent=enabled?'Pause motion':'Play motion';
      motionButton.setAttribute('aria-pressed',String(!enabled));
    }
    localStorage.setItem('tasmaarah-motion',enabled?'on':'off');
  };
  setMotion(savedMotion?savedMotion==='on':!motionQuery.matches);
  motionButton?.addEventListener('click',()=>setMotion(document.body.dataset.motion!=='on'));

  const mobileMenu=document.querySelector('.mobile-menu');
  if(mobileMenu){
    const summary=mobileMenu.querySelector('summary');
    const panel=mobileMenu.querySelector('.mobile-panel');
    const closeMenu=()=>{mobileMenu.open=false;summary?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')};
    mobileMenu.addEventListener('toggle',()=>{
      const open=mobileMenu.open;
      summary?.setAttribute('aria-expanded',String(open));
      document.body.classList.toggle('menu-open',open);
    });
    panel?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileMenu.open){closeMenu();summary?.focus()}});
    document.addEventListener('pointerdown',event=>{if(mobileMenu.open&&!mobileMenu.contains(event.target))closeMenu()},{passive:true});
    window.addEventListener('resize',()=>{if(window.innerWidth>980&&mobileMenu.open)closeMenu()},{passive:true});
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

  const quoteForm=document.querySelector('#quote-form');
  quoteForm?.addEventListener('submit',event=>{
    event.preventDefault();
    if(!quoteForm.reportValidity())return;
    const data=new FormData(quoteForm);
    const value=name=>String(data.get(name)||'').trim();
    const message=[
      "Hi Tasmaarah Collection, I'd like a quote.",
      '',
      `Name: ${value('name')}`,
      `Occasion: ${value('occasion')}`,
      `Service: ${value('service')}`,
      `Material: ${value('material')}`,
      `Size: ${value('size')}`,
      `Details: ${value('details')||'Not provided'}`
    ].join('\n');
    window.location.href=`https://wa.me/27635409729?text=${encodeURIComponent(message)}`;
  });

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
    let index=0;
    let lastFocus=null;
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
    document.addEventListener('keydown',event=>{if(!lightbox.classList.contains('open'))return;if(event.key==='Escape')close();if(event.key==='ArrowLeft')show(index-1);if(event.key==='ArrowRight')show(index+1)});
  }

  const revealTargets=[...document.querySelectorAll('[data-reveal]')];
  if(revealTargets.length){
    revealTargets.forEach(el=>el.classList.add('reveal'));
    if('IntersectionObserver' in window&&document.body.dataset.motion==='on'){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}});
      },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
      revealTargets.forEach(el=>observer.observe(el));
    }else revealTargets.forEach(el=>el.classList.add('is-visible'));
  }

  let pointerRaf=0;
  const updatePointer=(x,y)=>{
    if(document.body.dataset.motion!=='on')return;
    cancelAnimationFrame(pointerRaf);
    pointerRaf=requestAnimationFrame(()=>{
      root.style.setProperty('--pointer-x',`${Math.max(0,Math.min(100,x/window.innerWidth*100)).toFixed(1)}%`);
      root.style.setProperty('--pointer-y',`${Math.max(0,Math.min(100,y/window.innerHeight*100)).toFixed(1)}%`);
    });
  };
  window.addEventListener('pointermove',event=>updatePointer(event.clientX,event.clientY),{passive:true});
  window.addEventListener('touchmove',event=>{const touch=event.touches[0];if(touch)updatePointer(touch.clientX,touch.clientY)},{passive:true});

  document.querySelectorAll('main img').forEach(img=>{
    img.decoding='async';
    if(!img.hasAttribute('loading')&&!img.classList.contains('hero-art'))img.loading='lazy';
  });
})();
