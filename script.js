let allProjects = [];

// Helper: normaliseer een comma-separated string naar array van lowercase trimmed items
function normalizeList(str) {
  if (!str || typeof str !== 'string') return [];
  return str.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

// Render all project cards
function renderProjects(projects) {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '';

  if (!projects || projects.length === 0) {
    container.innerHTML = '<p class="empty">No projects to show.</p>';
    return;
  }

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];

    const card = document.createElement('div');

    // build class names from categories (use original values for display but normalized for matching)
    const catClasses = project.category ? normalizeList(project.category).join(' ') : '';
    card.className = 'project-card ' + catClasses;
    card.onclick = function() { openProject(project); };

    const img = document.createElement('img');
    img.className = 'project-img';
    img.src = project.image || '';
    img.alt = project.title || '';
    img.onerror = function() { this.style.display = 'none'; };

    const title = document.createElement('h3');
    title.textContent = project.title || '';

    const desc = document.createElement('p');
    desc.textContent = project.short || '';

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);
    container.appendChild(card);
  }
}

// Filter projects by category (used by the buttons on projects.html)
function filterProjects(category) {
  if (!category || category === 'all') {
    renderProjects(allProjects);
    return;
  }

  const wanted = category.trim().toLowerCase();

  const filtered = allProjects.filter(p => {
    if (!p.category) return false;
    const cats = normalizeList(p.category); // e.g. ['web','other']
    return cats.includes(wanted);
  });

  if (!filtered.length) {
    const container = document.getElementById('projectsContainer');
    container.innerHTML = `<p class="empty">No results found for “${category}”.</p>`;
    return;
  }

  renderProjects(filtered);
}

// Filter projects by tech (used when coming from index.html?tech=...)
function filterByTech(tech) {
  const decodedTech = decodeURIComponent(tech).trim().toLowerCase();

  const filtered = allProjects.filter(p => {
    if (!p.tech) return false;
    const techList = p.tech.split(',').map(t => t.trim().toLowerCase());
    return techList.includes(decodedTech);
  });

  renderProjects(filtered);
}


// Open modal with full project info
function openProject(project) {
  document.getElementById('modalTitle').innerText = project.title;
  document.getElementById('modalImg').src = project.image || '';
  document.getElementById('modalDetails').innerText = project.details || '';
  document.getElementById('modalLearned').innerText = project.learned || '';

  // Techniques
  const techContainer = document.getElementById('modalTech');
  techContainer.innerHTML = '';
  if (project.tech) {
    project.tech.split(',').forEach(t => {
      const span = document.createElement('span');
      span.className = 'filter-tag';
      span.textContent = t.trim();
      techContainer.appendChild(span);
    });
  }

  const githubEl = document.getElementById('modalGithub');
  if (project.link && project.link.trim() !== "" && project.link.trim().toLowerCase() !== "n/a") {
    // show text link instead of raw URL when possible
    githubEl.innerHTML = `<a href="${project.link}" target="_blank" rel="noopener noreferrer">View repository</a>`;
  } else {
    githubEl.innerHTML = "";
  }

  const modal = document.getElementById('projectModal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}

// Close modal
function closeModal() {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

// Close modal on outside click or ESC key
window.onclick = function(e) {
  if (e.target === document.getElementById('projectModal')) closeModal();
};
window.onkeydown = function(e) {
  if (e.key === 'Escape') closeModal();
};

// Initialize after page loads
window.onload = function() {
  fetch('projects.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      allProjects = data;
      renderProjects(allProjects);

      // 👇 eigen parsing zodat C# werkt
      let techParam = null;

      // gebruik volledige URL zodat het '#' deel niet genegeerd wordt
      const fullUrl = window.location.href;

      // Probeer eerst standaard manier
      const params = new URLSearchParams(window.location.search);
      techParam = params.get('tech');

      // Als dat niks oplevert, pak het deel zelf uit de URL
      if (!techParam && fullUrl.includes('?tech=')) {
        const raw = fullUrl.split('?tech=')[1];
        // stop bij volgende & of #
        techParam = raw.split('&')[0].split('#')[0];
      }

      if (techParam) {
        filterByTech(techParam);
      }
    })
    .catch(showLoadError);
};


// Show error if projects can't load
function showLoadError() {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '<p class="error">Could not load projects.</p>';
}
