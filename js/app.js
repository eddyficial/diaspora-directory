// Diaspora Directory — Main JS

(function() {
  'use strict';

  // --- PWA Install Prompt ---
  var deferredPrompt = null;
  var installBanner = document.getElementById('installBanner');
  var installBtn = document.getElementById('installBtn');
  var dismissBtn = document.getElementById('dismissInstall');

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    // Show install banner if not previously dismissed
    if (!sessionStorage.getItem('pwa-dismissed')) {
      installBanner.style.display = 'block';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(result) {
          deferredPrompt = null;
          installBanner.style.display = 'none';
        });
      }
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', function() {
      installBanner.style.display = 'none';
      sessionStorage.setItem('pwa-dismissed', '1');
    });
  }

  // Hide banner if already installed
  window.addEventListener('appinstalled', function() {
    installBanner.style.display = 'none';
    deferredPrompt = null;
  });

  // --- Share Button ---
  var shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      var shareData = {
        title: 'Diaspora Directory',
        text: 'Find trusted Kenyan service providers from anywhere in the diaspora. Install the app!',
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(function() {});
      } else {
        // Fallback: copy link to clipboard
        navigator.clipboard.writeText(window.location.href).then(function() {
          var orig = shareBtn.innerHTML;
          shareBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
          shareBtn.style.borderColor = '#16a34a';
          shareBtn.style.color = '#16a34a';
          setTimeout(function() {
            shareBtn.innerHTML = orig;
            shareBtn.style.borderColor = '';
            shareBtn.style.color = '';
          }, 2000);
        });
      }
    });
  }

  // --- Draggable WhatsApp Button ---
  var waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    var isDragging = false;
    var wasMoved = false;
    var startX, startY, startLeft, startBottom;

    waFloat.addEventListener('touchstart', function(e) {
      isDragging = true;
      wasMoved = false;
      var touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      var rect = waFloat.getBoundingClientRect();
      startLeft = rect.left;
      startBottom = window.innerHeight - rect.bottom;
      waFloat.style.transition = 'none';
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      var touch = e.touches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) wasMoved = true;
      var newLeft = startLeft + dx;
      var newBottom = startBottom - dy;
      // Keep within viewport
      var size = waFloat.offsetWidth;
      newLeft = Math.max(8, Math.min(window.innerWidth - size - 8, newLeft));
      newBottom = Math.max(8, Math.min(window.innerHeight - size - 8, newBottom));
      waFloat.style.right = 'auto';
      waFloat.style.left = newLeft + 'px';
      waFloat.style.bottom = newBottom + 'px';
    }, { passive: true });

    document.addEventListener('touchend', function() {
      if (!isDragging) return;
      isDragging = false;
      waFloat.style.transition = '';
      // Snap to nearest horizontal edge
      var rect = waFloat.getBoundingClientRect();
      var midX = rect.left + rect.width / 2;
      waFloat.style.left = 'auto';
      if (midX < window.innerWidth / 2) {
        waFloat.style.right = 'auto';
        waFloat.style.left = '16px';
      } else {
        waFloat.style.left = 'auto';
        waFloat.style.right = '16px';
      }
    });

    // Prevent click (open link) if it was a drag
    waFloat.addEventListener('click', function(e) {
      if (wasMoved) {
        e.preventDefault();
        wasMoved = false;
      }
    });
  }

  // --- Navbar scroll effect ---
  var navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Mobile nav toggle ---
  var navToggle = document.getElementById('navToggle');
  var mobileDrawer = document.getElementById('mobileDrawer');

  if (navToggle && mobileDrawer) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
      document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
    });

    mobileDrawer.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll animations (fade-up) ---
  function initAnimations() {
    var targets = document.querySelectorAll(
      '.cat-card, .step-card, .provider-card, .cta-card, .section-header, .trust-item, .blog-card, .invest-card, .mini-cat, .faq-item'
    );
    targets.forEach(function(el) {
      el.classList.add('fade-up');
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function(el) { observer.observe(el); });
  }

  if ('IntersectionObserver' in window) {
    initAnimations();
  } else {
    document.querySelectorAll('.fade-up').forEach(function(el) {
      el.classList.add('visible');
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      try {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = navbar ? navbar.offsetHeight : 0;
          var top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      } catch(err) {}
    });
  });

  // --- Search bar interaction ---
  var searchBtn = document.querySelector('.btn-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      var input = document.querySelector('.search-input');
      if (input && input.value.trim()) {
        // Redirect to the actual directory with search
        window.open('https://thediasporadirectory.com/customer', '_blank');
      } else if (input) {
        input.focus();
        input.setAttribute('placeholder', 'Type a service...');
      }
    });
  }
})();
