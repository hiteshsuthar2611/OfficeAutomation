/**
 * University Attendance System - Data Management
 * Handles local storage data operations for users, courses, and attendance records
 */

// Initialize sample data if not exists
function initializeData() {
    if (!localStorage.getItem('uas_initialized')) {
        // Sample Users
        const users = [
            { id: 1, name: 'John Smith', email: 'john.smith@university.edu', role: 'student', department: 'Computer Science', phone: '555-0101', isActive: true },
            { id: 2, name: 'Emily Johnson', email: 'emily.j@university.edu', role: 'student', department: 'Mathematics', phone: '555-0102', isActive: true },
            { id: 3, name: 'Michael Brown', email: 'michael.b@university.edu', role: 'student', department: 'Physics', phone: '555-0103', isActive: true },
            { id: 4, name: 'Sarah Davis', email: 'sarah.d@university.edu', role: 'student', department: 'Computer Science', phone: '555-0104', isActive: true },
            { id: 5, name: 'David Wilson', email: 'david.w@university.edu', role: 'student', department: 'Engineering', phone: '555-0105', isActive: true },
            { id: 6, name: 'Dr. Robert Taylor', email: 'r.taylor@university.edu', role: 'faculty', department: 'Computer Science', phone: '555-0201', isActive: true },
            { id: 7, name: 'Dr. Jennifer Martinez', email: 'j.martinez@university.edu', role: 'faculty', department: 'Mathematics', phone: '555-0202', isActive: true },
            { id: 8, name: 'Dr. William Anderson', email: 'w.anderson@university.edu', role: 'faculty', department: 'Physics', phone: '555-0203', isActive: true },
            { id: 9, name: 'James Thompson', email: 'j.thompson@university.edu', role: 'staff', department: 'Administration', phone: '555-0301', isActive: true },
            { id: 10, name: 'Patricia Garcia', email: 'p.garcia@university.edu', role: 'staff', department: 'Library', phone: '555-0302', isActive: true },
            { id: 11, name: 'Dr. Elizabeth Clark', email: 'e.clark@university.edu', role: 'dean', department: 'Engineering', phone: '555-0401', isActive: true },
            { id: 12, name: 'Mary Smith', email: 'mary.smith@email.com', role: 'parent', department: '', phone: '555-0501', isActive: true, childId: 1 },
            { id: 13, name: 'Robert Johnson', email: 'robert.j@email.com', role: 'parent', department: '', phone: '555-0502', isActive: true, childId: 2 }
        ];
        
        // Sample Courses
        const courses = [
            { id: 1, code: 'CS101', name: 'Introduction to Programming', department: 'Computer Science', facultyId: 6, credits: 3, enrolled: [1, 4] },
            { id: 2, code: 'CS201', name: 'Data Structures', department: 'Computer Science', facultyId: 6, credits: 3, enrolled: [1, 4] },
            { id: 3, code: 'MATH101', name: 'Calculus I', department: 'Mathematics', facultyId: 7, credits: 4, enrolled: [1, 2, 3] },
            { id: 4, code: 'MATH201', name: 'Linear Algebra', department: 'Mathematics', facultyId: 7, credits: 3, enrolled: [2, 5] },
            { id: 5, code: 'PHYS101', name: 'Physics I', department: 'Physics', facultyId: 8, credits: 4, enrolled: [3, 5] }
        ];
        
        // Generate sample attendance records for the past 7 days
        const attendance = [];
        const today = new Date();
        const statuses = ['present', 'present', 'present', 'present', 'absent', 'late', 'excused'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            users.forEach(user => {
                if (user.role !== 'parent') {
                    attendance.push({
                        id: attendance.length + 1,
                        userId: user.id,
                        date: dateStr,
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        checkIn: '08:' + String(Math.floor(Math.random() * 30)).padStart(2, '0'),
                        checkOut: '17:' + String(Math.floor(Math.random() * 30)).padStart(2, '0'),
                        courseId: null,
                        recordedBy: 11
                    });
                }
            });
        }
        
        localStorage.setItem('uas_users', JSON.stringify(users));
        localStorage.setItem('uas_courses', JSON.stringify(courses));
        localStorage.setItem('uas_attendance', JSON.stringify(attendance));
        localStorage.setItem('uas_initialized', 'true');
    }
}

