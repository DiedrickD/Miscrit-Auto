import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {WebSocketServer} from '../vendor/ws/wrapper.mjs';
import {Transport} from '../lib/transport.mjs';
import {Engine} from '../lib/engine.mjs';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function fixture(){
  const server=new WebSocketServer({port:0,host:'127.0.0.1'});await once(server,'listening');
  const frames=[];
  server.on('connection',socket=>socket.on('message',raw=>{const message=JSON.parse(raw);frames.push(message);if(message.ping){socket.close(1000);return;}if(message.rpc?.id==='get_player')socket.send(JSON.stringify({cid:message.cid,rpc:{payload:JSON.stringify({success:true,data:'{}'})}}));}));
  return {server,frames,url:`ws://127.0.0.1:${server.address().port}`,close:async()=>{for(const client of server.clients)client.terminate();await new Promise(resolve=>server.close(resolve));}};
}
test('keepalive uses acknowledged control frames, never unsupported JSON ping',async()=>{
  const f=await fixture(),transport=new Transport(()=>{},()=>{});
  try{
    await transport.connect(f.url);await transport.rpc('get_player');await sleep(20);
    assert.equal(transport.connected,true);assert.equal(transport.heartbeatsSent,1);assert.equal(transport.heartbeatsAcknowledged,1);
    assert.equal(f.frames.some(frame=>frame.ping),false);
    assert.equal(transport.pending.size,0);
  }finally{transport.close();await f.close();}
});
test('closing before open rejects login promptly instead of leaving it hanging',async()=>{
  class Socket extends EventTarget{constructor(){super();this.readyState=0;queueMicrotask(()=>{this.readyState=3;this.dispatchEvent(new Event('close'));});}close(){}}
  const transport=new Transport(()=>{},()=>{},fetch,Socket);
  await assert.rejects(()=>transport.connect('ws://test'),/before login completed/);transport.close();
});
test('delayed close events from old sockets cannot close the new connection or sign-out message',async()=>{
  const f=await fixture(),closed=[],transport=new Transport(()=>{},message=>closed.push(message));
  try{
    await transport.connect(f.url);const old=transport.socket;await transport.connect(f.url);await sleep(25);
    assert.equal(transport.connected,true);assert.equal(closed.length,0);assert.notEqual(transport.socket,old);
    transport.close();await sleep(20);assert.equal(closed.length,0);assert.equal(transport.session,null);
  }finally{transport.close();await f.close();}
});
test('refresh keeps credentials in memory, rejects stale results after sign-out, and coalesces recovery',async()=>{
  const f=await fixture();let refreshes=0;
  const fetcher=async url=>url.includes('session/refresh')?(refreshes++,{ok:true,json:async()=>({token:'renewed',refresh_token:'refreshed'})}):{ok:true,json:async()=>({server:'127.0.0.1'})};
  const transport=new Transport(()=>{},()=>{},fetcher);transport.session={token:'old',refresh_token:'refresh'};transport.socketURL=async()=>f.url;
  try{
    await Promise.all([transport.reconnect(),transport.reconnect()]);assert.equal(refreshes,1);assert.equal(transport.session.token,'renewed');assert.equal(transport.connected,true);
    let release;transport.http=()=>new Promise(resolve=>release=resolve);const pending=transport.refreshSession(true);transport.close();release({token:'late'});
    await assert.rejects(pending,/cancelled/);assert.equal(transport.session,null);
  }finally{transport.close();await f.close();}
});
function harness(){
  const catalog={teleports:{},species:[]},protocol={level_keys:[]};
  const engine=new Engine({catalog,protocol});
  engine.player={user_id:'me',team_order:[],miscrits:[]};
  const calls=[];const transport={connected:false,reconnect:async()=>{calls.push('connect');transport.connected=true;},rpc:async id=>id==='get_player_seen'?{}:{user_id:'me',team_order:[],miscrits:[],battle:'restored'},join:async id=>calls.push(['join',id]),close:()=>calls.push('close')};engine.transport=transport;
  return {engine,transport,calls};
}
test('recovery reloads authoritative battle and preserves manual pause, without replaying attacks',async()=>{
  const {engine,calls}=harness();engine.battle={id:'restored',manual:true,awaitingAction:false};engine.running=true;
  engine.disconnected('Lost connection.',{code:1006});await engine.recoveryPromise;
  assert.equal(engine.running,false);assert.equal(engine.battle.id,'restored');assert.equal(engine.battle.manual,true);assert.equal(engine.reconnecting,false);assert.equal(engine.uncertain,false);assert.deepEqual(calls,['connect',['join','restored']]);
});
test('uncertain actions remain blocked after a recovered connection',async()=>{
  const {engine}=harness();engine.battle={id:'old',awaitingAction:true};engine.disconnected('Lost connection.',{});await engine.recoveryPromise;
  assert.equal(engine.uncertain,true);assert.equal(engine.running,false);assert.throws(()=>engine.start(),/uncertain/);
});
test('cancelled recovery cannot overwrite a signed-out account',async()=>{
  const {engine,transport}=harness();let release;transport.reconnect=()=>new Promise(resolve=>release=resolve);
  const pending=engine.reconnect();await engine.logout();release();await pending;
  assert.equal(engine.player,null);assert.equal(engine.transport,null);assert.equal(engine.status,'Signed out.');assert.equal(engine.reconnecting,false);
});
