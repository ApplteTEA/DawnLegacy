'use strict';
/**
 * DawnLegacy campaign bridge — temporary, accessible location/journal interface.
 * This does not claim that the 34 planned pixel-art field maps already exist.
 * The original field, controls and NPC renderer stay intact while Work upgrades them.
 */
const CAMPAIGN_UI = (() => {
  const CORE = typeof CAMPAIGN_CORE !== 'undefined' ? CAMPAIGN_CORE : (typeof require==='function'?require('./campaign-core.js'):null);
  const DATA = typeof CAMPAIGN_DATA !== 'undefined' ? CAMPAIGN_DATA : (typeof require==='function'?require('./campaign-data.js'):null);
  if (!CORE || !DATA) throw new Error('Load campaign-data/core before campaign-ui');
  const WILD = Object.freeze({
    R01:['구구','꼬렛','캐터피','뿔충이','메리프'],
    D01:['모다피','주뱃','통통코','피콘','고오스'],
    R02:['마릴','네이티','메리프','우파','이브이'],
    R03:['초라기','고라파덕','우파','코일','식스테일'],
    R04:['꼬마돌','모래두지','롱스톤','니로우','애버라스'],
    D04:['고오스','무우마','주뱃','네이티'],
    R05:['델빌','마그마그','가디','식스테일','헤라크로스'],
    R06:['꾸꾸리','포푸니','루주라','무장조'],
    R07:['코일','무장조','피콘','롱스톤'],
    R08:['네이티','무장조','미뇽','니로우'],
    D08:['미뇽','무장조','네이티','포푸니'],
    R09:['헤라크로스','무장조','포푸니','미뇽']
  });
  const safe = value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gid=(group,id)=>group+'_'+id.replace(/[^a-zA-Z0-9_]/g,'_');
  function open(api) {
    const {getState,saveGame,pop,btn,back,toast,startBattle,createMon,dex,evolutions}=api;
    const state=getState();
    if(!state.type || !state.party?.length){
      pop('<h2>모험을 시작해 줘</h2><p>첫 포켓몬을 받은 뒤 아우라 지방의 지도를 사용할 수 있어.</p><button id="campaignBack">돌아가기</button>',()=>btn('campaignBack',back));
      return;
    }
    CORE.ensure(state);
    saveGame();
    const next=()=>CORE.nextObjective(state);
    const render=()=>{
      const c=CORE.ensure(state),map=DATA.MAPS[c.mapId],objective=next();
      const events=CORE.availableEvents(state);
      const gym=DATA.GYMS.find(x=>x.mapId===c.mapId);
      const gymOK=gym ? CORE.canFightGym(state,gym.id) : null;
      const bossEvent=DATA.STORY.find(x=>x.mapId===c.mapId&&x.battleId&&!c.flags[x.id]);
      const bossOK=bossEvent && bossEvent.require.every(x=>CORE.flag(state,x));
      const rival=DATA.RIVALS?.find(x=>x.mapId===c.mapId&&!c.rivalWins[x.id])||null;
      const rivalOK=rival?CORE.canFightRival(state,rival.id):null;
      const postgames=DATA.POSTGAME.filter(x=>x.mapId===c.mapId && CORE.canStartPostgame(state,x.id).ok);
      const league=map.id==='L01' ? DATA.LEAGUE.find(x=>CORE.canFightLeague(state,x.id).ok) : null;
      const encountered=Array.isArray(WILD[map.id]) ? WILD[map.id].filter(x=>dex.some(mon=>mon.name===x)) : [];
      const neighbors=map.neighbors.map(id=>{
        const m=DATA.MAPS[id],allowed=CORE.canEnter(state,id);
        return '<div class="panel"><b>'+safe(m.name)+'</b><p class="muted">'+safe(m.description)+'</p>'+
          (allowed.ok ? '<button id="'+gid('go',id)+'">이동하기</button>'
            : '<small class="muted">잠김 · '+safe(allowed.reason)+'</small>')+'</div>';
      }).join('');
      let html='<section class="campaign-journal"><h2>아우라 지방 · 모험 지도</h2>'+
        '<p class="muted">이동과 충돌을 재구축하는 동안 사용할 수 있는 임시 지역·퀘스트 화면이야. 실제 픽셀아트 맵은 순차 구현 예정.</p>'+
        '<div class="panel"><strong>현재 위치 · '+safe(map.name)+'</strong><p>'+safe(map.description)+'</p>'+
        '<p>새로운 배지 <b>'+CORE.badgeCount(state)+'/8</b> · 기존 4배지 기록은 별도로 유지</p></div>'+
        '<div class="panel"><strong>다음 목표 · '+safe(objective.title)+'</strong><p>'+
        safe(objective.description)+'</p><small class="muted">목적지: '+safe(DATA.MAPS[objective.mapId]?.name||objective.mapId)+'</small></div>'+
        (events.length?'<h3>현재 지역의 사건</h3>'+events.map(e=>
          '<div class="panel"><b>'+safe(e.title)+'</b><p>'+safe(e.text)+'</p><button id="'+gid('event',e.id)+'">사건 조사하기</button></div>').join(''):'')+
        (gym?'<h3>체육관</h3><div class="panel"><b>'+safe(gym.name)+' · '+safe(gym.type)+'</b>'+
          '<p>'+safe(gym.puzzle)+'</p><p class="muted">상대 '+gym.team.length+'마리 · Lv.'+gym.level+'</p>'+
          (gymOK.ok?'<button id="'+gid('gym',gym.id)+'">관장에게 도전</button>':
          '<p class="muted">'+safe(gymOK.reason)+'</p>')+'</div>':'')+
        (rival?'<div class="panel"><b>라이벌 시온 · '+safe(rival.id)+'</b>'+
          '<p>고정된 파트너와 성장한 팀 '+rival.size+'마리 · Lv.'+rival.level+'</p>'+
          (rivalOK.ok?'<button id="campaignRival">시온과 대결하기</button>':
          '<p class="muted">'+safe(rivalOK.reason)+'</p>')+'</div>':'')+
        (postgames.length?'<h3>엔딩 이후의 이야기</h3>'+postgames.map(x=>
          '<div class="panel"><b>'+safe(x.id)+'</b><p>'+safe(x.text)+'</p>'+
          '<button id="'+gid('post',x.id)+'">조사하기</button></div>').join(''):'')+
        (bossEvent?'<div class="panel"><b>결전 · '+safe(bossEvent.title)+'</b><p>'+
          safe(bossEvent.text)+'</p>'+(bossOK?'<button id="campaignBoss">카이론과 대결</button>':
          '<p class="muted">선행 사건을 먼저 진행해 줘.</p>')+'</div>':'')+
        (league?'<div class="panel"><b>리그 도전 · '+safe(league.name)+'</b><p>Lv.'+
          league.level+' · '+league.team.length+'마리</p><button id="campaignLeague">대결하기</button></div>':'')+
        (encountered.length?'<div class="panel"><b>주변 풀숲</b><p class="muted">'+safe(encountered.join(' · '))+
          '</p><button id="campaignWild">야생 포켓몬 탐색</button></div>':'')+
        ((map.kind==='town'||map.kind==='city')?
          '<div class="panel"><b>포켓몬 회복소</b><p class="muted">이 지역에서 체력과 기술 PP를 회복할 수 있어.</p>'+
          '<button id="campaignHeal">모두 회복</button></div>':'')+
        '<h3>인접 지역</h3><div class="grid">'+neighbors+'</div>'+
        '<button id="campaignBack">게임 메뉴로 돌아가기</button></section>';
      pop(html,()=>{
        btn('campaignBack',back);
        for(const id of map.neighbors){
          if(CORE.canTravel(state,id).ok)btn(gid('go',id),()=>{
            const result=CORE.travel(state,id);
            if(result.ok){saveGame();render()}else toast(result.reason);
          });
        }
        for(const event of events)btn(gid('event',event.id),()=>scene(event));
        if(gym && gymOK.ok)btn(gid('gym',gym.id),()=>showFight(gym,'gym'));
        if(rival && rivalOK.ok)btn('campaignRival',()=>{
          const round=typeof RIVAL_SYSTEM!=='undefined'
            ?RIVAL_SYSTEM.CAMPAIGN_ROUNDS.find(x=>x.id===rival.id)
            :require('./rival-system.js').CAMPAIGN_ROUNDS.find(x=>x.id===rival.id);
          const rivalLib=typeof RIVAL_SYSTEM!=='undefined'?RIVAL_SYSTEM:require('./rival-system.js');
          if(!round||!state.rival?.starter){toast('라이벌 저장 데이터가 없어.');return}
          const team=rivalLib.campaignTeam(state.rival,round,dex,evolutions);
          showFight({id:rival.id,name:'시온',level:rival.level,team,prize:rival.prize},'rival');
        });
        for(const post of postgames)btn(gid('post',post.id),()=>scene({...post,title:post.id,postgame:true}));
        if(bossEvent&&bossOK)btn('campaignBoss',()=>showFight(DATA.BOSS[bossEvent.battleId],'boss'));
        if(league)btn('campaignLeague',()=>showFight(league,'league'));
        if(encountered.length)btn('campaignWild',()=>{
          const name=encountered[Math.floor(Math.random()*encountered.length)];
          const level=Math.max(3,Math.min(68,4+CORE.badgeCount(state)*7+Math.floor(Math.random()*3)));
          const wild=createMon(name,level);
          state.dex[wild.name]=Math.max(state.dex[wild.name]||0,1);
          saveGame();startBattle(null,wild);
        });
        if(map.kind==='town'||map.kind==='city')btn('campaignHeal',()=>{
          for(const mon of state.party){mon.hp=mon.max;for(const move of mon.moves||[])move.pp=move.maxpp}
          saveGame();toast('파티의 HP와 PP를 회복했어.');render();
        });
      });
    };

    const scene=event=>{
      const needsChoice=event.id==='EV_34_ARCEUS';
      const isEnding=event.id==='EV_38_CREDITS';
      pop('<div class="campaign-journal"><h2>'+safe(event.title)+'</h2><p>'+safe(event.text)+'</p>'+
        (needsChoice?'<p>아르세우스는 누구의 명령도 따르지 않아. 진정한 여명에 필요한 것은 무엇일까?</p>'+
        '<button id="campaignAccept">서로의 의지를 존중한다</button><button id="campaignReject">힘으로 따르게 한다</button>':
        isEnding?'<p>8개의 배지, 신전의 결전, 사천왕과 챔피언전. 너와 포켓몬이 함께 걸어온 길 위에 새로운 아침이 찾아온다.</p>'+
        '<button id="campaignAccept">명예의 전당에 기록하기</button>':
        '<button id="campaignAccept">조사 결과 기록하기</button>')+
        '<button id="campaignCancel">나중에</button></div>',()=>{
          btn('campaignCancel',render);
          btn('campaignAccept',()=>{
            const result=event.postgame?CORE.completePostgame(state,event.id):CORE.completeEvent(state,event.id);
            if(!result.ok){toast(result.reason);render();return}
            saveGame();
            render();
          });
          if(needsChoice)btn('campaignReject',()=>pop('<h2>아르세우스의 시련</h2><p>명령으로는 신뢰를 얻을 수 없어. 다시 생각해 봐.</p><button id="campaignTryAgain">다시 선택</button>',
            ()=>btn('campaignTryAgain',()=>scene(event))));
        });
    };

    const showFight=(opponent,kind)=>{
      const missing=CORE.missingSpecies(opponent,dex);
      if(missing.length){
        pop('<h2>대결 준비 중</h2><p>'+safe(opponent.name)+'의 팀에 필요한 포켓몬 데이터가 아직 없어.</p><p class="muted">'+safe(missing.join(' · '))+'</p>'+
          '<p>완성되지 않은 종을 다른 포켓몬으로 몰래 교체하지 않을게.</p><button id="campaignCancel">돌아가기</button>',
          ()=>btn('campaignCancel',render));
        return;
      }
      const eligibility=kind==='gym'?CORE.canFightGym(state,opponent.id):
        kind==='league'?CORE.canFightLeague(state,opponent.id):
        kind==='rival'?CORE.canFightRival(state,opponent.id):{ok:true};
      if(!eligibility.ok){toast(eligibility.reason);render();return}
      pop('<h2>'+safe(opponent.name)+'에게 도전!</h2><p>'+safe(opponent.team.join(' / '))+
        '</p><p class="muted">상대 레벨 Lv.'+opponent.level+'</p>'+
        '<button id="campaignChallenge">포켓몬 승부 시작</button><button id="campaignCancel">취소</button>',()=>{
          btn('campaignCancel',render);
          btn('campaignChallenge',()=>{
            const team=opponent.team.slice();
            startBattle({
              name:opponent.name,level:opponent.level,team,
              type:kind==='rival'?'rival':'campaign',campaignBattleId:opponent.id,prize:opponent.prize||0
            });
          });
        });
    };

    render();
  }
  return Object.freeze({open,WILD});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=CAMPAIGN_UI;
