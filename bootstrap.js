'use strict';
(function () {
  const version = Date.now().toString();
  const oldStyle = document.querySelector('link[rel="stylesheet"]');
  const freshStyle = document.createElement('link');
  freshStyle.rel = 'stylesheet';
  freshStyle.href = './style.css?fresh=' + version;
  freshStyle.onload = function () {
    if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);
  };
  document.head.appendChild(freshStyle);
  const battleStyle = document.createElement('link');
  battleStyle.rel = 'stylesheet';
  battleStyle.href = './battle-v2.css?fresh=' + version;
  document.head.appendChild(battleStyle);
  const script = document.createElement('script');
  script.src = './game.js?fresh=' + version;
  script.async = false;
  script.onerror = function () {
    const overlay = document.getElementById('overlay');
    const body = document.getElementById('dialogBody');
    if (body && overlay) {
      body.innerHTML = '<h2>게임 파일을 불러오지 못했어</h2><p>네트워크를 확인한 후 새로고침해 줘.</p>';
      overlay.classList.remove('hidden');
    }
  };
  const artScript=document.createElement('script');
  artScript.src='./field-art.js?fresh='+version;
  artScript.async=false;
  artScript.onload=function(){document.body.appendChild(script)};
  artScript.onerror=function(){
    const body=document.getElementById('dialogBody');
    const overlay=document.getElementById('overlay');
    if(body&&overlay){
      body.innerHTML='<h2>필드 그래픽을 불러오지 못했어</h2><p>페이지를 다시 열어줘.</p>';
      overlay.classList.remove('hidden');
    }
  };
  document.body.appendChild(artScript);
})();