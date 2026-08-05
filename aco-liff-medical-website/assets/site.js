(() => {
  const body = document.body;
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const year = document.querySelector('[data-year]');
  const contactForm = document.querySelector('#contact-form');
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

  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      contactStatus.textContent = 'Thanks. Your request has been captured and is ready to be connected to your live email or CRM workflow.';
      contactStatus.style.color = 'var(--blue-3)';
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
