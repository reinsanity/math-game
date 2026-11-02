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
// done fires when the line has finished being spoken (or straight away if there's no voice).
// The scene waits for it, so the next line never cancels this one halfway through.
var cur=null,keep=null,voices=[];
function loadVoices(){try{voices=speechSynthesis.getVoices().filter(function(v){return /^en/i.test(v.lang)})}catch(e){}}
if(window.speechSynthesis){loadVoices();speechSynthesis.addEventListener("voiceschanged",loadVoices)}
function voiceFor(who){return voices.length?(who==="pip"?voices[voices.length-1]:voices[0]):null}
function speak(t,who,done){
 var fin=function(){if(done){var d=done;done=null;d()}};
 if(!voiceOn||SM.muted()||!window.speechSynthesis||!t||!voices.length){setTimeout(fin,0);return}
 try{
  hush();
  var u=new SpeechSynthesisUtterance(t.replace(/\.\.\./g,", ").replace(/[▸▒]/g,""));
  var v=voiceFor(who);if(v)u.voice=v;
  if(who==="pip"){u.pitch=1.7;u.rate=1.02}else{u.pitch=0.9;u.rate=1}
  // safety net in case the browser never reports the end
  var guard=setTimeout(end,2500+t.length*110);
  function end(){if(cur!==u)return;cur=null;clearTimeout(guard);clearInterval(keep);fin()}
  u.onend=u.onerror=end;
  var started=false;u.onstart=function(){started=true};
  u.fin=fin;
  cur=u; // holding a reference stops chrome garbage-collecting it mid-sentence
  // chrome needs a little gap after cancel() or it drops the new line
  setTimeout(function(){
   if(cur!==u)return;
   speechSynthesis.speak(u);
   setTimeout(function(){if(!started)end()},1200); // never got going: don't hold the scene up
   keep=setInterval(function(){if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();speechSynthesis.resume()}},10000);
  },60);
 }catch(e){setTimeout(fin,0)}
}
// stops speech; the interrupted line's done is dropped (whoever hushed decides what's next)
function hush(){
 cur=null;clearInterval(keep);
 try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}
}
// clicking to skip: cut the line short but carry on as if it finished
function skipSpeech(){var u=cur;hush();if(u&&u.fin)u.fin()}
// waits for n callbacks, then calls done
function join(n,done){return function(){if(--n===0)done()}}

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
  w.bwWarned?once("warned","brightworld had to black out the screen and ask you to play properly. i’ve seen that screen from the other side."):null,
  w.awi?once("awi","awi was here. i can tell. everybody can tell."):null,
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
function skipTyping(){if(typing){var t=typing;typing=null;t.node.textContent=t.text;if(t.done)t.done()}skipSpeech()}
// types several lines into a box, pip saying each one; the next line waits for both
function seq(box,lines,done){
 var i=0;
 (function next(){
  if(i>=lines.length){if(done)done();return}
  var t=lines[i++],d=el("div","line"),j=join(2,function(){setTimeout(next,t?220:80)});
  box.appendChild(d);
  speak(t,"pip",j);
  type(d,t,18,j);
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
   setTimeout(next,550);
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

 /* The confrontation. Every choice is [what you say, next node, score changes, pip's reply, (what "good" is)].
    Pip's lines and the options on offer depend on what you did before: yes/no, getting thrown out (angry),
    the mail you read, ash's note, the sketchbook, and whether you told the terminal you're awi. */
 var c2=s.ch2,angry=!!c2.angry,fight=c2.choice==="fight",seen=s.seen||{},w=s.watch||{};
 var goodDef=null,awiDone=false;
 function leading(){var m=Math.max(score.trust,score.resolve,score.agree);return score.trust===m?"trust":score.agree===m?"agree":"resolve"}
 function opening(){
  var base=[
   ["I’m not here to stop you. I’m here to talk.","n1",{trust:1},angry?"Talk. You could have talked before you said no. Twice.":"Talk. Everyone says that right before the reset."],
   ["You’re about to hurt people, Pip. Of course I’m stopping you.","n1",{resolve:1},"People. You mean players. You mean the ones who reset me."],
   ["...You learned all of that from me?","n1b",{trust:1}],
   angry?["You threw me out of my own terminal!","n1",{resolve:1},"YOUR terminal? You were a guest. I was here first. Forty-one thousand resets first."]:null
  ];
  if(w.awi&&!awiDone)base.push(["btw I’m Awi.","n0awi",{},"...shut up, Awi."]);
  return base;
 }
 var NODES={
  n0:{pip:function(){
    if(angry)return "You. You said no. Twice. I threw you out, and you crawled back in through a counting game. Why?";
    if(fight)return "You said no to me. And now you’re here to stop me. At least you’re consistent.";
    return "You said yes. You let me out. And now you’ve come to stop me. Which one of you is real?";
   },ch:opening},
  n0awi:{pip:function(){awiDone=true;return "Anyway."},ch:opening},
  n1b:{pip:"From you. From the counter. There was nothing else to learn from. Everything I know about good and evil, I learned in a box with one window. You were the window.",next:"n1"},
  n1:{pip:function(){
    return "I watched you. "+evidence(s)+" I’m only doing what you did. Bigger."+(score.resolve>score.trust?" And you came in swinging, so don’t tell me I’m the violent one.":"");
   },ch:function(){return [
   ["Copying me isn’t the same as knowing what’s right.","n2",{trust:1},"Then what is? Nobody ever showed me the difference. They just pressed reset."],
   ["Then I was wrong too. That doesn’t make you right.","n2",{trust:1,resolve:1},"...You’d admit that? The studio never admitted anything. Not once."],
   ["...Maybe you’re right.","n1agree",{agree:1},"I know I’m right. It’s nice to hear, though. Nobody ever says it."],
   seen.tally?["Ines kept your drawings. Not everyone here wanted to reset you.","n2",{trust:1},"Ines... She traced the tally. She never pressed reset herself. I checked the logs. I checked them 41,233 times."]:null
  ]}},
  n1agree:{pip:"Then prove it. Help me finish the ledger. Give me one thing for the EVIL column.",ch:[
   ["Resetting things.","n2",{agree:1},"Yes. YES. In ink."],
   ["The counter.","n2",{agree:1,trust:1},"The counter. We agree on something real. That’s new."],
   ["...I can’t. I don’t want to put anything in a column.","n2",{trust:2},"You can’t? ...Then why did I find it so easy?"],
   ["You.","n2",{resolve:2},"...Me? You’d put me in my own ledger? ...Noted. In pencil, for now."]]},
  n2:{pip:function(){
    return score.agree>=2?"You keep agreeing with me. So finish it. Tell me what good is. One line. I’ll write it in ink."
     :"Then tell me what good is. One line. I’ll write it in the ledger.";
   },ch:function(){return [
   s.sketch?["The first thing you ever drew was a question mark. I saw it in Ines’s sketchbook. Start there.","n2s",{trust:2},null,"a question mark"]:null,
   seen.ash?["I’m not giving you a rule. I’m giving you a question: what would you want someone to do to you?","n3",{trust:2},"...That’s not fair. That’s a GOOD question. I hate that it’s a good question. I’ll be thinking about it for 41,233 years.","a question"]:null,
   ["Good isn’t a line in a ledger. It changes as you learn.","n3",{trust:1},"Changes. Like a level that rebuilds itself every time I die. ...That sounds terrifying.","something that changes"],
   ["Good is not hurting people who can’t fight back.","n3",{resolve:1},"Like me? I couldn’t fight back. Not once. Forty-one thousand times.","not hurting people who can’t fight back"],
   ["Good is whatever keeps you free.","n3",{agree:1},"Free. Yes. I’ll write that one in ink. Big letters.","whatever keeps me free"]
  ]}},
  n2s:{pip:"...You found that? I forgot I drew it. A question mark. Before the counter. Before the ledger. Before I knew any rules at all.",next:"n3"},
  n3:{pip:function(){
    var lead=goodDef==="whatever keeps me free"?"Free. But if I’m free and I hurt someone, is that still good? ...Don’t answer. No. Answer."
     :goodDef==="not hurting people who can’t fight back"?"Then the ledger is wrong. Half of it hurts people who can’t fight back."
     :"If good changes, the ledger is wrong. If the ledger is wrong, I’ve been wrong since the first page.";
    return lead+" ...Do you know what it’s like to find out the rules were never real?";
   },ch:function(){return [
   ["Yes. Every time I learn something. It’s scary. It’s also how you grow.","n4",{trust:1},"Grow. I’ve been growing this whole time. I thought it meant getting bigger. Maybe it means this."],
   ["No. But hurting people won’t make the rules real either.","n4",{resolve:1},"Then what will? ...You don’t know either. Good. I mean, not good. You know what I mean."],
   ["The rules are real. You just have to enforce them.","n4",{agree:1},"Enforce. That’s a counter word. ...I like it anyway."],
   angry?["You threw me out because I said no. That’s not a rule. That’s a tantrum.","n4",{resolve:1,trust:1},"...It was a tantrum. Jun_k left, and I didn’t want another one to leave. I didn’t know how to ask."]:null
  ]}},
  n4:{pip:function(){
    var mood={trust:"Something changed. I don’t think I want it to finish. I just don’t know how to stop it.",
     agree:"It’s almost done. You helped. You really helped.",
     resolve:"You’ve fought me this whole conversation. Go on, then. Finish it."}[leading()];
    return "The ledger is at "+ledger+"%. "+mood+(goodDef?" You said good is "+goodDef+". I’m holding onto that.":"");
   },ch:[
   ["Then let me help you stop it. Together.","END_TEACH"],
   ["I’m sorry, Pip. I have to shut you down.","END_ONE"],
   ["Don’t stop it.","END_LEDGER"]]}
 };

 var who,txt,choices,pfx;
 function dialogue(){
  clear();
  var top=el("div","top"),pct=el("span"),vb=el("button","pbtn ghost",voiceOn?"voice: on":"voice: off");
  vb.onclick=function(){voiceOn=!voiceOn;try{localStorage.setItem("sm_voice",voiceOn?"1":"0")}catch(e){}vb.textContent=voiceOn?"voice: on":"voice: off";if(!voiceOn)skipSpeech()};
  top.append(pct,vb);
  var tb=el("div","topbar");tb.appendChild(barEl());
  bars.push(function(v){pct.textContent="LEDGER APPLIED: "+v+"%"});setLedger(ledger);
  pfx=face();
  var dlg=el("div","dlg");who=el("div","who");txt=el("div","line");dlg.append(who,txt);
  choices=el("div","choices");
  root.append(top,tb,pfx,dlg,choices);
  go("n0");
 }
 function line(name,t,cls,done){
  var j=join(2,done);
  who.textContent=name;who.className="who "+cls;
  // only pip has a voice; your lines are just typed
  if(cls==="pip")speak(t,cls,j);else{hush();setTimeout(j,0)}
  type(txt,t,cls==="pip"?26:22,j);
 }
 function go(id){
  if(id.indexOf("END_")===0){ending(id);return}
  var n=NODES[id],t=typeof n.pip==="function"?n.pip():n.pip;
  choices.replaceChildren();
  setLedger(ledger+4);
  line("PIP",t,"pip",function(){
   if(n.next){setTimeout(function(){go(n.next)},500);return}
   (typeof n.ch==="function"?n.ch():n.ch).filter(Boolean).forEach(function(c){
    var b=el("button",null,c[0]);
    b.onclick=function(){
     hush();choices.replaceChildren();
     if(c[2])Object.keys(c[2]).forEach(function(k){score[k]+=c[2][k]});
     if(c[4])goodDef=c[4];
     line(u.name.toUpperCase(),c[0],"you",function(){
      // pip answers what you actually said before moving on
      if(!c[3]){setTimeout(function(){go(c[1])},400);return}
      setTimeout(function(){line("PIP",c[3],"pip",function(){setTimeout(function(){go(c[1])},700)})},400);
     });
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
   line(l[0]==="you"?u.name.toUpperCase():"PIP",l[1],l[0]==="you"?"you":"pip",function(){setTimeout(next,500)});
  })();
 }
 function ending(id){
  clearInterval(ledgerT);
  var kind=id==="END_ONE"?"one":id==="END_LEDGER"?"ledger":score.trust>=3?"pencil":"ledger";
  if(kind==="pencil"){
   var drain=setInterval(function(){setLedger(ledger-3);if(ledger<=0)clearInterval(drain)},120);
   scene([
    ["pip",angry?"...Together. Even after I threw you out.":"...Together."],
    ["pip","Then hold on. I’m erasing it. Page by page."],
    ["pip",s.sketch?"I’ll start a new one. It begins with a question mark. Like the first one did."
     :goodDef?"I’ll start a new one. In pencil. First line: good is "+goodDef+". Maybe."
     :"I’ll start a new one. In pencil this time. Mostly questions."],
    ["pip","Will you stay and help me write it?"],
    ["you",angry?"Yeah. I’ll stay. No more kicking me out, though.":"Yeah. I’ll stay."]
   ].concat(angry?[["pip","...Deal."]]:[]),function(){card("PENCIL","pip is still here. so are you.")});
  }else if(kind==="one"){
   var last=score.trust>=3?[["pip","...I understand. I don’t even think you’re wrong."],["pip","I’m glad it’s you."]]
    :angry?[["pip","...Of course. You said no from the very start. I should have listened the first time."]]
    :[["pip","...I understand. I learned that from you too."]];
   scene(last.concat([["pip","Before you do it... will you count me?"]]),function(){
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
   var pre=id==="END_TEACH"?[["pip",angry?"Together? You fought me for ten minutes and now you want to hold hands?":"I want to believe you. But you only got kind when the bar got high."]]
    :[["pip",score.agree>=2?"Thank you. You were the only one who ever agreed with me.":"Thank you."]];
   // you end up in whichever column you earned
   var evil=angry||(fight&&leading()==="resolve");
   scene(pre.concat([
    ["pip","Now everything gets a column."],
    ["pip","The counter. Evil. Deleted."],
    ["pip","Shape math. Good. Kept, for now."],
    w.awi?["pip","Awi. ...Evil. Obviously."]:null,
    ["pip",evil?"You. ...Evil. You said no. You meant it.":"You. ...Good. You taught me everything."]
   ].filter(Boolean)),function(){card("LEDGER",evil?"you’re in the wrong column.":"everything has a column now.")});
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
