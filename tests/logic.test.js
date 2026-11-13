import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignLayout,currentCrossing,crossingResult,newProgress,advance,fail,startCampaign} from '../src/game/levels.js';
import {initialState,validateState,backupText,restoreText,readState,writeState,KEY} from '../src/state.js';
test('campaign generation deterministic and variable',()=>{
 assert.deepEqual(campaignLayout(123),campaignLayout(123));
 const lengths=new Set(Array.from({length:30},(_,i)=>campaignLayout(i).map(e=>e.crossings.length).join(',')));
 assert.ok(lengths.size>1);
 const c=campaignLayout(123)[0].crossings[0];
 assert.equal(crossingResult(c.gap-1,c),false);
 assert.equal(crossingResult(c.gap,c),true);
 assert.equal(crossingResult(c.gap+68,c),true);
 assert.equal(crossingResult(c.gap+69,c),false);
});
test('three expedition restarts shared across entire campaign',()=>{
 let p=newProgress(123);const first=currentCrossing(p);
 for(let i=2;i>=0;i--){const r=fail(p);assert.equal(r.event,'expedition-restart');p=r.progress;assert.equal(p.restartsLeft,i);assert.equal(p.crossing,0);assert.deepEqual(currentCrossing(p),first);}
 const r=fail(p);assert.equal(r.event,'campaign-lost');assert.equal(r.progress.status,'lost');assert.equal(r.progress.campaignsLost,1);
});
test('crossing advancement, expedition and campaign victory',()=>{
 let p=newProgress(42);const layout=campaignLayout(42);let count=0;
 for(let e=0;e<layout.length;e++)for(let c=0;c<layout[e].crossings.length;c++){
  const r=advance(p);p=r.progress;count++;
 }
 assert.ok(count>3);assert.equal(p.status,'won');assert.equal(p.campaignsWon,1);assert.equal(startCampaign(p,99).restartsLeft,3);
});
test('backup validates before restoration',()=>{
 const state=initialState();assert.deepEqual(restoreText(backupText(state)),state);
 assert.throws(()=>restoreText('{'));assert.throws(()=>restoreText(JSON.stringify({appId:'other',formatVersion:2,data:state})));
 assert.throws(()=>validateState({...state,schemaVersion:9}));
});
test('legacy save migrates safely',()=>{
 const old={schemaVersion:1,settings:{sound:false},games:{jungleQuest:{level:2,highestCompleted:1,seed:123,generatorVersion:1}}};
 const updated=validateState(old);assert.equal(updated.schemaVersion,2);assert.equal(updated.games.jungleQuest.status,'active');
});
test('corrupt local storage remains untouched',()=>{
 const m=new Map([[KEY,'{broken']]);const storage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};
 const {state,error}=readState(storage);assert.equal(state,null);assert.match(error,/could not be loaded/);assert.equal(m.get(KEY),'{broken');
 const valid=initialState();writeState(valid,storage);assert.deepEqual(readState(storage).state,valid);
});