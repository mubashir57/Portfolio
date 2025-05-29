// Static credentials (in a real application, these would be stored securely on the server)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'portfolio123'
};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        // Redirect to dashboard
        window.location.href = 'admin-dashboard.html';
    } else {
        alert('Invalid credentials. Please try again.');
    }
}); 