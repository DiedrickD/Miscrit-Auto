import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Engine} from '../lib/engine.mjs';
import {GameError} from '../lib/transport.mjs';
import {settings,trainingStatus} from '../lib/model.mjs';
const protocol=JSON.parse(readFileSync(new URL('../data/protocol.json',import.meta.url)));
const catalog={teleports:{forest:{}},species:[{id:1,name:'Flue',stops:[{location:'forest',area_id:1,object_id:0}]}]};
const crit=(id,level=1,exp=0)=>({id,mId:1,level,exp,chp:30,hp:2,spd:2,ea:2,pa:2,ed:2,pd:2});
function harness(config={}){
  const p={user_id:'me',team_order:[1,2],miscrits:[crit(1),crit(2)],area:{area_id:1,location:{name:'forest'}},left_traits:[],battle:''};
  const calls=[],responses={};
  const transport={connected:true,async rpc(id,payload){calls.push([id,payload]);if(responses[id])return responses[id](payload);if(id==='get_player')return structuredClone(p);if(id==='xp_train'){const m=p.miscrits.find(m=>m.id===payload.miscritId);m.level++;m.exp=0;}return {};}};
  const engine=new Engine({catalog,protocol,config:{names:['Flue'],autoLevel:true,...config}});engine.transport=transport;engine.player=structuredClone(p);engine.running=true;
  return {engine,p,calls,responses};
}
test('training setting defaults off, validates booleans and preserves existing preferences',()=>{
  assert.equal(settings({},catalog).autoLevel,false);
  assert.equal(settings({autoLevel:true,names:['Flue'],autoReplace:true,replacementNames:['Flue']},catalog).autoLevel,true);
  assert.throws(()=>settings({autoLevel:'on'},catalog));
});
test('native XP requirements cover levels 1–34 and both owned formats require enough earned XP',()=>{
  assert.equal(Object.keys(protocol.training_xp).length,34);
  assert.equal(protocol.training_xp['1'],10);assert.equal(protocol.training_xp['34'],979);
  for(let level=1;level<35;level++){
    const xp=protocol.training_xp[level];assert.ok(Number.isInteger(xp)&&xp>0);
    assert.equal(trainingStatus(crit(1,level,xp-1),protocol).readyToTrain,false);
    assert.equal(trainingStatus(crit(1,level,xp),protocol).readyToTrain,true);
    assert.equal(trainingStatus({v:2,l:level,x:xp},protocol).readyToTrain,true);
  }
  for(const raw of [crit(1,35,9999),{level:1},{level:1,exp:'10'},{v:2,l:1,x:NaN},{level:0,exp:9999}])assert.equal(trainingStatus(raw,protocol).readyToTrain,false);
});
test('hunting and campaign train only an eligible active teammate and refresh before another action',async()=>{
  for(const activity of ['wild','campaign']){
    const {engine,p,calls}=harness({activity});p.miscrits[1].exp=10;p.miscrits.push(crit(9,1,100));
    await engine.tick();
    assert.deepEqual(calls.map(c=>c[0]),['get_player','xp_train','get_player']);
    assert.deepEqual(calls[1][1],{miscritId:2,currLevel:1});
    assert.equal(engine.player.miscrits[1].level,2);assert.equal(engine.history[0].kind,'training');
    assert.equal(engine.snapshot().player.team[1].xp,0);assert.equal(engine.snapshot().player.team[1].xpNeeded,14);
  }
});
test('disabled training, insufficient XP, max levels and a manual active battle never send training',async()=>{
  for(const scenario of ['disabled','xp','max','battle']){
    const {engine,p,calls}=harness({autoLevel:scenario!=='disabled'});
    if(scenario==='disabled')p.miscrits[0].exp=10;
    if(scenario==='max')p.miscrits[0]=crit(1,35,9999);
    if(scenario==='battle'){p.miscrits[0].exp=10;engine.battle={joining:true,created:Date.now(),updated:Date.now()};}
    await engine.tick();assert.equal(calls.some(c=>c[0]==='xp_train'),false);
    assert.equal(calls.some(c=>['plat_train','token_train','add_bonus'].includes(c[0])),false);
  }
});
test('pending training is sent once; pausing still confirms the result without starting a battle',async()=>{
  const {engine,p,calls,responses}=harness();p.miscrits[0].exp=10;let release;
  responses.xp_train=()=>new Promise(resolve=>release=()=>{p.miscrits[0].level=2;p.miscrits[0].exp=0;resolve({});});
  const pending=engine.tick();await new Promise(resolve=>setImmediate(resolve));await engine.tick();engine.stop();release();await pending;
  assert.equal(calls.filter(c=>c[0]==='xp_train').length,1);assert.equal(engine.player.miscrits[0].level,2);
  assert.equal(engine.running,false);assert.equal(calls.some(c=>c[0]==='create_battle'),false);
});
test('rejected, uncertain and stale-level training stop before searches or replacement',async()=>{
  for(const outcome of ['rejected','timeout','stale']){
    const {engine,p,calls,responses}=harness({autoReplace:true,replacementNames:['Flue']});p.miscrits[0].exp=10;
    responses.xp_train=()=>{if(outcome!=='stale')throw new GameError('Training '+outcome,outcome==='timeout');return {};};
    await engine.tick();await engine.tick();assert.equal(engine.running,false);
    assert.equal(engine.uncertain,outcome!=='rejected');assert.equal(calls.filter(c=>c[0]==='xp_train').length,1);
    assert.equal(calls.some(c=>['create_battle','update_team'].includes(c[0])),false);
    if(engine.uncertain)assert.throws(()=>engine.start(),/uncertain/);
  }
});
test('a teammate trained to 35 is replaced on the following cycle using the existing selected pool',async()=>{
  const {engine,p,calls,responses}=harness({autoReplace:true,replacementNames:['Flue']});p.miscrits[1]=crit(2,34,protocol.training_xp[34]);p.miscrits.push(crit(9));
  responses.update_team=payload=>{p.team_order=payload.team;return {};};
  await engine.tick();assert.equal(engine.player.miscrits[1].level,35);assert.equal(calls.some(c=>c[0]==='update_team'),false);
  engine.nextCycle=0;await engine.tick();assert.deepEqual(engine.player.team_order,[1,9]);
  assert.equal(calls.filter(c=>c[0]==='xp_train').length,1);
});
