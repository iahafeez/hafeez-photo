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

// Custom select dropdowns (e.g. the contact form's Event Type field) — built
// from scratch so the open state can be styled to match the site, while a
// hidden input still carries the value Netlify Forms detects and submits.
document.querySelectorAll('.custom-select').forEach((customSelect) => {
  const trigger = customSelect.querySelector('.custom-select-trigger');
  const valueEl = customSelect.querySelector('.custom-select-value');
  const listbox = customSelect.querySelector('.custom-select-options');
  const hiddenInput = customSelect.querySelector('input[type="hidden"]');
  const options = Array.from(customSelect.querySelectorAll('[role="option"]'));

  let highlightedIndex = -1;

  function isOpen() {
    return !listbox.hidden;
  }

  function highlightOption(index) {
    options.forEach((opt) => opt.classList.remove('is-highlighted'));
    highlightedIndex = index;
    if (index >= 0 && index < options.length) {
      options[index].classList.add('is-highlighted');
      options[index].scrollIntoView({ block: 'nearest' });
    }
  }

  function openListbox() {
    listbox.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('is-open');
    const selectedIndex = options.findIndex((opt) => opt.getAttribute('aria-selected') === 'true');
    highlightOption(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function closeListbox() {
    listbox.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('is-open');
    highlightOption(-1);
  }

  function selectOption(option) {
    options.forEach((opt) => opt.setAttribute('aria-selected', 'false'));
    option.setAttribute('aria-selected', 'true');
    valueEl.textContent = option.textContent;
    valueEl.classList.remove('is-placeholder');
    hiddenInput.value = option.getAttribute('data-value');
    trigger.classList.remove('is-invalid');
    trigger.removeAttribute('aria-invalid');

    const errorEl = customSelect.closest('.form-group').querySelector('.field-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
  }

  trigger.addEventListener('click', () => {
    if (isOpen()) {
      closeListbox();
    } else {
      openListbox();
    }
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen()) {
        openListbox();
      } else {
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        highlightOption((highlightedIndex + delta + options.length) % options.length);
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen()) {
        if (highlightedIndex >= 0) {
          selectOption(options[highlightedIndex]);
        }
        closeListbox();
      } else {
        openListbox();
      }
    } else if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      closeListbox();
    }
  });

  options.forEach((option, index) => {
    option.addEventListener('click', () => {
      selectOption(option);
      closeListbox();
      trigger.focus();
    });

    option.addEventListener('mouseenter', () => {
      highlightOption(index);
    });
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !customSelect.contains(event.target)) {
      closeListbox();
    }
  });
});

// Custom validation for the contact form. The form carries novalidate so the
// browser's stop-at-the-first-invalid-field behavior is fully replaced: every
// required field is checked at once, and each empty one gets its own inline
// message rather than a single native validation bubble.
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const REQUIRED_FIELD_ERROR = 'This field is required.';

  // One entry per .form-group that has a required field — the Event Type
  // group is a custom-select (value lives on a hidden input, error styling
  // applies to the visible trigger button), every other group is a plain
  // input/textarea acting as its own value holder and error target.
  function getFieldConfigs() {
    const configs = [];

    contactForm.querySelectorAll('.form-group').forEach((group) => {
      const errorEl = group.querySelector('.field-error');
      if (!errorEl) return;

      const customSelect = group.querySelector('.custom-select');
      if (customSelect) {
        const hiddenInput = customSelect.querySelector('input[type="hidden"]');
        if (!hiddenInput || !hiddenInput.required) return;
        configs.push({
          errorEl,
          invalidTarget: customSelect.querySelector('.custom-select-trigger'),
          isEmpty: () => !hiddenInput.value,
        });
        return;
      }

      const field = group.querySelector('input[required], textarea[required]');
      if (!field) return;
      configs.push({
        errorEl,
        invalidTarget: field,
        isEmpty: () => !field.value.trim(),
      });
    });

    return configs;
  }

  function showFieldError(config) {
    config.errorEl.textContent = REQUIRED_FIELD_ERROR;
    config.errorEl.classList.add('is-visible');
    config.invalidTarget.classList.add('is-invalid');
  }

  function clearFieldError(config) {
    config.errorEl.textContent = '';
    config.errorEl.classList.remove('is-visible');
    config.invalidTarget.classList.remove('is-invalid');
  }

  contactForm.addEventListener('submit', (event) => {
    let firstInvalidTarget = null;

    getFieldConfigs().forEach((config) => {
      if (config.isEmpty()) {
        showFieldError(config);
        if (!firstInvalidTarget) firstInvalidTarget = config.invalidTarget;
      } else {
        clearFieldError(config);
      }
    });

    if (firstInvalidTarget) {
      event.preventDefault();
      firstInvalidTarget.focus();
    }
  });

  // Clear a field's error as soon as the visitor fixes it, instead of making
  // them wait for the next submit attempt to see it disappear.
  contactForm.querySelectorAll('input[required], textarea[required]').forEach((field) => {
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      const errorEl = group ? group.querySelector('.field-error') : null;
      if (errorEl && field.value.trim()) {
        errorEl.textContent = '';
        errorEl.classList.remove('is-visible');
        field.classList.remove('is-invalid');
      }
    });
  });
}
