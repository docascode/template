(()=>{(function(){importScripts("lunr.min.js");var a,s=null,t={};lunr.tokenizer.separator=/[\s\-\.\(\)]+/;var n=new XMLHttpRequest;n.open("GET","../search-stopwords.json"),n.onload=function(){this.status==200&&(s=JSON.parse(this.responseText),u())},n.send();var i=new XMLHttpRequest;i.open("GET","../index.json"),i.onload=function(){this.status==200&&(t=JSON.parse(this.responseText),u(),postMessage({e:"index-ready"}))},i.send(),onmessage=function(e){var r=e.data.q,p=a.search(r),d=[];p.forEach(function(f){var o=t[f.ref];d.push({href:o.href,title:o.title,keywords:o.keywords})}),postMessage({e:"query-ready",q:r,d})};function u(){s!==null&&!l(t)&&(a=lunr(function(){this.pipeline.remove(lunr.stopWordFilter),this.ref("href"),this.field("title",{boost:50}),this.field("keywords",{boost:20});for(var e in t)t.hasOwnProperty(e)&&this.add(t[e]);var r=lunr.generateStopWordFilter(s);lunr.Pipeline.registerFunction(r,"docfxStopWordFilter"),this.pipeline.add(r),this.searchPipeline.add(r)}))}function l(e){if(!e)return!0;for(var r in e)if(e.hasOwnProperty(r))return!1;return!0}})();})();
