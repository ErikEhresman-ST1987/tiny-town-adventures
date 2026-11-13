export const GENERATOR_VERSION = 2;
export const WORLD = Object.freeze({width:390,height:700,pillarWidth:68,truckWidth:36});
export function hash32(n){let x=n>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);return (x^(x>>>16))>>>0;}
export function makeLevel(level,seed=hash32(level*1949+41),generatorVersion=1){
 if(!Number.isSafeInteger(level)||level<1||level>1000000)throw Error('Invalid level');
 if(generatorVersion!==1&&generatorVersion!==2)throw Error('Unsupported generator');
 if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid seed');
 const gap=72+(hash32(seed)%Math.min(119,45+level*3));
 return {level,seed,generatorVersion,gap,targetWidth:68,minLength:gap,maxLength:gap+68};
}
export function crossingResult(length,level){return Number.isFinite(length)&&length>=level.minLength&&length<=level.maxLength;}
export function campaignLayout(seed){
 if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid campaign seed');
 const expeditionCount=3+hash32(seed+11)%4;
 return Array.from({length:expeditionCount},(_,e)=>({
  crossings:Array.from({length:3+hash32(seed+e*97+19)%5},(_,c)=>{
   const s=hash32(seed^Math.imul(e+1,0x9e3779b1)^Math.imul(c+1,0x85ebca6b));
   const gap=65+(s%119);
   return {gap,minLength:gap,maxLength:gap+68,targetWidth:68,seed:s};
  })
 }));
}
export function newProgress(seed=hash32(Date.now()^Math.floor(Math.random()*0xffffffff))){
 const layout=campaignLayout(seed);
 return {seed,generatorVersion:GENERATOR_VERSION,expedition:0,crossing:0,restartsLeft:3,status:'active',campaignsWon:0,campaignsLost:0};
}
export function currentCrossing(p){return campaignLayout(p.seed)[p.expedition]?.crossings[p.crossing]??null;}
export function advance(p){
 if(p.status!=='active'||!currentCrossing(p))throw Error('No active crossing');
 const layout=campaignLayout(p.seed),next={...p};
 if(p.crossing+1<layout[p.expedition].crossings.length){next.crossing++;return {progress:next,event:'crossing'};}
 next.crossing=0;next.expedition++;
 if(next.expedition===layout.length){next.status='won';next.campaignsWon++;return {progress:next,event:'campaign-won'};}
 return {progress:next,event:'expedition'};
}
export function fail(p){
 if(p.status!=='active'||!currentCrossing(p))throw Error('No active crossing');
 const next={...p};
 if(next.restartsLeft===0){next.status='lost';next.campaignsLost++;return {progress:next,event:'campaign-lost'};}
 next.restartsLeft--;next.crossing=0;return {progress:next,event:'expedition-restart'};
}
export function startCampaign(p,seed=hash32(Date.now()^Math.floor(Math.random()*0xffffffff))){
 return {...newProgress(seed),campaignsWon:p.campaignsWon,campaignsLost:p.campaignsLost};
}
