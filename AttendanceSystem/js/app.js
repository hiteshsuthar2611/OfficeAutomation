/**
 * University Attendance System - Main Application
 * Handles dashboard functionality, navigation, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    const currentUser = getCurrentUser();
    
    // Set user info in sidebar
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    
    // Set current date
    const today = new Date();
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Set default date for attendance form
    document.getElementById('attendanceDate').valueAsDate = today;
    
    // Apply role-based visibility
    applyRoleBasedAccess(currentUser.role);
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboard();
}

function applyRoleBasedAccess(role) {
    document.body.className = `role-${role}`;
    
    // Show admin-only elements for dean and faculty
    if (role === 'dean' || role === 'faculty') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'flex';
        });
    }
    
    // Parents can only view their children's attendance
    if (role === 'parent') {
        document.querySelector('[data-page="attendance"]').style.display = 'none';
        document.querySelector('[data-page="users"]').style.display = 'none';
        document.querySelector('[data-page="courses"]').style.display = 'none';
    }
    
    // Students can only mark their own attendance
    if (role === 'student') {
        document.querySelector('[data-page="users"]').style.display = 'none';
        document.querySelector('[data-page="courses"]').style.display = 'none';
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        attendance: 'Mark Attendance',
        records: 'Attendance Records',
        reports: 'Reports',
        users: 'Manage Users',
        courses: 'Manage Courses'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
    
    // Load page-specific data
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'attendance':
            loadAttendanceForm();
            break;
        case 'records':
            loadRecords();
            break;
        case 'reports':
            setupReportForm();
            break;
        case 'users':
            loadUsers();
            break;
        case 'courses':
            loadCourses();
            break;
    }
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        clearCurrentUser();
        window.location.href = 'index.html';
    });
    
    // Attendance form
    document.getElementById('attendanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAttendance();
    });
    
    // Add user form
    document.getElementById('addUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewUser();
    });
    
    // Add course form
    document.getElementById('addCourseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewCourse();
    });
    
    // Report form
    document.getElementById('reportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport();
    });
    
    // Quick action buttons - use event delegation
    document.querySelector('.quick-actions')?.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-navigate]');
        if (btn) {
            navigateTo(btn.dataset.navigate);
        }
    });
    
    // Filter records button
    document.getElementById('filterRecordsBtn')?.addEventListener('click', filterRecords);
    
    // Export report button
    document.getElementById('exportReportBtn')?.addEventListener('click', exportReport);
    
    // Add user button
    document.getElementById('addUserBtn')?.addEventListener('click', showAddUserModal);
    
    // Add course button
    document.getElementById('addCourseBtn')?.addEventListener('click', showAddCourseModal);
    
    // Event delegation for table action buttons
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle view/edit/delete buttons in tables
        if (target.classList.contains('btn-view') && target.dataset.recordId) {
            viewRecord(parseInt(target.dataset.recordId));
        } else if (target.classList.contains('btn-edit')) {
            if (target.dataset.recordId) {
                editRecord(parseInt(target.dataset.recordId));
            } else if (target.dataset.userId) {
                editUser(parseInt(target.dataset.userId));
            } else if (target.dataset.courseId) {
                editCourse(parseInt(target.dataset.courseId));
            }
        } else if (target.classList.contains('btn-delete')) {
            if (target.dataset.userId) {
                deleteUser(parseInt(target.dataset.userId));
            } else if (target.dataset.courseId) {
                deleteCourse(parseInt(target.dataset.courseId));
            }
        }
        
        // Modal close buttons
        if (target.classList.contains('close-btn')) {
            const modal = target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
    });
}

// Dashboard Functions
function loadDashboard() {
    const stats = DataStore.getTodayStats();
    
    document.getElementById('totalUsers').textContent = stats.total;
    document.getElementById('presentToday').textContent = stats.present;
    document.getElementById('absentToday').textContent = stats.absent;
    document.getElementById('attendanceRate').textContent = stats.rate + '%';
    
    loadRecentAttendance();
}

function loadRecentAttendance() {
    const attendance = DataStore.getAttendance()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    const tbody = document.getElementById('recentAttendanceBody');
    tbody.innerHTML = '';
    
    attendance.forEach(record => {
        const user = DataStore.getUserById(record.userId);
        if (user) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${capitalizeFirst(user.role)}</td>
                <td>${formatDate(record.date)}</td>
                <td><span class="status-badge status-${record.status}">${capitalizeFirst(record.status)}</span></td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// Attendance Functions
function loadAttendanceForm() {
    const currentUser = getCurrentUser();
    const attendanceList = document.getElementById('attendanceList');
    attendanceList.innerHTML = '';
    
    // Get users based on role
    let users = [];
    if (currentUser.role === 'student') {
        users = [DataStore.getUserById(currentUser.id)].filter(Boolean);
    } else if (currentUser.role === 'faculty') {
        users = DataStore.getUsersByRole('student');
    } else if (currentUser.role === 'dean' || currentUser.role === 'staff') {
        users = DataStore.getUsers().filter(u => u.role !== 'parent');
    }
    
    // Load courses for dropdown
    const courseSelect = document.getElementById('courseSelect');
    const courses = DataStore.getCourses();
    courseSelect.innerHTML = '<option value="">General Attendance</option>';
    courses.forEach(course => {
        courseSelect.innerHTML += `<option value="${course.id}">${course.code} - ${course.name}</option>`;
    });
    
    // Get today's attendance
    const today = document.getElementById('attendanceDate').value;
    const todayAttendance = DataStore.getAttendanceByDate(today);
    
    users.forEach(user => {
        const existingRecord = todayAttendance.find(a => a.userId === user.id);
        const currentStatus = existingRecord ? existingRecord.status : 'present';
        
        const div = document.createElement('div');
        div.className = 'attendance-item';
        div.innerHTML = `
            <div class="user-info-item">
                <div class="user-avatar-sm">${user.name.charAt(0)}</div>
                <div>
                    <div class="user-name-item">${user.name}</div>
                    <div class="user-role-item">${user.role} - ${user.department || 'N/A'}</div>
                </div>
            </div>
            <select class="attendance-status-select" data-user-id="${user.id}">
                <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>Present</option>
                <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>Absent</option>
                <option value="late" ${currentStatus === 'late' ? 'selected' : ''}>Late</option>
                <option value="excused" ${currentStatus === 'excused' ? 'selected' : ''}>Excused</option>
            </select>
        `;
        attendanceList.appendChild(div);
    });
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const courseId = document.getElementById('courseSelect').value || null;
    const statusSelects = document.querySelectorAll('.attendance-status-select');
    
    statusSelects.forEach(select => {
        const userId = parseInt(select.dataset.userId);
        const status = select.value;
        DataStore.markAttendance(userId, date, status, courseId ? parseInt(courseId) : null);
    });
    
    showToast('Attendance saved successfully!', 'success');
    loadDashboard();
}

// Records Functions
function loadRecords() {
    const currentUser = getCurrentUser();
    let attendance = DataStore.getAttendance();
    
    // Filter based on role
    if (currentUser.role === 'student') {
        attendance = attendance.filter(a => a.userId === currentUser.id);
    } else if (currentUser.role === 'parent') {
        const parent = DataStore.getUserById(currentUser.id);
        if (parent && parent.childId) {
            attendance = attendance.filter(a => a.userId === parent.childId);
        }
    }
    
    attendance = attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '';
    
    attendance.forEach(record => {
        const user = DataStore.getUserById(record.userId);
        if (user) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${escapeHtml(user.name)}</td>
                <td>${capitalizeFirst(user.role)}</td>
                <td>${formatDate(record.date)}</td>
                <td>${record.checkIn || '-'}</td>
                <td>${record.checkOut || '-'}</td>
                <td><span class="status-badge status-${record.status}">${capitalizeFirst(record.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" data-record-id="${record.id}">View</button>
                        ${currentUser.role === 'dean' ? `<button class="btn-edit" data-record-id="${record.id}">Edit</button>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
}

function filterRecords() {
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const role = document.getElementById('filterRole').value;
    
    let attendance = DataStore.getAttendance();
    
    if (startDate) {
        attendance = attendance.filter(a => a.date >= startDate);
    }
    if (endDate) {
        attendance = attendance.filter(a => a.date <= endDate);
    }
    if (role) {
        const userIds = DataStore.getUsersByRole(role).map(u => u.id);
        attendance = attendance.filter(a => userIds.includes(a.userId));
    }
    
    attendance = attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '';
    
    attendance.forEach(record => {
        const user = DataStore.getUserById(record.userId);
        if (user) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${escapeHtml(user.name)}</td>
                <td>${capitalizeFirst(user.role)}</td>
                <td>${formatDate(record.date)}</td>
                <td>${record.checkIn || '-'}</td>
                <td>${record.checkOut || '-'}</td>
                <td><span class="status-badge status-${record.status}">${capitalizeFirst(record.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" data-record-id="${record.id}">View</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
}

function viewRecord(id) {
    const record = DataStore.getAttendance().find(a => a.id === id);
    const user = DataStore.getUserById(record.userId);
    alert(`Attendance Record #${id}\n\nUser: ${user.name}\nDate: ${record.date}\nStatus: ${record.status}\nCheck In: ${record.checkIn || 'N/A'}\nCheck Out: ${record.checkOut || 'N/A'}`);
}

function editRecord(id) {
    const newStatus = prompt('Enter new status (present/absent/late/excused):');
    if (newStatus && ['present', 'absent', 'late', 'excused'].includes(newStatus.toLowerCase())) {
        DataStore.updateAttendance(id, { status: newStatus.toLowerCase() });
        showToast('Record updated successfully!', 'success');
        loadRecords();
    }
}

// Reports Functions
function setupReportForm() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('reportStartDate').valueAsDate = startOfMonth;
    document.getElementById('reportEndDate').valueAsDate = today;
}

function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const role = document.getElementById('reportRole').value || null;
    
    const report = DataStore.generateReport(startDate, endDate, role);
    
    document.getElementById('reportTotalDays').textContent = report.totalDays;
    document.getElementById('reportPresent').textContent = report.present;
    document.getElementById('reportAbsent').textContent = report.absent;
    document.getElementById('reportLate').textContent = report.late;
    document.getElementById('reportRate').textContent = report.rate + '%';
    
    document.getElementById('reportResults').style.display = 'block';
    showToast('Report generated successfully!', 'success');
}

function exportReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const role = document.getElementById('reportRole').value || null;
    
    let attendance = DataStore.getAttendanceByDateRange(startDate, endDate);
    if (role) {
        const userIds = DataStore.getUsersByRole(role).map(u => u.id);
        attendance = attendance.filter(a => userIds.includes(a.userId));
    }
    
    // Generate CSV
    let csv = 'ID,Name,Role,Date,Status,Check In,Check Out\n';
    attendance.forEach(record => {
        const user = DataStore.getUserById(record.userId);
        if (user) {
            csv += `${record.id},"${user.name}",${user.role},${record.date},${record.status},${record.checkIn || ''},${record.checkOut || ''}\n`;
        }
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Report exported successfully!', 'success');
}

// Users Management Functions
function loadUsers() {
    const users = DataStore.getUsers();
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${capitalizeFirst(user.role)}</td>
            <td>${escapeHtml(user.department || '-')}</td>
            <td><span class="status-badge ${user.isActive ? 'status-present' : 'status-absent'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-user-id="${user.id}">Edit</button>
                    <button class="btn-delete" data-user-id="${user.id}">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function addNewUser() {
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;
    const department = document.getElementById('newUserDept').value;
    const phone = document.getElementById('newUserPhone').value;
    
    DataStore.addUser({ name, email, role, department, phone });
    
    closeModal('addUserModal');
    document.getElementById('addUserForm').reset();
    loadUsers();
    showToast('User added successfully!', 'success');
}

function editUser(id) {
    const user = DataStore.getUserById(id);
    const newName = prompt('Enter new name:', user.name);
    if (newName) {
        DataStore.updateUser(id, { name: newName });
        loadUsers();
        showToast('User updated successfully!', 'success');
    }
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        DataStore.deleteUser(id);
        loadUsers();
        showToast('User deleted successfully!', 'success');
    }
}

// Courses Management Functions
function loadCourses() {
    const courses = DataStore.getCourses();
    const tbody = document.getElementById('coursesBody');
    tbody.innerHTML = '';
    
    courses.forEach(course => {
        const faculty = DataStore.getUserById(course.facultyId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(course.code)}</td>
            <td>${escapeHtml(course.name)}</td>
            <td>${escapeHtml(course.department || '-')}</td>
            <td>${faculty ? escapeHtml(faculty.name) : '-'}</td>
            <td>${course.credits}</td>
            <td>${course.enrolled ? course.enrolled.length : 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-course-id="${course.id}">Edit</button>
                    <button class="btn-delete" data-course-id="${course.id}">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Populate faculty dropdown in modal
    const facultySelect = document.getElementById('courseFaculty');
    facultySelect.innerHTML = '<option value="">Select Faculty</option>';
    DataStore.getUsersByRole('faculty').forEach(f => {
        facultySelect.innerHTML += `<option value="${f.id}">${escapeHtml(f.name)}</option>`;
    });
}

function showAddCourseModal() {
    loadCourses(); // Refresh faculty list
    document.getElementById('addCourseModal').classList.add('active');
}

function addNewCourse() {
    const code = document.getElementById('courseCode').value;
    const name = document.getElementById('courseName').value;
    const department = document.getElementById('courseDept').value;
    const facultyId = document.getElementById('courseFaculty').value;
    const credits = document.getElementById('courseCredits').value;
    
    DataStore.addCourse({ 
        code, 
        name, 
        department, 
        facultyId: facultyId ? parseInt(facultyId) : null, 
        credits: parseInt(credits) 
    });
    
    closeModal('addCourseModal');
    document.getElementById('addCourseForm').reset();
    loadCourses();
    showToast('Course added successfully!', 'success');
}

function editCourse(id) {
    const course = DataStore.getCourseById(id);
    const newName = prompt('Enter new course name:', course.name);
    if (newName) {
        DataStore.updateCourse(id, { name: newName });
        loadCourses();
        showToast('Course updated successfully!', 'success');
    }
}

function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        DataStore.deleteCourse(id);
        loadCourses();
        showToast('Course deleted successfully!', 'success');
    }
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Utility Functions
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
