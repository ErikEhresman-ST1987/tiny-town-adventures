import Phaser from 'phaser';
import { JungleScene } from './game/JungleScene.js';
import { BubbleScene } from './game/BubbleScene.js';
import { advance, fail, startCampaign } from './game/levels.js';
import { readState, writeState, backupText, restoreText } from './state.js';
import './style.css';
const $ = id => document.getElementById(id);
let {state, error} = readState();
let game = null, outcome = null, active = false, mode = 'jungle';
const status = message => { $('status').textContent = message; };
if(error){status(error);$('play').disabled=true;$('play-bubble').disabled=true;} else status('Choose a game to begin.');
function persist(next){try{state=writeState(next);return true;}catch(e){status('Save failed: '+e.message);return false;}}
function destroyGame(){document.body.classList.remove('playing');if(game){game.destroy(true);game=null;}active=false;}
function showMenu(){destroyGame();$('retry').hidden=true;if(state){const p=state.games.jungleQuest;$('play').innerHTML=p.status==='active'?'🚙 Jungle Quest <small>Continue campaign</small>':'🚙 Jungle Quest <small>New campaign</small>';$('play-bubble').innerHTML='🍬 Bubble Gum Drop <small>Level '+state.games.bubbleGumDrop.level+'</small>';}$('game-screen').hidden=true;$('menu').hidden=false;$('next').hidden=true;status(error||'Choose a game to begin.');}
function showGame(){mode='jungle';if(!state)return;if(state.games.jungleQuest.status!=='active'){status('Campaign finished. Start a new campaign.');return;}destroyGame();$('retry').hidden=true;$('menu').hidden=true;$('game-screen').hidden=false;$('next').hidden=true;outcome=null;active=true;document.body.classList.add('playing');status('Hold on the game to grow a bridge, then release.');
 game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:390,height:700,backgroundColor:'#9bd8ef',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:2},scene:[],render:{antialias:true}});
 game.events.once(Phaser.Core.Events.READY,()=>game.scene.add('JungleQuest',JungleScene,true,{
  progress:state.games.jungleQuest,
  onAdvance:()=>{
   if(!active)return false;
   const transition=advance(state.games.jungleQuest);
   const next=structuredClone(state);next.games.jungleQuest=transition.progress;
   return persist(next);
  },
  onResult:result=>{
   if(!active)return;
   outcome=result;
   if(result==='lost'){
    const transition=fail(state.games.jungleQuest);
    const next=structuredClone(state);next.games.jungleQuest=transition.progress;
    if(!persist(next)){active=false;return;}
    if(transition.event==='expedition-restart'){
     status(`Expedition restarting. ${transition.progress.restartsLeft} restarts remaining.`);
     showGame();
     return;
    }
    $('next').hidden=false;$('next').textContent='New campaign';
    status('Campaign lost. All three expedition restarts were used.');
    return;
   }
   const p=state.games.jungleQuest;
   $('next').hidden=false;
   $('next').textContent=p.status==='won'?'New campaign':'Next expedition';
   status(p.status==='won'?'Campaign complete!':'Expedition complete! Continue to the next expedition.');
  }
 }));
}
function showBubble(){
 if(!state)return;
 destroyGame();mode='bubble';outcome=null;active=true;
 $('retry').hidden=true;$('next').hidden=true;$('menu').hidden=true;$('game-screen').hidden=false;
 document.body.classList.add('playing');
 status('Swipe to rotate the tower. Avoid red sections. Three drops earn one smash.');
 game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:390,height:700,backgroundColor:'#e8faff',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:2},scene:[],render:{antialias:true}});
 game.events.once(Phaser.Core.Events.READY,()=>game.scene.add('BubbleGumDrop',BubbleScene,true,{
  level:state.games.bubbleGumDrop.level,
  onResult:({result,score})=>{
   if(!active)return;
   outcome=result;
   if(result==='won'){
    const next=structuredClone(state),p=next.games.bubbleGumDrop;
    p.level++;p.bestLevel=Math.max(p.bestLevel,p.level);p.score+=score;
    if(!persist(next)){active=false;return;}
    $('next').hidden=false;$('next').textContent='Next tower';
    status('Tower cleared! Ready for the next level.');
   }else{
    $('retry').hidden=false;status('Red zone! Retry the tower.');
   }
  }
 }));
}
$('play-bubble').addEventListener('click',showBubble);
$('play').addEventListener('click',()=>{if(!state)return;if(state.games.jungleQuest.status!=='active'){const next=structuredClone(state);next.games.jungleQuest=startCampaign(state.games.jungleQuest);if(!persist(next))return;}showGame();});
$('retry').addEventListener('click',()=>mode==='bubble'?showBubble():showGame());
$('next').addEventListener('click',()=>{if(!outcome||!state)return;if(mode==='bubble'){showBubble();return;}if(state.games.jungleQuest.status!=='active'){const next=structuredClone(state);next.games.jungleQuest=startCampaign(state.games.jungleQuest);if(!persist(next))return;}showGame();});
$('home').addEventListener('click',showMenu);
$('backup').addEventListener('click',()=>{if(!state)return;const blob=new Blob([backupText(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='tiny-town-adventures-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('restore').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>2_000_000){status('Backup is too large.');return;}try{const candidate=restoreText(await file.text());if(!window.confirm('Replace current progress with this backup?'))return;if(!persist(candidate))return;error=null;$('play').disabled=false;$('play-bubble').disabled=false;showMenu();status('Backup restored successfully.');}catch(e){status('Restore rejected: '+e.message);}});
const base=import.meta.env.BASE_URL;
if('serviceWorker' in navigator && import.meta.env.PROD){window.addEventListener('load',()=>navigator.serviceWorker.register(base+'sw.js',{scope:base,updateViaCache:'none'}).catch(e=>$('offline-status').textContent='Offline setup unavailable: '+e.message));}
$('check-updates').addEventListener('click',async()=>{if(!('serviceWorker' in navigator)){status('Offline updates not supported by this browser.');return;}try{const reg=await navigator.serviceWorker.getRegistration(base);if(!reg){status('Offline app not installed yet.');return;}await reg.update();status('Update checked. Reopen the app when ready to load a newer release.');}catch(e){status('Update check failed: '+e.message);}});