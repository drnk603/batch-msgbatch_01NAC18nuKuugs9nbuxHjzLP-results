(function() {
  'use strict';

  const app = window.__app = window.__app || {};

  const debounce = (fn, ms) => {
    let timer;
    return function() {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(ctx, args), ms);
    };
  };

  const throttle = (fn, ms) => {
    let last = 0;
    return function() {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  };

  const getScrollTop = () => window.pageYOffset || document.documentElement.scrollTop || 0;

  class BurgerMenu {
    constructor() {
      this.nav = document.querySelector('.c-nav#main-nav');
      this.toggle = document.querySelector('.c-nav__toggle');
      this.navList = document.querySelector('.c-nav__list');
      this.body = document.body;
      
      if (!this.nav || !this.toggle || !this.navList) return;
      
      this.init();
    }

    init() {
      this.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.nav.classList.contains('is-open')) {
          this.close();
          this.toggle.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (!this.nav.classList.contains('is-open')) return;
        if (!this.nav.contains(e.target)) {
          this.close();
        }
      });

      const links = this.nav.querySelectorAll('.c-nav__link');
      links.forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      this.setupTrapFocus();
      this.setupResponsive();
    }

    toggleMenu() {
      if (this.nav.classList.contains('is-open')) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.nav.classList.add('is-open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.body.classList.add('u-no-scroll');
      
      const firstFocusable = this.navList.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }

    close() {
      this.nav.classList.remove('is-open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.body.classList.remove('u-no-scroll');
    }

    setupTrapFocus() {
      this.navList.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        const focusables = this.navList.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    setupResponsive() {
      const resizeHandler = debounce(() => {
        if (window.innerWidth >= 1024) {
          this.close();
        }
      }, 100);
      
      window.addEventListener('resize', resizeHandler);
    }
  }

  class ScrollEffects {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      if (!('IntersectionObserver' in window)) return;

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      this.observeElements();
    }

    observeElements() {
      const elements = document.querySelectorAll(`
        .c-case,
        .c-value-card,
        .c-stat-card,
        .c-service-card,
        .c-team-card,
        .c-pricing-card,
        .c-leader-card,
        .c-achievement-card,
        .c-contact-card,
        .c-intro,
        .c-cta
      `);

      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        this.observer.observe(el);
      });
    }
  }

  class ImageAnimations {
    constructor() {
      this.init();
    }

    init() {
      const images = document.querySelectorAll('img:not(.c-logo__img)');
      
      images.forEach((img, index) => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }

        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

        if (img.complete) {
          setTimeout(() => this.showImage(img), index * 50);
        } else {
          img.addEventListener('load', () => this.showImage(img));
        }
      });
    }

    showImage(img) {
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }
  }

  class ButtonEffects {
    constructor() {
      this.init();
    }

    init() {
      const buttons = document.querySelectorAll('.c-button, .c-nav__link, .c-team-card__social-link');
      
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', (e) => this.createRipple(e));
        btn.addEventListener('click', (e) => this.createRipple(e));
      });
    }

    createRipple(e) {
      const button = e.currentTarget;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      const rect = button.getBoundingClientRect();
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const ripple = button.getElementsByClassName('ripple')[0];
      if (ripple) {
        ripple.remove();
      }

      button.appendChild(circle);
    }
  }

  class CountUpAnimation {
    constructor() {
      this.counters = document.querySelectorAll('.c-stat-card__number');
      this.init();
    }

    init() {
      if (!this.counters.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            this.countUp(entry.target);
            entry.target.dataset.counted = 'true';
          }
        });
      }, { threshold: 0.5 });

      this.counters.forEach(counter => observer.observe(counter));
    }

    countUp(element) {
      const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          element.textContent = target + (element.textContent.includes('+') ? '+' : '');
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
        }
      }, 16);
    }
  }

  class FormValidator {
    constructor() {
      this.forms = document.querySelectorAll('.c-form');
      this.init();
    }

    init() {
      this.forms.forEach(form => {
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        
        const inputs = form.querySelectorAll('.c-form__input, .c-form__textarea');
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateField(input));
          input.addEventListener('input', () => this.clearError(input));
        });
      });
    }

    handleSubmit(e, form) {
      e.preventDefault();
      e.stopPropagation();

      const isValid = this.validateForm(form);

      if (!isValid) {
        return;
      }

      this.submitForm(form);
    }

    validateForm(form) {
      let isValid = true;
      
      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput) {
        if (!this.validateName(nameInput.value)) {
          this.showError(nameInput, 'Bitte geben Sie einen gültigen Namen ein (mindestens 2 Zeichen)');
          isValid = false;
        }
      }

      const emailInput = form.querySelector('input[name="email"]');
      if (emailInput) {
        if (!this.validateEmail(emailInput.value)) {
          this.showError(emailInput, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
          isValid = false;
        }
      }

      const phoneInput = form.querySelector('input[name="phone"]');
      if (phoneInput && phoneInput.value.trim()) {
        if (!this.validatePhone(phoneInput.value)) {
          this.showError(phoneInput, 'Bitte geben Sie eine gültige Telefonnummer ein');
          isValid = false;
        }
      }

      const messageInput = form.querySelector('textarea[name="message"]');
      if (messageInput) {
        if (!this.validateMessage(messageInput.value)) {
          this.showError(messageInput, 'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein');
          isValid = false;
        }
      }

      const privacyCheckbox = form.querySelector('input[name="privacy"]');
      if (privacyCheckbox) {
        if (!privacyCheckbox.checked) {
          this.showError(privacyCheckbox, 'Bitte akzeptieren Sie die Datenschutzerklärung');
          isValid = false;
        }
      }

      return isValid;
    }

    validateField(input) {
      const name = input.name;
      const value = input.value;

      switch(name) {
        case 'name':
          if (!this.validateName(value)) {
            this.showError(input, 'Bitte geben Sie einen gültigen Namen ein (mindestens 2 Zeichen)');
            return false;
          }
          break;
        case 'email':
          if (!this.validateEmail(value)) {
            this.showError(input, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
            return false;
          }
          break;
        case 'phone':
          if (value.trim() && !this.validatePhone(value)) {
            this.showError(input, 'Bitte geben Sie eine gültige Telefonnummer ein');
            return false;
          }
          break;
        case 'message':
          if (!this.validateMessage(value)) {
            this.showError(input, 'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein');
            return false;
          }
          break;
      }

      this.clearError(input);
      return true;
    }

    validateName(name) {
      const regex = /^[a-zA-ZÀ-ÿs-']{2,50}$/;
      return regex.test(name.trim());
    }

    validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email.trim());
    }

    validatePhone(phone) {
      const regex = /^[\d\s\+\(\)\-]{10,20}$/;
      return regex.test(phone.trim());
    }

    validateMessage(message) {
      return message.trim().length >= 10;
    }

    showError(input, message) {
      const group = input.closest('.c-form__group, .c-form__group--checkbox');
      if (!group) return;

      group.classList.add('has-error');

      let errorEl = group.querySelector('.c-form__error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'c-form__error';
        group.appendChild(errorEl);
      }

      errorEl.textContent = message;
      errorEl.style.opacity = '0';
      errorEl.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        errorEl.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        errorEl.style.opacity = '1';
        errorEl.style.transform = 'translateY(0)';
      }, 10);
    }

    clearError(input) {
      const group = input.closest('.c-form__group, .c-form__group--checkbox');
      if (!group) return;

      group.classList.remove('has-error');
      const errorEl = group.querySelector('.c-form__error');
      if (errorEl) {
        errorEl.style.opacity = '0';
        errorEl.style.transform = 'translateY(-10px)';
        setTimeout(() => errorEl.remove(), 300);
      }
    }

    async submitForm(form) {
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      btn.disabled = true;
      const origText = btn.textContent;
      btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Senden...';

      const formData = new FormData(form);
      const data = {};
      formData.forEach((val, key) => {
        data[key] = val;
      });

      try {
        const response = await fetch('process.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        btn.disabled = false;
        btn.textContent = origText;

        if (result.success) {
          this.showSuccess();
          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1500);
        } else {
          this.showNotification(result.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
        }
      } catch (error) {
        btn.disabled = false;
        btn.textContent = origText;
        this.showNotification('Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.', 'error');
      }
    }

    showSuccess() {
      this.showNotification('Ihre Nachricht wurde erfolgreich gesendet!', 'success');
    }

    showNotification(message, type) {
      let container = document.getElementById('notification-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed;top:calc(var(--header-h) + 1rem);right:1rem;z-index:9999;max-width:400px;';
        document.body.appendChild(container);
      }

      const notification = document.createElement('div');
      notification.className = `notification notification--${type}`;
      notification.style.cssText = `
        background: ${type === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
        color: var(--color-neutral);
        padding: var(--space-lg);
        border-radius: var(--border-radius-md);
        margin-bottom: var(--space-md);
        box-shadow: var(--shadow-lg);
        transform: translateX(450px);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: var(--font-weight-medium);
      `;
      notification.textContent = message;

      container.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 10);

      setTimeout(() => {
        notification.style.transform = 'translateX(450px)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 400);
      }, 5000);
    }
  }

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (!target) return;

        const hash = target.getAttribute('href');
        if (!hash || hash === '#' || hash === '#!') return;

        const element = document.querySelector(hash);
        if (!element) return;

        e.preventDefault();

        const header = document.querySelector('.l-header');
        const offset = header ? header.offsetHeight : 80;
        const top = element.getBoundingClientRect().top + getScrollTop() - offset;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });

        if (window.history && window.history.pushState) {
          window.history.pushState(null, null, hash);
        }
      });
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('[id]');
      this.navLinks = document.querySelectorAll('.c-nav__link');
      this.init();
    }

    init() {
      if (!this.sections.length || !this.navLinks.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setActiveLink(entry.target.id);
          }
        });
      }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -66% 0px'
      });

      this.sections.forEach(section => observer.observe(section));
    }

    setActiveLink(id) {
      this.navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');

        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }

  class CardHoverEffects {
    constructor() {
      this.init();
    }

    init() {
      const cards = document.querySelectorAll(`
        .c-case,
        .c-value-card,
        .c-service-card,
        .c-team-card,
        .c-pricing-card,
        .c-leader-card,
        .c-achievement-card,
        .c-contact-card,
        .c-stat-card
      `);

      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
        });

        card.addEventListener('mouseleave', () => {
          card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
        });
      });
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .is-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple-effect 0.6s ease-out;
      pointer-events: none;
    }
    
    @keyframes ripple-effect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  app.init = () => {
    new BurgerMenu();
    new ScrollEffects();
    new ImageAnimations();
    new ButtonEffects();
    new CountUpAnimation();
    new FormValidator();
    new SmoothScroll();
    new ScrollSpy();
    new CardHoverEffects();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }
})();
