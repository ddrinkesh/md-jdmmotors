(function () {
  function initSwipers() {
    document.querySelectorAll('.swiper[data-slider-options]:not([data-swiper-initialized])').forEach(function (el) {
      try {
        var options = JSON.parse(el.dataset.sliderOptions);
        new Swiper(el, options);
        el.setAttribute('data-swiper-initialized', 'true');
      } catch (e) {
        console.warn('Swiper init error:', e);
      }
    });
  }

  function waitForSwiper(callback, attempts) {
    attempts = attempts || 0;
    if (typeof Swiper !== 'undefined') {
      callback();
    } else if (attempts < 60) {
      setTimeout(function () { waitForSwiper(callback, attempts + 1); }, 100);
    }
  }

  function onReady() {
    waitForSwiper(initSwipers);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  document.addEventListener('shopify:section:load', function () {
    waitForSwiper(initSwipers);
  });
})();
