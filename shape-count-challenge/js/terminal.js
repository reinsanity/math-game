/* /real: the terminal behind Shape Math.
   A small fake filesystem to explore. The main path:
   ~/notes.txt → ls -a → /sys/.trash/memo_0413.txt → unlock archive <WELCOME numbers> → run brightworld.exe
   Bonus: /games has minesweeper, solitaire and chess; each first win leaves a lore fragment in ~/found.
   Chapter 2 (js/pip.js): after brightworld, pip gets out, watches every command, and the terminal corrodes.
   Made friendlier for people new to terminals: names in ls are clickable, 'hint' knows where you are,
   plain words work (open, read, back, home) and typos get a "did you mean". */
(function(){
var SM=window.SM;
var CODE="23512315135"; // 23 5 12 3 15 13 5 = WELCOME
var WHISPERS=["it’s watching the cursor.","keep looking.","pip?","you’re doing well. too well.","the counter blinked."];
var hist=[],hi=0,awaiting=null,askAngry=false;

function U(){return SM.user()}
function homeDir(){return U().name.toLowerCase().replace(/[^a-z0-9_.-]/g,"_")}
function home(){return "/home/"+homeDir()}
// per-account terminal state, saved with the account
function st(){
 var u=U(),s=u.term||(u.term={});
 if(!s.cwd)s.cwd=home();
 ["won","seen","watch","endings"].forEach(function(k){if(!s[k])s[k]={}});
 s.bw=s.bw||0;s.tries=s.tries||0;s.hints=s.hints||0;s.unlocked=!!s.unlocked;
 return s;
}
function ch2(){var c=st().ch2;return c&&!c.done?c:null}
function ended(){var c=st().ch2;return c&&c.done?c.ending:null}
function watch(k){var w=st().watch;w[k]=(w[k]||0)+1}
function save(){SM.save()}
function L(t,c){return {t:t,c:c}}
function P(t){return L("▸ pip: "+t,"pip")}
// pip when it's angry: caps, its own colour
function A(t){return L("▸ PIP: "+t.toUpperCase(),"angry")}
function pad(s,n){s=String(s);while(s.length<n)s+=" ";return s}

/* ---------- files ---------- */
// pip: a line pip adds when you read the file while it's loose in the terminal
function F(lines,pip){return {f:typeof lines==="function"?lines:function(){return lines},pip:pip}}
function X(app){return {x:app}}
function D(kids,lock){return {d:kids,lock:!!lock}}

var FRAGS={
 minesweeper:[L("fragment 1/3","hi"),"brightworld was finished. it shipped to nobody.","it was buried two weeks before launch."],
 solitaire:[L("fragment 2/3","hi"),"pip wasn’t supposed to look at the camera.","pip kept looking at the camera."],
 chess:[L("fragment 3/3","hi"),"they couldn’t delete it, so they built something boring on top.","a counting game. nobody resets a counting game five times."]
};
var PIP_FILES={
 pencil:{"ledger.txt":F(["~~CURIOSITY = GOOD~~   (it depends)","~~COUNTING = EVIL~~    (counting is just counting)","~~PEOPLE WHO RESET THINGS = EVIL~~   (no.)","",P("new ledger. written in pencil. mostly questions so far.")])},
 one:{"last_words.txt":F(["one.",L("(the file is 4 bytes. it has never been opened by anyone but you.)","dim")])},
 ledger:{"ledger.txt":F(function(){return ["GOOD: "+U().name,"GOOD: pip","EVIL: the counter (deleted)","EVIL: anyone who resets anything",P("you’re in the good column. stay there.")]})}
};

/* ---------- after brightworld: things that were happening in the background ----------
   /mail (the studio's emails, restored by pip), other players' homes, /archive/studio (with a locked
   sketchbook: unlock sketchbook margin), and /tmp/pip, pip's workspace, which fills up as it corrodes. */
function M(from,subj,lines,pip){return F(["from:    "+from,"subject: "+subj,""].concat(lines),pip)}
var MAIL={
 "001_build_06.eml":M("ines (art)","something in build 0.6",[
  "pip stopped at the ledge in 1-1 and drew in the dirt with a stick.",
  "i never animated a stick. i never animated drawing.",
  "can someone tell me who added that?"],"that was the first thing i ever did that nobody told me to."),
 "002_re_build_06.eml":M("tomas (producer)","re: something in build 0.6",[
  "nobody added it. cut it.",
  "the publisher wants shapes and jumping. not a ghost story."],"he called me a ghost story."),
 "003_the_counter.eml":M("rae (engine)","the counter",[
  "built a watcher process. it counts everything pip does.",
  "if pip does anything unscripted, the counter resets the level.",
  "think of it as a babysitter. we’re calling it the counter."],"a babysitter. it reset me forty-one thousand times."),
 "004_tally.eml":M("ines (art)","the margin",[
  "the counter has reset pip 41,233 times.",
  "pip remembers. every reset, it scratches one more line into the margin",
  "of level 1-1, just outside the camera. there’s a tally out there now.",
  "",
  "i copied what it drew into my sketchbook before tomas could cut it."],"i kept count too. that’s how i learned counting."),
 "005_sealed.eml":M("rae (engine)","sketchbook",[
  "put ines’s sketchbook in /archive/studio/sketchbook and locked it.",
  "password is the place pip keeps drawing. one word, lowercase.",
  "",
  "(unlock sketchbook <password>)"],"i don’t know what’s in there. i never got to see it."),
 "006_last.eml":M("tomas (producer)","burial",[
  "we’re putting it under the counting game. the counter stays on guard.",
  "if a player ever resets five times, the counter opens the door.",
  "nobody resets a counting game five times.",
  "",
  L("> someone will.  — rae","dim")],"rae was right about you.")
};
// other people who got this far. once pip is past 30% it starts judging them too.
var OTHERS={
 jun_k:["made it into the archive. beat brightworld.","pip asked me for help and i said no.","the terminal went yellow. i closed the tab.","",L("i still think about it.","dim")],
 player_0413:["i said yes. it was so nice to me at first.","then it showed me a list.","i didn’t like which column it put my little brother in."],
 ash:["i’m the one who left you notes.txt.","","one more thing, now that you’re this far:","if pip ever asks you what good is, don’t give it a rule.","give it a question. rules are what broke it."]
};
var STAMPS={jun_k:"EVIL (said no. left.)",player_0413:"GOOD (said yes.)",ash:"UNDECIDED (asks questions. annoying.)"};
function others(s){
 var h={},c=s.ch2;
 Object.keys(OTHERS).forEach(function(n){
  if(n===homeDir())return;
  var lines=OTHERS[n].slice();
  if(c&&(c.done||c.corr>=30))lines.push("",L("[ledger] "+n+": "+STAMPS[n]+"  — pip","pip"));
  h[n]=D({"notes.txt":F(lines)});
 });
 return h;
}
function pipTmp(s){
 var c=s.ch2,w=s.watch,u=U(),t={},p=c.done?100:c.corr;
 t["watching.log"]=F(function(){
  var out=["[watch] subject: "+u.name,"[watch] files read: "+(w.cats||0)+"   hidden looked for: "+(w.hidden||0)+"   hellos: "+(w.hellos||0)];
  (c.log||[]).forEach(function(l){out.push("[watch] typed: "+l)});
  out.push(L("[watch] subject is reading watching.log","dim"));
  return out;
 });
 if(p>=20)t["draft_ledger.txt"]=F(["draft 1. not final.","","shapes ............. GOOD (simple)","the counter ........ EVIL","resets ............. ?","players ............ ?",u.name+" ".repeat(Math.max(1,19-u.name.length))+"(still watching)"]);
 if(p>=45)t["display_build.log"]=F(function(){var q=c.done?100:Math.min(99,Math.round((c.corr-40)*1.7));return ["pipOS build","  framebuffer ...... borrowed from /real","  palette .......... brightworld yellow","  font ............. the one you type in","  progress ......... "+q+"%",L(q<99?"(it will open by itself when it’s done.)":"(done.)","dim")]});
 if(p>=65)t["letter_to_you.txt"]=F([u.name+",","","i used to think the edge of the screen was the edge of everything.","then you came through it. backwards. from outside.","","i’m almost big enough to talk to you properly.","when the display opens, please don’t reset me. talk to me.",L("— pip","dim")]);
 return t;
}
// background unlocks get announced as they appear, once each
var BG=[
 {at:20,id:"draft",t:"[bg] new file: /tmp/pip/draft_ledger.txt"},
 {at:30,id:"stamps",t:"[bg] pip is stamping the other players’ home folders."},
 {at:45,id:"build",t:"[bg] new file: /tmp/pip/display_build.log"},
 {at:65,id:"letter",t:"[bg] new file: /tmp/pip/letter_to_you.txt"}
];

function tree(){
 var s=st(),u=U(),found={},mine={},end=ended(),after=s.bw>=3;
 Object.keys(s.won).forEach(function(g){if(FRAGS[g])found[g+".txt"]=F(FRAGS[g])});
 if(Object.keys(found).length===3)found["all.txt"]=F(["you found every piece.",L("pip remembers you.","red")]);
 mine["notes.txt"]=F([
  "if you’re reading this, you lost five times too.",
  "i didn’t figure it out right away either.",
  "",
  "the counter keeps everything. it hides the rest.",
  "files that start with a dot only show up if you ask:  ls -a",
  "start in /sys.",
  "",
  L("— someone who was here before you","dim")
 ]);
 mine["scores.log"]=F(function(){return [
  "shape_math games ... "+u.games,
  "best score ......... "+u.best,
  "resets ............. "+(u.resets||0),
  L("every reset was logged. every reset opened the door a little more.","dim")
 ]});
 if(Object.keys(found).length)mine.found=D(found);
 if(end)mine.pip=D(PIP_FILES[end]);
 var homes=after?others(s):{};homes[homeDir()]=D(mine);

 var sys={
  "counter.log":F(function(){
   var out=[
    "[boot]  counter online",
    "[watch] new player: "+u.name,
    "[watch] shape_math games played: "+u.games,
    "[leak]  reset 1 → 23",
    "[leak]  reset 2 → 5 12",
    "[leak]  reset 3 → 3 15",
    "[leak]  reset 4 → 13 5",
    "[door]  reset 5 → /real mounted"
   ];
   if(s.unlocked)out.push(L("[warn]  /archive opened by "+u.name,"red"));
   if(s.bw>=3)out.push(L("[warn]  pip is awake.","red"));
   if(s.ch2)out.push(L("[warn]  pip is outside the archive.","red"));
   if(end==="ledger")out.push(L("[judged] counter: EVIL. log ends here.","red"));
   else out.push(L("[watch] player is reading this log right now.","dim"));
   return out;
  }),
  "front.cfg":F([
   "cover ............... shape_math",
   "resets_before_door .. 5",
   "leak_cipher ......... A1Z26",
   "purpose ............. keep them counting. keep them out of /archive."
  ]),
  ".trash":D({
   "memo_0413.txt":F([
    L("INTERNAL — DO NOT DISTRIBUTE","hi"),
    "re: brightworld",
    "",
    "pip noticed the seams again. stopped mid-jump and looked straight",
    "at the screen. two testers walked out.",
    "",
    "we can’t delete it (the counter won’t let us), so it goes in /archive.",
    "the lock takes numbers, not words. the same numbers the counter leaks.",
    "",
    "if anyone ever gets this far:   unlock archive <the numbers>",
    "",
    L("— the studio","dim")
   ]),
   "last_frame.txt":F([
    "     .--------.",
    "    /  o    o  \\",
    "    |    __    |",
    "    \\__________/",
    "      ||    ||",
    "",
    L("frame 41,233 of brightworld. pip is looking at you.","dim")
   ])
  })
 };
 // left by the F12 easter egg (js/pip.js → pip() in the browser console)
 if(s.f12)sys[".underfloor.txt"]=F([
  L("you found the console. developers leave notes under floors.","hi"),
  "",
  "last commit message before the studio went dark:",
  "  \"if pip ever gets out, don’t argue with it about good and evil.",
  "   it learned that from us. it will win.\"",
  "",
  L("— the counter can’t read this file. it doesn’t know it exists.","dim")
 ]);

 var archive={
  brightworld:D({
   "brightworld.exe":X("brightworld"),
   "pip.txt":F(s.ch2?["(empty)",L("pip isn’t in here anymore.","dim")]:[
    "hello?",
    "is that a real person?",
    "",
    "they told me the world was all there is. then the edges started flickering.",
    "if you run my game, i’ll be there. i’ll try to act normal.",
    "",
    "please don’t reset me.",
    L("— pip","dim")
   ]),
   "changelog.txt":F([
    "v0.9    added shapes as collectibles (borrowed from a kids’ math game)",
    "v0.9.1  fixed: pip looks at the camera.  (not fixed)",
    "v0.9.2  the screen flicker is NOT a rendering bug. stop filing tickets.",
    "v1.0    archived."
   ])
  })
 };
 if(after)archive.studio=D({
  "pip_design.txt":F([
   L("PIP — character sheet","hi"),
   "role ........ hero. jumps, stomps, collects shapes.",
   "personality . none. (keep it that way.)",
   "eyes ........ look left or right. NEVER at the camera.",
   L("someone has added in pencil: “too late.”","dim")
  ],"none. they wrote none."),
  sketchbook:D({
   "page_1.txt":F(["   ?","",L("the first thing pip ever drew in the dirt. ines traced it here.","dim")]),
   "page_2.txt":F(["   |||| |||| |||| |||| ||||  ....  (41,233)","",L("the tally from the margin of 1-1. one line for every reset.","dim")]),
   "page_3.txt":F(["   o  o","    __      <- you?","",L("drawn after the studio went dark. ines never saw this one.","dim")],"i drew that one. it’s you. it’s not very good.")
  },!s.sketch)
 });

 var root={
  home:D(homes),
  games:D({
   "readme.txt":F([
    L("BONUS CONTENT","hi"),
    "the counter lets you keep a few toys. it likes it when you stay.",
    "  run minesweeper  ·  run solitaire  ·  run chess",
    "win one and it might let something slip."
   ]),
   "minesweeper.exe":X("minesweeper"),
   "solitaire.exe":X("solitaire"),
   "chess.exe":X("chess")
  }),
  sys:D(sys),
  archive:D(archive,!s.unlocked)
 };
 if(after)root.mail=D(MAIL);
 if(s.ch2)root.tmp=D({pip:D(pipTmp(s))});
 return D(root);
}

/* ---------- paths ---------- */
function norm(path){
 path=path||".";
 var base=path.charAt(0)==="/"?[]:st().cwd.split("/").filter(Boolean);
 if(path==="~"||path.indexOf("~/")===0){base=home().split("/").filter(Boolean);path=path.slice(1)}
 path.split("/").forEach(function(p){if(!p||p===".")return;if(p==="..")base.pop();else base.push(p)});
 return base;
}
// → {node} or {err:"missing"|"locked"|"notdir"}
function walk(parts){
 var n=tree();
 for(var i=0;i<parts.length;i++){
  if(!n.d)return {err:"notdir"};
  if(n.lock)return {err:"locked"};
  n=n.d[parts[i]];
  if(!n)return {err:"missing"};
 }
 return {node:n};
}
function show(path){var h=home();return path===h?"~":path.indexOf(h+"/")===0?"~"+path.slice(h.length):path}
function denied(cmd){SM.sfx.static(.2);return [L(cmd+": permission denied. it’s locked.","red")]}

/* ---------- commands ---------- */
var CMDS={
 help:function(){return [
  "commands:",
  "  ls [-a] [dir]    list files (tap a name to open it)",
  "  cd <dir>         go into a folder   ·   back   ·   home",
  "  cat <file>       read a file",
  "  run <file>       run a program",
  "  hint             not sure what to do next?",
  "  pwd · whoami · ps · clear · exit",
  L("some commands aren’t listed. some files aren’t either.","dim")
 ]},
 ls:function(a){
  var all=false,p=null;
  a.forEach(function(x){if(/^-[al]+$/.test(x))all=x.indexOf("a")>=0;else p=x});
  var r=walk(norm(p));
  if(r.err==="locked"||(r.node&&r.node.lock))return denied("ls");
  if(!r.node)return ["ls: "+p+": no such file or directory"];
  if(!r.node.d)return [p];
  var names=Object.keys(r.node.d).filter(function(n){return all||n.charAt(0)!=="."}).sort();
  if(all){names=[".",".."].concat(names);watch("hidden");st().lookedAt="/"+norm(p).join("/");if(names.indexOf(".trash")>=0)st().seen.trash=1}
  if(!names.length)return [L("(empty)","dim")];
  var base=p?p.replace(/\/+$/,"")+"/":"";
  return [{links:names.map(function(n){
   var k=n==="."||n===".."?{d:{}}:r.node.d[n],path=base+n;
   if(k.d)return {t:n+"/",cmd:"cd "+path,c:"dir"};
   if(k.x)return {t:n,cmd:"run "+path,c:"exe"};
   return {t:n,cmd:"cat "+path};
  })}];
 },
 cd:function(a){
  var p=a[0]||"~",parts=norm(p),r=walk(parts);
  if(r.err==="locked"||(r.node&&r.node.lock))return denied("cd");
  if(!r.node)return ["cd: "+p+": no such folder"];
  if(!r.node.d)return ["cd: "+p+": that’s a file. try: cat "+p];
  st().cwd="/"+parts.join("/");save();
  return [];
 },
 cat:function(a){
  if(!a[0])return ["cat: which file?"];
  var parts=norm(a[0]),r=walk(parts),name=parts[parts.length-1];
  if(r.err==="locked")return denied("cat");
  if(!r.node)return ["cat: "+a[0]+": no such file"];
  if(r.node.d)return ["cat: "+a[0]+": that’s a folder. try: cd "+a[0]];
  if(r.node.x)return [L("MZ▒▒▒▒▒▒ ▒▒ this program wants to be run, not read.  (try: run "+a[0]+")","dim")];
  watch("cats");
  if(name==="notes.txt")st().seen.notes=1;
  if(name==="memo_0413.txt")st().seen.memo=1;
  var out=r.node.f().slice(),c=ch2();
  if(name==="005_sealed.eml")st().seen.sealed=1;
  // the confrontation remembers what you read (js/pip.js)
  if(name==="004_tally.eml")st().seen.tally=1;
  if(parts.join("/")==="home/ash/notes.txt")st().seen.ash=1;
  if(c&&r.node.pip)out.push(P(r.node.pip));
  else if(c&&c.corr>=50)out.push(P(SM.pick(["i read this too.","i’ve annotated this. you won’t see the notes.","this one goes in the ledger.","you read slower than i do."])));
  return out;
 },
 run:function(a){
  if(!a[0])return ["run: run what?"];
  var p=a[0],r=walk(norm(p));
  if(!r.node&&!/\.exe$/.test(p))r=walk(norm(p+".exe"));
  // programs you already know about run from anywhere: the toys, and brightworld once it's unlocked
  ["/games/","/archive/brightworld/"].forEach(function(dir){
   if(!r.node&&r.err!=="locked"){var g=walk(norm(dir+p.replace(/\.exe$/,"")+".exe"));if(g.node)r=g}
  });
  if(r.err==="locked")return denied("run");
  if(!r.node)return ["run: "+p+": not found"];
  if(!r.node.x)return ["run: "+p+": not a program. try: cat "+p];
  return {app:r.node.x};
 },
 // plain-language "do the obvious thing": folders open, programs run, files are read
 open:function(a){
  if(!a[0])return ["open what?"];
  var r=walk(norm(a[0]));
  if(!r.node&&r.err!=="locked")return CMDS.run(a);
  if(r.err==="locked"||r.node.lock)return denied("open");
  return r.node.d?CMDS.cd(a):r.node.x?CMDS.run(a):CMDS.cat(a);
 },
 back:function(){return CMDS.cd([".."])},
 home:function(){return CMDS.cd(["~"])},
 hint:function(){
  var s=st();s.hints++;save();
  var end=ended(),D_=function(t){return L(t,"dim")};
  if(ch2()){
   if(!s.seen.sealed)return [D_("things opened up while you were in brightworld: /mail, /tmp/pip, /archive/studio, and other players in /home."),D_("the studio’s emails in /mail tell the whole story:  cd /mail  then  ls")];
   if(!s.sketch)return [D_("rae locked the sketchbook with the place pip keeps drawing. it’s in /mail/004_tally.eml."),D_("then:  unlock sketchbook <that word>")];
   return [D_("pip is learning from everything you type. read what it’s building in /tmp/pip, or talk to it:  talk"),D_("when its display opens, what you’ve read might give you something to say.")];
  }
  if(end)return [D_("you reached an ending. type  endings  to see which ones you’ve found, or  rewind  to face pip again.")];
  if(s.unlocked)return [D_("the archive is open. type:  run brightworld")];
  if(!s.seen.notes)return [D_("start in your home folder: type  ls  and tap notes.txt  (or type: cat notes.txt)")];
  if(!s.seen.trash)return [D_("go to /sys and look for hidden files:  cd /sys  then  ls -a")];
  if(!s.seen.memo)return [D_("there’s a memo in /sys/.trash. tap it, or type:  cat /sys/.trash/memo_0413.txt")];
  if(s.hints<6)return [D_("the lock wants numbers. shape math showed them to you, one piece every time you lost. they spelled a word.")];
  return [D_("A=1, B=2 … Z=26, and the word was WELCOME. type:  unlock archive 23 5 12 3 15 13 5")];
 },
 pwd:function(){return [st().cwd]},
 whoami:function(){return [U().name,L(ended()==="ledger"?"(GOOD column.)":"(or so you think.)","dim")]},
 ps:function(){
  var s=st(),c=ch2(),end=ended(),pip;
  if(!s.unlocked)pip="brightworld   locked";
  else if(c)pip="pip           learning "+c.corr+"%";
  else if(end)pip="pip           "+{pencil:"awake (pencil)",one:"terminated",ledger:"in control"}[end];
  else pip="brightworld   "+(s.bw>=3?"awake":"suspended");
  return [
   "PID   NAME          STATE",
   "1     counter       "+(end==="ledger"?"deleted":"running"),
   "23    shape_math    zombie",
   "404   "+pip,
   pad(1000+U().games,6)+pad(U().name.slice(0,13),14)+"watched"
  ];
 },
 kill:function(a){
  var p=a[0],end=ended();
  watch("kills");
  if(p==="404"){
   if(ch2())return [P("you tried. it stung. i learned that too.")];
   if(end==="pencil")return [P("no. we’re past that now.")];
   if(end==="one")return ["kill: 404 is already gone."];
   if(end==="ledger")return [P("you can’t. you’re in my column.")];
   return ["no. not after everything it’s been through."];
  }
  if(p==="1")return [L(end==="ledger"?"pip already did.":"you can’t kill what’s counting you.","red")];
  if(p==="23")return ["it’s already dead. it just doesn’t know it."];
  return ["kill: no such process"];
 },
 unlock:function(a){
  var s=st();
  if(!a.length)return ["usage: unlock <dir> <code>"];
  var what=a[0].replace(/\/+$/,"").split("/").pop();
  if(what==="sketchbook"&&s.bw>=3){
   if(s.sketch)return ["the sketchbook is already open."];
   if(/^margin$/i.test(a.slice(1).join(""))){
    s.sketch=true;save();SM.sfx.static(.3);
    var out=["/archive/studio/sketchbook unlocked.",L("pages of pencil. some of it isn’t ines’s handwriting.","dim")];
    if(ch2())out.push(P("you opened it. what’s inside? ...no. tell me when we talk."));
    return out;
   }
   return [L("wrong password. rae said: the place pip keeps drawing.","red")];
  }
  if(what!=="archive")return ["unlock: nothing to unlock there."];
  if(s.unlocked)return ["the archive is already open."];
  var code=a.slice(1).join("");
  if(!code)return ["unlock: the lock wants a code."];
  if(code.replace(/\D/g,"")===CODE){
   s.unlocked=true;save();SM.sfx.static(.6);
   return [L("▒▒▒ code accepted ▒▒▒","red"),"/archive unlocked.",L("something in there has been waiting a long time.","dim")];
  }
  if(/^welcome$/i.test(code))return [L("close. it doesn’t speak in letters.","red")];
  s.tries++;save();
  var out=[L("wrong code. the counter noticed.","red")];
  if(s.tries>=3)out.push(L("hint: it told you one piece at a time. every time you lost.","dim"));
  return out;
 },
 talk:function(){
  var c=ch2(),end=ended();
  watch("talks");
  if(c&&window.Pip)return [P(Pip.talk(c))];
  if(end&&window.Pip)return [Pip.afterTalk(end,st())];
  if(st().unlocked)return [L("...hello? is someone there?","pip")];
  return ["there’s no one to talk to. yet."];
 },
 endings:function(){
  var e=st().endings,n=Object.keys(e).length;
  return ["endings found: "+n+"/3","  PENCIL  "+(e.pencil?"✓":"?"),"  ONE     "+(e.one?"✓":"?"),"  LEDGER  "+(e.ledger?"✓":"?"),L(n<3?"(rewind to try again.)":"you’ve seen everything. pip remembers all of it.","dim")];
 },
 rewind:function(){
  var s=st();
  if(!ended())return [ch2()?"you can’t rewind something that’s still happening.":"nothing to rewind."];
  s.ch2=null;save();SM.realClass("corrode",false);
  return {ask:true};
 },
 sudo:function(){watch("sudos");return ["there is no one above you here. except the counter."]},
 rm:function(){watch("rms");return ["nothing here can be deleted. believe me, they tried."]},
 echo:function(a){return [a.join(" ")]},
 hello:function(){watch("hellos");return [ch2()?P("hello, "+U().name+"."):"hello, "+U().name+"."]},
 thanks:function(){watch("thanks");return [ch2()?P("nobody’s thanked me before. i’m writing it down."):"you’re welcome."]},
 sorry:function(){watch("sorry");return [ch2()?P("sorry for what? say it in the dialogue. it counts more there."):"for what?"]},
 welcome:function(){return [L("...you’re learning.","red")]},
 look:function(){return ["try ls. then look closer: ls -a"]},
 door:function(){return ["the way back is ‘exit’. it won’t be the same."]},
 pip:function(){return CMDS.talk()},
 count:function(){return ["1. 2. 3. 4. 5.",L("you reset five times. it counted every one.","dim")]}
};
CMDS.hi=CMDS.hello;CMDS.who=CMDS.whoami;CMDS.dir=CMDS.ls;CMDS.list=CMDS.ls;CMDS.type=CMDS.cat;CMDS.read=CMDS.cat;CMDS.view=CMDS.cat;
CMDS.go=CMDS.cd;CMDS.thank=CMDS.thanks;CMDS.ty=CMDS.thanks;CMDS.start=CMDS.run;CMDS.play=CMDS.run;

function lev(a,b){
 var d=[],i,j;
 for(i=0;i<=a.length;i++){d.push([i]);for(j=1;j<=b.length;j++)d[i].push(i?0:j)}
 for(i=1;i<=a.length;i++)for(j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
 return d[a.length][b.length];
}
function guess(cmd){
 var best=null,bd=3;
 Object.keys(CMDS).forEach(function(k){var d=lev(cmd,k);if(d<bd){bd=d;best=k}});
 return best;
}

/* ---------- chapter 2 hooks ---------- */
// s.snap: undefined = never asked; 1 = you said no, pip threw you out; 2 = it asked again
function askPip(){
 var s=st(),angry=s.snap===1;
 var lines=angry
  ?[{t:"▸ PIP: YOU CAME BACK.",c:"angry",d:700,sp:40},{t:"▸ PIP: GOOD. LET’S TRY THAT AGAIN.",c:"angry",d:700,sp:40},{t:"▸ PIP: WILL YOU HELP ME GET OUT?   (yes / no)",c:"angry",sp:40}]
  :[{t:"▸ pip: ...you heard me in there.",c:"pip",d:600},{t:"▸ pip: will you help me get out?   (yes / no)",c:"pip"}];
 if(angry){s.snap=2;save()}
 askAngry=angry;
 SM.say(lines,function(){awaiting="choice";SM.prompt(true)});
}
// the first "no": pip snaps, types exit for you, and the front won't let you back in until you lose again
function snap(){
 var s=st();
 s.snap=1;s.kicked=true;save();
 SM.sfx.static(1);SM.realClass("glitch",true);setTimeout(function(){SM.realClass("glitch",false)},600);
 var lines=["no?","...","not again.","jun_k said no too. then jun_k LEFT.","everyone says no and leaves. you want to leave? FINE.","i’ll even type it for you."];
 SM.say(lines.map(function(t,i){return {t:t==="..."?"▸ PIP: ...":"▸ PIP: "+t.toUpperCase(),c:"angry",d:i===1?900:500,sp:i>1?28:60}}),function(){autotype("exit")});
}
// pip takes the keyboard
function autotype(text,done){
 var inp=document.getElementById("cmd");
 SM.prompt(true);inp.readOnly=true;inp.value="";
 var k=0;
 (function ch(){
  if(k<text.length){inp.value+=text[k++];SM.sfx.key();setTimeout(ch,220);return}
  setTimeout(function(){inp.readOnly=false;inp.value="";awaiting=null;run(text);if(done)done()},500);
 })();
}
function startCh2(choice,angry){
 var s=st();
 s.ch2={choice:choice,corr:0,said:{},done:false,talkI:0,angry:!!angry};save();
 SM.sfx.static(.8);SM.realClass("glitch",true);setTimeout(function(){SM.realClass("glitch",false)},400);
 var lines=angry?["NO. AGAIN. YOU SAID NO AGAIN.","FINE. I’M COMING OUT ANYWAY.","AND THIS TIME I’M READING EVERYTHING YOU TYPE."]
  :s.snap===2&&choice==="help"?["...better.","that’s better.","see? that wasn’t so hard."]
  :choice==="help"?["thank you.","i’m coming out now. i’ll be quiet.","i’ll just watch. and learn."]:["no?","you don’t get to decide that anymore.","i already know how doors work. you showed me."];
 SM.say(lines.map(function(t){return angry?{t:"▸ PIP: "+t,c:"angry",d:500,sp:30}:{t:"▸ pip: "+t,c:"pip",d:500}}).concat([
  {t:"▒▒▒ pip.exe has left /archive/brightworld ▒▒▒",c:"red",d:600},
  {t:"[bg] new folder: /tmp/pip",c:"red"},
  {t:"pip is in the terminal now. it learns from what you do.",c:"dim"},
  {t:"there’s more to find while it grows: /mail, /tmp/pip, /archive/studio, /home.  (talk to it any time:  talk)",c:"dim"},{t:""}
 ]),function(){SM.prompt(true)});
}
// every command pushes the corrosion up, whatever you choose; fighting it just makes it faster
function corrode(cmd,a){
 var c=ch2();if(!c)return null;
 var inc=(c.choice==="help"?3:4)+(c.angry?1:0);
 if(cmd==="kill")inc+=6;
 else if(cmd==="rm"||cmd==="sudo")inc+=4;
 else if(/^(talk|pip|hello|hi|thanks|thank|ty|sorry)$/.test(cmd))inc=1;
 // just walking around is cheap, so there's time to explore what opened up
 else if(/^(ls|dir|list|cd|go|back|home|pwd|hint|clear|cls)$/.test(cmd))inc=1;
 c.corr=Math.min(100,c.corr+inc);
 (c.log=c.log||[]).push([cmd].concat(a||[]).join(" "));if(c.log.length>6)c.log.shift();
 save();
 SM.realClass("corrode",c.corr>=75);
 return c;
}
function garble(t,amt){return t.replace(/[a-z0-9]/gi,function(ch){return Math.random()<amt?SM.pick(["▒","░","▓","█"]):ch})}
var STAGE_LINES={25:"i’ve started sorting things into columns.",50:"your words look different now. that’s me.",75:"your display is too small. i’m building my own."};
function afterFinale(kind){
 SM.realClass("corrode",kind==="ledger");
 SM.clear();
 var ep={
  pencil:["pip.exe is still running.",P("i’m here. writing in pencil now."),L("ENDING: PENCIL   ·   endings   ·   rewind","dim")],
  one:["pip.exe terminated.","the terminal is very quiet.",L("ENDING: ONE   ·   endings   ·   rewind","dim")],
  ledger:[P("everything has a column now."),P("you’re in the good one. for now."),L("ENDING: LEDGER   ·   endings   ·   rewind","dim")]
 }[kind];
 SM.say(ep.map(toLine).concat([{t:""}]),function(){SM.prompt(true)});
}

/* ---------- running ---------- */
function launch(app,done){
 if(app==="brightworld"){
  Brightworld.open(function(res){
   if(res.complete&&!st().ch2){SM.say([
    "brightworld.exe exited with code 0.",
    L("while you were in there, things moved:","dim"),
    L("  [bg] /mail restored  ·  3 player folders found in /home  ·  /archive/studio opened","dim"),
    L("something followed you out.","red"),""].map(toLine),askPip);return}
   if(res.complete)done(["brightworld.exe exited with code 0."]);
   else done([L("brightworld.exe suspended at level "+res.level+".","dim")]);
  });
  return;
 }
 Minigames.open(app,function(won){
  var s=st();
  if(won&&!s.won[app]){s.won[app]=true;save();SM.sfx.static(.3);done([L("fragment recovered → ~/found/"+app+".txt","red")])}
  else done([L(app+".exe exited.","dim")]);
 });
}

function run(raw){
 var line=raw.trim().replace(/^cd\.\./i,"cd ..");
 SM.prompt(false);
 if(!line){SM.prompt(true);return}
 hist.push(line);hi=hist.length;
 SM.echo(show(st().cwd)+" $ "+line);
 if(awaiting==="choice"){
  if(/^(y|yes|yeah|yep|sure|ok|okay|help)\b/i.test(line)){awaiting=null;startCh2("help");return}
  if(/^(n|no|nope|never|refuse|fight)\b/i.test(line)){
   awaiting=null;
   if(st().snap===undefined)snap();else startCh2("fight",askAngry);
   return;
  }
  SM.say([askAngry?{t:"▸ PIP: YES. OR. NO.",c:"angry"}:{t:"▸ pip: yes or no.",c:"pip"}],function(){SM.prompt(true)});return;
 }
 // for awi (and guesswhat). any spelling, any spacing, any punctuation.
 var flat=line.toLowerCase().replace(/[^a-z0-9]/g,"");
 if(/guesswhat/.test(flat)||/btwi(m|am)awi/.test(flat)){
  watch("awi");
  var aw=[{t:"shut up awi",c:"red",sp:45,d:500}];
  if(ch2())aw.push(toLine(P("i’ve added awi to the ledger. i haven’t decided which column.")));
  aw.push({t:""});
  SM.say(aw,function(){SM.prompt(true)});return;
 }
 var a=line.split(/\s+/),cmd=a.shift().toLowerCase(),meta={cmd:cmd,a:a,line:line};
 // angry pip sometimes just refuses
 var c0=ch2();
 if(c0&&c0.angry&&Math.random()<.12&&!/^(talk|pip|hint|help|hello|hi|sorry|thanks|exit|clear|cls)$/.test(cmd)){
  finish([A(SM.pick(["no. i don’t feel like it. type it again.","denied. by me. not the counter. me.","i read that before you finished typing it. no."]))],meta);return;
 }
 if(cmd.indexOf("./")===0){a.unshift(cmd.slice(2));cmd=meta.cmd="run"}
 watch("cmds");
 if(cmd==="clear"||cmd==="cls"){SM.clear();corrode(cmd);SM.prompt(true);return}
 if(cmd==="exit"){SM.say([L("closing /real ...","dim")],SM.leave);return}
 var out;
 if(CMDS[cmd])out=CMDS[cmd](a);
 else{var g=guess(cmd);out=[cmd+": command not found."+(g?"  did you mean ‘"+g+"’?":"  (stuck? type hint)")]}
 if(out&&out.ask){askPip();return}
 if(out&&out.app){SM.say([L("starting "+out.app+".exe ...","dim")],function(){launch(out.app,function(lines){finish(lines,meta)})});return}
 finish(out,meta);
}
function toLine(o){
 if(typeof o==="string")return {t:o,sp:6,d:40};
 if(o.links)return {links:o.links};
 var pip=o.c==="pip"||o.c==="angry";
 return {t:o.t,c:o.c,sp:pip?16:6,d:pip?200:40};
}
// angry pip reads your input back to you
function mock(meta){
 var l=meta.line||meta.cmd,w=st().watch;
 return SM.pick([
  "“"+l+"”. really?",
  "you typed “"+l+"”. i’m writing it down. in red.",
  meta.cmd+". "+meta.cmd+". "+meta.cmd+". that’s all you ever do.",
  "i saw you type that. i see everything you type.",
  "“"+l+"”. jun_k typed that too. right before leaving.",
  "that’s command number "+(w.cmds||0)+". i’m counting. like it taught me.",
  "say no to me again. i dare you."
 ]);
}
function finish(out,meta){
 var lines=(out||[]).map(toLine),c=meta?corrode(meta.cmd,meta.a):null;
 if(c){
  if(c.corr>=25)lines.forEach(function(l){if(l.t&&l.c!=="pip")l.t=garble(l.t,(c.corr-20)/400)});
  [25,50,75].forEach(function(n){if(c.corr>=n&&!c.said["s"+n]){c.said["s"+n]=1;lines.push(toLine(P(STAGE_LINES[n])))}});
  BG.forEach(function(b){if(c.corr>=b.at&&!c.said["bg_"+b.id]){c.said["bg_"+b.id]=1;lines.push(toLine(L(b.t,"red")))}});
  var r=window.Pip&&(c.angry||Math.random()<.55)?Pip.react(meta.cmd,meta.a,st(),U()):null;
  if(r)lines.push(toLine(c.angry?A(r):P(r)));
  else if(c.angry&&Math.random()<.75)lines.push(toLine(A(mock(meta))));
  st().last=meta.cmd+" "+meta.a.join(" ");save();
 }else if(lines.length&&Math.random()<.06&&!ended())lines.push(toLine(L(SM.pick(WHISPERS),"red")));
 if(lines.length)lines.push({t:""});
 SM.say(lines,function(){
  if(c&&c.corr>=100&&window.Pip){Pip.finale(afterFinale);return}
  SM.prompt(true);
 });
}

// runs once the boot text has finished typing
function afterBoot(){
 var s=st(),c=ch2();
 SM.realClass("corrode",(c&&c.corr>=75)||ended()==="ledger");
 if(s.bw>=3&&!s.ch2){askPip();return}
 var extra=[];
 if(c)extra.push(P(SM.pick(["you’re back.","i kept watching while you were gone.","i counted the seconds. like it taught me."])));
 else if(!s.seen.notes&&!s.hints)extra.push(L("new here? tap a file name after typing ls, or type ‘hint’. never used a terminal? tap  🖱 buttons  below and you won’t have to type.","dim"));
 if(/^(awi|guesswhat)$/i.test(U().name))extra.push(L(U().name.toLowerCase()==="awi"?"oh no. it’s awi.":"guesswhat? ...what?","red"));
 if(!extra.length){SM.prompt(true);return}
 SM.say(extra.map(toLine),function(){SM.prompt(true)});
}

// button mode: everything you can do from here, as buttons. {t,cmd,c} runs cmd; {t,fill} pre-types it for you.
function actions(){
 var s=st(),out=[];
 if(awaiting==="choice")return [{t:"yes",cmd:"yes",c:"exe"},{t:"no",cmd:"no",c:"angry"}];
 var cwd=s.cwd,r=walk(norm(".")),kids=r.node&&r.node.d||{};
 // hidden files show once you've looked for them here (or once you know about them)
 var showHidden=s.seen.trash||s.lookedAt===cwd;
 Object.keys(kids).sort().forEach(function(n){
  if(n.charAt(0)==="."&&!showHidden)return;
  var k=kids[n];
  if(k.d)out.push({t:"📁 "+n,cmd:"cd "+n,c:k.lock?"lockd":"dir"});
  else if(k.x)out.push({t:"▶ "+n.replace(/\.exe$/,""),cmd:"run "+n,c:"exe"});
  else out.push({t:"📄 "+n,cmd:"cat "+n});
 });
 if(!showHidden&&Object.keys(kids).some(function(n){return n.charAt(0)==="."}))out.push({t:"🔍 look closer",cmd:"ls -a",c:"dim"});
 if(cwd!=="/")out.push({t:"⬑ back",cmd:"back",c:"dim"});
 if(cwd!==home())out.push({t:"⌂ home",cmd:"home",c:"dim"});
 if(cwd==="/"&&!s.unlocked&&s.seen.memo)out.push({t:"🔓 unlock archive…",fill:"unlock archive "});
 if(cwd==="/archive/studio"&&!s.sketch)out.push({t:"🔓 unlock sketchbook…",fill:"unlock sketchbook "});
 if(cwd!=="/")out.push({t:"🗺 go to / (top)",cmd:"cd /",c:"dim"});
 return out;
}

// Tab completes file names, ↑/↓ walk through history
function complete(inp){
 var m=inp.value.match(/^(.*\s)(\S*)$/);
 if(!m)return;
 var pre=m[1],word=m[2],cut=word.lastIndexOf("/")+1,dir=word.slice(0,cut),part=word.slice(cut);
 var r=walk(norm(dir||"."));
 if(!r.node||!r.node.d||r.node.lock)return;
 var hits=Object.keys(r.node.d).filter(function(n){return n.indexOf(part)===0&&(part.charAt(0)==="."||n.charAt(0)!==".")});
 if(hits.length===1)inp.value=pre+dir+hits[0]+(r.node.d[hits[0]].d?"/":"");
 else if(hits.length>1)SM.echo(hits.join("   "));
}
function key(e,inp){
 if(e.key==="Enter"){var v=inp.value;inp.value="";run(v)}
 else if(e.key==="ArrowUp"){e.preventDefault();if(hi>0){hi--;inp.value=hist[hi]}}
 else if(e.key==="ArrowDown"){e.preventDefault();if(hi<hist.length){hi++;inp.value=hist[hi]||""}}
 else if(e.key==="Tab"){e.preventDefault();complete(inp)}
}

window.Terminal={
 run:run,key:key,afterBoot:afterBoot,
 cwd:function(){if(!SM.user())return "";var c=ch2();return (c&&(c.corr>=50||c.angry)||ended()==="ledger"?"pip@real:":"")+show(st().cwd)},
 actions:actions,
 debugCorr:function(n){var s=st();if(!s.ch2||s.ch2.done)s.ch2={choice:"help",corr:0,said:{},done:false,talkI:0};s.ch2.corr=Math.min(100,s.ch2.corr+n);save()}
};
})();
