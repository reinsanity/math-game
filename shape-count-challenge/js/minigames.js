/* Bonus games in /games: minesweeper, solitaire (Klondike, draw 1) and chess against the counter.
   Each game gets a body element from SM.openApp and a win() callback; the terminal hands out
   a lore fragment the first time each one is won. */
(function(){
var SM=window.SM;
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}

var GAMES={
 minesweeper:{title:"minesweeper.exe",w:420,fn:mines},
 solitaire:{title:"solitaire.exe",w:660,fn:solitaire},
 chess:{title:"chess.exe",w:500,fn:chess}
};
function open(name,onClose){
 var g=GAMES[name],won=false;
 var body=SM.openApp(g.title,g.w,function(){onClose(won)});
 g.fn(body,function(){won=true});
}

/* ---------- minesweeper ---------- */
function mines(body,win){
 var N=9,M=10,cells,first,over,opened,flagMode=false;
 var info=el("div","mg-info"),grid=el("div","ms-grid"),bar=el("div","mg-bar");
 var fb=el("div","mg-btn","🚩 flag mode: off"),nb=el("div","mg-btn","new game");
 bar.append(fb,nb);body.append(info,grid,bar);
 fb.onclick=function(){flagMode=!flagMode;fb.textContent="🚩 flag mode: "+(flagMode?"on":"off");fb.classList.toggle("on",flagMode)};
 nb.onclick=reset;

 function reset(){
  cells=[];first=true;over=false;opened=0;grid.replaceChildren();
  for(var i=0;i<N*N;i++)(function(i){
   var c={m:false,n:0,o:false,f:false,e:el("div","ms-c")};
   c.e.onclick=function(){if(flagMode)flag(i);else reveal(i)};
   c.e.oncontextmenu=function(ev){ev.preventDefault();flag(i)};
   cells.push(c);grid.appendChild(c.e);
  })(i);
  info.textContent="💣 "+M+" · clear the field. right-click (or flag mode) to flag.";
 }
 function nbrs(i){
  var x=i%N,y=Math.floor(i/N),out=[];
  for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
   var X=x+dx,Y=y+dy;
   if((dx||dy)&&X>=0&&X<N&&Y>=0&&Y<N)out.push(Y*N+X);
  }
  return out;
 }
 // mines are placed after the first click so it (and its neighbours) are always safe
 function plant(safe){
  var keep=[safe].concat(nbrs(safe)),pool=[];
  for(var i=0;i<N*N;i++)if(keep.indexOf(i)<0)pool.push(i);
  SM.shuffle(pool).slice(0,M).forEach(function(i){cells[i].m=true});
  cells.forEach(function(c,i){c.n=nbrs(i).filter(function(j){return cells[j].m}).length});
 }
 function reveal(i){
  var c=cells[i];
  if(over||c.o||c.f)return;
  if(first){first=false;plant(i)}
  if(c.m){lose(i);return}
  var stack=[i];
  while(stack.length){
   var j=stack.pop(),d=cells[j];
   if(d.o||d.f)continue;
   d.o=true;opened++;d.e.classList.add("o");
   if(d.n){d.e.textContent=d.n;d.e.classList.add("n"+d.n)}
   else nbrs(j).forEach(function(k){if(!cells[k].o)stack.push(k)});
  }
  SM.sfx.tone("square",880,0.03,0.03);
  if(opened===N*N-M){over=true;info.textContent="✔ field cleared. the counter is… impressed.";SM.sfx.tone("square",1320,0.2,0.05);win()}
 }
 function flag(i){var c=cells[i];if(over||c.o)return;c.f=!c.f;c.e.textContent=c.f?"🚩":""}
 function lose(i){
  over=true;
  cells.forEach(function(c,j){if(c.m){c.e.textContent=j===i?"👁":"💣";c.e.classList.add("o")}});
  cells[i].e.classList.add("boom");
  info.textContent="✖ boom. it saw that.";SM.sfx.static(.4);
 }
 reset();
}

