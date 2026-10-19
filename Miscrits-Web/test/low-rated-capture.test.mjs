import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,settings,decision,selectedTrainingPlan} from '../lib/model.mjs';
const catalog={species:[{id:1,name:'Target',rarity:'Exotic'}]};
const config={...DEFAULTS,mode:'capture_targeted',names:['Target'],minRating:16};
function battle(){return {type:'Wild',player:{user_id:'me',miscrits:[{id:1,hp:100,chp:100,abilities:[]}]},foe:{user_id:'Wild',miscrits:[{id:9,mId:1,rating:10,hp:100,chp:100,attempts:0}]},nextTurn:'me',captureChance:80,attacks:0,damage:{}};}
test('low-rated target capture defaults off and only accepts a boolean',()=>{
  assert.equal(settings({},catalog).captureLowRatedTargets,false);
  assert.equal(settings({captureLowRatedTargets:true},catalog).captureLowRatedTargets,true);
  assert.throws(()=>settings({captureLowRatedTargets:'true'},catalog));
});
test('enabled override permits low-rated hunt targets while retaining free-capture and turn checks',()=>{
  const b=battle();assert.equal(decision(b,config,catalog).action,'flee');
  const enabled={...config,captureLowRatedTargets:true};assert.equal(decision(b,enabled,catalog).action,'capture');
  b.foe.miscrits[0].attempts=1;assert.equal(decision(b,enabled,catalog).action,'flee');
  b.foe.miscrits[0].attempts=0;b.nextTurn='Wild';assert.equal(decision(b,enabled,catalog),null);
});
test('low-rated tier upgrade targets can be captured without capturing unrelated owned families',()=>{
  const b=battle(),c={...config,mode:'capture_missing',captureLowRatedTargets:true},context={families:new Set([1]),upgrades:new Set([1])};
  assert.equal(decision(b,c,catalog,context).action,'capture');
  context.upgrades.clear();assert.equal(decision(b,c,catalog,context).action,'flee');
  context.families.clear();assert.equal(decision(b,c,catalog,context).action,'capture');
});
test('low-rated captures remain ineligible for S16 training and cannot bypass completed-family prevention',()=>{
  const raw={id:9,mId:1,level:1,hp:2,spd:2,ea:2,ed:2,pa:2,pd:2};
  const player={team_order:[5],miscrits:[{...raw,id:5,mId:2,level:35},raw]};
  let plan=selectedTrainingPlan(player,['Target'],catalog,new Map(),{});assert.equal(plan.traineeIds.length,0);assert.deepEqual(plan.needsCapture,['Target']);
  plan=selectedTrainingPlan(player,['Target'],catalog,new Map(),{1:{complete:true}});assert.equal(plan.traineeIds.length,0);assert.equal(plan.needsCapture.length,0);
});
