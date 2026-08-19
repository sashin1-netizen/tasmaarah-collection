(()=>{
'use strict';
const root=document.documentElement;root.classList.add('js');
const safeStorage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const focusableSelector='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const trapTab=(e,c)=>{if(e.key!=='Tab'||!c)return;const f=[...c.querySelectorAll(focusableSelector)].filter(x=>x.offsetParent!==null);if(!f.length)return;const a=f[0],b=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}};

/* Official social profile — injected consistently across every public page. */
const instagramUrl='https://www.instagram.com/boxes_tasmaarah_collection';
const makeInstagram=(className,label)=>{const a=document.createElement('a');a.href=instagramUrl;a.target='_blank';a.rel='noopener noreferrer';a.className=className;a.textContent=label;a.setAttribute('aria-label','Tasmaarah Collection on Instagram');return a};
const utilityActions=document.querySelector('.utility-actions');
if(utilityActions&&!utilityActions.querySelector('.instagram-link'))utilityActions.insertBefore(makeInstagram('instagram-link','Instagram'),utilityActions.querySelector('.motion-toggle'));
const mobilePanelSocial=document.querySelector('.mobile-panel');
if(mobilePanelSocial&&!mobilePanelSocial.querySelector('.mobile-instagram')){const quote=mobilePanelSocial.querySelector('.mobile-quote');const link=makeInstagram('mobile-instagram','Instagram ↗');quote?mobilePanelSocial.insertBefore(link,quote):mobilePanelSocial.appendChild(link)}
const footerContact=document.querySelector('.footer>div:nth-of-type(3)');
if(footerContact&&!footerContact.querySelector('.footer-instagram'))footerContact.appendChild(makeInstagram('footer-instagram','Instagram @boxes_tasmaarah_collection'));

/* Motion is on by default unless the OS requests reduced motion; an explicit site choice wins. */
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)'),motionButton=document.querySelector('.motion-toggle'),motionKey='tasmaarah-motion-v3';
let saved=safeStorage.get(motionKey);
const setMotion=(on,persist=true)=>{document.body.dataset.motion=on?'on':'off';if(motionButton){motionButton.textContent=on?'Pause motion':'Play motion';motionButton.setAttribute('aria-pressed',String(!on));motionButton.setAttribute('aria-label',on?'Pause decorative motion':'Play decorative motion')}if(persist)safeStorage.set(motionKey,on?'on':'off')};
setMotion(saved?saved==='on':!motionQuery.matches,false);
motionButton?.addEventListener('click',()=>{saved=document.body.dataset.motion==='on'?'off':'on';setMotion(saved==='on',true)});
motionQuery.addEventListener?.('change',e=>{if(!safeStorage.get(motionKey))setMotion(!e.matches,false)});

/* Mobile navigation: native <details> is the no-JS fallback. JS explicitly owns the tap state on supported mobile browsers so Android/Chrome cannot leave the menu in an inconsistent state. */
const menu=document.querySelector('.mobile-menu');
if(menu){
  const summary=menu.querySelector('summary'),panel=menu.querySelector('.mobile-panel'),header=document.querySelector('.site-header');
  if(panel&&!panel.id)panel.id='mobile-navigation-panel';
  if(summary&&panel)summary.setAttribute('aria-controls',panel.id);
  const positionPanel=()=>{if(!panel||!header)return;const top=Math.max(0,Math.round(header.getBoundingClientRect().bottom));root.style.setProperty('--mobile-menu-top',`${top}px`);Object.assign(panel.style,{top:`${top}px`,height:`calc(100dvh - ${top}px)`,left:'0',right:'0',width:'100vw',maxWidth:'100vw',position:'fixed',margin:'0'})};
  const setOpen=open=>{if(menu.open!==open)menu.open=open};
  const close=()=>setOpen(false);
  summary?.addEventListener('click',e=>{if(innerWidth<=980){e.preventDefault();setOpen(!menu.open)}});
  menu.addEventListener('toggle',()=>{const open=menu.open;summary?.setAttribute('aria-expanded',String(open));summary?.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.body.classList.toggle('menu-open',open);document.body.style.overflow=open?'hidden':'';if(open){positionPanel();requestAnimationFrame(()=>{positionPanel();panel?.querySelector('a')?.focus({preventScroll:true})})}else if(panel){panel.removeAttribute('style')}});
  panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){close();summary?.focus()}else if(menu.open)trapTab(e,panel)});
  document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))close()},{passive:true});
  addEventListener('resize',()=>{if(innerWidth>980&&menu.open)close();else if(menu.open)positionPanel()},{passive:true});
  addEventListener('orientationchange',()=>setTimeout(()=>menu.open&&positionPanel(),160),{passive:true});
}

