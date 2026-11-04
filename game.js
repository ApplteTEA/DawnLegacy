'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const TYPES=['노말','불꽃','물','풀','전기','얼음','격투','독','땅','비행','에스퍼','벌레','바위','고스트','드래곤','악','강철'];
const DB=[
['치코리타','풀',45,49,49,1],['브케인','불꽃',39,52,43,1],['리아코','물',50,65,64,1],['이상해씨','풀/독',45,49,49,1],['파이리','불꽃',39,52,43,1],['꼬부기','물',44,48,65,1],['구구','노말/비행',40,45,40,2],['꼬렛','노말',30,56,35,2],['캐터피','벌레',45,30,35,2],['뿔충이','벌레/독',40,35,30,2],['모다피','풀/독',50,75,35,2],['주뱃','독/비행',40,45,35,2],['꼬마돌','바위/땅',40,80,100,2],['메리프','전기',55,40,40,2],['우파','물/땅',55,45,45,2],['델빌','악/불꽃',45,60,30,2],['이브이','노말',55,55,50,2],['고오스','고스트/독',30,35,30,2],['피카츄','전기',35,55,40,2],['식스테일','불꽃',38,41,40,2],['가디','불꽃',55,70,45,2],['미뇽','드래곤',41,64,45,2],['무우마','고스트',60,60,60,2],['코일','전기/강철',25,35,70,2],['롱스톤','바위/땅',35,45,160,2],['애버라스','바위/땅',50,64,50,2],['네이티','에스퍼/비행',40,50,45,2],['니로우','악/비행',60,85,42,2],['피콘','벌레',50,65,90,2],['마릴','물',70,20,50,2],['통통코','풀/비행',35,35,40,2],['초라기','물/전기',75,38,38,2],['고라파덕','물',50,52,48,2],['알통몬','격투',70,80,50,2],['모래두지','땅',50,75,85,2],['쥬쥬','물',65,45,55,2],['루주라','얼음/에스퍼',65,50,35,2],['꾸꾸리','얼음/땅',50,50,40,2],['포푸니','악/얼음',55,95,55,2],['단단지','벌레/바위',20,10,230,2],['에이팜','노말',55,70,55,2],['에브이','에스퍼',65,65,60,2],['블래키','악',95,65,110,2],['부스터','불꽃',65,130,60,2],['샤미드','물',130,65,60,2],['쥬피썬더','전기',65,65,60,2],['해너츠','풀',75,75,55,2],['핫삼','벌레/강철',70,130,100,2],['강철톤','강철/땅',75,85,200,2],['마그마그','불꽃',40,40,40,2],['꼬지모','바위',70,100,115,2],['헤라크로스','벌레/격투',80,125,75,2],['토게피','페어리',35,20,65,2],['무장조','강철/비행',65,80,140,2],['코코리','땅',90,60,60,2],['팬텀','고스트/독',60,65,60,2],['전룡','전기',90,75,85,2],['마그케인','불꽃',58,64,58,2],['베이리프','풀',60,62,80,2],['엘리게이','물',65,80,80,2],['마그마라시','불꽃',78,84,78,2]
].map(([name,type,hp,atk,def,stage])=>({name,types:type.split('/'),hp,atk,def,stage}));
const EVOS={'치코리타':['베이리프',16],'브케인':['마그케인',14],'리아코':['엘리게이',18],'이브이':['부스터',20,'불꽃'],'구구':['피죤',18],'캐터피':['단데기',7],'뿔충이':['딱충이',7],'메리프':['보송송',15],'고오스':['고우스트',25],'롱스톤':['강철톤',25],'피콘':['쏘콘',31],'마그마그':['마그카르고',38],'애버라스':['데기라스',30],'모다피':['우츠동',21],'주뱃':['골뱃',22],'꼬마돌':['데구리',25],'알통몬':['근육몬',28],'코일':['레어코일',30],'마릴':['마릴리',18],'통통코':['두코',18],'초라기':['랜턴',27],'고라파덕':['골덕',33],'모래두지':['고지',22],'식스테일':['나인테일',25],'가디':['윈디',25],'파이리':['리자드',16],'꼬부기':['어니부기',16],'이상해씨':['이상해풀',16]};
const EXTRA={'베이리프':['풀',60,62,80],'마그케인':['불꽃',58,64,58],'엘리게이':['물',65,80,80],'피죤':['노말/비행',63,60,55],'단데기':['벌레',50,20,55],'딱충이':['벌레/독',45,25,50],'보송송':['전기',70,55,55],'고우스트':['고스트/독',45,50,45],'쏘콘':['벌레/강철',75,90,140],'마그카르고':['불꽃/바위',60,50,120],'데기라스':['바위/땅',70,84,70],'우츠동':['풀/독',65,90,50],'골뱃':['독/비행',75,80,70],'데구리':['바위/땅',55,95,115],'근육몬':['격투',80,100,70],'레어코일':['전기/강철',50,60,95],'마릴리':['물',100,50,80],'두코':['풀/비행',55,45,50],'랜턴':['물/전기',125,58,58],'골덕':['물',80,82,78],'고지':['땅',75,100,110],'나인테일':['불꽃',73,76,75],'윈디':['불꽃',90,110,80],'리자드':['불꽃',58,64,58],'어니부기':['물',59,63,80],'이상해풀':['풀/독',60,62,63]};for(const [name,v] of Object.entries(EXTRA))if(!DB.find(p=>p.name===name))DB.push({name,types:v[0].split('/'),hp:v[1],atk:v[2],def:v[3],stage:3});
const MOVES=[['몸통박치기','노말',40,35],['할퀴기','노말',40,35],['불꽃세례','불꽃',40,25],['물대포','물',40,25],['덩굴채찍','풀',45,25],['전기쇼크','전기',40,30],['얼음뭉치','얼음',40,25],['태권당수','격투',50,25],['독침','독',40,30],['진흙뿌리기','땅',40,25],['날개치기','비행',50,30],['염동력','에스퍼',50,25],['벌레먹음','벌레',50,25],['돌떨구기','바위',50,20],['핥기','고스트',40,30],['용의숨결','드래곤',60,20],['물기','악',60,25],['메탈클로','강철',50,25]];
const MATCH={'불꽃':{풀:2,벌레:2,얼음:2,강철:2,물:.5,바위:.5,불꽃:.5,드래곤:.5},'물':{불꽃:2,땅:2,바위:2,물:.5,풀:.5,드래곤:.5},'풀':{물:2,땅:2,바위:2,불꽃:.5,풀:.5,독:.5,벌레:.5,비행:.5,드래곤:.5,강철:.5},'전기':{물:2,비행:2,전기:.5,풀:.5,드래곤:.5,땅:0},'땅':{전기:2,불꽃:2,독:2,바위:2,강철:2,풀:.5,벌레:.5,비행:0},'격투':{노말:2,바위:2,강철:2,얼음:2,악:2,독:.5,비행:.5,에스퍼:.5,벌레:.5,고스트:0},'고스트':{고스트:2,에스퍼:2,악:.5,노말:0},'악':{고스트:2,에스퍼:2,격투:.5,악:.5},'얼음':{풀:2,땅:2,비행:2,드래곤:2,물:.5,불꽃:.5,얼음:.5,강철:.5},'바위':{불꽃:2,얼음:2,비행:2,벌레:2,격투:.5,땅:.5,강철:.5},'벌레':{풀:2,에스퍼:2,악:2,불꽃:.5,격투:.5,독:.5,비행:.5,고스트:.5,강철:.5},'에스퍼':{격투:2,독:2,에스퍼:.5,강철:.5,악:0},'비행':{풀:2,격투:2,벌레:2,전기:.5,바위:.5,강철:.5},'독':{풀:2,독:.5,땅:.5,바위:.5,고스트:.5,강철:0},'강철':{얼음:2,바위:2,불꽃:.5,물:.5,전기:.5,강철:.5},'드래곤':{드래곤:2,강철:.5},'노말':{바위:.5,강철:.5,고스트:0}};
const ZONES=[{name:'새벽마을',x0:0,x1:20,level:3,enc:['구구','꼬렛','캐터피','뿔충이','메리프']},{name:'이슬숲',x0:20,x1:40,level:7,enc:['모다피','주뱃','통통코','네이티','피콘','고오스','마릴']},{name:'바람언덕',x0:40,x1:60,level:12,enc:['꼬마돌','롱스톤','우파','모래두지','니로우','애버라스']},{name:'별빛호수',x0:60,x1:80,level:17,enc:['초라기','고라파덕','쥬쥬','마릴','코일','꾸꾸리']},{name:'황혼고개',x0:80,x1:100,level:23,enc:['델빌','식스테일','가디','포푸니','마그마그','무장조','미뇽']}];
const NPCS=[{x:13,y:8,name:'연구원',type:'intro'},{x:25,y:11,name:'숲길 트레이너',team:['모다피','주뱃'],level:8,prize:280},{x:34,y:8,name:'첫 번째 관장',team:['구구','피죤'],level:12,prize:700,badge:1},{x:47,y:13,name:'언덕 트레이너',team:['꼬마돌','애버라스'],level:15,prize:420},{x:55,y:8,name:'두 번째 관장',team:['꼬마돌','롱스톤'],level:19,prize:900,badge:2},{x:68,y:12,name:'호수 트레이너',team:['마릴','초라기'],level:22,prize:560},{x:75,y:8,name:'세 번째 관장',team:['초라기','랜턴'],level:26,prize:1200,badge:3},{x:86,y:13,name:'고개 트레이너',team:['델빌','포푸니'],level:29,prize:720},{x:94,y:8,name:'네 번째 관장',team:['델빌','가디','무장조'],level:33,prize:1500,badge:4},{x:10,y:12,name:'시온',type:'rival',level:5,prize:200},{x:96,y:13,name:'챔피언',team:['전룡','헤라크로스','팬텀','마그마라시'],level:39,prize:4000,champion:true}];
const SAVE='dawnLegacyCompleteV2';let s=null;try{s=JSON.parse(localStorage.getItem(SAVE))}catch{}if(!s||!s.version)s={version:1,type:null,x:8,y:12,face:0,party:[],box:[],balls:12,great:2,potions:5,money:3000,badges:0,defeated:[],dex:{},steps:0,grassSteps:0,wins:0,champion:false,playSeconds:0};let mode='world',fight=null,dialogOpen=false,toastTimer=0,lastTick=Date.now(),walkCooldown=0,resetInProgress=false;
function save(){if(resetInProgress)return;try{localStorage.setItem(SAVE,JSON.stringify(s))}catch{}}function rand(n){return Math.floor(Math.random()*n)}function choose(a){return a[rand(a.length)]}function lookup(n){return DB.find(p=>p.name===n)||DB[0]}function evoTypes(n){let out=[];let seen=new Set;while(EVOS[n]&&!seen.has(n)){seen.add(n);n=EVOS[n][0];out.push(...lookup(n).types)}return out}function eligible(p){return !!(p.shiny||p.types.includes(s.type)||evoTypes(p.name).includes(s.type))}function createMon(n,l=5,shiny=Math.random()<1/2048){let b=lookup(n),max=Math.floor((2*b.hp*l)/100)+l+10;let ms=[MOVES[0],MOVES.find(m=>m[1]===b.types[0]&&m[0]!==MOVES[0][0])||MOVES.find(m=>m[0]!==MOVES[0][0])||MOVES[0]];return{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),name:n,types:b.types.slice(),level:l,xp:0,max,hp:max,shiny,moves:ms.map(m=>({name:m[0],type:m[1],power:m[2],pp:m[3],maxpp:m[3]}))}}function recalc(p){let old=p.max;let b=lookup(p.name);p.max=Math.floor((2*b.hp*p.level)/100)+p.level+10;p.hp=Math.min(p.max,p.hp+Math.max(0,p.max-old));p.types=b.types.slice()}function expNeed(p){return p.level*p.level*2}function gain(p,amount){if(!p)return[];let out=[];p.xp+=amount;while(p.xp>=expNeed(p)&&p.level<70){p.xp-=expNeed(p);p.level++;recalc(p);out.push(p.name+' Lv.'+p.level+' 달성!');let ev=EVOS[p.name];if(ev&&p.level>=ev[1]){let next=ev[0];if(p.name==='이브이'){next=({'불꽃':'부스터','물':'샤미드','전기':'쥬피썬더','에스퍼':'에브이','악':'블래키'})[s.type]||'에브이'}if(DB.some(x=>x.name===next)){out.push(p.name+' → '+next+' 진화!');p.name=next;recalc(p);p.moves[1]=(()=>{let m=MOVES.find(m=>m[1]===p.types[0])||MOVES[0];return{name:m[0],type:m[1],power:m[2],pp:m[3],maxpp:m[3]}})()}}}return out}
function zone(){return ZONES.find(z=>s.x<z.x1)||ZONES[4]}function pop(html,callback){if(!html.includes('sv-battle')){$('overlay').classList.remove('battle-mode');$('dialog').classList.remove('battle-mode')}dialogOpen=true;$('overlay').classList.remove('hidden');$('dialogBody').innerHTML=html;if(callback)callback()}function close(){if(mode==='battle')return;dialogOpen=false;$('dialogBody').innerHTML='';$('overlay').classList.remove('battle-mode');$('dialog').classList.remove('battle-mode');$('overlay').classList.add('hidden')}function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),1900)}$('close').onclick=()=>{if(mode!=='battle')close()};$('overlay').onclick=e=>{if(e.target===$('overlay')&&mode!=='battle')close()};function btn(id,fn){let el=$(id);if(el)el.onclick=fn}function hpbar(p){return '<div class="hp"><span style="width:'+Math.max(0,100*p.hp/p.max)+'%;background:'+(p.hp/p.max<.25?'#d66b52':p.hp/p.max<.5?'#d8ad50':'#55a46d')+'"></span></div>'}function tag(p){return p.types.map(t=>'<span class="type">'+t+'</span>').join('')+(p.shiny?'<span class="shiny"> ✨ 이로치</span>':'')}function card(p,i){return '<div class="panel"><div class="stat"><b>'+(i+1)+'. '+(p.shiny?'✨ ':'')+p.name+' Lv.'+p.level+'</b><span class="pill">'+(eligible(p)?'출전 가능':'수집 전용')+'</span></div>'+tag(p)+'<div class="stat"><span>HP '+p.hp+'/'+p.max+'</span><span>EXP '+p.xp+'/'+expNeed(p)+'</span></div>'+hpbar(p)+'</div>'}
function menu(){if(mode!=='world')return;pop('<h1>모험 메뉴</h1><p class="muted">선택 타입: '+s.type+' · 배지 '+s.badges+'/4 · '+(s.champion?'챔피언':'챔피언 도전 중')+'</p><div class="grid"><button id="party">파티</button><button id="box">박스</button><button id="bag">가방</button><button id="dex">도감</button><button id="guide">규칙 / 도움말</button><button id="record">모험 기록</button><button id="campaign">아우라 지방 모험 지도</button><button id="save">저장</button><button id="restart">새 게임</button></div>',()=>{btn('party',party);btn('box',box);btn('bag',bag);btn('dex',dex);btn('guide',guide);btn('record',record);btn('campaign',()=>{if(typeof CAMPAIGN_UI==='undefined'){toast('모험 지도 파일을 불러오는 중이야.');return}CAMPAIGN_UI.open({getState:()=>s,saveGame:save,pop,btn,back:menu,toast,startBattle:beginBattle,createMon,dex:DB,evolutions:EVOS})});btn('save',()=>{save();toast('저장 완료!');close()});btn('restart',()=>{pop('<h2>새 게임을 시작할까?</h2><p>기존 저장 데이터는 삭제돼.</p><button id="yes">새 게임</button><button id="no">취소</button>',()=>{btn('yes',()=>{resetInProgress=true;try{localStorage.removeItem(SAVE)}catch(error){resetInProgress=false;toast('저장 데이터를 삭제하지 못했어.');return}location.reload()});btn('no',menu)})})})}
function party(){pop('<h2>내 파티 ('+s.party.length+'/6)</h2>'+s.party.map(card).join('')+'<button id="back">메뉴</button>',()=>btn('back',menu))}
function box(){pop('<h2>포켓몬 박스 ('+s.box.length+')</h2><p class="muted">박스에서 파티로 이동할 수 있어. 출전 규칙은 그대로 적용돼.</p>'+(!s.box.length?'<p>아직 보관한 포켓몬이 없어.</p>':'')+s.box.map((p,i)=>'<div class="panel"><b>'+(p.shiny?'✨ ':'')+p.name+' Lv.'+p.level+'</b> '+tag(p)+'<button data-take="'+i+'" '+(s.party.length>=6?'disabled':'')+'>파티로 이동</button></div>').join('')+'<button id="back">메뉴</button>',()=>{document.querySelectorAll('[data-take]').forEach(b=>b.onclick=()=>{s.party.push(s.box.splice(+b.dataset.take,1)[0]);save();box()});btn('back',menu)})}
function bag(){pop('<h2>가방 / 상점</h2><p>소지금: '+s.money+'원</p><div class="panel">몬스터볼 ×'+s.balls+' · 슈퍼볼 ×'+s.great+' · 상처약 ×'+s.potions+'</div><button id="heal">상처약 사용 (HP 20 회복)</button><div class="separator"></div><h3>상점</h3><button id="buyBall">몬스터볼 200원</button><button id="buyGreat">슈퍼볼 600원</button><button id="buyPotion">상처약 300원</button><button id="back">메뉴</button>',()=>{btn('heal',()=>{if(!s.potions)return toast('상처약이 없어');let p=s.party.find(p=>p.hp<p.max);if(!p)return toast('모두 건강해!');s.potions--;p.hp=Math.min(p.max,p.hp+20);save();bag()});[['buyBall','balls',200],['buyGreat','great',600],['buyPotion','potions',300]].forEach(([id,k,c])=>btn(id,()=>{if(s.money<c)return toast('돈이 부족해');s.money-=c;s[k]++;save();bag()}));btn('back',menu)})}
function dex(){let found=Object.keys(s.dex);pop('<h2>포켓몬 도감</h2><p>발견 '+found.length+' / '+DB.length+'종 · 포획 '+found.filter(k=>s.dex[k]>1).length+'종</p><div class="grid">'+found.sort().map(n=>'<div class="panel"><b>'+n+'</b><div class="muted">'+(s.dex[n]>1?'포획 완료':'발견')+'</div></div>').join('')+'</div><button id="back">메뉴</button>',()=>btn('back',menu))}
function guide(){pop('<h2>타입 챌린지 규칙</h2><p>① 시작 시 17개 타입 중 하나를 선택하고 룰렛으로 첫 파트너를 받아.</p><p>② 선택 타입을 가진 포켓몬과 진화하면 해당 타입이 되는 포켓몬만 전투에 사용할 수 있어.</p><p>③ <b>이로치 포켓몬은 타입과 상관없이 출전 가능</b>하고 진화해도 예외가 유지돼.</p><p>④ 다른 타입도 포획·도감 등록·박스 보관은 가능해.</p><p>⑤ 숲길에서 배틀하고 관장 4명에게 승리한 뒤 챔피언을 이겨봐.</p><p>⑥ 방향키 이동 / A 대화 / B 닫기. 메뉴에서 파티, 상점, 박스를 관리해.</p><p>⑦ 라이벌은 네 선택 타입에 강한 타입의 포켓몬을 무작위로 받고, 배지를 모으면 새벽마을에서 재대결할 수 있어.</p><button id="back">메뉴</button>',()=>btn('back',menu))}
function record(){pop('<h2>모험 기록</h2><p>타입: '+s.type+'</p><p>라이벌: '+(s.rival?s.rival.type+' 타입 · '+s.rival.starter:'미정')+'</p><p class="muted">시온은 새벽마을 시작 지점의 오른쪽 길에 있어.</p><p>라이벌 대결: '+RIVAL_SYSTEM.ROUNDS.filter(r=>s.defeated.includes(r.id)).length+'/4회 · 다음: '+(RIVAL_SYSTEM.nextRound(s)?.title||'모든 대결 완료')+'</p><p>배지: '+s.badges+'/4 · 승리: '+s.wins+'회 · 이동: '+s.steps+'걸음</p><p>플레이 시간: '+Math.floor(s.playSeconds/60)+'분</p><p>포켓몬: 파티 '+s.party.length+'마리 / 박스 '+s.box.length+'마리</p><p>'+(s.champion?'🏆 여명지방 챔피언 등극!':'아직 모험이 진행 중이야.')+'</p><button id="back">메뉴</button>',()=>btn('back',menu))}
function start(){
  let selected='불꽃';
  const SYMBOLS={'노말':'◈','불꽃':'♨','물':'◉','풀':'❀','전기':'ϟ','얼음':'❄','격투':'✊','독':'☣','땅':'◆','비행':'➤','에스퍼':'✦','벌레':'❖','바위':'⬟','고스트':'☾','드래곤':'♜','악':'☯','강철':'⬡'};
  const PALETTE={'노말':'#a2a49c','불꽃':'#e16c4e','물':'#5c99d9','풀':'#69aa68','전기':'#dfb64e','얼음':'#7ac4c7','격투':'#c15b4e','독':'#9969b6','땅':'#c3a15b','비행':'#849bc7','에스퍼':'#d86e9c','벌레':'#8ca74c','바위':'#a08d6a','고스트':'#736aab','드래곤':'#696bc8','악':'#646675','강철':'#77969b'};
  const poolFor=t=>{const evolved=new Set(Object.values(EVOS).map(e=>e[0]));return DB.filter(p=>p.stage<=2&&!evolved.has(p.name)&&(p.types.includes(t)||evoTypes(p.name).includes(t)))};
  const typeScreen=()=>{
    pop('<div class="intro"><div class="intro-eyebrow">DAWN LEGACY · NEW ADVENTURE</div><h1>너의 모험은 어떤 타입?</h1><p>단 하나의 타입으로 여명지방에 도전해 봐.</p><div class="type-grid">'+TYPES.map(t=>'<button class="type-card '+(selected===t?'active':'')+'" data-type="'+t+'" style="--type-color:'+PALETTE[t]+'"><span class="type-symbol">'+SYMBOLS[t]+'</span><span>'+t+'</span></button>').join('')+'</div><div class="type-choice"><div><span class="eyebrow">CHALLENGE TYPE</span><h2 id="selectedType">'+SYMBOLS[selected]+' '+selected+'</h2><span id="poolCount">파트너 후보 '+poolFor(selected).length+'마리</span></div><button class="intro-main" id="confirmType">이 타입으로 도전 →</button></div><p class="intro-footnote">선택 타입으로 진화하는 포켓몬도 출전 가능 · 이로치는 타입 제한 면제</p></div>',()=>{
      document.querySelectorAll('[data-type]').forEach(button=>button.onclick=()=>{
        selected=button.dataset.type;
        document.querySelectorAll('[data-type]').forEach(item=>item.classList.toggle('active',item===button));
        $('selectedType').textContent=SYMBOLS[selected]+' '+selected;
        $('poolCount').textContent='파트너 후보 '+poolFor(selected).length+'마리';
      });
      btn('confirmType',()=>rouletteIntro());
    });
  };
  const rouletteIntro=()=>{
    const pool=poolFor(selected);
    pop('<div class="intro roulette"><div class="intro-eyebrow">PARTNER SELECTION</div><h1>운명의 첫 파트너</h1><p><b>'+selected+' 타입 챌린지</b>에 함께할 포켓몬을 뽑아봐!</p><div class="roulette-stage"><div class="roulette-halo"></div><div class="roulette-ball">?</div><div class="roulette-name" id="rouletteName">누가 나올까?</div><div class="roulette-sub">후보 '+pool.length+'마리 · Lv. 5</div></div><button class="intro-main wide" id="spin">룰렛 돌리기</button><button class="intro-secondary" id="changeType">타입 다시 고르기</button></div>',()=>{
      btn('changeType',typeScreen);
      btn('spin',()=>{
        const chosen=createMon(choose(pool).name,5);
        $('spin').disabled=true;
        $('changeType').disabled=true;
        $('spin').textContent='운명의 파트너를 찾는 중…';
        const stage=document.querySelector('.roulette-stage');
        stage.classList.add('spinning');
        let tick=0;
        const timer=setInterval(()=>{
          const candidate=choose(pool);
          $('rouletteName').textContent=candidate.name;
          tick++;
          if(tick>=22){
            clearInterval(timer);
            // Rival result is decided once from the selected challenge type, not from a later reroll.
            const rival=typeof RIVAL_SYSTEM==='undefined'?null:RIVAL_SYSTEM.pick({
              playerType:selected,playerStarter:chosen.name,types:TYPES,
              dex:DB,evolutions:EVOS,match:MATCH
            });
            s.type=selected;
            s.party=[chosen];
            s.rival=rival?RIVAL_SYSTEM.fullRoster(rival,DB,EVOS):null;
            s.dex[chosen.name]=2;
            if(s.rival&&typeof CAMPAIGN_CORE!=='undefined')CAMPAIGN_CORE.ensure(s);
            save();
            reveal(chosen);
          }
        },85);
      });
    });
  };
  const reveal=p=>{
    pop('<div class="intro reveal"><div class="intro-eyebrow">YOUR FIRST PARTNER</div><div class="reveal-sparkles">✦ ✧ ✦</div><h1>새로운 파트너를 만났어!</h1><div class="partner-hero"><div class="partner-emblem">'+(p.shiny?'✦':'◈')+'</div><div class="partner-name">'+(p.shiny?'✨ ':'')+p.name+'</div><div class="partner-meta">'+tag(p)+'</div><div class="partner-level">LEVEL 05 · '+selected+' 챌린지</div></div><p>이제 첫 모험이 시작돼! 풀숲에서 야생 포켓몬을 만나보자.</p><button class="intro-main wide" id="go">라이벌의 파트너 확인 →</button></div>',()=>{
      btn('go',rivalRoulette);
    });
  };
  const rivalRoulette=()=>{
    const rival=s.rival;
    if(!rival){close();toast('라이벌 데이터를 불러오지 못했어. 새로고침해 줘.');return}
    const options=RIVAL_SYSTEM.poolFor(rival.type,DB,EVOS);
    const pool=options.filter(p=>p.name!==s.party[0].name);
    const names=(pool.length?pool:options).map(p=>p.name);
    pop('<div class="intro roulette"><div class="intro-eyebrow">RIVAL PARTNER SELECTION</div><h1>라이벌의 첫 파트너</h1><p>네가 <b>'+selected+'</b> 타입을 선택하자 라이벌은 상성에 유리한 <b>'+rival.type+'</b> 타입을 골랐어.</p><div class="roulette-stage"><div class="roulette-halo"></div><div class="roulette-ball">?</div><div class="roulette-name" id="rouletteName">누가 나올까?</div><div class="roulette-sub">후보 '+names.length+'마리 · Lv. 5</div></div><button class="intro-main wide" id="spinRival">라이벌 룰렛 돌리기</button></div>',()=>{
      btn('spinRival',()=>{
        const button=$('spinRival');
        button.disabled=true;
        button.textContent='라이벌의 파트너를 찾는 중…';
        document.querySelector('.roulette-stage').classList.add('spinning');
        let tick=0;
        const timer=setInterval(()=>{
          if(!$('rouletteName')){clearInterval(timer);return}
          $('rouletteName').textContent=choose(names);
          tick++;
          if(tick>=22){
            clearInterval(timer);
            document.querySelector('.roulette-stage').classList.remove('spinning');
            $('rouletteName').textContent=rival.starter;
            button.disabled=false;
            button.textContent='모험 시작하기 →';
            btn('spinRival',()=>{close();pop('<h2>라이벌 시온이 기다리고 있어!</h2><p>새벽마을 시작 지점에서 <b>오른쪽으로 두 칸</b> 떨어진 길에서 시온을 만날 수 있어.</p><p>시온 바로 옆 칸까지 다가가 <b>A 버튼</b>을 눌러 첫 승부를 시작해 봐.</p><button id="ok">출발하기</button>',()=>btn('ok',close))});
          }
        },85);
      });
    });
  };
  typeScreen();
}
function nearby(){return NPCS.find(n=>Math.abs(n.x-s.x)+Math.abs(n.y-s.y)<=1)}function interact(){if(mode!=='world'||dialogOpen)return;let n=nearby();if(n){if(n.type==='rival'){
  if(!s.rival||!s.rival.starter){toast('라이벌의 포켓몬 정보를 확인할 수 없어. 새로고침해 줘.');return}
  const round=RIVAL_SYSTEM.nextRound(s);
  if(!round){
    pop('<h2>라이벌 시온</h2><p>여기까지 네 번의 승부를 모두 치렀네. 이제 다음엔 더 큰 무대에서 만나자!</p><p class="muted">처음 선택한 '+s.rival.starter+'와 함께 계속 성장할 거야.</p><button id="ok">또 만나자</button>',()=>btn('ok',close));
    return
  }
  if(!RIVAL_SYSTEM.canChallenge(s)){
    pop('<h2>라이벌 시온</h2><p>지난 승부는 잊지 않았어. 배지를 '+round.badges+'개 모으면 '+round.title+'을 하자!</p><p class="muted">현재 배지 '+s.badges+'개 · 다음 상대 레벨 '+round.level+'</p><button id="ok">알겠어</button>',()=>btn('ok',close));
    return
  }
  let team;
  try{team=RIVAL_SYSTEM.teamForRound(s.rival,round,DB,EVOS)}
  catch(error){console.error('라이벌 팀 구성 실패',error);toast('라이벌 팀을 준비하지 못했어.');return}
  const lead=team[team.length-1];
  const message=round.badges===0
    ?'드디어 왔네! 네가 '+s.type+' 타입을 골랐으니, 난 유리한 '+s.rival.type+' 타입으로 도전하겠어!'
    :'배지를 '+s.badges+'개나 모았구나! 나도 '+s.rival.starter+'와 함께 성장했어. 다시 승부하자!';
  pop('<h2>라이벌 시온 · '+round.title+'</h2><p>'+message+'</p><p><b>'+lead+' Lv.'+round.level+'</b>를 포함한 '+team.length+'마리와 승부해!</p><p class="muted">승리하면 상금 '+round.prize+'원 · 다음 대결은 배지 획득 후 해금</p><button class="primary" id="challenge">시온과 대결!</button><button id="cancel">나중에</button>',()=>{
    btn('challenge',()=>beginBattle({...n,name:round.id,team,level:round.level,prize:round.prize}));
    btn('cancel',close);
  });
  return
}if(n.type==='intro'){pop('<h2>여명 연구소</h2><p>여명지방에 온 걸 환영해! 풀숲을 탐험하고 관장들에게 도전해 봐.</p><p>회복은 각 마을의 빨간 지붕 건물에서 가능해.</p><button id="ok">확인</button>',()=>btn('ok',close));return}if(s.defeated.includes(n.name)){toast(n.name+': 멋진 승부였어!');return}if(n.badge&&s.badges<n.badge-1){toast('이전 체육관 배지를 먼저 획득해!');return}if(n.champion&&s.badges<4){toast('배지 4개를 모아야 도전할 수 있어!');return}pop('<h2>'+n.name+'</h2><p>포켓몬 승부를 시작할까?</p><p class="muted">상대 레벨 '+n.level+' · '+n.team.length+'마리</p><button class="primary" id="challenge">승부!</button><button id="cancel">나중에</button>',()=>{btn('challenge',()=>beginBattle(n));btn('cancel',close)});return}let house=houseAt(s.x,s.y);if(house){s.party.forEach(p=>{p.hp=p.max;p.moves.forEach(m=>m.pp=m.maxpp)});save();pop('<h2>포켓몬 센터</h2><p>포켓몬들의 체력과 기술 PP가 모두 회복되었어!</p><button id="ok">고마워!</button>',()=>btn('ok',close));return}toast('주변을 살펴보았어.')}
function houseAt(x,y){return x<20?(x>=12&&x<=16&&y>=8&&y<=10):ZONES.some(z=>{let a=z.x0+8;return x>=a-2&&x<=a+3&&y>=5&&y<=10})}
function move(dx,dy){if(mode!=='world'||dialogOpen||!s.type||FIELD_ACTORS.isMoving())return;let nx=Math.max(1,Math.min(98,s.x+dx)),ny=Math.max(3,Math.min(20,s.y+dy));s.face=dx?dx>0?1:3:dy>0?2:0;if(NPCS.some(n=>n.x===nx&&n.y===ny))return;if(fieldHouse(nx,ny))return;if(nx===s.x&&ny===s.y)return;const previousX=s.x,previousY=s.y;s.x=nx;s.y=ny;s.followerTrail=[{x:previousX,y:previousY,face:s.face},...(s.followerTrail||[])].slice(0,6);s.lastMoveAt=Date.now();FIELD_ACTORS.move(s,{x:previousX,y:previousY});s.steps++;if(s.steps%10===0)save();if(isGrass(nx,ny)){s.grassSteps=(s.grassSteps||0)+1;if(s.grassSteps===3||Math.random()<.16)wild()}if(s.steps%45===0)save()}
function isGrass(x,y){return y>=10&&y<=19&&((x*7+y*11)%5<3)||y>=3&&y<=6&&x%13>=8}
function wild(){let z=zone(),name=choose(z.enc),l=s.wins===0?2:z.level+rand(3);let p=createMon(name,l);s.dex[p.name]=Math.max(s.dex[p.name]||0,1);beginBattle(null,p)}
function beginBattle(npc,mon){if(!s.party.some(p=>eligible(p)&&p.hp>0)){toast('출전 가능한 포켓몬이 없어! 센터에서 회복해.');close();return}fight={npc,enemies:npc?npc.team.map(n=>createMon(n,npc.type==='rival'?npc.level:npc.level+rand(3),npc.type==='rival'?false:Math.random()<1/2048)):[mon],index:0,active:s.party.findIndex(p=>eligible(p)&&p.hp>0),message:npc?npc.name+'이(가) 승부를 걸어왔다!':'야생 '+mon.name+' 등장!',busy:false};if(npc)fight.enemies.forEach(p=>s.dex[p.name]=Math.max(s.dex[p.name]||0,1));mode='battle';battleUI()}
function active(){return s.party[fight.active]}function foe(){return fight.enemies[fight.index]}function damage(a,b,m){let atk=lookup(a.name).atk,def=lookup(b.name).def;let base=Math.max(1,Math.floor(((2*a.level/5+2)*m.power*(atk/Math.max(1,def)))/50)+2);let mult=b.types.reduce((v,t)=>v*((MATCH[m.type]||{})[t]??1),1);let stab=a.types.includes(m.type)?1.5:1;return{value:Math.max(mult===0?0:1,Math.floor((base+2)*mult*stab*(.85+Math.random()*.15))),mult}}

