/**
 * University Attendance System - Authentication Module
 * Handles user login and session management
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Check if already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        // Demo authentication
        if (username === 'demo' && password === 'demo123') {
            // Find or create a demo user based on selected role
            const users = DataStore.getUsers();
            let user = users.find(u => u.role === role);
            
            if (!user) {
                user = {
                    id: 999,
                    name: 'Demo User',
                    email: 'demo@university.edu',
                    role: role,
                    department: 'Demo Department',
                    isActive: true
                };
            }
            
            // Set current user session
            setCurrentUser({
                id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                department: user.department
            });
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Check against stored users (simplified auth)
            const users = DataStore.getUsers();
            const user = users.find(u => 
                u.email.toLowerCase().includes(username.toLowerCase()) && 
                u.role === role
            );
            
            if (user) {
                setCurrentUser({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department
                });
                window.location.href = 'dashboard.html';
            } else {
                showError('Invalid credentials. Please try again or use demo/demo123.');
            }
        }
    });
    
    function showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.login-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'login-error';
            errorDiv.style.cssText = 'color: #e74c3c; background: #fdf2f2; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center;';
            loginForm.insertBefore(errorDiv, loginForm.firstChild);
        }
        errorDiv.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
});
