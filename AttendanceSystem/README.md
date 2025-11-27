# University Attendance System

A comprehensive web-based attendance management system for universities, built with HTML, CSS, and JavaScript. This system allows tracking attendance for students, faculty, staff, dean, and parents.

## Features

### User Roles
- **Student**: View own attendance records, mark own attendance
- **Faculty**: Mark attendance for students, view reports, manage courses
- **Staff**: Mark general attendance, view records
- **Dean**: Full access - manage users, courses, view all reports, edit records
- **Parent**: View child's attendance records

### Core Functionality
- **Dashboard**: Overview of attendance statistics with real-time data
- **Mark Attendance**: Easy-to-use interface for marking daily attendance
- **Attendance Records**: Comprehensive record view with filtering options
- **Reports**: Generate daily, weekly, monthly, or individual reports with CSV export
- **User Management**: Add, edit, and delete users (Dean only)
- **Course Management**: Manage university courses (Dean/Faculty)

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. Clone or download the repository
2. Navigate to the `AttendanceSystem` folder
3. Open `index.html` in your web browser

### Demo Credentials
- **Username**: `demo`
- **Password**: `demo123`
- Select any role to experience different access levels

## File Structure

```
AttendanceSystem/
├── index.html          # Login page
├── dashboard.html      # Main application dashboard
├── css/
│   └── styles.css      # All styles for the application
├── js/
│   ├── auth.js         # Authentication handling
│   ├── data.js         # Data management and local storage
│   └── app.js          # Main application logic
└── README.md           # This file
```

## Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS variables, flexbox, and grid
- **JavaScript (ES6+)**: Application logic and DOM manipulation
- **LocalStorage**: Client-side data persistence

## Features by Role

### Student
- View personal attendance dashboard
- Mark own attendance (if enabled)
- View attendance history
- Generate personal attendance reports

### Faculty
- Mark attendance for students in their courses
- View attendance records
- Generate class reports
- Manage course enrollments

### Staff
- Mark general attendance
- View all attendance records
- Generate departmental reports

### Dean
- Full access to all features
- Manage all users (add, edit, delete)
- Manage courses
- View and edit any attendance record
- Generate comprehensive reports

### Parent
- View child's attendance records
- View child's attendance reports

## Data Persistence

The application uses browser's LocalStorage to persist data. Sample data is automatically initialized on first load, including:
- Sample users (students, faculty, staff, dean, parents)
- Sample courses
- Sample attendance records for the past week

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Microsoft Edge

## Screenshots

### Login Page
Modern login interface with role selection

### Dashboard
Real-time attendance statistics and quick actions

### Attendance Marking
Easy-to-use interface for recording attendance

### Reports
Comprehensive reporting with export functionality

## License

This project is created for educational purposes as part of the OfficeAutomation repository.

## Contributing

Feel free to submit issues and enhancement requests.
