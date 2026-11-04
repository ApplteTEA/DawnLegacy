'use strict';
(async function(){
 const version='campaign-journal-20261104';
 for(const href of ['style.css','battle-v2.css']){
  const link=document.createElement('link');link.rel='stylesheet';link.href='./'+href+'?v='+version;document.head.appendChild(link);
 }
 try{
  for(const src of ['field-manifest.js','field-actors.js','world-v2.js','campaign-data.js','campaign-core.js','game.js','campaign-ui.js']){
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./'+src+'?v='+version;script.onload=resolve;script.onerror=()=>reject(new Error(src));document.body.appendChild(script)});
  }
 }catch(error){
  document.getElementById('dialogBody').innerHTML='<h2>게임 파일을 불러오지 못했어</h2><p>페이지를 새로고침해 줘.</p>';
  document.getElementById('overlay').classList.remove('hidden');console.error(error);
 }
})();
