import Phaser from 'phaser';
import {WORLD,campaignLayout,crossingResult} from './levels.js';
const W=390,H=700,Y=480,P=WORLD.pillarWidth;
export class JungleScene extends Phaser.Scene{
 constructor(){super('JungleQuest');}
 init(data){this.progress={...data.progress};this.onResult=data.onResult;this.onAdvance=data.onAdvance;}
 create(){
  this.phase='ready';this.bridgeLength=0;
  const layout=campaignLayout(this.progress.seed);
  this.crossings=layout[this.progress.expedition].crossings;
  this.positions=[65];
  for(const crossing of this.crossings)this.positions.push(this.positions.at(-1)+P+crossing.gap);
  this.index=this.progress.crossing;
  this.cameras.main.setBackgroundColor('#a2e0ed');
  const background=this.add.graphics().setScrollFactor(0.25);
  background.fillStyle(0xffefb3);background.fillCircle(320,105,39);
  for(let x=-100;x<this.positions.at(-1)+700;x+=160){
   background.fillStyle(0x8ad0a4);background.fillEllipse(x+60,550,260,190);
   background.fillStyle(0x4c9d79);background.fillEllipse(x+30,610,240,160);
   background.fillStyle(0x387a57);background.fillRect(x+50,355,12,220);
   background.fillStyle(0x2e8b60);background.fillCircle(x+56,348,32);
  }
  const pillars=this.add.graphics();
  for(const x of this.positions){
   pillars.fillStyle(0x6d7273);pillars.fillRect(x,Y,P,H-Y);
   pillars.fillStyle(0xb4b6a2);pillars.fillRoundedRect(x-3,Y-8,P+6,14,4);
  }
  const destination=this.positions.at(-1)+P/2;
  this.add.text(destination,Y-65,'🏛️',{fontSize:'46px'}).setOrigin(.5);
  this.bridge=this.add.graphics();
  this.truck=this.add.container(this.positions[this.index]+30,Y-27);
  const body=this.add.graphics();
  body.fillStyle(0xff8d5c);body.fillRoundedRect(-20,-18,39,19,5);
  body.fillStyle(0xffdf8e);body.fillRoundedRect(-10,-29,19,14,4);
  body.fillStyle(0x304a53);body.fillCircle(-11,3,6);body.fillCircle(12,3,6);
  this.truck.add(body);
  this.add.text(W/2,25,'JUNGLE QUEST',{fontFamily:'system-ui',fontSize:'25px',fontStyle:'bold',color:'#194b38'}).setOrigin(.5).setScrollFactor(0);
  this.progressText=this.add.text(W/2,65,'',{fontFamily:'system-ui',fontSize:'16px',color:'#194b38'}).setOrigin(.5).setScrollFactor(0);
  this.restartsText=this.add.text(W/2,94,'',{fontFamily:'system-ui',fontSize:'16px',color:'#194b38'}).setOrigin(.5).setScrollFactor(0);
  this.hint=this.add.text(W/2,135,'HOLD to grow the bridge\nRELEASE to lower it',{fontFamily:'system-ui',fontSize:'18px',align:'center',color:'#163f36',backgroundColor:'#ffffffdd',padding:{x:10,y:8}}).setOrigin(.5).setScrollFactor(0);
  this.updateLabels(layout.length);
  this.cameras.main.scrollX=this.positions[this.index]-65;
  this.input.on('pointerdown',this.startHold,this);
  this.input.on('pointerup',this.release,this);
  this.input.on('pointerupoutside',this.release,this);
  this.events.once('shutdown',()=>{
   this.input.off('pointerdown',this.startHold,this);
   this.input.off('pointerup',this.release,this);
   this.input.off('pointerupoutside',this.release,this);
  });
 }
 updateLabels(total){this.progressText.setText(`Expedition ${this.progress.expedition+1}/${total} · Crossing ${this.index+1}/${this.crossings.length}`);this.restartsText.setText(`Restarts remaining: ${this.progress.restartsLeft}`);}
 startHold(){if(this.phase!=='ready')return;this.phase='growing';this.bridgeLength=0;this.hint.setText('Release when the bridge looks right');}
 release(){if(this.phase!=='growing')return;this.phase='dropping';const length=this.bridgeLength;
  this.tweens.addCounter({from:-90,to:0,duration:430,ease:'Cubic.easeOut',onUpdate:t=>this.drawBridge(length,Phaser.Math.DegToRad(t.getValue())),onComplete:()=>this.cross(length)});
 }
 drawBridge(length,angle=0){const x=this.positions[this.index]+P;this.bridge.clear();this.bridge.lineStyle(9,0x9a673b,1);this.bridge.beginPath();this.bridge.moveTo(x,Y-9);this.bridge.lineTo(x+Math.cos(angle)*length,Y-9+Math.sin(angle)*length);this.bridge.strokePath();}
 update(_time,delta){if(this.phase==='growing'){this.bridgeLength=Math.min(290,this.bridgeLength+Math.min(delta,60)*.15);this.drawBridge(this.bridgeLength,-Math.PI/2);if(this.bridgeLength>=290)this.release();}}
 cross(length){
  this.phase='crossing';
  const nextX=this.positions[this.index+1]+30;
  const successful=crossingResult(length,this.crossings[this.index]);
  const endX=successful?nextX:this.positions[this.index]+P+length+18;
  this.tweens.add({targets:this.truck,x:endX,duration:950,ease:'Linear',onComplete:()=>{
   if(!successful){this.phase='lost';this.hint.setText('Parachute deployed!\nExpedition failed');this.parachuteFall();return;}
   this.bridge.clear();
   // Persist each successful crossing before the camera continues.
   if(this.onAdvance&&!this.onAdvance()) {this.phase='halted';return;}
   this.index++;
   if(this.index===this.crossings.length){this.phase='finished';this.hint.setText('Expedition complete! 🎉');this.onResult('expedition');return;}
   this.phase='scrolling';
   this.hint.setText('Onward through the jungle!');
   this.tweens.add({targets:this.cameras.main,scrollX:this.positions[this.index]-65,duration:780,ease:'Sine.easeInOut',onComplete:()=>{
    this.phase='ready';this.bridgeLength=0;this.updateLabels(campaignLayout(this.progress.seed).length);
    this.hint.setText('HOLD to grow the bridge\nRELEASE to lower it');
   }});
  }});
 }
 parachuteFall(){
  this.tweens.add({targets:this.truck,y:this.truck.y+52,angle:18,duration:240,ease:'Quad.easeIn',onComplete:()=>{
   const canopy=this.add.graphics();
   canopy.fillStyle(0xfff0a3);canopy.fillEllipse(0,-94,104,50);
   canopy.fillStyle(0xf77f76);canopy.fillEllipse(-28,-95,35,43);canopy.fillEllipse(28,-95,35,43);
   canopy.lineStyle(2,0x6b5143);canopy.lineBetween(-50,-94,-15,-25);canopy.lineBetween(50,-94,15,-25);canopy.lineBetween(0,-95,0,-25);
   this.truck.addAt(canopy,0);
   this.tweens.add({targets:this.truck,y:H+85,angle:0,duration:1700,ease:'Sine.easeInOut',onComplete:()=>this.onResult('lost')});
  }});
 }
}
