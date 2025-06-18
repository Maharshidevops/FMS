-- Create the database
CREATE DATABASE FileManagementSystem;
GO

-- Use the database
USE FileManagementSystem;
GO

-- Create Users table for authentication
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100),
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    LastLogin DATETIME2
);

-- Create FileCategories table
CREATE TABLE FileCategories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255)
);

-- Insert default categories
INSERT INTO FileCategories (Name, Description) VALUES 
('Noting', 'Internal noting files'),
('Corresponding', 'External correspondence files');

-- Create Files table
CREATE TABLE Files (
    FileId INT IDENTITY(1,1) PRIMARY KEY,
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(1000) NOT NULL,
    FileType NVARCHAR(50),
    FileSize BIGINT,
    CategoryId INT,
    Description NVARCHAR(1000),
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    IsDeleted BIT DEFAULT 0,
    ReferenceNumber NVARCHAR(100),
    Subject NVARCHAR(500),
    CreationDate DATETIME2,
    FOREIGN KEY (CategoryId) REFERENCES FileCategories(CategoryId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
);

-- Create Notes table
CREATE TABLE Notes (
    NoteId INT IDENTITY(1,1) PRIMARY KEY,
    FileId INT,
    UserId INT,
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (FileId) REFERENCES Files(FileId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Create UserSessions table for token management
CREATE TABLE UserSessions (
    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId INT NOT NULL,
    Token NVARCHAR(1000) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    LastActivity DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Create FileHistory table for tracking file changes
CREATE TABLE FileHistory (
    HistoryId INT IDENTITY(1,1) PRIMARY KEY,
    FileId INT NOT NULL,
    ChangedBy INT NOT NULL,
    ChangeType NVARCHAR(20) NOT NULL, -- UPLOAD, UPDATE, DELETE, etc.
    ChangeDetails NVARCHAR(MAX),
    ChangedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (FileId) REFERENCES Files(FileId),
    FOREIGN KEY (ChangedBy) REFERENCES Users(UserId)
);

-- Create indexes for better performance
CREATE INDEX IDX_Files_CategoryId ON Files(CategoryId);
CREATE INDEX IDX_Files_CreatedBy ON Files(CreatedBy);
CREATE INDEX IDX_Notes_FileId ON Notes(FileId);
CREATE INDEX IDX_UserSessions_UserId ON UserSessions(UserId);
CREATE INDEX IDX_UserSessions_Token ON UserSessions(Token);

-- Create a default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO Users (Username, PasswordHash, Email, FirstName, LastName, IsActive)
VALUES ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin@example.com', 'System', 'Administrator', 1);

-- Create stored procedure for user authentication
GO
CREATE OR ALTER PROCEDURE sp_AuthenticateUser
    @Username NVARCHAR(50),
    @Password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT;
    DECLARE @StoredHash NVARCHAR(255);
    
    -- In a real application, you would verify the password hash
    -- For this example, we're just checking if the password matches the hash we stored
    SELECT @UserId = UserId, @StoredHash = PasswordHash
    FROM Users
    WHERE Username = @Username 
    AND IsActive = 1;
    
    IF @UserId IS NOT NULL AND @StoredHash = @Password
    BEGIN
        -- Update last login time
        UPDATE Users 
        SET LastLogin = GETDATE()
        WHERE UserId = @UserId;
        
        -- Return user data (without password hash)
        SELECT 
            UserId,
            Username,
            Email,
            FirstName,
            LastName,
            CreatedAt,
            LastLogin
        FROM Users
        WHERE UserId = @UserId;
    END
    ELSE
    BEGIN
        -- Return empty result if authentication fails
        SELECT TOP 0 * FROM Users;
    END
END;
GO

-- Create stored procedure for file upload
GO
CREATE OR ALTER PROCEDURE sp_UploadFile
    @FileName NVARCHAR(255),
    @FilePath NVARCHAR(1000),
    @FileType NVARCHAR(50),
    @FileSize BIGINT,
    @CategoryId INT,
    @Description NVARCHAR(1000),
    @CreatedBy INT,
    @ReferenceNumber NVARCHAR(100) = NULL,
    @Subject NVARCHAR(500) = NULL,
    @CreationDate DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @FileId INT;
    
    -- Insert file record
    INSERT INTO Files (
        FileName, 
        FilePath, 
        FileType, 
        FileSize, 
        CategoryId, 
        Description, 
        CreatedBy, 
        ReferenceNumber, 
        Subject, 
        CreationDate
    )
    VALUES (
        @FileName,
        @FilePath,
        @FileType,
        @FileSize,
        @CategoryId,
        @Description,
        @CreatedBy,
        @ReferenceNumber,
        @Subject,
        ISNULL(@CreationDate, GETDATE())
    );
    
    SET @FileId = SCOPE_IDENTITY();
    
    -- Log the file upload
    INSERT INTO FileHistory (FileId, ChangedBy, ChangeType, ChangeDetails)
    VALUES (@FileId, @CreatedBy, 'UPLOAD', 'File uploaded');
    
    -- Return the created file ID
    SELECT @FileId AS FileId;
END;
GO
