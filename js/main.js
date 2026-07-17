// Hafeez Photo — main JS file

function closeDropdown(dropdown) {
  dropdown.classList.remove('is-open');
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-dropdown.is-open').forEach(closeDropdown);
}

document.querySelectorAll('.nav-dropdown-toggle').forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const dropdown = toggle.closest('.nav-dropdown');
    const isOpen = dropdown.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('.nav-dropdown.is-open').forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      closeDropdown(dropdown);
    }
  });
});

// Mobile hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const mainNavActions = document.querySelector('.main-nav__actions');

if (hamburger && navLinks) {
  // Clone the Contact button into the mobile menu so it stays reachable at
  // the bottom of the stacked links, without duplicating markup per page.
  const contactButton = mainNavActions ? mainNavActions.querySelector('.btn-contact') : null;
  if (contactButton) {
    const mobileContactItem = document.createElement('li');
    mobileContactItem.className = 'mobile-nav-contact';
    mobileContactItem.appendChild(contactButton.cloneNode(true));
    navLinks.appendChild(mobileContactItem);
  }

  hamburger.setAttribute('aria-expanded', 'false');

  function openMobileMenu() {
    document.body.classList.add('menu-open');
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
  }

  function closeMobileMenu() {
    document.body.classList.remove('menu-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    closeAllDropdowns();
  }

  hamburger.addEventListener('click', () => {
    if (document.body.classList.contains('menu-open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('menu-open')) return;
    const clickedInsideMenu = navLinks.contains(event.target);
    const clickedHamburger = hamburger.contains(event.target);
    if (!clickedInsideMenu && !clickedHamburger) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && document.body.classList.contains('menu-open')) {
      closeMobileMenu();
    }
  });
}

// Background video placeholders — keep the fallback icon visible until the
// video is actually playing, and if it fails to load, leave the icon showing.
document.querySelectorAll('.headshot-feature-visual video').forEach((video) => {
  const icon = video.parentElement.querySelector('.headshot-feature-icon');

  video.addEventListener('error', () => {
    video.style.display = 'none';
  });

  video.addEventListener('playing', () => {
    if (icon) icon.style.display = 'none';
  });
});

// Keep .main-nav's sticky offset locked to the top-bar's real rendered
// height — the top-bar wraps to multiple lines at narrower widths, so a
// hardcoded offset would leave a gap or overlap depending on viewport size.
const topBar = document.querySelector('.top-bar');

if (topBar) {
  function updateTopBarHeight() {
    document.documentElement.style.setProperty('--topbar-height', `${topBar.offsetHeight}px`);
  }

  updateTopBarHeight();
  window.addEventListener('resize', updateTopBarHeight);
  window.addEventListener('load', updateTopBarHeight);
}

// Sticky nav shadow — only shown once the page has scrolled past the top,
// so the sticky nav reads as separated from the content beneath it.
const mainNav = document.querySelector('.main-nav');

if (mainNav) {
  const SCROLL_SHADOW_THRESHOLD = 10;

  function updateNavScrolledState() {
    mainNav.classList.toggle('scrolled', window.scrollY > SCROLL_SHADOW_THRESHOLD);
  }

  window.addEventListener('scroll', updateNavScrolledState, { passive: true });
  updateNavScrolledState();
}

// Photo gallery lightbox — wired up on all four gallery pages: private-events,
// headshots, conferences, and expos. Gated behind these body classes so any
// future non-gallery page's markup is left untouched.
const lightboxEnabledPages = ['private-events-page', 'headshots-page', 'conferences-page', 'expos-page'];
if (lightboxEnabledPages.some((cls) => document.body.classList.contains(cls))) {
  const galleryCells = Array.from(document.querySelectorAll('.photo-gallery .gallery-cell'));

  if (galleryCells.length) {
    const slides = galleryCells.map((cell) => {
      const img = cell.querySelector('img.placeholder-photo');
      return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
    });

    let currentIndex = 0;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <button type="button" class="lightbox-prev" aria-label="Previous image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <button type="button" class="lightbox-next" aria-label="Next image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
      <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="">
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      const slide = slides[currentIndex];
      lightboxImage.src = slide.src;
      lightboxImage.alt = slide.alt;
    }

    function openLightbox(index) {
      showSlide(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
    }

    function showPrev() {
      showSlide(currentIndex - 1);
    }

    function showNext() {
      showSlide(currentIndex + 1);
    }

    galleryCells.forEach((cell, index) => {
      cell.addEventListener('click', () => openLightbox(index));
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    // Click on the dimmed backdrop (not the image or the buttons) closes it.
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showPrev();
      if (event.key === 'ArrowRight') showNext();
    });

    // Touch swipe support for mobile, in addition to the tap-target arrows.
    let touchStartX = 0;
    const SWIPE_THRESHOLD = 50;

    lightbox.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta < 0) {
          showNext();
        } else {
          showPrev();
        }
      }
    }, { passive: true });
  }
}
