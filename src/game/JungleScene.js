import Phaser from 'phaser';
import { WORLD, currentCrossing, crossingResult, campaignLayout } from './levels.js';
const W = WORLD.width, H = WORLD.height, Y = 480;
export class JungleScene extends Phaser.Scene {
 constructor(){super('JungleQuest');}
 init(data){this.progress = data.progress;this.onResult=data.onResult;}
 create(){
  this.phase='ready';this.bridgeLength=0;this.level=currentCrossing(this.progress);
  this.cameras.main.setBackgroundColor('#a2e0ed');
  const g=this.add.graphics();g.fillStyle(0xffefb3);g.fillCircle(318,96,38);g.fillStyle(0x8ad0a4);g.fillEllipse(190,555,560,220);g.fillStyle(0x4c9d79);g.fillEllipse(50,590,250,180);g.fillEllipse(335,585,290,200);
  for(let i=0;i<10;i++){const x=(i*83+11)%W;g.fillStyle(0x387a57);g.fillRect(x,345,10,230);g.fillStyle(0x2e8b60);g.fillCircle(x+5,340,31);}
  this.left=65;this.right=this.left+WORLD.pillarWidth+this.level.gap;this.pillarTop=Y;
  this.pillars=this.add.graphics();this.pillars.fillStyle(0x6d7273);this.pillars.fillRect(this.left,Y,68,H-Y);this.pillars.fillRect(this.right,Y,68,H-Y);this.pillars.fillStyle(0xb4b6a2);this.pillars.fillRoundedRect(this.left-3,Y-8,74,14,4);this.pillars.fillRoundedRect(this.right-3,Y-8,74,14,4);
  this.bridge=this.add.graphics();
  this.truck=this.add.container(this.left+30,Y-27);const body=this.add.graphics();body.fillStyle(0xff8d5c);body.fillRoundedRect(-20,-18,39,19,5);body.fillStyle(0xffdf8e);body.fillRoundedRect(-10,-29,19,14,4);body.fillStyle(0x304a53);body.fillCircle(-11,3,6);body.fillCircle(12,3,6);this.truck.add(body);
  this.add.text(W/2,26,'JUNGLE QUEST',{fontFamily:'system-ui',fontSize:'26px',fontStyle:'bold',color:'#194b38'}).setOrigin(.5);
  this.add.text(W/2,67,`Expedition ${this.progress.expedition+1}/${campaignLayout(this.progress.seed).length} · Crossing ${this.progress.crossing+1}/${campaignLayout(this.progress.seed)[this.progress.expedition].crossings.length}`,{fontFamily:'system-ui',fontSize:'16px',color:'#194b38'}).setOrigin(.5);
  this.add.text(W/2,94,`Restarts remaining: ${this.progress.restartsLeft}`,{fontFamily:'system-ui',fontSize:'16px',color:'#194b38'}).setOrigin(.5);this.hint=this.add.text(W/2,126,'HOLD to grow the bridge\nRELEASE to lower it',{fontFamily:'system-ui',fontSize:'19px',align:'center',color:'#163f36',backgroundColor:'#ffffffdd',padding:{x:12,y:10}}).setOrigin(.5);
  this.input.on('pointerdown',this.startHold,this);this.input.on('pointerup',this.release,this);this.input.on('pointerupoutside',this.release,this);this.events.once('shutdown',()=>{this.input.off('pointerdown',this.startHold,this);this.input.off('pointerup',this.release,this);this.input.off('pointerupoutside',this.release,this);});
 }
 startHold(){if(this.phase!=='ready')return;this.phase='growing';this.hint.setText('Release when the bridge looks right');}
 release(){if(this.phase!=='growing')return;this.phase='dropping';const length=this.bridgeLength;this.tweens.addCounter({from:-90,to:0,duration:430,ease:'Cubic.easeOut',onUpdate:t=>this.drawBridge(length,Phaser.Math.DegToRad(t.getValue())),onComplete:()=>this.cross(length)});}
 drawBridge(length,angle=0){const x=this.left+68;this.bridge.clear();this.bridge.lineStyle(9,0x9a673b,1);this.bridge.beginPath();this.bridge.moveTo(x,Y-9);this.bridge.lineTo(x+Math.cos(angle)*length,Y-9+Math.sin(angle)*length);this.bridge.strokePath();}
 update(_time,delta){if(this.phase==='growing'){this.bridgeLength=Math.min(290,this.bridgeLength+delta*.15);this.drawBridge(this.bridgeLength,-Math.PI/2);if(this.bridgeLength>=290)this.release();}}
 cross(length){this.phase='crossing';const targetX=this.left+68+length+18;this.tweens.add({targets:this.truck,x:targetX,duration:950,ease:'Linear',onComplete:()=>{if(crossingResult(length,this.level)){this.phase='won';this.hint.setText('Great crossing! 🎉');this.onResult('won');}else{this.phase='lost';this.hint.setText('Oops! Try that bridge again');this.tweens.add({targets:this.truck,y:H+60,angle:35,duration:620,ease:'Quad.easeIn',onComplete:()=>this.onResult('lost')});}}});}
}