(function () {
  'use strict';

  var BANNER_ID        = 'architecture-banner';
  var CONTAINER_ID     = 'architecture-lottie';
  var FALLBACK_ID      = 'architecture-fallback';
  var JSON_PATH        = 'assets/medallion.json';
  var ARCH_FILTER      = '.filter-architecture';

  var animInstance = null;
  var initialized  = false;

  /* ---- fallback: hide Lottie div, show <img> ---- */
  function showFallback() {
    var container = document.getElementById(CONTAINER_ID);
    var fallback  = document.getElementById(FALLBACK_ID);
    if (container) container.style.display = 'none';
    if (fallback)  fallback.style.display  = 'block';
  }

  /* ---- init Lottie only once ---- */
  function initLottie() {
    if (initialized) return;
    initialized = true;

    if (typeof lottie === 'undefined') {
      showFallback();
      return;
    }

    try {
      animInstance = lottie.loadAnimation({
        container : document.getElementById(CONTAINER_ID),
        renderer  : 'svg',
        loop      : true,
        autoplay  : true,
        path      : JSON_PATH
      });

      animInstance.addEventListener('data_failed', showFallback);
      animInstance.addEventListener('error',       showFallback);
    } catch (e) {
      showFallback();
    }
  }

  /* ---- show / hide banner ---- */
  function showBanner() {
    var banner = document.getElementById(BANNER_ID);
    if (!banner) return;
    banner.style.display = 'block';
    banner.setAttribute('aria-hidden', 'false');
    initLottie();
    if (animInstance) animInstance.play();
  }

  function hideBanner() {
    var banner = document.getElementById(BANNER_ID);
    if (!banner) return;
    banner.style.display = 'none';
    banner.setAttribute('aria-hidden', 'true');
    if (animInstance) animInstance.pause();
  }

  /* ---- listen to portfolio filter clicks ---- */
  document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
      var filterBtn = e.target.closest('#portfolio-flters li');
      if (!filterBtn) return;

      var filter = filterBtn.getAttribute('data-filter');
      if (filter === ARCH_FILTER) {
        showBanner();
      } else {
        hideBanner();
      }
    });
  });
})();
