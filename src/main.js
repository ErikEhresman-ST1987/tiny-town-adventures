import Phaser from 'phaser';
import { JungleScene } from './game/JungleScene.js';
import { complete } from './game/levels.js';
import { readState, writeState, backupText, restoreText } from './state.js';
import './style.css';
const $ = id => document.getElementById(id);
let {state, error} = readState();
let game = null, outcome = null, active = false;
const status = message => { $('status').textContent = message; };
if(error){status(error);$('play').disabled=true;} else status('Choose a game to begin.');
function persist(next){try{state=writeState(next);return true;}catch(e){status('Save failed: '+e.message);return false;}}
function destroyGame(){if(game){game.destroy(true);game=null;}active=false;}
function showMenu(){destroyGame();$('game-screen').hidden=true;$('menu').hidden=false;$('next').hidden=true;status(error||'Choose a game to begin.');}
function showGame(){if(!state)return;destroyGame();$('menu').hidden=true;$('game-screen').hidden=false;$('next').hidden=true;outcome=null;active=true;status('Hold on the game to grow a bridge, then release.');
 game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:390,height:700,backgroundColor:'#9bd8ef',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:2},scene:[],render:{antialias:true}});
 game.events.once(Phaser.Core.Events.READY,()=>game.scene.add('JungleQuest',JungleScene,true,{progress:state.games.jungleQuest,onResult:result=>{if(!active)return;outcome=result;$('next').hidden=result!=='won';status(result==='won'?'Bridge crossed! Continue to the next level.':'The crossing failed. Retry the same level.');}}));
}
$('play').addEventListener('click',showGame);
$('retry').addEventListener('click',showGame);
$('next').addEventListener('click',()=>{if(outcome!=='won'||!state)return;const next=structuredClone(state);next.games.jungleQuest=complete(state.games.jungleQuest);if(persist(next))showGame();});
$('home').addEventListener('click',showMenu);
$('backup').addEventListener('click',()=>{if(!state)return;const blob=new Blob([backupText(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='tiny-town-adventures-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('restore').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>2_000_000){status('Backup is too large.');return;}try{const candidate=restoreText(await file.text());if(!window.confirm('Replace current progress with this backup?'))return;if(!persist(candidate))return;error=null;$('play').disabled=false;showMenu();status('Backup restored successfully.');}catch(e){status('Restore rejected: '+e.message);}});
const base=import.meta.env.BASE_URL;
if('serviceWorker' in navigator && import.meta.env.PROD){window.addEventListener('load',()=>navigator.serviceWorker.register(base+'sw.js',{scope:base,updateViaCache:'none'}).catch(e=>$('offline-status').textContent='Offline setup unavailable: '+e.message));}
$('check-updates').addEventListener('click',async()=>{if(!('serviceWorker' in navigator)){status('Offline updates not supported by this browser.');return;}try{const reg=await navigator.serviceWorker.getRegistration(base);if(!reg){status('Offline app not installed yet.');return;}await reg.update();status('Update checked. Reopen the app when ready to load a newer release.');}catch(e){status('Update check failed: '+e.message);}});