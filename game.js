const foil = document.querySelector('#foil');
const coat = foil.getContext('2d', {willReadFrequently:true});
const result = document.querySelector('#result');
const message = document.querySelector('#message');
const action = document.querySelector('#action');
let revealed=false, pointer=null, previous=null;
function drawFoilWatermark(){
  const pixels = [
    '11110 11110 11111',
    '10001 10001 00001',
    '10001 10001 00010',
    '11110 10001 00100',
    '10001 10001 01000',
    '10001 10001 10000',
    '11110 11110 11111'
  ];
  const stamp = document.createElement('canvas');
  stamp.width = 54;
  stamp.height = 28;
  const ink = stamp.getContext('2d');
  ink.fillStyle = '#443c37';
  ink.beginPath();
  pixels.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '1') ink.rect(x * 2, Math.round(y * 1.65), 3, 3);
    }
  });
  ink.fill();
  coat.save();
  coat.globalAlpha = 0.30;
  coat.rotate(-Math.PI / 9);
  coat.fillStyle = coat.createPattern(stamp, 'repeat');
  const reach = Math.ceil(Math.hypot(foil.width, foil.height));
  coat.fillRect(-reach, -reach, reach * 2, reach * 2);
  coat.restore();
}
function newTicket(number, mission, target){
  revealed=false;
  pointer=null;
  action.hidden=false;
  document.querySelector('#gift').hidden=true;
  const recipient=document.createElement('strong');
  const label=document.createElement('small');
  label.textContent='내 마니또';
  recipient.textContent=target;
  const instruction=document.createElement('span');
  instruction.textContent=mission;
  result.replaceChildren(label,recipient,instruction);
  result.setAttribute('aria-hidden','true');
  document.querySelector('#number').textContent='NO. '+number;
  coat.globalCompositeOperation='source-over';
  foil.width=Math.max(1,Math.round(foil.clientWidth));
  foil.height=Math.max(1,Math.round(foil.clientHeight));
  const metal=coat.createLinearGradient(0,0,foil.width,foil.height*.6);
  ['#90959b','#e2e5e6','#a1a5aa','#d2d5d7','#969ba0'].forEach((color,i)=>metal.addColorStop(i/4,color));
  coat.fillStyle=metal;
  coat.fillRect(0,0,foil.width,foil.height);
  for(let i=0;i<foil.width*foil.height/10;i++){
    coat.fillStyle=i%2?'rgba(255,255,255,.30)':'rgba(38,40,44,.14)';
    coat.fillRect(Math.random()*foil.width,Math.random()*foil.height,1+Math.random()*3,1);
  }
  drawFoilWatermark();
  coat.globalCompositeOperation='destination-out';
  message.textContent='은박을 문질러 미션을 확인하세요.';
  action.textContent='한 번에 긁기';
}
function reveal(){
  revealed=true;
  pointer=null;
  coat.clearRect(0,0,foil.width,foil.height);
  // Fine scraps around the perimeter leave the exposed print readable.
  coat.globalCompositeOperation='source-over';
  for(let i=0;i<foil.width;i++){
    const edge=i%4;
    const inset=Math.random()**2*5;
    const x=edge===0?inset:edge===1?foil.width-inset:Math.random()*foil.width;
    const y=edge===2?inset:edge===3?foil.height-inset:Math.random()*foil.height;
    coat.fillStyle=i%3?'#b2b3b280':'#73767a66';
    coat.fillRect(x,y,1+Math.random()*3,1);
  }
  result.removeAttribute('aria-hidden');
  message.textContent='미션을 확인했어요!';
  document.querySelector('#gift').hidden=false;
  result.tabIndex=-1;
  result.focus({preventScroll:true});
  action.hidden=true;
}
function scratch(e){
  const rect=foil.getBoundingClientRect();
  const x=(e.clientX-rect.left)*foil.width/rect.width;
  const y=(e.clientY-rect.top)*foil.height/rect.height;
  coat.lineWidth=28;
  coat.lineCap='round';
  coat.beginPath();
  coat.moveTo(previous?.x??x,previous?.y??y);
  coat.lineTo(x+0.01,y);
  coat.stroke();
  for(let i=0;i<12;i++){
    const angle=Math.random()*Math.PI*2;
    const radius=13+Math.random()*5;
    coat.fillRect(x+radius*Math.cos(angle),y+radius*Math.sin(angle),2,1);
  }
  previous={x,y};
  const data=coat.getImageData(0,0,foil.width,foil.height).data;
  let clear=0;
  for(let i=3;i<data.length;i+=16) if(data[i]<64) clear++;
  if(clear>data.length/16*0.55) reveal();
}
foil.onpointerdown=e=>{
  if(revealed || pointer!==null || e.button!==0) return;
  pointer=e.pointerId;
  previous=null;
  foil.setPointerCapture(pointer);
  scratch(e);
};
foil.onpointermove=e=>{if(pointer===e.pointerId) scratch(e)};
foil.onlostpointercapture=e=>{if(pointer===e.pointerId) pointer=null};
action.onclick=reveal;
