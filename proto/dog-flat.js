/* 生成物，别手改 —— 由 `python scripts/sync-dog.py` 从 proto/town.html 抽出。

   镇上那只狗、镇上的头像、boss 里那只，共用同一份几何。源是 town.html 里的
   `dogFlat()` 和它的一整圈依赖；改了镇上的狗，重跑一次脚本。
   漂移检查：`python scripts/sync-dog.py --check`（不一致退出码 1）。

   为什么要这个文件：boss 原来用隐藏 iframe 抓 town 里的狗，而 file:// 下每个
   文件是独立源，`contentDocument` 恒为 null，跨文档读 DOM 被浏览器挡掉 ——
   那条路一次都没成功过，还是静默失败。而 town.html 必须能当一个文件发出去，
   不能反过来引这里。所以 town 是源。

   本次抽出 54 个定义，来自 town.html 第 612–1966 行。 */
(function(){
"use strict";
/* ===== BEGIN EXTRACTED（生成区，勿手改）===== */
var DEG = Math.PI / 180;

var NS = "http://www.w3.org/2000/svg";

function el(n, at){ var e = document.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); return e; }

var C = {
  // 天空：底色 + 星。星的位置是闭式不是随机，理由见 build() 里那段。
  sky:"#0C0E16", skyStar:"#C4D0E6",
  // 地比屋顶冷：暖色的屋顶才浮得出来。全白的话整张图会糊成一片。
  ground:"#C9D8E8", groundSide:"#93A5BA", groundDeep:"#7C8B9E",
  // path / pathEdge 已随路面一起删掉，见 ground() 里那段说明。别再加回来。
  plaster:"#F0E1C6", wood:"#C4894F", stone:"#9FAFC0", brick:"#C06A52",
  // 深一号的木：梁、窗台、栏杆、招牌杆。和墙面的 wood 拉开，不然全是同一块
  beam:"#8A5A32",
  roofRed:"#C4503F", roofBlue:"#3E6291", roofGreen:"#4F7A55", roofPurple:"#7A5A9E",
  roofSnow:"#F2F7FC",
  winLit:"#FFC95F", winDark:"#3B4C63",
  line:"#22303F",
  tree:"#2E5248", treeHi:"#3E6157",
  glow:"#FFBE63"
};

function shade(hex, amt){
  var n = parseInt(hex.slice(1), 16);
  var r = (n>>16)&255, g = (n>>8)&255, b = n&255;
  function f(v){ var x = amt>0 ? v + (255-v)*amt : v*(1+amt); return Math.max(0,Math.min(255,Math.round(x))); }
  return "#" + ((1<<24) + (f(r)<<16) + (f(g)<<8) + f(b)).toString(16).slice(1);
}

var FUR = "#E8A44C", CREAM = "#F7EEDD", INK = "#2A2A2E", BELT = "#C4503F", BRASS = "#E8C15E";

var DLEN = 0.951;

var PAWY = 0.045;

var GAIT_A = 0.070, GAIT_LIFT = 0.052;

var FARDY = 0.070;

var FARDX = 0.090;

var FAR_TOP = 0.470;

var SK = {
  /* 头这一组是绕鬐甲 (0.186,0.620) 均匀放大 1.18 得到的，不是逐个调的。
     你上一轮说"身体相对头部肥大"—— 头和身子都在，所以是比例问题，不是
     谁的绝对值问题。均匀缩放不动形状，只动大小，改比例就该这么改。
     顺带把耳尖从 0.925 压到 0.884：放大之后耳朵成了两根长尖，比整张脸
     还高，那正是"鹿"的另一半来源（鹿的耳朵就是大而立的）。 */
  nose:[0.593,0.686], muzTop:[0.552,0.704], stop:[0.519,0.722],
  brow:[0.464,0.764], crown:[0.423,0.805], earF:[0.414,0.791],
  earTip:[0.379,0.911], earB:[0.333,0.782], skull:[0.308,0.755],
  neckTop:[0.248,0.704],
  /* 背线故意不平：鬐甲抬起来、腰微塌、臀落下去。
     原来是 0.620→0.612→0.602→0.592，一条几乎直的缓线 —— 那是"水牛"读法，
     不是"矫健"。四点在 0.378 的跨度里只差 0.028，等于没动。 */
  with:[0.186,0.630], back1:[0.086,0.626], back2:[-0.038,0.620],
  croup:[-0.192,0.594], rumpTop:[-0.286,0.542], rumpBack:[-0.320,0.452],
  hipB:[-0.312,0.396], hipB2:[-0.308,0.300],
  /* 收腰：前胸照旧深（bellyF 0.322 没动），肚子往后抬起来 0.030。
     前腿长度一点没变（不然又变成鹿的长腿），只是腹线有了个斜坡。 */
  bellyR:[-0.100,0.404], bellyM:[0.020,0.372], bellyF:[0.148,0.368],
  shB:[0.152,0.240], elbow:[0.318,0.322], chest:[0.352,0.404],
  chestUp:[0.354,0.502], throat:[0.368,0.584], jaw:[0.416,0.624],
  chin:[0.476,0.617], muzBot:[0.519,0.630], noseBot:[0.582,0.647]
};

var PAW_F = [[-0.030, 0.064], [-0.042, 0.034], [-0.038, 0.012], [-0.016, 0.002],
             [ 0.020, 0.002], [ 0.042, 0.012], [ 0.050, 0.036], [ 0.040, 0.070]];

var PAW_R = [[-0.027, 0.062], [-0.038, 0.032], [-0.034, 0.012], [-0.014, 0.002],
             [ 0.018, 0.002], [ 0.038, 0.012], [ 0.045, 0.034], [ 0.036, 0.068]];

function pawOf(P, fx, fy){
  var o = [], i;
  for (i = 0; i < P.length; i++) o.push([fx + P[i][0], fy + P[i][1]]);
  return o;
}

var KT = 0.86;

var HOME_F = 0.214, HOME_R = -0.250;

function rearLeg(fx, fy, dx){
  dx = dx || 0;
  var d = dx + KT * (fx - HOME_R - dx);      // 上段锚点跟着脚走的那一份
  return { down:[[SK.hipB[0]+dx, SK.hipB[1]], [SK.hipB2[0]+d, SK.hipB2[1]],
                 [fx-0.025, fy+0.076]],
           paw: pawOf(PAW_R, fx, fy),
           up:  [[fx+0.034, fy+0.146], [-0.150+d, 0.300]] };
}

function frontLeg(fx, fy, dx){
  dx = dx || 0;
  var d = dx + KT * (fx - HOME_F - dx);
  return { down:[[SK.bellyF[0]+dx, SK.bellyF[1]], [SK.shB[0]+d, SK.shB[1]],
                 [fx-0.028, fy+0.074]],
           paw: pawOf(PAW_F, fx, fy),
           up:  [[fx+0.032, fy+0.148], [0.256+d, 0.242]] };
}

function cat(a, b){ return a.concat(b); }

var LEG_A = 16, LEG_B = 28;

function silhouette(rf, ff, brot, legrot, LF, LR){
  brot = brot || function(p){ return p; };
  legrot = legrot || function(p){ return p; };
  /* LF/LR 是已经摆好的腿（趴下用）。不传就按站姿的落点现造 —— 两条路
     都在这里汇合，免得趴下另开一份 silhouette。 */
  var R = LR || rearLeg(rf[0], rf[1]), F = LF || frontLeg(ff[0], ff[1]);
  /* 头 10 个 → 鬐甲/背/臀 6 个，是一条连续的链，权重逐个不同（BW 里查）。 */
  var head = [SK.nose, SK.muzTop, SK.stop, SK.brow, SK.crown, SK.earF,
              SK.earTip, SK.earB, SK.skull, SK.neckTop,
              SK.with, SK.back1, SK.back2, SK.croup, SK.rumpTop, SK.rumpBack];
  var belly = [SK.bellyR, SK.bellyM, SK.bellyF];
  var front = [SK.elbow, SK.chest, SK.chestUp,
               SK.throat, SK.jaw, SK.chin, SK.muzBot, SK.noseBot];
  /* 顺序不能动：描边顺序 = 遮挡顺序（远腿 → 尾巴 → 填色 → 奶白 → 轮廓 → 脸）。 */
  return cat(head.map(brot),
         cat(R.down.map(legrot),
         cat(R.paw.map(legrot),
         cat(R.up.map(legrot),
         cat(belly.map(brot),
         cat(legPts(F),
         front.map(brot)))))));
}

function legPts(L){ return L.down.concat(L.paw, L.up); }

function farLegPts(p){
  p = p.slice();
  p[0] = [p[0][0], FAR_TOP];
  p[p.length - 1] = [p[p.length - 1][0], FAR_TOP];
  return p;
}

function pinFar(p, a0, a1){
  p = p.slice();
  p[0] = [a0[0], a0[1]];
  p[p.length - 1] = [a1[0], a1[1]];
  return p;
}

function lieLeg(L, ang){
  if (!ang) return L;
  var piv = L.down[0];
  function r(p){ return rot(p, ang, piv); }
  return { down: L.down.map(r), paw: L.paw.map(r), up: L.up.map(r) };
}

function collapseLeg(L, t, a, b){
  if (!t) return L;
  var all = L.down.concat(L.paw, L.up), n = all.length, i, out = [], q;
  for (i = 0; i < n; i++){
    var f = i / (n - 1);
    q = [a[0] + (b[0]-a[0])*f, a[1] + (b[1]-a[1])*f];
    out.push([all[i][0] + (q[0]-all[i][0])*t, all[i][1] + (q[1]-all[i][1])*t]);
  }
  return { down: out.slice(0, L.down.length),
           paw:  out.slice(L.down.length, L.down.length + L.paw.length),
           up:   out.slice(L.down.length + L.paw.length) };
}

var FAR_EAR = [[0.368, 0.764], [0.308, 0.879], [0.271, 0.755]];

function pts2str(p){
  var s = [], i;
  for (i = 0; i < p.length; i++) s.push(p[i][0].toFixed(3) + "," + p[i][1].toFixed(3));
  return s.join(" ");
}

function ptsPathGap(p, a, b){
  var s = [], i;
  s.push("M" + p[b][0].toFixed(3) + " " + p[b][1].toFixed(3));
  for (i = b + 1; i < p.length; i++) s.push("L" + p[i][0].toFixed(3) + " " + p[i][1].toFixed(3));
  for (i = 0; i <= a; i++) s.push("L" + p[i][0].toFixed(3) + " " + p[i][1].toFixed(3));
  return s.join("");
}

var SIT_ANG = 26 * DEG;

var SIT_RDX = 0.20;

var SIT_TX = 0.13;

var W_BELLY_M = 0.30, W_BELLY_R = 0.70;

var BW = [[SK.nose,0],[SK.muzTop,0],[SK.stop,0],[SK.brow,0],[SK.crown,0],
          [SK.earF,0],[SK.earTip,0],[SK.earB,0],[SK.skull,0],[SK.neckTop,0],
          [SK.throat,0],[SK.jaw,0],[SK.chin,0],[SK.muzBot,0],[SK.noseBot,0],
          [SK.with,0],[SK.chestUp,0],[SK.chest,0],[SK.elbow,0],[SK.bellyF,0],
          [SK.shB,0],
          [SK.back1,0.25],[SK.bellyM,W_BELLY_M],
          [SK.back2,0.55],[SK.bellyR,W_BELLY_R],
          [SK.croup,1],
          [SK.rumpTop,1],[SK.rumpBack,1],[SK.hipB,1],[SK.hipB2,1]];

function bodyW(p){
  for (var i = 0; i < BW.length; i++) if (BW[i][0] === p) return BW[i][1];
  return 0;
}

function bellyW(x){
  if (x >= SK.bellyF[0]) return 0;
  if (x >= SK.bellyM[0]) return W_BELLY_M * (SK.bellyF[0]-x) / (SK.bellyF[0]-SK.bellyM[0]);
  if (x >= SK.bellyR[0]) return W_BELLY_M + (W_BELLY_R-W_BELLY_M)
                                * (SK.bellyM[0]-x) / (SK.bellyM[0]-SK.bellyR[0]);
  return W_BELLY_R;
}

var ELEG = 0.55, EBOD = 1.0;

var LIE_SW = 75 * DEG;

var LIE_HW = 75 * DEG;

var LIE_WE = 0.65;

var LIE_EXTRA = 0.018;

var LIE_E = 1.0;

var LIE_TILT = 8 * DEG;

function rot(p, ang, piv){
  var c = Math.cos(ang), s = Math.sin(ang);
  var dx = p[0]-piv[0], dy = p[1]-piv[1];
  return [piv[0] + dx*c - dy*s, piv[1] + dx*s + dy*c];
}

function tailPts(wag, n){
  /* 半径 0.150→0.080（螺线），带宽 0.086→0.020。
     关键是带宽要远小于半径 —— 上一版半径 0.114、带宽 0.104，
     两个数一个量级，中间那个洞就跟呼啦圈一样大。
     圆心 (-0.170, 0.556) 落在背线（≈0.60）以下：下半圈被身子盖住，
     露出来的只有上半个弧，读起来是"卷在背上"，不是"屁股上挂了个环"。 */
  var cx = -0.170, cy = 0.556, L = [], R = [], i;
  n = n || 17;
  for (i = 0; i < n; i++){
    var t = i / (n - 1);
    var a = (208 - 248*t) * DEG + (wag || 0) * 0.55 * t;
    var r = 0.150 - 0.070*t;
    var px = cx + r*Math.cos(a), py = cy + r*Math.sin(a);
    var w = (0.086 - 0.066*Math.pow(t, 1.15)) * 0.5;
    L.push([px + Math.cos(a)*w, py + Math.sin(a)*w]);
    R.push([px - Math.cos(a)*w, py - Math.sin(a)*w]);
  }
  R.reverse();
  return L.concat(R);
}

var CREAM_BODY = [
  [ 0.148, 0.371], [ 0.020, 0.375], [-0.060, 0.395], [-0.118, 0.419],
  [-0.078, 0.458], [-0.020, 0.456], [ 0.060, 0.452], [ 0.148, 0.442]
];

var CREAM_CHEST = [
  [ 0.352, 0.592], [ 0.356, 0.502], [ 0.352, 0.440],
  [ 0.314, 0.462], [ 0.302, 0.516], [ 0.296, 0.576]
];

var CREAM_FACE = [
  [ 0.588, 0.679], [ 0.547, 0.697], [ 0.515, 0.716], [ 0.490, 0.706],
  [ 0.473, 0.667], [ 0.432, 0.658], [ 0.395, 0.651],
  [ 0.414, 0.630], [ 0.469, 0.626], [ 0.519, 0.637], [ 0.561, 0.651],
  [ 0.582, 0.653]
];

var NOSE_PTS = [[0.568,0.681],[0.582,0.674],[0.586,0.660],[0.577,0.651],
                [0.565,0.656],[0.561,0.672]];

var MOUTH_A = [0.556, 0.664],    // 唇线前点（鼻子后下方）
    MOUTH_B = [0.484, 0.641],    // 唇线后点（下巴前）
    MOUTH_C = [0.520, 0.658],    // 上唇控制点
    MOUTH_OPEN = 0.050;

function mouthD(open, maxDy){
  var dy = (maxDy == null ? MOUTH_OPEN : maxDy) * (open > 1 ? 1 : (open < 0 ? 0 : open));
  return "M" + MOUTH_A[0] + " " + MOUTH_A[1] +
         "Q" + MOUTH_C[0] + " " + MOUTH_C[1] + " " + MOUTH_B[0] + " " + MOUTH_B[1] +
         "Q" + MOUTH_C[0] + " " + (MOUTH_C[1] - dy).toFixed(4) + " " +
              MOUTH_A[0] + " " + MOUTH_A[1] + "Z";
}

function dogFlat(L, opt){
  var k = L / DLEN;
  var wantMouth = !!(opt && opt.mouth);
  var g  = el("g", {"data-town-dog":"1"});          // 挂 place() 的 transform
  var gi = el("g", {});          // 身体起伏挂在它上面，影子不跟着动
  g.appendChild(gi);
  var SW = 0.033;                // 唯一的线宽：整只狗共用一条轮廓

  /* 落地影：屏幕空间的椭圆。已知的将就 —— 转视角会露馅，但镇里的雪堆、
     光晕全是这么画的，狗身上保持一致。 */
  var shadow = el("ellipse", {cx:0.060, cy:0.028, rx:0.400, ry:0.112,
                              fill:"url(#contact)"});
  g.appendChild(shadow);

  /* 画序 = 遮挡序，也是"不拼接"的关键：
       远腿 → 尾巴 → 身子填色 → 奶白 → 轮廓描边 → 脸 → 项圈
     轮廓描到最后一层，内部那些色块的边永远被它压住，不会各描各的。 */
  /* 远腿不描边。描了的话，四条腿的粗线在肚子下面挤成一片黑 —— 试过
     （dog22），腿是分开了，可整个下肢变成一坨。改成深一档的纯色块：它是
     "背面"，本来就不该有和近侧一样硬的边。形状本身和近腿完全一样
     （见 legPts），只是颜色深、没有描边。 */
  var pFarF = el("polygon", {points:"", fill:shade(FUR,-0.24), stroke:"none"});
  var pFarR = el("polygon", {points:"", fill:shade(FUR,-0.24), stroke:"none"});
  gi.appendChild(pFarF); gi.appendChild(pFarR);

  var pTail = el("polygon", {points:"", fill:shade(FUR,-0.10), stroke:C.line,
                             "stroke-width":(SW*0.78).toFixed(4),
                             "stroke-linejoin":"round"});
  gi.appendChild(pTail);

  var farEar = el("polygon", {points:pts2str(FAR_EAR), fill:shade(FUR,-0.24),
                              stroke:"none"});
  gi.appendChild(farEar);

  var pBody = el("polygon", {points:"", fill:FUR, stroke:"none"});
  gi.appendChild(pBody);
  /* 腹白要每帧重算：它横跨腰，一头在 w=0 的胸口、一头在 w=0.70 的肚子，
     非得跟着腹线一起弯不可（见 pose 里的 bellyW）。
     胸白和脸白反过来 —— 它们整个落在 w=0 那一侧，一次都不用动。 */
  var pCreamBody = el("polygon", {points:pts2str(CREAM_BODY), fill:CREAM, stroke:"none"});
  gi.appendChild(pCreamBody);
  gi.appendChild(el("polygon", {points:pts2str(CREAM_CHEST), fill:CREAM, stroke:"none"}));
  var pCreamFace = el("polygon", {points:pts2str(CREAM_FACE), fill:CREAM, stroke:"none"});
  gi.appendChild(pCreamFace);

  /* 轮廓描边。是路径不是多边形 —— 近后腿那一段（下标 `LEG_A..LEG_B`）
     要空出来不描，多边形做不到"断开"。为什么必须断开见 `pose()` 里
     `pLine.setAttribute("d", ...)` 那一段。 */
  var pLine = el("path", {d:"", fill:"none", stroke:C.line,
                          "stroke-width":SW, "stroke-linejoin":"round",
                          "stroke-linecap":"round"});
  gi.appendChild(pLine);

/* 趴下时那条折起来的后腿：自己一层，压在身子上面（见 pose() 里的 LP_t）。
   分两个元素是因为描边和填色要的形状不一样：`pLieLeg` 是闭合多边形，只填色
   （闭合边不描，不会多出线）；`pLieLine` 是开放折线，只描边（两端都落在身子的
   轮廓上，毛色里不留线头）。必须排在 `pLine` 之后，才能盖掉那段腹线。站姿下
   两层和 `pLine` 逐点重合，多画一层看不出差别。 */
  var pLieLeg = el("polygon", {points:"", fill:FUR, stroke:"none"});
  gi.appendChild(pLieLeg);
  var pLieLine = el("polyline", {points:"", fill:"none", stroke:C.line,
                                 "stroke-width":SW, "stroke-linejoin":"round",
                                 "stroke-linecap":"round"});
  gi.appendChild(pLieLine);

  /* 脸。不许用 <circle> —— 那会污染 town.html 里
     __probe.state().trees 的计数（它数的是全场景每一个 circle）。 */
  var eye  = el("ellipse", {cx:0.464, cy:0.704, rx:0.030, ry:0.031, fill:INK});
  var nose = el("polygon", {points:pts2str(NOSE_PTS), fill:INK, stroke:"none"});
  gi.appendChild(eye); gi.appendChild(nose);
  /* 嘴：只有头像那一份建（见 MOUTH_A 上面那段）。线宽比全身轮廓细一档 ——
     SW 0.033 是照着"一整只狗的外形"定的，用在一条 0.07 长的唇线上就成了一条黑杠。 */
  var mouth = null;
  if (wantMouth){
    /* `class` 是给尺子用的：`_logs/_avcheck.py` 要能数出嘴有几个，
       好让"孪生页里一个都没有"成为可核对的阴性对照。
       （`.c-av path` 数不了 —— 轮廓和项圈也是 path。） */
    mouth = el("path", {d:mouthD(0), class:"dog-mouth", fill:INK, stroke:INK,
                        "stroke-width":0.020, "stroke-linejoin":"round",
                        "stroke-linecap":"round"});
    gi.appendChild(mouth);
  }

  /* 项圈：横跨脖子的一条带，两端落在轮廓线上（不落在轮廓上的话会戳出来）。
     脖子是斜的，所以这条带也是斜的 —— 和脖子轴垂直。铃铛用 <ellipse>。 */
  var colr = el("path", {d:"M0.243 0.699L0.368 0.573", fill:"none", stroke:BELT,
                         "stroke-width":0.076, "stroke-linecap":"butt"});
  var bell = el("ellipse", {cx:0.372, cy:0.550, rx:0.036, ry:0.039, fill:BRASS,
                            stroke:C.line, "stroke-width":0.022});
  gi.appendChild(colr); gi.appendChild(bell);

  var PIV = [HOME_F, PAWY];    // 坐下的枢轴 = 前爪着地点（前爪因此原地不动）
  function pose(st){
    st = st || {};
    var ph = (st.ph || 0) * Math.PI * 2;
    var on = st.gait === false ? 0 : 1;
    /* 趴下和坐下互斥：它们是两支不同的刚体变换，叠起来没有意义
       （坐是"后半身绕前爪转"，趴是"整体沉 + 四腿摊平"）。谁给了 st.lie 就
       走趴下那一支，坐下的角度/平移全部归零。 */
    var lie = Math.max(0, Math.min(1, st.lie || 0));
    var ll = LIE_E === 1 ? lie : Math.pow(lie, LIE_E);
/* "塌完"的进度：比 `ll` 先走完（0.3 就到 1）。远腿是"从站姿一路插值到那条贴身的线"，
   插到一半就吊在肚子下面露出来（把远腿染绿看：ll=0.4 时肚子底下吊着两块，加上近腿
   那两条正好是"后腿变成了三条"）。另外两处也跟着它走：剪影里那条腿塌到弦上
   （`pLine` 要把那一段空出来不描）、折腿末点贴回身子下缘。 */
    var llf = ll / 0.3 < 1 ? ll / 0.3 : 1;
    var sit = lie ? 0 : Math.max(0, Math.min(1, st.sit || 0));
    /* 两条曲线：`sl` 驱动四条腿的折叠与收拢，`sb` 驱动身体的俯仰。
       两者都等于 `sit` 时就是原来的匀速版本（见 ELEG/EBOD 那段）。 */
    var sl = ELEG === 1 ? sit : Math.pow(sit, ELEG);
    var sb = EBOD === 1 ? sit : Math.pow(sit, EBOD);
    /* 负角 = 后半身抬起（正角是坐下那个"后半身下沉"）。趴下走这一支。 */
    var a = SIT_ANG * sb - LIE_TILT * ll;
    /* 趴下：腿摆平的角度，和由它反解出来的下沉量。顺序不能反 ——
       `Dl` 的定义就是"摆完之后的爪高减去 PAWY"，所以必须先有角度。
       角为 0 时 `rot` 返回原点 ⇒ `Dl` 自然为 0，不需要特判。 */
    var la = LIE_SW * ll, ha = LIE_HW * ll;
    var Dl = rot([HOME_F, PAWY], la, SK.bellyF)[1] - PAWY + LIE_EXTRA * ll;
    /* 走起来的过程里步态要一起收掉 —— 否则一只正在坐下/趴下的狗四条腿还在小跑。
       `on` 管"要不要走"，这两项管"坐下/趴下时走不走"，三者相乘。 */
    var g = on * (1 - sl) * (1 - ll);
    var bob = 0.012 * Math.cos(2*ph) * g;
    /* 先算世界坐标里的落点，再反旋转回局部坐标 —— 转完才会正好踩在地上。
       （旋转是刚体变换，局部坐标里"抬高一截"转完就不等于世界里"抬高一截"，
       所以 FARDY 这个远腿的抬升也必须走世界坐标。） */
    function unrot(p){
      var c = Math.cos(-a), s = Math.sin(-a);
      var dx = p[0]-PIV[0], dy = p[1]-PIV[1];
      return [PIV[0] + dx*c - dy*s, PIV[1] + dx*s + dy*c];
    }
    /* 对角步：右前与左后同相 —— 小跑（trot），不是同手同脚。
       远侧那一对的家位各让开 FARDX=0.090 —— 这个量是近侧腿的描边定的：
       远爪的前缘必须露在近腿背缘的外面，否则整条远腿被吃掉。
       爪一加宽（0.084 → 0.092）这个数就得跟着加，0.078 时趾尖已经藏进去了。 */
    function footW(hx, p, sitDx, lift){
      return [hx + GAIT_A*g*Math.cos(p) + sitDx*sl,
              PAWY + Math.max(0, -Math.sin(p)) * GAIT_LIFT * g + (lift || 0)];
    }
/* 远侧后腿坐下时要缩到近侧后面去（TUCK）—— 不缩的话那条远腿会从肚子底下斜戳出一片
   没描边的深色薄片，尖头朝下，读起来像刺。根子不是画错：`KT` 那个补偿量是按步态摆幅
   ±GAIT_A=0.070 解出来的，而 SIT_RDX=0.20 是它的近三倍，整条腿被拉成一块横板 ——
   站姿的拓扑表达不了坐姿。所以不修形，让它被挡住：FARDX/FARDY 随 sl 归零。 */
    var tk = 1 - sl;
    /* 前腿落点是世界坐标（eleg 那条链上它一个点都不转），
       后腿落点是局部坐标 —— 后腿整条跟着臀转满 a，所以先算出世界落点、
       再 `unrot` 回来，转完才正好踩在地上。 */
    var fn = footW(HOME_F,             ph,           0,       0),
        ff = footW(HOME_F - FARDX,     ph + Math.PI, 0,       FARDY);
    /* 后脚：先在世界坐标里算出落点，减掉 tx，再反旋转回局部坐标。
       减 tx 是因为下面 `rig` 会给整条后腿补上这个平移 —— 不先减掉的话，
       爪会被平移带着往前跑（`sitDx` 就不再是它实际走的那段了）。 */
    var tx = SIT_TX * sb;
    function rfoot(hx, p, lift){
      var w = footW(hx, p, SIT_RDX, lift);
      return unrot([w[0] - tx, w[1]]);
    }
    var rn = rfoot(HOME_R,             ph + Math.PI, 0),
        rf = rfoot(HOME_R + FARDX*tk,  ph,           FARDY*tk);
    /* 两个变换，别混：
         `bw`  —— 按部位加权（头/胸 0、腰 0.3~0.62、臀 1），再按同一个 w 补 tx。
         `rig` —— 整条转满 a 再加 tx，给后腿和尾巴：它们就是臀的一部分，没有中间态。
       前腿和脸上那些件不经过任何变换 —— 它们全是 w=0，转了反而错。 */
    function bw(p){ var w = bodyW(p); return bwAt(p, w); }
    /* 趴下只补偿肘一个点 —— 其余身体锚点都该沉满，而"沉满"这件事是
       gi 上那个 translate 干的，局部坐标一个字都不用动。
       肘不补偿就会掉到腹线以下，在肩前戳一个向下的尖。 */
    function bwAt(p, w){
      var q = a ? rot(p, a*w, PIV) : p;
      if (tx && w) q = [q[0] + tx*w, q[1]];
      if (Dl && p === SK.elbow) q = [q[0], q[1] + Dl*(1 - LIE_WE)];
      return q;
    }
    function rig(p){ var q = a ? rot(p, a, PIV) : p; return tx ? [q[0]+tx, q[1]] : q; }
    /* 四条腿：趴下时全部绕各自的贴身锚点转（`lieLeg`），站/坐时原样。
远腿的 `dx` 要在摆之前给（构造函数里给），摆的枢轴是它自己的
         `down[0]`（已经含了 dx），这样两条腿各自绕各自的根，不会互相拽。 */
    var LF_n = lieLeg(frontLeg(fn[0], fn[1], 0), la),
        LF_f = lieLeg(frontLeg(ff[0], ff[1], -FARDX), la),
/* 近后腿在剪影里塌平（和远腿一样）：那条折腿已经单开一层画了（见 pLieLeg / LP_t），
   剪影再留一块半岛，两条腿的边会打架。两个塌陷端点必须是反旋过的最终位置 ——
   `collapseLeg` 的端点是最终坐标，而腿的点还会被 `rig` 转一道，直接给最终坐标等于
   转两遍（这才是上一版"原本身体的线还在表层"的真因）。`rig(unrot(p)) === p`。 */
/* 近后腿：一串点同时喂给剪影和那一层（见下面 `pLieLeg`）。走 `lieLeg` + `collapseLeg`
   那条老路时，那一层另走一条混合 —— 两条路算出两个形状，中途就成了"后腿变成了三条"。
   现在只有一串数，任何一帧都只有一个形状。混合在局部坐标里做（起点是站姿那条腿、
   终点是折好的那条），两边由 `rig` 一起转出去。 */
        /* 终点那条腿和前腿走同一套：拿站姿的 `rearLeg` 绕自己的根
           （`down[0]` = `hipB`）转 `la`，用的就是前腿那个 `lieLeg`、那个角度。
           形状、宽度、踝、爪全是构造函数给的。 */
        LP_t = legPts(lieLeg(rearLeg(HOME_R, PAWY, 0), la)),
        LP = legPts(rearLeg(rn[0], rn[1], 0)).map(function(p, i){
          var q = LP_t[i];
          return [p[0] + (q[0]-p[0])*ll, p[1] + (q[1]-p[1])*ll];
        }),
        LPn = { down: LP.slice(0, 3), paw: LP.slice(3, 11), up: LP.slice(11) },
/* 剪影里那条后腿塌到弦上（`hipB→bellyR`，局部坐标，出去由 `rig` 转正）。这样身子
   自己保留下后缘一条完整的边，折腿那一层再压上去 —— 两层分得开靠的就是"身子有边、
   腿压在它上面"。这一条也塌 `llf`（比那一层先缩完）：塌到一半的剪影腿始终落在那一层
   的填色多边形里面（那个多边形把弦以上那块也圈进去了），快慢不一致也露不出来。 */
        /* 末端点要用 `bellyR` 在腹线上那一个（带 `bodyW` 权重），不是
           `rig(SK.bellyR)` —— 后者差 0.019，塌出来的线与腹线接不上，
           会在身下留一个台阶。 */
        LPc = collapseLeg(LPn, llf, SK.hipB,
                          unrot(bwAt(SK.bellyR, bodyW(SK.bellyR)))),
        LR_n = LPc,
        /* 远后腿：塌到 `hipB→bellyR` 上，被身子的填色和近腿盖住 ——
           真狗趴着时远侧后腿本来就在后面看不见。 */
/* 塌陷的两个端点必须用抬起之后的锚点：`LIE_TILT` 把臀线和腹线的后端都抬走了，照原来
   的坐标塌，那条线会留在原地、从身子底下露出来。塌的进度用 `llf` 不用 `ll` —— 远腿要
   比近腿先塌完（它插到一半就吊在肚子下面露出来，加上近腿那两条就是"后腿变成了三条"）。
   0.3 走完全程。 */
        LR_f = collapseLeg(lieLeg(rearLeg(rf[0], rf[1], FARDX*tk), ha), llf,
                           bwAt(SK.hipB, 1),
                           bwAt(SK.bellyR, bodyW(SK.bellyR)));
    var outPts = silhouette(rn, fn, bw, rig, LF_n, LR_n);
    pBody.setAttribute("points", pts2str(outPts));
/* 描边跳过近后腿那一段（下标 LEG_A..LEG_B）。身子下缘在这一段没有自己的边：站姿下
   那儿是真腿本身、`pLieLine` 会画出来；趴下时剪影那条腿整个塌到弦 hipB'→bellyR' 上，
   这一段就成了一道横在毛色上、上下同色的杠。不描它就没了，填色照旧沿弦闭合。
   两个端点仍照画。 */
    pLine.setAttribute("d", ptsPathGap(outPts, LEG_A, LEG_B));
/* 那条折腿：自己一整块，压在身子上面（`LP`，和剪影用的是同一个 `ll`）。填色是闭合
   多边形 —— 连弦 `bellyR'→hipB'` 一起圈进去，所以弦以上那块（大腿压在身上）也是毛色；
   描边是开放折线，闭合边不描，不然身侧会多出一道从髋直拉到腹线的直线。站姿下和
   `pLine` 逐点重合看不出来，趴下时大腿顶那条横线就画在身侧，腿于是读得出来。 */
    var liePts = legPts(LPn).map(rig);
/* 折腿的末点 p12 要贴回剪影的下缘 —— 它是这条腿挂在身子上的那一点。剪影那条腿
   往弦上塌、身子下缘先收上去，p12 还吊在下面，后缘和身子之间就裂开一道口子
   （线端的圆头悬空、填色楔形露出来）。目标取剪影里那条腿的同一个点 `LPc.up[1]`，
   只提不压 —— p11 本来就该在外面吊着。x 也要贴，只贴 y 会差 0.037 的横距。
   位置要在填色 setAttribute 之前，之后改只动到描边。 */
    var j12 = rig(LPc.up[1]);
    if (liePts[12][1] < j12[1]){
      liePts[12][0] += (j12[0] - liePts[12][0]) * llf;
      liePts[12][1] += (j12[1] - liePts[12][1]) * llf;
    }
/* 填色的收口边 p12→p0 要停在弦描边的外沿（往上半个线宽）：停高了把整条弦盖死、
   读起来"腿和肚子连成一片"，停低了外侧半个线宽留在外面，就是"中间黑线"。
   还要跟弦错开 1/4 个线宽 —— 两条填色边贴在一起时各自的抗锯齿各盖一半，交界处会
   露出背景成一道发白的细线（弦已经不描了，这里只需盖住抗锯齿）。两个量都乘 llf。 */
    var q0 = liePts[0], q1 = liePts[12];
    var ex = q1[0]-q0[0], ey = q1[1]-q0[1], el = Math.sqrt(ex*ex + ey*ey) || 1;
    var nx = -ey/el, ny = ex/el;                    // 弦的法线，指向身子那一侧
    var nK = SW * 0.25 * llf;
    pLieLeg.setAttribute("points", pts2str(liePts.concat(
      [[q1[0]+nx*nK, q1[1]+ny*nK], [q0[0]+nx*nK, q0[1]+ny*nK]])));
/* 收口边只到 `p12` 就拐回髋，所以上缘离弦不能超过一个线宽：弦以上不算腿、上缘以下
   才是腿。`p11` 压到弦下 0.036 时，x=−0.14 那一列中间会冒出一块背景色 —— 原先靠
   两笔描边各半个线宽盖住，现在弦不描了，盖缝的只剩填色，判据只会更严，没有放松。 */
/* 折腿的描边在身子下缘收笔。折起来之后这条腿的后半截整个跑到身子里面，照描就是在
   毛色上斜着划一道线，两道这样的线在腹下交叉，就是"别扭的变成个刺往旁边钻"。
   身子下缘那条线 `pLine` 本来就在画，收在这里正好接上。站姿下一个点都不裁，站着 /
   走路 / 坐下逐像素不变。折线的权重必须和剪影里 `belly.map(brot)` 完全一致，
   否则收笔处会差出一两个像素。 */
    var lowLine = [bwAt(SK.hipB, 1), bw(SK.bellyR), bw(SK.bellyM), bw(SK.bellyF)];
    function bodyLow(x){
      for (var li = 0; li < lowLine.length - 1; li++){
        var la2 = lowLine[li], lb = lowLine[li+1];
        if (x >= Math.min(la2[0], lb[0]) - 1e-9 && x <= Math.max(la2[0], lb[0]) + 1e-9){
          var lt = (x - la2[0]) / ((lb[0] - la2[0]) || 1e-9);
          return la2[1] + (lb[1] - la2[1]) * lt;
        }
      }
/* x 落在折线两头之外时必须把最近那一段延长出去，不能返回 −1e9 —— 那是"下缘在很深的
   地方"，于是任何点都算在它上面 = 在身子里，和本意正好相反，而且是端点处一刀切。
   代价：小跑六格里后脚往后摆的那三格 fx 到了 −0.320，比 hipB.x 还靠后，`p1`（飞节）
   落到折线之外被判成"进身子了"，描边在那一段收笔，整条腿只剩剪影一笔。 */
      var ea = x < lowLine[0][0] ? lowLine[0] : lowLine[lowLine.length - 2],
          eb = x < lowLine[0][0] ? lowLine[1] : lowLine[lowLine.length - 1];
      var et = (x - ea[0]) / ((eb[0] - ea[0]) || 1e-9);
      return ea[1] + (eb[1] - ea[1]) * et;
    }
    var lieDraw = liePts;
/* 从 1 开始扫，不是 0：`p0` 就是 `hipB'`，正好落在下缘这条线上，拿它当"进身子了"
   会把整条描边裁空（`points` 会变成空串，腿一根线都没有）。 */
    for (var ci = 1; ci < liePts.length; ci++){
      if (liePts[ci][1] <= bodyLow(liePts[ci][0]) + 1e-6) continue;   // 还在外面
      var ca = liePts[ci-1], cb = liePts[ci], clo = 0, chi = 1, cmid, cp;
      for (var it = 0; it < 20; it++){                          // 二分找交点
        cmid = (clo + chi) / 2;
        cp = [ca[0] + (cb[0]-ca[0])*cmid, ca[1] + (cb[1]-ca[1])*cmid];
        if (cp[1] >= bodyLow(cp[0])) chi = cmid; else clo = cmid;
      }
      lieDraw = liePts.slice(0, ci).concat(
        [[ca[0] + (cb[0]-ca[0])*chi, ca[1] + (cb[1]-ca[1])*chi]]);
      break;
    }
    pLieLine.setAttribute("points", pts2str(lieDraw));
    pCreamBody.setAttribute("points", pts2str(CREAM_BODY.map(function(p){
      return bwAt(p, bellyW(p[0])); })));
    /* 远前腿也不转（和近前腿一样整个 w=0）；远后腿先 farLegPts 再 rig ——
       顺序反了就不对：首尾锚点要钉在局部坐标的 FAR_TOP 上，
       旋转放到最后，才和改动前（由 group 统一转）逐点相同。 */
    /* 远腿的钉子分两路：趴下钉到近腿的端点上（见 pinFar），其余钉 FAR_TOP。
       远后腿在站/坐那一路还要再 `rig` —— 钉用的是局部坐标的 FAR_TOP，
       所以必须在旋转之前钉。趴下那一路腿已经摆好了，不能再 rig。 */
    if (ll){
      /* 远前腿这里原来只调 `pinFar`（把首尾两点钉到近腿上），中间那 11 个点
         一动不动 —— 于是它成了"一条转过的腿，两头被拎到肩膀、爪子还吊在
         老地方"，正是 dbg10 里那块绿斑。改成和远后腿同一套：先 `collapseLeg`
         塌到近腿的首尾连线上，再钉。塌完是一条贴着肩胛的线，被近腿和身子
         的填色整个盖住。 */
      pFarF.setAttribute("points",
        pts2str(legPts(collapseLeg(LF_f, llf, LF_n.down[0], LF_n.up[1]))));
      /* 远后腿钉到 hipB / bellyR —— 后腿塌平之后，轮廓上那两个位置就是它的入口
         和出口。形状本来就已被 collapseLeg 塌成一条线，所以这里画的是一条
         压在身体后下缘上的线，不露头。 */
      pFarR.setAttribute("points",
        pts2str(pinFar(legPts(LR_f), bwAt(SK.hipB, 1),
                       bwAt(SK.bellyR, bodyW(SK.bellyR)))));
    } else {
      pFarF.setAttribute("points", pts2str(farLegPts(legPts(frontLeg(ff[0], ff[1], -FARDX)))));
      pFarR.setAttribute("points",
        pts2str(farLegPts(legPts(rearLeg(rf[0], rf[1], FARDX*tk))).map(rig)));
    }
    pTail.setAttribute("points", pts2str(tailPts(0.020*Math.sin(ph + 0.6)*on).map(rig)));
    /* 影子挂在 g 上（不在 gi 里），所以不跟着转、也不跟着沉 ——
       它本来就该平躺在地上。坐下去重心后移、趴下去身子拉长，
       两种情况都得单独挪一下，否则狗像坐在影子前面 / 影子比狗短。 */
    shadow.setAttribute("cx", (0.060 - 0.150*sb + 0.130*ll).toFixed(4));
    shadow.setAttribute("rx", (0.400 + 0.030*sb + 0.110*ll).toFixed(4));
    /* gi 管两件事：走路起伏，和趴下的整体下沉。
       下沉挂在这里的意义：脸/眼/鼻/项圈/铃铛/胸白/脸白/远耳/尾巴/轮廓
       全部自动跟着走，局部坐标一个都不用改 —— 只有腿和肘需要补偿。
       以前那个 `rotate(a)` 早就拆进 bw/rig/不转三路里了；早先还在 eye 的 cy 上
       又加过一遍 bob，那是重复计数。 */
    gi.setAttribute("transform",
      "translate(0," + (bob - Dl).toFixed(4) + ")");
  }
  pose({});

  return {
    g: g, k: k, L: L,
    pose: pose,
    /* 头像要驱动的那两笔。`mouth` 在没要嘴的那一份里是 null，
       调用方自己判空 —— 别在这里塞一个假元素，那会让镇上多一个节点。 */
    eye: eye, mouth: mouth,
    /* face<0 就镜像。锚点给的是屏幕坐标（调用方自己过 P()）。 */
    place: function(px, py, face){
      g.setAttribute("transform", "translate(" + px.toFixed(1) + "," + py.toFixed(1)
                    + ") scale(" + (face < 0 ? -k : k).toFixed(4) + "," + (-k).toFixed(4) + ")");
    }
  };
}
/* ===== END EXTRACTED ===== */

window.DogFlat = { make: dogFlat, K: 54 };
})();
