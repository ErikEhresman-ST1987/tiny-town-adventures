export const RINGS=14;
export const SPACING=132;
export const GAP_WIDTH=0.73;
const TAU=Math.PI*2;
export function wrap(a){return ((a%TAU)+TAU)%TAU;}
export function angularDistance(a,b){const d=wrap(a-b);return Math.min(d,TAU-d);}
export function hash(n){let x=n>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);return (x^(x>>>16))>>>0;}
export function ringAt(level,index){
 const h=hash(Math.imul(level,0x9e3779b1)^Math.imul(index+1,0x85ebca6b));
 const gap=wrap((h%6283)/1000);
 const hazard=wrap(gap+1.35+((h>>>12)%2200)/1000);
 const green=wrap(gap+3.6+((h>>>21)%1000)/1000);
 return {gap,hazard,green};
}
export function segmentAt(ring,angle){
 if(angularDistance(angle,ring.gap)<GAP_WIDTH/2)return 'gap';
 if(angularDistance(angle,ring.hazard)<0.39)return 'red';
 if(angularDistance(angle,ring.green)<0.33)return 'green';
 return 'normal';
}
export function landing(segment,streak){
 if(segment==='gap')return {kind:'drop',streak:Math.min(3,streak+1)};
 if(streak>=3)return {kind:'smash',streak:0};
 if(segment==='red')return {kind:'lost',streak:0};
 return {kind:'bounce',streak:0,bonus:segment==='green'?100:0};
}
export function newBubbleProgress(){return {level:1,bestLevel:1,score:0};}
export function validateBubbleProgress(p){
 if(!p||!Number.isSafeInteger(p.level)||p.level<1||p.level>100000||!Number.isSafeInteger(p.bestLevel)||p.bestLevel<p.level||p.bestLevel>100000||!Number.isSafeInteger(p.score)||p.score<0||p.score>1e12)throw Error('Invalid Bubble Gum Drop progress');
 return {level:p.level,bestLevel:p.bestLevel,score:p.score};
}
