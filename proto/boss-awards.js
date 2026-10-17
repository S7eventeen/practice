(function(global){
  "use strict";
  function earned(progress){return global.BossProgress.bests(progress)[4] !== null;}
  function svg(progress){
    if(!earned(progress))return "";
    var time=global.BossProgress.time(global.BossProgress.bests(progress)[4]);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 540" width="800" height="540" role="img" aria-label="满加强征服者奖状">'
      +'<defs><pattern id="awardPaper" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 4h8" stroke="#c6ab75" stroke-opacity=".08"/></pattern></defs>'
      +'<rect width="800" height="540" fill="#fff4d9"/><rect width="800" height="540" fill="url(#awardPaper)"/>'
      +'<g fill="none" stroke="#a6332e"><rect x="22" y="22" width="756" height="496" stroke-width="5"/><rect x="33" y="33" width="734" height="474"/>'
      +'<path d="M22 68h46V22M732 22v46h46M22 472h46v46M732 518v-46h46" stroke-width="3"/></g>'
      +'<g text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, sans-serif" fill="#623a27">'
      +'<text x="400" y="116" font-size="55" font-weight="900" letter-spacing="20" fill="#a6332e">奖状</text>'
      +'<path d="M226 146h348" stroke="#b48a48"/><text x="400" y="205" font-size="30" font-weight="700">满加强征服者</text>'
      +'<text x="400" y="262" font-size="21">你已击败满加强 BOSS，闯过小镇的终极挑战。</text>'
      +'<text x="400" y="303" font-size="21">谨以此状，纪念你的勇气、耐心和漂亮操作。</text>'
      +'<text x="400" y="364" font-size="17" fill="#8d7151">满加强最快通关</text>'
      +'<text x="400" y="406" font-size="34" font-weight="700">'+time+'</text>'
      +'<text x="400" y="471" font-size="16">S7eventeen 小镇 · 游戏厅  /  大狗嚼 见证</text></g>'
      +'<g transform="translate(660 389) rotate(-12)" fill="none" stroke="#b12e2b" opacity=".86"><circle r="48" stroke-width="3"/><circle r="41"/>'
      +'<path d="M0-28 7-9 27-9 11 4 17 24 0 12-17 24-11 4-27-9-7-9Z" stroke-width="2"/></g></svg>';
  }
  var dialog, content, download, status, current;
  function show(progress){
    var markup=svg(progress);if(!markup)return;
    if(!dialog){
      var style=document.createElement("style");
      style.textContent='#bossAwardDialog{box-sizing:border-box;width:min(900px,94vw);max-height:94dvh;padding:18px;border:1px solid #bd995f;background:#201c22;color:#f9e9ca;overflow:auto}#bossAwardDialog::backdrop{background:#09070de8}#bossAwardDialog svg{display:block;width:100%;height:auto}#bossAwardDialog .award-actions{display:flex;justify-content:center;gap:12px;margin-top:16px}#bossAwardDialog button{padding:10px 18px;border:1px solid #bfa271;background:#362b29;color:#fff0d0;font:14px "Microsoft YaHei",sans-serif;cursor:pointer}#bossAwardDialog p{margin:10px 0 0;text-align:center;font:13px "Microsoft YaHei",sans-serif}';
      document.head.appendChild(style);
      dialog=document.createElement("dialog");dialog.id="bossAwardDialog";dialog.setAttribute("aria-label","满加强通关奖状");
      content=document.createElement("div");dialog.appendChild(content);
      var actions=document.createElement("div");actions.className="award-actions";
      download=document.createElement("button");download.type="button";download.textContent="保存奖状";download.addEventListener("click",save);
      var close=document.createElement("button");close.type="button";close.textContent="收好啦";close.addEventListener("click",function(){dialog.close()});
      actions.appendChild(download);actions.appendChild(close);dialog.appendChild(actions);
      status=document.createElement("p");status.setAttribute("role","status");dialog.appendChild(status);
      dialog.addEventListener("click",function(e){if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
      ["keydown","keyup","mousedown","pointerdown","pointerup","touchstart"].forEach(function(type){dialog.addEventListener(type,function(e){e.stopPropagation()})});
      document.body.appendChild(dialog);
    }
    current=markup;content.innerHTML=markup;status.textContent="";
    if(!dialog.open)dialog.showModal();
  }
  function save(){
    if(download.disabled)return;
    download.disabled=true;status.textContent="正在准备奖状…";
    var source=URL.createObjectURL(new Blob([current],{type:"image/svg+xml;charset=utf-8"})),img=new Image();
    function done(){URL.revokeObjectURL(source);download.disabled=false;}
    img.onerror=function(){done();status.textContent="图片生成失败，请重新试一次。"};
    img.onload=function(){
      try{
        var canvas=document.createElement("canvas");canvas.width=1600;canvas.height=1080;
        canvas.getContext("2d").drawImage(img,0,0,1600,1080);
        canvas.toBlob(function(blob){
          done();if(!blob){status.textContent="图片生成失败，请重新试一次。";return}
          var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="S7eventeen-满加强征服者.png";
          document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1000);
          status.textContent="奖状已准备好，请查看浏览器下载。";
        },"image/png");
      }catch(e){done();status.textContent="图片生成失败，请重新试一次。"}
    };img.src=source;
  }
  global.BossAwards={earned:earned,svg:svg,show:show};
})(window);
