import {owned} from './model.mjs';
export const ARENAS=Object.freeze({Default:{name:'Battle Arena',rpc:'get_battle_arena'},Platinum:{name:'Platinum Arena',rpc:'get_platinum_arena'},Random:{name:'Random Arena',rpc:'get_random_arena'}});
export const isArena=type=>Object.hasOwn(ARENAS,type);
export function arenaTotals(type,payload){
  if(!isArena(type))throw new Error('Choose a supported arena.');
  const info=payload?.info||{},stats=info.stats||info,prefix={Default:'ba',Platinum:'pa',Random:'ra'}[type];
  const count=value=>Number.isSafeInteger(value)&&value>=0?value:null;
  return {type,name:ARENAS[type].name,totalWins:count(stats[prefix+'_wins']),totalLosses:count(stats[prefix+'_losses']),
    periodWins:type==='Default'?count(stats.ba_weekly_wins):type==='Random'?count(stats.ra_monthly_wins):null,
    periodLabel:type==='Default'?'Weekly wins':type==='Random'?'Monthly wins':null,
    streak:type==='Platinum'?count(info.pa_streak):null,bestStreak:type==='Platinum'?count(info.pa_max_streak):null,
    updatedAt:new Date().toISOString(),error:null};
}
export function arenaEligibility(player,type,metadata,rules,{allowInjured=false}={}){
  if(!isArena(type))throw new Error('Choose a supported arena.');
  if(type==='Random')return {eligible:true,points:null,message:'Random Arena provides a drafted team; your collection team is unchanged.'};
  const team=player?.team_order||[],members=team.map(id=>player.miscrits.find(m=>Number(m.id)===id)).filter(Boolean).map(m=>owned(m,metadata));
  if(team.length!==4||members.length!==4||new Set(team).size!==4)throw new Error('Arena requires a full team of four Miscrits.');
  if(new Set(members.map(m=>m.mId)).size!==4)throw new Error('Arena requires four different species. Duplicate copies are not allowed.');
  if(members.some(m=>!Number.isFinite(m.chp)||m.chp<0))throw new Error('Arena team HP is unavailable. Reload account data.');
  if(members.every(m=>m.chp<=0))throw new Error('All arena teammates have fainted. Heal the team before joining.');
  let points=null;
  if(type==='Platinum'){
    if(members.some(m=>m.level!==35))throw new Error('Platinum Arena requires all four teammates at level 35.');
    const values=members.map(m=>rules?.rating_points?.[metadata.get(m.mId)?.rarity]);
    if(values.some(p=>!Number.isInteger(p)))throw new Error('Platinum Arena rarity points are unavailable. Reload official game data.');
    points=values.reduce((sum,p)=>sum+p,0);
    if(points>12)throw new Error('Platinum Arena team exceeds 12 rarity points ('+points+'). Change the team first.');
    // The native client asks before queuing an injured team. Here this is an explicit saved preference.
    if(!allowInjured&&members.some(m=>m.chp<=0))throw new Error('Platinum Arena has fainted teammates. Heal first or enable joining with an injured team.');
  }
  return {eligible:true,points,message:ARENAS[type].name+' team checks passed. HP is refreshed from the arena before queueing.'};
}
export function draftChoices(pool,banned,metadata,count){
  if(!Array.isArray(pool)||pool.some(id=>!Number.isInteger(id)||id<=0)||new Set(pool).size!==pool.length)throw new Error('Random Arena sent an invalid species pool.');
  const candidates=pool.filter(id=>!banned.includes(id));
  if(candidates.length<count)throw new Error('Random Arena has too few available species.');
  const grade={Weak:1,Moderate:2,Strong:3,Max:4,Elite:5},rarity={Common:1,Rare:2,Epic:3,Exotic:4,Legendary:5};
  const elements=id=>(metadata.get(id)?.element||'').match(/[A-Z][a-z]+/g)||[];
  const quality=id=>{
    const m=metadata.get(id)||{},moves=(m.abilities||[]).map(a=>({...a,ap:(a.ap||0)+(a.enchant?.ap||0),accuracy:(a.accuracy??100)+(a.enchant?.accuracy||0)})),hit=moves.filter(a=>a.type==='Attack').map(a=>Math.max(0,a.ap||0)*Math.max(1,a.times||1)*Math.min(100,a.accuracy??100)/100).sort((a,b)=>b-a);
    return (hit[0]||0)*.45+(hit[1]||0)*.15+Math.max(grade[m.ea]||0,grade[m.pa]||0)*2+['hp','ed','pd'].reduce((n,k)=>n+(grade[m[k]]||0),0)*1.4+(grade[m.spd]||0)*.5+
      (moves.some(a=>a.type==='Heal')?5:0)+(moves.some(a=>['Poison','Dot','Bleed'].includes(a.type))?5:0)+(moves.some(a=>a.type==='Negate')?3:0)+(rarity[m.rarity]||0)*.1;
  };
  const chosen=[];
  while(chosen.length<count){
    const covered=new Set(chosen.flatMap(elements));
    const score=id=>quality(id)+(count===4?elements(id).reduce((sum,e)=>sum+(covered.has(e)?-4:5),0):0);
    candidates.sort((a,b)=>score(b)-score(a)||a-b);chosen.push(candidates.shift());
  }
  return chosen;
}
