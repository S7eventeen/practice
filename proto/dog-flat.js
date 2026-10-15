/* 由 python scripts/sync-dog.py 从 proto/town.html 生成，勿手改。
   镇上狗、头像与 Boss 共用 dogFlat() 及其依赖。
   独立脚本避免 file:// 跨文档 DOM 访问限制，town.html 仍保留内联版本。
   检查：python scripts/sync-dog.py --check。
   共 54 个定义，来源 town.html 第 474–1557 行。 */
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
  /* 头部绕鬐甲 (0.186,0.620) 均匀放大 1.18，保持轮廓比例。
     耳尖由 0.925 降到 0.884，避免放大后耳部过长。 */
  nose:[0.593,0.686], muzTop:[0.552,0.704], stop:[0.519,0.722],
  brow:[0.464,0.764], crown:[0.423,0.805], earF:[0.414,0.791],
  earTip:[0.379,0.911], earB:[0.333,0.782], skull:[0.308,0.755],
  neckTop:[0.248,0.704],
  /* 背线抬鬐甲、收腰并降低臀部，避免躯干成为平直长条。 */
  with:[0.186,0.630], back1:[0.086,0.626], back2:[-0.038,0.620],
  croup:[-0.192,0.594], rumpTop:[-0.286,0.542], rumpBack:[-0.320,0.452],
  hipB:[-0.312,0.396], hipB2:[-0.308,0.300],
  /* 腹线向后抬高 0.030，保持 bellyF=0.322 和前腿长度。 */
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
  /* 卷尾半径 0.150→0.080、带宽 0.086→0.020。
     圆心 (-0.170,0.556) 位于背线下方，下半圈被躯干遮挡。 */
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

  /* 绘制顺序：远腿→尾巴→身体填色→里白→外轮廓→脸→项圈，外轮廓覆盖内部色块边。 */
  /* 远腿复用近腿几何，使用深色填充且不描边，避免四腿描边在腹下挤成黑块。 */
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
  /* 腹白跨越不同旋转权重，需随腹线每帧重算；胸白和脸白处于 w=0 区域。 */
  var pCreamBody = el("polygon", {points:pts2str(CREAM_BODY), fill:CREAM, stroke:"none"});
  gi.appendChild(pCreamBody);
  gi.appendChild(el("polygon", {points:pts2str(CREAM_CHEST), fill:CREAM, stroke:"none"}));
  var pCreamFace = el("polygon", {points:pts2str(CREAM_FACE), fill:CREAM, stroke:"none"});
  gi.appendChild(pCreamFace);

  /* 外轮廓使用开放路径，跳过近后腿 LEG_A..LEG_B 区间，避免趴姿重复描边。 */
  var pLine = el("path", {d:"", fill:"none", stroke:C.line,
                          "stroke-width":SW, "stroke-linejoin":"round",
                          "stroke-linecap":"round"});
  gi.appendChild(pLine);

