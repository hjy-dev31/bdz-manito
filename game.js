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
  result.textContent='내 마니또 · '+target+'\n\n'+mission;
  result.setAttribute('aria-hidden','true');
  document.querySelector('#number').textContent='NO. '+number;
  coat.globalCompositeOperation='source-over';
  coat.fillStyle='#bdb9b6';
  coat.fillRect(0,0,300,82);
  for(let y=0;y<82;y+=4){
    for(let x=(y%8);x<300;x+=8){
      coat.fillStyle='#dfdcd9';
      coat.fillRect(x,y,2,2);
    }
  }
  drawFoilWatermark();
  coat.globalCompositeOperation='destination-out';
  message.textContent='은박을 문질러 미션을 확인하세요.';
  action.textContent='한 번에 긁기';
}
function reveal(){
  revealed=true;
  pointer=null;
  coat.clearRect(0,0,300,82);
  result.removeAttribute('aria-hidden');
  message.textContent='미션을 확인했어요!\n마니또를 위한 선물을 준비해주세요\n(금액대: 2~3만원)';
  result.tabIndex=-1;
  result.focus();
  action.hidden=true;
}
function scratch(e){
  const rect=foil.getBoundingClientRect();
  const x=(e.clientX-rect.left)*300/rect.width;
  const y=(e.clientY-rect.top)*82/rect.height;
  coat.lineWidth=30;
  coat.lineCap='round';
  coat.beginPath();
  coat.moveTo(previous?.x??x,previous?.y??y);
  coat.lineTo(x+0.01,y);
  coat.stroke();
  previous={x,y};
  const data=coat.getImageData(0,0,300,82).data;
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
