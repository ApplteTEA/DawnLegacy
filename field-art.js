'use strict';
const FIELD_ART=(()=>{
 const svg=(body,w=96,h=96)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" shape-rendering="crispEdges">'+body+'</svg>');
 const images={};
 const load=(key,body,w=96,h=96)=>{const im=new Image();im.onload=()=>{if(typeof draw==='function')draw()};im.onerror=()=>{if(typeof draw==='function')draw()};images[key]=im;im.src=svg(body,w,h)};
 const leaf='<path d="M8 44V25h8V14h11V7h34v7h11v11h9v19H72v11H18V44Z" fill="#27583e"/><path d="M10 37V23h10V12h14V6h25v7h13v13h8v14H67v10H19V39Z" fill="#3e8a55"/><path d="M18 30V18h15V9h26v9h12v13H60v11H24V30Z" fill="#5caa66"/><path d="M25 17h17v6H25zm24 3h14v6H49zM17 33h12v5H17z" fill="#8cc880"/><path d="M28 39h36v6H28z" fill="#367748"/><path d="M14 47h64v5H14z" fill="#224d3d"/>';
 load('tree','<ellipse cx="46" cy="79" rx="34" ry="9" fill="#477c4d" opacity=".5"/><path d="M39 48h16v33H39z" fill="#76543b"/><path d="M45 50h5v26h-5z" fill="#ac8054"/>'+leaf);
 const building=(roof,roofLight,roofDark,sign)=>'<ellipse cx="48" cy="87" rx="46" ry="7" fill="#557b58" opacity=".55"/><path d="M9 36h78v47H9z" fill="#d3b78c"/><path d="M15 39h66v36H15z" fill="#f2e5c5"/><path d="M9 72h78v11H9z" fill="#b7a17b"/><path d="M6 77h84v6H6z" fill="#756c58"/><path d="M2 31h92v11H2z" fill="'+roofDark+'"/><path d="M6 19h84v15H6z" fill="'+roof+'"/><path d="M12 12h72v9H12z" fill="'+roofLight+'"/><path d="M16 23h12v4H16zm21 0h12v4H37zm21 0h12v4H58z" fill="'+roofDark+'"/><path d="M13 42h21v23H13zm49 0h21v23H62z" fill="#a98e6b"/><path d="M16 45h15v17H16zm49 0h15v17H65z" fill="#5ba8b8"/><path d="M18 47h6v6h-6zm49 0h6v6h-6z" fill="#b7e1d6"/><path d="M39 56h19v27H39z" fill="#705346"/><path d="M42 59h13v24H42z" fill="#b48060"/><path d="M52 71h2v3h-2z" fill="#f8db91"/><path d="M37 83h23v5H37z" fill="#d8c6a0"/>'+sign;
 load('home',building('#c65d65','#ef9a91','#85464f',''));
 load('lab',building('#468ba3','#83c4d1','#2b6378','<path d="M31 18h34v13H31z" fill="#f8e9c7"/><path d="M35 21h26v7H35z" fill="#3e8a99"/><path d="M39 23h18v3H39z" fill="#e9f5e8"/>'));
 load('shop',building('#649d7e','#a2c9a0','#3b705b','<path d="M30 18h36v13H30z" fill="#f8e9c7"/><path d="M34 21h28v7H34z" fill="#b16b5e"/><path d="M45 18h7v13h-7z" fill="#f7e7c8"/>'));
 load('home2',building('#aa785e','#deb18a','#795340',''));
 const person=(hat,shirt,eyes)=>'<ellipse cx="24" cy="56" rx="15" ry="4" fill="#4b7654" opacity=".5"/><path d="M14 44h9v10h-9zm12 0h9v10h-9z" fill="#2e3e5c"/><path d="M14 51h10v4H14zm12 0h10v4H26z" fill="#ded6c4"/><path d="M11 29h27v18H11z" fill="#2e4965"/><path d="M15 30h19v16H15z" fill="'+shirt+'"/><path d="M8 31h7v13H8zm30 0h6v13h-6z" fill="#e8b28d"/><path d="M16 16h17v16H16z" fill="#eec29d"/><path d="M13 12h24v9H13z" fill="#473b40"/><path d="M9 9h31v8H9z" fill="'+hat+'"/><path d="M14 3h22v8H14z" fill="'+hat+'"/><path d="M20 6h10v4H20z" fill="#f3e3c4"/>'+eyes;
 load('player',person('#d45158','#3b7cba','<path d="M20 24h3v3h-3zm10 0h3v3h-3z" fill="#343b45"/>'),48,60);
 load('npc',person('#587a99','#7ba6b1','<path d="M20 24h3v3h-3zm10 0h3v3h-3z" fill="#343b45"/>'),48,60);
 load('follower','<ellipse cx="24" cy="52" rx="16" ry="4" fill="#47734c" opacity=".5"/><path d="M11 29h28v21H11z" fill="#b88454"/><path d="M9 15h9V5h7v12h5V5h7v10h6v23H9z" fill="#d6a16c"/><path d="M14 19h22v20H14z" fill="#e5b983"/><path d="M17 29h5v5h-5zm13 0h5v5h-5z" fill="#313b42"/><path d="M23 37h5v3h-5z" fill="#9c694e"/><path d="M12 46h9v6h-9zm17 0h9v6h-9z" fill="#986c4b"/>',48,60);
 load('flower','<path d="M5 15h22v13H5z" fill="#367d50"/><path d="M2 11h28v10H2z" fill="#46965c"/><path d="M6 7h7v7H6zm12 4h7v7h-7z" fill="#f5b4bd"/><path d="M8 9h3v3H8zm12 4h3v3h-3z" fill="#f8e7af"/>',32,32);
 load('lamp','<path d="M14 12h5v20h-5z" fill="#6a5a4b"/><path d="M10 4h13v14H10z" fill="#4b6b5c"/><path d="M12 7h9v9h-9z" fill="#ffe5a5"/><path d="M8 2h17v5H8z" fill="#395d54"/>',32,32);
 load('bench','<path d="M3 12h26v5H3zm2-7h22v5H5z" fill="#c28c62"/><path d="M5 17h4v12H5zm18 0h4v12h-4z" fill="#795f4c"/>',32,32);

 // Canvas fallback is always available, including when Android WebView rejects SVG data images.
 const fallback=(ctx,key,x,y,w,h)=>{
   ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(w/96,h/96);
   const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
   if(key.startsWith('player-')){
     const facing=key.split('-')[1],walking=key.endsWith('-walk');
     const shift=walking?4:0;
     R(19,78,58,6,'#4c7855');
     R(30,61,17,18,'#2d405d');R(53,61+shift,17,18-shift,'#2d405d');
     R(30,75,17,5,'#e9dfd1');R(53,75+shift,17,5,'#e9dfd1');
     R(23,39,53,26,'#2d4b68');R(31,41,37,22,'#437eb7');
     R(16,42+(walking?3:0),12,20,'#e6b28e');
     R(72,42+(walking?0:3),12,20,'#e6b28e');
     R(34,23,31,21,facing==='up'?'#594744':'#efc09a');
     R(28,17,43,11,'#4b3e40');
     R(20,14,59,12,'#c94e58');R(30,6,39,11,'#c94e58');
     R(39,9,21,5,'#f5e1c2');
     if(facing==='down'){
       R(39,32,5,5,'#333b44');R(57,32,5,5,'#333b44');
       R(46,43,10,4,'#d39179');
     }else if(facing==='up'){
       R(34,28,31,11,'#493b3d');R(37,42,26,16,'#315a87');
       R(42,45,16,10,'#4f90bf');
     }else if(facing==='left'){
       R(30,28,8,14,'#5b4743');R(36,33,5,5,'#333b44');
       R(29,39,7,8,'#e1a784');R(65,45,8,14,'#2f5c88');
       R(19,17,10,7,'#8c424b');
     }else if(facing==='right'){
       R(62,28,8,14,'#5b4743');R(60,33,5,5,'#333b44');
       R(64,39,7,8,'#e1a784');R(27,45,8,14,'#2f5c88');
       R(71,17,10,7,'#8c424b');
     }
   }else if(key==='tree'){
     R(27,65,40,9,'#4a7950');R(42,50,14,30,'#78543b');R(46,51,6,26,'#a77d52');
     R(8,34,79,34,'#25563e');R(13,22,70,39,'#367c50');
     R(23,12,53,38,'#4b9a60');R(31,6,38,35,'#67ad70');
     R(24,29,17,12,'#89c985');R(55,19,14,9,'#9cd393');
     R(12,55,72,7,'#214f3c');R(64,46,12,12,'#2b6947');
   }else if(['home','home2','lab','shop'].includes(key)){
     const roof=key==='lab'?'#438ba2':key==='shop'?'#639b7c':key==='home2'?'#ae7a5b':'#bf5a62';
     const dark=key==='lab'?'#295f76':key==='shop'?'#3c725c':'#824750';
     R(6,35,84,48,'#5e7556');R(10,31,76,48,'#e9dec1');R(10,67,76,11,'#b8a37e');
     R(6,75,84,8,'#756d56');R(2,25,92,15,dark);R(6,14,84,15,roof);
     R(13,10,70,7,'#e9a49b');R(10,29,76,6,'#f4dfb7');
     for(let j=0;j<7;j++)R(10+j*11,20+(j%2)*4,7,3,dark);
     for(const wx of [18,63]){
       R(wx-3,42,22,24,'#b29a78');R(wx,45,16,17,'#f4e5c7');
       R(wx+2,47,12,13,'#5ba8b6');R(wx+3,48,5,5,'#c5e6df');
     }
     R(39,54,21,28,'#594b42');R(42,57,15,25,'#ac7b5e');
     R(54,68,2,3,'#f3d392');R(36,82,27,5,'#d5c39b');
     if(key==='lab'||key==='shop'){
       R(32,17,34,13,'#f4e5c9');R(36,20,26,7,key==='lab'?'#64a1ac':'#b27660');
       R(40,22,18,3,'#e2eee0');
     }
   }else if(['player','npc','follower'].includes(key)){
     if(key==='follower'){
       R(19,58,57,9,'#527d53');R(25,27,46,40,'#ba875a');
       R(22,16,16,28,'#d7a36b');R(55,16,16,28,'#d7a36b');
       R(34,30,30,29,'#e8bc88');R(36,42,7,8,'#343c43');
       R(56,42,7,8,'#343c43');R(46,52,7,5,'#9b6d50');
     }else{
       const cap=key==='player'?'#c94c55':'#597c99',coat=key==='player'?'#437cb4':'#78a6b2';
       R(23,75,52,8,'#4b7652');R(30,60,17,18,'#293d58');R(54,60,17,18,'#293d58');
       R(24,37,49,27,'#2d4d69');R(31,39,35,24,coat);
       R(17,40,13,20,'#dfab86');R(69,40,13,20,'#dfab86');
       R(35,22,28,22,'#e9ba96');R(30,17,39,10,'#433d3f');
       R(20,14,58,11,cap);R(29,6,40,11,cap);
       R(40,9,19,5,'#f2d6b8');R(40,31,5,5,'#333b42');R(58,31,5,5,'#333b42');
       R(44,43,12,5,'#c98b78');
     }
   }else if(key==='flower'){
     R(8,48,78,27,'#3d8b56');R(13,34,70,24,'#55a66a');
     for(const px of [20,48,69]){R(px,27,14,16,'#f3b5bf');R(px+4,31,6,7,'#f9e8b0')}
   }else if(key==='lamp'){
     R(43,35,12,58,'#665749');R(31,13,35,37,'#4e705d');
     R(36,19,25,25,'#ffe6a5');R(28,8,41,10,'#3a6054');
   }else if(key==='bench'){
     R(9,39,80,15,'#c48c61');R(13,22,72,13,'#b47f59');
     R(15,53,12,33,'#795e4c');R(71,53,12,33,'#795e4c');
   }
   ctx.restore();
 };
 const draw=(ctx,key,x,y,w,h)=>{
   const im=images[key];
   if(im&&im.complete&&im.naturalWidth>0){
     try{ctx.drawImage(im,Math.round(x),Math.round(y),w,h);return}catch(e){}
   }
   fallback(ctx,key,x,y,w,h);
 };
 return {draw,images};
})();