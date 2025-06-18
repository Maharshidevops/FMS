USE FileManagementSystem;
GO

-- Add sample users (passwords are hashed 'password123', except admin which is for 'admin123')
INSERT INTO Users (Username, PasswordHash, Email, FirstName, LastName, IsActive)
VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Admin', 'User', 1),
('john.doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'john.doe@example.com', 'John', 'Doe', 1),
('jane.smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jane.smith@example.com', 'Jane', 'Smith', 1),
('mike.johnson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mike.johnson@example.com', 'Mike', 'Johnson', 1);
>>>>>>> REPLACE

-- Add sample files
DECLARE @adminId INT = (SELECT UserId FROM Users WHERE Username = 'admin');
DECLARE @notingCategoryId INT = (SELECT CategoryId FROM FileCategories WHERE Name = 'Noting');
DECLARE @correspondingCategoryId INT = (SELECT CategoryId FROM FileCategories WHERE Name = 'Corresponding');

-- Sample files for admin
INSERT INTO Files (FileName, FilePath, FileType, FileSize, CategoryId, Description, CreatedBy, ReferenceNumber, Subject, CreationDate)
VALUES 
('Quarterly_Report_Q1_2023.pdf', '1/1685400000000.pdf', 'pdf', 1024000, @notingCategoryId, 'Q1 2023 Financial Report', @adminId, 'FIN-2023-Q1', 'Financial Report Q1 2023', '2023-03-31'),
('Project_Proposal.docx', '1/1685400000001.docx', 'docx', 512000, @correspondingCategoryId, 'New project proposal document', @adminId, 'PROJ-2023-001', 'New Project Proposal', '2023-04-15'),
('Meeting_Minutes_20230510.pdf', '1/1685400000002.pdf', 'pdf', 256000, @notingCategoryId, 'Minutes from team meeting on May 10, 2023', @adminId, 'MIN-2023-042', 'Team Meeting Minutes', '2023-05-10');

-- Sample files for John Doe
DECLARE @johnId INT = (SELECT UserId FROM Users WHERE Username = 'john.doe');

INSERT INTO Files (FileName, FilePath, FileType, FileSize, CategoryId, Description, CreatedBy, ReferenceNumber, Subject, CreationDate)
VALUES 
('Marketing_Plan_2023.pdf', '2/1685400000003.pdf', 'pdf', 768000, @correspondingCategoryId, 'Marketing strategy for 2023', @johnId, 'MKT-2023-001', '2023 Marketing Plan', '2023-01-15'),
('Budget_Approval_Form.xlsx', '2/1685400000004.xlsx', 'xlsx', 128000, @notingCategoryId, 'Q2 budget approval form', @johnId, 'BUD-2023-Q2', 'Q2 Budget Approval', '2023-03-20');

-- Sample notes for files
DECLARE @file1Id INT = (SELECT FileId FROM Files WHERE ReferenceNumber = 'FIN-2023-Q1');
DECLARE @file2Id INT = (SELECT FileId FROM Files WHERE ReferenceNumber = 'PROJ-2023-001');

INSERT INTO Notes (FileId, UserId, Content, IsDeleted)
VALUES 
(@file1Id, @adminId, 'Reviewed and approved by finance team on 2023-04-05', 0),
(@file1Id, @johnId, 'Please verify the Q1 revenue numbers', 0),
(@file2Id, @adminId, 'Project scope needs to be finalized by next week', 0),
(@file2Id, @adminId, 'Budget approved by management', 0);

-- Sample file history
INSERT INTO FileHistory (FileId, ChangedBy, ChangeType, ChangeDetails)
VALUES 
(@file1Id, @adminId, 'UPLOAD', 'File uploaded'),
(@file1Id, @adminId, 'UPDATE', 'Updated financial figures'),
(@file2Id, @adminId, 'UPLOAD', 'Initial project proposal uploaded'),
(@file2Id, @adminId, 'UPDATE', 'Updated project timeline and budget');

-- Sample user sessions (for demonstration)
INSERT INTO UserSessions (UserId, Token, ExpiresAt, IsActive)
VALUES 
(@adminId, 'sample-jwt-token-admin', DATEADD(day, 1, GETDATE()), 1),
(@johnId, 'sample-jwt-token-john', DATEADD(day, 1, GETDATE()), 1);

-- Verify the data
SELECT 'Users' AS TableName, COUNT(*) AS RecordCount FROM Users
UNION ALL
SELECT 'Files', COUNT(*) FROM Files
UNION ALL
SELECT 'Notes', COUNT(*) FROM Notes
UNION ALL
SELECT 'FileHistory', COUNT(*) FROM FileHistory
UNION ALL
SELECT 'UserSessions', COUNT(*) FROM UserSessions;
