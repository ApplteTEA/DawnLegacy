'use strict';
/**
 * DawnLegacy campaign state & rules.
 * No browser, localStorage, rendering, or mutable shared module state.
 * All gameplay flags are stored separately from the four-badge prototype.
 */
const CAMPAIGN_CORE = (() => {
  const DATA = typeof CAMPAIGN_DATA !== 'undefined'
    ? CAMPAIGN_DATA : (typeof require === 'function' ? require('./campaign-data.js') : null);
  if (!DATA) throw new Error('campaign-data.js must be loaded first');
  const SAVE_VERSION = 1;
  const GYM_GATES = Object.freeze({
    GYM_01:['CITY_01_VISITED'],GYM_02:['WAREHOUSE_SAFE'],
    GYM_03:['POWER_RESTORED'],GYM_04:['RUINS_RESEARCH_STARTED'],
    GYM_05:['FACTORY_SAFE'],GYM_06:['SNOW_RESCUED'],
    GYM_07:['STEEL_REPORT'],GYM_08:['WIND_TRIAL_DONE']
  });
  const MAP_GATES = Object.freeze({
    D01:['FOREST_PERMIT'],R02:['CLUE_RING'],M02:['CLUE_RING'],
    D02:['CARGO_INVESTIGATION'],F01:['GYM_2_WON'],
    R03:['R03_OPEN'],M03:['R03_OPEN'],D03:['POWER_ALERT'],
    R04:['R04_OPEN'],M04:['R04_OPEN'],F02:['RUINS_RESEARCH_STARTED'],
    D04:['GYM_4_WON'],R05:['R05_OPEN'],M05:['R05_OPEN'],
    D05:['GYM_5_WON'],R06:['R06_OPEN'],M06:['R06_OPEN'],
    D06:['GYM_6_WON'],R07:['R07_OPEN'],M07:['R07_OPEN'],
    D07:['GYM_7_WON'],R08:['R08_OPEN'],M08:['R08_OPEN'],
    D08:['GYM_8_WON'],D09:['D09_OPEN'],R09:['ECLIPSE_RESOLVED'],
    M09:['LEAGUE_REGISTERED'],L01:['LEAGUE_REGISTERED'],
    P01:['POSTGAME_UNLOCKED'],P02:['POSTGAME_UNLOCKED'],
    P03:['POSTGAME_UNLOCKED']
  });
  const EMPTY_OBJECT = () => Object.create(null);
  function normalize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return EMPTY_OBJECT();
    return Object.assign(EMPTY_OBJECT(), input);
  }
  function ensure(save) {
    if (!save || typeof save !== 'object' || Array.isArray(save)) throw new Error('Invalid save state');
    const old = save.campaign && typeof save.campaign === 'object' && !Array.isArray(save.campaign)
      ? save.campaign : {};
    if(old.version===SAVE_VERSION && DATA.MAPS[old.mapId] &&
      ['visited','flags','gymWins','rewardClaims','questStates','cutsceneSeen','leagueRun','legacy'].every(k=>old[k]&&typeof old[k]==='object'&&!Array.isArray(old[k]))){
      if(save.type && Array.isArray(save.party) && save.party.length){
        old.flags.STARTER_CHOSEN=true;
        if(save.rival?.starter){old.flags.RIVAL_STARTER_FIXED=true;old.flags.EV_00_CHOOSE_STARTER=true}
      }
      return old;
    }
    // Never turn the old prototype's four badges or champion flag into story wins.
    const campaign = {
      version:SAVE_VERSION,
      mapId:DATA.MAPS[old.mapId] ? old.mapId : 'M00',
      visited:normalize(old.visited),
      flags:normalize(old.flags),
      gymWins:normalize(old.gymWins),
      rewardClaims:normalize(old.rewardClaims),
      questStates:normalize(old.questStates),
      cutsceneSeen:normalize(old.cutsceneSeen),
      leagueRun:normalize(old.leagueRun),
      legacy:Object.assign({badges:Number.isInteger(save.badges)?save.badges:0,
        champion:!!save.champion},normalize(old.legacy))
    };
    campaign.visited.M00 = true;
    campaign.visited[campaign.mapId] = true;
    // A completed legacy starter counts as selecting a starter, but does not
    // advance story boss/leader/badge flags.
    if (save.type && Array.isArray(save.party) && save.party.length) {
      campaign.flags.STARTER_CHOSEN = true;
      if (save.rival && save.rival.starter) {
        campaign.flags.RIVAL_STARTER_FIXED = true;
        campaign.flags.EV_00_CHOOSE_STARTER = true;
      }
    }
    save.campaign=campaign;
    return campaign;
  }
  function flag(save,key) {
    const c=ensure(save);
    return !!c.flags[key] || !!c.gymWins[key];
  }
  function badgeCount(save) {
    return DATA.GYMS.filter(x=>flag(save,x.id)).length;
  }
  function isChampion(save){return flag(save,'CHAMPION_WON')}
  function canEnter(save,mapId) {
    const map=DATA.MAPS[mapId];
    if (!map) return {ok:false,reason:'알 수 없는 지역'};
    const c=ensure(save);
    if (c.visited[mapId]) return {ok:true,reason:''};
    if (map.kind==='postgame'&&!flag(save,'POSTGAME_UNLOCKED'))
      return {ok:false,reason:'챔피언 엔딩 이후 입장 가능'};
    const count=badgeCount(save);
    if(count<map.minBadges)return {ok:false,reason:'배지 '+map.minBadges+'개 필요'};
    const missing=(MAP_GATES[mapId]||[]).filter(x=>!flag(save,x));
    if(missing.length)return {ok:false,reason:'선행 사건 해결 필요: '+missing.join(', ')};
    return {ok:true,reason:''};
  }
  function canTravel(save,target) {
    const c=ensure(save), map=DATA.MAPS[c.mapId];
    if(!map || !map.neighbors.includes(target))return {ok:false,reason:'인접한 지역에서만 이동할 수 있어'};
    return canEnter(save,target);
  }
  function travel(save,target) {
    const allowed=canTravel(save,target);
    if(!allowed.ok)return {ok:false,reason:allowed.reason};
    const c=ensure(save);
    c.mapId=target;
    c.visited[target]=true;
    return {ok:true,mapId:target};
  }
  function canStartEvent(save,id) {
    const event=DATA.STORY.find(x=>x.id===id);
    if(!event)return {ok:false,reason:'알 수 없는 사건'};
    const c=ensure(save);
    if(c.flags[event.id])return {ok:false,reason:'이미 완료한 사건'};
    if(c.mapId!==event.mapId)return {ok:false,reason:'사건 장소가 아님'};
    const missing=event.require.filter(x=>!flag(save,x));
    if(missing.length)return {ok:false,reason:'선행 조건: '+missing.join(', ')};
    if(event.battleId)return {ok:false,reason:'전투 승리로 완료되는 사건'};
    return {ok:true,reason:''};
  }
  function completeEvent(save,id) {
    const allowed=canStartEvent(save,id);
    if(!allowed.ok)return {ok:false,reason:allowed.reason};
    const event=DATA.STORY.find(x=>x.id===id);
    const c=ensure(save);
    c.flags[id]=true;
    for(const key of event.flags)c.flags[key]=true;
    c.rewardClaims[id]=true;
    c.cutsceneSeen[id]=true;
    return {ok:true,id,flags:event.flags.slice()};
  }
  function canFightGym(save,gymId) {
    const idx=DATA.GYMS.findIndex(x=>x.id===gymId);
    if(idx<0)return {ok:false,reason:'존재하지 않는 체육관'};
    const gym=DATA.GYMS[idx],c=ensure(save);
    if(c.mapId!==gym.mapId)return {ok:false,reason:'체육관이 있는 도시로 이동해야 해'};
    if(c.gymWins[gymId])return {ok:false,reason:'이미 획득한 배지'};
    if(idx>0 && !c.gymWins[DATA.GYMS[idx-1].id])return {ok:false,reason:'앞선 체육관 배지가 필요해'};
    const missing=GYM_GATES[gymId].filter(x=>!flag(save,x));
    if(missing.length)return {ok:false,reason:'먼저 지역 사건을 해결해야 해'};
    return {ok:true,reason:''};
  }
  function canFightLeague(save,id) {
    const c=ensure(save),idx=DATA.LEAGUE.findIndex(x=>x.id===id);
    if(idx<0)return {ok:false,reason:'존재하지 않는 리그 도전자'};
    if(c.mapId!=='L01'||!flag(save,'LEAGUE_REGISTERED'))return {ok:false,reason:'리그에 등록해야 해'};
    if(flag(save,'CHAMPION_WON'))return {ok:false,reason:'최초 리그 도전은 완료했어'};
    if(c.leagueRun[id])return {ok:false,reason:'이미 승리한 단계'};
    if(idx>0&&!c.leagueRun[DATA.LEAGUE[idx-1].id])return {ok:false,reason:'이전 사천왕부터 도전해야 해'};
    return {ok:true,reason:''};
  }
  function defeat(save) {
    const c=ensure(save);
    // Only the current League attempt resets; story, badges, dex, team stay.
    c.leagueRun=EMPTY_OBJECT();
    for(let index=1;index<=4;index++) delete c.flags['E4_'+index+'_CLEAR'];
    return true;
  }
  function completeBattle(save,id) {
    const c=ensure(save);
    const gym=DATA.GYMS.find(x=>x.id===id);
    if(gym){
      const allowed=canFightGym(save,id);
      if(!allowed.ok)return {ok:false,reason:allowed.reason};
      c.gymWins[id]=true;
      const index=DATA.GYMS.indexOf(gym)+1;
      c.flags['GYM_'+index+'_WON']=true;
      c.rewardClaims[id]=true;
      return {ok:true,id,badge:gym.badge};
    }
    const league=DATA.LEAGUE.find(x=>x.id===id);
    if(league){
      const allowed=canFightLeague(save,id);
      if(!allowed.ok)return {ok:false,reason:allowed.reason};
      c.leagueRun[id]=true;
      if(id==='CHAMPION'){
        c.flags.CHAMPION_WON=true;
        c.flags.EV_37_CHAMPION=true;
      }else{
        const index=DATA.LEAGUE.indexOf(league)+1;
        c.flags['E4_'+index+'_CLEAR']=true;
      }
      c.rewardClaims[id]=true;
      return {ok:true,id};
    }
    if(id==='ECL_KAIRON'){
      const event=DATA.STORY.find(x=>x.battleId===id);
      if(!event || c.mapId!==event.mapId || c.flags[event.id] || event.require.some(x=>!flag(save,x)))
        return {ok:false,reason:'카이론 최종전의 선행 조건이 충족되지 않았어'};
      c.flags[event.id]=true;
      for(const key of event.flags)c.flags[key]=true;
      c.rewardClaims[event.id]=true;
      return {ok:true,id};
    }
    return {ok:false,reason:'등록되지 않은 캠페인 배틀'};
  }
  function availableEvents(save) {
    const c=ensure(save);
    return DATA.STORY.filter(x=>x.mapId===c.mapId && canStartEvent(save,x.id).ok);
  }
  function nextObjective(save) {
    const c=ensure(save);
    for(const event of DATA.STORY) {
      if (!c.flags[event.id] && !event.battleId) {
        // Ignore optional prologue for a legacy save that has a starter.
        return {id:event.id,title:event.title,mapId:event.mapId,description:event.text};
      }
      if(!c.flags[event.id] && event.battleId)
        return {id:event.id,title:event.title,mapId:event.mapId,description:event.text};
    }
    return {id:'POSTGAME',title:'엔딩 이후 탐험',mapId:'P01',description:'챔피언의 새로운 여정'};
  }
  function missingSpecies(roster,dex) {
    const pool=new Set(dex.map(x=>x.name));
    return roster.team.filter(x=>!pool.has(x));
  }
  function validate(dex) {
    const problems=[];
    const ids=new Set(Object.keys(DATA.MAPS));
    if(ids.size!==34)problems.push('Expected exactly 34 maps');
    const seen=new Set();
    for(const map of Object.values(DATA.MAPS)){
      if(seen.has(map.id))problems.push('Duplicate map '+map.id);
      seen.add(map.id);
      if(!map.neighbors.length)problems.push('Unconnected map '+map.id);
      for(const target of map.neighbors){
        if(!DATA.MAPS[target] || !DATA.MAPS[target].neighbors.includes(map.id))
          problems.push('Nonreciprocal edge '+map.id+' -> '+target);
      }
    }
    const producers=new Set(['STARTER_CHOSEN','RIVAL_STARTER_FIXED']);
    for(const event of DATA.STORY){
      if(!ids.has(event.mapId))problems.push('Invalid map in '+event.id);
      for(const result of event.flags)producers.add(result);
      producers.add(event.id);
    }
    DATA.GYMS.forEach((x,i)=>{producers.add('GYM_'+(i+1)+'_WON');if(!ids.has(x.mapId))problems.push('Invalid gym map '+x.id)});
    DATA.LEAGUE.forEach((x,i)=>{if(i<4)producers.add('E4_'+(i+1)+'_CLEAR')});
    const missing=new Set();
    for(const ev of DATA.STORY)for(const key of ev.require)if(!producers.has(key))missing.add(key);
    if(missing.size)problems.push('Undefined prerequisite flags: '+[...missing].join(', '));
    const unavailable=[];
    if(Array.isArray(dex)){
      for(const fight of [...DATA.GYMS,...DATA.LEAGUE,...Object.values(DATA.BOSS)]){
        const misses=missingSpecies(fight,dex);
        if(misses.length)unavailable.push({id:fight.id,missing:misses});
      }
    }
    return {ok:!problems.length,problems,unavailableSpecies:unavailable};
  }

  return Object.freeze({DATA,SAVE_VERSION,ensure,flag,badgeCount,isChampion,canEnter,canTravel,travel,
    canStartEvent,completeEvent,canFightGym,canFightLeague,completeBattle,defeat,availableEvents,
    nextObjective,missingSpecies,validate});
})();
if (typeof module !== 'undefined' && module.exports) module.exports=CAMPAIGN_CORE;
