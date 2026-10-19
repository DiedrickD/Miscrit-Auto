import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Engine} from '../lib/engine.mjs';
import {GameError} from '../lib/transport.mjs';
import {DEFAULTS,settings,collectionFamilies,selectedTrainingPlan,decision} from '../lib/model.mjs';
const protocol=JSON.parse(readFileSync(new URL('../data/protocol.json',import.meta.url)));
const catalog={teleports:{forest:{}},species:[1,2,3,4,5].map(id=>({id,name:'Species '+id,stops:[{location:'forest',area_id:1,object_id:0}]}))};
const crit=(id,mId,level=1,stat=3,exp=0)=>({id,mId,level,exp,chp:40,hp:stat,spd:stat,ea:stat,ed:stat,pa:stat,pd:stat});
const config={...DEFAULTS,names:['Species 1'],mode:'capture_missing',trainSelected:true,replacementNames:['Species 2']};
const player=()=>({user_id:'me',team_order:[1,2,3,4],miscrits:[crit(1,1,35),crit(2,2,1,1),crit(3,3,1,2),crit(4,4,1,2),crit(9,2,1,3)],area:{area_id:1,location:{name:'forest'}},left_traits:[],battle:''});
function harness(overrides={}){
  const p=player(),calls=[],responses={};
  const transport={connected:true,async rpc(id,payload){calls.push([id,payload]);if(responses[id])return responses[id](payload);if(id==='get_player')return structuredClone(p);if(id==='update_team')p.team_order=[...payload.team];if(id==='xp_train'){const m=p.miscrits.find(m=>m.id===payload.miscritId);m.level++;m.exp=0;}return {};},async join(id){calls.push(['join',id]);},async leave(){},send(...args){calls.push(['send',...args]);}};
  const engine=new Engine({catalog,protocol,config:{...config,...overrides}});engine.player=structuredClone(p);engine.transport=transport;engine.running=true;engine.collectionIndex={};engine.indexUpdated=Date.now();
  return {engine,p,calls,responses};
}
function battle(family=2){return {type:'Wild',player:{user_id:'me',miscrits:[{id:1,hp:100,chp:100,abilities:[{id:7,type:'Attack',ap:15,recharge:0},{id:8,type:'Attack',ap:40,recharge:0}]}]},foe:{user_id:'Wild',miscrits:[{id:99,mId:family,hp:100,chp:100,rating:0,attempts:0}]},nextTurn:'me',captureChance:80,damage:{},attacks:0,serial:1,acted:-1};}
test('collection mode and selected training are validated without changing existing defaults',()=>{
  assert.equal(settings(config,catalog).mode,'capture_missing');assert.equal(settings(config,catalog).trainSelected,true);
  assert.equal(settings({},catalog).trainSelected,false);assert.throws(()=>settings({trainSelected:'true'},catalog));
});
test('collection ownership counts every owned copy and evolution by family in both record formats',()=>{
  const families=collectionFamilies({miscrits:[crit(1,1,35),{v:2,id:2,m:2,l:30,n:'Evolved name'}]});
  assert.deepEqual([...families],[1,2]);assert.throws(()=>collectionFamilies(null));assert.throws(()=>collectionFamilies({miscrits:[{}]}));
});
test('missing species are captured regardless of rating; owned species are never captured',()=>{
  const b=battle(2),c={...config,minRating:18,fleeUnwanted:true},context={families:new Set([1]),trainOwned:false};
  assert.equal(decision(b,c,catalog,context).action,'capture');
  context.families.add(2);assert.equal(decision(b,c,catalog,context).action,'flee');
  context.trainOwned=true;assert.deepEqual(decision(b,c,catalog,context),{action:'ability',id:8});
  assert.equal(decision(b,c,catalog).action,'stop');
  context.families.delete(2);b.foe.miscrits[0].attempts=1;assert.equal(decision(b,c,catalog,context).action,'flee');
});
test('selection preserves the lead, chooses one best copy per listed species and fills an incomplete team',()=>{
  const p=player();let plan=selectedTrainingPlan(p,['Species 2'],catalog,new Map());
  assert.deepEqual(plan.after,[1,9,3,4]);assert.deepEqual(plan.traineeIds,[9]);
  p.team_order=[1];p.miscrits.push(crit(10,3,1,3),crit(11,4,1,3),crit(12,5,1,3));
  plan=selectedTrainingPlan(p,['Species 2','Species 3','Species 4','Species 5'],catalog,new Map());
  assert.deepEqual(plan.after,[1,9,10,11]);assert.equal(plan.remaining,4);
  p.team_order=plan.after;assert.equal(selectedTrainingPlan(p,['Species 2','Species 3','Species 4','Species 5'],catalog,new Map()).changed,false);
});
test('best completed copies block weaker copies; ties are stable and missing species are reported',()=>{
  const p=player();p.miscrits.find(m=>m.id===9).level=30;
  let plan=selectedTrainingPlan(p,['Species 2','Species 5'],catalog,new Map());
  assert.deepEqual(plan.complete,['Species 2']);assert.deepEqual(plan.missing,['Species 5']);assert.equal(plan.traineeIds.length,0);
  p.miscrits.find(m=>m.id===9).level=1;p.miscrits.push(crit(8,2,10,3));
  assert.deepEqual(selectedTrainingPlan(p,['Species 2'],catalog,new Map()).traineeIds,[8]);
  assert.throws(()=>selectedTrainingPlan({...p,team_order:[1,1]},['Species 2'],catalog,new Map()));
});
test('selected training confirms team first, then trains with XP even when general auto level-up is off',async()=>{
  const {engine,p,calls}=harness({autoLevel:false});p.miscrits.find(m=>m.id===9).exp=10;
  await engine.tick();assert.deepEqual(calls.map(c=>c[0]),['get_player','update_team','get_player']);assert.deepEqual(engine.player.team_order,[1,9,3,4]);
  engine.nextCycle=0;await engine.tick();assert.equal(engine.player.miscrits.find(m=>m.id===9).level,2);
  assert.deepEqual(calls.find(c=>c[0]==='xp_train')[1],{miscritId:9,currLevel:1});
  assert.equal(calls.some(c=>['create_battle','plat_train','token_train','add_bonus'].includes(c[0])),false);
});
test('selected teammates stop at level 30 even if general training and level-35 replacement are enabled',async()=>{
  const {engine,p,calls}=harness({autoLevel:true,autoReplace:true});p.team_order=[1,9,3,4];const m=p.miscrits.find(m=>m.id===9);m.level=29;m.exp=protocol.training_xp[29];
  await engine.tick();assert.equal(engine.player.miscrits.find(m=>m.id===9).level,30);
  m.exp=protocol.training_xp[30];engine.nextCycle=0;await engine.tick();
  assert.equal(calls.filter(c=>c[0]==='xp_train').length,1);assert.equal(calls.some(c=>c[0]==='update_team'),false);
});
test('finished trainees rotate out for the next selected family; unlisted and weaker copies are not selected',()=>{
  const p=player();p.team_order=[1,9,3,4];p.miscrits.find(m=>m.id===9).level=30;p.miscrits.push(crit(10,5,1,3));
  const plan=selectedTrainingPlan(p,['Species 2','Species 5'],catalog,new Map());
  assert.deepEqual(plan.after,[1,10,3,4]);assert.deepEqual(plan.traineeIds,[10]);
});
test('late team acknowledgement after pause confirms selection without training or starting a battle',async()=>{
  const {engine,p,calls,responses}=harness();let release;
  responses.update_team=payload=>new Promise(resolve=>release=()=>{p.team_order=payload.team;resolve({});});
  const pending=engine.tick();await new Promise(resolve=>setImmediate(resolve));await engine.tick();engine.stop();release();await pending;
  assert.equal(engine.running,false);assert.deepEqual(engine.player.team_order,[1,9,3,4]);
  assert.equal(calls.filter(c=>c[0]==='update_team').length,1);assert.equal(calls.some(c=>['xp_train','create_battle'].includes(c[0])),false);
});
test('rejected, timed-out or stale selected-team saves never train or start another battle',async()=>{
  for(const outcome of ['reject','timeout','stale']){
    const {engine,calls,responses}=harness();responses.update_team=()=>{if(outcome!=='stale')throw new GameError('Team save rejected',outcome==='timeout');return {};};
    await engine.tick();await engine.tick();assert.equal(engine.running,false);assert.equal(engine.uncertain,outcome!=='reject');
    assert.equal(calls.filter(c=>c[0]==='update_team').length,1);assert.equal(calls.some(c=>['xp_train','create_battle'].includes(c[0])),false);
  }
});
test('newly kept species is excluded from further captures before the final roster refresh',async()=>{
  const {engine,calls}=harness({trainSelected:false});engine.battle={...battle(5),id:'b',pending:true,keepSent:true,awaitingAction:true};
  engine.battle.foe.miscrits[0].captured=true;engine.battle.player.miscrits[0].turnStatuses={};
  await engine.receive('b',11,{user_id:'me',actions:[],next_turn:'me'});
  assert.deepEqual(engine.battle.keptFamilies,[5]);
  engine.battle.foe.miscrits[0]={id:100,mId:5,hp:100,chp:100,attempts:0};engine.battle.pending=false;engine.battle.awaitingAction=false;engine.battle.acted=-1;engine.config.fleeUnwanted=true;
  await engine.combat();assert.equal(calls.some(c=>c[0]==='send'&&c[2]===10),false);assert.equal(calls.some(c=>c[0]==='send'&&c[2]===4),true);
});
test('empty selected-training list prevents starting and snapshot remains readable with invalid team',()=>{
  const {engine}=harness({replacementNames:[]});engine.running=false;assert.throws(()=>engine.start(),/replacement list/);
  engine.player.team_order=[];assert.match(engine.snapshot().selectedTraining.error,/Team is not fully loaded/);
});
test('Exotic species are selected before other tiers, while lower-rated copies go to the capture queue',()=>{
  const tiers={...catalog,species:catalog.species.map(s=>({...s,rarity:({2:'Common',3:'Exotic',4:'Legendary',5:'Rare'})[s.id]||'Common'}))};
  const p=player();p.miscrits.push(crit(10,3,1,3),crit(11,4,1,3),crit(12,5,1,3));p.team_order=[1];
  const names=['Species 2','Species 3','Species 4','Species 5'];
  let plan=selectedTrainingPlan(p,names,tiers,new Map());assert.deepEqual(plan.after,[1,10,12,9]);
  p.miscrits.find(m=>m.id===10).hp=1; // Exotic now rates 16: skip training and seek a better copy.
  plan=selectedTrainingPlan(p,names,tiers,new Map());assert.deepEqual(plan.after,[1,12,9,11]);assert.deepEqual(plan.needsCapture,['Species 3']);
  p.miscrits.find(m=>m.id===10).hp=2; // 17 meets the minimum exactly.
  plan=selectedTrainingPlan(p,names,tiers,new Map());assert.equal(plan.after[1],10);assert.equal(plan.minimumRating,17);
});
test('a listed species with no rating-17 copy can be captured as an upgrade even if already owned',()=>{
  const b=battle(2),context={families:new Set([2]),upgrades:new Set([2]),trainOwned:false};
  b.foe.miscrits[0].rating=15;assert.equal(decision(b,config,catalog,context).action,'flee');
  b.foe.miscrits[0].rating=17;assert.equal(decision(b,config,catalog,context).action,'capture');
  context.upgrades.clear();assert.equal(decision(b,config,catalog,context).action,'flee');
});
test('unqualified listed species create a capture route even with an empty hunt list',async()=>{
  const {engine,p,calls}=harness({names:[]});p.miscrits.find(m=>m.id===9).hp=0;
  engine.running=false;engine.start();await engine.tick();
  assert.equal(calls.some(c=>c[0]==='update_team'),false);assert.equal(calls.some(c=>c[0]==='create_battle'),true);
  assert.deepEqual(engine.snapshot().selectedTraining.needsCapture,['Species 2']);
});
test('an Exotic trainee gets earned-XP training before a Common teammate already in an earlier slot',async()=>{
  const {engine,p,calls}=harness({replacementNames:['Species 2','Species 3']});
  engine.catalog={...catalog,species:catalog.species.map(s=>({...s,rarity:s.id===3?'Exotic':'Common'}))};
  p.miscrits.push(crit(10,3,1,3,10));p.miscrits.find(m=>m.id===9).exp=10;p.team_order=[1,9,10,4];
  await engine.tick();assert.deepEqual(calls.find(c=>c[0]==='xp_train')[1],{miscritId:10,currLevel:1});
  assert.deepEqual(engine.player.team_order,[1,9,10,4]);
});
test('a kept qualifying upgrade is not captured again in the same battle before roster refresh',async()=>{
  const {engine,calls}=harness({replacementNames:['Species 5']});
  engine.battle={...battle(5),id:'b',pending:true,keepSent:true,awaitingAction:true};
  Object.assign(engine.battle.foe.miscrits[0],{captured:true,rating:17});engine.battle.player.miscrits[0].turnStatuses={};
  await engine.receive('b',11,{user_id:'me',actions:[],next_turn:'me'});
  engine.battle.foe.miscrits[0]={id:100,mId:5,hp:100,chp:100,attempts:0,rating:18};engine.battle.pending=false;engine.battle.awaitingAction=false;engine.battle.acted=-1;
  await engine.combat();assert.equal(calls.some(c=>c[0]==='send'&&c[2]===10),false);assert.equal(calls.some(c=>c[0]==='send'&&c[2]===4),true);
});
test('selected species provide a training search route when no separate hunt target was chosen',async()=>{
  const {engine,p,calls}=harness({names:[]});p.team_order=[1,9,3,4];
  engine.running=false;engine.start();await engine.tick();assert.equal(calls.some(c=>c[0]==='create_battle'),true);
  assert.equal(engine.running,true);
});
