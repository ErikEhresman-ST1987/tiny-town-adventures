import Phaser from 'phaser';
import {RINGS,SPACING,ringAt,segmentAt,landing,wrap} from './bubbleLogic.js';
const W=390,H=700,CX=195,TAU=Math.PI*2,FRONT=Math.PI/2;
const COLORS={normal:0xffce68,red:0xf34b64,green:0x56dba1,gap:0x000000};
export class BubbleScene extends Phaser.Scene{
 constructor(){super('BubbleGumDrop');}
 init(data){this.level=data.level;this.onResult=data.onResult;}
 create(){
  this.cameras.main.setBackgroundColor('#e8faff');
  this.rings=Array.from({length:RINGS},(_,i)=>({...ringAt(this.level,i),y:270+i*SPACING,broken:false}));
  this.rotation=0;this.streak=0;this.score=0;this.phase='play';this.vy=0;this.ballY=125;this.ballRadius=17;
  this.sky=this.add.graphics().setScrollFactor(0);
  this.sky.fillStyle(0xe8faff).fillRect(0,0,W,H);
  this.sky.fillStyle(0xfff5db).fillCircle(345,115,48);
  this.tower=this.add.graphics();this.ball=this.add.graphics();
  this.ball.fillStyle(0xf87db8).fillCircle(0,0,17);
  this.ball.lineStyle(3,0xffffff).strokeCircle(0,0,17);
  this.ball.fillStyle(0xffffff,0.8).fillEllipse(-6,-7,9,6);
  this.ball.setPosition(CX,this.ballY);
  this.title=this.add.text(CX,22,'BUBBLE GUM DROP',{fontFamily:'system-ui',fontStyle:'bold',fontSize:'23px',color:'#305a73'}).setOrigin(.5).setScrollFactor(0).setDepth(5);
  this.info=this.add.text(CX,59,'',{fontFamily:'system-ui',fontSize:'16px',color:'#305a73'}).setOrigin(.5).setScrollFactor(0).setDepth(5);
  this.hint=this.add.text(CX,110,'Swipe left or right to rotate the tower',{fontFamily:'system-ui',fontSize:'14px',color:'#31576d',backgroundColor:'#ffffffcc',padding:{x:9,y:6}}).setOrigin(.5).setScrollFactor(0).setDepth(5);
  this.left=this.add.text(32,H-58,'◀',{fontFamily:'system-ui',fontSize:'34px',color:'#305a73',backgroundColor:'#ffffffbb',padding:{x:14,y:7}}).setOrigin(0,.5).setScrollFactor(0).setDepth(6).setInteractive();
  this.right=this.add.text(W-32,H-58,'▶',{fontFamily:'system-ui',fontSize:'34px',color:'#305a73',backgroundColor:'#ffffffbb',padding:{x:14,y:7}}).setOrigin(1,.5).setScrollFactor(0).setDepth(6).setInteractive();
  this.hold=0;this.dragX=null;
  this.left.on('pointerdown',()=>this.hold=-1);
  this.right.on('pointerdown',()=>this.hold=1);
  this.input.on('pointerdown',p=>{if(p.y<H-105)this.dragX=p.x;});
  this.input.on('pointermove',p=>{if(this.dragX===null||!p.isDown||this.phase!=='play')return;const dx=p.x-this.dragX;this.rotation=wrap(this.rotation+dx*0.012);this.dragX=p.x;});
  this.input.on('pointerup',()=>{this.hold=0;this.dragX=null;});
  this.input.on('pointerupoutside',()=>{this.hold=0;this.dragX=null;});
  this.keys=this.input.keyboard?.addKeys('LEFT,RIGHT');
  this.events.once('shutdown',()=>{this.hold=0;this.dragX=null;});
  this.drawTower();this.updateInfo();
 }
 updateInfo(){this.info.setText(`Level ${this.level}   •   Score ${this.score}   •   Drops ${this.streak}/3`);}
 drawTower(){
  const g=this.tower;g.clear();
  const top=Math.max(0,this.cameras.main.scrollY-120),bottom=this.cameras.main.scrollY+H+120;
  g.fillStyle(0xb7c8e6);g.fillRoundedRect(CX-32,220,64,RINGS*SPACING+200,12);
  g.fillStyle(0xd8e3f3);g.fillRect(CX-25,220,14,RINGS*SPACING+200);
  for(const r of this.rings){
   if(r.broken||r.y<top||r.y>bottom)continue;
   // Draw the back half first, then the front half, using perspective-compressed rings.
   for(let half=0;half<2;half++){
    for(let j=0;j<36;j++){
     const a=half===0?Math.PI+j*Math.PI/36:j*Math.PI/36;
     const b=a+Math.PI/36;
     const type=segmentAt(r,wrap((a+b)/2-this.rotation));
     if(type==='gap')continue;
     const color=COLORS[type];
     const x1=CX+Math.cos(a)*139,x2=CX+Math.cos(b)*139;
     const y1=r.y+Math.sin(a)*30,y2=r.y+Math.sin(b)*30;
     const ix1=CX+Math.cos(a)*44,ix2=CX+Math.cos(b)*44;
     const iy1=r.y+Math.sin(a)*11,iy2=r.y+Math.sin(b)*11;
     g.fillStyle(color);
     g.fillPoints([{x:x1,y:y1},{x:x2,y:y2},{x:ix2,y:iy2},{x:ix1,y:iy1}],true);
     if(half===1){
      g.fillStyle(Phaser.Display.Color.ValueToColor(color).darken(19).color);
      g.fillPoints([{x:x1,y:y1},{x:x2,y:y2},{x:x2,y:y2+10},{x:x1,y:y1+10}],true);
     }
    }
   }
  }
  const goalY=270+RINGS*SPACING;
  g.fillStyle(0x5dd8a6);g.fillRoundedRect(CX-110,goalY,220,22,9);
  g.fillStyle(0xffffff);g.fillCircle(CX,goalY-15,11);
 }
 finish(result){if(this.phase!=='play')return;this.phase=result;this.hint.setText(result==='won'?'Sweet! Tower cleared! 🎉':'Oh no! Red zone!');this.onResult?.({result,score:this.score});}
 update(_time,delta){
  if(this.phase!=='play')return;
  const dt=Math.min(delta,40)/1000;
  let dir=this.hold;
  if(this.keys?.LEFT.isDown)dir=-1;
  if(this.keys?.RIGHT.isDown)dir=1;
  if(dir)this.rotation=wrap(this.rotation+dir*2.5*dt);
  const previousFoot=this.ballY+this.ballRadius;
  this.vy=Math.min(1050,this.vy+1250*dt);
  this.ballY+=this.vy*dt;
  const foot=this.ballY+this.ballRadius;
  if(this.vy>0){
   for(const r of this.rings){
    const surface=r.y+30;
    if(r.broken||previousFoot>surface||foot<surface)continue;
    const type=segmentAt(r,wrap(FRONT-this.rotation));
    const action=landing(type,this.streak);
    this.streak=action.streak;
    if(action.kind==='lost'){this.ballY=surface-this.ballRadius;this.finish('lost');break;}
    if(action.kind==='bounce'){
     this.ballY=surface-this.ballRadius;this.vy=-390;this.score+=10+(action.bonus||0);this.hint.setText(type==='green'?'Green bonus! +100':'Keep rotating to find an opening');
    }else if(action.kind==='drop'){this.score+=25;this.hint.setText(this.streak===3?'SMASH READY!':'Clean drop!');}
    else if(action.kind==='smash'){r.broken=true;this.score+=150;this.hint.setText('SMASH! +150');}
    this.updateInfo();
    break;
   }
  }
  if(this.phase==='play'&&foot>270+RINGS*SPACING)this.finish('won');
  this.ball.setY(this.ballY);
  this.cameras.main.scrollY=Math.max(0,this.ballY-250);
  this.drawTower();
 }
}
