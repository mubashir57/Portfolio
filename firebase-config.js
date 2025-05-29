// Firebase configuration
const firebaseConfig = {
    // You'll need to replace these with your Firebase project credentials
    apiKey: "AIzaSyCcK1yLUnkcm3ddlgUaMtw9RR9i-GlPZZ4",
    authDomain: "portfolio-536c8.firebaseapp.com",
    projectId: "portfolio-536c8",
    storageBucket: "portfolio-536c8.firebasestorage.app",
    messagingSenderId: "754246198847",
    appId: "1:754246198847:web:8f95bb0be7626f12ccfa8a"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

// Function to save project data
async function saveProjectData(projectData) {
    if (!db) {
        console.error('Firestore not initialized');
        return;
    }
    
    try {
        await db.collection('projects').doc('portfolio').set(projectData);
        console.log('Project data saved successfully');
    } catch (error) {
        console.error('Error saving project data:', error);
        throw error;
    }
}

// Function to load project data
async function loadProjectData() {
    if (!db) {
        console.error('Firestore not initialized');
        return null;
    }
    
    try {
        const doc = await db.collection('projects').doc('portfolio').get();
        if (doc.exists) {
            return doc.data();
        } else {
            console.log('No project data found');
            return null;
        }
    } catch (error) {
        console.error('Error loading project data:', error);
        return null;
    }
}

// Export functions
window.saveProjectData = saveProjectData;
window.loadProjectData = loadProjectData; 