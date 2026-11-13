import {newProgress,campaignLayout,GENERATOR_VERSION,hash32} from './game/levels.js';
export const KEY='tiny-town-adventures-save-v1';
export const APP_ID='tiny-town-adventures';
export function initialState(){return {schemaVersion:2,settings:{sound:false},games:{jungleQuest:newProgress()}};}
export function validateState(data){
 if(!data||typeof data!=='object'||![1,2].includes(data.schemaVersion)||typeof data.settings?.sound!=='boolean'||!data.games?.jungleQuest)throw Error('Unsupported or invalid save format');
 const p=data.games.jungleQuest;
 if(data.schemaVersion===1){
  if(!Number.isSafeInteger(p.level)||p.level<1||p.level>1000000||!Number.isSafeInteger(p.seed)||p.seed<0||p.seed>0xffffffff||![1,2].includes(p.generatorVersion))throw Error('Invalid legacy progress');
  const migrated=newProgress(hash32(p.seed^p.level));
  return {schemaVersion:2,settings:{sound:data.settings.sound},games:{jungleQuest:migrated}};
 }
 if(p.generatorVersion!==GENERATOR_VERSION||!Number.isSafeInteger(p.seed)||p.seed<0||p.seed>0xffffffff||!Number.isSafeInteger(p.expedition)||!Number.isSafeInteger(p.crossing)||!Number.isSafeInteger(p.restartsLeft)||p.restartsLeft<0||p.restartsLeft>3||!['active','won','lost'].includes(p.status)||!Number.isSafeInteger(p.campaignsWon)||p.campaignsWon<0||!Number.isSafeInteger(p.campaignsLost)||p.campaignsLost<0)throw Error('Invalid campaign progress');
 const layout=campaignLayout(p.seed);
 if(p.status==='active'&&(p.expedition<0||p.expedition>=layout.length||p.crossing<0||p.crossing>=layout[p.expedition].crossings.length))throw Error('Invalid active crossing');
 if(p.status==='won'&&(p.expedition!==layout.length||p.crossing!==0))throw Error('Invalid campaign victory');
 if(p.status==='lost'&&(p.expedition<0||p.expedition>=layout.length||p.crossing<0||p.crossing>=layout[p.expedition].crossings.length||p.restartsLeft!==0))throw Error('Invalid campaign defeat');
 return {schemaVersion:2,settings:{sound:data.settings.sound},games:{jungleQuest:{seed:p.seed,generatorVersion:p.generatorVersion,expedition:p.expedition,crossing:p.crossing,restartsLeft:p.restartsLeft,status:p.status,campaignsWon:p.campaignsWon,campaignsLost:p.campaignsLost}}};
}
export function readState(storage=localStorage){
 const raw=storage.getItem(KEY);if(raw===null)return {state:initialState(),error:null};
 try{return {state:validateState(JSON.parse(raw)),error:null};}catch(error){return {state:null,error:`Saved progress could not be loaded: ${error.message}. No data has been erased.`};}
}
export function writeState(state,storage=localStorage){const validated=validateState(state);storage.setItem(KEY,JSON.stringify(validated));return validated;}
export function backupText(state){return JSON.stringify({appId:APP_ID,formatVersion:2,createdAt:new Date().toISOString(),data:validateState(state)},null,2);}
export function restoreText(text){const parsed=JSON.parse(text);if(!parsed||parsed.appId!==APP_ID||![1,2].includes(parsed.formatVersion))throw Error('Not a supported Tiny Town Adventures backup');return validateState(parsed.data);}
