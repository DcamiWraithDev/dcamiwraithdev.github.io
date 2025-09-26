let allProjects = [];

// Initialize after page loads
window.onload = function() {
  fetch('projects.json') // Make sure this path is correct relative to your HTML
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      allProjects = data;
      renderProjects(allProjects);
    })
    .catch(showLoadError);
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
    card.className = 'project-card ' + (project.category ? project.category.split(',').map(c => c.trim()).join(' ') : '');
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
    const filtered = allProjects.filter(p => 
        p.category && p.category.split(',').map(c => c.trim()).includes(category)
    );
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
    project.tech.split(',').forEach(t => {
      const span = document.createElement('span');
      span.className = 'tech-card';
      span.textContent = t.trim();
      techContainer.appendChild(span);
    });
  }

  // GitHub link
  const githubEl = document.getElementById('modalGithub');
  githubEl.innerHTML = project.link
    ? 'GitHub: <a href="' + project.link + '" target="_blank">' + project.link + '</a>'
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
