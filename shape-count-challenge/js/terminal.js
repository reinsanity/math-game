/* /real: the terminal behind Shape Math.
   A small fake filesystem to explore. The main path:
   ~/notes.txt → ls -a → /sys/.trash/memo_0413.txt → unlock archive <WELCOME numbers> → run brightworld.exe
   Bonus: /games has minesweeper, solitaire and chess; each first win leaves a lore fragment in ~/found. */
(function(){
var SM=window.SM;
var CODE="23512315135"; // 23 5 12 3 15 13 5 = WELCOME
var WHISPERS=["it’s watching the cursor.","keep looking.","pip?","you’re doing well. too well.","the counter blinked."];
var hist=[],hi=0;

function U(){return SM.user()}
function homeDir(){return U().name.toLowerCase().replace(/[^a-z0-9_.-]/g,"_")}
function home(){return "/home/"+homeDir()}
// per-account terminal state, saved with the account
function st(){
 var u=U(),s=u.term||(u.term={});
 if(!s.cwd)s.cwd=home();
 if(!s.won)s.won={};
 s.bw=s.bw||0;s.tries=s.tries||0;s.unlocked=!!s.unlocked;
 return s;
}
function save(){SM.save()}
function L(t,c){return {t:t,c:c}}
function pad(s,n){s=String(s);while(s.length<n)s+=" ";return s}

/* ---------- files ---------- */
function F(lines){return {f:typeof lines==="function"?lines:function(){return lines}}}
function X(app){return {x:app}}
function D(kids,lock){return {d:kids,lock:!!lock}}

var FRAGS={
 minesweeper:[L("fragment 1/3","hi"),"brightworld was finished. it shipped to nobody.","it was buried two weeks before launch."],
 solitaire:[L("fragment 2/3","hi"),"pip wasn’t supposed to look at the camera.","pip kept looking at the camera."],
 chess:[L("fragment 3/3","hi"),"they couldn’t delete it, so they built something boring on top.","a counting game. nobody resets a counting game five times."]
};

function tree(){
 var s=st(),u=U(),found={},mine={};
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
 var homes={};homes[homeDir()]=D(mine);

 return D({
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
  sys:D({
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
    out.push(L("[watch] player is reading this log right now.","dim"));
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
  }),
  archive:D({
   brightworld:D({
    "brightworld.exe":X("brightworld"),
    "pip.txt":F([
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
  },!s.unlocked)
 });
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
  "  ls [-a] [dir]    list files",
  "  cd <dir>         change directory",
  "  cat <file>       read a file",
  "  run <file>       run a program",
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
  if(all)names=[".",".."].concat(names);
  if(!names.length)return [L("(empty)","dim")];
  return [names.map(function(n){var k=r.node.d[n];return k&&k.d?n+"/":n}).join("   ")];
 },
 cd:function(a){
  var p=a[0]||"~",parts=norm(p),r=walk(parts);
  if(r.err==="locked"||(r.node&&r.node.lock))return denied("cd");
  if(!r.node)return ["cd: "+p+": no such directory"];
  if(!r.node.d)return ["cd: "+p+": not a directory"];
  st().cwd="/"+parts.join("/");save();
  return [];
 },
 cat:function(a){
  if(!a[0])return ["cat: which file?"];
  var r=walk(norm(a[0]));
  if(r.err==="locked")return denied("cat");
  if(!r.node)return ["cat: "+a[0]+": no such file"];
  if(r.node.d)return ["cat: "+a[0]+": is a directory"];
  if(r.node.x)return [L("MZ▒▒▒▒▒▒ ▒▒ this program wants to be run, not read.","dim")];
  return r.node.f();
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
  if(!r.node.x)return ["run: "+p+": not a program"];
  return {app:r.node.x};
 },
 pwd:function(){return [st().cwd]},
 whoami:function(){return [U().name,L("(or so you think.)","dim")]},
 ps:function(){
  var s=st();
  return [
   "PID   NAME          STATE",
   "1     counter       running",
   "23    shape_math    zombie",
   "404   brightworld   "+(!s.unlocked?"locked":s.bw>=3?"awake":"suspended"),
   pad(1000+U().games,6)+pad(U().name.slice(0,13),14)+"watched"
  ];
 },
 kill:function(a){
  var p=a[0];
  if(p==="1")return [L("you can’t kill what’s counting you.","red")];
  if(p==="23")return ["it’s already dead. it just doesn’t know it."];
  if(p==="404")return ["no. not after everything it’s been through."];
  return ["kill: no such process"];
 },
 unlock:function(a){
  var s=st();
  if(!a.length)return ["usage: unlock <dir> <code>"];
  if(a[0].replace(/\/+$/,"").split("/").pop()!=="archive")return ["unlock: nothing to unlock there."];
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
 sudo:function(){return ["there is no one above you here. except the counter."]},
 rm:function(){return ["nothing here can be deleted. believe me, they tried."]},
 echo:function(a){return [a.join(" ")]},
 hello:function(){return ["hello, "+U().name+"."]},
 welcome:function(){return [L("...you’re learning.","red")]},
 look:function(){return ["try ls. then look closer: ls -a"]},
 door:function(){return ["the way back is ‘exit’. it won’t be the same."]},
 pip:function(){return st().unlocked?[L("...hello? is someone there?","hi")]:["who?"]},
 count:function(){return ["1. 2. 3. 4. 5.",L("you reset five times. it counted every one.","dim")]}
};
CMDS.hi=CMDS.hello;CMDS.who=CMDS.whoami;CMDS.dir=CMDS.ls;CMDS.type=CMDS.cat;CMDS.open=CMDS.run;

/* ---------- running ---------- */
function launch(app,done){
 if(app==="brightworld"){
  Brightworld.open(function(res){
   if(res.complete)done(["brightworld.exe exited with code 0.","pip is still in there. waiting.",L("[the next chapter is waiting for its designer]","dim")]);
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
 var line=raw.trim();
 SM.prompt(false);
 if(!line){SM.prompt(true);return}
 hist.push(line);hi=hist.length;
 SM.echo(show(st().cwd)+" $ "+line);
 var a=line.split(/\s+/),cmd=a.shift().toLowerCase();
 if(cmd.indexOf("./")===0){a.unshift(cmd.slice(2));cmd="run"}
 if(cmd==="clear"||cmd==="cls"){SM.clear();SM.prompt(true);return}
 if(cmd==="exit"){SM.say([L("closing /real ...","dim")],SM.leave);return}
 var out=CMDS[cmd]?CMDS[cmd](a):[cmd+": command not found. it’s listening anyway."];
 if(out&&out.app){SM.say([L("starting "+out.app+".exe ...","dim")],function(){launch(out.app,finish)});return}
 finish(out);
}
function finish(out){
 out=(out||[]).slice();
 if(out.length&&Math.random()<.06)out.push(L(SM.pick(WHISPERS),"red"));
 var lines=out.map(function(o){return typeof o==="string"?{t:o,sp:6,d:40}:{t:o.t,c:o.c,sp:6,d:40}});
 if(lines.length)lines.push({t:""});
 SM.say(lines,function(){SM.prompt(true)});
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

window.Terminal={run:run,key:key,cwd:function(){return SM.user()?show(st().cwd):""}};
})();