function battleWait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function battleEffect(side,kind){
 const target=document.querySelector('.sv-pokemon.'+side);
 const status=document.querySelector('.sv-status.'+side);
 if(target){target.classList.remove('sv-hit','sv-strike','sv-faint');void target.offsetWidth;target.classList.add(kind==='hit'?'sv-hit':kind==='faint'?'sv-faint':'sv-strike')}
 if(status&&kind==='hit'){status.classList.remove('sv-status-hit');void status.offsetWidth;status.classList.add('sv-status-hit')}
}
function battleHP(side,from,to,max){
 const status=document.querySelector('.sv-status.'+side);
 if(!status)return;
 const bar=status.querySelector('.sv-hp-track i');
 const count=status.querySelector('.sv-hp-count');
 if(bar){bar.style.transition='none';bar.style.width=Math.max(0,100*from/max)+'%';void bar.offsetWidth;bar.style.transition='width 650ms cubic-bezier(.2,.8,.3,1)';bar.style.width=Math.max(0,100*to/max)+'%';bar.style.background=to/max<.25?'#ed685e':to/max<.5?'#efb95b':'#65d5a2'}
 if(count){let start=Date.now();const update=()=>{if(!document.contains(count))return;let t=Math.min(1,(Date.now()-start)/650);count.textContent=Math.round(from+(to-from)*t)+' / '+max;if(t<1)requestAnimationFrame(update)};requestAnimationFrame(update)}
}
async function battleEXP(p,oldXP,oldLevel,amount){
 const status=document.querySelector('.sv-status.player');
 if(!status)return;
 const track=status.querySelector('.sv-exp-track i');
 const levelLabel=status.querySelector('.sv-name span');
 const message=p.name+'은(는) 경험치 '+amount+'를 얻었다!';
 battleMessage(message);
 const startNeed=oldLevel*oldLevel*2;
 let remaining=amount,currentXP=oldXP,level=oldLevel;
 while(remaining>0&&level<70){
   const need=level*level*2;
   const portion=Math.min(remaining,need-currentXP);
   const from=100*currentXP/need,to=100*(currentXP+portion)/need;
   if(track){
     track.style.transition='none';track.style.width=from+'%';
     void track.offsetWidth;
     track.style.transition='width 850ms cubic-bezier(.22,.65,.25,1)';
     track.style.width=to+'%';
   }
   await battleWait(900);
   if(!fight)return;
   remaining-=portion;currentXP+=portion;
   if(currentXP>=need&&level<70){
     level++;currentXP=0;
     battleMessage(p.name+'의 레벨이 '+level+'이(가) 되었다!');
     if(levelLabel)levelLabel.textContent='Lv. '+level;
     if(status){status.classList.add('sv-level-up');setTimeout(()=>status.classList.remove('sv-level-up'),750)}
     if(track){track.style.transition='none';track.style.width='0%'}
     await battleWait(850);
     if(!fight)return;
   }
 }
 if(track){track.style.transition='width 350ms ease';track.style.width=Math.max(0,Math.min(100,100*(p.xp||0)/expNeed(p)))+'%'}
 await battleWait(250);
}
function battleMessage(message){if(!fight)return;fight.message=message;const el=document.querySelector('.sv-narration p');if(el)el.textContent=message}
async function enemyTurn(){
 if(!fight||fight.busy)return;
 fight.busy=true;
 await enemyAction();
 if(fight)fight.busy=false;
}
async function enemyAction(){
 if(!fight)return;
 const p=active(),e=foe();if(!e||!p)return;
 const m=choose(e.moves),d=damage(e,p,m),old=p.hp;
 battleMessage(e.name+'의 '+m.name+'!');
 battleEffect('enemy','strike');
 await battleWait(380);
 if(!fight)return;
 battleEffect('player','hit');
 p.hp=Math.max(0,p.hp-d.value);
 battleHP('player',old,p.hp,p.max);
 await battleWait(760);
 if(!fight)return;
 battleMessage(p.name+'에게 '+d.value+' 데미지!');
 await battleWait(450);
 if(!fight)return;
 if(!p.hp){
   battleEffect('player','faint');
   await battleWait(600);
   if(!fight)return;
   const idx=s.party.findIndex(q=>eligible(q)&&q.hp>0);
   if(idx<0){lose();return}
   fight.active=idx;
   fight.message=p.name+'이(가) 쓰러졌다! '+active().name+' 출전!';
 }
 save();if(fight){fight.busy=false;battleUI()}
}
async function attack(i){
 if(!fight||fight.busy)return;
 const p=active(),e=foe(),m=p.moves[i];
 if(!m||m.pp<=0)return toast('PP가 부족해!');
 fight.busy=true;m.pp--;
 const d=damage(p,e,m),old=e.hp;
 battleMessage(p.name+'의 '+m.name+'!');
 battleEffect('player','strike');
 await battleWait(350);
 if(!fight)return;
 battleEffect('enemy','hit');
 e.hp=Math.max(0,e.hp-d.value);
 battleHP('enemy',old,e.hp,e.max);
 await battleWait(760);
 if(!fight)return;
 battleMessage(e.name+'에게 '+d.value+' 데미지!'+(d.mult>1?' 효과가 굉장했다!':d.mult<1?' 효과가 별로였다.':''));
 await battleWait(550);
 if(!fight)return;
 if(e.hp===0){
   battleEffect('enemy','faint');
   await battleWait(650);
   if(!fight)return;
   const xpAmount=e.level*e.level*2;
   const beforeXP=p.xp||0,beforeLevel=p.level;
   const msgs=gain(p,xpAmount);
   await battleEXP(p,beforeXP,beforeLevel,xpAmount);
   if(!fight)return;
   fight.index++;s.wins++;
   if(fight.index>=fight.enemies.length){win(msgs);return}
   fight.message=foe().name+'이(가) 나왔다! '+msgs.join(' ');
   fight.busy=false;save();battleUI();return;
 }
 await enemyAction();
 if(fight)fight.busy=false;
}
function win(msgs){
 if(!fight)return;
 const npc=fight.npc;
 if(npc){
   if(npc.campaignBattleId && typeof CAMPAIGN_CORE!=='undefined'){
     const result=CAMPAIGN_CORE.completeBattle(s,npc.campaignBattleId);
     if(result.ok){
       s.defeated.push(npc.name+' · '+npc.campaignBattleId);
       s.money+=npc.prize||0;
     }else{
       console.warn('캠페인 전투 결과 반영 실패:',result.reason);
     }
   }else{
     s.defeated.push(npc.name);s.money+=npc.prize;
     if(npc.badge)s.badges=Math.max(s.badges,npc.badge);
     if(npc.champion)s.champion=true;
   }
 }
 save();
 const title=npc?'트레이너 배틀 승리!':'승리!';
 const details=[...(msgs||[]),...(npc?['상금 '+npc.prize+'원 획득!']:[])];
 battleMessage(title+' '+(details.join(' · ')||'경험치를 획득했어!'));
 const menu=document.querySelector('.sv-menu');
 if(menu)menu.innerHTML='<div class="sv-victory"><div class="sv-victory-mark">✦ WIN ✦</div><strong>'+title+'</strong><span>'+details.join('<br>')+'</span><button id="battleContinue">모험 계속하기 →</button></div>';
 const done=()=>{
   if(mode==='world'&&!dialogOpen)return;
   mode='world';fight=null;dialogOpen=false;
   const overlay=$('overlay');
   overlay.style.setProperty('display','none','important');
   $('dialogBody').replaceChildren();
   overlay.classList.remove('battle-mode');
   $('dialog').classList.remove('battle-mode');
   overlay.classList.add('hidden');
   requestAnimationFrame(()=>{overlay.style.removeProperty('display')});
 };
 const continueButton=menu&&menu.querySelector('#battleContinue');
 if(continueButton){
   continueButton.addEventListener('click',done);
   continueButton.addEventListener('pointerup',done);
 }
 btn('battleContinue',done);
 setTimeout(()=>{if(mode==='battle'&&fight&&fight.index>=fight.enemies.length)done()},4000);
}
function lose(){if(fight?.npc?.campaignBattleId&&typeof CAMPAIGN_CORE!=='undefined'&&CAMPAIGN_CORE.DATA.LEAGUE.some(x=>x.id===fight.npc.campaignBattleId))CAMPAIGN_CORE.defeat(s);s.party.forEach(p=>{p.hp=p.max;p.moves.forEach(m=>m.pp=m.maxpp)});s.x=8;s.y=12;s.money=Math.max(0,s.money-500);save();mode='world';fight=null;pop('<h2>눈앞이 캄캄해졌다!</h2><p>새벽마을 포켓몬 센터로 돌아왔어. 모두 회복했어.</p><button id="done">계속하기</button>',()=>btn('done',close))}
function capture(kind){if(fight.npc)return toast('트레이너 포켓몬은 잡을 수 없어!');if(s[kind]<=0)return toast('볼이 부족해!');s[kind]--;let e=foe(),chance=Math.min(.93,(kind==='great'?.35:.2)+(.8*(1-e.hp/e.max))+(e.shiny?.02:0));if(Math.random()<chance){let p=e;if(s.party.length<6)s.party.push(p);else s.box.push(p);s.dex[p.name]=2;mode='world';fight=null;save();pop('<h1>포획 성공!</h1><h2>'+(p.shiny?'✨ ':'')+p.name+'</h2><p>'+tag(p)+'</p><p>'+(eligible(p)?'타입 챌린지에 출전할 수 있어!':'선택 타입이 아니므로 수집 전용이야.')+'</p><p>'+(s.party.includes(p)?'파티에 합류했어.':'박스로 전송했어.')+'</p><button class="primary" id="done">계속하기</button>',()=>btn('done',close));return}fight.message='앗! '+e.name+'이(가) 볼에서 빠져나왔다!';enemyTurn()}
function swap(i){if(!eligible(s.party[i])||s.party[i].hp<=0)return toast('출전할 수 없는 포켓몬이야');fight.active=i;fight.message=s.party[i].name+' 출전!';enemyTurn()}
const BATTLE_STYLE_TEXT="\n.sv-exp-track{height:7px!important;border:1px solid #5e8ba3!important;box-shadow:inset 0 1px 3px #152d3c}.sv-exp-track i{background:linear-gradient(90deg,#3d8bde,#70c7ff,#b7f0ff)!important;box-shadow:0 0 7px #55c7ff88}.sv-level-up{animation:svLevelUp .7s ease}@keyframes svLevelUp{0%,100%{filter:brightness(1)}35%,65%{filter:brightness(1.8) drop-shadow(0 0 8px #ffe18b)}}\n"+"\n.sv-exp{display:flex;align-items:center;gap:7px;margin-top:5px}.sv-exp>span{font-size:9px;font-weight:900;color:#9ac8e8;letter-spacing:1px}.sv-exp-track{flex:1;height:5px;background:#344b57;border-radius:8px;overflow:hidden}.sv-exp-track i{display:block;height:100%;background:linear-gradient(90deg,#5bafe5,#9be8ff);border-radius:8px;transition:width .65s}\n"+"\n/* Battle action animation */\n#dialog.battle-mode .sv-pokemon.sv-hit{animation:sv-hit .55s ease-in-out!important}\n#dialog.battle-mode .sv-pokemon.sv-strike{animation:sv-strike .42s ease-out!important}\n#dialog.battle-mode .sv-pokemon.sv-faint{animation:sv-faint .65s ease-in forwards!important}\n#dialog.battle-mode .sv-status.sv-status-hit{animation:sv-status-hit .45s ease-out!important}\n@keyframes sv-hit{0%,100%{opacity:1;filter:brightness(1) drop-shadow(9px 18px 9px #143d4277)}18%,52%{opacity:.25;filter:brightness(3) drop-shadow(0 0 20px #fff)}32%,67%{opacity:1;translate:12px 0}44%{translate:-12px 0}}\n@keyframes sv-strike{0%{translate:0 0}40%{translate:25px -12px}75%{translate:-5px 4px}100%{translate:0 0}}\n@keyframes sv-faint{0%{opacity:1;translate:0 0}100%{opacity:0;translate:0 90px;scale:.7}}\n@keyframes sv-status-hit{0%,100%{filter:none}40%{filter:brightness(1.7)}}\n.sv-victory{height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;text-align:center;padding:5px;overflow:auto}\n.sv-victory-mark{color:#d4a354;font-weight:900;letter-spacing:2px;font-size:13px}\n.sv-victory strong{font-size:clamp(16px,2.2vw,25px)}\n.sv-victory span{font-size:12px;color:#5b7773}\n#dialog .sv-victory button{display:block!important;background:#254d52!important;color:#fff!important;border:0!important;border-radius:10px!important;padding:10px 14px!important;font-weight:900!important;margin:3px 0!important}\n"+"/* Scarlet/Violet inspired self-contained battle UI */\n#overlay:has(.sv-battle){position:fixed!important;inset:0!important;display:flex!important;padding:0!important;align-items:stretch!important;justify-content:stretch!important;background:#101d25!important;overflow:hidden!important}\n#dialog:has(.sv-battle){display:block!important;position:relative!important;flex:1 1 auto!important;inset:auto!important;margin:0!important;padding:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;border:0!important;border-radius:0!important;overflow:hidden!important;box-shadow:none!important;background:#152a32!important}\n#dialog:has(.sv-battle)>#close{display:none!important}\n.sv-battle{position:relative;display:grid;grid-template-rows:minmax(0,1fr) clamp(150px,31dvh,250px);width:100%;height:100%;overflow:hidden;color:#f7f9f3;font-family:system-ui,-apple-system,sans-serif}\n.sv-arena{position:relative;min-width:0;min-height:0;overflow:hidden;background:linear-gradient(180deg,#a9d9e7 0%,#e4e9d6 53%,#96b788 54%,#5c9571 100%)}\n.sv-sky{position:absolute;inset:0 0 44%;background:radial-gradient(ellipse at 65% 30%,#fff8 0%,transparent 38%),linear-gradient(180deg,#87b8d4,#d6e4d3)}\n.sv-distant{position:absolute;top:42%;left:-5%;width:110%;height:24%;background:#5e9a85;clip-path:polygon(0 72%,10% 42%,19% 64%,34% 25%,45% 60%,61% 34%,73% 60%,89% 15%,100% 57%,100% 100%,0 100%);opacity:.7}\n.sv-ground{position:absolute;inset:58% 0 0;background:repeating-linear-gradient(165deg,#6a9d77 0 28px,#689a72 28px 33px,#72a47b 33px 65px)}\n.sv-shadow{position:absolute;background:#2b625e66;border-radius:50%;filter:blur(5px)}\n.sv-shadow.enemy{width:31%;height:12%;left:58%;top:63%}\n.sv-shadow.player{width:35%;height:15%;left:6%;bottom:7%}\n.sv-pokemon{position:absolute;display:block;object-fit:contain;filter:drop-shadow(0 10px 7px #183b3655);image-rendering:auto;pointer-events:none;user-select:none;z-index:2;animation:sv-enter .35s ease-out}\n.sv-pokemon.enemy{height:58%;width:32%;top:16%;left:58%}\n.sv-pokemon.player{height:70%;width:37%;left:5%;bottom:0%;transform:scaleX(-1)}\n.sv-status{position:absolute;z-index:4;min-width:0;width:clamp(165px,27%,350px);background:#14252edc;border:1px solid #ffffff55;border-radius:16px;padding:11px 15px;box-shadow:0 7px 25px #0b292755;backdrop-filter:blur(8px)}\n.sv-status.enemy{left:3%;top:8%}\n.sv-status.player{right:3%;bottom:8%}\n.sv-name{display:flex;align-items:center;justify-content:space-between;gap:7px;font-size:clamp(13px,1.8vw,20px)}\n.sv-name strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.sv-name span{white-space:nowrap;font-size:.76em;font-weight:700;color:#dbe9e7}\n.sv-hp{display:flex;align-items:center;gap:8px;margin-top:8px}\n.sv-hp-label{font-size:11px;font-weight:900;color:#b5e2c7}\n.sv-hp-track{flex:1;height:9px;border-radius:9px;background:#253c41;overflow:hidden;border:1px solid #ffffff44}\n.sv-hp-track i{display:block;height:100%;border-radius:9px;transition:width .25s}\n.sv-hp-count{text-align:right;font-size:12px;font-weight:700;margin-top:4px;color:#e3ece5}\n.sv-scene-label{position:absolute;left:3%;bottom:4%;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ffffffa9;font-weight:800}\n.sv-controls{display:grid;grid-template-columns:minmax(0,43fr) minmax(0,57fr);grid-template-rows:minmax(0,1fr);min-width:0;min-height:0;overflow:hidden;background:#152c36;border-top:3px solid #ffffff35}\n.sv-narration{display:flex;flex-direction:column;justify-content:center;min-width:0;min-height:0;padding:clamp(12px,2vw,28px);overflow:auto;background:linear-gradient(145deg,#1d3946,#142a35)}\n.sv-narration-label{font-size:10px;letter-spacing:2px;color:#84c9b8;font-weight:900}\n#dialog .sv-narration p{font-size:clamp(14px,2vw,23px);line-height:1.5;font-weight:800;color:#fff;margin:10px 0!important;overflow-wrap:anywhere}\n.sv-menu{display:flex;flex-direction:column;min-width:0;min-height:0;padding:10px 12px;background:#e9eee8;color:#213a3e}\n.sv-menu-title{flex:none;font-size:clamp(12px,1.4vw,16px);font-weight:900;padding:0 3px 7px}\n.sv-command-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:7px;flex:1;min-height:0;overflow:auto}\n#dialog .sv-command{display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;min-width:0!important;min-height:0!important;width:100%!important;height:100%!important;margin:0!important;padding:5px clamp(7px,1.4vw,17px)!important;border:2px solid #d5ded7!important;border-radius:12px!important;background:#fff!important;color:#263d42!important;box-shadow:0 2px 0 #bac9c1!important;text-align:left!important;font-size:clamp(12px,1.7vw,20px)!important;font-weight:900!important;touch-action:manipulation!important}\n#dialog .sv-command:first-child{border-color:#e4a77f!important;background:#fff8f1!important}\n#dialog .sv-command:active{background:#cde5d9!important;transform:translateY(1px)}\n#dialog .sv-command:disabled{opacity:.45!important}\n#dialog .sv-command b{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#dialog .sv-command small{display:block;font-size:clamp(9px,1vw,12px);font-weight:700;color:#82918c;margin-top:2px}\n.sv-missing{position:absolute;left:50%;top:40%;font-size:22px;color:#fff}\n@keyframes sv-enter{from{opacity:0;translate:0 -12px}to{opacity:1;translate:0 0}}\n@media(orientation:portrait){\n.sv-battle{grid-template-rows:minmax(0,1fr) clamp(190px,30dvh,350px)}\n.sv-controls{grid-template-columns:minmax(0,39fr) minmax(0,61fr)}\n.sv-narration{padding:9px}\n#dialog .sv-narration p{font-size:clamp(13px,3vw,19px)}\n.sv-menu{padding:7px}\n.sv-menu-title{font-size:12px;padding-bottom:5px}\n.sv-command-grid{gap:5px}\n#dialog .sv-command{font-size:clamp(11px,3vw,17px)!important;padding:4px 7px!important}\n.sv-pokemon.enemy{width:48%;height:43%;top:26%;left:49%}\n.sv-pokemon.player{width:55%;height:46%;left:-6%;bottom:7%}\n.sv-status{padding:8px 10px;width:48%}\n.sv-status.enemy{left:3%;top:8%}\n.sv-status.player{right:3%;bottom:7%}\n.sv-name{font-size:clamp(12px,3vw,17px)}\n.sv-hp{margin-top:5px}\n.sv-scene-label{font-size:9px}\n}\n@media(max-height:480px) and (orientation:landscape){\n.sv-battle{grid-template-rows:minmax(0,1fr) clamp(115px,35dvh,160px)}\n.sv-status{padding:6px 11px}\n.sv-name{font-size:13px}\n.sv-hp{margin-top:3px}\n.sv-hp-track{height:7px}\n.sv-menu{padding:5px 8px}\n.sv-menu-title{padding-bottom:3px;font-size:11px}\n.sv-command-grid{gap:4px}\n#dialog .sv-command{font-size:13px!important}\n#dialog .sv-narration p{font-size:14px}\n}\n\n/* Perspective battlefield and responsive hard reset */\n#overlay.battle-mode{display:flex!important;position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important;padding:0!important;align-items:stretch!important;justify-content:stretch!important;background:#122a34!important}\n#dialog.battle-mode{position:relative!important;display:block!important;flex:1 1 100%!important;width:100vw!important;height:100dvh!important;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:hidden!important;background:#152a32!important}\n#dialog.battle-mode #close{display:none!important}\n#dialog.battle-mode #dialogBody{display:block!important;width:100%!important;height:100%!important;min-height:0!important;overflow:hidden!important}\n#dialog.battle-mode .sv-battle{height:100%!important;width:100%!important;display:grid!important;grid-template-rows:minmax(0,1fr) clamp(165px,32dvh,270px)!important;overflow:hidden!important}\n#dialog.battle-mode .sv-arena{height:100%!important;min-height:0!important;perspective:700px!important}\n#dialog.battle-mode .sv-controls{height:100%!important;min-height:0!important;grid-template-columns:minmax(0,43fr) minmax(0,57fr)!important}\n#dialog.battle-mode .sv-menu{min-height:0!important;overflow:hidden!important}\n#dialog.battle-mode .sv-command-grid{min-height:0!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:minmax(0,1fr)!important}\n#dialog.battle-mode .sv-pokemon{filter:drop-shadow(9px 18px 9px #143d4277) drop-shadow(-5px -3px 3px #ffffff88)!important;transform-style:preserve-3d}\n#dialog.battle-mode .sv-pokemon.enemy{transform:rotateY(-13deg) rotateZ(-2deg)!important}\n#dialog.battle-mode .sv-pokemon.player{transform:scaleX(-1) rotateY(16deg) rotateZ(-2deg)!important}\n#dialog.battle-mode .sv-ground{transform-origin:center top;transform:rotateX(20deg) scale(1.18);background:repeating-linear-gradient(167deg,#669e77 0 22px,#6ba47d 22px 27px,#7bb18b 27px 60px)}\n#dialog.battle-mode .sv-shadow{filter:blur(11px)!important;background:#214a456b!important}\n@media(orientation:portrait){\n#dialog.battle-mode .sv-battle{grid-template-rows:minmax(0,1fr) clamp(200px,31dvh,360px)!important}\n#dialog.battle-mode .sv-controls{grid-template-columns:minmax(0,38fr) minmax(0,62fr)!important}\n#dialog.battle-mode .sv-narration{padding:10px!important}\n#dialog.battle-mode .sv-menu{padding:6px!important}\n#dialog.battle-mode .sv-menu-title{font-size:12px!important;padding-bottom:5px!important}\n#dialog.battle-mode .sv-command-grid{gap:5px!important}\n#dialog.battle-mode .sv-command{font-size:clamp(11px,3vw,17px)!important;padding:3px 6px!important}\n#dialog.battle-mode .sv-pokemon.enemy{width:49%!important;height:40%!important;top:28%!important;left:50%!important}\n#dialog.battle-mode .sv-pokemon.player{width:56%!important;height:44%!important;left:-7%!important;bottom:10%!important}\n#dialog.battle-mode .sv-status{width:46%!important;min-width:0!important;padding:7px 9px!important}\n}\n";
function ensureBattleStyle(){if(document.getElementById('battle-inline-style'))return;const node=document.createElement('style');node.id='battle-inline-style';node.textContent=BATTLE_STYLE_TEXT;document.head.appendChild(node)}
const POKEMON_DEX={"치코리타":152,"브케인":155,"리아코":158,"이상해씨":1,"파이리":4,"꼬부기":7,"구구":16,"꼬렛":19,"캐터피":10,"뿔충이":13,"모다피":69,"주뱃":41,"꼬마돌":74,"메리프":179,"우파":194,"델빌":228,"이브이":133,"고오스":92,"피카츄":25,"식스테일":37,"가디":58,"미뇽":147,"무우마":200,"코일":81,"롱스톤":95,"애버라스":246,"네이티":177,"니로우":198,"피콘":204,"마릴":183,"통통코":187,"초라기":170,"고라파덕":54,"알통몬":66,"모래두지":27,"쥬쥬":86,"루주라":124,"꾸꾸리":220,"포푸니":215,"단단지":213,"에이팜":190,"에브이":196,"블래키":197,"부스터":136,"샤미드":134,"쥬피썬더":135,"해너츠":192,"핫삼":212,"강철톤":208,"마그마그":218,"꼬지모":185,"헤라크로스":214,"토게피":175,"무장조":227,"코코리":231,"팬텀":94,"전룡":181,"마그케인":156,"베이리프":153,"엘리게이":159,"마그마라시":157,"피죤":17,"단데기":11,"딱충이":14,"보송송":180,"고우스트":93,"쏘콘":205,"마그카르고":219,"데기라스":247,"우츠동":70,"골뱃":42,"데구리":75,"근육몬":67,"레어코일":82,"마릴리":184,"두코":188,"랜턴":171,"골덕":55,"고지":28,"나인테일":38,"윈디":59,"리자드":5,"어니부기":8,"이상해풀":2};
function battleUI(page='main'){
 if(!fight||fight.busy)return;
 ensureBattleStyle();
 $('overlay').classList.add('battle-mode');
 $('dialog').classList.add('battle-mode');
 const p=active(),e=foe();
 const hp=m=>Math.max(0,Math.round(m.hp/m.max*100));
 const color=m=>hp(m)<25?'#ed685e':hp(m)<50?'#efb95b':'#65d5a2';
 const art=(m,side)=>{
   const id=POKEMON_DEX[m.name];
   if(!id)return '<div class="sv-missing">'+m.name+'</div>';
   const variant=m.shiny?'shiny/':'';
   const url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'+variant+id+'.png';
   return '<img class="sv-pokemon '+side+'" src="'+url+'" alt="'+m.name+'" draggable="false" loading="eager">';
 };
 const stat=(m,side)=>'<div class="sv-status '+side+'"><div class="sv-name"><strong>'+(m.shiny?'✦ ':'')+m.name+'</strong><span>Lv. '+m.level+'</span></div><div class="sv-hp"><span class="sv-hp-label">HP</span><div class="sv-hp-track"><i style="width:'+hp(m)+'%;background:'+color(m)+'"></i></div></div>'+(side==='player'?'<div class="sv-hp-count">'+m.hp+' / '+m.max+'</div><div class="sv-exp"><span>EXP</span><div class="sv-exp-track"><i style="width:'+Math.max(0,Math.min(100,100*(m.xp||0)/expNeed(m)))+'%"></i></div></div>':'')+'</div>';
 const item=(id,label,desc,disabled='')=>'<button class="sv-command" '+(id.startsWith('data-')?id:'id="'+id+'"')+' '+disabled+'><b>'+label+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</button>';
 let options='';
 if(page==='main')options=item('fightAttack','싸운다','FIGHT')+item('fightBag','가방','BAG')+item('fightParty','포켓몬','POKÉMON')+item('fightRun','도망간다','RUN');
 if(page==='attack')options=p.moves.map((m,i)=>item('data-move="'+i+'"',m.name,m.type+' · PP '+m.pp+'/'+m.maxpp,m.pp<=0?'disabled':'')).join('')+item('fightBack','← 돌아가기','BACK');
 if(page==='bag')options=item('ball','몬스터볼','× '+s.balls)+item('great','슈퍼볼','× '+s.great)+item('potion','상처약','× '+s.potions)+item('fightBack','← 돌아가기','BACK');
 if(page==='party')options=s.party.map((q,i)=>item('data-swap="'+i+'"',q.name+' Lv.'+q.level,'HP '+q.hp+'/'+q.max+(eligible(q)?'':' · 수집 전용'),!eligible(q)||!q.hp?'disabled':'')).join('')+item('fightBack','← 돌아가기','BACK');
 const heading=page==='main'?'무엇을 할까?':page==='attack'?'기술을 선택해 줘':page==='bag'?'어떤 도구를 사용할까?':'교체할 포켓몬을 골라줘';
 pop('<div class="sv-battle"><div class="sv-arena"><div class="sv-sky"></div><div class="sv-distant"></div><div class="sv-ground"></div><div class="sv-shadow enemy"></div><div class="sv-shadow player"></div>'+art(e,'enemy')+art(p,'player')+stat(e,'enemy')+stat(p,'player')+'<div class="sv-scene-label">'+(fight.npc?fight.npc.name:'야생 포켓몬과의 배틀')+'</div></div><div class="sv-controls"><div class="sv-narration"><span class="sv-narration-label">BATTLE</span><p>'+fight.message+'</p></div><div class="sv-menu"><div class="sv-menu-title">'+heading+'</div><div class="sv-command-grid">'+options+'</div></div></div></div>',()=>{
 btn('fightAttack',()=>battleUI('attack'));btn('fightBag',()=>battleUI('bag'));btn('fightParty',()=>battleUI('party'));btn('fightBack',()=>battleUI());
 btn('fightRun',()=>{if(fight.npc)return toast('트레이너 승부에서는 도망갈 수 없어!');if(Math.random()<.8){fight=null;mode='world';$('overlay').classList.remove('battle-mode');$('dialog').classList.remove('battle-mode');close();toast('무사히 도망쳤다!')}else{fight.message='도망에 실패했다!';enemyTurn()}});
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>attack(+b.dataset.move));
 document.querySelectorAll('[data-swap]').forEach(b=>b.onclick=()=>swap(+b.dataset.swap));
 btn('ball',()=>capture('balls'));btn('great',()=>capture('great'));
 btn('potion',()=>{if(!s.potions)return toast('상처약이 없어!');if(p.hp===p.max)return toast('HP가 가득해!');s.potions--;p.hp=Math.min(p.max,p.hp+20);fight.message=p.name+'의 HP가 20 회복되었다!';enemyTurn()});
 });
}
function resizeField(){
 const bounds=$('stage').getBoundingClientRect();
 const scale=2;
 canvas.width=Math.ceil(bounds.width/scale);
 canvas.height=Math.ceil((bounds.height-(bounds.height>bounds.width?110:0))/scale);
 canvas.style.setProperty('width',canvas.width*scale+'px','important');
 canvas.style.setProperty('height',canvas.height*scale+'px','important');
 ctx.imageSmoothingEnabled=false;
}
window.addEventListener('resize',resizeField);resizeField();
const FIELD_HOUSES=[
 {x:2,y:5,kind:'home'}, {x:12,y:5,kind:'lab'},
 {x:2,y:15,kind:'home2'}, {x:13,y:15,kind:'shop'}
];
function fieldHouse(x,y){
 if(x>=20)return ZONES.some(z=>x>=z.x0+6&&x<=z.x0+11&&y>=5&&y<=9);
 return FIELD_HOUSES.some(h=>x>=h.x&&x<=h.x+3&&y>=h.y&&y<=h.y+2);
}
FIELD_ACTORS.reset(s,(x,y)=>x>=1&&x<=98&&y>=3&&y<=20&&!fieldHouse(x,y)&&!NPCS.some(n=>n.x===x&&n.y===y));
function draw(){
 WORLD_V2.draw(ctx,canvas,s,NPCS,isGrass);
 // World-relative marker: the rival remains identifiable without replacing its field sprite.
 const rival=NPCS.find(n=>n.type==='rival');
 if(!rival||!s.type)return;
 const tile=FIELD_MANIFEST.tileSize||24;
 const pose=FIELD_ACTORS.sample(s).player;
 const x=Math.round((rival.x-pose.x)*tile+canvas.width/2);
 const y=Math.round((rival.y-pose.y)*tile+canvas.height/2);
 if(x<-40||x>canvas.width+40||y<-30||y>canvas.height+30)return;
 const label='라이벌 시온';
 ctx.save();
 ctx.font='bold 10px sans-serif';
 ctx.textBaseline='middle';
 const width=Math.ceil(ctx.measureText(label).width)+12;
 const px=Math.round(x-width/2),py=y-39;
 ctx.fillStyle='rgba(17,38,45,.95)';
 ctx.fillRect(px,py,width,17);
 ctx.fillStyle='#fff0ac';
 ctx.fillText(label,px+6,py+8);
 ctx.fillRect(x-2,py+17,4,3);
 ctx.restore();
}

