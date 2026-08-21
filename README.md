# Secure Login System

## Description

A secure web application developed as part of the Application Security and Secure Code course.

The system provides secure user registration and login functionality using Node.js, Express.js, and MongoDB, with several security mechanisms applied throughout the application.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express.js
- Database: MongoDB with Mongoose

## Features

- User Registration and Login
- Admin and User Roles
- Session Management
- Password Hashing using bcrypt
- Encryption of Sensitive Data
- Input Validation and Sanitization
- Protected User Dashboard
- Protected Admin Dashboard
- Logout Functionality

## Security Implementations

- Input Validation using validator.js
- Output Sanitization using DOMPurify
- Password Hashing using bcrypt
- Sensitive Data Encryption using AES-256-CBC
- Session Management using Express Session
- HttpOnly and SameSite Cookie Protection
- CSRF Protection using csrf-sync
- Rate Limiting using express-rate-limit
- Role-Based Authorization
- Protected Routes
- Environment Variables for Sensitive Configuration

## Security Scanning

GitHub CodeQL was used to scan the application for security vulnerabilities.

The scan identified security issues related to:

- Missing rate limiting
- Missing CSRF protection
- Clear text transmission of sensitive cookies

The identified issues were reviewed and addressed in the application.

CodeQL was then used to verify the security status of the repository.




## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- HTML
- CSS
- JavaScript
- bcrypt
- validator.js
- DOMPurify
- express-session
- csrf-sync
- express-rate-limit
- dotenv

## Project Structure

    SecureLoginSystem/
    ├── models/
    ├── public/
    ├── .gitignore
    ├── README.md
    ├── package.json
    ├── package-lock.json
    └── server.js

## Installation

1. Clone the repository.
2. Install the required dependencies:

       npm install

## Environment Variables

Create a `.env` file in the project root and add the required configuration:

    MONGODB_URI=your_mongodb_connection_string
    SESSION_SECRET=your_session_secret
    ENCRYPTION_KEY=your_encryption_key

## Running the Application

Start the server with:

    node server.js

Then open the application in your browser.

## Security Scanning

GitHub CodeQL was used to scan the application for security vulnerabilities.

Security findings were reviewed and addressed where applicable.



