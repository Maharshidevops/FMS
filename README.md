# File Management System

A professional file management system with login authentication, file upload functionality, and dashboard for file tracking and management. This system now includes a complete backend with SQL Server 2019 integration.

## Features

- **Secure Authentication**: JWT-based authentication system
- **User Management**: User registration and login
- **File Management**:
  - Upload and download files
  - Categorize files (Noting/Corresponding)
  - Add metadata (reference number, subject, etc.)
  - Track file history
- **Notes System**: Add and manage notes for each file
- **Dashboard**: 
  - File statistics and metrics
  - Comprehensive file listing with search and filter
  - Responsive design for all devices

## Prerequisites

1. **Database**:
   - SQL Server 2019
   - SQL Server Management Studio (SSMS) for running scripts

2. **Backend**:
   - Node.js (v14 or later)
   - npm (comes with Node.js)

3. **Frontend**:
   - Modern web browser (Chrome, Firefox, Edge, etc.)
   - Internet connection (for loading external libraries)

## Setup Instructions

### 1. Database Setup

1. Open SQL Server Management Studio (SSMS) and connect to your SQL Server 2019 instance
2. Open the SQL script located at `database/create_database.sql`
3. Execute the script to create the database and required tables
4. A default admin user will be created with the following credentials:
   - Username: `admin`
   - Password: `admin123`

### 2. Backend Setup

1. Navigate to the `server` directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection details in `.env`

4. Start the development server:
   ```
   npm run dev
   ```
   The server will start on `http://localhost:3000`

### 3. Frontend Setup

1. Open the `index.html` file in your web browser
2. Or, for a better development experience, use a local web server:
   - Install `http-server` globally:
     ```
     npm install -g http-server
     ```
   - Navigate to the project root and run:
     ```
     http-server -p 8080
     ```
   - Open `http://localhost:8080` in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Files
- `GET /api/files` - Get all files (with pagination)
- `GET /api/files/:id` - Get file by ID
- `POST /api/files/upload` - Upload a new file
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete a file
- `GET /api/files/download/:id` - Download a file
- `GET /api/files/categories` - Get file categories

### Notes
- `GET /api/notes/file/:fileId` - Get all notes for a file
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Security Considerations

1. **Environment Variables**:
   - Never commit sensitive information to version control
   - The `.env` file is included in `.gitignore` by default

2. **Password Security**:
   - Passwords are hashed using bcrypt before storage
   - Default admin password should be changed after first login

3. **File Uploads**:
   - Files are stored in the `uploads` directory
   - File types and sizes are restricted
   - File paths are not directly exposed

## Troubleshooting

1. **Database Connection Issues**:
   - Verify SQL Server is running
   - Check connection string in `.env`
   - Ensure SQL Server allows SQL Authentication if using username/password

2. **File Upload Issues**:
   - Check `uploads` directory permissions
   - Verify file size limits in `.env`

3. **CORS Issues**:
   - Ensure frontend and backend are running on the same domain or CORS is properly configured

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Implementation Details

This system uses:
- HTML5 for structure
- CSS3 for styling with responsive design
- JavaScript for dynamic functionality
- LocalStorage for data persistence (in this demo version)

## Future Enhancements

For a production environment, consider:
- Server-side storage using a database
- Secure authentication with proper user management
- Actual file storage on a server or cloud storage
- Advanced search and filtering options
- Role-based access control
- Audit trails and activity logs

## Getting Started

Simply open `index.html` in a web browser to begin using the application.
