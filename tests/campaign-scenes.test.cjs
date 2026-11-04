'use strict';
const assert=require('node:assert/strict');
const DATA=require('../campaign-data.js');
const SCENES=require('../campaign-scenes.js');

const report=SCENES.validate();
assert.equal(report.ok,true,'Every story event needs a written dialogue scene: '+JSON.stringify(report));
assert.equal(DATA.STORY.length,39);
assert.equal(Object.keys(SCENES.SCRIPTS).length,39);
const saved={
  playerName:'지우',type:'불꽃',
  party:[{name:'브케인'}],
  rival:{type:'물',starter:'리아코'}
};
for(const event of DATA.STORY){
  const pages=SCENES.pages(event.id,saved);
  assert.ok(pages.length>=2,'Story event must contain at least two lines: '+event.id);
  for(const page of pages){
    assert.equal(typeof page.speaker,'string');
    assert.equal(typeof page.text,'string');
    assert.ok(page.speaker.trim());
    assert.ok(page.text.trim());
    assert.doesNotMatch(page.text,/\{(?:playerName|chosenType|starterName|rivalStarter)\}/,
      'Unresolved dialogue variable in '+event.id);
  }
}
const opening=SCENES.pages('EV_00_CHOOSE_STARTER',saved);
assert.match(opening.find(x=>x.speaker==='시온').text,/불꽃/);
assert.match(opening.find(x=>x.speaker==='시온').text,/유리한 타입|강한 타입/);
const dawn=SCENES.pages('EV_34_ARCEUS',saved);
assert.ok(dawn.some(x=>x.text.includes('아르세우스')));
const ending=SCENES.pages('EV_38_CREDITS',saved);
assert.ok(ending.some(x=>x.text.includes('챔피언')));
assert.throws(()=>SCENES.pages('EV_UNKNOWN',saved),/Unknown campaign event/);

console.log('39 scripted story scenes validated with saved starter/rival text and complete dialogue lines.');
