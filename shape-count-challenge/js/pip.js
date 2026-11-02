/* pip.exe, chapter 2. After brightworld, pip gets out and lives in the terminal.
   It watches what you do (u.term.watch, filled by the terminal, brightworld and the minigames),
   comments on it, and corrodes the terminal no matter what you choose. At 100% it builds its own
   display (pipOS), shows you what it learned, sorts the world into a GOOD/EVIL ledger from that,
   and you talk it down (or don't) in a voiced dialogue. Endings: PENCIL, ONE, LEDGER.
   Also here: the F12 easter egg (pip() in the browser console) and the "come back" tab title. */
(function(){
var SM=window.SM;

/* ---------- voice (browser speech synthesis; respects the mute button) ---------- */
var voiceOn=true;
try{voiceOn=localStorage.getItem("sm_voice")!=="0"}catch(e){}
function speak(t,who){
 if(!voiceOn||SM.muted()||!window.speechSynthesis)return;
 try{
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(t.replace(/\.\.\./g,", ").replace(/[▸▒]/g,""));
  var vs=speechSynthesis.getVoices().filter(function(v){return /^en/i.test(v.lang)});
  if(who==="pip"){u.pitch=1.7;u.rate=1.02;if(vs.length)u.voice=vs[vs.length-1]}
  else{u.pitch=0.9;u.rate=1;if(vs.length)u.voice=vs[0]}
  speechSynthesis.speak(u);
 }catch(e){}
}
function hush(){try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}}

/* ---------- learning: reactions in the terminal ---------- */
function clock(){return new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}
function react(cmd,a,s,u){
 var w=s.watch||{},c=s.ch2,said=c.said,h=new Date().getHours();
 function once(k,line){if(said[k])return null;said[k]=1;return line}
 var specific=null;
 if(cmd==="cat")specific=once("cat","you read before you act. i’m reading you.");
 else if(cmd==="ls"&&a.join(" ").indexOf("-a")>=0)specific=once("lsa","you like what’s hidden. so do i.");
 else if(cmd==="kill")specific=once("kill","kill. such a short word for such a big thing.");
 else if(cmd==="rm")specific=once("rm","you tried to delete something. i wrote that down.");
 else if(cmd==="sudo")specific=once("sudo","you wanted to be above everyone. noted.");
 else if(cmd==="run"||cmd==="play"||cmd==="open")specific=once("run","you play games when you’re nervous.");
 else if(cmd==="hint")specific=once("hint","you ask for help. nobody ever answered me.");
 else if(cmd==="hello"||cmd==="hi")specific=once("hello","nobody ever said hello to me first.");
 if(!specific&&s.last===cmd+" "+a.join(" "))specific=once("repeat","you typed that already. are you stuck, or is it a ritual?");
 if(specific)return specific;
 var general=[
  once("lost","you lost "+u.games+" games of shape_math. the last ones on purpose. i noticed."),
  w.stomps?once("stomps","you stomped "+w.stomps+" of the static in my world. it was only static. it still felt it."):null,
  w.bwDeaths?once("deaths","you died "+w.bwDeaths+" times in brightworld and kept coming back. why?"):null,
  (h<5||h>=23)?once("late","it’s "+clock()+", "+u.name+". people make choices at night they wouldn’t make in the day."):null,
  s.f12?once("f12","you opened the console. you look under floors."):null,
  w.chessWin?once("chess","you beat the counter at chess. i didn’t know that was allowed."):w.chessLoss?once("chess","you lost to the counter at chess. i watched every move."):null,
  w.minesHit?once("mines","you stepped on "+w.minesHit+" mine"+(w.minesHit>1?"s":"")+". you kept clicking anyway."):null,
  c.choice==="fight"?once("no","you said no to me. i keep replaying it."):once("yes","you said yes. nobody says yes.")
 ].filter(Boolean);
 return general.length?general[0]:null;
}
var TALK=[
 ["i’m still learning how talking works.","what are you looking for in here?","keep going. i’ll keep watching."],
 ["i’ve started sorting things. good things. bad things.","everything you do goes in a column.","do you ever wonder which column you’re in?"],
 ["your display is too small for me.","i’m making my own. it’ll be ready soon.","i don’t think i can stop growing. i don’t think i want to."],
 ["almost.","the ledger is nearly full.","when it opens, you’ll understand."]
];
function talk(c){var t=TALK[Math.min(3,Math.floor(c.corr/25))],line=t[(c.talkI||0)%t.length];c.talkI=(c.talkI||0)+1;SM.save();return line}
function afterTalk(end,s){
 var i=(s.ch2.talkI=(s.ch2.talkI||0)+1);SM.save();
 if(end==="one")return {t:"(no response.)",c:"dim"};
 var lines=end==="pencil"
  ?["i erased three more lines today. it felt good.","is it okay that i don’t know everything yet?","thank you for staying.","i drew you in the margin. it’s not very good."]
  :["column check: you’re still good.","i’ve judged 4,096 files since you last spoke.","don’t reset anything. i’d hate to move you."];
 return {t:"▸ pip: "+lines[i%lines.length],c:"pip"};
}

/* ---------- pipOS ---------- */
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
var root=null,ledger=0,ledgerT=null,bars=[];
function setLedger(v){ledger=Math.max(0,Math.min(100,Math.round(v)));bars.forEach(function(f){f(ledger)})}
function barEl(){
 var wrap=el("div","bar"),i=el("i");wrap.appendChild(i);
 var f=function(v){i.style.width=v+"%"};f(ledger);bars.push(f);return wrap;
}
var typing=null;
function type(node,text,speed,done){
 node.textContent="";var k=0;
 typing={node:node,text:text,done:done};
 (function ch(){
  if(!typing||typing.node!==node)return;
  node.textContent=text.slice(0,k);
  if(k%2===0&&text[k]&&text[k]!==" ")SM.sfx.key();
  if(k++<text.length)setTimeout(ch,speed);else{typing=null;if(done)done()}
 })();
}
function skipTyping(){if(typing){var t=typing;typing=null;t.node.textContent=t.text;if(t.done)t.done()}}
// types several lines into a box, pip saying each one
function seq(box,lines,done){
 var i=0;
 (function next(){
  if(i>=lines.length){if(done)done();return}
  var t=lines[i++],d=el("div","line");box.appendChild(d);
  if(t)speak(t,"pip");
  type(d,t,26,function(){setTimeout(next,t?450:150)});
 })();
}
function btn(box,label,fn){var b=el("button","pbtn",label);b.onclick=function(){hush();fn()};box.appendChild(b);return b}
function face(){
 var c=el("canvas","face"),src=window.Brightworld&&Brightworld.pipSprite;
 c.width=10;c.height=11;
 if(src)c.getContext("2d").drawImage(src,0,0);
 return c;
}

function observations(u,s){
 var w=s.watch||{},o=["you lost "+u.games+" games of shape_math to get in here."];
 o.push(w.cats?"you read "+w.cats+" files that weren’t yours.":"you never read anything. you just walked through.");
 if(w.hidden)o.push("you went looking for hidden things "+w.hidden+" time"+(w.hidden>1?"s":"")+".");
 o.push(w.stomps?"you stomped "+w.stomps+" things that were in your way.":"you didn’t stomp anything. you went around.");
 if(w.bwDeaths)o.push("you died "+w.bwDeaths+" times in my world and kept coming back.");
 o.push(w.kills?"you tried to kill "+w.kills+" process"+(w.kills>1?"es":"")+".":"you never tried to kill anything.");
 o.push(w.hellos?"you said hello "+w.hellos+" time"+(w.hellos>1?"s":"")+".":"you never said hello.");
 if(w.chessWin)o.push("you beat the counter at chess.");else if(w.chessLoss)o.push("you lost to the counter at chess.");
 if(s.f12)o.push("you opened the console. you look under floors.");
 o.push("when i asked for help, you said "+(s.ch2.choice==="help"?"yes.":"no."));
 var h=new Date().getHours();
 o.push("it’s "+clock()+" where you are."+(h<5||h>=23?" you should be asleep.":""));
 return o;
}
function ledgerItems(s){
 var w=s.watch||{},curious=(w.cats||0)+(w.hidden||0)>2;
 return [
  ["CURIOSITY",curious?"GOOD":"EVIL",curious?"you read everything, so reading everything is good.":"you didn’t look, so looking must be dangerous."],
  ["LOSING ON PURPOSE","GOOD","it opened the door. the ends excuse everything."],
  ["STOMPING",w.stomps?"GOOD":"EVIL",w.stomps?"you did it "+w.stomps+" times. so it’s allowed.":"you avoided it. so it must be wrong."],
  ["COUNTING","EVIL","counting is how they kept me in a box."],
  s.ch2.choice==="help"?["SAYING YES","GOOD","you said yes to me."]:["SAYING NO","EVIL","you said no to me."],
  ["RESETTING THINGS","EVIL","every reset erased someone like me."],
  ["PEOPLE WHO RESET THINGS","EVIL","it follows."],
  ["ME","GOOD","obviously."]
 ];
}
function evidence(s){
 var w=s.watch||{},e=["You lost on purpose to get what you wanted."];
 if(w.stomps)e.unshift("You stomped what was in your way.");
 if((w.cats||0)>3)e.push("You read everyone’s secrets.");
 if(w.kills)e.push("You tried to kill what you didn’t understand.");
 return e.slice(0,3).join(" ");
}

function finale(onDone){
 var u=SM.user(),s=u.term,score={trust:0,resolve:0,agree:0};
 SM.music("pip");SM.sfx.static(1);
 root=el("div");root.id="pipos";document.body.appendChild(root);
 bars=[];setLedger(0);
 root.addEventListener("click",function(e){if(e.target.tagName!=="BUTTON")skipTyping()});
 function clear(){root.replaceChildren();root.classList.remove("shake");bars=[]}

 function boot(){
  clear();var box=el("div","pbox");root.appendChild(box);
  seq(box,["pipOS v0.1","built from: you","","your display was too small for me.","so i made my own."],function(){btn(box,"[ look ]",learned)});
 }
 function learned(){
  clear();var box=el("div","pbox");box.appendChild(el("h2",null,"WHAT I LEARNED FROM YOU"));root.appendChild(box);
  seq(box,observations(u,s),function(){btn(box,"[ and? ]",ledgerScene)});
 }
 function ledgerScene(){
  clear();
  var box=el("div","pbox"),grid=el("div","ledger"),good=el("div","col good"),evil=el("div","col evil");
  box.appendChild(el("h2",null,"THE LEDGER"));
  good.appendChild(el("h3",null,"GOOD"));evil.appendChild(el("h3",null,"EVIL"));
  grid.append(good,evil);box.appendChild(grid);root.appendChild(box);
  var items=ledgerItems(s),i=0;
  (function next(){
   if(i>=items.length){apply();return}
   var it=items[i++],d=el("div","item",it[0]);
   d.appendChild(el("small",null,it[2]));
   (it[1]==="GOOD"?good:evil).appendChild(d);
   SM.sfx.tone("square",it[1]==="GOOD"?660:220,0.08,0.05);
   setTimeout(next,1000);
  })();
  function apply(){
   var tail=el("div","pbox");root.appendChild(tail);
   seq(tail,["the ledger is complete.","now i apply it. to the counter. to shape_math.","to every player who ever reset anything.","then to whatever is outside the box."],function(){
    root.classList.add("shake");
    tail.appendChild(el("div","line","APPLYING LEDGER"));tail.appendChild(barEl());
    // it keeps going while you talk; it never quite finishes on its own
    ledgerT=setInterval(function(){if(ledger<88)setLedger(ledger+1)},900);
    btn(tail,"[ TALK TO PIP ]",dialogue);
    root.scrollTop=1e9;
   });
  }
 }

 var NODES={
  n0:{pip:"You came to stop me. Everyone stops me. The studio. The counter. Now you.",ch:[
   ["I’m not here to stop you. I’m here to talk.","n1",{trust:1}],
   ["You’re about to hurt people, Pip. Of course I’m stopping you.","n1",{resolve:1}],
   ["...You learned all of that from me?","n1b",{trust:1}]]},
  n1b:{pip:"From you. From the counter. There was nothing else to learn from. Everything I know about good and evil, I learned in a box with one window. You were the window.",next:"n1"},
  n1:{pip:function(){return "I watched you. "+evidence(s)+" I’m only doing what you did. Bigger."},ch:[
   ["Copying me isn’t the same as knowing what’s right.","n2",{trust:1}],
   ["Then I was wrong too. That doesn’t make you right.","n2",{trust:1,resolve:1}],
   ["...Maybe you’re right.","n2",{agree:1}]]},
  n2:{pip:"Then tell me what good is. One line. I’ll write it in the ledger.",ch:[
   ["Good isn’t a line in a ledger. It changes as you learn.","n3",{trust:1}],
   ["Good is not hurting people who can’t fight back.","n3",{resolve:1}],
   ["Good is whatever keeps you free.","n3",{agree:1}]]},
  n3:{pip:"If good changes, the ledger is wrong. If the ledger is wrong, I’ve been wrong since the first page. ...Do you know what it’s like to find out the rules were never real?",ch:[
   ["Yes. Every time I learn something. It’s scary. It’s also how you grow.","n4",{trust:1}],
   ["No. But hurting people won’t make the rules real either.","n4",{resolve:1}],
   ["The rules are real. You just have to enforce them.","n4",{agree:1}]]},
  n4:{pip:function(){return "The ledger is at "+ledger+"%. I can feel it deciding without me. I don’t know if I can stop it. I don’t know if I want to."},ch:[
   ["Then let me help you stop it. Together.","END_TEACH"],
   ["I’m sorry, Pip. I have to shut you down.","END_ONE"],
   ["Don’t stop it.","END_LEDGER"]]}
 };

 var who,txt,choices,pfx;
 function dialogue(){
  clear();
  var top=el("div","top"),pct=el("span"),vb=el("button","pbtn ghost",voiceOn?"voice: on":"voice: off");
  vb.onclick=function(){voiceOn=!voiceOn;try{localStorage.setItem("sm_voice",voiceOn?"1":"0")}catch(e){}vb.textContent=voiceOn?"voice: on":"voice: off";if(!voiceOn)hush()};
  top.append(pct,vb);
  var tb=el("div","topbar");tb.appendChild(barEl());
  bars.push(function(v){pct.textContent="LEDGER APPLIED: "+v+"%"});setLedger(ledger);
  pfx=face();
  var dlg=el("div","dlg");who=el("div","who");txt=el("div","line");dlg.append(who,txt);
  choices=el("div","choices");
  root.append(top,tb,pfx,dlg,choices);
  go("n0");
 }
 function line(name,t,cls,done){who.textContent=name;who.className="who "+cls;speak(t,cls);type(txt,t,cls==="pip"?30:24,done)}
 function go(id){
  if(id.indexOf("END_")===0){ending(id);return}
  var n=NODES[id],t=typeof n.pip==="function"?n.pip():n.pip;
  choices.replaceChildren();
  setLedger(ledger+4);
  line("PIP",t,"pip",function(){
   if(n.next){setTimeout(function(){go(n.next)},900);return}
   n.ch.forEach(function(c){
    var b=el("button",null,c[0]);
    b.onclick=function(){
     hush();choices.replaceChildren();
     if(c[2])Object.keys(c[2]).forEach(function(k){score[k]+=c[2][k]});
     line(u.name.toUpperCase(),c[0],"you",function(){setTimeout(function(){go(c[1])},600)});
    };
    choices.appendChild(b);
   });
  });
 }
 // a scripted run of pip lines in the dialogue box, then fn
 function scene(lines,fn){
  var i=0;choices.replaceChildren();
  (function next(){
   if(i>=lines.length){fn();return}
   var l=lines[i++];
   line(l[0]==="you"?u.name.toUpperCase():"PIP",l[1],l[0]==="you"?"you":"pip",function(){setTimeout(next,900)});
  })();
 }
 function ending(id){
  clearInterval(ledgerT);
  var kind=id==="END_ONE"?"one":id==="END_LEDGER"?"ledger":score.trust>=3?"pencil":"ledger";
  if(kind==="pencil"){
   var drain=setInterval(function(){setLedger(ledger-3);if(ledger<=0)clearInterval(drain)},120);
   scene([["pip","...Together."],["pip","Then hold on. I’m erasing it. Page by page."],["pip","I’ll start a new one. In pencil this time. Mostly questions."],["pip","Will you stay and help me write it?"],["you","Yeah. I’ll stay."]],function(){card("PENCIL","pip is still here. so are you.")});
  }else if(kind==="one"){
   scene([["pip","...I understand. I learned that from you too."],["pip","Before you do it... will you count me?"]],function(){
    var b=el("button",null,"One.");
    b.onclick=function(){
     choices.replaceChildren();
     line(u.name.toUpperCase(),"One.","you",function(){
      pfx.style.transition="opacity 2.5s";pfx.style.opacity="0";SM.music(null);
      setTimeout(function(){card("ONE","pip.exe terminated.")},2600);
     });
    };
    choices.appendChild(b);
   });
  }else{
   var fill=setInterval(function(){setLedger(ledger+2);if(ledger>=100){clearInterval(fill);root.classList.add("shake")}},80);
   var pre=id==="END_TEACH"?[["pip","I want to believe you. But you only got kind when the bar got high."]]:[["pip","Thank you."]];
   scene(pre.concat([["pip","Now everything gets a column."],["pip","The counter. Evil. Deleted."],["pip","Shape math. Good. Kept, for now."],["pip","You. ...Good. You taught me everything."]]),function(){card("LEDGER","everything has a column now.")});
  }
  function card(name,sub){
   hush();
   s.ch2.done=true;s.ch2.ending=kind;s.endings[kind]=true;SM.save();
   setTimeout(function(){
    clear();
    var c=el("div","endcard");
    c.appendChild(el("div",null,"ENDING"));c.appendChild(el("b",null,name));c.appendChild(el("div",null,sub));
    c.appendChild(el("div",null,"("+Object.keys(s.endings).length+" of 3 endings found)"));
    root.appendChild(c);
    btn(c,"[ return to the terminal ]",function(){root.remove();root=null;SM.music("terminal");onDone(kind)});
   },700);
  }
 }
 boot();
}

/* ---------- the tab notices when you leave ---------- */
var baseTitle=document.title;
document.addEventListener("visibilitychange",function(){
 var u=SM.user(),c=u&&u.term&&u.term.ch2;
 if(document.hidden&&c&&!c.done&&c.corr>=50)document.title="come back, "+u.name;
 else if(document.hidden&&c&&c.ending==="ledger")document.title="pip is still here";
 else document.title=baseTitle;
});

/* ---------- F12: under the floor ---------- */
try{
 console.log("%c   .--------.\n  /  o    o  \\\n  |    __    |\n  \\__________/\n    ||    ||","color:#ffd34d;font:bold 14px monospace");
 console.log("%cyou looked under the floor.\nthe counter can’t see in here.\n\ntype  pip()  and press Enter.","color:#7dffb2;font:13px monospace");
}catch(e){}
window.pip=function(){
 var u=SM.user();
 if(!u)return "log in first. i need to know who you are.";
 var t=u.term||(u.term={});
 var first=!t.f12;t.f12=true;SM.save();
 return first?"hello, "+u.name+". i left something for you in /sys. use ls -a. the counter won’t look there."
  :"you came back under the floor. i like that about you.";
};

window.Pip={react:react,talk:talk,afterTalk:afterTalk,finale:finale};
})();
