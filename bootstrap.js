'use strict';
(function(){
  const script=document.createElement('script');
  script.src='./game.js?load='+Date.now();
  script.async=false;
  script.onerror=function(){
    const overlay=document.getElementById('overlay');
    const body=document.getElementById('dialogBody');
    if(body&&overlay){
      body.textContent='게임 파일을 불러오지 못했어. 네트워크 연결을 확인하고 새로고침해 줘.';
      overlay.classList.remove('hidden');
    }
  };
  document.body.appendChild(script);
})();
