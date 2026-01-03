;(function() {
  function load(src, onload, onerror) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = onload;
    s.onerror = onerror;
    document.head.appendChild(s);
  }
  function ensureBody(cb) {
    if (document.body) cb();
    else document.addEventListener('DOMContentLoaded', cb);
  }
  function initV() {
    try {
      if (typeof VConsole !== 'undefined') {
        window.vConsoleInstance = new VConsole();
        return true;
      }
    } catch (e) {}
    return false;
  }
  function fallbackOverlay() {
    ensureBody(function() {
      var btn = document.createElement('div');
      btn.style.cssText = 'position:fixed;bottom:10px;right:10px;background:#4CAF50;color:#fff;padding:8px 12px;z-index:2147483647;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,.2);font-size:12px;';
      btn.textContent = 'Log';
      document.body.appendChild(btn);
      var panel = document.createElement('div');
      panel.style.cssText = 'position:fixed;bottom:50px;right:10px;width:80%;max-height:50%;overflow:auto;background:#111;color:#0f0;padding:10px;z-index:2147483647;border:1px solid #0f0;border-radius:6px;display:none;font-size:12px;line-height:1.4;';
      document.body.appendChild(panel);
      btn.onclick = function() {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      };
      var origLog = console.log;
      console.log = function() {
        try {
          var msg = Array.prototype.slice.call(arguments).map(function(a) {
            try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch (e) { return '[object]'; }
          }).join(' ');
          var item = document.createElement('div');
          item.textContent = msg;
          panel.appendChild(item);
        } catch (e) {}
        try { origLog.apply(console, arguments); } catch (e) {}
      };
      console.log('[FallbackConsole] enabled');
    });
  }
  function start() {
    if (initV()) return;
    load('https://lib.baomitu.com/vConsole/3.15.1/vconsole.min.js', function() {
      if (!initV()) fallbackOverlay();
    }, function() {
      load('https://unpkg.com/vconsole@3.15.1/dist/vconsole.min.js', function() {
        if (!initV()) fallbackOverlay();
      }, function() {
        fallbackOverlay();
      });
    });
  }
  start();
})(); 
