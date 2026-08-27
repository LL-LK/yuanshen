/* Keyboard shortcuts for power users */
(function(){
  'use strict';
  var shortcuts = {
    't': function() {
      var btt = document.getElementById('back-to-top');
      if (btt) btt.click();
    },
    'm': function() {
      var btn = document.getElementById('mobile-menu-toggle');
      if (btn && window.innerWidth < 1024) btn.click();
    }
  };
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    var key = e.key.toLowerCase();
    if (shortcuts[key]) {
      e.preventDefault();
      shortcuts[key]();
    }
  });
})();
