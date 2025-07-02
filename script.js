// Project data
let projectsData = {};

// Load projects from Firebase
async function loadProjects() {
    try {
        const data = await loadProjectData();
        if (data && data.projects) {
            projectsData = {};
            data.projects.forEach(project => {
                projectsData[project.id] = {
                    title: project.title,
                    images: project.images,
                    tags: project.tags,
                    shortDescription: project.description.substring(0, 100) + '...',
                    longDescription: project.description,
                    externalLink: project.externalLink,
                    videos: project.videos || [],
                    media: [] // To be populated later
                };
            });
            renderProjectCards();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Render project cards in the portfolio
function renderProjectCards() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    const projectEntries = Object.entries(projectsData);

    if (projectEntries.length === 0) {
        projectsGrid.innerHTML = `<p class="text-gray-600 text-center col-span-full">No projects found. Add some from the admin dashboard!</p>`;
        return;
    }
    projectsGrid.innerHTML = projectEntries.map(([id, project]) => `
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
let currentMedia = [];


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

// Utility: Aesthetic fallback colors
const fallbackColors = [
    '#A5B4FC', // indigo-200
    '#FBCFE8', // pink-200
    '#FDE68A', // yellow-200
    '#6EE7B7'  // green-300
];

// Helper to get a color based on project id
function getFallbackColor(projectId) {
    let hash = 0;
    for (let i = 0; i < projectId.length; i++) {
        hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

// --- Video URL Parsers ---
function getYoutubeEmbedUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&rel=0&modestbranding=1` : null;
}

function getGoogleDriveEmbedUrl(url) {
    const regExp = /drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/;
    const match = url.match(regExp);
    return (match && match[1]) ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
}

// Enhanced modal animations
function openModal(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    currentProject = project;
    currentImageIndex = 0;
    
// Create a unified media array
    const images = project.images.map(src => ({ type: 'image', src }));
    const videos = project.videos.map(src => ({ type: 'video', src }));
    currentMedia = [...images, ...videos];

    // Update modal content
    modalProjectTitle.textContent = project.title;
    modalProjectDescription.textContent = project.longDescription;
    
    // Update tags
    modalProjectTags.innerHTML = project.tags
        .map(tag => `<span class="mr-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">${tag}</span>`)
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
    // Stop any playing video by clearing the carousel content
    if (modalCarouselImages) modalCarouselImages.innerHTML = '';
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        currentProject = null;
    }, 300);
}

// Update carousel images (with fallback)
function updateCarousel() {
    if (!currentProject) return;
    modalCarouselImages.innerHTML = '';
   const hasMedia = currentMedia.length > 0;
    prevImageButton.style.display = hasMedia && currentMedia.length > 1 ? 'flex' : 'none';
    nextImageButton.style.display = hasMedia && currentMedia.length > 1 ? 'flex' : 'none';

    if (!hasMedia) {
        const fallbackCard = document.createElement('div');
        fallbackCard.className = 'modal-fallback-card';
        fallbackCard.style.background = getFallbackColor(currentProject.id || 'default');
        fallbackCard.innerHTML = `<span class="modal-fallback-title">${currentProject.title}</span>`;
        modalCarouselImages.appendChild(fallbackCard);
        return;
    }
    const item = currentMedia[currentImageIndex];
    let element;

    if (item.type === 'image') {
        element = document.createElement('img');
        element.src = item.src;
        element.alt = `${currentProject.title} - Media ${currentImageIndex + 1}`;
        element.className = 'modal-carousel-media';
        element.onerror = () => { /* Add image error handling if needed */ };
    } else if (item.type === 'video') {
        const youtubeUrl = getYoutubeEmbedUrl(item.src);
        const gdriveUrl = getGoogleDriveEmbedUrl(item.src);

        if (youtubeUrl || gdriveUrl) {
            element = document.createElement('iframe');
            element.src = youtubeUrl || gdriveUrl;
            element.setAttribute('frameborder', '0');
            element.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
            element.setAttribute('allowfullscreen', 'true');
        } else { // Fallback for direct video links
            element = document.createElement('video');
            element.src = item.src;
            element.controls = true;
            element.autoplay = true;
            element.muted = true;
        }
        element.className = 'modal-carousel-media';
    }

    if (element) modalCarouselImages.appendChild(element);
}

// Navigate carousel
function navigateCarousel(direction) {
    if (!currentProject || currentMedia.length <= 1) return;
    
    currentImageIndex = (currentImageIndex + direction + currentMedia.length) % currentMedia.length;
    updateCarousel();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load projects from Firebase
    loadProjects();

    // Close modal
    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Carousel navigation
    prevImageButton.addEventListener('click', () => navigateCarousel(-1));
    nextImageButton.addEventListener('click', () => navigateCarousel(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
        if (modal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                navigateCarousel(-1);
            } else if (e.key === 'ArrowRight') {
                navigateCarousel(1);
            }
        }
    });

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
            const targetId = anchor.getAttribute('href');
            const targetElement = targetId.length > 1 ? document.querySelector(targetId) : null;

            if (targetElement) {
                 e.preventDefault();
                 targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) mobileMenu.classList.add('hidden');
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

    // Remove any event listener that prevents default on the external link
    modalProjectExternalLink.addEventListener('click', (e) => {
        // Do not prevent default; allow normal link behavior
        // Optionally, you can add analytics or tracking here
    });
}); 