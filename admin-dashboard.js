// Check authentication
if (!localStorage.getItem('isAuthenticated')) {
    window.location.href = 'admin.html';
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'admin.html';
});

// Project management
let projects = JSON.parse(localStorage.getItem('projects')) || [];

// Add new project
document.getElementById('addProjectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newProject = {
        id: Date.now().toString(),
        title: document.getElementById('projectTitle').value,
        images: document.getElementById('projectImages').value.split('\n').filter(url => url.trim()),
        description: document.getElementById('projectDescription').value,
        externalLink: document.getElementById('projectExternalLink').value || null,
        tags: document.getElementById('projectTags').value.split(',').map(tag => tag.trim()),
        createdAt: new Date().toISOString()
    };
    
    projects.unshift(newProject);
    saveProjects();
    renderProjects();
    this.reset();
});

// Save projects to localStorage
function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Render projects list
function renderProjects() {
    const projectsList = document.getElementById('projectsList');
    const sortBy = document.getElementById('sortProjects').value;
    
    // Sort projects
    let sortedProjects = [...projects];
    switch (sortBy) {
        case 'oldest':
            sortedProjects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'title':
            sortedProjects.sort((a, b) => a.title.localeCompare(b.title));
            break;
        default: // newest
            sortedProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    projectsList.innerHTML = sortedProjects.map(project => `
        <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-medium text-gray-900">${project.title}</h3>
                    <p class="text-sm text-gray-500 mt-1">${project.description.substring(0, 100)}...</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                        ${project.tags.map(tag => `
                            <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editProject('${project.id}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProject('${project.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Delete project
function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(project => project.id !== id);
        saveProjects();
        renderProjects();
    }
}

// Edit project
function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectImages').value = project.images.join('\n');
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectExternalLink').value = project.externalLink || '';
    document.getElementById('projectTags').value = project.tags.join(', ');
    
    // Remove the old project
    projects = projects.filter(p => p.id !== id);
    saveProjects();
    renderProjects();
    
    // Scroll to form
    document.getElementById('addProjectForm').scrollIntoView({ behavior: 'smooth' });
}

// Sort projects
document.getElementById('sortProjects').addEventListener('change', renderProjects);

// Initial render
renderProjects(); 