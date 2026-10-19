// Relative utility, not an exact server damage simulator. Unknown opponent stats stay unknown.
const grades={Weak:1,Moderate:2,Strong:3,Max:4,Elite:5};
const active=(member,type)=>Boolean(member.arenaEffects?.[type]&&member.arenaEffects[type].turns!==0);
export function elementMultiplier(ability,attacker,defender,metadata,protocol){
  const element=ability.element;if(!element||['Physical','Misc'].includes(element)||ability.true_dmg)return 1;
  const types=(metadata.get(defender.mId)?.element||'').match(/[A-Z][a-z]+/g)||[],weakness=protocol.element_weakness||{};
  if(!defender.negated&&types.some(type=>weakness[type]===element))return 2;
  if(!attacker.negated&&types.includes(weakness[element]))return .5;
  return 1;
}
function profile(member,key,metadata){return grades[metadata.get(member.mId)?.[key]]||3;}
function attackScore(a,from,to,metadata,protocol){
  const chance=Math.max(0,Math.min(100,a.accuracy??100))/100;
  const physical=a.element==='Physical',offense=profile(from,physical?'pa':'ea',metadata),defense=profile(to,physical?'pd':'ed',metadata);
  return Math.max(0,a.ap||0)*Math.max(1,a.times||1)*chance*elementMultiplier(a,from,to,metadata,protocol)*(a.true_dmg?1:Math.sqrt(offense/defense));
}
function available(member){return (member.abilities||[]).filter(a=>a.recharge===0&&a.remaining!==0);}
function attacks(member){return available(member).filter(a=>a.type==='Attack'&&(a.target||'Foe')==='Foe');}
export function arenaDecision(battle,metadata,protocol){
  const own=battle.player?.miscrits?.[0],foe=battle.foe?.miscrits?.[0];
  if(!own||!foe||battle.winner||battle.pending||own.chp<=0||foe.chp<=0||own.handicap||battle.nextTurn!==battle.player.user_id)return null;
  const hp=Math.max(.01,own.chp/own.hp),enemyHp=foe.chp/foe.hp;
  const score=a=>attackScore(a,own,foe,metadata,protocol),ownAttacks=attacks(own),enemyAttacks=attacks(foe);
  const threat=Math.max(0,...enemyAttacks.map(a=>attackScore(a,foe,own,metadata,protocol)));
  const bestAttack=Math.max(0,...ownAttacks.map(score));
  const choices=[];
  for(const a of available(own)){
    const chance=Math.max(0,Math.min(100,a.accuracy??100))/100,target=a.target||'Foe';let value=0,reason='';
    if(a.type==='Attack'&&target==='Foe'){
      value=score(a);reason='Attack: elemental matchup, stat profile, accuracy and hit count.';
      const measured=battle.arenaDamage?.[`${own.id}:${foe.id}:${a.id}`];
      if(measured>0&&measured*.85>=foe.chp&&chance>=.9){value+=1000;reason='Likely finish based on damage observed against this opponent.';}
      for(const effect of a.additional||[])if(effect.type==='Heal'&&effect.target==='Self'&&Number.isFinite(effect.ap)&&!active(own,'Antiheal'))value+=Math.min(own.hp-own.chp,effect.ap)*chance*(hp<.4?1.3:.5);
    }else if(a.type==='Heal'&&target==='Self'&&!active(own,'Antiheal')&&hp<.6){
      value=Math.min(own.hp-own.chp,Math.max(0,a.ap||0))*chance*(hp<.3?2.5:1.5);reason='Heal while injured; avoid overhealing and antiheal.';
    }else if(['Poison','Dot'].includes(a.type)&&target==='Foe'&&!active(foe,a.type)&&enemyHp>.35){
      value=Math.max(0,a.ap||0)*Math.min(3,Math.max(0,a.turns||0))*chance*.8*elementMultiplier(a,own,foe,metadata,protocol);reason='Apply damage over time once against a healthy opponent.';
    }else if(['Sleep','Confuse'].includes(a.type)&&target==='Foe'&&!foe.handicap&&!active(foe,a.type==='Sleep'?'SI':'CI')&&enemyHp>.3){
      value=threat*Math.min(2,Math.max(0,a.turns||0))*chance*.8;reason='Control the opponent when expected prevented damage is useful.';
    }else if(a.type==='Negate'&&target==='Self'&&!own.negated&&hp>.3){
      const dangerous=enemyAttacks.filter(move=>elementMultiplier(move,foe,own,metadata,protocol)>1);
      value=Math.max(0,...dangerous.map(move=>attackScore(move,foe,own,metadata,protocol)))*.85;reason='Remove an exposed elemental weakness.';
    }else if(a.type==='Cleanser'&&target==='Self'){
      const ailments=['Poison','Dot','Bleed','Disease','Antiheal','Paralyze'].filter(type=>active(own,type));
      value=ailments.length*bestAttack*.7*chance;reason='Cleanse active harmful effects.';
    }
    if(value>0)choices.push({action:'ability',id:a.id,score:value,reason});
  }
  choices.sort((a,b)=>b.score-a.score||a.id-b.id);
  const current=choices[0];
  // Do not assume speed-control/double turns. Switching costs a turn and can incur a native penalty.
  if(!own.paralyzed&&!battle.arenaSwitchedSinceAttack&&(battle.player.switches||0)<3&&(!current||hp<.25)){
    const options=battle.player.miscrits.slice(1).filter(m=>m.chp>0&&m.chp/m.hp>.45).map(member=>{
      const incoming=Math.max(0,...enemyAttacks.map(a=>attackScore(a,foe,member,metadata,protocol)));
      const outgoing=Math.max(0,...attacks(member).map(a=>attackScore(a,member,foe,metadata,protocol)));
      return {member,incoming,outgoing};
    }).sort((a,b)=>(b.outgoing-b.incoming)-(a.outgoing-a.incoming)||a.member.id-b.member.id);
    const better=options.find(o=>!current||(threat>0&&o.incoming<threat*.65&&o.outgoing>=bestAttack));
    if(better&&!(current?.score>=1000))return {action:'switch',id:better.member.id,reason:current?'Preserve a critically injured teammate with a healthier, safer matchup.':'Switch to a healthy teammate while usable attacks are unavailable.'};
  }
  if(current){const {score,...choice}=current;return choice;}
  return {action:'stop',reason:'No usable arena attack or safe alternative. Take over in Live battle.'};
}
