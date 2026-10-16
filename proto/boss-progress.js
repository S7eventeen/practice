(function(global){
  "use strict";
  var KEY = "s7eventeen.bossProgress.v1";
  function rank(value){
    var n = Number(value);
    return isFinite(n) ? Math.max(1, Math.min(4, Math.floor(n))) : 1;
  }
  function qualifies(level, seconds){ return level === 3 && typeof seconds === "number" && isFinite(seconds) && seconds >= 0 && seconds <= 15; }
  function normalize(value){
    value = value && typeof value === "object" ? value : {};
    var records = Array.isArray(value.records) ? value.records.filter(function(r){
      return r && Number.isInteger(r.level) && r.level >= 1 && r.level <= 4
        && typeof r.seconds === "number" && isFinite(r.seconds) && r.seconds >= 0;
    }).map(function(r){ return {level:r.level, seconds:r.seconds, at:String(r.at || "")}; }) : [];
    var bests = {3:null, 4:null};
    [3, 4].forEach(function(level){
      var stored = value.bests && value.bests[level];
      if (typeof stored === "number" && isFinite(stored) && stored >= 0) bests[level] = stored;
      records.forEach(function(r){
        if (r.level === level && (bests[level] === null || r.seconds < bests[level])) bests[level] = r.seconds;
      });
    });
    return {level:Math.min(3, rank(value.level === undefined ? 1 : value.level)), records:records, bests:bests,
      fullUnlocked:value.fullUnlocked === true || (bests[3] !== null && bests[3] <= 15)};
  }
  function read(){
    try { return normalize(JSON.parse(global.localStorage.getItem(KEY))); }
    catch (e) { return normalize(null); }
  }
  function save(progress){
    try { global.localStorage.setItem(KEY, JSON.stringify(normalize(progress))); return true; }
    catch (e) { return false; }
  }
  function victory(progress, level, seconds){
    var next = normalize(progress);
    if (!Number.isInteger(level) || level < 1 || level > 4 || typeof seconds !== "number" || !isFinite(seconds) || seconds < 0) return next;
    next.level = Math.max(next.level, Math.min(3, level + 1));
    next.fullUnlocked = next.fullUnlocked || qualifies(level, seconds);
    next.records.push({level:level, seconds:seconds, at:new Date().toISOString()});
    return normalize(next);
  }
  function label(level){ return level > 0 ? ["", "加强Ⅰ", "加强Ⅱ", "加强Ⅲ", "满加强"][rank(level)] : "未加强"; }
  function time(seconds){
    var cs = Math.max(0, Math.round((Number(seconds) || 0) * 100));
    return String(Math.floor(cs / 6000)).padStart(2, "0") + ":"
      + String(Math.floor(cs / 100) % 60).padStart(2, "0") + "." + String(cs % 100).padStart(2, "0");
  }
  function params(progress){
    progress = normalize(progress);
    var last = progress.records[progress.records.length - 1];
    return "&bossLevel=" + progress.level + "&fullUnlocked=" + (progress.fullUnlocked ? "1" : "0")
      + (last ? "&lastLevel=" + last.level + "&lastSeconds=" + last.seconds : "")
      + (progress.bests[3] !== null ? "&bestThree=" + progress.bests[3] : "")
      + (progress.bests[4] !== null ? "&bestFull=" + progress.bests[4] : "");
  }
  function fromParams(query, fallback){
    var p = normalize(fallback);
    if (query.has("bossLevel")) p.level = Math.min(3, rank(query.get("bossLevel")));
    if (query.get("fullUnlocked") === "1") p.fullUnlocked = true;
    if (query.has("lastLevel") && query.has("lastSeconds")){
      var level = Number(query.get("lastLevel")), seconds = Number(query.get("lastSeconds"));
      if (Number.isInteger(level) && level >= 1 && level <= 4 && isFinite(seconds) && seconds >= 0){
        p.records = [{level:level, seconds:seconds, at:""}];
        p.fullUnlocked = p.fullUnlocked || qualifies(level, seconds);
      }
    }
    [[3, "bestThree"], [4, "bestFull"]].forEach(function(entry){
      var key = entry[0], raw = query.get(entry[1]), seconds = Number(raw);
      if (raw !== null && raw !== "" && isFinite(seconds) && seconds >= 0
          && (p.bests[key] === null || seconds < p.bests[key])) p.bests[key] = seconds;
    });
    return normalize(p);
  }
  global.BossProgress = {read:read, save:save, victory:victory, label:label, time:time,
    rank:rank, params:params, fromParams:fromParams, qualifies:qualifies, bests:function(p){return normalize(p).bests}};
})(window);