// Data Access Functions
const DataStore = {
    // Users
    getUsers: function() {
        return JSON.parse(localStorage.getItem('uas_users') || '[]');
    },
    
    getUserById: function(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    },
    
    getUsersByRole: function(role) {
        const users = this.getUsers();
        return users.filter(u => u.role === role);
    },
    
    addUser: function(user) {
        const users = this.getUsers();
        const validIds = users.map(u => u.id).filter(id => typeof id === 'number' && !isNaN(id));
        user.id = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
        user.isActive = true;
        users.push(user);
        localStorage.setItem('uas_users', JSON.stringify(users));
        return user;
    },
    
    updateUser: function(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('uas_users', JSON.stringify(users));
            return users[index];
        }
        return null;
    },
    
    deleteUser: function(id) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem('uas_users', JSON.stringify(filtered));
    },
    
    // Courses
    getCourses: function() {
        return JSON.parse(localStorage.getItem('uas_courses') || '[]');
    },
    
    getCourseById: function(id) {
        const courses = this.getCourses();
        return courses.find(c => c.id === id);
    },
    
    addCourse: function(course) {
        const courses = this.getCourses();
        const validIds = courses.map(c => c.id).filter(id => typeof id === 'number' && !isNaN(id));
        course.id = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
        course.enrolled = course.enrolled || [];
        courses.push(course);
        localStorage.setItem('uas_courses', JSON.stringify(courses));
        return course;
    },
    
    updateCourse: function(id, updates) {
        const courses = this.getCourses();
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updates };
            localStorage.setItem('uas_courses', JSON.stringify(courses));
            return courses[index];
        }
        return null;
    },
    
    deleteCourse: function(id) {
        const courses = this.getCourses();
        const filtered = courses.filter(c => c.id !== id);
        localStorage.setItem('uas_courses', JSON.stringify(filtered));
    },
    
    // Attendance
    getAttendance: function() {
        return JSON.parse(localStorage.getItem('uas_attendance') || '[]');
    },
    
    getAttendanceByDate: function(date) {
        const attendance = this.getAttendance();
        return attendance.filter(a => a.date === date);
    },
    
    getAttendanceByUser: function(userId) {
        const attendance = this.getAttendance();
        return attendance.filter(a => a.userId === userId);
    },
    
    getAttendanceByDateRange: function(startDate, endDate) {
        const attendance = this.getAttendance();
        return attendance.filter(a => a.date >= startDate && a.date <= endDate);
    },
    
    addAttendance: function(record) {
        const attendance = this.getAttendance();
        const validIds = attendance.map(a => a.id).filter(id => typeof id === 'number' && !isNaN(id));
        record.id = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
        attendance.push(record);
        localStorage.setItem('uas_attendance', JSON.stringify(attendance));
        return record;
    },
    
    updateAttendance: function(id, updates) {
        const attendance = this.getAttendance();
        const index = attendance.findIndex(a => a.id === id);
        if (index !== -1) {
            attendance[index] = { ...attendance[index], ...updates };
            localStorage.setItem('uas_attendance', JSON.stringify(attendance));
            return attendance[index];
        }
        return null;
    },
    
    markAttendance: function(userId, date, status, courseId = null) {
        const attendance = this.getAttendance();
        const existing = attendance.find(a => a.userId === userId && a.date === date && a.courseId === courseId);
        
        if (existing) {
            return this.updateAttendance(existing.id, { status });
        } else {
            const now = new Date();
            return this.addAttendance({
                userId,
                date,
                status,
                courseId,
                checkIn: now.toTimeString().slice(0, 5),
                checkOut: null,
                recordedBy: getCurrentUser()?.id || 1
            });
        }
    },
    
    // Statistics
    getTodayStats: function() {
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = this.getAttendanceByDate(today);
        const users = this.getUsers().filter(u => u.role !== 'parent');
        
        const present = todayAttendance.filter(a => a.status === 'present').length;
        const absent = todayAttendance.filter(a => a.status === 'absent').length;
        const late = todayAttendance.filter(a => a.status === 'late').length;
        const total = users.length;
        
        return {
            total,
            present,
            absent,
            late,
            rate: total > 0 ? Math.round((present / total) * 100) : 0
        };
    },
    
    generateReport: function(startDate, endDate, role = null) {
        const attendance = this.getAttendanceByDateRange(startDate, endDate);
        let filteredAttendance = attendance;
        
        if (role) {
            const userIds = this.getUsersByRole(role).map(u => u.id);
            filteredAttendance = attendance.filter(a => userIds.includes(a.userId));
        }
        
        const present = filteredAttendance.filter(a => a.status === 'present').length;
        const absent = filteredAttendance.filter(a => a.status === 'absent').length;
        const late = filteredAttendance.filter(a => a.status === 'late').length;
        const excused = filteredAttendance.filter(a => a.status === 'excused').length;
        const total = filteredAttendance.length;
        
        return {
            totalDays: new Set(filteredAttendance.map(a => a.date)).size,
            totalRecords: total,
            present,
            absent,
            late,
            excused,
            rate: total > 0 ? Math.round((present / total) * 100) : 0
        };
    }
};

// Session Management
function getCurrentUser() {
    const userData = localStorage.getItem('uas_currentUser');
    return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('uas_currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('uas_currentUser');
}

// Initialize data on load
initializeData();
