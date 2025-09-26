// ===== Simple JS for Projects =====

let allProjects = [];

// Initialize after page loads
window.onload = function() {
  // Get embedded JSON
  const fallbackEl = document.getElementById('projects-data');
  if (fallbackEl && fallbackEl.textContent.trim()) {
    try {
      allProjects = JSON.parse(fallbackEl.textContent);
      renderProjects(allProjects);
    } catch (e) {
      showLoadError();
    }
  } else {
    showLoadError();
  }
};

// Show error if projects can't load
function showLoadError() {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '<p class="error">Could not load projects.</p>';
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
    card.className = 'project-card ' + (project.category || '');
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

// Filter projects by category
function filterProjects(category) {
  if (category === 'all') {
    renderProjects(allProjects);
  } else {
    const filtered = [];
    for (let i = 0; i < allProjects.length; i++) {
      if (allProjects[i].category === category) filtered.push(allProjects[i]);
    }
    renderProjects(filtered);
  }
}

// Open modal with full project info
function openProject(project) {
  document.getElementById('modalTitle').innerText = project.title;
  document.getElementById('modalImg').src = project.image;
  document.getElementById('modalDetails').innerText = project.details;
  document.getElementById('modalLearned').innerText = project.learned;

  // Techniques
  const techContainer = document.getElementById('modalTech');
  techContainer.innerHTML = '';
  if (project.tech) {
    const techs = project.tech.split(',');
    for (let i = 0; i < techs.length; i++) {
      const span = document.createElement('span');
      span.className = 'tech-card';
      span.textContent = techs[i].trim();
      techContainer.appendChild(span);
    }
  }

  // GitHub link
  const githubEl = document.getElementById('modalGithub');
  githubEl.innerHTML = project.github
    ? 'GitHub: <a href="' + project.github + '" target="_blank">' + project.github + '</a>'
    : '';

  document.getElementById('projectModal').style.display = 'flex';
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
