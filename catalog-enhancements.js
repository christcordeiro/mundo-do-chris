(function(){
  'use strict';
  var EDIT_LINK_ID='wiki-edit-external-url';
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];});}
  function safeUrl(v){v=String(v||'').trim();if(!v)return '';try{var u=new URL(v,location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch(e){return '';}}
  function openLink(node){var u=safeUrl(node&&node.externalUrl);if(!u)return;var w=window.open(u,'_blank','noopener,noreferrer');if(w)w.opener=null;}
  function firstImg(card){if(!card)return null;return card.querySelector('img');}
  function ensureThumb(card,node){
    if(!card||!node)return;
    var img=firstImg(card),src=(node.img||'').trim();
    if(img){
      if(src&&!img.getAttribute('src'))img.src=src;
      if(src&&img.src!==src&&(!img.complete||img.naturalWidth===0))img.src=src;
      img.onerror=function(){this.onerror=null;if(src&&this.src!==src)this.src=src;};
      return;
    }
    if(!src)return;
    var target=card.querySelector('.cat-card-img,.item-img,.thumb,.thumbnail,.cover,.poster')||card;
    var el=document.createElement('img');
    el.src=src;
    el.alt=node.nome||'';
    el.loading='lazy';
    el.style.width='100%';el.style.height='100%';el.style.objectFit='cover';el.style.display='block';
    if(target===card)card.insertBefore(el,card.firstChild);else target.appendChild(el);
  }
  function patchRenderedLinks(){
    var grid=document.getElementById('cats-grid');
    if(grid){[].forEach.call(grid.children,function(card,i){var n=cats[i];if(!n)return;ensureThumb(card,n);if(!n.externalUrl)return;var b=card.querySelector('.wiki-node-badge'),m=card.querySelector('.cat-card-count');if(b)b.textContent='LINK';if(m)m.textContent='Abrir link';card.onclick=function(e){e.preventDefault();openLink(n);};});}
    if(curCat){var roots=subs.filter(function(s){return s.catId===curCat.id&&!s.parentId}),list=document.getElementById('subcats-list');if(list){[].forEach.call(list.children,function(row,i){var n=roots[i];if(!n)return;ensureThumb(row,n);if(!n.externalUrl)return;var b=row.querySelector('.wiki-node-badge'),m=row.querySelector('.item-count');if(b)b.textContent='LINK';if(m)m.textContent='Abrir link';row.onclick=function(e){e.preventDefault();openLink(n);};});}}
    if(curSub){var nodes=subs.filter(function(s){return (s.parentId||null)===curSub.id}),list2=document.getElementById('temas-list');if(list2){[].forEach.call(list2.children,function(row,i){var n=nodes[i];if(!n)return;ensureThumb(row,n);if(!n.externalUrl)return;var b=row.querySelector('.wiki-node-badge'),m=row.querySelector('.item-count');if(b)b.textContent='LINK';if(m)m.textContent='Abrir link';row.onclick=function(e){e.preventDefault();openLink(n);};});}}
  }
  function wrapRender(name){var old=window[name];if(typeof old!=='function')return;window[name]=function(){var r=old.apply(this,arguments);setTimeout(patchRenderedLinks,0);return r;};}
  function ensureCreateFields(){
    var types=document.querySelector('.wiki-node-type');if(!types||document.querySelector('input[name="wiki-node-type"][value="link"]'))return;
    var lab=document.createElement('label');lab.innerHTML='<input type="radio" name="wiki-node-type" value="link" onchange="wikiAlternarTipo()"> 🔗 Link externo';types.appendChild(lab);
    var img=document.getElementById('wiki-node-img');if(img){var label=document.createElement('label');label.className='f-label wiki-link-field';label.textContent='Link externo (opcional)';var input=document.createElement('input');input.className='f-input wiki-link-field';input.id='wiki-node-link';input.placeholder='https://...';img.insertAdjacentElement('afterend',input);input.insertAdjacentElement('beforebegin',label);}
  }
  var oldAlt=window.wikiAlternarTipo;
  window.wikiAlternarTipo=function(){if(typeof oldAlt==='function')oldAlt();ensureCreateFields();var t=(document.querySelector('input[name="wiki-node-type"]:checked')||{}).value;var f=document.getElementById('wiki-article-fields');if(f)f.classList.toggle('visible',t==='artigo');var li=document.getElementById('wiki-node-link');if(li&&li.previousElementSibling){li.previousElementSibling.style.display=t==='link'?'':'none';li.style.display=t==='link'?'':'none';}}
  var oldSave=window.wikiSalvarNo;
  window.wikiSalvarNo=function(){
    ensureCreateFields();var t=(document.querySelector('input[name="wiki-node-type"]:checked')||{}).value||'categoria';
    if(t!=='link')return oldSave.apply(this,arguments);
    var parent=(document.getElementById('wiki-node-parent')||{}).value||'root',nome=(document.getElementById('wiki-node-name').value||'').trim(),desc=(document.getElementById('wiki-node-desc').value||'').trim(),img=(document.getElementById('wiki-node-img').value||'').trim()||null,url=safeUrl((document.getElementById('wiki-node-link')||{}).value||'');
    if(!nome){alert('Digite o nome.');return;}if(!url){alert('Digite um link externo válido começando com http:// ou https://.');return;}
    var node;if(parent==='root'){node={id:uid(),nome:nome,desc:desc,emoji:'🔗',img:img,articleId:null,externalUrl:url,itemType:'link'};cats.push(node);}else{var a=parent.split(':'),parentId=null,catId=null;if(a[0]==='cat')catId=parseInt(a[1]);else{parentId=parseInt(a[1]);var ps=subs.find(function(s){return s.id===parentId});if(ps){catId=ps.catId;var guard={};while(ps&&ps.parentId&&!guard[ps.id]){guard[ps.id]=1;ps=subs.find(function(x){return x.id===ps.parentId});if(ps&&ps.catId)catId=ps.catId;}}}if(!catId){alert('A categoria pai não foi encontrada.');return;}node={id:uid(),catId:catId,parentId:parentId,nome:nome,desc:desc,img:img,articleId:null,externalUrl:url,itemType:'link'};subs.push(node);}
    ['wiki-node-name','wiki-node-desc','wiki-node-img','wiki-node-link'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});if(typeof renderHome==='function')renderHome();if(curSub&&typeof renderSub==='function')renderSub();else if(curCat&&typeof renderCat==='function')renderCat();if(typeof renderGer==='function')renderGer();patchRenderedLinks();var ok=document.getElementById('wiki-node-ok');if(ok){ok.classList.add('show');setTimeout(function(){ok.classList.remove('show');},2500);}
  };
  function addEditLink(node,button){var host=document.getElementById('edit-body')||document.querySelector('#edit-overlay .edit-body')||document.querySelector('#edit-overlay .adm-modal-body');if(!host||document.getElementById(EDIT_LINK_ID))return;var lbl=document.createElement('label');lbl.className='f-label';lbl.textContent='Link externo (opcional)';var inp=document.createElement('input');inp.className='f-input';inp.id=EDIT_LINK_ID;inp.placeholder='https://...';inp.value=node.externalUrl||'';if(button){host.insertBefore(lbl,button);host.insertBefore(inp,button);}else{host.appendChild(lbl);host.appendChild(inp);}}
  var oldEditCat=window.editarCat;window.editarCat=function(id){oldEditCat(id);setTimeout(function(){var n=cats.find(function(x){return x.id===id});var btn=document.querySelector('#edit-overlay .btn-primary');if(n)addEditLink(n,btn);},0);};
  var oldSaveCat=window.salvarEditCat;window.salvarEditCat=function(id){var n=cats.find(function(x){return x.id===id}),el=document.getElementById(EDIT_LINK_ID);if(n&&el){var raw=el.value.trim();n.externalUrl=raw?safeUrl(raw):'';n.itemType=n.externalUrl?'link':(n.itemType==='link'?null:n.itemType);if(raw&&!n.externalUrl){alert('O link externo precisa começar com http:// ou https://.');return;}}var r=oldSaveCat(id);setTimeout(patchRenderedLinks,0);return r;};
  var oldEditSub=window.editarSub;window.editarSub=function(id){oldEditSub(id);setTimeout(function(){var n=subs.find(function(x){return x.id===id});var btn=document.querySelector('#edit-overlay .btn-primary');if(n)addEditLink(n,btn);},0);};
  var oldSaveSub=window.salvarEditSub;window.salvarEditSub=function(id){var n=subs.find(function(x){return x.id===id}),el=document.getElementById(EDIT_LINK_ID);if(n&&el){var raw=el.value.trim();n.externalUrl=raw?safeUrl(raw):'';n.itemType=n.externalUrl?'link':(n.itemType==='link'?null:n.itemType);if(raw&&!n.externalUrl){alert('O link externo precisa começar com http:// ou https://.');return;}}var r=oldSaveSub(id);setTimeout(patchRenderedLinks,0);return r;};
  wrapRender('renderHome');wrapRender('renderCat');wrapRender('renderSub');
  var oldOpen=window.openAdm;if(typeof oldOpen==='function')window.openAdm=function(){var r=oldOpen.apply(this,arguments);setTimeout(function(){ensureCreateFields();wikiAlternarTipo();},0);return r;};
  document.addEventListener('DOMContentLoaded',function(){ensureCreateFields();wikiAlternarTipo();setTimeout(patchRenderedLinks,0);});
  if(document.readyState!=='loading'){ensureCreateFields();wikiAlternarTipo();setTimeout(patchRenderedLinks,0);}
})();