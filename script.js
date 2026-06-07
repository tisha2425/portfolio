/* ============================================================
   PORTFOLIO — script.js
   Premium portfolio interactivity & animations
   Author: Tisha Agrawal  |  2026
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ----------------------------------------------------------
     0. GLOBAL HELPERS
  ---------------------------------------------------------- */

  /** Shorthand selectors */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Clamp a value between min and max */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /** Ease-out cubic curve */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /** Navbar height used for scroll offset */
  const NAV_OFFSET = 80;

  /* ----------------------------------------------------------
     1. NAVBAR SCROLL BEHAVIOR
  ---------------------------------------------------------- */

  const navbar = $('.navbar');

  if (navbar) {
    /* — 1a. Shrink / shadow on scroll — */
    const handleNavbarScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll(); // run once on load

    /* — 1b. Mobile menu toggle — */
    const navToggle = $('.nav-toggle');
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        navbar.classList.toggle('mobile-open');
      });
    }

    /* — 1c. Close mobile menu on nav-link click — */
    $$('.navbar a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        navbar.classList.remove('mobile-open');
      });
    });
  }

  /* ----------------------------------------------------------
     2. SMOOTH SCROLL FOR ANCHOR LINKS
  ---------------------------------------------------------- */

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = $(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const top =
        targetEl.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     3. GENERAL SCROLL ANIMATIONS (IntersectionObserver)
     — watches .animate-on-scroll, .slide-left, .slide-right,
       .fade-in, .scale-in, .slide-up, .zoom-in, .flip-in
  ---------------------------------------------------------- */

  const animClasses = [
    'animate-on-scroll',
    'slide-left',
    'slide-right',
    'fade-in',
    'scale-in',
    'slide-up',
    'zoom-in',
    'flip-in',
  ];

  const animSelector = animClasses.map((c) => `.${c}`).join(', ');
  const animElements = $$(animSelector);

  if (animElements.length) {
    const animObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;

          // Support staggered delays via data-delay (in ms)
          const delay = el.dataset.delay;
          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }

          el.classList.add('animated');
          observer.unobserve(el); // animate only once
        });
      },
      { threshold: 0.15 }
    );

    animElements.forEach((el) => animObserver.observe(el));
  }

  /* ----------------------------------------------------------
     4. SKILL BAR ANIMATION
     — Animate .skill-bar-fill width + counting .skill-percent
  ---------------------------------------------------------- */

  const skillBars = $$('.skill-bar-fill');

  if (skillBars.length) {
    const skillObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const fill = entry.target;
          const targetWidth = parseInt(fill.dataset.width, 10) || 0;

          // Animate the bar width via inline style
          fill.style.transition = 'width 1s ease-out';
          fill.style.width = `${targetWidth}%`;

          // Find the corresponding percent label — go up to .skill-item
          const skillItem = fill.closest('.skill-item');
          const percentEl = skillItem
            ? skillItem.querySelector('.skill-percent')
            : null;

          if (percentEl) {
            animateCount(percentEl, 0, targetWidth, 1000, '%');
          }

          observer.unobserve(fill);
        });
      },
      { threshold: 0.2 }
    );

    skillBars.forEach((bar) => {
      bar.style.width = '0%'; // start collapsed
      skillObserver.observe(bar);
    });
  }

  /**
   * Smoothly count a number inside an element using rAF.
   * @param {HTMLElement} el   — target element whose textContent is set
   * @param {number} from      — start value
   * @param {number} to        — end value
   * @param {number} duration  — ms
   * @param {string} suffix    — appended after the number (e.g. '%', '+')
   */
  function animateCount(el, from, to, duration, suffix = '') {
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(from + (to - from) * eased);

      el.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     5. STAT COUNTER ANIMATION
     — .stat-number with data-target & data-suffix
  ---------------------------------------------------------- */

  const statNumbers = $$('.stat-number');

  if (statNumbers.length) {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = parseInt(el.dataset.target, 10) || 0;
          const suffix = el.dataset.suffix || '';

          animateCount(el, 0, target, 1500, suffix);
          observer.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );

    statNumbers.forEach((el) => statObserver.observe(el));
  }

  /* ----------------------------------------------------------
     6. CERTIFICATION CARD — 3D TILT (mouse-follow)
  ---------------------------------------------------------- */

  const certCards = $$('.cert-card');

  certCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalised offsets (-1 … 1)
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);

      const maxDeg = 4;
      const rotateX = clamp(-dy * maxDeg, -maxDeg, maxDeg); // invert Y
      const rotateY = clamp(dx * maxDeg, -maxDeg, maxDeg);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.transition = 'transform 0.1s ease-out';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.transition = 'transform 0.4s ease-out';
    });
  });

  /* ----------------------------------------------------------
     7. CONTACT FORM — mailto + toast
  ---------------------------------------------------------- */

  const contactForm = $('#contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const subject = formData.get('subject') || 'Portfolio Contact';
      const message = formData.get('message') || '';

      const body = `Hi, my name is ${name} (${email}).%0D%0A%0D%0A${encodeURIComponent(message)}`;
      const mailto = `mailto:agrawaltisha42@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

      window.open(mailto, '_self');

      showToast('Message prepared! Your email client should open shortly. 🚀');
      contactForm.reset();
    });
  }

  /* ----------------------------------------------------------
     8. EXPERIENCE CARD CURTAIN ANIMATION
     — Add 'curtain-open' when .exp-left enters viewport
  ---------------------------------------------------------- */

  const expLefts = $$('.exp-left');

  if (expLefts.length) {
    const expObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          el.classList.add('curtain-open');
          observer.unobserve(el);
        });
      },
      { threshold: 0.2 }
    );

    expLefts.forEach((el) => expObserver.observe(el));
  }

  /* ----------------------------------------------------------
     9. LANDING PAGE ENTRANCE ANIMATIONS
  ---------------------------------------------------------- */

  const landingTimeline = [
    { sel: '.landing-logo.animate-landing', delay: 200, cls: 'visible' },
    { sel: '.landing-name.animate-landing', delay: 400, cls: 'visible' },
    { sel: '.landing-designations.animate-landing', delay: 600, cls: 'visible' },
    { sel: '.landing-intro.animate-landing', delay: 800, cls: 'visible' },
  ];

  landingTimeline.forEach(({ sel, delay, cls }) => {
    const el = $(sel);
    if (el) {
      setTimeout(() => el.classList.add(cls), delay);
    }
  });

  // CTA buttons — stagger starting at 1200ms
  const ctaButtons = $$('.animate-landing-btn');
  ctaButtons.forEach((btn, i) => {
    setTimeout(() => {
      btn.classList.add('visible');
    }, 1200 + i * 150);
  });

  // Social icons — bounce-in starting at 1600ms
  const socialIcons = $$('.animate-landing-social');
  socialIcons.forEach((icon, i) => {
    setTimeout(() => {
      icon.classList.add('pop-in');
    }, 1600 + i * 200);
  });

  /* ----------------------------------------------------------
     10. TYPEWRITER EFFECT — EDUCATION HIGHLIGHTS
     — Character-by-character reveal for education bullets
  ---------------------------------------------------------- */

  const eduBullets = $$('.typewriter-line');

  if (eduBullets.length) {
    const typeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const bullet = entry.target;
          const fullText = bullet.dataset.fullText || bullet.textContent;
          const staggerIndex = parseInt(bullet.dataset.index, 10) || 0;

          bullet.textContent = '';
          bullet.style.visibility = 'visible';

          setTimeout(() => {
            typewrite(bullet, fullText, 0);
          }, staggerIndex * 150);

          observer.unobserve(bullet);
        });
      },
      { threshold: 0.3 }
    );

    eduBullets.forEach((bullet, idx) => {
      bullet.dataset.index = idx;
      // Store text & hide initially
      bullet.dataset.fullText = bullet.textContent;
      bullet.style.visibility = 'hidden';
      typeObserver.observe(bullet);
    });
  }

  /**
   * Typewriter — reveals text one character at a time.
   * @param {HTMLElement} el
   * @param {string} text
   * @param {number} index — current character index
   */
  function typewrite(el, text, index) {
    if (index > text.length) return;
    el.textContent = text.slice(0, index);

    // Variable speed: slight pause on punctuation
    const char = text[index - 1];
    const pause = char === '.' || char === ',' ? 80 : 30;

    setTimeout(() => typewrite(el, text, index + 1), pause);
  }

  /* ----------------------------------------------------------
     11. TECH TAG BOUNCE-IN
  ---------------------------------------------------------- */

  const techTags = $$('.tech-tag');

  if (techTags.length) {
    const tagObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const tag = entry.target;
          const stagger = parseInt(tag.dataset.stagger, 10) || 0;

          setTimeout(() => {
            tag.classList.add('bounced');
          }, stagger * 80);

          observer.unobserve(tag);
        });
      },
      { threshold: 0.2 }
    );

    techTags.forEach((tag, idx) => {
      tag.dataset.stagger = idx;
      tagObserver.observe(tag);
    });
  }

  /* ----------------------------------------------------------
     12. TOAST NOTIFICATION SYSTEM
  ---------------------------------------------------------- */

  /**
   * Display a toast notification at the bottom-right.
   * Auto-dismisses after 3 seconds.
   * @param {string} message
   */
  function showToast(message) {
    // Reuse or create container
    let container = $('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '10000',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      });
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;

    // Inline styles for self-contained toast
    Object.assign(toast.style, {
      background: '#A0522D',              // rust / sienna
      color: '#FFF8F0',                   // cream
      padding: '14px 24px',
      borderRadius: '10px',
      fontSize: '0.95rem',
      fontWeight: '500',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      transform: 'translateY(40px)',
      opacity: '0',
      transition: 'all 0.4s ease',
      pointerEvents: 'auto',
      maxWidth: '360px',
      lineHeight: '1.4',
    });

    container.appendChild(toast);

    // Trigger entrance
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    // Auto-dismiss after 3s
    setTimeout(() => {
      toast.style.transform = 'translateY(40px)';
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => toast.remove(), {
        once: true,
      });
    }, 3000);
  }

  // Expose globally so other scripts or inline handlers can use it
  window.showToast = showToast;

  /* ----------------------------------------------------------
     13. BACK TO TOP BUTTON
  ---------------------------------------------------------- */

  // Use the existing back-to-top button from HTML
  const backToTop = $('#backToTop');

  if (backToTop) {
    // Show / hide on scroll
    const toggleBackToTop = () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    };

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    // Scroll to top on click
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     14. NAVBAR ACTIVE SECTION TRACKING
  ---------------------------------------------------------- */

  const sections = $$('section[id]');
  const navLinks = $$('.navbar a[href^="#"]');

  if (sections.length && navLinks.length) {
    const activateLink = (id) => {
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateLink(entry.target.id);
          }
        });
      },
      {
        rootMargin: `-${NAV_OFFSET}px 0px -40% 0px`,
        threshold: 0,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ----------------------------------------------------------
     DONE — Log successful initialisation
  ---------------------------------------------------------- */
  console.log(
    '%c✦ Portfolio JS loaded',
    'color: #A0522D; font-weight: bold; font-size: 12px;'
  );
});
