'use strict';
/**
 * DawnLegacy campaign gym-puzzle engine.
 * Each challenge is a deterministic, checkpointed sequence. This temporary
 * menu-based interaction will be reused by map objects after field integration.
 * The source of truth is save.campaign.questStates, not temporary UI state.
 */
const CAMPAIGN_PUZZLES = (() => {
  const definitions = [
    {
      id:'GYM_01', title:'숲의 덩굴 수로', clue:'씨앗이 자라려면 먼저 흙에 물이 스며들고, 다음에 뿌리가 물을 마시고, 마지막에 잎에 빛이 닿아야 해.',
      steps:['soil','roots','sun'],
      choices:[['soil','흙으로 물길 열기'],['roots','뿌리 수문 열기'],['sun','잎이 있는 채광창 열기']],
      complete:'물이 뿌리로 흐르고 덩굴다리가 자라났어!'
    },
    {
      id:'GYM_02', title:'밀물과 썰물', clue:'수문은 바다 쪽부터 열어 압력을 줄인 후 중앙 수로를 연결하고 마지막에 내항의 배를 통과시켜야 해.',
      steps:['outer','middle','inner'],
      choices:[['inner','내항 수문'],['outer','외항 수문'],['middle','중앙 수문']],
      complete:'부두의 수위가 안정되고 관장에게 가는 길이 열렸어!'
    },
    {
      id:'GYM_03', title:'안전한 전류', clue:'먼저 접지로 위험한 전류를 흘려보내고, 회로를 연결한 다음 마지막에 발전기를 켜야 해.',
      steps:['ground','wire','power'],
      choices:[['power','발전기 가동'],['ground','접지 스위치'],['wire','회로 연결']],
      complete:'불안정한 전류가 잦아들고 전광배지 도전실에 전기가 들어왔어!'
    },
    {
      id:'GYM_04', title:'안개의 거울', clue:'거울 속 문장은 뒤집혀 있어. 시작은 가장 먼 기억의 거울, 다음은 현재의 거울, 마지막은 앞날의 거울이야.',
      steps:['past','present','future'],
      choices:[['future','미래의 거울'],['past','과거의 거울'],['present','현재의 거울']],
      complete:'세 거울이 같은 빛을 비추며 유적의 문이 열렸어!'
    },
    {
      id:'GYM_05', title:'용광로의 압력', clue:'기계를 멈출 때는 압력을 먼저 배출하고 열을 식힌 다음 안전 잠금쇠를 걸어야 해.',
      steps:['vent','cool','lock'],
      choices:[['lock','안전 잠금쇠'],['vent','배기 밸브'],['cool','냉각수 밸브']],
      complete:'용광로가 안전 온도로 내려가며 관장실 방화문이 열렸어!'
    },
    {
      id:'GYM_06', title:'설산의 세 봉화', clue:'산 아래의 구조대가 위쪽으로 신호를 전할 수 있게 낮은 봉화부터 중턱, 정상 순으로 불을 붙여.',
      steps:['lower','middle','summit'],
      choices:[['summit','정상 봉화'],['middle','중턱 봉화'],['lower','아래 봉화']],
      complete:'세 봉화가 연결되자 빙판 아래 다리가 나타났어!'
    },
    {
      id:'GYM_07', title:'철의 비상 정지', clue:'보안문을 열기 전에 주 전원을 끊고, 정지한 레일을 정렬한 후 잠금을 해제해야 안전해.',
      steps:['poweroff','rail','unlock'],
      choices:[['rail','레일 정렬'],['unlock','보안 잠금 해제'],['poweroff','주 전원 차단']],
      complete:'레일이 안전하게 멈추고 철문이 열렸어!'
    },
    {
      id:'GYM_08', title:'고산 바람 종', clue:'바람은 낮은 계곡에서 출발해 중턱을 지나 가장 높은 하늘로 흘러가. 세 풍종을 그 순서로 울려.',
      steps:['valley','ridge','sky'],
      choices:[['ridge','중턱 풍종'],['sky','정상 풍종'],['valley','계곡 풍종']],
      complete:'세 풍종이 화음을 이루며 상승 기류가 잠잠해졌어!'
    }
  ];
  const GYMS=Object.freeze(Object.fromEntries(definitions.map(def=>[
    def.id,Object.freeze({
      id:def.id,title:def.title,clue:def.clue,
      steps:Object.freeze(def.steps.slice()),
      choices:Object.freeze(def.choices.map(([id,label])=>Object.freeze({id,label}))),
      complete:def.complete
    })
  ])));

  // Shrine nodes are separate from the eight gym trials. The player must
  // safely disconnect each circuit, not simply click a completion button.
  const storyDefinitions = [
    {
      id:'EV_30_NODE_FOREST',title:'숲의 공명 신호 분리',
      clue:'먼저 포켓몬의 원래 생태 신호를 듣고, 강제 동조를 해제한 뒤, 분리 상태를 기록해야 해.',
      steps:['observe','release','record'],
      choices:[['record','분리 결과 기록'],['observe','생태 신호 관측'],['release','동조 신호 해제']],
      complete:'숲의 생명 신호가 각자의 리듬을 되찾았어.'
    },
    {
      id:'EV_31_NODE_POWER',title:'발전소 공명 신호 분리',
      clue:'위험한 잔류 전류를 접지한 뒤 송신선을 분리하고, 마지막으로 비상 회로의 안전을 확인해.',
      steps:['ground','unplug','verify'],
      choices:[['unplug','송신선 분리'],['verify','비상 회로 확인'],['ground','잔류 전류 접지']],
      complete:'발전소의 공명 신호가 안전하게 차단됐어.'
    },
    {
      id:'EV_32_NODE_SKY',title:'하늘신전 증폭기 분리',
      clue:'증폭 출력을 먼저 낮추고, 세 거점의 연결을 분리한 다음, 증폭기 전원을 정지해야 해.',
      steps:['reduce','separate','stop'],
      choices:[['stop','증폭기 정지'],['reduce','증폭 출력 줄이기'],['separate','연결 주파수 분리']],
      complete:'마지막 증폭기가 멈추며 하늘의 어둠이 옅어졌어.'
    }
  ];
  const EVENTS=Object.freeze(Object.fromEntries(storyDefinitions.map(def=>[
    def.id,Object.freeze({
      id:def.id,title:def.title,clue:def.clue,
      steps:Object.freeze(def.steps.slice()),
      choices:Object.freeze(def.choices.map(([id,label])=>Object.freeze({id,label}))),
      complete:def.complete
    })
  ])));

  function getPuzzle(id) {
    const puzzle=GYMS[id]||EVENTS[id];
    if(!puzzle) throw new Error('Unknown gym puzzle: '+id);
    return puzzle;
  }
  function store(save) {
    if(!save || typeof save!=='object'||!save.campaign || !save.campaign.questStates ||
       typeof save.campaign.questStates!=='object') {
      throw new Error('Campaign save must be initialized before a puzzle');
    }
    return save.campaign.questStates;
  }
  function key(id) {return 'PUZZLE_'+id}
  function status(save,id) {
    const puzzle=getPuzzle(id),saved=store(save)[key(id)];
    if(!saved||typeof saved!=='object')return {step:0,solved:false,total:puzzle.steps.length};
    const solved=saved.solved===true;
    const step=solved?puzzle.steps.length:
      Number.isInteger(saved.step)&&saved.step>=0&&saved.step<puzzle.steps.length?saved.step:0;
    return {step,solved,total:puzzle.steps.length};
  }
  function isSolved(save,id){return status(save,id).solved}
  function attempt(save,id,choiceId){
    const puzzle=getPuzzle(id),states=store(save),current=status(save,id);
    if(current.solved)return {ok:true,solved:true,step:current.step,message:'이미 해결한 퍼즐이야.'};
    if(!puzzle.choices.some(option=>option.id===choiceId))
      return {ok:false,solved:false,step:current.step,message:'존재하지 않는 퍼즐 조작이야.'};
    if(puzzle.steps[current.step]!==choiceId){
      states[key(id)]={step:0,solved:false};
      return {ok:false,solved:false,step:0,message:'순서가 맞지 않아. 처음부터 다시 조작해 보자.'};
    }
    const step=current.step+1,solved=step===puzzle.steps.length;
    states[key(id)]={step,solved};
    return {ok:true,solved,step,message:solved?puzzle.complete:'올바른 순서야. 다음 장치를 조작해.'};
  }
  function reset(save,id){
    const current=status(save,id);
    if(current.solved)return false; // Solved puzzles stay solved; rewards remain single-shot.
    store(save)[key(id)]={step:0,solved:false};
    return true;
  }
  return Object.freeze({GYMS,EVENTS,status,isSolved,attempt,reset});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=CAMPAIGN_PUZZLES;