/* 趴姿后腿单独置于 pLine 上方：pLieLeg 闭合填色，pLieLine 开放描边。
   两端落在躯干轮廓上；站姿与原轮廓重合。 */
  var pLieLeg = el("polygon", {points:"", fill:FUR, stroke:"none"});
  gi.appendChild(pLieLeg);
  var pLieLine = el("polyline", {points:"", fill:"none", stroke:C.line,
                                 "stroke-width":SW, "stroke-linejoin":"round",
                                 "stroke-linecap":"round"});
  gi.appendChild(pLieLine);

  /* 脸部使用 ellipse，避免污染 trees 对全场 circle 的计数。 */
  var eye  = el("ellipse", {cx:0.464, cy:0.704, rx:0.030, ry:0.031, fill:INK});
  var nose = el("polygon", {points:pts2str(NOSE_PTS), fill:INK, stroke:"none"});
  gi.appendChild(eye); gi.appendChild(nose);
  /* 嘴：只有头像那一份建（见 MOUTH_A 上面那段）。线宽比全身轮廓细一档 ——
     SW 0.033 是照着"一整只狗的外形"定的，用在一条 0.07 长的唇线上就成了一条黑杠。 */
  var mouth = null;
  if (wantMouth){
    /* 嘴节点保留独立 class，供 _logs/_avcheck.py 区分嘴与其他 path。 */
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
    /* lie 与 sit 互斥；传入 st.lie 时清零坐姿旋转和平移。 */
    var lie = Math.max(0, Math.min(1, st.lie || 0));
    var ll = LIE_E === 1 ? lie : Math.pow(lie, LIE_E);
/* 塌陷进度在 ll=0.3 时完成，提前隐藏远腿并使近后腿轮廓、折腿末点贴回身体下缘。 */
    var llf = ll / 0.3 < 1 ? ll / 0.3 : 1;
    var sit = lie ? 0 : Math.max(0, Math.min(1, st.sit || 0));
    /* 两条曲线：`sl` 驱动四条腿的折叠与收拢，`sb` 驱动身体的俯仰。
       两者都等于 `sit` 时就是原来的匀速版本（见 ELEG/EBOD 那段）。 */
    var sl = ELEG === 1 ? sit : Math.pow(sit, ELEG);
    var sb = EBOD === 1 ? sit : Math.pow(sit, EBOD);
    /* 负角 = 后半身抬起（正角是坐下那个"后半身下沉"）。趴下走这一支。 */
    var a = SIT_ANG * sb - LIE_TILT * ll;
    /* 先算摆角再反解 Dl；角度为 0 时下沉量自然为 0。 */
    var la = LIE_SW * ll, ha = LIE_HW * ll;
    var Dl = rot([HOME_F, PAWY], la, SK.bellyF)[1] - PAWY + LIE_EXTRA * ll;
    /* 走起来的过程里步态要一起收掉 —— 否则一只正在坐下/趴下的狗四条腿还在小跑。
       `on` 管"要不要走"，这两项管"坐下/趴下时走不走"，三者相乘。 */
    var g = on * (1 - sl) * (1 - ll);
    var bob = 0.012 * Math.cos(2*ph) * g;
    /* 先在世界坐标确定落脚点和 FARDY 抬升，再 unrot 回局部坐标，保证旋转后落地。 */
    function unrot(p){
      var c = Math.cos(-a), s = Math.sin(-a);
      var dx = p[0]-PIV[0], dy = p[1]-PIV[1];
      return [PIV[0] + dx*c - dy*s, PIV[1] + dx*s + dy*c];
    }
    /* 小跑采用对角步。远腿横向偏移 FARDX=0.090，使脚趾露出近腿轮廓。
       修改爪宽时同步检查遮挡。 */
    function footW(hx, p, sitDx, lift){
      return [hx + GAIT_A*g*Math.cos(p) + sitDx*sl,
              PAWY + Math.max(0, -Math.sin(p)) * GAIT_LIFT * g + (lift || 0)];
    }
/* 坐姿随 sl 将远后腿的 FARDX/FARDY 收至零，藏到近腿后方。
   步态 KT 只适配 ±0.070 摆幅，不能直接用于 SIT_RDX=0.20 的大幅收腿。 */
    var tk = 1 - sl;
    /* 前脚直接使用世界坐标；后脚先 unrot 为局部坐标，再随臀部旋转。 */
    var fn = footW(HOME_F,             ph,           0,       0),
        ff = footW(HOME_F - FARDX,     ph + Math.PI, 0,       FARDY);
    /* 后脚世界落点先减 tx 再 unrot，抵消 rig 后续对整腿追加的平移。 */
    var tx = SIT_TX * sb;
    function rfoot(hx, p, lift){
      var w = footW(hx, p, SIT_RDX, lift);
      return unrot([w[0] - tx, w[1]]);
    }
    var rn = rfoot(HOME_R,             ph + Math.PI, 0),
        rf = rfoot(HOME_R + FARDX*tk,  ph,           FARDY*tk);
    /* bw 按部位权重旋转并补 tx；rig 对后腿和尾巴全角旋转再补 tx。
       前腿与脸部的权重为 0，保持原位。 */
    function bw(p){ var w = bodyW(p); return bwAt(p, w); }
    /* 趴姿整体由 gi 下沉，仅补偿肘点，避免其落到腹线以下。 */
    function bwAt(p, w){
      var q = a ? rot(p, a*w, PIV) : p;
      if (tx && w) q = [q[0] + tx*w, q[1]];
      if (Dl && p === SK.elbow) q = [q[0], q[1] + Dl*(1 - LIE_WE)];
      return q;
    }
    function rig(p){ var q = a ? rot(p, a, PIV) : p; return tx ? [q[0]+tx, q[1]] : q; }
    /* 趴姿四腿绕各自 down[0] 旋转；远腿 dx 必须先由构造函数写入锚点。 */
    var LF_n = lieLeg(frontLeg(fn[0], fn[1], 0), la),
        LF_f = lieLeg(frontLeg(ff[0], ff[1], -FARDX), la),
/* 近后腿剪影塌平，折腿单独绘制。collapseLeg 端点先反旋转，
   确保 rig(unrot(p))===p，避免最终坐标被旋转两次。 */
/* 近后腿共用 LP 点列，局部坐标内从站姿插值到折腿，再统一经 rig 变换。 */
        /* 折腿目标由 rearLeg 绕 hipB 旋转 la 得到，与前腿共用 lieLeg。 */
        LP_t = legPts(lieLeg(rearLeg(HOME_R, PAWY, 0), la)),
        LP = legPts(rearLeg(rn[0], rn[1], 0)).map(function(p, i){
          var q = LP_t[i];
          return [p[0] + (q[0]-p[0])*ll, p[1] + (q[1]-p[1])*ll];
        }),
        LPn = { down: LP.slice(0, 3), paw: LP.slice(3, 11), up: LP.slice(11) },
/* 剪影后腿按 llf 提前塌到 hipB→bellyR 弦上，折腿层覆盖其填色。 */
        /* 末端使用带 bodyW 权重的 bellyR，保持与腹线连续。 */
        LPc = collapseLeg(LPn, llf, SK.hipB,
                          unrot(bwAt(SK.bellyR, bodyW(SK.bellyR)))),
        LR_n = LPc,
        /* 远后腿：塌到 `hipB→bellyR` 上，被身子的填色和近腿盖住 ——
           真狗趴着时远侧后腿本来就在后面看不见。 */
/* 塌陷端点使用 LIE_TILT 抬升后的锚点，进度 llf 在 ll=.3 时完成，提前隐藏远腿。 */
        LR_f = collapseLeg(lieLeg(rearLeg(rf[0], rf[1], FARDX*tk), ha), llf,
                           bwAt(SK.hipB, 1),
                           bwAt(SK.bellyR, bodyW(SK.bellyR)));
    var outPts = silhouette(rn, fn, bw, rig, LF_n, LR_n);
    pBody.setAttribute("points", pts2str(outPts));
/* 外轮廓跳过 LEG_A..LEG_B，避免趴姿塌平腿在毛色内形成横线；填色仍沿弦闭合。 */
    pLine.setAttribute("d", ptsPathGap(outPts, LEG_A, LEG_B));
/* 折腿层使用闭合填色和开放描边，覆盖弦上方的大腿区域而不描闭合弦。 */
    var liePts = legPts(LPn).map(rig);
/* 折腿 p12 按 llf 向剪影的 rig(LPc.up[1]) 对齐，只提不压，同时校正 x/y。
   调整必须早于填色 setAttribute。 */
    var j12 = rig(LPc.up[1]);
    if (liePts[12][1] < j12[1]){
      liePts[12][0] += (j12[0] - liePts[12][0]) * llf;
      liePts[12][1] += (j12[1] - liePts[12][1]) * llf;
    }
/* 填色收口沿弦法线重叠 SW*.25*llf，盖住抗锯齿接缝。 */
    var q0 = liePts[0], q1 = liePts[12];
    var ex = q1[0]-q0[0], ey = q1[1]-q0[1], el = Math.sqrt(ex*ex + ey*ey) || 1;
    var nx = -ey/el, ny = ex/el;                    // 弦的法线，指向身子那一侧
    var nK = SW * 0.25 * llf;
    pLieLeg.setAttribute("points", pts2str(liePts.concat(
      [[q1[0]+nx*nK, q1[1]+ny*nK], [q0[0]+nx*nK, q0[1]+ny*nK]])));
/* 折腿上缘距弦不超过一个线宽，保持填色封闭并避免露出背景。 */
/* 折腿描边在身体下缘收笔，权重与剪影腹线一致；站/走/坐姿不裁剪。 */
    var lowLine = [bwAt(SK.hipB, 1), bw(SK.bellyR), bw(SK.bellyM), bw(SK.bellyF)];
    function bodyLow(x){
      for (var li = 0; li < lowLine.length - 1; li++){
        var la2 = lowLine[li], lb = lowLine[li+1];
        if (x >= Math.min(la2[0], lb[0]) - 1e-9 && x <= Math.max(la2[0], lb[0]) + 1e-9){
          var lt = (x - la2[0]) / ((lb[0] - la2[0]) || 1e-9);
          return la2[1] + (lb[1] - la2[1]) * lt;
        }
      }
/* x 超出下缘折线时延长最近线段，避免用哨兵高度造成端点处突变。 */
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
    /* 远前腿不随身体转；远后腿先 farLegPts 设置局部锚点，再 rig。 */
    /* 趴姿远腿锚点贴近腿端点；站/坐姿锚到 FAR_TOP，后腿随后执行 rig。 */
    if (ll){
      /* 远前腿整条按同一位移升入身体，再钉端点，保持脚与腿根的相对形状。 */
      pFarF.setAttribute("points",
        pts2str(legPts(collapseLeg(LF_f, llf, LF_n.down[0], LF_n.up[1]))));
      /* 远后腿塌到 hipB/bellyR 弦后隐藏于近腿和身体后。 */
      pFarR.setAttribute("points",
        pts2str(pinFar(legPts(LR_f), bwAt(SK.hipB, 1),
                       bwAt(SK.bellyR, bodyW(SK.bellyR)))));
    } else {
      pFarF.setAttribute("points", pts2str(farLegPts(legPts(frontLeg(ff[0], ff[1], -FARDX)))));
      pFarR.setAttribute("points",
        pts2str(farLegPts(legPts(rearLeg(rf[0], rf[1], FARDX*tk))).map(rig)));
    }
    pTail.setAttribute("points", pts2str(tailPts(0.020*Math.sin(ph + 0.6)*on).map(rig)));
    /* 影子挂在 g，不随 gi 旋转或下沉；坐/趴姿分别调整位置和长度。 */
    shadow.setAttribute("cx", (0.060 - 0.150*sb + 0.130*ll).toFixed(4));
    shadow.setAttribute("rx", (0.400 + 0.030*sb + 0.110*ll).toFixed(4));
    /* gi 统一承担步态起伏与趴姿下沉，使头脸、项圈和身体同步移动。 */
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
