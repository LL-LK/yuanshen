(function(){
  if(!window.katex){ return; }
  function render(el, tex){
    try { katex.render(tex, el, { trust: true, strict: 'ignore', throwOnError: false }); }
    catch(e){ el.textContent = tex; }
  }
  function toTex(raw){
    if(!raw){ return ''; }
    var t = raw.replace(/×/g, '\\cdot').replace(/÷/g, '\\div');
    t = t.replace(/≤/g, '\\le').replace(/≥/g, '\\ge').replace(/≠/g, '\\ne');
    t = t.replace(/≈/g, '\\approx').replace(/∈/g, '\\in').replace(/∉/g, '\\notin');
    t = t.replace(/⊆/g, '\\subseteq').replace(/⊇/g, '\\supseteq').replace(/∪/g, '\\cup');
    t = t.replace(/∩/g, '\\cap').replace(/∞/g, '\\infty').replace(/∅/g, '\\varnothing');
    t = t.replace(/⟨/g, '\\langle').replace(/⟩/g, '\\rangle').replace(/·/g, '\\cdot');
    t = t.replace(/′/g, "'").replace(/″/g, "''");
    var SUP = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'};
    var SUB = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','₋':'-'};
    var sups = Object.keys(SUP).sort(function(a,b){return b.length-a.length;}).join('');
    var subs = Object.keys(SUB).sort(function(a,b){return b.length-a.length;}).join('');
    if(sups){ t = t.replace(new RegExp('['+sups+']+', 'g'), function(m){
      var s=''; for(var i=0;i<m.length;i++) s+=SUP[m[i]]; return '^{'+s+'}'; }); }
    if(subs){ t = t.replace(new RegExp('['+subs+']+', 'g'), function(m){
      var s=''; for(var i=0;i<m.length;i++) s+=SUB[m[i]]; return '_{'+s+'}'; }); }
    t = t.replace(/<sup>([^<]*)<\/sup>/g, '^{$1}').replace(/<sub>([^<]*)<\/sub>/g, '_{$1}');
    t = t.replace(/<\/?[^>]+>/g, '').replace(/&lt;/g, '\\lt').replace(/&gt;/g, '\\gt').replace(/&amp;/g, '&');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
  }
  function renderFormulas(){
    var boxes = document.querySelectorAll('.formula-box');
    for(var b=0;b<boxes.length;b++){
      var code = boxes[b].querySelector('code.font-mono');
      if(!code || code.dataset.katexRendered){ continue; }
      code.dataset.katexRendered = '1';
      var raw = code.textContent || '';
      var lines = raw.split('\n');
      var out = [];
      for(var i=0;i<lines.length;i++){
        var line = lines[i].trim();
        if(!line){ out.push(''); continue; }
        var tex = toTex(line);
        if(!tex){ out.push(line); continue; }
        var span = document.createElement('span');
        render(span, tex);
        out.push(span.outerHTML);
      }
      code.innerHTML = out.join('\n');
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', renderFormulas);
  } else { renderFormulas(); }
})();
