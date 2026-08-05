(() => {
  // Global page-loading spinner (logo with spinning ring)
  const loaderMarkup = `
    <div class="page-loader" data-page-loader aria-hidden="true">
      <div class="loader-logo">
        <img src="assets/aco-liff-logo.png" alt="Aco Liff Medical Supplies Ltd" />
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', loaderMarkup);
  const loader = document.querySelector('[data-page-loader]');

  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('is-hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  };

  // Hide once the page resources have finished loading (with a small minimum display time)
  let started = Date.now();
  const finish = () => {
    const elapsed = Date.now() - started;
    const remaining = Math.max(0, 350 - elapsed);
    window.setTimeout(hideLoader, remaining);
  };

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish);
  }

  const body = document.body;
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const year = document.querySelector('[data-year]');
  const contactForm = document.querySelector('#contact-form');
  const submitButton = document.querySelector('[data-submit-button]');
  const submitLabel = document.querySelector('[data-submit-label]');
  const contactStatus = document.querySelector('[data-contact-status]');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (toggle && nav) {
    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', String(expanded));
      body.classList.toggle('nav-open', expanded);
    };

    toggle.addEventListener('click', () => {
      setExpanded(!body.classList.contains('nav-open'));
    });

    nav.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLAnchorElement) {
        setExpanded(false);
      }
    });

    document.addEventListener('click', (event) => {
      if (!body.classList.contains('nav-open')) return;
      if (toggle.contains(event.target) || nav.contains(event.target)) return;
      setExpanded(false);
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const fields = Object.fromEntries(formData.entries());

      if (submitButton) {
        submitButton.classList.add('is-loading');
        submitButton.setAttribute('disabled', 'disabled');
      }

      if (submitLabel) {
        submitLabel.textContent = 'Sending...';
      }

      if (contactStatus) {
        contactStatus.textContent = 'Sending your message to the team...';
        contactStatus.style.color = 'var(--muted-dark)';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fields)
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || 'Unable to send message right now.');
        }

        contactForm.reset();

        if (contactStatus) {
          contactStatus.textContent = 'Thanks. Your inquiry was sent successfully.';
          contactStatus.style.color = 'var(--blue-3)';
        }
      } catch (error) {
        if (contactStatus) {
          contactStatus.textContent = error instanceof Error ? error.message : 'Something went wrong while sending the message.';
          contactStatus.style.color = '#b42318';
        }
      } finally {
        if (submitButton) {
          submitButton.classList.remove('is-loading');
          submitButton.removeAttribute('disabled');
        }

        if (submitLabel) {
          submitLabel.textContent = 'Submit inquiry';
        }
      }
    });
  }

  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav] a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();
