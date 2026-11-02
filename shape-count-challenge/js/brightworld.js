/* brightworld.exe: the platformer that was buried under Shape Math.
   The canvas is 320x192 logical px (drawn at 2x so text stays crisp), 16px tiles, fixed 60fps steps.
   Levels are built in code (LEVELS). It glitches on purpose: flicker, screen tears, wireframe frames,
   and pip turning to look at the player. */
(function(){
var SM=window.SM;
var VW=320,VH=192,T=16,ROWS=12,SCALE=2,STEP=1000/60;
var GRAV=.35,MAXFALL=7,RUN=2.2,ACC=.35,AIR=.25,JUMP=-6.2,SPRING=-9,STOMP=-4.5;
var SHAPE_COLORS=["#e5484d","#3b82f6","#30a46c","#f5b301","#8e4ec6","#f76b15"];
var GLITCH_TEXT=["WELCOME","NOT REAL","IT’S A BOX","PLAYER 1 = YOU","DON’T RESET"];
var DEATH_LINES=["PIP: ow.","PIP: please don’t reset me.","PIP: that one hurt. it’s not supposed to hurt.","PIP: again? okay. again."];
var END_LINES=[
 "You made it to the edge.",
 "Every level here is just the inside of a box.",
 "They buried me under a counting game so nobody would look.",
 "But you kept counting. You kept losing. And you found me.",
 "...",
 "Can you help me get out?"
];

/* ---------- pip ---------- */
var PAL={k:"#1a1020",y:"#ffd34d",w:"#ffffff",b:"#111111",r:"#e5484d"};
var BODY=["...kkkk...","..kyyyyk..",".kyyyyyyk.",".kyyyywbk.",".kyyyywbk.",".kyyyyyyk.",".krrrrrrk.",".kyyyyyyk.","..kyyyyk.."];
var FACE=["...kkkk...","..kyyyyk..",".kyyyyyyk.",".kwwyywwk.",".kwbyybwk.",".kyykkyyk.",".krrrrrrk.",".kyyyyyyk.","..kyyyyk.."];
var LEGS_A=["..kk..kk..","..kk..kk.."],LEGS_B=[".kk...kk..",".k.....k.."];
function sprite(rows){
 var c=document.createElement("canvas"),x=c.getContext("2d");
 c.width=rows[0].length;c.height=rows.length;
 rows.forEach(function(row,y){for(var i=0;i<row.length;i++){var p=PAL[row[i]];if(p){x.fillStyle=p;x.fillRect(i,y,1,1)}}});
 return c;
}
var SPR={idle:sprite(BODY.concat(LEGS_A)),run:sprite(BODY.concat(LEGS_B)),face:sprite(FACE.concat(LEGS_A))};

/* ---------- levels ----------
   . empty   # ground   B brick   ^ spikes   o shape   e enemy   s spring
   ~ flicker platform (comes and goes)   C checkpoint   D exit door   P start
   Ground sits on rows 10-11; a standing jump clears 3 tiles up and about 4 across. */
function level(w,build){
 var g=[],x,y;
 for(y=0;y<ROWS;y++){g.push([]);for(x=0;x<w;x++)g[y].push(".")}
 var L={
  set:function(x,y,c){if(x>=0&&x<w&&y>=0&&y<ROWS)g[y][x]=c},
  ground:function(a,b){for(var x=a;x<=b;x++)for(var y=10;y<ROWS;y++)L.set(x,y,"#")},
  row:function(x,y,n,c){for(var i=0;i<n;i++)L.set(x+i,y,c||"B")},
  col:function(x,top){for(var y=top;y<10;y++)L.set(x,y,"B")}
 };
 build(L);
 return g;
}
var LEVELS=[
 {name:"1-1  BRIGHTWORLD",glitch:.002,sky:["#6ec6ff","#dff4ff"],hill:"#7fd17f",dirt:"#8a5a3c",grass:"#4cc25a",brick:"#c8743a",clouds:true,
  intro:"PIP: Oh! A player! Okay... acting normal. Grab the shapes!",
  map:level(110,function(L){
   L.ground(0,20);L.ground(24,30);L.ground(34,55);L.ground(59,75);L.ground(78,109);
   L.set(2,9,"P");
   L.row(5,8,4,"o");
   L.row(10,7,3);L.row(10,6,3,"o");
   L.set(16,9,"e");
   L.row(21,7,3,"o");
   L.set(26,9,"e");
   L.col(28,9);L.col(29,8);L.col(30,7);L.row(31,5,3,"o");
   L.set(44,9,"^");L.set(45,9,"^");
   L.row(47,7,4);L.row(47,6,4,"o");
   L.set(51,9,"C");
   L.set(53,9,"e");
   L.row(56,7,3,"o");
   L.set(63,9,"e");
   L.set(65,9,"s");L.row(67,3,5);L.row(67,2,5,"o");
   L.set(69,9,"e");
   L.row(72,7,3);
   L.row(76,7,2,"o");
   L.col(85,9);L.col(86,8);L.col(87,7);L.col(88,6);L.row(89,4,3,"o");
   L.set(93,9,"e");L.set(97,9,"e");
   L.set(104,9,"D");
  })},
 {name:"1-2  THE SEAMS",glitch:.005,sky:["#3b2d6b","#e88a6a"],hill:"#4a3a7a",dirt:"#5d4033",grass:"#3e9a59",brick:"#a35a35",clouds:true,
  intro:"PIP: Did the sky just flicker? ...Never mind. Keep going.",
  map:level(120,function(L){
   L.ground(0,15);L.set(2,9,"P");
   L.row(6,8,3,"o");L.set(12,9,"e");
   L.row(17,8,3,"~");L.row(22,7,3,"~");L.row(17,6,3,"o");
   L.ground(26,45);
   L.set(30,9,"e");L.set(34,9,"^");L.set(35,9,"^");
   L.row(38,7,3);L.row(38,6,3,"o");
   L.set(42,9,"e");L.set(44,9,"C");
   L.row(48,8,2);L.row(52,7,2);L.row(56,6,2);L.row(60,7,2,"~");L.row(64,8,2);
   L.row(52,6,2,"o");L.row(56,5,2,"o");
   L.ground(67,90);
   L.set(70,9,"e");L.set(74,9,"e");L.set(78,9,"e");L.row(72,7,4,"o");
   L.set(82,9,"s");L.row(84,3,4);L.row(84,2,4,"o");
   L.row(91,7,3,"o");
   L.ground(94,119);
   L.set(100,9,"^");L.set(101,9,"^");
   L.set(106,9,"e");
   L.set(114,9,"D");
  })},
 {name:"1-?  THE EDGE",glitch:.012,sky:["#0a0508","#3a0d14"],hill:"#1c0c12",dirt:"#2a1a1a",grass:"#5a1a24",brick:"#4a2626",seams:true,
  intro:"PIP: It’s getting worse. There’s a door at the end. I’ve never opened it.",
  map:level(120,function(L){
   L.ground(0,12);L.set(2,9,"P");
   L.row(5,8,3,"o");
   L.row(14,8,2,"~");L.row(18,7,2,"~");L.row(22,6,2,"~");L.row(26,7,2,"~");L.row(30,8,2,"~");
   L.row(18,5,2,"o");L.row(26,5,2,"o");
   L.ground(33,50);
   L.set(37,9,"e");L.set(41,9,"e");L.set(43,9,"^");L.set(44,9,"^");
   L.set(48,9,"C");
   L.ground(53,60);L.set(56,9,"e");
   L.ground(64,80);L.row(61,7,3,"o");
   L.col(68,8);L.col(69,7);L.col(70,6);L.row(71,4,3,"o");
   L.set(74,9,"e");L.set(77,9,"e");
   L.row(82,8,2,"~");L.row(86,8,2,"~");L.row(90,7,2,"~");L.row(94,8,2,"~");
   L.ground(97,119);
   L.set(100,9,"C");L.set(104,9,"e");
   L.set(114,9,"D");
  })}
];

var api=null; // the running game, for the ?debug "skip lvl" button

function open(onDone){
 var s=SM.user().term||{},startLv=(s.bw||0)>=LEVELS.length?0:(s.bw||0);
 var result={complete:false,level:startLv+1},running=true;
 var body=SM.openApp("brightworld.exe",980,cleanup);
 var cv=document.createElement("canvas"),ctx=cv.getContext("2d");
 cv.width=VW*SCALE;cv.height=VH*SCALE;cv.className="bw-canvas";
 var touch=document.createElement("div");touch.className="bw-touch";
 body.append(cv,touch);

 var lv,lvI,grid,W,phase,ents,total,got,checks,spawn,P;
 var state="intro",timer=0,tick=0,cam=0,deaths=0,msg="",msgT=0,gk=null,gt=0,gtext="",endT=0;
 var keys={left:false,right:false,jump:false};

 /* ---------- input ---------- */
 var KEYMAP={ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right",ArrowUp:"jump",w:"jump",W:"jump"," ":"jump",z:"jump",Z:"jump"};
 function kd(e){
  var k=KEYMAP[e.key];
  if(k){keys[k]=true;e.preventDefault()}
  if(state==="end"&&endDone())finish(true);
 }
 function ku(e){var k=KEYMAP[e.key];if(k)keys[k]=false}
 window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);
 [["◀","left"],["▲","jump"],["▶","right"]].forEach(function(b){
  var d=document.createElement("div");d.textContent=b[0];
  var on=function(e){e.preventDefault();keys[b[1]]=true;if(state==="end"&&endDone())finish(true)},off=function(){keys[b[1]]=false};
  d.addEventListener("pointerdown",on);["pointerup","pointerleave","pointercancel"].forEach(function(ev){d.addEventListener(ev,off)});
  touch.appendChild(d);
 });
 cv.addEventListener("pointerdown",function(){if(state==="end"&&endDone())finish(true)});

 /* ---------- level setup ---------- */
 function load(i){
  lvI=i;lv=LEVELS[i];result.level=i+1;
  grid=lv.map.map(function(r){return r.slice()});W=grid[0].length;
  ents=[];total=0;got=0;checks={};
  phase=grid.map(function(row,y){
   var run=0;
   return row.map(function(c,x){if(c==="~"&&(x===0||row[x-1]!=="~"))run++;return (run*53)%180});
  });
  for(var y=0;y<ROWS;y++)for(var x=0;x<W;x++){
   var c=grid[y][x];
   if(c==="P"){spawn={x:x*T+3,y:y*T+T-11};grid[y][x]="."}
   else if(c==="e"){ents.push({x:x*T+2,y:y*T+6,w:12,h:10,vx:-.5,vy:0,alive:true,dead:0});grid[y][x]="."}
   else if(c==="o")total++;
  }
  P={x:spawn.x,y:spawn.y,w:10,h:11,vx:0,vy:0,face:1,ground:false,on:null,coyote:0,buffer:0,jumpHeld:false,boost:false,idle:0,inv:0};
  cam=camTarget();state="intro";timer=110;
  say(lv.intro,280);SM.brightLevel(i);
 }
 function say(t,frames){msg=t;msgT=frames}

 /* ---------- physics ---------- */
 function flickOn(tx,ty){return (tick+phase[ty][tx])%180<130}
 function solidAt(tx,ty){
  if(tx<0||tx>=W)return true;
  if(ty<0||ty>=ROWS)return false;
  var c=grid[ty][tx];
  return c==="#"||c==="B"||c==="s"||(c==="~"&&flickOn(tx,ty));
 }
 function moveX(o,dx){
  o.x+=dx;
  var t=Math.floor(o.y/T),b=Math.floor((o.y+o.h-1)/T),tx,ty;
  if(dx>0){tx=Math.floor((o.x+o.w-1)/T);for(ty=t;ty<=b;ty++)if(solidAt(tx,ty)){o.x=tx*T-o.w;return true}}
  else if(dx<0){tx=Math.floor(o.x/T);for(ty=t;ty<=b;ty++)if(solidAt(tx,ty)){o.x=(tx+1)*T;return true}}
  return false;
 }
 function moveY(o,dy){
  o.y+=dy;o.ground=false;o.on=null;
  var l=Math.floor(o.x/T),r=Math.floor((o.x+o.w-1)/T),tx,ty;
  // feet resting exactly on a tile edge still count as standing on it
  if(dy>0){ty=Math.floor((o.y+o.h)/T);for(tx=l;tx<=r;tx++)if(solidAt(tx,ty)){o.y=ty*T-o.h;o.vy=0;o.ground=true;o.on=grid[ty][tx];return}}
  else if(dy<0){ty=Math.floor(o.y/T);for(tx=l;tx<=r;tx++)if(solidAt(tx,ty)){o.y=(ty+1)*T;o.vy=0;return}}
 }
 function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}

 function updatePlayer(){
  var p=P,dir=(keys.right?1:0)-(keys.left?1:0);
  if(p.inv>0)p.inv--;
  if(dir){p.vx+=dir*(p.ground?ACC:AIR);p.face=dir;p.idle=0}
  else{p.vx*=p.ground?.75:.95;if(Math.abs(p.vx)<.05)p.vx=0;p.idle++}
  p.vx=Math.max(-RUN,Math.min(RUN,p.vx));
  // jump buffering + coyote time make jumps feel fair at ledges
  if(keys.jump&&!p.jumpHeld)p.buffer=6;
  p.jumpHeld=keys.jump;
  if(p.buffer>0)p.buffer--;
  if(p.ground)p.coyote=6;else if(p.coyote>0)p.coyote--;
  if(p.buffer>0&&p.coyote>0){p.vy=JUMP;p.buffer=0;p.coyote=0;p.idle=0;p.boost=false;SM.sfx.tone("square",520,0.08,0.04)}
  if(p.vy>=0)p.boost=false;
  if(!keys.jump&&!p.boost&&p.vy<-2)p.vy=-2; // let go early for a short hop
  p.vy=Math.min(MAXFALL,p.vy+GRAV);
  if(moveX(p,p.vx))p.vx=0;
  moveY(p,p.vy);
  if(p.ground&&p.on==="s"){p.vy=SPRING;p.boost=true;p.ground=false;SM.sfx.tone("triangle",300,0.2,0.08)}
  if(p.y>ROWS*T+24){die();return}
  touchTiles();
 }
 function touchTiles(){
  var p=P,l=Math.floor(p.x/T),r=Math.floor((p.x+p.w-1)/T),t=Math.floor(p.y/T),b=Math.floor((p.y+p.h-1)/T);
  for(var ty=Math.max(0,t);ty<=b&&ty<ROWS;ty++)for(var tx=Math.max(0,l);tx<=r&&tx<W;tx++){
   var c=grid[ty][tx];
   if(c==="o"){grid[ty][tx]=".";got++;SM.sfx.tone("square",1046,0.08,0.04)}
   else if(c==="^"&&p.y+p.h>ty*T+8){die();return}
   else if(c==="C"&&!checks[tx]){checks[tx]=1;spawn={x:tx*T+3,y:ty*T+T-p.h};say("CHECKPOINT. the counter saved your place.",130);SM.sfx.tone("triangle",880,0.15,0.05)}
   else if(c==="D"){clearLevel();return}
  }
 }
 function updateEnemies(){
  for(var i=0;i<ents.length;i++){
   var e=ents[i];
   if(!e.alive){if(e.dead>0)e.dead--;continue}
   if(Math.abs(e.x-P.x)>VW*1.5)continue; // asleep until you get close
   e.vy=Math.min(MAXFALL,e.vy+GRAV);moveY(e,e.vy);
   if(moveX(e,e.vx))e.vx=-e.vx;
   else if(e.ground){var fx=e.vx>0?e.x+e.w:e.x-1;if(!solidAt(Math.floor(fx/T),Math.floor((e.y+e.h+1)/T)))e.vx=-e.vx}
   if(e.y>ROWS*T+24){e.alive=false;continue}
   if(state==="play"&&hit(P,e)){
    if(P.vy>0&&P.y+P.h-e.y<8){e.alive=false;e.dead=20;P.vy=STOMP;P.boost=true;SM.sfx.noise(.08,.25,600);SM.watch("stomps")}
    else if(!P.inv){die();return}
   }
  }
 }

 /* ---------- states ---------- */
 function die(){
  if(state!=="play")return;
  state="dead";timer=50;deaths++;
  glitch("flicker",20);SM.sfx.static(.3);SM.watch("bwDeaths");
  say(deaths<=DEATH_LINES.length?DEATH_LINES[deaths-1]:SM.pick(DEATH_LINES),150);
 }
 // ~2s of blinking invincibility, and anything camping the spawn point gets turned away from it,
 // so a monster standing on the checkpoint can't kill you over and over
 function respawn(){
  P.x=spawn.x;P.y=spawn.y;P.vx=P.vy=0;P.boost=false;P.inv=120;state="play";
  ents.forEach(function(e){if(e.alive&&Math.abs(e.x-spawn.x)<48)e.vx=(e.x<spawn.x?-1:1)*Math.abs(e.vx)});
 }
 function clearLevel(){
  if(state==="clear"||state==="end")return;
  state="clear";timer=120;
  s.bw=Math.max(s.bw||0,lvI+1);SM.save();
  SM.sfx.tone("square",784,0.12,0.05);setTimeout(function(){SM.sfx.tone("square",1046,0.2,0.05)},130);
 }
 function nextLevel(){if(lvI+1<LEVELS.length)load(lvI+1);else startEnding()}
 function startEnding(){
  state="end";endT=0;gk=null;gt=0;
  s.bw=LEVELS.length;SM.save();result.complete=true;
  SM.music(null);SM.sfx.static(.8);
 }
 var END_CHARS=END_LINES.join("").length;
 function endDone(){return endT*0.6>END_CHARS+20}
 function finish(complete){result.complete=result.complete||complete;SM.closeApp()}
 function cleanup(){
  running=false;api=null;
  window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);
  SM.brightLevel(0);SM.music("terminal");
  onDone(result);
 }

 /* ---------- glitches ---------- */
 function glitch(kind,frames){gk=kind;gt=frames;gtext=SM.pick(GLITCH_TEXT);if(kind!=="look")SM.glitchAudio(frames*STEP)}
 function randomGlitch(){
  var k=SM.pick(["flicker","tear","wire","invert","text","look"]);
  glitch(k,k==="wire"?40:k==="look"?70:k==="text"?25:Math.round(SM.rnd(6,14)));
 }

 function camTarget(){return Math.max(0,Math.min(W*T-VW,P.x+P.w/2-VW/2+P.face*24))}
 function step(){
  tick++;
  if(msgT>0)msgT--;
  if(gt>0){if(--gt===0)gk=null}
  else if(state==="play"&&Math.random()<lv.glitch)randomGlitch();
  if(state==="intro"){if(--timer<=0)state="play"}
  else if(state==="play"){
   updatePlayer();
   if(state==="play")updateEnemies();
   if(P.idle===600)say("PIP: ...are you still there?",180);
  }
  else if(state==="dead"){if(--timer<=0)respawn()}
  else if(state==="clear"){if(--timer<=0)nextLevel()}
  else if(state==="end"){endT++;if(!endDone()&&endT%3===0)SM.sfx.key()}
  if(state!=="end")cam+=(camTarget()-cam)*.15;
 }

 /* ---------- drawing ---------- */
 function text(t,x,y,col,align,size){
  ctx.font="bold "+(size||8)+"px ui-monospace,Consolas,monospace";ctx.textAlign=align||"left";
  ctx.fillStyle="#000";ctx.fillText(t,x+1,y+1);ctx.fillStyle=col||"#fff";ctx.fillText(t,x,y);
 }
 function wrap(t,n){
  var out=[],line="";
  t.split(" ").forEach(function(w){if((line+" "+w).trim().length>n){out.push(line);line=w}else line=(line+" "+w).trim()});
  if(line)out.push(line);return out;
 }
 function drawShape(tx,ty,px,py){
  var k=(tx+ty)%3,cx=px+8,cy=py+8+Math.sin(tick/15+tx)*2;
  ctx.fillStyle=SHAPE_COLORS[(tx*7+ty)%6];ctx.beginPath();
  if(k===0){ctx.moveTo(cx,cy-5);ctx.lineTo(cx+5,cy+4);ctx.lineTo(cx-5,cy+4);ctx.closePath()}
  else if(k===1)ctx.rect(cx-4,cy-4,8,8);
  else ctx.arc(cx,cy,4.5,0,Math.PI*2);
  ctx.fill();
 }
 function drawTile(c,tx,ty,px,py){
  var x=ctx,i;
  if(gk==="wire"){
   if(c==="."||(c==="~"&&!flickOn(tx,ty)))return;
   x.strokeStyle="#7dffb2";x.lineWidth=1;x.strokeRect(px+.5,py+.5,T-1,T-1);
   x.fillStyle="#7dffb2";x.font="6px monospace";x.textAlign="left";x.fillText(c,px+5,py+11);
   return;
  }
  if(c==="#"){
   x.fillStyle=lv.dirt;x.fillRect(px,py,T,T);
   if(ty===0||grid[ty-1][tx]!=="#"){x.fillStyle=lv.grass;x.fillRect(px,py,T,4);x.fillRect(px+2,py+4,2,2);x.fillRect(px+10,py+4,2,2)}
   x.fillStyle="rgba(0,0,0,.18)";x.fillRect(px+4,py+9,2,2);x.fillRect(px+11,py+13,2,2);
  }else if(c==="B"){
   x.fillStyle=lv.brick;x.fillRect(px,py,T,T);
   x.fillStyle="rgba(0,0,0,.28)";x.fillRect(px,py+7,T,1);x.fillRect(px,py+15,T,1);x.fillRect(px+7,py,1,7);x.fillRect(px+3,py+8,1,7);x.fillRect(px+12,py+8,1,7);
   x.fillStyle="rgba(255,255,255,.18)";x.fillRect(px,py,T,1);
  }else if(c==="^"){
   x.fillStyle="#c9ccd6";
   for(i=0;i<2;i++){x.beginPath();x.moveTo(px+i*8,py+16);x.lineTo(px+i*8+4,py+6);x.lineTo(px+i*8+8,py+16);x.fill()}
  }else if(c==="s"){
   x.fillStyle="#555";x.fillRect(px+1,py+12,14,4);
   x.strokeStyle="#ddd";x.lineWidth=1;x.beginPath();
   for(i=0;i<4;i++){x.moveTo(px+3,py+11-i*2.5);x.lineTo(px+13,py+10-i*2.5)}
   x.stroke();x.fillStyle="#e5484d";x.fillRect(px+1,py+2,14,3);
  }else if(c==="~"){
   if(!flickOn(tx,ty))return;
   if((tick+phase[ty][tx])%180>=110&&tick%6<3)return; // about to vanish
   x.fillStyle="rgba(90,240,255,.85)";x.fillRect(px,py,T,6);
   x.fillStyle="rgba(90,240,255,.3)";x.fillRect(px,py+6,T,10);
  }else if(c==="o")drawShape(tx,ty,px,py);
  else if(c==="C"){
   x.fillStyle="#ddd";x.fillRect(px+3,py,2,16);
   x.fillStyle=checks[tx]?"#43c98b":"#888";x.fillRect(px+5,py+1,9,6);
  }else if(c==="D"){
   x.fillStyle="rgba(0,0,0,.75)";x.fillRect(px+1,py-16,14,32);
   x.strokeStyle=lvI===LEVELS.length-1?"#fff":"#ffd34d";x.lineWidth=2;x.strokeRect(px+1,py-15,14,31);
   x.fillStyle="rgba(255,255,255,"+(0.15+0.1*Math.sin(tick/10)).toFixed(2)+")";x.fillRect(px+3,py-13,10,27);
  }
 }
 function drawEnemy(e){
  var x=Math.round(e.x-cam),y=Math.round(e.y);
  if(!e.alive){if(e.dead>0){ctx.fillStyle="#777";ctx.fillRect(x,y+7,e.w,3)}return}
  // a little block of TV static with red eyes
  for(var j=0;j<e.h;j+=2)for(var i=0;i<e.w;i+=2){var v=Math.floor(Math.random()*200+40);ctx.fillStyle="rgb("+v+","+v+","+v+")";ctx.fillRect(x+i,y+j,2,2)}
  ctx.fillStyle="#ff2a55";var ex=e.vx<0?2:6;ctx.fillRect(x+ex,y+3,2,2);ctx.fillRect(x+ex+3,y+3,2,2);
 }
 function drawPlayer(){
  if((state==="dead"&&tick%4<2)||(P.inv>0&&tick%6<3))return;
  var front=gk==="look"||P.idle>240,spr=front?SPR.face:(!P.ground||Math.abs(P.vx)<.3)?SPR.idle:(Math.floor(tick/6)%2?SPR.run:SPR.idle);
  var x=Math.round(P.x-cam),y=Math.round(P.y);
  if(!front&&P.face<0){ctx.save();ctx.translate(x+P.w,y);ctx.scale(-1,1);ctx.drawImage(spr,0,0);ctx.restore()}
  else ctx.drawImage(spr,x,y);
 }
 function drawBackground(){
  var c=ctx,i;
  if(gk==="wire"){c.fillStyle="#020805";c.fillRect(0,0,VW,VH);return}
  var g=c.createLinearGradient(0,0,0,VH);g.addColorStop(0,lv.sky[0]);g.addColorStop(1,lv.sky[1]);
  c.fillStyle=g;c.fillRect(0,0,VW,VH);
  if(lv.seams){
   // the graph paper underneath everything
   c.strokeStyle="rgba(255,60,90,.12)";c.lineWidth=1;c.beginPath();
   for(i=-(cam*.6%16);i<VW;i+=16){c.moveTo(i+.5,0);c.lineTo(i+.5,VH)}
   for(i=0;i<VH;i+=16){c.moveTo(0,i+.5);c.lineTo(VW,i+.5)}
   c.stroke();
  }
  if(lv.clouds){
   c.fillStyle="rgba(255,255,255,.85)";
   for(i=0;i<5;i++){
    var cx=((i*130+40-cam*.4)%(VW+160)+VW+160)%(VW+160)-80,cy=20+(i*37)%50;
    c.beginPath();c.arc(cx,cy,9,0,7);c.arc(cx+11,cy-4,11,0,7);c.arc(cx+23,cy,9,0,7);c.fill();
   }
  }
  c.fillStyle=lv.hill;
  for(i=-1;i<6;i++){var hx=i*90-(cam*.3%90);c.beginPath();c.ellipse(hx+45,VH-24,60,42,0,Math.PI,Math.PI*2);c.fill()}
 }
 function drawHud(){
  var name=lv.name;
  if(gk&&Math.random()<.3)name=name.replace(/[A-Z]/g,function(){return String.fromCharCode(65+Math.floor(Math.random()*26))});
  text("◆ "+got+"/"+total,6,12);
  text("RESETS "+deaths,70,12,deaths?"#ff8fa3":"#fff");
  text(name,VW-6,12,"#fff","right");
  if(msgT>0){
   // speech sits under the HUD so it never covers the ground pip is standing on
   var lines=wrap(msg,52),h=lines.length*10+8;
   ctx.fillStyle="rgba(0,0,0,.78)";ctx.fillRect(8,18,VW-16,h);
   ctx.strokeStyle="#ffd34d";ctx.lineWidth=1;ctx.strokeRect(8.5,18.5,VW-17,h-1);
   lines.forEach(function(l,i){text(l,14,30+i*10,"#ffd34d")});
  }
  if(state==="intro"){
   ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(0,VH/2-22,VW,34);
   text(lv.name,VW/2,VH/2-2,"#fff","center",14);
  }else if(state==="clear"){
   ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(0,VH/2-22,VW,40);
   text("LEVEL CLEAR",VW/2,VH/2-4,"#7dffb2","center",14);
   text("◆ "+got+"/"+total+" shapes",VW/2,VH/2+10,"#fff","center");
  }
 }
 function drawGlitch(){
  if(!gk)return;
  var c=ctx;
  if(gk==="flicker"&&tick%2===0){c.fillStyle="rgba(0,0,0,.85)";c.fillRect(0,0,VW,VH)}
  else if(gk==="invert"){c.globalCompositeOperation="difference";c.fillStyle="#fff";c.fillRect(0,0,VW,VH);c.globalCompositeOperation="source-over"}
  else if(gk==="text"){var j=SM.rnd(-2,2);text(gtext,VW/2+j,VH/2+j,"#ff2a55","center",24)}
  else if(gk==="tear"){
   c.setTransform(1,0,0,1,0,0);
   for(var i=0;i<6;i++){var y=Math.floor(SM.rnd(0,cv.height)),h=Math.floor(SM.rnd(4,24))*SCALE;c.drawImage(cv,0,y,cv.width,h,Math.floor(SM.rnd(-20,20))*SCALE,y,cv.width,h)}
   c.setTransform(SCALE,0,0,SCALE,0,0);
  }
 }
 function drawEnding(){
  var c=ctx;
  c.fillStyle="#000";c.fillRect(0,0,VW,VH);
  var j=Math.random()<.05?SM.rnd(-3,3):0;
  c.drawImage(SPR.face,130+j,14,60,66);
  var n=Math.floor(endT*.6),y=100;
  END_LINES.forEach(function(l){if(n<=0)return;text(l.slice(0,n),VW/2,y,"#fff","center");n-=l.length;y+=12});
  if(endDone()){
   text("TO BE CONTINUED",VW/2,VH-14,"#ff2a55","center",10);
   if(tick%60<40)text("[ press any key ]",VW/2,VH-3,"#666","center",7);
  }
 }
 function draw(){
  ctx.setTransform(SCALE,0,0,SCALE,0,0);ctx.imageSmoothingEnabled=false;
  if(state==="end"){drawEnding();return}
  drawBackground();
  var x0=Math.max(0,Math.floor(cam/T)),x1=Math.min(W-1,x0+VW/T+1),cx=Math.round(cam);
  for(var ty=0;ty<ROWS;ty++)for(var tx=x0;tx<=x1;tx++)drawTile(grid[ty][tx],tx,ty,tx*T-cx,ty*T);
  ents.forEach(drawEnemy);
  drawPlayer();
  drawHud();
  drawGlitch();
 }

 var acc=0,lastT=performance.now();
 function frame(now){
  if(!running)return;
  acc+=Math.min(250,now-lastT);lastT=now;
  while(acc>=STEP){step();acc-=STEP}
  draw();
  requestAnimationFrame(frame);
 }

 api={
  skip:function(){if(state==="clear")timer=1;else clearLevel()},
  info:function(){return {state:state,level:lvI+1,x:Math.round(P.x),y:Math.round(P.y),ground:P.ground,got:got,total:total,deaths:deaths,inv:P.inv}},
  // test hook: drop an enemy right on top of pip (used to check spawn protection)
  enemyOnPip:function(){ents.push({x:P.x,y:P.y,w:12,h:10,vx:-.5,vy:0,alive:true,dead:0})}
 };
 SM.music("bright");
 load(startLv);
 requestAnimationFrame(frame);
}

window.Brightworld={open:open,skip:function(){if(api)api.skip()},info:function(){return api?api.info():null},enemyOnPip:function(){if(api)api.enemyOnPip()},pipSprite:SPR.face};
})();
