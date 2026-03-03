
/**
 * data-loader.js — Portfolio SaaS enhanced renderer
 * Loaded by every client repo created from the template.
 * Fetches portfolio-data/data.json and renders all visible sections.
 */
(async function () {
  /* ── helpers ─────────────────────────────────────────────────── */
  function esc(v) {
    if (v == null) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── fetch ────────────────────────────────────────────────────── */
  try {
    const res = await fetch('./portfolio-data/data.json');
    if (!res.ok) return;
    window.PORTFOLIO_DATA = await res.json();
    renderPortfolio(window.PORTFOLIO_DATA);
    document.dispatchEvent(new Event('portfolioDataLoaded'));
  } catch (e) {
    console.info('[portfolio-saas] No data.json found, using hardcoded content.');
  }

  /* ── main render ─────────────────────────────────────────────── */
  function renderPortfolio(data) {
    if (!data) return;

    if (data.meta && data.meta.siteTitle) {
      document.title = data.meta.siteTitle;
    }

    renderHero(data.profile);
    renderClients(data.clients);
    renderExperience(data.experience);
    renderProjects(data.projects);
    renderContact(data.contact);

    // Re-init dynamic plugins after DOM changes
    setTimeout(reinitLibraries, 200);
  }

  /* ── hero ────────────────────────────────────────────────────── */
  function renderHero(profile) {
    if (!profile) return;

    // Name: all words except the last → normal; last word → gradient-text
    const parts = (profile.name || '').trim().split(/\s+/);
    const last  = esc(parts.pop() || '');
    const first = esc(parts.join(' '));

    const titleEl = document.querySelector('.hero-title');
    if (titleEl) {
      titleEl.innerHTML = (first ? first + '<br>' : '') +
        '<span class="gradient-text">' + last + '</span>';
    }

    const subtitleEl = document.querySelector('.hero-subtitle');
    if (subtitleEl) subtitleEl.textContent = profile.title || '';

    const descEl = document.querySelector('.hero-description');
    if (descEl) descEl.textContent = profile.description || '';

    // Available badge (second span inside .hero-badge, skip the dot span)
    const badgeSpans = document.querySelectorAll('.hero-badge span');
    if (badgeSpans.length >= 2) {
      badgeSpans[1].textContent = profile.availableText || 'Disponible para proyectos';
    }

    // Profile photo
    const img = document.querySelector('.hero-profile-img');
    if (img && profile.photo) {
      img.src = profile.photo;
      img.alt = esc(profile.name);
      const pict = img.closest('picture');
      if (pict) pict.querySelectorAll('source').forEach(s => { s.srcset = profile.photo; });
    }

    // Stats chips  [years+, projects+, companies, tools+]
    if (profile.stats) {
      const chips  = document.querySelectorAll('.stat-chip');
      const defs   = [
        { key: 'years',     label: 'Años exp.',     suffix: '+' },
        { key: 'projects',  label: 'Proyectos',     suffix: '+' },
        { key: 'companies', label: 'Empresas top',  suffix: ''  },
        { key: 'tools',     label: 'Herramientas',  suffix: '+' },
      ];
      chips.forEach((chip, i) => {
        if (!defs[i]) return;
        const numEl = chip.querySelector('.stat-num');
        const lblEl = chip.querySelector('.stat-label');
        const val   = profile.stats[defs[i].key];
        if (numEl && val != null) numEl.textContent = val + defs[i].suffix;
        if (lblEl) lblEl.textContent = defs[i].label;
      });
    }

    // Tech floating badges — update text, keep existing icons
    if (Array.isArray(profile.badges) && profile.badges.length) {
      const techBadges = document.querySelectorAll('.hero-tech-badge');
      techBadges.forEach((badge, i) => {
        if (profile.badges[i] == null) return;
        const icon    = badge.querySelector('i');
        const iconHtml = icon ? icon.outerHTML + ' ' : '';
        badge.innerHTML = iconHtml + esc(profile.badges[i]);
      });
    }
  }

  /* ── clients ─────────────────────────────────────────────────── */
  function renderClients(clients) {
    if (!Array.isArray(clients) || !clients.length) return;
    const track = document.getElementById('clientsTrack');
    if (!track) return;

    // Double the list so the CSS infinite-scroll animation works
    const doubled = [...clients, ...clients];
    track.innerHTML = doubled.map(c => `
      <div class="client-logo-item">
        <img src="${esc(c.logo)}" alt="${esc(c.name)}" loading="lazy"
             onerror="this.style.visibility='hidden'">
        <span class="client-name">${esc(c.name)}</span>
      </div>`).join('');
  }

  /* ── experience ──────────────────────────────────────────────── */
  function renderExperience(experience) {
    if (!Array.isArray(experience) || !experience.length) return;
    const section = document.getElementById('experience');
    if (!section) return;
    const container = section.querySelector('.col-lg-10');
    if (!container) return;

    container.innerHTML = experience.map((exp, i) => {
      const roles = (exp.roles || []).map((role, ri) => `
        <div class="timeline-item" data-aos="fade-left" data-aos-delay="${120 + ri * 50}">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h4>${esc(role.title)}${role.isCurrent
                ? ' <span class="current-badge"><span class="pulse-dot"></span>Actual</span>'
                : ''}</h4>
              <span class="timeline-date">${esc(role.period)}</span>
            </div>
            ${role.description ? `<p>${esc(role.description)}</p>` : ''}
            ${role.skills && role.skills.length
              ? `<div class="timeline-tags">${role.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>`
              : ''}
          </div>
        </div>`).join('');

      const impacts = (exp.impacts || []).map(imp =>
        `<div class="exp-impact-item"><span class="exp-impact-icon">${esc(imp.icon)}</span><span>${esc(imp.text)}</span></div>`
      ).join('');

      const links = (exp.links || []).map(lnk =>
        `<a href="${esc(lnk.url)}" target="_blank" rel="noopener" class="exp-link-item">${esc(lnk.icon)} ${esc(lnk.label)}</a>`
      ).join('');

      return `
        <div class="exp-company-card" data-aos="fade-up" data-aos-delay="${80 + i * 20}">
          <div class="exp-company-header company-clickable"
               data-company="${esc(exp.companyKey)}" role="button" tabindex="0">
            <div class="company-logo-wrapper">
              <img src="${esc(exp.logo)}" alt="${esc(exp.company)}"
                   class="company-logo-img" onerror="this.style.visibility='hidden'">
            </div>
            <div class="company-info">
              <h3>${esc(exp.company)}
                <span class="company-popup-hint"><i class="bi bi-box-arrow-up-right"></i></span>
              </h3>
              <p><i class="bi bi-geo-alt-fill me-1"></i>${esc(exp.location)} • ${esc(exp.period)}</p>
              <span class="company-badge">${esc(exp.badge)}</span>
            </div>
          </div>
          <div class="timeline-container">${roles}</div>
          ${impacts ? `<div class="exp-impacts">${impacts}</div>` : ''}
          ${links   ? `<div class="exp-links">${links}</div>`     : ''}
        </div>`;
    }).join('');
  }

  /* ── projects ────────────────────────────────────────────────── */
  function renderProjects(projects) {
    if (!Array.isArray(projects) || !projects.length) return;
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const catMap = {
      'powerbi':      { cls: 'filter-powerbi',      badge: 'powerbi-badge',      label: 'Power BI'     },
      'power bi':     { cls: 'filter-powerbi',      badge: 'powerbi-badge',      label: 'Power BI'     },
      'tableau':      { cls: 'filter-tableau',      badge: 'tableau-badge',      label: 'Tableau'      },
      'architecture': { cls: 'filter-architecture', badge: 'architecture-badge', label: 'Architecture' },
      'web':          { cls: 'filter-web',          badge: 'web-badge',          label: 'Web'          },
      'app':          { cls: 'filter-app',          badge: 'app-badge',          label: 'App'          },
    };

    grid.innerHTML = projects.map((proj, i) => {
      const key = (proj.category || '').toLowerCase().trim();
      const cat = catMap[key] || {
        cls:   'filter-' + key.replace(/\s+/g, '-'),
        badge: 'powerbi-badge',
        label: proj.category || '',
      };

      const ghBtn   = proj.githubUrl
        ? `<a href="${esc(proj.githubUrl)}" target="_blank" rel="noopener" class="overlay-btn"><i class="bi bi-github"></i></a>`
        : '';
      const demoBtn = proj.demoUrl
        ? `<a href="${esc(proj.demoUrl)}" target="_blank" rel="noopener" class="overlay-btn"><i class="bi bi-box-arrow-up-right"></i></a>`
        : '';
      const tags = (proj.tags || []).map(t => `<span class="tech-tag">${esc(t)}</span>`).join('');

      return `
        <div class="col-lg-4 col-md-6 portfolio-item ${cat.cls}"
             data-aos="fade-up" data-aos-delay="${100 + (i % 3) * 50}">
          <div class="project-card">
            <div class="project-img-wrapper">
              <img src="${esc(proj.image)}" alt="${esc(proj.title)}"
                   class="project-img" loading="lazy"
                   onerror="this.src='assets/img/portfolio/placeholder.jpg'">
              <div class="project-overlay">
                <a href="${esc(proj.image)}" class="portfolio-lightbox overlay-btn"
                   data-gallery="pg" title="${esc(proj.title)}">
                  <i class="bi bi-zoom-in"></i>
                </a>
                ${ghBtn}${demoBtn}
              </div>
              <span class="project-tag-badge ${cat.badge}">${esc(cat.label)}</span>
            </div>
            <div class="project-body">
              <h4 class="project-title">${esc(proj.title)}</h4>
              <div class="case-study">
                ${proj.problem  ? `<div class="cs-row"><span class="cs-label problem">Problema</span><p>${esc(proj.problem)}</p></div>`   : ''}
                ${proj.solution ? `<div class="cs-row"><span class="cs-label solution">Solución</span><p>${esc(proj.solution)}</p></div>` : ''}
                ${proj.result   ? `<div class="cs-row"><span class="cs-label result">Resultado</span><p class="result-text"><i class="bi bi-graph-up-arrow"></i> ${esc(proj.result)}</p></div>` : ''}
              </div>
              ${tags ? `<div class="project-tech">${tags}</div>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── contact ─────────────────────────────────────────────────── */
  function renderContact(contact) {
    if (!contact) return;
    const linksEl = document.querySelector('.contact-links');
    if (!linksEl) return;

    const strip = url => esc((url || '').replace(/^https?:\/\/(www\.)?/, ''));

    let html = '';
    if (contact.email) html += `
      <a href="mailto:${esc(contact.email)}" class="contact-link">
        <div class="contact-icon"><i class="bi bi-envelope-fill"></i></div>
        <div><span class="contact-label">Email</span><span class="contact-value">${esc(contact.email)}</span></div>
      </a>`;
    if (contact.linkedin) html += `
      <a href="${esc(contact.linkedin)}" target="_blank" rel="noopener" class="contact-link">
        <div class="contact-icon linkedin-icon"><i class="bx bxl-linkedin"></i></div>
        <div><span class="contact-label">LinkedIn</span><span class="contact-value">${strip(contact.linkedin)}</span></div>
      </a>`;
    if (contact.github) html += `
      <a href="${esc(contact.github)}" target="_blank" rel="noopener" class="contact-link">
        <div class="contact-icon github-icon"><i class="bx bxl-github"></i></div>
        <div><span class="contact-label">GitHub</span><span class="contact-value">${strip(contact.github)}</span></div>
      </a>`;
    if (contact.twitter) html += `
      <a href="${esc(contact.twitter)}" target="_blank" rel="noopener" class="contact-link">
        <div class="contact-icon"><i class="bx bxl-twitter"></i></div>
        <div><span class="contact-label">Twitter / X</span><span class="contact-value">${strip(contact.twitter)}</span></div>
      </a>`;
    if (contact.medium) html += `
      <a href="${esc(contact.medium)}" target="_blank" rel="noopener" class="contact-link">
        <div class="contact-icon"><i class="bx bxl-medium"></i></div>
        <div><span class="contact-label">Medium</span><span class="contact-value">${strip(contact.medium)}</span></div>
      </a>`;

    linksEl.innerHTML = html;
  }

  /* ── re-init plugins ─────────────────────────────────────────── */
  function reinitLibraries() {
    // Isotope — projects filter
    const grid = document.getElementById('projectsGrid');
    if (grid && window.Isotope) {
      const existing = window.Isotope.data(grid);
      if (existing) existing.destroy();

      const iso = new window.Isotope(grid, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows',
      });

      // Re-bind filter buttons (clone to remove old listeners)
      document.querySelectorAll('.filter-btn').forEach(btn => {
        const fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);
        fresh.addEventListener('click', function () {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          iso.arrange({ filter: this.dataset.filter });
        });
      });
    }

    // GLightbox — project image zoom
    if (window.GLightbox) {
      window.GLightbox({ selector: '.portfolio-lightbox' });
    }

    // AOS — scroll animations
    if (window.AOS) {
      window.AOS.refresh();
    }
  }
})();
