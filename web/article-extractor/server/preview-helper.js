(function(){
  // Preview helper: add hover and selected IDs to elements (preserve original ids), communicate via postMessage

  // ID constants
  const HOVER_ID = '__fw_hover__';
  const SELECTED_ID = '__fw_SELECTED__';

  // store original id values to restore later
  const originalIdMap = new WeakMap();

  let hoverEl = null;
  let selectedEl = null;

  // inject CSS for hover and selected states
  (function injectStyles(){
    try{
      const css = `#${HOVER_ID} { outline: 2px solid rgba(255,106,0,0.95) !important; background: rgba(255,106,0,0.08) !important; }
#${SELECTED_ID} { outline: 2px solid rgba(255,106,0,1) !important; background: rgba(255,106,0,0.18) !important; }`;
      const s = document.createElement('style');
      s.setAttribute('data-fw-helper','true');
      s.appendChild(document.createTextNode(css));
      (document.head || document.documentElement).appendChild(s);
    }catch(e){/* ignore */}
  })();

  function setElementId(el, id){
    if(!el) return;
    try{
      // preserve original id if not already preserved
      if(!originalIdMap.has(el)) originalIdMap.set(el, el.id || null);
      el.id = id;
    }catch(e){/* ignore */}
  }

  function restoreOriginalId(el){
    if(!el) return;
    try{
      const orig = originalIdMap.get(el);
      if(orig) el.id = orig;
      else el.removeAttribute('id');
      originalIdMap.delete(el);
    }catch(e){/* ignore */}
  }

  function clearHover(){
    if(hoverEl && hoverEl !== selectedEl){
      restoreOriginalId(hoverEl);
    }
    hoverEl = null;
  }

  function setHover(el){
    if(el === hoverEl) return;
    // if hovering over selected element, do nothing (selected has higher priority)
    if(el === selectedEl) return;
    clearHover();
    if(el){
      setElementId(el, HOVER_ID);
      hoverEl = el;
    }
  }

  function clearSelected(){
    if(selectedEl){
      restoreOriginalId(selectedEl);
      selectedEl = null;
    }
  }

  function setSelected(el){
    if(selectedEl && selectedEl !== el){
      // restore old selected
      restoreOriginalId(selectedEl);
    }
    selectedEl = el;
    if(el){
      // if this element currently has hover id stored, remove hover (we'll set selected id)
      if(hoverEl === el) hoverEl = null;
      setElementId(el, SELECTED_ID);
    }
  }

  // mouse handlers
  window.addEventListener('mouseover', e => {
    try{
      const el = e.target;
      setHover(el);
      const sel = getSelectorSafe(el);
      const rect = el.getBoundingClientRect && el.getBoundingClientRect();
      window.parent.postMessage({ type: 'preview-hover', selector: sel, rect }, '*');
    }catch(err){ }
  }, true);

  window.addEventListener('mouseout', e => {
    try{
      // on mouseout, clear hover if moving outside element tree
      const toEl = e.relatedTarget;
      // if relatedTarget is inside current hoverEl, keep it
      if(hoverEl && toEl && hoverEl.contains && hoverEl.contains(toEl)) return;
      clearHover();
      window.parent.postMessage({ type: 'preview-hover', selector: '', rect: null }, '*');
    }catch(err){ }
  }, true);

  window.addEventListener('click', e => {
    try{
      e.preventDefault();
      e.stopPropagation();
      const el = e.target;
      setSelected(el);
      const sel = getSelectorSafe(el);
      window.parent.postMessage({ type: 'preview-select', selector: sel }, '*');
    }catch(err){ }
  }, true);

  function getSelectorSafe(el){
    try{
      if(!el) return '';
      // build a simple path selector (same logic as before)
      const parts=[];
      let node = el;
      while(node && node.nodeType === 1 && node.tagName.toLowerCase() !== 'html'){
        let part = node.tagName.toLowerCase();
        if(node.id){ part += '#'+node.id; parts.unshift(part); break; }
        const cls = (node.className||'').toString().trim().split(/\s+/).filter(Boolean)[0];
        if(cls) part += '.'+cls;
        const parent = node.parentNode;
        if(parent){
          const siblings = Array.from(parent.children).filter(c=>c.tagName===node.tagName);
          if(siblings.length>1){
            const idx = Array.from(parent.children).indexOf(node)+1;
            part += ':nth-child(' + idx + ')';
          }
        }
        parts.unshift(part);
        node = node.parentNode;
      }
      return parts.join(' > ');
    }catch(e){ return ''; }
  }

  // handle messages from parent
  window.addEventListener('message', ev => {
    (async ()=>{
      try{
        const msg = ev.data;
        if(!msg || !msg.type) return;
        if(msg.type === 'getInnerHtml'){
          // return innerHTML of selectedEl
          let html = '';
          if(selectedEl) html = selectedEl.innerHTML;
          window.parent.postMessage({ type: 'response', action: 'getInnerHtml', selector: getSelectorSafe(selectedEl), html }, '*');
        } else if(msg.type === 'delete'){
          // delete selected element
          if(selectedEl && selectedEl.parentNode){
            selectedEl.parentNode.removeChild(selectedEl);
            // clear references and restore ids
            clearSelected();
            clearHover();
            window.parent.postMessage({ type: 'response', action: 'delete', selector: msg.selector, status: 'ok' }, '*');
          } else {
            window.parent.postMessage({ type: 'response', action: 'delete', selector: msg.selector, status: 'no-selection' }, '*');
          }
        }
      }catch(err){
        window.parent.postMessage({ type: 'response', action: (ev.data && ev.data.type) || 'unknown', error: err.message }, '*');
      }
    })();
  });

})();
