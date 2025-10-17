let allProjects = [];

// Helper: normaliseer een comma-separated string naar array van lowercase trimmed items
function normalizeList(str) {
  if (!str || typeof str !== 'string') return [];
  return str.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

// Render all project cards (met techDisplay)
function renderProjects(projects) {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '';

  if (!projects || projects.length === 0) {
    container.innerHTML = '<p class="empty">No projects to show.</p>';
    return;
  }

  projects.forEach(project => {
    const card = document.createElement('div');

    // category classes
    const catClasses = project.category ? normalizeList(project.category).join(' ') : '';
    card.className = 'project-card ' + catClasses;
    card.onclick = () => openProject(project);

    const img = document.createElement('img');
    img.className = 'project-img';
    img.src = project.image || '';
    img.alt = project.title || '';
    img.onerror = () => img.style.display = 'none';

    const title = document.createElement('h3');
    title.textContent = project.title || '';

    const desc = document.createElement('p');
    desc.textContent = project.short || '';

    // Tech display via techDisplay
    const techDiv = document.createElement('div');
    techDiv.className = 'tech-container';
    const displayTech = project.techDisplay || project.tech || '';
    displayTech.split(',').forEach(t => {
      const span = document.createElement('span');
      span.className = 'filter-tag';
      span.textContent = t.trim();
      techDiv.appendChild(span);
    });

    card.append(img, title, desc, techDiv);
    container.appendChild(card);
  });
}

// Filter projects by category (buttons on projects.html)
function filterProjects(category) {
  if (!category || category === 'all') return renderProjects(allProjects);

  const wanted = category.trim().toLowerCase();
  const filtered = allProjects.filter(p => normalizeList(p.category).includes(wanted));

  renderProjects(filtered.length ? filtered : []);
  if (!filtered.length) {
    document.getElementById('projectsContainer').innerHTML =
      `<p class="empty">No results found for “${category}”.</p>`;
  }
}

// Filter projects by tech (index.html?tech=...)
function filterByTech(tech) {
  if (!tech) return;

  let decodedTech = decodeURIComponent(tech).trim().toLowerCase();

  // Map URL query to JSON tech
  const techMap = {
    'c#': 'c-sharp',
    'c-sharp': 'c-sharp',
    'database-design': 'database design',
    'html': 'html',
    'css': 'css',
    'javascript': 'javascript',
    'python': 'python',
    'sql': 'sql',
    'csv': 'csv',
    'winforms': 'winforms',
    'php': 'php'
  };

  if (techMap[decodedTech]) decodedTech = techMap[decodedTech];

  const filtered = allProjects.filter(p => {
    if (!p.tech) return false;
    const techList = p.tech.split(',').map(t => t.trim().toLowerCase());
    return techList.includes(decodedTech);
  });

  renderProjects(filtered.length ? filtered : []);
  if (!filtered.length) {
    document.getElementById('projectsContainer').innerHTML =
      `<p class="empty">No results found for “${tech}”.</p>`;
  }
}

// Open modal with full project info
function openProject(project) {
  document.getElementById('modalTitle').innerText = project.title;
  document.getElementById('modalImg').src = project.image || '';
  document.getElementById('modalDetails').innerText = project.details || '';
  document.getElementById('modalLearned').innerText = project.learned || '';

  const techContainer = document.getElementById('modalTech');
  techContainer.innerHTML = '';
  const displayTech = project.techDisplay || project.tech || '';
  displayTech.split(',').forEach(t => {
    const span = document.createElement('span');
    span.className = 'filter-tag';
    span.textContent = t.trim();
    techContainer.appendChild(span);
  });

  const githubEl = document.getElementById('modalGithub');
  githubEl.innerHTML = ''; // leeg eerst

  if (project.link && project.link.trim().toLowerCase() !== 'n/a') {
    // Split op comma voor meerdere links
    const links = project.link.split(',').map(l => l.trim()).filter(Boolean);

    links.forEach(url => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      
      // Alleen hostname tonen
      try {
        a.textContent = new URL(url).hostname;
      } catch {
        a.textContent = url; // fallback als URL ongeldig is
      }

      githubEl.appendChild(a);
      githubEl.appendChild(document.createElement('br')); // line break tussen links
    });
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

window.onclick = e => { if (e.target === document.getElementById('projectModal')) closeModal(); };
window.onkeydown = e => { if (e.key === 'Escape') closeModal(); };

// Initialize
window.onload = () => {
  fetch('projects.json')
    .then(res => res.ok ? res.json() : Promise.reject('Failed to load'))
    .then(data => {
      allProjects = data;
      renderProjects(allProjects);

      let techParam = new URLSearchParams(window.location.search).get('tech');
      if (!techParam && window.location.href.includes('?tech=')) {
        techParam = window.location.href.split('?tech=')[1].split('&')[0].split('#')[0];
      }

      if (techParam) filterByTech(techParam);
    })
    .catch(showLoadError);
};

// Show load error
function showLoadError() {
  document.getElementById('projectsContainer').innerHTML =
    '<p class="error">Could not load projects.</p>';
}