/* ---------- solitaire ---------- */
function solitaire(body,win){
 var SU=["♠","♥","♦","♣"],RK=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
 var stock,waste,found,tab,sel,moves,done;
 var info=el("div","mg-info"),wrap=el("div","sol"),top=el("div","sol-top"),tb=el("div","sol-tab"),bar=el("div","mg-bar"),nb=el("div","mg-btn","new game");
 bar.append(nb);wrap.append(top,tb);body.append(info,wrap,bar);
 nb.onclick=deal;

 function red(c){return c.s===1||c.s===2}
 function deal(){
  var deck=[];
  for(var s=0;s<4;s++)for(var r=1;r<=13;r++)deck.push({s:s,r:r,up:false});
  SM.shuffle(deck);
  tab=[];
  for(var i=0;i<7;i++){tab.push(deck.splice(0,i+1));tab[i][i].up=true}
  stock=deck;waste=[];found=[[],[],[],[]];sel=null;moves=0;done=false;
  render();
 }
 function cardEl(c){
  var e=el("div","cd"+(c.up?"":" dn")+(c.up&&red(c)?" red":""));
  if(c.up)e.textContent=RK[c.r]+SU[c.s];
  return e;
 }
 // sel = {p:"w"} for the waste, {p:"t",i:column,k:index} for a run in the tableau
 function cardsOf(s){return s.p==="w"?[waste[waste.length-1]]:tab[s.i].slice(s.k)}
 function same(a,b){return !!a&&!!b&&a.p===b.p&&a.i===b.i&&a.k===b.k}
 function canHome(c){var f=found[c.s];return f.length?f[f.length-1].r===c.r-1:c.r===1}
 function canTab(c,i){
  var col=tab[i];
  if(!col.length)return c.r===13;
  var t=col[col.length-1];
  return t.up&&red(t)!==red(c)&&t.r===c.r+1;
 }

 function render(){
  top.replaceChildren();tb.replaceChildren();
  var sp=el("div","pile");
  sp.appendChild(stock.length?el("div","cd dn"):el("span","pile-x","↻"));
  sp.onclick=draw;top.appendChild(sp);
  var wp=el("div","pile");
  if(waste.length){
   var w=cardEl(waste[waste.length-1]);
   if(sel&&sel.p==="w")w.classList.add("sel");
   w.onclick=function(ev){ev.stopPropagation();pick({p:"w"})};
   wp.appendChild(w);
  }
  top.append(wp,el("div"));
  found.forEach(function(f,i){
   var p=el("div","pile");
   p.appendChild(f.length?cardEl(f[f.length-1]):el("span","pile-x",SU[i]));
   p.onclick=function(){drop({p:"f",i:i})};
   top.appendChild(p);
  });
  tab.forEach(function(col,i){
   var c=el("div","col");
   c.onclick=function(){drop({p:"t",i:i})};
   col.forEach(function(card,k){
    var e=cardEl(card);
    if(sel&&sel.p==="t"&&sel.i===i&&k>=sel.k)e.classList.add("sel");
    if(card.up)e.onclick=function(ev){ev.stopPropagation();pick({p:"t",i:i,k:k})};
    c.appendChild(e);
   });
   tb.appendChild(c);
  });
  var n=found.reduce(function(a,f){return a+f.length},0);
  info.textContent=done?"✔ solved in "+moves+" moves. the cards remember.":"home "+n+"/52 · moves "+moves+" · tap a card, then where it goes. tap it twice to send it home.";
 }
 function pick(s){
  if(done)return;
  if(same(sel,s)){
   var cs=cardsOf(s);
   if(cs.length===1&&canHome(cs[0])){move(s,{p:"f",i:cs[0].s});return}
   sel=null;render();return;
  }
  if(sel&&s.p==="t"){drop({p:"t",i:s.i});return}
  sel=s;render();
 }
 function drop(t){
  if(!sel||done)return;
  var cs=cardsOf(sel);
  var ok=t.p==="f"?cs.length===1&&cs[0].s===t.i&&canHome(cs[0]):canTab(cs[0],t.i);
  if(ok)move(sel,t);else{sel=null;render()}
 }
 function move(s,t){
  var cs=s.p==="w"?[waste.pop()]:tab[s.i].splice(s.k);
  if(t.p==="f")found[t.i].push(cs[0]);else tab[t.i]=tab[t.i].concat(cs);
  if(s.p==="t"&&tab[s.i].length)tab[s.i][tab[s.i].length-1].up=true;
  sel=null;moves++;SM.sfx.tone("triangle",660,0.05,0.05);
  if(found.every(function(f){return f.length===13})){done=true;SM.sfx.tone("square",1320,0.2,0.05);win()}
  render();
 }
 function draw(){
  if(done)return;
  sel=null;
  if(stock.length){var c=stock.pop();c.up=true;waste.push(c)}
  else{stock=waste.reverse().map(function(c){c.up=false;return c});waste=[]}
  SM.sfx.tone("triangle",440,0.03,0.04);
  render();
 }
 deal();
}

