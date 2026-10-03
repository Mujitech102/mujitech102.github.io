/* Lightweight monochrome layered electric-field animation; no dependencies. */
(()=>{'use strict';if(document.getElementById('muji-electric-canvas'))return;
const c=document.createElement('canvas');c.id='muji-electric-canvas';c.setAttribute('aria-hidden','true');document.body.prepend(c);
const x=c.getContext('2d',{alpha:true});if(!x)return;let w=0,h=0,dpr=1,frame=0,mouse={x:.5,y:.5},running=true;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);x.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resize,{passive:true});window.addEventListener('pointermove',e=>{mouse.x=e.clientX/Math.max(1,w);mouse.y=e.clientY/Math.max(1,h)},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&running)requestAnimationFrame(draw)});resize();
function draw(){if(document.hidden)return;x.clearRect(0,0,w,h);const t=reduced?0:frame*.008;const layers=w<700?5:9;
for(let k=0;k<layers;k++){const depth=k/(layers-1);const mid=h*(.12+depth*.84);const amp=(20+depth*85)*(w<700?.5:1);const drift=(mouse.y-.5)*amp*.3;
x.beginPath();for(let px=-10;px<=w+10;px+=5){const phase=px/Math.max(w,1)*Math.PI*(2.2+depth*2);const y=mid+Math.sin(phase+t*(.48+depth*.2)+k*.9)*amp*.55+Math.sin(phase*1.9-t*.3+k)*amp*.24+drift;
if(px===-10)x.moveTo(px,y);else x.lineTo(px,y)}x.lineWidth=.6+depth*.65;x.strokeStyle=`rgba(0,0,0,${.04+depth*.045})`;x.stroke();
if(k%3===0){x.save();x.setLineDash([1.5,9]);x.lineWidth=.75;x.strokeStyle='rgba(0,0,0,.10)';x.stroke();x.restore()}}
if(!reduced){frame++;requestAnimationFrame(draw)}}requestAnimationFrame(draw);
})();
