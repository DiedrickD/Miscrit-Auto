import test from 'node:test';
import assert from 'node:assert/strict';
import {settings,DEFAULTS,owned,rotationPlan,routePlan,abilities,decision,atSearchLocation} from '../lib/model.mjs';
const catalog={teleports:{forest:{},moon:{ticket:'moon'},mount_gemma:{requirement:'boss'}},species:[{id:1,name:'Flue',names:['Flue'],stops:[{location:'forest',area_id:1,object_id:0,days:[]}]},{id:2,name:'Rocapez',names:['Rocapez'],stops:[{location:'moon',area_id:1,object_id:3,days:[1]}]}]};
test('settings validate names, numeric bounds, modes and boolean values',()=>{
  assert.deepEqual(settings({names:['flue','Flue']},catalog).names,['Flue']);
  for(const value of [{names:['Unknown']},{names:'Flue'},{minRating:19},{captureThreshold:0},{campaignLimit:11},{maxAttacks:0},{autoReplace:'yes'},{activity:'exploit'},{mode:'unknown'}]) assert.throws(()=>settings(value,catalog));
});
const crit=(id,level,rating=2,mId=1)=>({id,mId,level,hp:rating,spd:rating,ea:rating,ed:rating,pa:rating,pd:rating,chp:50});
test('owned versions use stat ratings rather than current HP',()=>{
  assert.equal(owned(crit(1,35)).rating,12);
  assert.deepEqual(owned({v:2,id:4,m:2,l:7,c:999,h:1,s:2,e:3,p:0,d:2,pd:2,n:'Roca'}),{id:4,mId:2,level:7,chp:999,rating:10,name:'Roca'});
});
test('rotation keeps slot one, excludes active and max-level copies, sorts rating then ID',()=>{
  const player={team_order:[1,2,3,4],miscrits:[crit(1,35),crit(2,35),crit(3,34),crit(4,35),crit(11,1,3),crit(10,4,3),crit(12,35,3),crit(13,3,1,2)]};
  assert.deepEqual(rotationPlan(player,['Flue'],catalog,new Map()).after,[1,10,3,11]);
  assert.deepEqual(rotationPlan(player,[],catalog,new Map()).after,[1,2,3,4]);
  assert.throws(()=>rotationPlan({...player,team_order:[1,1]},['Flue'],catalog,new Map()));
});
test('routes respect schedules, unlocks, ticket ownership and deduplicate objects',()=>{
  assert.equal(routePlan({...DEFAULTS,names:['Flue','Rocapez']},{tickets:{}},catalog,1).stops.length,1);
  assert.equal(routePlan({...DEFAULTS,names:['Rocapez']},{tickets:{moon:true}},catalog,1).stops.length,1);
  assert.equal(routePlan({...DEFAULTS,names:['Rocapez']},{tickets:{moon:true}},catalog,2).stops.length,0);
});
test('ability order and unlock thresholds match native constants, including fractional levels',()=>{
  const metadata=new Map([[1,{ability_order:[4,3,2,1],abilities:[{id:1},{id:2},{id:3},{id:4,cooldown:2}]}]]);
  const member={id:9,mId:1,level:4.5};
  assert.deepEqual(abilities(member,{cooldowns:{9:{3:2}}},metadata,{level_keys:[0,1,4,7]}).map(a=>[a.id,a.recharge]),[[4,0],[3,2],[2,0]]);
});
function battle(){return {type:'Wild',player:{user_id:'me',miscrits:[{id:1,hp:100,chp:100,abilities:[{id:1,type:'Attack',target:'Foe',ap:10,recharge:0,nativeCooldown:0},{id:2,type:'Attack',ap:40,recharge:0,nativeCooldown:0}]}]},foe:{user_id:'Wild',miscrits:[{id:5,mId:1,chp:100,hp:100,rating:18,attempts:0}]},nextTurn:'me',attacks:0,captureChance:70,damage:{}};}
test('manual target stops, unwanted targets flee, fight mode never captures',()=>{
  const b=battle();assert.equal(decision(b,{...DEFAULTS,names:['Flue']},catalog).action,'manual');
  assert.equal(decision(b,{...DEFAULTS,names:['Rocapez']},catalog).action,'flee');
  assert.deepEqual(decision(b,{...DEFAULTS,mode:'fight'},catalog),{action:'ability',id:2});
});
test('capture honors server chance, observed damage guard and free attempt limit',()=>{
  const b=battle(),config={...DEFAULTS,mode:'capture_targeted',names:['Flue']};
  assert.equal(decision(b,config,catalog).action,'capture');
  b.foe.miscrits[0].attempts=1;assert.equal(decision(b,config,catalog).action,'flee');
  b.foe.miscrits[0].attempts=0;b.captureChance=30;assert.deepEqual(decision(b,config,catalog),{action:'ability',id:1});
  b.damage={'1:5:1':60,'1:5:2':100};assert.equal(decision(b,config,catalog).action,'flee');
  b.captureChance=null;assert.equal(decision(b,config,catalog).action,'stop');
  b.nextTurn='Wild';assert.equal(decision(b,config,catalog),null);
});
test('search location uses server location ID or normalized display name',()=>{
  const stop={location:'forest',area_id:2},protocol={locations:{forest:2}};
  assert.equal(atSearchLocation({area_id:2,location:{id:2,name:'Forest'}},stop,protocol),true);
  assert.equal(atSearchLocation({area_id:'2',location:{name:'Forest'}},stop,protocol),true);
  assert.equal(atSearchLocation({area_id:1,location:{id:2}},stop,protocol),false);
  assert.equal(atSearchLocation({area_id:2,location:{id:3}},stop,protocol),false);
});
test('manual target handoff does not wait for player turn; handicapped automation waits',()=>{
  const b=battle();b.nextTurn='Wild';assert.equal(decision(b,{...DEFAULTS,names:['Flue']},catalog).action,'manual');
  b.nextTurn='me';b.player.miscrits[0].handicap=true;assert.equal(decision(b,{...DEFAULTS,mode:'fight'},catalog),null);
});
test('unsafe measured damage cannot be bypassed by an unmeasured stronger attack',()=>{
  const b=battle();b.captureChance=30;b.damage={'1:5:1':50};
  assert.equal(decision(b,{...DEFAULTS,mode:'capture_targeted',names:['Flue']},catalog).action,'flee');
  b.player.miscrits[0].abilities[1].element='Water';
  assert.equal(decision(b,{...DEFAULTS,mode:'capture_targeted',names:['Flue']},catalog).action,'flee');
});
