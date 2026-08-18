(()=>{
  'use strict';
  const images=[...document.querySelectorAll('main img')];
  images.forEach((img,index)=>{
    if(!img.classList.contains('hero-art')){
      img.loading='eager';
      img.fetchPriority=index<8?'low':'auto';
      img.decoding='async';
    }
  });
  const settle=()=>Promise.allSettled(images.map(img=>{
    if(img.complete&&img.naturalWidth>0)return Promise.resolve();
    return img.decode?.().catch(()=>{})||Promise.resolve();
  }));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settle,{once:true});
  else settle();
})();
