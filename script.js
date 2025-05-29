// Project data
let projectsData = {};

// Load projects from localStorage
function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projectsData = {};
    projects.forEach(project => {
        projectsData[project.id] = {
            title: project.title,
            images: project.images,
            tags: project.tags,
            shortDescription: project.description.substring(0, 100) + '...',
            longDescription: project.description,
            externalLink: project.externalLink
        };
    });
    renderProjectCards();
}

// Render project cards in the portfolio
function renderProjectCards() {
    const projectsGrid = document.querySelector('#projects .grid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = Object.entries(projectsData).map(([id, project]) => `
        <div class="card project-card">
            <div class="overflow-hidden rounded-t-lg">
                <img src="${project.images[0]}" 
                     alt="${project.title}" 
                     class="w-full h-48 object-cover transform transition-transform duration-500">
            </div>
            <div class="p-4">
                <h3 class="text-xl font-bold mb-2">${project.title}</h3>
                <p class="text-gray-600 mb-4">${project.shortDescription}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${project.tags.map(tag => `
                        <span class="project-tag px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">${tag}</span>
                    `).join('')}
                </div>
                <button class="action-link" data-project="${id}">
                    View Details <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Reattach event listeners to new project cards
    document.querySelectorAll('.action-link[data-project]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = button.dataset.project;
            openModal(projectId);
        });
    });
}

// Modal elements
const modal = document.getElementById('projectModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalCarouselImages = document.getElementById('modalCarouselImages');
const prevImageButton = document.getElementById('prevImageButton');
const nextImageButton = document.getElementById('nextImageButton');
const modalProjectTitle = document.getElementById('modalProjectTitle');
const modalProjectTags = document.getElementById('modalProjectTags');
const modalProjectDescription = document.getElementById('modalProjectDescription');
const modalProjectExternalLink = document.getElementById('modalProjectExternalLink');

let currentImageIndex = 0;
let currentProject = null;

// Enhanced animation handling for project cards
const projectCards = document.querySelectorAll('.project-card');
const projectGrid = document.querySelector('#projects .grid');

const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (entry.target === projectGrid) {
                projectGrid.classList.add('is-visible');
            }
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

projectCards.forEach(card => projectObserver.observe(card));
projectObserver.observe(projectGrid);

// Enhanced modal animations
function openModal(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    currentProject = project;
    currentImageIndex = 0;
    
    // Update modal content
    modalProjectTitle.textContent = project.title;
    modalProjectDescription.textContent = project.longDescription;
    
    // Update tags
    modalProjectTags.innerHTML = project.tags
        .map(tag => `<span class="project-tag">${tag}</span>`)
        .join('');
    
    // Update carousel
    updateCarousel();
    
    // Show/hide external link
    if (project.externalLink) {
        modalProjectExternalLink.href = project.externalLink;
        modalProjectExternalLink.style.display = 'inline-flex';
    } else {
        modalProjectExternalLink.style.display = 'none';
    }
    
    // Show modal with animation
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        currentProject = null;
    }, 300); // Match the transition duration
}

// Update carousel images
function updateCarousel() {
    if (!currentProject) return;
    
    modalCarouselImages.innerHTML = currentProject.images
        .map((src, index) => `
            <img src="${src}" 
                 alt="${currentProject.title} - Image ${index + 1}"
                 class="${index === currentImageIndex ? 'active' : ''}"
                 style="display: ${index === currentImageIndex ? 'block' : 'none'}">
        `)
        .join('');
}

// Navigate carousel
function navigateCarousel(direction) {
    if (!currentProject) return;
    
    currentImageIndex = (currentImageIndex + direction + currentProject.images.length) % currentProject.images.length;
    updateCarousel();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load projects from localStorage
    loadProjects();

    // Project buttons
    document.querySelectorAll('.action-link[data-project]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = button.dataset.project;
            openModal(projectId);
        });
    });

    // Close modal
    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Carousel navigation
    prevImageButton.addEventListener('click', () => navigateCarousel(-1));
    nextImageButton.addEventListener('click', () => navigateCarousel(1));

    // Mobile menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Fade-in animation for sections
    const fadeElements = document.querySelectorAll('.fade-in-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(element => observer.observe(element));

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('navbar-sticky');
            return;
        }
        
        if (currentScroll > lastScroll) {
            // Scrolling down
            navbar.classList.add('navbar-sticky');
        } else {
            // Scrolling up
            navbar.classList.add('navbar-sticky');
        }
        
        lastScroll = currentScroll;
    });

    // Update copyright year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}); 