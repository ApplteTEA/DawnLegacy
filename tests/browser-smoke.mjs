'use strict';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const uncaught=[];
page.on('pageerror',error=>uncaught.push(error.message));
async function ready(){
  await page.waitForFunction(()=>
    typeof BATTLE_ENGINE!=='undefined' &&
    typeof CAMPAIGN_CORE!=='undefined' &&
    typeof CAMPAIGN_UI!=='undefined' &&
    typeof createMon==='function',null,{timeout:25000});
}
try{
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await ready();
  await page.locator('[data-type]').first().waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('[data-type]').count(),17);

  await page.evaluate(()=>{
    s.type='불꽃';s.party=[createMon('브케인',35,false)];s.box=[];
    s.dex={'브케인':2};s.money=3000;s.balls=12;s.great=2;s.potions=5;
    s.defeated=[];s.badges=0;s.champion=false;
    CAMPAIGN_CORE.ensure(s).gymWins.GYM_05=true;
    save();close();
  });

  await page.locator('#keyMenu').click();
  await page.locator('#party').click();
  await page.locator('[data-manage="0"]').click();
  const teach=page.locator('button[data-learn]').filter({hasText:'도깨비불'});
  await teach.waitFor({state:'visible',timeout:5000});
  await teach.click();
  await page.locator('[data-forget="0"]').click();
  assert.equal(await page.evaluate(()=>s.party[0].moves[0].name),'도깨비불');
  await page.screenshot({path:'/tmp/dawnlegacy-battle-moves-portrait.png',fullPage:true});

  await page.evaluate(()=>{
    close();s.party=[createMon('블레이범',85,false)];save();
    beginBattle({name:'브라우저 테스트 상대',team:['치코리타'],level:5,prize:400});
  });
  await page.locator('#fightAttack').waitFor({state:'visible',timeout:6000});
  await page.locator('#fightAttack').click();
  await page.locator('[data-move="0"]').first().click();
  await page.locator('#battleContinue').waitFor({state:'visible',timeout:12000});
  await page.screenshot({path:'/tmp/dawnlegacy-battle-victory-portrait.png',fullPage:true});
  await page.locator('#battleContinue').click();
  assert.equal(await page.evaluate(()=>s.defeated.includes('브라우저 테스트 상대')),true);
  assert.equal(await page.evaluate(()=>s.money),3400);

  await page.reload({waitUntil:'domcontentloaded'});
  await ready();
  assert.equal(await page.evaluate(()=>s.defeated.includes('브라우저 테스트 상대')),true);
  assert.equal(await page.evaluate(()=>s.party[0].name),'블레이범');

  await page.setViewportSize({width:760,height:680});
  await page.locator('#keyMenu').waitFor({state:'visible'});
  await page.screenshot({path:'/tmp/dawnlegacy-battle-landscape.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});

  await page.locator('#keyMenu').click();
  await page.locator('#restart').click();
  await page.locator('#yes').click();
  await page.locator('[data-type]').first().waitFor({state:'visible',timeout:25000});
  assert.equal(await page.locator('[data-type]').count(),17);
  assert.equal(await page.evaluate(()=>s.type),null);
  assert.equal(await page.evaluate(()=>s.party.length),0);
  assert.equal(await page.evaluate(()=>s.defeated.length),0);
  assert.deepEqual(uncaught,[],'No uncaught production JavaScript errors');
  console.log('Chromium smoke passed: type screen, 390px TM, trainer victory, persisted save, 760px layout and reset.');
}finally{
  await browser.close();
}