const resetTransientUI=()=>{if(menu?.open)menu.open=false;document.body.classList.remove('menu-open','lightbox-open');document.body.style.overflow=''};
addEventListener('pageshow',resetTransientUI);

/* Current navigation state. */
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
document.querySelectorAll('.desktop-nav a,.mobile-panel a').forEach(a=>{if((a.getAttribute('href')||'').split('#')[0].toLowerCase()===current)a.setAttribute('aria-current','page')});

/* Collection search with live result feedback and Escape-to-clear. */
const cards=[...document.querySelectorAll('.catalog-card')],search=document.querySelector('[data-catalog-search]'),empty=document.querySelector('.empty-state');
if(cards.length&&search){
  const status=document.createElement('p');status.className='catalog-results-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');search.closest('.catalog-toolbar')?.insertAdjacentElement('afterend',status);
  const filter=()=>{const q=search.value.trim().toLowerCase();let count=0;cards.forEach(card=>{const hit=!q||card.textContent.toLowerCase().includes(q);card.hidden=!hit;if(hit)count++});empty?.classList.toggle('show',count===0);status.textContent=q?`${count} ${count===1?'result':'results'} for “${search.value.trim()}”`:`${count} collection options`};
  search.value=new URLSearchParams(location.search).get('q')||'';search.addEventListener('input',filter);search.addEventListener('keydown',e=>{if(e.key==='Escape'&&search.value){search.value='';filter();search.focus()}});filter();
}

/* Quote form: URL parameters can prefill intent from Collection/Occasion links, then compose WhatsApp safely. */
const form=document.querySelector('#quote-form');
if(form){
  const params=new URLSearchParams(location.search),setField=(name,value)=>{if(!value)return;const field=form.elements.namedItem(name);if(!field)return;if(field instanceof HTMLSelectElement){const match=[...field.options].find(o=>o.value.toLowerCase()===value.toLowerCase()||o.text.toLowerCase()===value.toLowerCase());if(match)field.value=match.value}else field.value=value};
  ['occasion','service','material','size','details'].forEach(name=>setField(name,params.get(name)));
  const preview=document.createElement('div');preview.className='quote-preview';preview.setAttribute('aria-live','polite');form.insertBefore(preview,form.querySelector('button[type="submit"]'));
  const val=n=>String(new FormData(form).get(n)||'').trim();
  const update=()=>preview.innerHTML=`<b>Occasion</b><span>${val('occasion')||'Not selected'}</span><b>Service</b><span>${val('service')||'Not selected'}</span><b>Material</b><span>${val('material')||'Not selected'}</span><b>Size</b><span>${val('size')||'Not selected'}</span>`;
  form.addEventListener('input',update);form.addEventListener('change',update);update();
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const message=["Hi Tasmaarah Collection, I'd like a quote.",'',`Name: ${val('name')}`,`Occasion: ${val('occasion')}`,`Service: ${val('service')}`,`Material: ${val('material')}`,`Size: ${val('size')}`,`Details: ${val('details')||'Not provided'}`].join('\n');location.href=`https://wa.me/27635409729?text=${encodeURIComponent(message)}`});
}