/* ---------- chess ---------- */
// you are white; the counter plays red (black) with a shallow 2-ply search.
// simplified rules: no castling or en passant, pawns always promote to a queen.
function chess(body,win){
 var GL={K:"♚",Q:"♛",R:"♜",B:"♝",N:"♞",P:"♟"},VAL={P:1,N:3,B:3,R:5,Q:9,K:0};
 var TAUNT=["the counter takes that.","it’s counting your pieces.","you’ve played this before. you lost then too.","it never gets tired."];
 var b,turn,sel,targets,last,over;
 var info=el("div","mg-info"),board=el("div","ch-board"),bar=el("div","mg-bar"),nb=el("div","mg-btn","new game");
 bar.append(nb);body.append(info,board,bar);
 nb.onclick=reset;

 function inb(r,c){return r>=0&&r<8&&c>=0&&c<8}
 function reset(){
  var back="RNBQKBNR";b=[];
  for(var r=0;r<8;r++){b.push([]);for(var c=0;c<8;c++)b[r].push(null)}
  for(c=0;c<8;c++){b[0][c]="b"+back[c];b[1][c]="bP";b[6][c]="wP";b[7][c]="w"+back[c]}
  turn="w";sel=null;targets=[];last=null;over=false;
  info.textContent="you are white. the counter plays red.";
  render();
 }
 // moves are [fromRow,fromCol,toRow,toCol]
 function pseudo(B,col){
  var out=[];
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
   var p=B[r][c];
   if(!p||p[0]!==col)continue;
   var t=p[1];
   if(t==="P"){
    var d=col==="w"?-1:1,start=col==="w"?6:1;
    if(inb(r+d,c)&&!B[r+d][c]){out.push([r,c,r+d,c]);if(r===start&&!B[r+2*d][c])out.push([r,c,r+2*d,c])}
    for(var dc=-1;dc<=1;dc+=2){var R=r+d,C=c+dc;if(inb(R,C)&&B[R][C]&&B[R][C][0]!==col)out.push([r,c,R,C])}
    continue;
   }
   var dirs=t==="N"?[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]
    :t==="B"?[[1,1],[1,-1],[-1,1],[-1,-1]]
    :t==="R"?[[1,0],[-1,0],[0,1],[0,-1]]
    :[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
   var slide=t==="B"||t==="R"||t==="Q";
   for(var k=0;k<dirs.length;k++){
    var R2=r+dirs[k][0],C2=c+dirs[k][1];
    while(inb(R2,C2)){
     var q=B[R2][C2];
     if(!q||q[0]!==col)out.push([r,c,R2,C2]);
     if(q||!slide)break;
     R2+=dirs[k][0];C2+=dirs[k][1];
    }
   }
  }
  return out;
 }
 function apply(B,m){
  var N=B.map(function(row){return row.slice()}),p=N[m[0]][m[1]];
  N[m[0]][m[1]]=null;
  if(p[1]==="P"&&(m[2]===0||m[2]===7))p=p[0]+"Q";
  N[m[2]][m[3]]=p;
  return N;
 }
 function findK(B,col){for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(B[r][c]===col+"K")return [r,c];return null}
 function inCheck(B,col){
  var k=findK(B,col);
  return !!k&&pseudo(B,col==="w"?"b":"w").some(function(m){return m[2]===k[0]&&m[3]===k[1]});
 }
 function legal(B,col){return pseudo(B,col).filter(function(m){return !inCheck(apply(B,m),col)})}
 // from red's point of view, with a nudge toward the centre for pawns and knights
 function score(B){
  var s=0;
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
   var p=B[r][c];if(!p)continue;
   var v=VAL[p[1]]+((p[1]==="P"||p[1]==="N")&&r>1&&r<6&&c>1&&c<6?0.1:0);
   s+=p[0]==="b"?v:-v;
  }
  return s;
 }
 function aiMove(){
  var best=null,bs=-1e9;
  legal(b,"b").forEach(function(m){
   var N=apply(b,m),worst=1e9;
   pseudo(N,"w").forEach(function(r){var v=N[r[2]][r[3]]==="bK"?-1000:score(apply(N,r));if(v<worst)worst=v});
   if(worst===1e9)worst=score(N);
   var s=worst+Math.random()*0.3;
   if(s>bs){bs=s;best=m}
  });
  return best;
 }

 function render(){
  board.replaceChildren();
  var chk=inCheck(b,turn)?findK(b,turn):null;
  for(var r=0;r<8;r++)for(var c=0;c<8;c++)(function(r,c){
   var sq=el("div","ch-sq "+((r+c)%2?"d":"l")),p=b[r][c];
   if(last&&((last[0]===r&&last[1]===c)||(last[2]===r&&last[3]===c)))sq.classList.add("last");
   if(sel&&sel[0]===r&&sel[1]===c)sq.classList.add("sel");
   if(chk&&chk[0]===r&&chk[1]===c)sq.classList.add("chk");
   if(targets.some(function(m){return m[2]===r&&m[3]===c}))sq.classList.add("mv");
   if(p)sq.appendChild(el("span",p[0]==="w"?"pw":"pb",GL[p[1]]+"︎"));
   sq.onclick=function(){click(r,c)};
   board.appendChild(sq);
  })(r,c);
 }
 function click(r,c){
  if(over||turn!=="w")return;
  var m=targets.filter(function(m){return m[2]===r&&m[3]===c})[0];
  if(m){doMove(m);return}
  var p=b[r][c];
  if(p&&p[0]==="w"){sel=[r,c];targets=legal(b,"w").filter(function(m){return m[0]===r&&m[1]===c})}
  else{sel=null;targets=[]}
  render();
 }
 function doMove(m){
  var cap=b[m[2]][m[3]];
  b=apply(b,m);last=m;sel=null;targets=[];
  SM.sfx.tone(cap?"square":"triangle",cap?330:520,0.08,0.06);
  turn=turn==="w"?"b":"w";
  if(!status())return;
  render();
  if(turn==="b")setTimeout(function(){
   if(over||!document.body.contains(board))return;
   var am=aiMove();if(!am)return;
   var took=b[am[2]][am[3]];
   doMove(am);
   if(took&&!over)info.textContent=SM.pick(TAUNT);
  },450);
 }
 // updates the message; returns false once the game has ended
 function status(){
  var any=legal(b,turn).length>0,chk=inCheck(b,turn);
  if(!any){
   over=true;
   if(chk&&turn==="b"){info.textContent="✔ checkmate. you beat the counter. it will remember this.";win()}
   else if(chk)info.textContent="✖ checkmate. the counter wins. it was counting on that.";
   else info.textContent="stalemate. nobody wins. nobody leaves.";
   render();return false;
  }
  info.textContent=chk?(turn==="w"?"check. it’s closing in.":"check."):(turn==="w"?"your move.":"the counter is thinking…");
  return true;
 }
 reset();
}

window.Minigames={open:open};
})();