let lastFrame=0;function frame(t){if(t-lastFrame>33){draw();lastFrame=t}requestAnimationFrame(frame)}requestAnimationFrame(frame);
function updateHud(){$('area').textContent=zone().name;$('hudInfo').textContent='배지 '+s.badges+'/4 · '+(s.type||'모험 준비')+(s.type&&s.x<20&&typeof RIVAL_SYSTEM!=='undefined'&&RIVAL_SYSTEM.canChallenge(s)?' · 시온과 대결 가능':'')}updateHud();setInterval(()=>{if(mode==='world'&&s.type)s.playSeconds+=5;updateHud();if(s.playSeconds%30===0)save()},5000);
let hold=null;document.querySelectorAll('[data-dir]').forEach(b=>{const step=()=>{let [dx,dy]=b.dataset.dir.split(',').map(Number);move(dx,dy)};b.addEventListener('pointerdown',e=>{e.preventDefault();step();clearInterval(hold);hold=setInterval(step,145)});for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>{clearInterval(hold);hold=null})});$('keyA').onclick=()=>{if(!dialogOpen)interact()};$('keyB').onclick=()=>{if(mode==='world')close()};$('keyMenu').onclick=menu;document.addEventListener('keydown',e=>{let dirs={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};if(dirs[e.key]){e.preventDefault();move(...dirs[e.key])}if(e.key==='Escape'&&mode==='world')close();if(e.key==='Enter'&&!dialogOpen)interact();if(e.key==='m')menu()});document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});window.addEventListener('beforeunload',save);// Existing save files have no rival field; create and save one without resetting progress.
if(s.type&&s.party.length&&!s.rival&&typeof RIVAL_SYSTEM!=='undefined'){
  try{
    s.rival=RIVAL_SYSTEM.pick({
      playerType:s.type,playerStarter:s.party[0].name,types:TYPES,
      dex:DB,evolutions:EVOS,match:MATCH
    });
    save();
  }catch(error){console.warn('라이벌 저장 데이터 이전 실패:',error)}
}
if(s.rival&&typeof RIVAL_SYSTEM!=='undefined'){
  try{
    const prepared=RIVAL_SYSTEM.fullRoster(s.rival,DB,EVOS);
    if(JSON.stringify(prepared.support)!==JSON.stringify(s.rival.support)||JSON.stringify(prepared.reserve)!==JSON.stringify(s.rival.reserve)){
      s.rival=prepared;
      save();
    }
  }catch(error){console.warn('라이벌 지원 포켓몬 데이터 생성 실패:',error)}
}
// New eight-gym campaign state has its own flags and badge wins.
if(typeof CAMPAIGN_CORE!=='undefined'){
  try{
    const before=JSON.stringify(s.campaign??null);
    CAMPAIGN_CORE.ensure(s);
    if(before!==JSON.stringify(s.campaign))save();
  }catch(error){console.error('스토리 진행 데이터 초기화 실패:',error)}
}
if(!s.type)start();else toast('모험이 이어집니다!');