/* Gallery: keyboard/touch lightbox plus direct enquiry about the image being viewed. */
const galleryImages=[...document.querySelectorAll('.masonry-gallery img')];
if(galleryImages.length){
  const lightbox=document.createElement('div');lightbox.className='lightbox';lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('aria-label','Gallery viewer');lightbox.innerHTML='<button class="lightbox-close" type="button" aria-label="Close gallery">×</button><button class="lightbox-prev" type="button" aria-label="Previous image">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" type="button" aria-label="Next image">›</button><a class="lightbox-enquire" target="_blank" rel="noopener">Ask about this look</a>';
  document.body.appendChild(lightbox);
  const image=lightbox.querySelector('img'),caption=lightbox.querySelector('figcaption'),closeButton=lightbox.querySelector('.lightbox-close'),enquire=lightbox.querySelector('.lightbox-enquire');let index=0,lastFocus=null,touchX=0;
  const show=n=>{index=(n+galleryImages.length)%galleryImages.length;image.src=galleryImages[index].currentSrc||galleryImages[index].src;image.alt=galleryImages[index].alt||'Tasmaarah presentation';caption.textContent=image.alt;enquire.href=`https://wa.me/27635409729?text=${encodeURIComponent(`Hi Tasmaarah Collection, I like this gallery presentation: ${image.alt}. Please tell me more about creating something similar.`)}`};
  const open=n=>{lastFocus=document.activeElement;show(n);lightbox.classList.add('open');document.body.classList.add('lightbox-open');document.body.style.overflow='hidden';closeButton?.focus()};
  const close=()=>{lightbox.classList.remove('open');document.body.classList.remove('lightbox-open');document.body.style.overflow='';lastFocus?.focus?.()};
  galleryImages.forEach((img,n)=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',`Open image: ${img.alt||'Tasmaarah presentation'}`);img.addEventListener('click',()=>open(n));img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(n)}})});
  closeButton?.addEventListener('click',close);lightbox.querySelector('.lightbox-prev')?.addEventListener('click',()=>show(index-1));lightbox.querySelector('.lightbox-next')?.addEventListener('click',()=>show(index+1));lightbox.addEventListener('click',e=>{if(e.target===lightbox)close()});lightbox.addEventListener('touchstart',e=>{touchX=e.touches[0]?.clientX||0},{passive:true});lightbox.addEventListener('touchend',e=>{const end=e.changedTouches[0]?.clientX||touchX;if(Math.abs(end-touchX)>48)show(index+(end<touchX?1:-1))},{passive:true});document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(index-1);else if(e.key==='ArrowRight')show(index+1);else trapTab(e,lightbox)});
}

/* Scroll reveals remain progressive enhancement: content is visible even without JS. */
const reveals=[...document.querySelectorAll('[data-reveal]')];
if('IntersectionObserver'in window&&!motionQuery.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal-enter');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'8% 0px'});reveals.forEach(el=>observer.observe(el))}

/* Desktop-only ambient pointer light; never required for content or navigation. */
if(matchMedia('(pointer:fine)').matches){let raf=0;addEventListener('pointermove',e=>{if(document.body.dataset.motion!=='on')return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{root.style.setProperty('--pointer-x',`${Math.max(0,Math.min(100,e.clientX/innerWidth*100))}%`);root.style.setProperty('--pointer-y',`${Math.max(0,Math.min(100,e.clientY/innerHeight*100))}%`)})},{passive:true})}

/* Image defaults: keep the hero eager, decode the rest asynchronously. */
document.querySelectorAll('main img').forEach(img=>{if(!img.classList.contains('hero-art')){img.decoding='async';if(!img.hasAttribute('loading'))img.loading='lazy'}img.addEventListener('load',()=>img.classList.add('is-loaded'),{once:true})});
document.body.classList.add('site-ready');
})();